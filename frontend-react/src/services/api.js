import axios from 'axios';

// Create axios instance
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Request interceptor - Add auth token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('accessToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor - Handle errors
api.interceptors.response.use(
    (response) => response.data,
    (error) => {
        if (error.response) {
            // Server responded with error
            const { status, data } = error.response;

            if (status === 401) {
                // Unauthorized - clear stale tokens
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
                // Only redirect to login if NOT on a public page
                const publicPaths = ['/', '/login', '/register'];
                if (!publicPaths.includes(window.location.pathname)) {
                    window.location.href = '/login';
                }
            }

            // Return error with status
            const errorObj = (typeof data === 'object' && data !== null)
                ? { ...data, status }
                : { message: data, status };

            return Promise.reject(errorObj);
        } else if (error.request) {
            // Request made but no response
            return Promise.reject({
                success: false,
                message: 'No response from server. Please check your connection.'
            });
        } else {
            // Something else happened
            return Promise.reject({
                success: false,
                message: error.message
            });
        }
    }
);

export default api;
