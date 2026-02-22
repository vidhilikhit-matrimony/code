import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Check, X, Loader2, Eye, AlertTriangle } from 'lucide-react';
import api from '../../services/api';

const SubscriptionManagement = () => {
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState(null);
    const [verifyModal, setVerifyModal] = useState(null); // { id, planViews, reject: boolean }
    const [overrideViews, setOverrideViews] = useState('');
    const [adminNotes, setAdminNotes] = useState('');

    useEffect(() => {
        fetchPayments();
    }, []);

    const fetchPayments = async () => {
        try {
            const response = await api.get('/subscriptions/admin/pending');
            if (response.success) {
                setPayments(response.data);
            }
        } catch (error) {
            console.error('Fetch payments error:', error);
            toast.error('Failed to fetch pending payments');
        } finally {
            setLoading(false);
        }
    };

    const handleVerify = async (status) => {
        if (!verifyModal) return;

        setProcessingId(verifyModal.id);
        try {
            const response = await api.post(`/subscriptions/admin/verify/${verifyModal.id}`, {
                status,
                adminNotes,
                overrideViews: status === 'approved' && overrideViews ? overrideViews : undefined
            });

            if (response.success) {
                toast.success(response.message);
                setPayments(prev => prev.filter(p => p._id !== verifyModal.id));
                setVerifyModal(null);
                setOverrideViews('');
                setAdminNotes('');
            } else {
                toast.error(response.message);
            }
        } catch (error) {
            console.error('Verify payment error:', error);
            toast.error('Failed to verify payment');
        } finally {
            setProcessingId(null);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center p-8">
                <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
            </div>
        );
    }

    if (payments.length === 0) {
        return (
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-12 text-center shadow-sm border border-slate-200 dark:border-slate-700">
                <Check className="w-16 h-16 text-green-500 mx-auto mb-4 bg-green-50 dark:bg-green-900/20 rounded-full p-3" />
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">All Caught Up!</h3>
                <p className="text-slate-500">No pending payment requests at the moment.</p>
            </div>
        );
    }

    return (
        <>
            <div className="grid gap-6">
                {payments.map((payment) => (
                    <div key={payment._id} className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 flex flex-col lg:flex-row gap-6">
                        {/* Screenshot */}
                        <div className="lg:w-1/4 flex-shrink-0">
                            <div className="relative group cursor-pointer" onClick={() => window.open(payment.screenshotUrl, '_blank')}>
                                <img
                                    src={payment.screenshotUrl}
                                    alt="Payment Screenshot"
                                    className="w-full h-48 object-cover rounded-lg border border-slate-200 dark:border-slate-700"
                                />
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-lg">
                                    <Eye className="w-6 h-6 text-white" />
                                    <span className="text-white ml-2 font-medium">View Full</span>
                                </div>
                            </div>
                        </div>

                        {/* Details */}
                        <div className="flex-1 space-y-4">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="font-bold text-lg text-slate-900 dark:text-white">
                                        {payment.userId?.username || 'Unknown User'}
                                    </h3>
                                    <p className="text-slate-500 text-sm">{payment.userId?.email}</p>
                                    <p className="text-xs text-slate-400 font-mono mt-1">ID: {payment.userId?._id}</p>
                                </div>
                                <div className="text-right">
                                    <div className="text-2xl font-bold text-primary-600">₹{payment.amount}</div>
                                    <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 capitalize mt-1">
                                        {payment.planId} Plan
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 dark:bg-slate-900/50 p-4 rounded-lg">
                                <div>
                                    <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Transaction ID</span>
                                    <p className="text-slate-900 dark:text-slate-200 font-mono font-medium">{payment.transactionDetails}</p>
                                </div>
                                <div>
                                    <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Requested At</span>
                                    <p className="text-slate-900 dark:text-slate-200 text-sm">
                                        {new Date(payment.requestedAt).toLocaleString()}
                                    </p>
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-3 pt-2">
                                <button
                                    onClick={() => setVerifyModal({ id: payment._id, planViews: payment.planViews })}
                                    className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                                >
                                    <Check className="w-4 h-4" /> Approve
                                </button>
                                <button
                                    onClick={() => {
                                        if (window.confirm('Are you sure you want to reject this payment?')) {
                                            setVerifyModal({ id: payment._id, reject: true });
                                        }
                                    }}
                                    className="flex-1 bg-red-100 hover:bg-red-200 text-red-700 dark:bg-red-900/20 dark:hover:bg-red-900/30 dark:text-red-300 px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                                >
                                    <X className="w-4 h-4" /> Reject
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Verification Modal */}
            {verifyModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-md p-6 animate-in fade-in zoom-in duration-200">
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
                            {verifyModal.reject ? 'Reject Payment' : 'Approve Payment'}
                        </h3>

                        {!verifyModal.reject && (
                            <div className="mb-4">
                                <label className="label mb-2 block">
                                    Profiles to Unlock
                                </label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        value={overrideViews || verifyModal.planViews}
                                        onChange={(e) => setOverrideViews(e.target.value)}
                                        className="input pr-16"
                                        min="1"
                                    />
                                    <span className="absolute right-3 top-2.5 text-sm text-slate-400">
                                        views
                                    </span>
                                </div>
                                <p className="text-xs text-slate-500 mt-2 flex items-center gap-1">
                                    <AlertTriangle className="w-3 h-3" />
                                    Default for this plan is {verifyModal.planViews}. You can override this value.
                                </p>
                            </div>
                        )}

                        <div className="mb-6">
                            <label className="label mb-2 block">
                                Admin Notes (Optional)
                            </label>
                            <textarea
                                value={adminNotes}
                                onChange={(e) => setAdminNotes(e.target.value)}
                                placeholder={verifyModal.reject ? "Reason for rejection..." : "Any internal notes..."}
                                className="input min-h-[80px]"
                            />
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => {
                                    setVerifyModal(null);
                                    setOverrideViews('');
                                    setAdminNotes('');
                                }}
                                className="flex-1 btn bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => handleVerify(verifyModal.reject ? 'rejected' : 'approved')}
                                disabled={processingId === verifyModal.id}
                                className={`flex-1 btn ${verifyModal.reject ? 'bg-red-600 hover:bg-red-700 text-white' : 'btn-primary'}`}
                            >
                                {processingId === verifyModal.id ? (
                                    <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                                ) : (
                                    verifyModal.reject ? 'Confirm Reject' : 'Confirm Approve'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default SubscriptionManagement;
