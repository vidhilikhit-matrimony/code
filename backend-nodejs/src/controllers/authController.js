const { User, OTP, Subscription } = require('../models'); // Trigger restart
const { Profile } = require('../models');
const { generateAccessToken, generateRefreshToken } = require('../services/tokenService');
const { generateOTP, sendRegistrationOTP, sendPasswordResetOTP } = require('../services/emailService');
const { checkIsAdmin } = require('../middleware/adminAuth');
const { getPresignedUrl } = require('../services/uploadService');

/**
 * Get primary photo URL helper
 */
const getPrimaryPhoto = async (profile) => {
    if (!profile || !profile.photos || profile.photos.length === 0) return null;
    const primary = profile.photos.find(p => p.isPrimary);
    const rawUrl = primary ? primary.url : profile.photos[0]?.url || null;
    if (!rawUrl) return null;
    return await getPresignedUrl(rawUrl);
};

/**
 * Helper to enrich user object with profile data and subscription info
 */
const enrichUserWithProfile = async (user, profile) => {
    const isAdmin = checkIsAdmin(user);
    // Fetch subscription for remaining views
    const subscription = await Subscription.findOne({ userId: user._id });

    let photoUrl = null;
    let firstName = null;
    let lastName = null;

    if (profile) {
        photoUrl = await getPrimaryPhoto(profile);
        firstName = profile.firstName;
        lastName = profile.lastName;
    }

    return {
        id: user._id,
        username: user.username,
        email: user.email,
        isVerified: user.isVerified,
        isAdmin,
        hasProfile: !!profile,
        firstName,
        photoUrl,
        remainingViews: subscription ? subscription.remainingViews : 0,
        subscriptionStatus: subscription ? subscription.status : 'none'
    };
};

/**
 * Register new user
 * POST /api/auth/register
 */
const register = async (req, res, next) => {
    try {
        const { username, email, password, confirmPassword } = req.body;

        // Validation
        if (!username || !email || !password || !confirmPassword) {
            return res.status(400).json({
                success: false,
                message: 'Please provide all required fields'
            });
        }

        if (password !== confirmPassword) {
            return res.status(400).json({
                success: false,
                message: 'Passwords do not match'
            });
        }

        if (password.length < 8) {
            return res.status(400).json({
                success: false,
                message: 'Password must be at least 8 characters long'
            });
        }

        // Check if user already exists
        const existingUser = await User.findOne({
            $or: [{ email }, { username }]
        });

        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'User with this email or username already exists'
            });
        }

        // Generate OTP
        const otpCode = generateOTP();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        // Save OTP to database
        await OTP.create({
            email,
            otpCode,
            expiresAt,
            purpose: 'registration'
        });

        // Create unverified user
        const user = await User.create({
            username,
            email,
            hashedPassword: password,
            isVerified: false
        });

        // Send OTP email
        await sendRegistrationOTP(email, username, otpCode);

        res.status(201).json({
            success: true,
            message: 'Registration successful. Please check your email for OTP verification.',
            data: {
                email,
                otpSent: true,
                otpCode: process.env.NODE_ENV === 'development' ? otpCode : undefined
            }
        });

    } catch (error) {
        next(error);
    }
};

/**
 * Verify OTP and complete registration
 * POST /api/auth/verify-otp
 */
const verifyOTP = async (req, res, next) => {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({
                success: false,
                message: 'Please provide email and OTP'
            });
        }

        // Find OTP record
        const otpRecord = await OTP.findOne({
            email,
            otpCode: otp,
            purpose: 'registration',
            isUsed: false
        }).sort({ createdAt: -1 });

        if (!otpRecord) {
            return res.status(400).json({
                success: false,
                message: 'Invalid OTP'
            });
        }

        // Check if OTP is expired
        if (new Date() > otpRecord.expiresAt) {
            return res.status(400).json({
                success: false,
                message: 'OTP has expired'
            });
        }

        // Mark OTP as used
        otpRecord.isUsed = true;
        await otpRecord.save();

        // Update user verification status
        const user = await User.findOneAndUpdate(
            { email },
            { isVerified: true },
            { new: true }
        );

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Generate JWT tokens for auto-login
        const accessToken = generateAccessToken(user._id);
        const refreshToken = generateRefreshToken(user._id);

        // Check if user has profile
        const profile = await Profile.findOne({ userId: user._id });
        const userData = await enrichUserWithProfile(user, profile);

        res.json({
            success: true,
            message: 'Email verified successfully. You are now logged in!',
            data: {
                accessToken,
                refreshToken,
                tokenType: 'Bearer',
                user: userData
            }
        });

    } catch (error) {
        next(error);
    }
};

/**
 * Resend OTP
 * POST /api/auth/resend-otp
 */
const resendOTP = async (req, res, next) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Please provide email'
            });
        }

        // Find user
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        if (user.isVerified) {
            return res.status(400).json({
                success: false,
                message: 'Email already verified'
            });
        }

        // Generate new OTP
        const otpCode = generateOTP();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

        await OTP.create({
            email,
            otpCode,
            expiresAt,
            purpose: 'registration'
        });

        // Send OTP email
        await sendRegistrationOTP(email, user.username, otpCode);

        res.json({
            success: true,
            message: 'OTP resent successfully. Please check your email.',
            data: {
                email,
                otpSent: true,
                otpCode: process.env.NODE_ENV === 'development' ? otpCode : undefined
            }
        });

    } catch (error) {
        next(error);
    }
};

