import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'sonner';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { forgotPassword, resetPassword } from '../services/authService';

const ForgotPassword = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1); // 1: Request OTP, 2: Reset Password
    const [email, setEmail] = useState('');
    const [formData, setFormData] = useState({
        otp: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleRequestOTP = async (e) => {
        e.preventDefault();
        if (!email) {
            toast.error('Please enter your email');
            return;
        }

        setIsLoading(true);
        try {
            const response = await forgotPassword(email);
            if (response.success) {
                toast.success(response.message || 'OTP sent to your email.');
                setStep(2);
            } else {
                toast.error(response.message || 'Failed to send OTP.');
            }
        } catch (error) {
            toast.error(error.message || 'An error occurred. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();

        if (formData.newPassword !== formData.confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }

        if (formData.newPassword.length < 8) {
            toast.error('Password must be at least 8 characters');
            return;
        }

        if (!formData.otp || formData.otp.length !== 6) {
            toast.error('Please enter a valid 6-digit OTP');
            return;
        }

        setIsLoading(true);
        try {
            const response = await resetPassword({
                email,
                otp: formData.otp,
                newPassword: formData.newPassword,
                confirmPassword: formData.confirmPassword
            });

            if (response.success) {
                toast.success('Password reset successful. Please login.');
                navigate('/login');
            } else {
                toast.error(response.message || 'Failed to reset password.');
            }
        } catch (error) {
            toast.error(error.message || 'An error occurred during password reset.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-secondary-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 p-4">
            <div className="card max-w-md w-full p-8 animate-fade-in">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gradient mb-2">
                        {step === 1 ? 'Forgot Password' : 'Reset Password'}
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400">
                        {step === 1 ? 'Enter your email to receive an OTP' : 'Enter the OTP and your new password'}
                    </p>
                </div>

                {step === 1 ? (
                    <form onSubmit={handleRequestOTP} className="space-y-6">
                        <div>
                            <label className="label">
                                <Mail className="w-4 h-4 inline mr-2" />
                                Email
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="input"
                                placeholder="Enter your email"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="btn btn-primary w-full"
                        >
                            {isLoading ? 'Sending Request...' : 'Send OTP'}
                        </button>

                        <div className="text-center mt-4">
                            <Link to="/login" className="text-sm text-slate-600 hover:text-slate-800 dark:text-slate-400">
                                ← Back to Login
                            </Link>
                        </div>
                    </form>
                ) : (
                    <form onSubmit={handleResetPassword} className="space-y-6">
                        <div>
                            <label className="label">Enter OTP</label>
                            <input
                                type="text"
                                name="otp"
                                value={formData.otp}
                                onChange={handleChange}
                                className="input text-center text-2xl tracking-widest"
                                placeholder="000000"
                                maxLength={6}
                                required
                            />
                        </div>

                        <div>
                            <label className="label">
                                <Lock className="w-4 h-4 inline mr-2" />
                                New Password
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    name="newPassword"
                                    value={formData.newPassword}
                                    onChange={handleChange}
                                    className="input pr-10"
                                    placeholder="Enter new password"
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
                                Confirm New Password
                            </label>
                            <input
                                type="password"
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                className="input"
                                placeholder="Confirm new password"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="btn btn-primary w-full"
                        >
                            {isLoading ? 'Resetting Password...' : 'Reset Password'}
                        </button>

                        <div className="text-center">
                            <button
                                type="button"
                                onClick={() => setStep(1)}
                                className="text-sm text-slate-600 hover:text-slate-800 dark:text-slate-400"
                            >
                                ← Back to request OTP
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default ForgotPassword;
