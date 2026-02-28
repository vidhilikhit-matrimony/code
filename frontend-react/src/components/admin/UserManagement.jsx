import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Search, Lock, Unlock, Loader2, ChevronLeft, ChevronRight, Trash2, UserPlus, X } from 'lucide-react';
import api from '../../services/api';
import CustomSelect from '../common/CustomSelect';

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [search, setSearch] = useState('');
    const [actionLoading, setActionLoading] = useState(null);

    const [showCreateModal, setShowCreateModal] = useState(false);
    const [createForm, setCreateForm] = useState({ username: '', email: '', password: '', role: 'user' });
    const [createLoading, setCreateLoading] = useState(false);

    useEffect(() => {
        fetchUsers();
    }, [page, search]);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const queryParams = new URLSearchParams({
                page,
                limit: 10,
                ...(search && { search })
            });
            const response = await api.get(`/admin/users?${queryParams}`);
            if (response.success) {
                setUsers(response.data);
                setTotalPages(response.totalPages);
            }
        } catch (error) {
            console.error('Error fetching users:', error);
            toast.error('Failed to fetch users');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateUser = async (e) => {
        e.preventDefault();
        setCreateLoading(true);
        try {
            const response = await api.post('/admin/users', createForm);
            if (response.success) {
                toast.success('User created successfully');
                setShowCreateModal(false);
                setCreateForm({ username: '', email: '', password: '', role: 'user' });
                fetchUsers(); // Refresh the list
            }
        } catch (error) {
            console.error('Error creating user:', error);
            toast.error(error.message || 'Failed to create user');
        } finally {
            setCreateLoading(false);
        }
    };

    const handleToggleStatus = async (userId, currentStatus) => {
        if (!window.confirm(`Are you sure you want to ${currentStatus ? 'deactivate' : 'activate'} this user?`)) {
            return;
        }

        setActionLoading(userId);
        try {
            const response = await api.put(`/admin/users/${userId}/status`, {
                isActive: !currentStatus
            });

            if (response.success) {
                toast.success(response.message);
                setUsers(users.map(u =>
                    u._id === userId ? { ...u, isActive: !currentStatus } : u
                ));
            }
        } catch (error) {
            console.error('Error updating user status:', error);
            toast.error('Failed to update user status');
        } finally {
            setActionLoading(null);
        }
    };

    const handleDeleteUser = async (user) => {
        if (!window.confirm(`Are you absolutely sure you want to permanently delete the user "${user.username}"? This action cannot be undone and will delete all their profiles and data.`)) {
            return;
        }

        setActionLoading(user._id);
        try {
            const response = await api.delete(`/admin/users/${user._id}`);
            if (response.success) {
                toast.success(response.message || 'User deleted successfully');
                // Remove user from current table state
                setUsers(users.filter(u => u._id !== user._id));
            }
        } catch (error) {
            console.error('Error deleting user:', error);
            toast.error(error.message || 'Failed to delete user');
        } finally {
            setActionLoading(null);
        }
    };

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            setPage(1); // Reset to page 1 on search
        }, 500);
        return () => clearTimeout(timer);
    }, [search]);

    return (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
            {/* Header / Search */}
            <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="flex items-center justify-between w-full sm:w-auto gap-4">
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">User Management</h2>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="flex items-center gap-2 px-3 py-1.5 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg transition-colors"
                    >
                        <UserPlus className="w-4 h-4" />
                        <span className="hidden sm:inline">Create User</span>
                    </button>
                </div>
                <div className="relative w-full sm:w-64">
                    <input
                        type="text"
                        placeholder="Search users..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                    />
                    <Search className="w-5 h-5 text-slate-400 absolute left-3 top-2.5" />
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider">
                        <tr>
                            <th className="px-6 py-3 font-semibold">User</th>
                            <th className="px-6 py-3 font-semibold">Role</th>
                            <th className="px-6 py-3 font-semibold">Status</th>
                            <th className="px-6 py-3 font-semibold">Joined</th>
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
                        ) : users.length === 0 ? (
                            <tr>
                                <td colSpan="5" className="px-6 py-8 text-center text-slate-500">
                                    No users found matching your criteria.
                                </td>
                            </tr>
                        ) : (
                            users.map((user) => (
                                <tr key={user._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div>
                                            <p className="font-medium text-slate-900 dark:text-white">{user.username}</p>
                                            <p className="text-sm text-slate-500">{user.email}</p>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${user.role === 'admin'
                                            ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300'
                                            : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                                            }`}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${user.isActive
                                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                                            : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                                            }`}>
                                            {user.isActive ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-500">
                                        {new Date(user.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button
                                                onClick={() => handleToggleStatus(user._id, user.isActive)}
                                                disabled={actionLoading === user._id || user.role === 'admin'}
                                                className={`p-2 rounded-lg transition-colors ${user.isActive
                                                    ? 'text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20'
                                                    : 'text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20'
                                                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                                                title={user.isActive ? "Deactivate User" : "Activate User"}
                                            >
                                                {actionLoading === user._id ? (
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                ) : user.isActive ? (
                                                    <Lock className="w-4 h-4" />
                                                ) : (
                                                    <Unlock className="w-4 h-4" />
                                                )}
                                            </button>
                                            <button
                                                onClick={() => handleDeleteUser(user)}
                                                disabled={actionLoading === user._id || user.role === 'admin'}
                                                className="p-2 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                title="Delete User"
                                            >
                                                {actionLoading === user._id ? (
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                ) : (
                                                    <Trash2 className="w-4 h-4" />
                                                )}
                                            </button>
                                        </div>
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
            )
            }

            {/* Create User Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-fade-in">
                        <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Create New User</h3>
                            <button
                                onClick={() => setShowCreateModal(false)}
                                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleCreateUser} className="p-4 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Username</label>
                                <input
                                    type="text"
                                    required
                                    value={createForm.username}
                                    onChange={(e) => setCreateForm({ ...createForm, username: e.target.value })}
                                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg dark:bg-slate-700 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email</label>
                                <input
                                    type="email"
                                    required
                                    value={createForm.email}
                                    onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg dark:bg-slate-700 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Password</label>
                                <input
                                    type="password"
                                    required
                                    minLength={8}
                                    value={createForm.password}
                                    onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg dark:bg-slate-700 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Role</label>
                                <CustomSelect
                                    name="role"
                                    value={createForm.role}
                                    onChange={(e) => setCreateForm({ ...createForm, role: e.target.value })}
                                    options={[
                                        { value: 'user', label: 'User' },
                                        { value: 'admin', label: 'Admin' }
                                    ]}
                                    placeholder="Select Role"
                                />
                            </div>
                            <div className="pt-4 flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setShowCreateModal(false)}
                                    className="flex-1 px-4 py-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={createLoading}
                                    className="flex-1 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg flex justify-center items-center"
                                >
                                    {createLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Create User'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div >
    );
};

export default UserManagement;
