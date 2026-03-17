import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { toast } from 'sonner';
import { Mail, Lock, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { login as loginService } from '../services/authService';
import { loginStart, loginSuccess, loginFailure } from '../redux/slices/authSlice';
import LogoImg from '../assets/vidhilikhit_logo.png';
import BgImg from '../assets/hero_wedding.png';

const Login = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.email || !formData.password) {
            toast.error('Please fill in all fields');
            return;
        }

        setIsLoading(true);
        dispatch(loginStart());

        try {
            const response = await loginService(formData);

            if (response.success) {
                dispatch(loginSuccess(response.data));
                toast.success('Login successful!');
                const { user } = response.data;
                if (user.isAdmin) {
                    navigate('/admin/dashboard');
                } else {
                    navigate('/profiles');
                }
            } else {
                dispatch(loginFailure(response.message));
                toast.error(response.message || 'Login failed');
            }
        } catch (error) {
            const errorMessage = error.message || 'An error occurred during login';
            dispatch(loginFailure(errorMessage));
            toast.error(errorMessage);
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

            <div className="card w-full max-w-md animate-fade-in shadow-2xl p-8 border border-white/20 rounded-2xl bg-white/95 dark:bg-slate-800/95 backdrop-blur-md z-10 hover:shadow-primary-500/20 transition-all duration-300">
                {/* Back Link */}
                <Link to="/" className="inline-flex items-center text-sm text-slate-500 hover:text-primary-600 mb-6 transition-colors font-medium">
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
                </Link>

                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                        Welcome Back
                    </h1>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                        Sign in to your account
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Email */}
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
                            placeholder="Enter your email"
                            required
                        />
                    </div>

                    {/* Password */}
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
                                placeholder="Enter your password"
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
                    </div>

                    {/* Forgot Password */}
                    <div className="text-right">
                        <Link
                            to="/forgot-password"
                            className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 font-medium"
                        >
                            Forgot password?
                        </Link>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 px-4 rounded-xl text-base transition-colors shadow-lg shadow-primary-500/30 mt-2"
                    >
                        {isLoading ? 'Signing in...' : 'Sign In'}
                    </button>
                </form>

                {/* Register Link */}
                <div className="mt-8 text-center pt-6 border-t border-slate-200 dark:border-slate-700">
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                        Don't have an account?{' '}
                        <Link
                            to="/register"
                            className="text-primary-600 hover:text-primary-700 dark:text-primary-400 font-bold ml-1"
                        >
                            Register here
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
