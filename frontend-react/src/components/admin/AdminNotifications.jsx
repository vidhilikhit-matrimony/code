import React, { useState, useEffect, useMemo } from 'react';
import { toast } from 'sonner';
import { MessageSquare, Plus, Trash2, Edit3, Circle, CheckCircle2 } from 'lucide-react';
import api from '../../services/api';

const AdminNotifications = () => {
    const [notifications, setNotifications] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form state
    const [editId, setEditId] = useState(null);
    const [messageDraft, setMessageDraft] = useState('');
    const [isActiveDraft, setIsActiveDraft] = useState(false); // Only used when drafting a new message

    // Active tracking for the radio button group
    const activeNotificationId = useMemo(() => {
        const activeNotif = notifications.find(n => n.isActive);
        return activeNotif ? activeNotif._id : 'none';
    }, [notifications]);

    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        setIsLoading(true);
        try {
            const response = await api.get('/notifications');
            if (response.success) {
                setNotifications(response.data);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to fetch notifications');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        if (!messageDraft.trim()) {
            toast.error('Message cannot be empty');
            return;
        }

        setIsSubmitting(true);
        try {
            if (editId) {
                // Update existing
                const response = await api.put(`/notifications/${editId}`, { message: messageDraft });
                if (response.success) {
                    toast.success('Message updated');
                }
            } else {
                // Create new
                const response = await api.post('/notifications', {
                    message: messageDraft,
                    isActive: isActiveDraft
                });
                if (response.success) {
                    toast.success('Message drafted successfully');
                }
            }
            // Reset form and refresh
            setEditId(null);
            setMessageDraft('');
            setIsActiveDraft(false);
            fetchNotifications();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to save message');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEditClick = (notif) => {
        setEditId(notif._id);
        setMessageDraft(notif.message);
        setIsActiveDraft(notif.isActive); // In case they are editing an active one, not strictly needed for PUT but good for consistency
    };

    const handleCancelEdit = () => {
        setEditId(null);
        setMessageDraft('');
        setIsActiveDraft(false);
    };

    const handleRadioChange = async (id) => {
        try {
            if (id === 'none') {
                // User selected "None", meaning disable all
                const response = await api.patch('/notifications/disable-all');
                if (response.success) {
                    toast.success('All global notifications have been disabled.');
                    fetchNotifications();
                }
            } else {
                // Turn on the selected notification (and backend handles turning off others)
                const response = await api.patch(`/notifications/${id}/toggle`, { isActive: true });
                if (response.success) {
                    toast.success('Notification successfully enabled for all users!');
                    fetchNotifications();
                }
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to apply setting');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this notification draft?')) return;

        try {
            const response = await api.delete(`/notifications/${id}`);
            if (response.success) {
                toast.success('Notification deleted');
                fetchNotifications();
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to delete notification');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-indigo-50 dark:bg-indigo-500/10 rounded-lg">
                    <MessageSquare className="w-6 h-6 text-indigo-500" />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">Global Announcements</h2>
                    <p className="text-sm text-slate-500">Draft customized alerts and select which one to show to your users at login.</p>
                </div>
            </div>

            {/* Editor Card */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
                <h3 className="font-bold text-lg mb-4 text-slate-900 dark:text-white">
                    {editId ? 'Edit Draft' : 'Draft New Message'}
                </h3>
                <form onSubmit={handleSave} className="space-y-4">
                    <div>
                        <textarea
                            value={messageDraft}
                            onChange={(e) => setMessageDraft(e.target.value)}
                            rows={3}
                            placeholder="e.g. System maintenance scheduled for Sunday at midnight."
                            className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all resize-none"
                            required
                        />
                    </div>

                    {!editId && (
                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="makeActive"
                                checked={isActiveDraft}
                                onChange={(e) => setIsActiveDraft(e.target.checked)}
                                className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                            />
                            <label htmlFor="makeActive" className="text-sm text-slate-700 dark:text-slate-300">
                                Set this message as "Active" immediately upon saving
                            </label>
                        </div>
                    )}

                    <div className="flex gap-3 pt-2">
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 disabled:opacity-70 shadow-sm"
                        >
                            <Plus className="w-4 h-4" />
                            {isSubmitting ? 'Saving...' : (editId ? 'Update Message' : 'Save Message')}
                        </button>
                        {editId && (
                            <button
                                type="button"
                                onClick={handleCancelEdit}
                                className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 px-6 py-2 rounded-lg font-medium transition-colors"
                            >
                                Cancel
                            </button>
                        )}
                    </div>
                </form>
            </div>

            {/* List Card */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 flex justify-between items-center">
                    <h3 className="font-bold text-slate-900 dark:text-white">Active Message Display</h3>
                    <p className="text-xs text-slate-500">Only one selection is allowed.</p>
                </div>

                {isLoading ? (
                    <div className="p-8 flex justify-center">
                        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : (
                    <div className="divide-y divide-slate-100 dark:divide-slate-700">
                        {/* The "None" Radio Button */}
                        <div
                            onClick={() => handleRadioChange('none')}
                            className={`p-6 flex flex-col sm:flex-row gap-4 justify-between transition-colors cursor-pointer ${activeNotificationId === 'none' ? 'bg-indigo-50/50 dark:bg-indigo-900/10' : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}
                        >
                            <div className="flex-1 flex gap-4 items-center pl-2">
                                <div className="text-indigo-600 shrink-0">
                                    {activeNotificationId === 'none' ? <CheckCircle2 className="w-6 h-6 text-indigo-600" /> : <Circle className="w-6 h-6 text-slate-300 dark:text-slate-600" />}
                                </div>
                                <div className="font-medium text-slate-800 dark:text-white text-lg">
                                    None
                                </div>
                            </div>
                            <div className="text-sm text-slate-500 flex items-center pr-2">
                                Default (Do not display any notification to users)
                            </div>
                        </div>

                        {notifications.length === 0 && (
                            <div className="p-8 text-center text-slate-500 bg-slate-50/50 dark:bg-slate-900/50">
                                <p>You haven't drafted any custom messages yet.</p>
                            </div>
                        )}

                        {notifications.map((notif) => (
                            <div
                                key={notif._id}
                                className={`p-6 flex flex-col sm:flex-row gap-4 justify-between transition-colors ${notif.isActive ? 'bg-indigo-50/50 dark:bg-indigo-900/10' : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}
                            >
                                <div
                                    className="flex-1 flex gap-4 items-start pl-2 cursor-pointer"
                                    onClick={() => handleRadioChange(notif._id)}
                                >
                                    <div className="text-indigo-600 shrink-0 mt-0.5">
                                        {notif.isActive ? <CheckCircle2 className="w-6 h-6 text-indigo-600" /> : <Circle className="w-6 h-6 text-slate-300 dark:text-slate-600" />}
                                    </div>
                                    <div className="space-y-1">
                                        <p className={`text-slate-800 dark:text-slate-200 text-base ${notif.isActive ? 'font-medium' : ''}`}>
                                            {notif.message}
                                        </p>
                                        <div className="text-xs text-slate-400">
                                            Created: {new Date(notif.createdAt).toLocaleDateString()}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 sm:self-center shrink-0 pr-2 pt-2 sm:pt-0 pl-10 sm:pl-0">
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleEditClick(notif); }}
                                        className="p-2 text-slate-400 hover:text-indigo-600 bg-white dark:bg-slate-800 hover:bg-indigo-50 rounded-lg border border-slate-200 transition-colors"
                                        title="Edit Draft"
                                    >
                                        <Edit3 className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleDelete(notif._id); }}
                                        className="p-2 text-slate-400 hover:text-rose-600 bg-white dark:bg-slate-800 hover:bg-rose-50 rounded-lg border border-slate-200 transition-colors"
                                        title="Delete Draft"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminNotifications;
