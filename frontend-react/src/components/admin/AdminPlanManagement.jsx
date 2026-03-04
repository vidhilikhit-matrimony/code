import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Shield, Loader2, Check, X, FileEdit, ArchiveRestore } from 'lucide-react';
import { toast } from 'sonner';
import api from '../../services/api';

const AdminPlanManagement = ({ onSuccess }) => {
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPlan, setEditingPlan] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        amount: '',
        views: '',
        color: 'bg-blue-500',
        popular: false,
        isActive: true
    });

    const COLOR_OPTIONS = [
        { label: 'Blue', value: 'bg-blue-500' },
        { label: 'Purple', value: 'bg-purple-500' },
        { label: 'Amber', value: 'bg-amber-500' },
        { label: 'Emerald', value: 'bg-emerald-500' },
        { label: 'Rose', value: 'bg-rose-500' }
    ];

    const fetchPlans = async () => {
        try {
            setLoading(true);
            const response = await api.get('/plans/admin');
            setPlans(response.data || []);
        } catch (error) {
            toast.error('Failed to fetch subscription plans');
            console.error('Fetch Plans Error:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPlans();
    }, []);

    const handleOpenModal = (plan = null) => {
        if (plan) {
            setEditingPlan(plan);
            setFormData({
                name: plan.name,
                amount: plan.amount,
                views: plan.views,
                color: plan.color || 'bg-blue-500',
                popular: plan.popular || false,
                isActive: plan.isActive !== false
            });
        } else {
            setEditingPlan(null);
            setFormData({
                name: '',
                amount: '',
                views: '',
                color: 'bg-blue-500',
                popular: false,
                isActive: true
            });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (formData.name.trim() === '' || formData.amount === '' || formData.views === '') {
            toast.error('Please fill in all required fields');
            return;
        }

        try {
            setSubmitting(true);
            const payload = {
                ...formData,
                amount: Number(formData.amount),
                views: Number(formData.views)
            };
            let response;
            if (editingPlan) {
                response = await api.put(`/plans/admin/${editingPlan._id}`, payload);
            } else {
                response = await api.post('/plans/admin', payload);
            }

            // Axios implicitly parses the structure but wrapped our success structure into data
            if (response.data?.success || response.success) {
                toast.success(editingPlan ? 'Plan updated successfully' : 'Plan created successfully');
                setIsModalOpen(false);
                fetchPlans();
                if (onSuccess) onSuccess();
            } else {
                throw new Error(response.data?.message || response.message || 'Failed to save plan');
            }

        } catch (error) {
            console.error('Save Plan Error:', error);
            toast.error(error.response?.data?.message || 'Failed to save plan');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex bg-white dark:bg-slate-800 rounded-xl p-8 border border-slate-200 dark:border-slate-700 min-h-[300px] justify-center items-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <Shield className="w-5 h-5 text-primary-500" />
                        Subscription Plans Management
                    </h2>
                    <p className="text-slate-500 text-sm mt-1">Create, edit, and configure the pricing plans available to users</p>
                </div>

                <button
                    onClick={() => handleOpenModal()}
                    className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors font-medium text-sm shadow-sm"
                >
                    <Plus className="w-4 h-4" />
                    Create New Plan
                </button>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
                            <th className="p-4 font-semibold text-slate-700 dark:text-slate-300">Plan Name</th>
                            <th className="p-4 font-semibold text-slate-700 dark:text-slate-300">Price (₹)</th>
                            <th className="p-4 font-semibold text-slate-700 dark:text-slate-300">Profile Unlocks</th>
                            <th className="p-4 font-semibold text-slate-700 dark:text-slate-300">Status</th>
                            <th className="p-4 font-semibold text-slate-700 dark:text-slate-300">Highlights</th>
                            <th className="p-4 font-semibold text-slate-700 dark:text-slate-300 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {plans.length === 0 ? (
                            <tr>
                                <td colSpan="6" className="p-8 text-center text-slate-500 dark:text-slate-400">
                                    No subscription plans defined. Create one to get started.
                                </td>
                            </tr>
                        ) : (
                            plans.map(plan => (
                                <tr key={plan._id} className="border-b border-slate-100 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                    <td className="p-4">
                                        <div className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                                            <span className={`w-3 h-3 rounded-full ${plan.color || 'bg-slate-500'}`}></span>
                                            {plan.name}
                                        </div>
                                    </td>
                                    <td className="p-4 font-bold text-slate-700 dark:text-slate-300">₹{plan.amount}</td>
                                    <td className="p-4">
                                        <span className="bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 px-2 py-1 rounded text-xs font-bold">
                                            {plan.views} profiles
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        {plan.isActive ? (
                                            <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 bg-emerald-50 dark:bg-emerald-900/30 dark:text-emerald-400 px-2.5 py-1 rounded-full">
                                                <Check className="w-3 h-3" /> Active
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-600 bg-slate-100 dark:bg-slate-800 dark:text-slate-400 px-2.5 py-1 rounded-full">
                                                <ArchiveRestore className="w-3 h-3" /> Disabled
                                            </span>
                                        )}
                                    </td>
                                    <td className="p-4">
                                        {plan.popular && (
                                            <span className="text-xs font-medium text-amber-700 bg-amber-50 dark:bg-amber-900/30 dark:text-amber-400 px-2 py-1 rounded">
                                                Most Popular
                                            </span>
                                        )}
                                    </td>
                                    <td className="p-4 text-right">
                                        <button
                                            onClick={() => handleOpenModal(plan)}
                                            className="p-2 text-slate-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-slate-700 rounded-lg transition-colors"
                                            title="Edit Plan"
                                        >
                                            <FileEdit className="w-5 h-5" />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Create/Edit Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                    <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-lg shadow-2xl relative animate-fade-in overflow-hidden">
                        <div className="border-b border-slate-200 dark:border-slate-700 p-6 pt-8 bg-slate-50 dark:bg-slate-800/80">
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <Edit2 className="w-5 h-5 text-primary-500" />
                                {editingPlan ? 'Edit Subscription Plan' : 'Create New Plan'}
                            </h2>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="absolute right-4 top-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-lg"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-5">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Plan Name *</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="e.g. Premium Plan"
                                    className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 rounded-lg text-slate-900 dark:text-white"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Price (₹) *</label>
                                    <input
                                        type="number"
                                        required
                                        min="0"
                                        value={formData.amount}
                                        onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                        placeholder="e.g. 1500"
                                        className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 rounded-lg text-slate-900 dark:text-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Profile Unlocks *</label>
                                    <input
                                        type="number"
                                        required
                                        min="1"
                                        value={formData.views}
                                        onChange={(e) => setFormData({ ...formData, views: e.target.value })}
                                        placeholder="e.g. 50"
                                        className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 rounded-lg text-slate-900 dark:text-white"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Badge Color Theme</label>
                                <div className="flex gap-2">
                                    {COLOR_OPTIONS.map(color => (
                                        <button
                                            key={color.value}
                                            type="button"
                                            onClick={() => setFormData({ ...formData, color: color.value })}
                                            className={`w-8 h-8 rounded-full ${color.value} transition-transform ${formData.color === color.value ? 'ring-2 ring-offset-2 ring-slate-800 dark:ring-white scale-110' : 'hover:scale-110'}`}
                                            title={color.label}
                                        />
                                    ))}
                                </div>
                            </div>

                            <div className="flex items-center gap-6 pt-2">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={formData.popular}
                                        onChange={(e) => setFormData({ ...formData, popular: e.target.checked })}
                                        className="w-4 h-4 text-primary-600 rounded border-slate-300 focus:ring-primary-500"
                                    />
                                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Mark as "Most Popular"</span>
                                </label>

                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={formData.isActive}
                                        onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                        className="w-4 h-4 text-primary-600 rounded border-slate-300 focus:ring-primary-500"
                                    />
                                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Active (Visible to users)</span>
                                </label>
                            </div>

                            <div className="flex gap-3 pt-6 border-t border-slate-200 dark:border-slate-700">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex-1 px-4 py-2 font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-xl transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="flex-1 px-4 py-2 font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-xl transition-colors flex items-center justify-center gap-2"
                                >
                                    {submitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving</> : 'Save Plan'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminPlanManagement;
