import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Shield, LayoutDashboard, Users, FileText, CreditCard, LogOut, FileDown } from 'lucide-react';
import { logout } from '../redux/slices/authSlice';
import api from '../services/api';
import AdminStats from '../components/admin/AdminStats';
import UserManagement from '../components/admin/UserManagement';
import ProfileManagement from '../components/admin/ProfileManagement';
import SubscriptionManagement from '../components/admin/SubscriptionManagement';
import AdminPlanManagement from '../components/admin/AdminPlanManagement';

import AdminReports from '../components/admin/AdminReports';

const AdminDashboard = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('overview');
    const [showLogoutModal, setShowLogoutModal] = useState(false);

    const handleLogout = () => {
        dispatch(logout());
        navigate('/');
    };

    const tabs = [
        { id: 'overview', label: 'Overview', icon: LayoutDashboard },
        { id: 'users', label: 'Users', icon: Users },
        { id: 'profiles', label: 'Profiles', icon: FileText },
        { id: 'subscriptions', label: 'Subscriptions', icon: CreditCard },
        { id: 'plans', label: 'Plans Setup', icon: CreditCard },
        { id: 'reports', label: 'Reports', icon: FileDown },
    ];

    return (
        <div className="min-h-screen bg-white dark:bg-slate-900 py-8 px-4">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                            <Shield className="w-8 h-8 text-primary-500" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Admin Dashboard</h1>
                            <p className="text-slate-500">Manage your application, users, and subscriptions</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 self-end md:self-auto w-full md:w-auto justify-end">

                        <button
                            onClick={() => setShowLogoutModal(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-rose-600 dark:hover:text-rose-400 transition-colors shadow-sm font-medium"
                        >
                            <LogOut className="w-4 h-4" />
                            <span className="hidden sm:inline">Logout</span>
                        </button>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex flex-wrap gap-2 mb-8 bg-white dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm w-fit">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${activeTab === tab.id
                                ? (tab.id === 'reports' || tab.id === 'plans')
                                    ? 'bg-indigo-600 text-white shadow-md'
                                    : 'bg-primary-500 text-white shadow-md'
                                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'
                                }`}
                        >
                            <tab.icon className="w-4 h-4" />
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Content */}
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                    {activeTab === 'overview' && (
                        <>
                            <AdminStats />
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
                                    <h3 className="font-bold text-lg mb-4 text-slate-900 dark:text-white">Recent Users & Profiles</h3>
                                    <p className="text-slate-500 text-sm">Select the "Users" or "Profiles" tab to view details.</p>
                                </div>
                            </div>
                        </>
                    )}

                    {activeTab === 'users' && <UserManagement />}

                    {activeTab === 'profiles' && <ProfileManagement />}

                    {activeTab === 'subscriptions' && <SubscriptionManagement />}

                    {activeTab === 'plans' && <AdminPlanManagement />}

                    {activeTab === 'reports' && <AdminReports />}
                </div>
            </div>

            {showLogoutModal && (
                <div className="fixed inset-0 z-[100] bg-black/50 flex flex-col items-center justify-start pt-10 animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 w-11/12 max-w-md shadow-xl border border-slate-200 dark:border-slate-700 mx-auto mt-20 sm:mt-0" onClick={(e) => e.stopPropagation()}>
                        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 mb-6">
                            <div className="w-12 h-12 shrink-0 bg-rose-50 dark:bg-rose-500/10 rounded-full flex items-center justify-center">
                                <LogOut className="w-6 h-6 text-rose-500" />
                            </div>
                            <div className="flex-1 text-center sm:text-left">
                                <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
                                    Confirm Logout
                                </h2>
                                <p className="text-sm text-slate-600 dark:text-slate-300">
                                    Are you sure you want to log out of your account?
                                </p>
                            </div>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-3 justify-end w-full">
                            <button onClick={() => setShowLogoutModal(false)} className="px-4 py-2 w-full sm:w-auto rounded-xl text-sm font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors">Cancel</button>
                            <button onClick={handleLogout} className="flex-1 sm:flex-none px-4 py-2 w-full sm:w-auto rounded-xl text-sm font-bold text-white bg-rose-500 hover:bg-rose-600 transition-colors shadow-md shadow-rose-500/20">Log Out</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
