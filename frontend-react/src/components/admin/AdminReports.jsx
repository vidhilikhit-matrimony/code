import React, { useState } from 'react';
import { toast } from 'sonner';
import { FileDown, Loader2, Download, FileText, Shield } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const AdminReports = () => {
    const [community, setCommunity] = useState('all');
    const [gender, setGender] = useState('all');
    const [isDownloading, setIsDownloading] = useState(false);
    const [error, setError] = useState('');

    const handleDownload = async () => {
        setError('');
        setIsDownloading(true);
        try {
            const query = new URLSearchParams({ community, gender }).toString();
            const token = localStorage.getItem('accessToken');
            const response = await fetch(`${API_BASE}/reports/profiles/admin?${query}`, {
                method: 'GET',
                headers: { Authorization: `Bearer ${token}` }
            });

            if (!response.ok) {
                let msg = 'Download failed. Please try again.';
                try {
                    const body = await response.json();
                    msg = body?.message || msg;
                } catch { }
                setError(msg);
                return;
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            const cd = response.headers.get('content-disposition');
            const match = cd?.match(/filename="?([^"]+)"?/i);
            link.href = url;
            link.download = match ? match[1] : 'VidhiLikhit_Admin_Profiles.pdf';
            link.target = '_blank';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
            toast.success('PDF downloaded successfully!');
        } catch (err) {
            setError('Network error. Please check your connection.');
        } finally {
            setIsDownloading(false);
        }
    };

    const filterLabel = [
        community !== 'all' ? community.charAt(0).toUpperCase() + community.slice(1) : 'All Communities',
        gender !== 'all' ? gender.charAt(0).toUpperCase() + gender.slice(1) : 'All Genders',
    ].join(' · ');

    return (
        <div className="space-y-6">
            {/* Header Card */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
                <div className="flex items-center gap-3 mb-1">
                    <div className="p-3 bg-indigo-100 dark:bg-indigo-900/40 rounded-xl">
                        <FileDown className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Download Profiles PDF</h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            Admin report — includes phone number &amp; postal address
                        </p>
                    </div>
                    <span className="ml-auto inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                        <Shield className="w-3 h-3" /> Admin Only
                    </span>
                </div>
            </div>

            {/* Filters + Download */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
                <h3 className="font-semibold text-slate-700 dark:text-slate-300 mb-4 text-sm uppercase tracking-wider">
                    Select Filters
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                    {/* Community */}
                    <div>
                        <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wide">
                            Community
                        </label>
                        <select
                            value={community}
                            onChange={e => { setCommunity(e.target.value); setError(''); }}
                            className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                        >
                            <option value="all">All Communities</option>
                            <option value="brahmin">Brahmin</option>
                            <option value="lingayat">Lingayat</option>
                        </select>
                    </div>

                    {/* Gender */}
                    <div>
                        <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wide">
                            Gender
                        </label>
                        <select
                            value={gender}
                            onChange={e => { setGender(e.target.value); setError(''); }}
                            className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                        >
                            <option value="all">All Genders</option>
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                        </select>
                    </div>

                    {/* Download Button — aligned with selects */}
                    <div className="flex items-end">
                        <button
                            onClick={handleDownload}
                            disabled={isDownloading}
                            className="w-full flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg font-semibold bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-60 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md"
                        >
                            {isDownloading ? (
                                <><Loader2 className="w-4 h-4 animate-spin" /> Generating PDF...</>
                            ) : (
                                <><Download className="w-4 h-4" /> Download PDF</>
                            )}
                        </button>
                    </div>
                </div>

                {/* Error */}
                {error && (
                    <div className="px-4 py-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm">
                        {error}
                    </div>
                )}

                {/* Active filter preview */}
                <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-slate-400" />
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                        Will download: <span className="font-semibold text-slate-700 dark:text-slate-300">{filterLabel}</span> profiles
                        {' '}(all &amp; unpublished included)
                    </span>
                </div>
            </div>

            {/* Info box */}
            <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800 p-5">
                <p className="text-sm font-semibold text-amber-800 dark:text-amber-300 mb-1">
                    ⚠️ Confidential — Admin Use Only
                </p>
                <p className="text-xs text-amber-700 dark:text-amber-400 leading-relaxed">
                    This PDF contains sensitive contact information (phone numbers and postal addresses).
                    Please handle it responsibly and do not share it outside your organisation.
                </p>
            </div>
        </div>
    );
};

export default AdminReports;
