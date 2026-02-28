import React, { useEffect, useState } from 'react';
import { Users, FileText, Check, CreditCard, Loader2 } from 'lucide-react';
import api from '../../services/api';

const AdminStats = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await api.get('/admin/stats');
                if (response.success) {
                    setStats(response.data);
                }
            } catch (error) {
                console.error('Error fetching stats:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    if (loading) {
        return (
            <div className="flex justify-center p-8">
                <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
            </div>
        );
    }

    if (!stats) return null;

    const statCards = [
        {
            title: 'Total Users',
            value: stats.totalUsers,
            icon: Users,
            bgColor: 'bg-blue-50 dark:bg-blue-900/10',
            textColor: 'text-blue-600 dark:text-blue-400'
        },
        {
            title: 'Total Profiles',
            value: stats.totalProfiles,
            icon: FileText,
            bgColor: 'bg-indigo-50 dark:bg-indigo-900/10',
            textColor: 'text-indigo-600 dark:text-indigo-400'
        },
        {
            title: 'Published Profiles',
            value: stats.publishedProfiles,
            icon: Check,
            bgColor: 'bg-green-50 dark:bg-green-900/10',
            textColor: 'text-green-600 dark:text-green-400'
        },
        {
            title: 'Total Renew',
            value: `₹${stats.totalRevenue ? stats.totalRevenue.toLocaleString() : 0}`,
            icon: CreditCard,
            bgColor: 'bg-amber-50 dark:bg-amber-900/10',
            textColor: 'text-amber-600 dark:text-amber-400'
        }
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {statCards.map((stat, index) => (
                <div key={index} className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{stat.title}</p>
                            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{stat.value}</h3>
                        </div>
                        <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                            <stat.icon className={`w-6 h-6 ${stat.textColor}`} />
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default AdminStats;
