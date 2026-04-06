import React, { useEffect, useState } from 'react';
import { Users, FileText, Check, CreditCard, Loader2, UserMinus, PlusCircle, RefreshCw, Calendar, IndianRupee, Wallet } from 'lucide-react';
import api from '../../services/api';

const AdminStats = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    // State for all 8 individual time ranges
    const [ranges, setRanges] = useState({
        registeredUsersRange: 'all',
        createdProfilesRange: 'all',
        newSubscriptionsRange: 'all',
        renewedSubscriptionsRange: 'all',
        deletedAccountsRange: 'all',
        subscriptionRevenueRange: 'all',
        renewalRevenueRange: 'all',
        totalEarnedRange: 'all'
    });

    useEffect(() => {
        const fetchStats = async () => {
            setLoading(true);
            try {
                const queryParams = new URLSearchParams(ranges);
                const response = await api.get(`/admin/stats?${queryParams.toString()}`);
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
    }, [ranges]);

    if (loading && !stats) {
        return (
            <div className="flex justify-center p-8">
                <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
            </div>
        );
    }

    if (!stats) return null;

    const statCards = [
        {
            title: 'Users Registered',
            value: stats.registeredUsers,
            icon: Users,
            bgColor: 'bg-blue-50 dark:bg-blue-900/10',
            textColor: 'text-blue-600 dark:text-blue-400',
            rangeKey: 'registeredUsersRange'
        },
        {
            title: 'Profiles Created',
            value: stats.createdProfiles,
            icon: FileText,
            bgColor: 'bg-indigo-50 dark:bg-indigo-900/10',
            textColor: 'text-indigo-600 dark:text-indigo-400',
            rangeKey: 'createdProfilesRange'
        },
        {
            title: 'New Subscriptions',
            value: stats.newSubscriptions,
            icon: PlusCircle,
            bgColor: 'bg-green-50 dark:bg-green-900/10',
            textColor: 'text-green-600 dark:text-green-400',
            rangeKey: 'newSubscriptionsRange'
        },
        {
            title: 'Renewed Subscriptions',
            value: stats.renewedSubscriptions,
            icon: RefreshCw,
            bgColor: 'bg-amber-50 dark:bg-amber-900/10',
            textColor: 'text-amber-600 dark:text-amber-400',
            rangeKey: 'renewedSubscriptionsRange'
        },
        {
            title: 'Deleted Accounts',
            value: stats.deletedAccounts,
            icon: UserMinus,
            bgColor: 'bg-rose-50 dark:bg-rose-900/10',
            textColor: 'text-rose-600 dark:text-rose-400',
            rangeKey: 'deletedAccountsRange'
        },
        {
            title: 'Sub Revenue',
            value: `₹${stats.subscriptionRevenue || 0}`,
            icon: IndianRupee,
            bgColor: 'bg-emerald-50 dark:bg-emerald-900/10',
            textColor: 'text-emerald-600 dark:text-emerald-400',
            rangeKey: 'subscriptionRevenueRange'
        },
        {
            title: 'Renewal Revenue',
            value: `₹${stats.renewalRevenue || 0}`,
            icon: RefreshCw,
            bgColor: 'bg-cyan-50 dark:bg-cyan-900/10',
            textColor: 'text-cyan-600 dark:text-cyan-400',
            rangeKey: 'renewalRevenueRange'
        },
        {
            title: 'Total Earned',
            value: `₹${stats.totalEarned || 0}`,
            icon: Wallet,
            bgColor: 'bg-violet-50 dark:bg-violet-900/10',
            textColor: 'text-violet-600 dark:text-violet-400',
            rangeKey: 'totalEarnedRange'
        }
    ];

    return (
        <div>
            {/* Header without the Global Time Filter */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                <div>
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-primary-500" />
                        Overview Statistics
                    </h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400">View individual platform metrics for specific time ranges.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-8">
                {statCards.map((stat, index) => (
                    <div key={index} className="bg-white dark:bg-slate-800 rounded-xl p-5 shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col justify-between relative group">
                        {loading && (
                            <div className="absolute inset-0 bg-white/50 dark:bg-slate-800/50 flex items-center justify-center z-10 rounded-xl">
                                <Loader2 className="w-5 h-5 animate-spin text-primary-500" />
                            </div>
                        )}
                        <div className="flex items-start justify-between mb-4">
                            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 leading-tight pr-2">{stat.title}</p>
                            <div className={`p-2.5 rounded-lg shrink-0 ${stat.bgColor}`}>
                                <stat.icon className={`w-5 h-5 ${stat.textColor}`} />
                            </div>
                        </div>
                        <h3 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">{stat.value}</h3>

                        <div className="pt-3 border-t border-slate-100 dark:border-slate-700 flex justify-end">
                            <select
                                value={ranges[stat.rangeKey]}
                                onChange={(e) => setRanges({ ...ranges, [stat.rangeKey]: e.target.value })}
                                className="text-xs appearance-none pl-2 pr-6 py-1.5 rounded border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-primary-500 cursor-pointer"
                                style={{
                                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2364748b'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                                    backgroundPosition: `right 0.25rem center`,
                                    backgroundRepeat: `no-repeat`,
                                    backgroundSize: `1.2em 1.2em`
                                }}
                            >
                                <option value="today">Today</option>
                                <option value="7">Last 7 Days</option>
                                <option value="30">Last 30 Days</option>
                                <option value="180">Last 6 Months</option>
                                <option value="365">Last 1 Year</option>
                                <option value="all">All Time</option>
                            </select>
                        </div>
                    </div>
                ))}
            </div>

            {/* Caste-Based Gender Stats */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden mb-8">
                <div className="px-6 py-5 border-b border-slate-200 dark:border-slate-700">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <Users className="w-5 h-5 text-primary-500" />
                        Profiles by Caste &amp; Gender
                    </h3>
                    <p className="text-sm text-slate-500 mt-1">Breakdown of total male and female profiles based on community caste.</p>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400">
                            <tr>
                                <th className="px-6 py-4 font-medium">Caste</th>
                                <th className="px-6 py-4 font-medium text-center">Male Profiles</th>
                                <th className="px-6 py-4 font-medium text-center">Female Profiles</th>
                                <th className="px-6 py-4 font-medium text-center">Total</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                            {stats.casteStats && stats.casteStats.length > 0 ? (
                                stats.casteStats.map((casteStat, i) => (
                                    <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                        <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">
                                            {casteStat.caste}
                                        </td>
                                        <td className="px-6 py-4 text-center text-blue-600 dark:text-blue-400 font-medium">
                                            {casteStat.male}
                                        </td>
                                        <td className="px-6 py-4 text-center text-pink-600 dark:text-pink-400 font-medium">
                                            {casteStat.female}
                                        </td>
                                        <td className="px-6 py-4 text-center font-bold text-slate-700 dark:text-slate-300">
                                            {casteStat.total}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="4" className="px-6 py-8 text-center text-slate-500">
                                        No caste stats available
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminStats;
