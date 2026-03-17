import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Check, X, Loader2, Eye, AlertTriangle, ChevronLeft, ChevronRight } from 'lucide-react';
import { useConfirm } from '../ConfirmContext';
import api from '../../services/api';

const SubscriptionManagement = () => {
    const [payments, setPayments] = useState([]);
    const confirm = useConfirm();
    const [recentPayments, setRecentPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingRecent, setLoadingRecent] = useState(false);
    const [processingId, setProcessingId] = useState(null);
    const [verifyModal, setVerifyModal] = useState(null); // { id, planViews, reject: boolean }
    const [overrideViews, setOverrideViews] = useState('');
    const [adminNotes, setAdminNotes] = useState('');

    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalRecords, setTotalRecords] = useState(0);

    const [manualPayments, setManualPayments] = useState([]);
    const [loadingManual, setLoadingManual] = useState(false);
    const [manualPage, setManualPage] = useState(1);
    const [totalManualPages, setTotalManualPages] = useState(1);
    const [totalManualRecords, setTotalManualRecords] = useState(0);

    useEffect(() => {
        fetchPendingPayments();
    }, []);

    useEffect(() => {
        fetchRecentPayments(page);
    }, [page]);

    useEffect(() => {
        fetchManualPayments(manualPage);
    }, [manualPage]);

    const fetchPendingPayments = async () => {
        setLoading(true);
        try {
            const res = await api.get('/subscriptions/admin/pending');
            if (res.success) {
                setPayments(res.data);
            }
        } catch (error) {
            console.error('Fetch pending error:', error);
            toast.error('Failed to fetch pending payments');
        } finally {
            setLoading(false);
        }
    };

    const fetchRecentPayments = async (pageNum) => {
        setLoadingRecent(true);
        try {
            const res = await api.get(`/subscriptions/admin/recent-approved?page=${pageNum}&limit=10`);
            if (res.success) {
                setRecentPayments(res.data);
                setTotalPages(res.totalPages || Math.ceil((res.totalRecords || res.data.length) / 10) || 1);
                setTotalRecords(res.totalRecords || res.data.length);
            }
        } catch (error) {
            console.error('Fetch recent error:', error);
            toast.error('Failed to fetch recent payments');
        } finally {
            setLoadingRecent(false);
        }
    };

    const fetchManualPayments = async (pageNum) => {
        setLoadingManual(true);
        try {
            const res = await api.get(`/subscriptions/admin/manual-approved?page=${pageNum}&limit=10`);
            if (res.success) {
                setManualPayments(res.data);
                setTotalManualPages(res.totalPages || Math.ceil((res.totalRecords || res.data.length) / 10) || 1);
                setTotalManualRecords(res.totalRecords || res.data.length);
            }
        } catch (error) {
            console.error('Fetch manual error:', error);
            toast.error('Failed to fetch manual payments');
        } finally {
            setLoadingManual(false);
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
                if (status === 'approved') {
                    if (page === 1) fetchRecentPayments(1);
                    else setPage(1);
                }
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

    if (payments.length === 0 && recentPayments.length === 0) {
        return (
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-12 text-center shadow-sm border border-slate-200 dark:border-slate-700">
                <Check className="w-16 h-16 text-green-500 mx-auto mb-4 bg-green-50 dark:bg-green-900/20 rounded-full p-3" />
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">All Caught Up!</h3>
                <p className="text-slate-500">No pending or recent payment requests at the moment.</p>
            </div>
        );
    }

    return (
        <div className="space-y-12">
            {/* Pending Payments Section */}
            <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-3">
                    Pending Approvals
                    <span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-semibold rounded-full border border-slate-200 dark:border-slate-700">
                        {payments.length} {payments.length === 1 ? 'Record' : 'Records'}
                    </span>
                </h2>
                {payments.length === 0 ? (
                    <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 text-center shadow-sm border border-slate-200 dark:border-slate-700">
                        <Check className="w-12 h-12 text-green-500 mx-auto mb-3 bg-green-50 dark:bg-green-900/20 rounded-full p-2" />
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">No pending requests</h3>
                    </div>
                ) : (
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
                                                {payment.userId?.firstName && payment.userId?.lastName ? `${payment.userId.firstName} ${payment.userId.lastName}` : (payment.userId?.email || 'Unknown User')}
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
                                            onClick={() => {
                                                setVerifyModal({ id: payment._id, planViews: payment.planViews });
                                                setOverrideViews((payment.planViews || '').toString());
                                            }}
                                            className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                                        >
                                            <Check className="w-4 h-4" /> Approve
                                        </button>
                                        <button
                                            onClick={async () => {
                                                const rejectConfirmed = await confirm({
                                                    message: 'Are you sure you want to reject this payment?',
                                                    type: 'danger'
                                                });
                                                if (rejectConfirmed) {
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
                )}
            </div>

            {/* Recent Approved Payments Section */}
            {recentPayments.length > 0 && (
                <div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-3">
                        All Approved Subscriptions
                        <span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-semibold rounded-full border border-slate-200 dark:border-slate-700">
                            {totalRecords} {totalRecords === 1 ? 'Record' : 'Records'}
                        </span>
                    </h2>

                    {loadingRecent ? (
                        <div className="flex justify-center p-8">
                            <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
                        </div>
                    ) : (
                        <div className="grid gap-6">
                            {recentPayments.map((payment) => (
                                <div key={payment._id} className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 flex flex-col lg:flex-row gap-6 opacity-75 hover:opacity-100 transition-opacity">
                                    {/* Screenshot */}
                                    <div className="lg:w-1/4 flex-shrink-0">
                                        <div className="relative group cursor-pointer" onClick={() => window.open(payment.screenshotUrl, '_blank')}>
                                            <img
                                                src={payment.screenshotUrl}
                                                alt="Payment Screenshot"
                                                className="w-full h-48 object-cover rounded-lg border border-slate-200 dark:border-slate-700 grayscale group-hover:grayscale-0 transition-all"
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
                                                    {payment.userId?.firstName && payment.userId?.lastName ? `${payment.userId.firstName} ${payment.userId.lastName}` : (payment.userId?.email || 'Unknown User')}
                                                </h3>
                                                <p className="text-slate-500 text-sm">{payment.userId?.email}</p>
                                                <p className="text-xs text-slate-400 font-mono mt-1">ID: {payment.userId?._id}</p>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-2xl font-bold text-primary-600">₹{payment.amount}</div>
                                                <div className="inline-flex flex-col items-end mt-1">
                                                    <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 capitalize">
                                                        <Check className="w-3 h-3 mr-1" /> Approved
                                                    </div>
                                                    <span className="text-xs font-bold text-slate-600 dark:text-slate-400 mt-2">
                                                        {payment.grantedViews || payment.planViews} Views Granted
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 dark:bg-slate-900/50 p-4 rounded-lg">
                                            <div>
                                                <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Transaction ID</span>
                                                <p className="text-slate-900 dark:text-slate-200 font-mono font-medium">{payment.transactionDetails}</p>
                                            </div>
                                            <div>
                                                <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Approved At</span>
                                                <p className="text-slate-900 dark:text-slate-200 text-sm">
                                                    {new Date(payment.processedAt || payment.updatedAt).toLocaleString()}
                                                </p>
                                            </div>
                                        </div>

                                        {payment.adminNotes && (
                                            <div className="bg-slate-50 dark:bg-slate-900/50 p-3 rounded-lg border border-slate-200 dark:border-slate-700">
                                                <span className="text-xs text-slate-500 font-semibold block mb-1">Admin Notes:</span>
                                                <p className="text-sm text-slate-700 dark:text-slate-300">{payment.adminNotes}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="mt-8 flex justify-center items-center gap-2">
                            <button
                                onClick={() => { setPage(p => Math.max(1, p - 1)); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                                disabled={page === 1}
                                className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <ChevronLeft className="w-5 h-5 text-slate-500" />
                            </button>
                            <span className="text-sm font-medium text-slate-700 dark:text-slate-300 px-4">
                                Page {page} of {totalPages}
                            </span>
                            <button
                                onClick={() => { setPage(p => Math.min(totalPages, p + 1)); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                                disabled={page === totalPages}
                                className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <ChevronRight className="w-5 h-5 text-slate-500" />
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* Manual Approved Payments Section */}
            <div className="mt-12 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 flex flex-col animate-fade-in">
                <div className="mb-6 flex justify-between items-center">
                    <div>
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <span className="bg-indigo-100 dark:bg-indigo-900/30 p-2 rounded-lg">
                                <Check className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                            </span>
                            Approved without payment
                        </h2>
                        <p className="text-slate-500 text-sm mt-1">Users granted unlocks manually by Admins.</p>
                    </div>
                </div>

                {loadingManual ? (
                    <div className="flex justify-center p-8">
                        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
                    </div>
                ) : manualPayments.length === 0 ? (
                    <div className="text-center py-12 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-dashed border-slate-300 dark:border-slate-700">
                        <Check className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                        <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-1">No manual grants</h3>
                        <p className="text-slate-500">No users have been manually granted access.</p>
                    </div>
                ) : (
                    <div className="grid gap-6">
                        {manualPayments.map((payment) => (
                            <div key={payment._id} className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 flex flex-col gap-4 opacity-75 hover:opacity-100 transition-opacity">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="font-bold text-lg text-slate-900 dark:text-white">
                                            {payment.userId?.firstName && payment.userId?.lastName ? `${payment.userId.firstName} ${payment.userId.lastName}` : (payment.userId?.email || 'Unknown User')}
                                        </h3>
                                        <p className="text-slate-500 text-sm">{payment.userId?.email}</p>
                                    </div>
                                    <div className="text-right">
                                        <div className="inline-flex flex-col items-end">
                                            <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300">
                                                Manually Granted
                                            </div>
                                            <div className="text-sm font-bold text-slate-600 dark:text-slate-400 mt-2">
                                                {payment.grantedViews || payment.planViews} Views Granted
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 dark:bg-slate-900/50 p-4 rounded-lg">
                                    <div>
                                        <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Granted By</span>
                                        <p className="text-slate-900 dark:text-slate-200 mt-1">
                                            {payment.adminId?.firstName} {payment.adminId?.lastName}
                                        </p>
                                    </div>
                                    <div>
                                        <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Granted At</span>
                                        <p className="text-slate-900 dark:text-slate-200 mt-1">
                                            {new Date(payment.createdAt).toLocaleString()}
                                        </p>
                                    </div>
                                </div>

                                {payment.adminNotes && (
                                    <div className="bg-slate-50 dark:bg-slate-900/50 p-3 rounded-lg border border-slate-200 dark:border-slate-700">
                                        <span className="text-xs text-slate-500 font-semibold block mb-1">Admin Notes:</span>
                                        <p className="text-sm text-slate-700 dark:text-slate-300">{payment.adminNotes}</p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {totalManualPages > 1 && (
                    <div className="mt-8 flex justify-center items-center gap-2">
                        <button
                            onClick={() => { setManualPage(p => Math.max(1, p - 1)); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                            disabled={manualPage === 1}
                            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <ChevronLeft className="w-5 h-5 text-slate-500" />
                        </button>
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300 px-4">
                            Page {manualPage} of {totalManualPages}
                        </span>
                        <button
                            onClick={() => { setManualPage(p => Math.min(totalManualPages, p + 1)); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                            disabled={manualPage === totalManualPages}
                            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <ChevronRight className="w-5 h-5 text-slate-500" />
                        </button>
                    </div>
                )}
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
                                        type="text"
                                        inputMode="numeric"
                                        value={overrideViews}
                                        onChange={(e) => {
                                            let val = e.target.value.replace(/[^0-9]/g, '');
                                            if (val.length > 3) val = val.slice(0, 3);
                                            if (val !== '' && parseInt(val) > 999) val = "999";
                                            setOverrideViews(val);
                                        }}
                                        className="input pr-16"
                                        placeholder="e.g. 50"
                                    />
                                    <span className="absolute right-3 top-2.5 text-sm text-slate-400">
                                        views
                                    </span>
                                </div>
                                <p className="text-xs text-green-600 mt-2 flex items-center gap-1 font-semibold">
                                    <AlertTriangle className="w-3 h-3" />
                                    (Max you can give {verifyModal.planViews > 999 ? verifyModal.planViews : '999'} profiles to unlock if you override number)
                                </p>
                                {overrideViews && Number(overrideViews) !== Number(verifyModal.planViews) && (
                                    <p className="text-xs text-rose-500 mt-2 font-semibold bg-rose-50 p-2 rounded border border-rose-100">
                                        Warning: You are overriding the subscribed limit. The user is entitled to only {verifyModal.planViews} profiles as per the current subscription payment.
                                    </p>
                                )}
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
        </div>
    );
};

export default SubscriptionManagement;
