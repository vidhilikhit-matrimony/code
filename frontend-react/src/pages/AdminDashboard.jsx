import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Shield, LayoutDashboard, Users, FileText, CreditCard } from 'lucide-react';
import api from '../services/api';
import AdminStats from '../components/admin/AdminStats';
import UserManagement from '../components/admin/UserManagement';
import ProfileManagement from '../components/admin/ProfileManagement';
import SubscriptionManagement from '../components/admin/SubscriptionManagement'; // Extracted existing logic

const AdminDashboard = () => {
    const [activeTab, setActiveTab] = useState('overview');

    const tabs = [
        { id: 'overview', label: 'Overview', icon: LayoutDashboard },
        { id: 'users', label: 'Users', icon: Users },
        { id: 'profiles', label: 'Profiles', icon: FileText },
        { id: 'subscriptions', label: 'Subscriptions', icon: CreditCard }
    ];

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-8 px-4">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex items-center gap-3 mb-8">
                    <div className="p-3 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                        <Shield className="w-8 h-8 text-primary-500" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Admin Dashboard</h1>
                        <p className="text-slate-500">Manage your application, users, and subscriptions</p>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex flex-wrap gap-2 mb-8 bg-white dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm w-fit">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${activeTab === tab.id
                                ? 'bg-primary-500 text-white shadow-md'
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
                                {/* Quick access to recent items could go here */}
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
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
