import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Bell } from 'lucide-react';
import api from '../../services/api';

const GlobalNotificationModal = () => {
    const [notification, setNotification] = useState(null);
    const [isVisible, setIsVisible] = useState(false);
    const navigate = useNavigate();
    const { isAuthenticated, user } = useSelector((state) => state.auth);

    useEffect(() => {
        // Only fetch and show if the user is logged in AND is not an admin
        if (!isAuthenticated || !user || user.isAdmin) return;

        // Fetch the active notification when the component mounts
        const fetchActiveNotification = async () => {
            try {
                const response = await api.get('/notifications/active');
                if (response.success && response.data) {
                    // Check if user previously dismissed this specific notification ID in this session
                    const dismissedId = sessionStorage.getItem('dismissed_notification_id');
                    if (dismissedId !== response.data._id) {
                        setNotification(response.data);
                        setIsVisible(true);
                    }
                }
            } catch (error) {
                // Silently fail if there's no notification or an error
                console.error("Failed to load global notification", error);
            }
        };

        fetchActiveNotification();
    }, [isAuthenticated]);

    const handleSkip = () => {
        setIsVisible(false);
        // Save to session storage so it doesn't reappear on every navigation/refresh 
        // until the browser tab is closed or a NEW notification ID is published
        if (notification) {
            sessionStorage.setItem('dismissed_notification_id', notification._id);
        }
    };

    const handleEditProfile = () => {
        setIsVisible(false);
        if (notification) {
            sessionStorage.setItem('dismissed_notification_id', notification._id);
        }
        navigate('/create-profile');
    };

    if (!isVisible || !notification) return null;

    return (
        <div className="fixed inset-0 z-[200] bg-black/50 flex flex-col items-center justify-start pt-10 px-4 animate-in fade-in duration-200">
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 sm:p-5 w-full max-w-lg shadow-xl border border-slate-200 dark:border-slate-700">
                {/* Top row: icon + text */}
                <div className="flex items-start gap-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 shrink-0 bg-indigo-50 dark:bg-indigo-500/10 rounded-full flex items-center justify-center">
                        <Bell className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-500 animate-pulse" />
                    </div>

                    <div className="flex-1 min-w-0">
                        <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mb-1">
                            Important Announcement
                        </h2>
                        <p className="text-sm text-slate-600 dark:text-slate-300 leading-snug whitespace-pre-wrap">
                            {notification.message}
                        </p>
                    </div>
                </div>

                {/* Buttons row */}
                <div className="flex gap-3 mt-4">
                    <button
                        onClick={handleSkip}
                        className="flex-1 sm:flex-none px-4 py-2 rounded-xl text-sm font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                    >
                        Skip
                    </button>
                    <button
                        onClick={handleEditProfile}
                        className="flex-1 sm:flex-none px-4 py-2 rounded-xl text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-md shadow-indigo-500/20"
                    >
                        Edit Profile
                    </button>
                </div>
            </div>
        </div>
    );
};

export default GlobalNotificationModal;
