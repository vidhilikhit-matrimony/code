import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';

const SubscriptionWarningModal = () => {
    const { user, isAuthenticated } = useSelector((state) => state.auth);
    const navigate = useNavigate();
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        console.log("SubscriptionWarningModal checks:", {
            auth: isAuthenticated,
            userObj: !!user,
            isAdmin: user?.isAdmin,
            views: user?.remainingViews,
            isNumber: typeof user?.remainingViews === 'number'
        });

        // user.remainingViews might be 0, which is valid falsy, so checking specifically against <= 2
        // We ensure we have a valid number and an actual subscription before deciding
        const hasValidSub = user?.subscriptionStatus && user.subscriptionStatus !== 'none' && user.subscriptionStatus !== 'inactive';
        if (isAuthenticated && user && !user.isAdmin && hasValidSub && typeof user.remainingViews === 'number' && user.remainingViews <= 2) {
            // Check if we've already shown it this session
            const hasShown = sessionStorage.getItem(`sub_warning_${user._id}`);
            console.log("Modal has shown this session?", hasShown);
            if (!hasShown) {
                setIsVisible(true);
            }
        } else {
            setIsVisible(false);
        }
    }, [user, isAuthenticated]);

    const handleSkip = () => {
        setIsVisible(false);
        if (user) {
            sessionStorage.setItem(`sub_warning_${user._id}`, 'true');
        }
    };

    const handleRenew = () => {
        setIsVisible(false);
        if (user) {
            sessionStorage.setItem(`sub_warning_${user._id}`, 'true');
        }
        navigate('/payment');
    };

    if (!isVisible) return null;

    return (
        <div className="fixed inset-0 z-[200] bg-black/50 flex flex-col items-center justify-start pt-10 animate-in fade-in duration-200">
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 w-auto max-w-2xl shadow-xl border border-slate-200 dark:border-slate-700 flex items-center gap-6">
                <div className="w-12 h-12 shrink-0 bg-amber-50 dark:bg-amber-500/10 rounded-full flex items-center justify-center">
                    <AlertTriangle className="w-6 h-6 text-amber-500" />
                </div>

                <div className="flex-1 min-w-[300px]">
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
                        Subscription Expiring
                    </h2>
                    <p className="text-sm text-slate-600 dark:text-slate-300">
                        You have <span className="font-bold text-amber-500">{user.remainingViews}</span> unlocks remaining. Please renew to continue viewing profiles.
                    </p>
                </div>

                <div className="flex gap-3 shrink-0">
                    <button
                        onClick={handleSkip}
                        className="px-4 py-2 rounded-xl text-sm font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                    >
                        Skip
                    </button>
                    <button
                        onClick={handleRenew}
                        className="px-4 py-2 rounded-xl text-sm font-bold text-white bg-amber-500 hover:bg-amber-600 transition-colors shadow-md shadow-amber-500/20"
                    >
                        Renew Subscription
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SubscriptionWarningModal;
