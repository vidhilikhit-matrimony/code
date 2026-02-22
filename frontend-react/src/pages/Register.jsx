import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { toast } from 'sonner';
import { Mail, Lock, User, Eye, EyeOff } from 'lucide-react';
import { register as registerService, verifyOTP as verifyOTPService } from '../services/authService';
import { loginSuccess } from '../redux/slices/authSlice';

const Register = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const [step, setStep] = useState(1); // 1: Register, 2: OTP Verification
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [otp, setOtp] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleRegister = async (e) => {
        e.preventDefault();

        if (formData.password !== formData.confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }

        if (formData.password.length < 8) {
            toast.error('Password must be at least 8 characters');
            return;
        }

        setIsLoading(true);

        try {
            const response = await registerService(formData);

            if (response.success) {
                toast.success('Registration successful! Please verify your email.');
                setStep(2);
            } else {
                toast.error(response.message || 'Registration failed');
            }
        } catch (error) {
            toast.error(error.message || 'An error occurred during registration');
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifyOTP = async (e) => {
        e.preventDefault();

        if (!otp || otp.length !== 6) {
            toast.error('Please enter a valid 6-digit OTP');
            return;
        }

        setIsLoading(true);

        try {
            const response = await verifyOTPService(formData.email, otp);

            if (response.success) {
                // Auto-login: store tokens and user data via Redux
                dispatch(loginSuccess(response.data));

                toast.success('Email verified! You are now logged in.');
                navigate('/profiles');
            } else {
                toast.error(response.message || 'OTP verification failed');
            }
        } catch (error) {
            toast.error(error.message || 'An error occurred during verification');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-secondary-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 p-4">
            <div className="card max-w-md w-full p-8 animate-fade-in">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gradient mb-2">
                        {step === 1 ? 'Create Account' : 'Verify Email'}
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400">
                        {step === 1 ? 'Join VidhiLikhit Matrimonial' : 'Enter the OTP sent to your email'}
                    </p>
                </div>

                {step === 1 ? (
                    /* Registration Form */
                    <form onSubmit={handleRegister} className="space-y-6">
                        <div>
                            <label className="label">
                                <User className="w-4 h-4 inline mr-2" />
                                Username
                            </label>
                            <input
                                type="text"
                                name="username"
                                value={formData.username}
                                onChange={handleChange}
                                className="input"
                                placeholder="Choose a username"
                                required
                            />
                        </div>

                        <div>
                            <label className="label">
                                <Mail className="w-4 h-4 inline mr-2" />
                                Email
                            </label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                className="input"
                                placeholder="Enter your email"
                                required
                            />
                        </div>

                        <div>
                            <label className="label">
                                <Lock className="w-4 h-4 inline mr-2" />
                                Password
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    className="input pr-10"
                                    placeholder="Create a password"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="label">
                                <Lock className="w-4 h-4 inline mr-2" />
                                Confirm Password
                            </label>
                            <input
                                type="password"
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                className="input"
                                placeholder="Confirm your password"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="btn btn-primary w-full"
                        >
                            {isLoading ? 'Creating Account...' : 'Create Account'}
                        </button>
                    </form>
                ) : (
                    /* OTP Verification Form */
                    <form onSubmit={handleVerifyOTP} className="space-y-6">
                        <div>
                            <label className="label">Enter OTP</label>
                            <input
                                type="text"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                className="input text-center text-2xl tracking-widest"
                                placeholder="000000"
                                maxLength={6}
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="btn btn-primary w-full"
                        >
                            {isLoading ? 'Verifying...' : 'Verify OTP'}
                        </button>

                        <div className="text-center">
                            <button
                                type="button"
                                onClick={() => setStep(1)}
                                className="text-sm text-slate-600 hover:text-slate-800 dark:text-slate-400"
                            >
                                ← Back to registration
                            </button>
                        </div>
                    </form>
                )}

                {/* Login Link */}
                <div className="mt-6 text-center">
                    <p className="text-slate-600 dark:text-slate-400">
                        Already have an account?{' '}
                        <Link
                            to="/login"
                            className="text-primary-600 hover:text-primary-700 dark:text-primary-400 font-medium"
                        >
                            Login here
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Register;
