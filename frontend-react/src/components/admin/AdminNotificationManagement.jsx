import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Bell, Megaphone, Trash2, Loader2, Info, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { getActiveGlobalNotification, createGlobalNotification, disableGlobalNotification } from '../../services/notificationService';

const AdminNotificationManagement = () => {
    const [message, setMessage] = useState('');
    const [type, setType] = useState('info');
    const [targetGender, setTargetGender] = useState('All');
    const [targetSubscription, setTargetSubscription] = useState('All');
    const [targetCommunity, setTargetCommunity] = useState('All');
    const [targetProfileStatus, setTargetProfileStatus] = useState('All');
    const [activeNotification, setActiveNotification] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isFetching, setIsFetching] = useState(true);

    const fetchActiveNotification = async () => {
        try {
            setIsFetching(true);
            const response = await getActiveGlobalNotification();
            setActiveNotification(response.data);
        } catch (error) {
            console.error('Error fetching notification:', error);
            toast.error('Failed to load active notification');
        } finally {
            setIsFetching(false);
        }
    };

    useEffect(() => {
        fetchActiveNotification();
    }, []);

    const handleBroadcast = async (e) => {
        e.preventDefault();
        if (!message.trim()) {
            toast.error('Please enter a message to broadcast');
            return;
        }

        try {
            setIsLoading(true);
            await createGlobalNotification({ 
                message: message.trim(), 
                type,
                targetGender,
                targetSubscription,
                targetCommunity,
                targetProfileStatus
            });
            toast.success('Notification broadcasted successfully!');
            setMessage('');
            setType('info');
            setTargetGender('All');
            setTargetSubscription('All');
            setTargetCommunity('All');
            setTargetProfileStatus('All');
            fetchActiveNotification();
        } catch (error) {
            console.error('Error broadcasting notification:', error);
            toast.error(error.response?.data?.message || 'Failed to broadcast notification');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDisable = async () => {
        if (!window.confirm('Are you sure you want to disable the current active notification?')) {
            return;
        }

        try {
            setIsLoading(true);
            await disableGlobalNotification();
            toast.success('Notification disabled successfully!');
            setActiveNotification(null);
        } catch (error) {
            console.error('Error disabling notification:', error);
            toast.error('Failed to disable notification');
        } finally {
            setIsLoading(false);
        }
    };

    const getTypeIcon = (type) => {
        switch (type) {
            case 'info': return <Info className="w-5 h-5 text-blue-500" />;
            case 'warning': return <AlertTriangle className="w-5 h-5 text-amber-500" />;
            case 'success': return <CheckCircle className="w-5 h-5 text-emerald-500" />;
            case 'error': return <XCircle className="w-5 h-5 text-rose-500" />;
            default: return <Info className="w-5 h-5 text-blue-500" />;
        }
    };

    const getTypeStyles = (type) => {
        switch (type) {
            case 'info': return 'bg-blue-50 border-blue-200 text-blue-800';
            case 'warning': return 'bg-amber-50 border-amber-200 text-amber-800';
            case 'success': return 'bg-emerald-50 border-emerald-200 text-emerald-800';
            case 'error': return 'bg-rose-50 border-rose-200 text-rose-800';
            default: return 'bg-slate-50 border-slate-200 text-slate-800';
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-serif font-black text-slate-900">Global Announcements</h2>
                    <p className="text-slate-500 text-sm font-bold mt-1">Broadcast messages to all users on the profiles page</p>
                </div>
                <div className="p-3 bg-indigo-600/10 text-indigo-600 rounded-xl">
                    <Megaphone className="w-6 h-6" />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Create Notification Form */}
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
                    <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                        <Bell className="w-5 h-5 text-indigo-600" />
                        Create New Announcement
                    </h3>

                    <form onSubmit={handleBroadcast} className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Message Type</label>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                {['info', 'success', 'warning', 'error'].map((t) => (
                                    <button
                                        key={t}
                                        type="button"
                                        onClick={() => setType(t)}
                                        className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all ${
                                            type === t 
                                                ? 'border-indigo-600 bg-indigo-600/5' 
                                                : 'border-slate-100 hover:border-slate-200 bg-slate-50'
                                        }`}
                                    >
                                        {getTypeIcon(t)}
                                        <span className="text-[10px] uppercase font-bold mt-2 text-slate-600">{t}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Target Gender</label>
                                <select value={targetGender} onChange={e => setTargetGender(e.target.value)} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition-all cursor-pointer font-medium text-slate-700">
                                    <option value="All">All Genders</option>
                                    <option value="Male">Male Only</option>
                                    <option value="Female">Female Only</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Target Subscription</label>
                                <select value={targetSubscription} onChange={e => setTargetSubscription(e.target.value)} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition-all cursor-pointer font-medium text-slate-700">
                                    <option value="All">All Members</option>
                                    <option value="Premium">Premium Only</option>
                                    <option value="Free">Free Only</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Target Community</label>
                                <select value={targetCommunity} onChange={e => setTargetCommunity(e.target.value)} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition-all cursor-pointer font-medium text-slate-700">
                                    <option value="All">All Communities</option>
                                    <option value="Brahmin">Brahmin Only</option>
                                    <option value="Lingayat">Lingayat Only</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Profile Status</label>
                                <select value={targetProfileStatus} onChange={e => setTargetProfileStatus(e.target.value)} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition-all cursor-pointer font-medium text-slate-700">
                                    <option value="All">All Accounts</option>
                                    <option value="Has Profile">Completed Profile</option>
                                    <option value="No Profile">No Profile Created</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Message Content</label>
                            <textarea
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder="Enter the announcement message to broadcast..."
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition-all min-h-[120px] resize-none"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading || !message.trim()}
                            className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white py-3 rounded-xl font-bold uppercase tracking-wider text-xs hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-indigo-600/20"
                        >
                            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Megaphone className="w-4 h-4" />}
                            Broadcast Message
                        </button>
                        <p className="text-[10px] text-center text-slate-500 font-medium">
                            Broadcasting a new message will automatically replace any currently active announcement.
                        </p>
                    </form>
                </div>

                {/* Active Notification Status */}
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex flex-col">
                    <h3 className="font-bold text-slate-900 mb-4">Current Active Announcement</h3>
                    
                    <div className="flex-1 flex flex-col">
                        {isFetching ? (
                            <div className="flex-1 flex items-center justify-center py-12">
                                <Loader2 className="w-8 h-8 animate-spin text-indigo-600/50" />
                            </div>
                        ) : activeNotification ? (
                            <div className={`flex-1 flex flex-col p-6 rounded-2xl border ${getTypeStyles(activeNotification.type)}`}>
                                <div className="flex items-start gap-3 mb-4">
                                    <div className="mt-0.5 bg-white/50 rounded-full p-1.5">
                                        {getTypeIcon(activeNotification.type)}
                                    </div>
                                    <div>
                                        <div className="text-[10px] uppercase font-bold tracking-wider opacity-70 mb-1">
                                            Currently Broadcasting
                                        </div>
                                        <div className="flex flex-wrap gap-1 mb-2">
                                            {activeNotification.targetGender !== 'All' && <span className="px-2 py-0.5 bg-black/10 rounded-md text-[9px] font-bold uppercase">{activeNotification.targetGender}</span>}
                                            {activeNotification.targetSubscription !== 'All' && <span className="px-2 py-0.5 bg-black/10 rounded-md text-[9px] font-bold uppercase">{activeNotification.targetSubscription}</span>}
                                            {activeNotification.targetCommunity !== 'All' && <span className="px-2 py-0.5 bg-black/10 rounded-md text-[9px] font-bold uppercase">{activeNotification.targetCommunity}</span>}
                                            {activeNotification.targetProfileStatus !== 'All' && <span className="px-2 py-0.5 bg-black/10 rounded-md text-[9px] font-bold uppercase">{activeNotification.targetProfileStatus}</span>}
                                            {(activeNotification.targetGender === 'All' && activeNotification.targetSubscription === 'All' && activeNotification.targetCommunity === 'All' && activeNotification.targetProfileStatus === 'All') && (
                                                <span className="px-2 py-0.5 bg-black/10 rounded-md text-[9px] font-bold uppercase">All Users</span>
                                            )}
                                        </div>
                                        <p className="text-sm font-medium leading-relaxed">
                                            {activeNotification.message}
                                        </p>
                                    </div>
                                </div>
                                
                                <div className="mt-auto pt-4 border-t border-black/5 flex flex-col sm:flex-row items-center justify-between gap-4">
                                    <div className="text-[10px] font-bold opacity-60">
                                        Posted on {new Date(activeNotification.createdAt).toLocaleDateString()}
                                    </div>
                                    <button
                                        onClick={handleDisable}
                                        disabled={isLoading}
                                        className="flex items-center gap-1.5 px-4 py-2 bg-white/50 hover:bg-white text-rose-600 rounded-lg text-xs font-bold transition-colors"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                        Revoke Announcement
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center py-12 text-center px-4 bg-slate-50 rounded-2xl border border-slate-100 border-dashed">
                                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                                    <Bell className="w-6 h-6 text-slate-300" />
                                </div>
                                <h4 className="text-slate-700 font-bold mb-1">No Active Announcements</h4>
                                <p className="text-slate-500 text-sm">
                                    There are currently no active announcements being shown to users.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminNotificationManagement;
