import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Search, Trash2, Eye, Loader2, ChevronLeft, ChevronRight, CheckCircle, XCircle, UserPlus, X, Power, Gift, AlertTriangle } from 'lucide-react';
import { useConfirm } from '../ConfirmContext';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import CustomSelect from '../common/CustomSelect';

const ProfileManagement = () => {
    const [profiles, setProfiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalRecords, setTotalRecords] = useState(0);
    const [search, setSearch] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [deleteLoading, setDeleteLoading] = useState(null);
    const [activatingLoading, setActivatingLoading] = useState(null);
    const confirm = useConfirm();
    const [editingUnlocks, setEditingUnlocks] = useState(null);
    const [updateLoading, setUpdateLoading] = useState(false);

    // Grant unlocks without payment
    const [grantModal, setGrantModal] = useState(null); // { userId, profileName }
    const [grantUnlocks, setGrantUnlocks] = useState('');
    const [grantNotes, setGrantNotes] = useState('');
    const [grantLoading, setGrantLoading] = useState(false);

    const navigate = useNavigate();
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [eligibleUsers, setEligibleUsers] = useState([]);
    const [loadingUsers, setLoadingUsers] = useState(false);

    const [viewMode, setViewMode] = useState('active'); // 'active' or 'inactive'

    useEffect(() => {
        fetchProfiles();
    }, [page, search, filterStatus, viewMode]);

    const fetchProfiles = async () => {
        setLoading(true);
        try {
            const queryParams = new URLSearchParams({
                page,
                limit: 10,
                ...(search && { search }),
                ...(filterStatus !== 'all' && { status: filterStatus }),
            });

            if (viewMode === 'active') queryParams.append('isActive', true);
            else if (viewMode === 'inactive') queryParams.append('isActive', false);
            else if (viewMode === 'renew-required') queryParams.append('renewRequired', true);

            const response = await api.get(`/admin/profiles?${queryParams}`);
            if (response.success) {
                setProfiles(response.data.profiles || response.data);
                setTotalPages(response.data.totalPages || response.totalPages);
                setTotalRecords(response.data.total || response.totalProfiles || 0);
            }
        } catch (error) {
            console.error('Error fetching profiles:', error);
            toast.error('Failed to fetch profiles');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (profileId) => {
        const confirmDelete = await confirm({
            message: 'Are you sure you want to permanently delete this profile? This action cannot be undone.',
            type: 'danger'
        });

        if (!confirmDelete) return;

        setDeleteLoading(profileId);
        try {
            const response = await api.delete(`/profiles/${profileId}`);
            if (response.success) {
                toast.success('Profile deleted successfully');
                setProfiles(profiles.filter(p => p._id !== profileId));
            }
        } catch (error) {
            console.error('Error deleting profile:', error);
            toast.error('Failed to delete profile');
        } finally {
            setDeleteLoading(null);
        }
    };

    const handleToggleProfileStatus = async (profile) => {
        const isCurrentlyActive = profile.isActive;
        const newStatus = !isCurrentlyActive;
        const actionText = newStatus ? 'activate' : 'deactivate (hide)';

        const confirmToggle = await confirm({
            message: `Are you sure you want to ${actionText} this profile?`,
            type: isCurrentlyActive ? 'warning' : 'info'
        });

        if (!confirmToggle) return;

        const userId = profile.userId?._id || profile.userId;
        console.log("Extracted userId:", userId);

        if (!userId) {
            toast.error(`Cannot ${actionText}: User ID is missing from profile data.`);
            return;
        }

        setActivatingLoading(profile._id);

        try {
            const response = await api.put(`/admin/users/${userId}/status`, { isActive: newStatus });

            if (response.success) {
                toast.success(`Profile ${newStatus ? 'activated' : 'deactivated'} successfully`);

                if ((viewMode === 'inactive' && newStatus) || (viewMode === 'active' && !newStatus)) {
                    setProfiles(profiles.filter(p => p._id !== profile._id));
                } else {
                    setProfiles(profiles.map(p =>
                        p._id === profile._id
                            ? { ...p, isActive: newStatus, inactiveDate: newStatus ? null : new Date().toISOString() }
                            : p
                    ));
                }
            } else {
                toast.error(response.message || `Failed to ${actionText} profile`);
            }
        } catch (error) {
            toast.error(error.message || `Failed to ${actionText} profile`);
        } finally {
            setActivatingLoading(null);
        }
    };

    const handleGrantUnlocks = async () => {
        if (!grantModal) return;
        const unlocks = parseInt(grantUnlocks);
        if (!unlocks || unlocks <= 0) return toast.error('Enter a valid number of unlocks');

        setGrantLoading(true);
        try {
            const res = await api.post('/admin/subscriptions/grant', {
                userId: grantModal.userId,
                unlocksToAdd: unlocks,
                adminNotes: grantNotes.trim()
            });

            if (res.success) {
                toast.success(res.message);
                // Update the profile's unlocksLeft count locally
                setProfiles(prev => prev.map(p =>
                    (p.userId?._id || p.userId) === grantModal.userId
                        ? { ...p, unlocksLeft: (p.unlocksLeft || 0) + unlocks, hasSubscription: true }
                        : p
                ));
                setGrantModal(null);
                setGrantUnlocks('');
                setGrantNotes('');
            } else {
                toast.error(res.message || 'Failed to grant unlocks');
            }
        } catch (error) {
            toast.error(error?.message || 'Failed to grant unlocks');
        } finally {
            setGrantLoading(false);
        }
    };

    const handleUpdateUnlocks = async (profileId, subscriptionId) => {
        if (!subscriptionId) {
            toast.error('User does not have an active subscription');
            setEditingUnlocks(null);
            return;
        }

        setUpdateLoading(true);
        try {
            const response = await api.put(`/admin/subscriptions/${subscriptionId}/unlocks`, {
                unlocksLeft: parseInt(editingUnlocks.value) || 0
            });

            if (response.success) {
                toast.success('Unlocks updated successfully');
                setProfiles(profiles.map(p =>
                    p._id === profileId
                        ? { ...p, unlocksLeft: parseInt(editingUnlocks.value) || 0 }
                        : p
                ));
            }
        } catch (error) {
            console.error('Error updating unlocks:', error);
            toast.error('Failed to update unlocks');
        } finally {
            setUpdateLoading(false);
            setEditingUnlocks(null);
        }
    };

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            setPage(1);
        }, 500);
        return () => clearTimeout(timer);
    }, [search]);

    // Reset pagination when view mode changes
    useEffect(() => {
        setPage(1);
    }, [viewMode]);

    const handleOpenCreateModal = async () => {
        setShowCreateModal(true);
        setLoadingUsers(true);
        try {
            // Fetch all users to find those without profiles
            // We'll use the existing /admin/users endpoint with a large limit
            const response = await api.get('/admin/users?limit=1000');
            if (response.success) {
                // Filter out admins and users who already have profiles
                // We'll approximate this by checking if the user._id exists in our current profiles list
                // For a robust solution, the backend should return a hasProfile flag
                // Since this might not be there, we'll just show all active users for now
                // The backend create endpoint will handle if they already have one
                const users = response.data.filter(u => u.isActive && u.role === 'user');
                setEligibleUsers(users);
            }
        } catch (error) {
            console.error('Error fetching users:', error);
            toast.error('Failed to load eligible users');
        } finally {
            setLoadingUsers(false);
        }
    };

    const handleSelectUserForProfile = (userId) => {
        setShowCreateModal(false);
        navigate(`/create-profile?adminUserId=${userId}`);
    };

    return (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
            {/* Header / Search / Filter */}
            <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex items-center justify-between w-full md:w-auto gap-4 flex-wrap">
                    <div className="flex items-center gap-3">
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Profile Management</h2>
                        <span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-semibold rounded-full border border-slate-200 dark:border-slate-700">
                            {totalRecords} {totalRecords === 1 ? 'Record' : 'Records'}
                        </span>
                    </div>
                    <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-lg">
                        <button
                            onClick={() => setViewMode('active')}
                            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${viewMode === 'active'
                                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                                }`}
                        >
                            Active Profiles
                        </button>
                        <button
                            onClick={() => setViewMode('inactive')}
                            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${viewMode === 'inactive'
                                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                                }`}
                        >
                            Inactive Profiles
                        </button>
                        <button
                            onClick={() => setViewMode('renew-required')}
                            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${viewMode === 'renew-required'
                                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                                }`}
                        >
                            Renew Required
                        </button>
                    </div>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto mt-4 md:mt-0 justify-between md:justify-end">
                    <button
                        onClick={handleOpenCreateModal}
                        className="flex items-center gap-2 px-3 py-1.5 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg transition-colors"
                    >
                        <UserPlus className="w-4 h-4" />
                        <span className="hidden sm:inline">Create Profile</span>
                    </button>
                </div>
            </div>

            {/* Filters Area */}
            <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex flex-col md:flex-row justify-between items-center gap-4 bg-slate-50/50 dark:bg-slate-800/50">
                <div className="flex gap-3 w-full md:w-auto">
                    <CustomSelect
                        name="filterStatus"
                        value={filterStatus}
                        onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }}
                        options={[
                            { value: 'all', label: 'All Profiles' },
                            { value: 'published', label: 'Published' },
                            { value: 'unpublished', label: 'Unpublished' }
                        ]}
                        placeholder="All Profiles"
                        className="w-full md:w-48"
                    />

                    <div className="relative w-full md:w-64">
                        <input
                            type="text"
                            placeholder="Search name or ID..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                        />
                        <Search className="w-5 h-5 text-slate-400 absolute left-3 top-2.5" />
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider">
                        <tr>
                            <th className="px-6 py-3 font-semibold">Profile</th>
                            <th className="px-6 py-3 font-semibold">Code</th>
                            <th className="px-6 py-3 font-semibold">Status</th>
                            {(viewMode === 'active' || viewMode === 'inactive' || viewMode === 'renew-required') && (
                                <th className="px-6 py-3 font-semibold">Date</th>
                            )}
                            <th className="px-6 py-3 font-semibold">Created By</th>
                            <th className="px-6 py-3 font-semibold">Unlocks Left</th>
                            <th className="px-6 py-3 font-semibold text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                        {loading ? (
                            <tr>
                                <td colSpan="5" className="px-6 py-8 text-center">
                                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-primary-500" />
                                </td>
                            </tr>
                        ) : profiles.length === 0 ? (
                            <tr>
                                <td colSpan="5" className="px-6 py-8 text-center text-slate-500">
                                    No profiles found matching your criteria.
                                </td>
                            </tr>
                        ) : (
                            (() => {
                                let lastDate = null;
                                const rows = [];

                                profiles.forEach((profile) => {
                                    if (viewMode === 'inactive') {
                                        const dateStr = profile.inactiveDate
                                            ? new Date(profile.inactiveDate).toLocaleDateString()
                                            : profile.deletedAt
                                                ? new Date(profile.deletedAt).toLocaleDateString()
                                                : 'Unknown Date';

                                        if (dateStr !== lastDate) {
                                            const countForDate = profiles.filter(p => {
                                                const d = p.inactiveDate
                                                    ? new Date(p.inactiveDate).toLocaleDateString()
                                                    : p.deletedAt
                                                        ? new Date(p.deletedAt).toLocaleDateString()
                                                        : 'Unknown Date';
                                                return d === dateStr;
                                            }).length;

                                            rows.push(
                                                <tr key={`date-${dateStr}`} className="bg-slate-100 dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700">
                                                    <td colSpan="6" className="px-6 py-3 text-sm font-semibold text-slate-700 dark:text-slate-300">
                                                        {dateStr !== 'Unknown Date'
                                                            ? `On ${dateStr}, ${countForDate} user${countForDate !== 1 ? 's' : ''} deleted their profile`
                                                            : `${countForDate} user${countForDate !== 1 ? 's' : ''} blocked/inactive with unknown date`
                                                        }
                                                    </td>
                                                </tr>
                                            );
                                            lastDate = dateStr;
                                        }
                                    }

                                    rows.push(
                                        <tr key={profile._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    {profile.photos?.[0]?.url ? (
                                                        <img
                                                            src={profile.photos[0].url}
                                                            alt="Profile"
                                                            className="w-10 h-10 rounded-full object-cover border border-slate-200"
                                                        />
                                                    ) : (
                                                        <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-500">
                                                            {profile.firstName?.[0]}
                                                        </div>
                                                    )}
                                                    <div>
                                                        <p className="font-medium text-slate-900 dark:text-white">{profile.firstName}</p>
                                                        <p className="text-xs text-slate-500">{new Date(profile.createdAt).toLocaleDateString()}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 font-mono text-sm text-slate-600 dark:text-slate-300">
                                                {profile.profileCode}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex gap-2">
                                                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${profile.isPublished
                                                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                                                        : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                                                        }`}>
                                                        {profile.isPublished ? <CheckCircle className="w-3 h-3" /> : <Loader2 className="w-3 h-3" />}
                                                        {profile.isPublished ? 'Published' : 'Draft'}
                                                    </span>

                                                    {!profile.isActive && profile.inactiveDate && (
                                                        <div className="flex flex-col gap-1 items-start mt-1">
                                                            <span className="text-[10px] text-slate-500 italic">
                                                                Since: {new Date(profile.inactiveDate || profile.deletedAt).toLocaleDateString()}
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            {(viewMode === 'active' || viewMode === 'inactive' || viewMode === 'renew-required') && (
                                                <td className="px-6 py-4 text-sm text-slate-500">
                                                    {viewMode === 'inactive' && (profile.inactiveDate || profile.deletedAt)
                                                        ? new Date(profile.inactiveDate || profile.deletedAt).toLocaleDateString()
                                                        : new Date(profile.createdAt).toLocaleDateString()
                                                    }
                                                </td>
                                            )}
                                            <td className="px-6 py-4 text-sm text-slate-500">
                                                {profile.userId?.email || 'N/A'}
                                            </td>
                                            <td className="px-6 py-4">
                                                {editingUnlocks?.id === profile._id ? (
                                                    <div className="flex items-center gap-2">
                                                        <input
                                                            type="text"
                                                            inputMode="numeric"
                                                            value={editingUnlocks.value}
                                                            onChange={(e) => {
                                                                const val = e.target.value.replace(/[^0-9]/g, '');
                                                                setEditingUnlocks({ ...editingUnlocks, value: val });
                                                            }}
                                                            className="w-16 px-2 py-1 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-sm"
                                                        />
                                                        <button
                                                            onClick={() => handleUpdateUnlocks(profile._id, profile.subscriptionId)}
                                                            disabled={updateLoading}
                                                            className="p-1 min-w-[28px] text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded flex items-center justify-center transition-colors disabled:opacity-50"
                                                        >
                                                            {updateLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span className="text-xs font-bold">Save</span>}
                                                        </button>
                                                        <button
                                                            onClick={() => setEditingUnlocks(null)}
                                                            disabled={updateLoading}
                                                            className="p-1 min-w-[28px] text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded flex items-center justify-center transition-colors disabled:opacity-50"
                                                        >
                                                            <span className="text-xs font-bold">Cancel</span>
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center gap-2">
                                                        <span className={`font-medium ${profile.hasSubscription ? 'text-primary-600 dark:text-primary-400' : 'text-slate-400'}`}>
                                                            {profile.unlocksLeft}
                                                        </span>
                                                        {profile.hasSubscription && (
                                                            <button
                                                                onClick={() => setEditingUnlocks({ id: profile._id, value: profile.unlocksLeft, subId: profile.subscriptionId })}
                                                                className="text-xs text-blue-500 hover:underline"
                                                            >
                                                                Edit
                                                            </button>
                                                        )}
                                                        {!profile.hasSubscription && (
                                                            <span className="text-xs text-slate-400">(No Sub)</span>
                                                        )}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-right flex justify-end gap-2">
                                                {/* Gift icon — only for active profiles */}
                                                {profile.isActive && (
                                                    <button
                                                        onClick={() => {
                                                            setGrantModal({
                                                                userId: profile.userId?._id || profile.userId,
                                                                profileName: profile.firstName
                                                            });
                                                            setGrantUnlocks('');
                                                            setGrantNotes('');
                                                        }}
                                                        className="p-2 text-violet-600 hover:bg-violet-50 dark:hover:bg-violet-900/20 rounded-lg transition-colors"
                                                        title="Grant Unlocks Without Payment"
                                                    >
                                                        <Gift className="w-4 h-4" />
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => handleToggleProfileStatus(profile)}
                                                    disabled={activatingLoading === profile._id}
                                                    className={`p-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${profile.isActive
                                                        ? 'text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20'
                                                        : 'text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20'
                                                        }`}
                                                    title={profile.isActive ? "Deactivate Profile" : "Activate Profile"}
                                                >
                                                    {activatingLoading === profile._id ? (
                                                        <Loader2 className="w-4 h-4 animate-spin" />
                                                    ) : (
                                                        <Power className="w-4 h-4" />
                                                    )}
                                                </button>
                                                <Link
                                                    to={`/profile/${profile._id}`}
                                                    className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                                                    title="View Profile"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </Link>
                                                <button
                                                    onClick={() => handleDelete(profile._id)}
                                                    disabled={deleteLoading === profile._id}
                                                    className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                    title="Delete Profile"
                                                >
                                                    {deleteLoading === profile._id ? (
                                                        <Loader2 className="w-4 h-4 animate-spin" />
                                                    ) : (
                                                        <Trash2 className="w-4 h-4" />
                                                    )}
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                });

                                return rows;
                            })()
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="p-4 border-t border-slate-200 dark:border-slate-700 flex justify-center items-center gap-2">
                    <button
                        onClick={() => { setPage(p => Math.max(1, p - 1)); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                        disabled={page === 1}
                        className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <ChevronLeft className="w-5 h-5 text-slate-500" />
                    </button>
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
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

            {/* Select User Modal for Profile Creation */}
            {showCreateModal && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-fade-in flex flex-col max-h-[80vh]">
                        <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Select User to Create Profile</h3>
                            <button
                                onClick={() => setShowCreateModal(false)}
                                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-4 overflow-y-auto overflow-x-hidden flex-1">
                            {loadingUsers ? (
                                <div className="flex justify-center py-8">
                                    <Loader2 className="w-6 h-6 animate-spin text-primary-500" />
                                </div>
                            ) : eligibleUsers.length === 0 ? (
                                <p className="text-center text-slate-500 py-4">No eligible users found.</p>
                            ) : (
                                <div className="space-y-2">
                                    {eligibleUsers.map(user => (
                                        <div key={user._id} className="flex items-center justify-between p-3 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                                            <div>
                                                <p className="font-medium text-slate-900 dark:text-white">{user.firstName} {user.lastName}</p>
                                                <p className="text-xs text-slate-500">{user.email}</p>
                                            </div>
                                            <button
                                                onClick={() => handleSelectUserForProfile(user._id)}
                                                className="px-3 py-1.5 bg-primary-50 text-primary-600 hover:bg-primary-100 rounded-lg text-sm font-medium transition-colors"
                                            >
                                                Select
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* ── Grant Unlocks Modal ───────────────────────── */}
            {grantModal && (

                <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-sm p-6 animate-in fade-in zoom-in duration-200">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <Gift className="w-5 h-5 text-violet-500" />
                                Grant Unlocks
                            </h3>
                            <button onClick={() => setGrantModal(null)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <p className="text-sm text-slate-600 dark:text-slate-300 mb-5">
                            Granting unlocks to <span className="font-bold text-slate-900 dark:text-white">{grantModal.profileName}</span> without requiring payment.
                        </p>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                                    Unlocks to Add <span className="text-rose-500">*</span>
                                </label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        inputMode="numeric"
                                        value={grantUnlocks}
                                        onChange={(e) => {
                                            let val = e.target.value.replace(/[^0-9]/g, '');
                                            if (val.length > 4) val = val.slice(0, 4);
                                            if (val !== '' && parseInt(val) > 9999) val = '9999';
                                            setGrantUnlocks(val);
                                        }}
                                        autoFocus
                                        placeholder="e.g. 10"
                                        className="input pr-16 w-full"
                                    />
                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">unlocks</span>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                                    Admin Notes <span className="text-slate-400 font-normal">(optional)</span>
                                </label>
                                <textarea
                                    value={grantNotes}
                                    onChange={(e) => setGrantNotes(e.target.value)}
                                    placeholder="Reason for granting unlocks..."
                                    rows={2}
                                    className="input w-full resize-none"
                                />
                            </div>

                            <div className="flex items-start gap-2 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-700/30 rounded-lg p-3">
                                <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                                <p className="text-xs text-amber-700 dark:text-amber-400">
                                    This adds unlocks directly without any payment. It will be tracked under "Approved without Payment" in the Subscriptions tab.
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={() => setGrantModal(null)}
                                className="flex-1 btn bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleGrantUnlocks}
                                disabled={grantLoading || !grantUnlocks}
                                className="flex-1 flex items-center justify-center gap-2 btn bg-violet-600 hover:bg-violet-700 text-white disabled:opacity-60"
                            >
                                {grantLoading
                                    ? <Loader2 className="w-4 h-4 animate-spin" />
                                    : <Gift className="w-4 h-4" />
                                }
                                Grant
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProfileManagement;
