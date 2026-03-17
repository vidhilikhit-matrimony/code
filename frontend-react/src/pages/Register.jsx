import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { toast } from 'sonner';
import { Mail, Lock, User, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { register as registerService, verifyOTP as verifyOTPService } from '../services/authService';
import { loginSuccess } from '../redux/slices/authSlice';
import LogoImg from '../assets/vidhilikhit_logo.png';
import BgImg from '../assets/hero_wedding.png';

const Register = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const [step, setStep] = useState(1); // 1: Register, 2: OTP Verification
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
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
            const response = await verifyOTPService({ ...formData, otp });

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
        <div className="min-h-screen flex flex-col lg:flex-row items-center justify-center bg-slate-900 p-6 lg:p-12 lg:gap-24 relative overflow-hidden">

            {/* Background Image with Overlay */}
            <div className="absolute inset-0 z-0">
                <img src={BgImg} alt="Marriage Background" className="w-full h-full object-cover opacity-30" />
                <div className="absolute inset-0 bg-gradient-to-br from-slate-900/80 via-slate-900/60 to-primary-900/40"></div>
            </div>

            {/* Left Branding / Logo Outside the Box */}
            <div className="mb-8 lg:mb-0 text-center lg:text-left animate-fade-in flex flex-col items-center justify-center max-w-sm z-10">
                <div className="bg-white/10 p-3 rounded-2xl backdrop-blur-sm shadow-xl border border-white/20 mb-4">
                    <img src={LogoImg} alt="VidhiLikhit Logo" className="w-24 lg:w-32 h-auto object-contain drop-shadow-md hover:scale-105 transition-transform duration-500 bg-white rounded-xl p-1.5" />
                </div>
                <h2 className="text-3xl lg:text-5xl font-serif font-bold text-white mt-2 drop-shadow-lg">VidhiLikhit</h2>
                <p className="text-slate-200 font-medium text-base lg:text-lg mt-3 drop-shadow-md text-center">Find your perfect match.</p>
            </div>

            <div className="card w-full max-w-lg animate-fade-in shadow-2xl p-8 border border-white/20 rounded-2xl bg-white/95 dark:bg-slate-800/95 backdrop-blur-md z-10 hover:shadow-primary-500/20 transition-all duration-300">
                {/* Back Link */}
                <Link to="/" className="inline-flex items-center text-sm text-slate-500 hover:text-primary-600 mb-6 transition-colors font-medium">
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
                </Link>

                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                        {step === 1 ? 'Create Account' : 'Verify Email'}
                    </h1>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                        {step === 1 ? 'Join VidhiLikhit Matrimonial' : 'Enter OTP'}
                    </p>
                </div>

                {step === 1 ? (
                    /* Registration Form */
                    <form onSubmit={handleRegister} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-1.5 block leading-tight">
                                    Bride/Groom First Name
                                </label>
                                <input
                                    type="text"
                                    name="firstName"
                                    value={formData.firstName}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2.5 text-base border border-slate-300 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all dark:bg-slate-900 dark:border-slate-600 dark:text-white"
                                    placeholder="Bride/Groom First Name"
                                    required
                                />
                            </div>
                            <div>
                                <label className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-1.5 block leading-tight">
                                    Bride/Groom Last Name
                                </label>
                                <input
                                    type="text"
                                    name="lastName"
                                    value={formData.lastName}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2.5 text-base border border-slate-300 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all dark:bg-slate-900 dark:border-slate-600 dark:text-white"
                                    placeholder="Bride/Groom Last Name"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-1.5 block">
                                <Mail className="w-4 h-4 inline mr-2 text-slate-500" />
                                Email
                            </label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                className="w-full px-4 py-2.5 text-base border border-slate-300 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all dark:bg-slate-900 dark:border-slate-600 dark:text-white"
                                placeholder="Email"
                                required
                            />
                        </div>

                        <div>
                            <label className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-1.5 block">
                                <Lock className="w-4 h-4 inline mr-2 text-slate-500" />
                                Password
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2.5 text-base border border-slate-300 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all pr-12 dark:bg-slate-900 dark:border-slate-600 dark:text-white"
                                    placeholder="Password"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                            <p className="text-xs mt-1.5 text-slate-500 dark:text-slate-400">Minimum 8 characters</p>
                        </div>

                        <div>
                            <label className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-1.5 block">
                                <Lock className="w-4 h-4 inline mr-2 text-slate-500" />
                                Confirm Password
                            </label>
                            <input
                                type="password"
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                className="w-full px-4 py-2.5 text-base border border-slate-300 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all dark:bg-slate-900 dark:border-slate-600 dark:text-white"
                                placeholder="Confirm"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 px-4 rounded-xl text-base transition-colors shadow-lg shadow-primary-500/30 mt-4"
                        >
                            {isLoading ? 'Wait...' : 'Create Account'}
                        </button>
                    </form>
                ) : (
                    /* OTP Verification Form */
                    <form onSubmit={handleVerifyOTP} className="space-y-6">
                        <div>
                            <label className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-1.5 block">Enter OTP</label>
                            <input
                                type="text"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                className="w-full px-4 py-3 text-center text-2xl tracking-widest border border-slate-300 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all dark:bg-slate-900 dark:border-slate-600 dark:text-white"
                                placeholder="000000"
                                maxLength={6}
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 px-4 rounded-xl text-base transition-colors shadow-lg shadow-primary-500/30 mt-4"
                        >
                            {isLoading ? 'Verifying...' : 'Verify OTP'}
                        </button>

                        <div className="text-center mt-6">
                            <button
                                type="button"
                                onClick={() => setStep(1)}
                                className="text-sm text-slate-600 hover:text-slate-800 dark:text-slate-400 font-medium"
                            >
                                ← Back to registration
                            </button>
                        </div>
                    </form>
                )}

                {/* Login Link */}
                <div className="mt-8 text-center pt-6 border-t border-slate-200 dark:border-slate-700">
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                        Already have an account?{' '}
                        <Link
                            to="/login"
                            className="text-primary-600 hover:text-primary-700 dark:text-primary-400 font-bold ml-1"
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
