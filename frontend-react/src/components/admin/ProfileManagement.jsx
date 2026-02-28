import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Search, Trash2, Eye, Loader2, ChevronLeft, ChevronRight, CheckCircle, XCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../services/api';

const ProfileManagement = () => {
    const [profiles, setProfiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [search, setSearch] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [deleteLoading, setDeleteLoading] = useState(null);

    useEffect(() => {
        fetchProfiles();
    }, [page, search, filterStatus]);

    const fetchProfiles = async () => {
        setLoading(true);
        try {
            const queryParams = new URLSearchParams({
                page,
                limit: 10,
                ...(search && { search }),
                ...(filterStatus !== 'all' && { status: filterStatus })
            });

            const response = await api.get(`/admin/profiles?${queryParams}`);
            if (response.success) {
                setProfiles(response.data);
                setTotalPages(response.totalPages);
            }
        } catch (error) {
            console.error('Error fetching profiles:', error);
            toast.error('Failed to fetch profiles');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (profileId) => {
        if (!window.confirm('Are you sure you want to permanently delete this profile? This action cannot be undone.')) {
            return;
        }

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

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            setPage(1);
        }, 500);
        return () => clearTimeout(timer);
    }, [search]);

    return (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
            {/* Header / Search / Filter */}
            <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex flex-col md:flex-row justify-between items-center gap-4">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Profile Management</h2>

                <div className="flex gap-3 w-full md:w-auto">
                    <select
                        value={filterStatus}
                        onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }}
                        className="px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-primary-500"
                    >
                        <option value="all">All Profiles</option>
                        <option value="published">Published</option>
                        <option value="unpublished">Unpublished</option>
                    </select>

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
                            <th className="px-6 py-3 font-semibold">Created By</th>
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
                            profiles.map((profile) => (
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

                                            {!profile.isActive && (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300">
                                                    <XCircle className="w-3 h-3" /> Inactive
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-500">
                                        {profile.userId?.email || 'N/A'}
                                    </td>
                                    <td className="px-6 py-4 text-right flex justify-end gap-2">
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
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="p-4 border-t border-slate-200 dark:border-slate-700 flex justify-center items-center gap-2">
                    <button
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <ChevronLeft className="w-5 h-5 text-slate-500" />
                    </button>
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        Page {page} of {totalPages}
                    </span>
                    <button
                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages}
                        className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <ChevronRight className="w-5 h-5 text-slate-500" />
                    </button>
                </div>
            )}
        </div>
    );
};

export default ProfileManagement;
