import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { getActiveGlobalNotification } from '../services/notificationService';
import { X, Info, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

const GlobalNotificationPopup = ({ hasProfile, myProfile }) => {
    const { user } = useSelector(state => state.auth);
    const [notification, setNotification] = useState(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const fetchNotification = async () => {
            try {
                const response = await getActiveGlobalNotification();
                const activeNotif = response.data;
                
                if (activeNotif) {
                    let isEligible = true;

                    // Evaluate targeting criteria
                    if (activeNotif.targetProfileStatus === 'Has Profile' && !hasProfile) isEligible = false;
                    if (activeNotif.targetProfileStatus === 'No Profile' && hasProfile) isEligible = false;

                    if (user && activeNotif.targetSubscription === 'Premium' && user.subscriptionStatus !== 'active') isEligible = false;
                    if (user && activeNotif.targetSubscription === 'Free' && user.subscriptionStatus === 'active') isEligible = false;

                    if (activeNotif.targetGender !== 'All') {
                        if (!hasProfile || myProfile?.gender !== activeNotif.targetGender) isEligible = false;
                    }

                    if (activeNotif.targetCommunity !== 'All') {
                        if (!hasProfile || myProfile?.caste !== activeNotif.targetCommunity) isEligible = false;
                    }

                    if (!isEligible) return;

                    // Check if this specific notification was already dismissed in the current session
                    const dismissed = sessionStorage.getItem(`dismissed_notification_${activeNotif._id}`);
                    if (!dismissed) {
                        setNotification(activeNotif);
                        setIsVisible(true);
                    }
                }
            } catch (error) {
                console.error('Failed to fetch global notification:', error);
            }
        };

        fetchNotification();
    }, [user, hasProfile, myProfile]);

    const handleDismiss = () => {
        setIsVisible(false);
        if (notification) {
            // Save to sessionStorage so it doesn't appear again during this session
            sessionStorage.setItem(`dismissed_notification_${notification._id}`, 'true');
        }
    };

    if (!isVisible || !notification) return null;

    const getThemeColors = (type) => {
        switch (type) {
            case 'info': 
                return {
                    bg: 'bg-blue-50/95',
                    border: 'border-blue-200/60',
                    icon: <Info className="w-8 h-8 text-blue-500" />,
                    buttonBg: 'bg-blue-500 hover:bg-blue-600 shadow-blue-500/20'
                };
            case 'warning':
                return {
                    bg: 'bg-amber-50/95',
                    border: 'border-amber-200/60',
                    icon: <AlertTriangle className="w-8 h-8 text-amber-500" />,
                    buttonBg: 'bg-amber-500 hover:bg-amber-600 shadow-amber-500/20'
                };
            case 'success':
                return {
                    bg: 'bg-emerald-50/95',
                    border: 'border-emerald-200/60',
                    icon: <CheckCircle className="w-8 h-8 text-emerald-500" />,
                    buttonBg: 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/20'
                };
            case 'error':
                return {
                    bg: 'bg-rose-50/95',
                    border: 'border-rose-200/60',
                    icon: <XCircle className="w-8 h-8 text-rose-500" />,
                    buttonBg: 'bg-rose-500 hover:bg-rose-600 shadow-rose-500/20'
                };
            default:
                return {
                    bg: 'bg-slate-50/95',
                    border: 'border-slate-200/60',
                    icon: <Info className="w-8 h-8 text-indigo-600" />,
                    buttonBg: 'bg-indigo-600 hover:bg-indigo-600 shadow-indigo-600/20'
                };
        }
    };

    const theme = getThemeColors(notification.type);

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px] animate-in fade-in duration-300"
                onClick={handleDismiss}
            />

            {/* Modal Content */}
            <div className={`relative w-full max-w-md ${theme.bg} backdrop-blur-xl border ${theme.border} rounded-3xl p-6 shadow-2xl animate-in zoom-in-95 fade-in duration-300`}>
                
                {/* Close Button */}
                <button 
                    onClick={handleDismiss}
                    className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 bg-white/50 hover:bg-white rounded-full transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>

                <div className="flex flex-col items-center text-center mt-2">
                    <div className="mb-4 p-3 bg-white rounded-2xl shadow-sm border border-black/5">
                        {theme.icon}
                    </div>
                    
                    <h3 className="text-xl font-serif font-black text-slate-900 mb-2">
                        Announcement
                    </h3>
                    
                    <p className="text-slate-700 font-medium leading-relaxed mb-8 max-w-[90%] mx-auto whitespace-pre-wrap">
                        {notification.message}
                    </p>

                    <button 
                        onClick={handleDismiss}
                        className={`w-full py-3.5 px-6 ${theme.buttonBg} text-white rounded-xl font-bold uppercase tracking-wider text-xs transition-all shadow-lg active:scale-[0.98]`}
                    >
                        Got it
                    </button>
                </div>
            </div>
        </div>
    );
};

export default GlobalNotificationPopup;
