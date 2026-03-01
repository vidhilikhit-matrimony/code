import api from './api';

/**
 * Register new user
 */
export const register = async (userData) => {
    return await api.post('/auth/register', userData);
};

/**
 * Verify OTP
 */
export const verifyOTP = async (email, otp) => {
    return await api.post('/auth/verify-otp', { email, otp });
};

/**
 * Resend OTP
 */
export const resendOTP = async (email) => {
    return await api.post('/auth/resend-otp', { email });
};

/**
 * Login user
 */
export const login = async (credentials) => {
    return await api.post('/auth/login', credentials);
};

/**
 * Get current user
 */
export const getCurrentUser = async () => {
    return await api.get('/auth/me');
};

/**
 * Forgot password
 */
export const forgotPassword = async (email) => {
    return await api.post('/auth/forgot-password', { email });
};

/**
 * Reset password
 */
export const resetPassword = async (resetData) => {
    return await api.post('/auth/reset-password', resetData);
};

/**
 * Refresh token
 */
export const refreshToken = async (refreshToken) => {
    return await api.post('/auth/refresh-token', { refreshToken });
};

/**
 * Clear pending notification
 */
export const clearNotification = async () => {
    return await api.post('/auth/clear-notification');
};

/**
 * Logout (client-side only - clear tokens)
 */
export const logout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
};