/**
 * Login user
 * POST /api/auth/login
 */
const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide email and password'
            });
        }

        // Find user
        const user = await User.findOne({ email }).select('+hashedPassword');

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        // Check password
        const isPasswordValid = await user.comparePassword(password);

        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        // Check if account is active
        if (!user.isActive) {
            return res.status(401).json({
                success: false,
                message: 'Account is deactivated'
            });
        }

        // Check if email is verified
        if (!user.isVerified) {
            return res.status(401).json({
                success: false,
                message: 'Email not verified. Please verify your email first.'
            });
        }

        // Generate tokens
        const accessToken = generateAccessToken(user._id);
        const refreshToken = generateRefreshToken(user._id);

        // Check if user has profile
        const profile = await Profile.findOne({ userId: user._id });
        const userData = await enrichUserWithProfile(user, profile);

        res.json({
            success: true,
            message: 'Login successful',
            data: {
                accessToken,
                refreshToken,
                tokenType: 'Bearer',
                user: userData
            }
        });

    } catch (error) {
        next(error);
    }
};

/**
 * Get current user info
 * GET /api/auth/me
 */
const getMe = async (req, res, next) => {
    try {
        const user = req.user; // From auth middleware

        // Check if user has profile
        const profile = await Profile.findOne({ userId: user._id });
        const userData = await enrichUserWithProfile(user, profile);
        // Add createdAt for getMe
        userData.createdAt = user.createdAt;
        // override isActive/isVerified if needed or they are already there?
        // enrichUserWithProfile has id, username, email, isVerified, isAdmin, hasProfile
        // user object in getMe had isActive. Let's add it.
        userData.isActive = user.isActive;

        res.json({
            success: true,
            data: {
                user: userData
            }
        });

    } catch (error) {
        next(error);
    }
};

/**
 * Forgot password - Request OTP
 * POST /api/auth/forgot-password
 */
const forgotPassword = async (req, res, next) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Please provide email'
            });
        }

        // Find user
        const user = await User.findOne({ email });

        if (!user) {
            // Don't reveal if user exists or not
            return res.json({
                success: true,
                message: 'If the email exists, an OTP will be sent.',
                data: {
                    email,
                    otpSent: true
                }
            });
        }

        // Generate OTP
        const otpCode = generateOTP();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

        await OTP.create({
            email,
            otpCode,
            expiresAt,
            purpose: 'password_reset'
        });

        // Send OTP email
        await sendPasswordResetOTP(email, otpCode);

        res.json({
            success: true,
            message: 'Password reset OTP sent to your email.',
            data: {
                email,
                otpSent: true,
                otpCode: process.env.NODE_ENV === 'development' ? otpCode : undefined
            }
        });

    } catch (error) {
        next(error);
    }
};

/**
 * Reset password with OTP
 * POST /api/auth/reset-password
 */
const resetPassword = async (req, res, next) => {
    try {
        const { email, otp, newPassword, confirmPassword } = req.body;

        if (!email || !otp || !newPassword || !confirmPassword) {
            return res.status(400).json({
                success: false,
                message: 'Please provide all required fields'
            });
        }

        if (newPassword !== confirmPassword) {
            return res.status(400).json({
                success: false,
                message: 'Passwords do not match'
            });
        }

        if (newPassword.length < 8) {
            return res.status(400).json({
                success: false,
                message: 'Password must be at least 8 characters long'
            });
        }

        // Find OTP record
        const otpRecord = await OTP.findOne({
            email,
            otpCode: otp,
            purpose: 'password_reset',
            isUsed: false
        }).sort({ createdAt: -1 });

        if (!otpRecord) {
            return res.status(400).json({
                success: false,
                message: 'Invalid OTP'
            });
        }

        // Check if OTP is expired
        if (new Date() > otpRecord.expiresAt) {
            return res.status(400).json({
                success: false,
                message: 'OTP has expired'
            });
        }

        // Mark OTP as used
        otpRecord.isUsed = true;
        await otpRecord.save();

        // Update user password
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        user.hashedPassword = newPassword; // Will be hashed by pre-save hook
        await user.save();

        res.json({
            success: true,
            message: 'Password reset successful',
            data: {
                passwordReset: true
            }
        });

    } catch (error) {
        next(error);
    }
};

/**
 * Refresh access token
 * POST /api/auth/refresh-token
 */
const refreshToken = async (req, res, next) => {
    try {
        const { refreshToken: token } = req.body;

        if (!token) {
            return res.status(400).json({
                success: false,
                message: 'Please provide refresh token'
            });
        }

        const { verifyToken } = require('../services/tokenService');
        const decoded = verifyToken(token);

        if (decoded.type !== 'refresh') {
            return res.status(401).json({
                success: false,
                message: 'Invalid refresh token'
            });
        }

        // Get user
        const user = await User.findById(decoded.sub);

        if (!user || !user.isActive) {
            return res.status(401).json({
                success: false,
                message: 'User not found or inactive'
            });
        }

        // Generate new access token
        const newAccessToken = generateAccessToken(user._id);

        res.json({
            success: true,
            message: 'Token refreshed successfully',
            data: {
                accessToken: newAccessToken,
                tokenType: 'Bearer'
            }
        });

    } catch (error) {
        next(error);
    }
};

module.exports = {
    register,
    verifyOTP,
    resendOTP,
    login,
    getMe,
    forgotPassword,
    resetPassword,
    refreshToken
};
