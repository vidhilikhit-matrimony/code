import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Search, SlidersHorizontal, X, MapPin, Briefcase, GraduationCap, ChevronLeft, ChevronRight, User, Heart, Loader2, LogOut, LockOpen, Menu, Shield } from 'lucide-react';
import { getAllProfiles, getMyProfile } from '../services/profileService';
import { logout } from '../redux/slices/authSlice';
import { toast } from 'sonner';
import SubscriptionWarningModal from '../components/SubscriptionWarningModal';


// ─── Filter Config ─────────────────────────────────────────────
const FILTER_CONFIG = {
    community: {
        label: 'Community',
        options: [
            { value: 'Brahmin', label: 'Brahmin' },
            { value: 'Lingayat', label: 'Lingayat' }
        ]
    },
    gender: {
        label: 'Gender',
        options: [
            { value: 'Male', label: 'Male' },
            { value: 'Female', label: 'Female' }
        ]
    },
    maritalStatus: {
        label: 'Marital Status',
        options: [
            { value: 'unmarried', label: 'Unmarried' },
            { value: 'divorced', label: 'Divorced' },
            { value: 'widow', label: 'Widow / Widower' }
        ]
    },
    country: {
        label: 'Location',
        options: [
            { value: 'India', label: 'India' },
            { value: 'NRI', label: 'NRI (Abroad)' }
        ]
    }
};

// ─── Skeleton Card ──────────────────────────────────────────────
const SkeletonCard = () => (
    <div className="card animate-pulse">
        <div className="bg-slate-200 dark:bg-slate-700 aspect-square w-full rounded-t-lg" />
        <div className="p-4 space-y-3">
            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4" />
            <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/2" />
            <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-2/3" />
            <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/3" />
        </div>
    </div>
);

// ─── Profile Card ───────────────────────────────────────────────
const ProfileCard = ({ profile, onClick }) => {
    const photoUrl = profile.photoUrl;
    const age = profile.age;
    const firstName = profile.firstName || 'Unknown';
    const lastName = profile.lastName || '';
    const displayName = profile.isUnlocked ? `${firstName} ${lastName}`.trim() : firstName;
    const profileCode = profile.profileCode || '';
    const caste = profile.caste || '';
    const education = profile.education || '';
    const location = profile.workingPlace || '';
    const maritalStatus = profile.maritalStatus || '';

    return (
        <div
            onClick={onClick}
            className="cursor-pointer group overflow-hidden transform transition-all duration-300 hover:scale-[1.02] hover:shadow-xl rounded-xl max-w-sm mx-auto w-full bg-white dark:bg-slate-800 shadow-sm border border-slate-200 dark:border-slate-700"
        >
            {/* Photo */}
            <div className="relative aspect-square w-full bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-slate-700 dark:to-slate-600 overflow-hidden">
                {photoUrl ? (
                    <img
                        src={photoUrl}
                        alt={firstName}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <User className="w-16 h-16 text-slate-300 dark:text-slate-500" />
                    </div>
                )}

                {/* Profile Code Badge */}
                <div className="absolute top-3 left-3 bg-slate-800/80 backdrop-blur-sm text-white text-xs px-2.5 py-1 rounded-full font-medium z-10">
                    {profileCode}
                </div>

                {/* Lock/Unlock Badge */}
                {profile.isUnlocked && (
                    <div className="absolute top-3 right-3 bg-emerald-500/90 backdrop-blur-sm text-white text-xs px-2.5 py-1 rounded-full z-10 flex items-center gap-1">
                        ✓ Unlocked
                    </div>
                )}

                {/* Age Badge */}
                {age && (
                    <div className="absolute bottom-3 left-3 bg-indigo-600/90 backdrop-blur-sm text-white text-sm px-3 py-1 rounded-full font-bold z-10">
                        {age} yrs
                    </div>
                )}
            </div>

            {/* Info */}
            <div className="p-4 bg-white dark:bg-slate-800">
                <h3 className="font-bold text-[17px] text-slate-900 dark:text-white truncate mb-2.5">
                    {displayName}
                </h3>

                <div className="space-y-2 mb-4">
                    {caste && (
                        <div className="flex items-center gap-2 text-[13px] text-slate-600 dark:text-slate-300">
                            <Heart className="w-4 h-4 text-pink-500 flex-shrink-0" />
                            <span className="truncate">{caste}</span>
                        </div>
                    )}

                    {education && (
                        <div className="flex items-center gap-2 text-[13px] text-slate-600 dark:text-slate-300">
                            <GraduationCap className="w-4 h-4 text-indigo-500 flex-shrink-0" />
                            <span className="truncate">{education}</span>
                        </div>
                    )}

                    {location && (
                        <div className="flex items-center gap-2 text-[13px] text-slate-600 dark:text-slate-300">
                            <MapPin className="w-4 h-4 text-amber-500 flex-shrink-0" />
                            <span className="truncate">{location}</span>
                        </div>
                    )}
                </div>

                {maritalStatus && (
                    <div>
                        <span className="text-[11px] font-semibold px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 capitalize">
                            {maritalStatus}
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
};

// ─── Filter Sidebar ─────────────────────────────────────────────
const FilterSidebar = ({ filters, onChange, onClear, isMobileOpen, onMobileClose }) => {
    const activeCount = Object.values(filters).filter(v => v).length;

    return (
        <>
            {/* Mobile overlay */}
            {isMobileOpen && (
                <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={onMobileClose} />
            )}

            <aside className={`
                fixed top-0 left-0 h-full w-72 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 z-50 
                transform transition-transform duration-300 overflow-y-auto
                lg:static lg:transform-none lg:z-auto lg:h-auto lg:rounded-lg shadow-sm
                ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            `}>
                {/* Header */}
                <div className="flex items-center justify-between p-4 sticky top-0 bg-white/90 dark:bg-slate-800/90 backdrop-blur z-10">
                    <div className="flex items-center gap-2">
                        <SlidersHorizontal className="w-5 h-5 text-indigo-600" />
                        <h2 className="font-bold text-lg text-slate-800">Filters</h2>
                        {activeCount > 0 && (
                            <span className="bg-indigo-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-sm">
                                {activeCount}
                            </span>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        {activeCount > 0 && (
                            <button onClick={onClear} className="text-xs text-indigo-600 hover:text-indigo-700 hover:underline font-medium">
                                Clear all
                            </button>
                        )}
                        <button onClick={onMobileClose} className="lg:hidden p-1 hover:bg-slate-100/50 rounded text-slate-500 hover:text-slate-800">
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Filter Groups */}
                <div className="p-4 space-y-6">
                    {/* Manual Age Range Slider */}
                    <div>
                        <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wider mb-3 flex justify-between items-center">
                            Age Range
                            <span className="text-indigo-700 text-xs font-bold normal-case bg-indigo-100/50 px-2 py-0.5 rounded">
                                {filters.ageMin || 18} - {filters.ageMax || 60} yrs
                            </span>
                        </h3>
                        <div className="px-2 space-y-4">
                            <div className="flex flex-col gap-4">
                                <div className="flex-1">
                                    <label className="text-xs text-slate-800 font-bold mb-1 block">Min Age</label>
                                    <input
                                        type="range"
                                        min="18"
                                        max="60"
                                        value={filters.ageMin || 18}
                                        onChange={(e) => {
                                            const val = Math.min(Number(e.target.value), (filters.ageMax || 60) - 1);
                                            onChange('ageMin', val);
                                        }}
                                        className="w-full h-1.5 bg-indigo-200/50 rounded-lg appearance-none cursor-pointer"
                                        style={{ accentColor: '#4f46e5' }}
                                    />
                                </div>
                                <div className="flex-1">
                                    <label className="text-xs text-slate-800 font-bold mb-1 block">Max Age</label>
                                    <input
                                        type="range"
                                        min="18"
                                        max="60"
                                        value={filters.ageMax || 60}
                                        onChange={(e) => {
                                            const val = Math.max(Number(e.target.value), (filters.ageMin || 18) + 1);
                                            onChange('ageMax', val);
                                        }}
                                        className="w-full h-1.5 bg-indigo-200/50 rounded-lg appearance-none cursor-pointer"
                                        style={{ accentColor: '#4f46e5' }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {Object.entries(FILTER_CONFIG).map(([key, config]) => (
                        <div key={key}>
                            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3">
                                {config.label}
                            </h3>
                            <div className="space-y-2">
                                {config.options.map(opt => (
                                    <label
                                        key={opt.value}
                                        className="flex items-center gap-3 cursor-pointer group/item py-1"
                                    >
                                        <input
                                            type="radio"
                                            name={key}
                                            checked={filters[key] === opt.value}
                                            onChange={() => onChange(key, filters[key] === opt.value ? '' : opt.value)}
                                            className="w-4 h-4 text-indigo-600 focus:ring-indigo-600 border-indigo-300 bg-white/80 cursor-pointer"
                                        />
                                        <span className="text-[15px] font-medium text-slate-800 group-hover/item:text-indigo-700 transition-colors">
                                            {opt.label}
                                        </span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </aside>
        </>
    );
};

// ─── Pagination ─────────────────────────────────────────────────
const Pagination = ({ currentPage, totalPages, onPageChange }) => {
    if (totalPages <= 1) return null;

    const getPages = () => {
        const pages = [];
        const start = Math.max(1, currentPage - 2);
        const end = Math.min(totalPages, currentPage + 2);
        for (let i = start; i <= end; i++) pages.push(i);
        return pages;
    };

    return (
        <div className="flex items-center justify-center gap-2 mt-8">
            <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            >
                <ChevronLeft className="w-5 h-5" />
            </button>

            {getPages().map(page => (
                <button
                    key={page}
                    onClick={() => onPageChange(page)}
                    className={`w-10 h-10 rounded-lg font-medium transition-all ${page === currentPage
                        ? 'bg-primary-600 text-white shadow-md'
                        : 'border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                        }`}
                >
                    {page}
                </button>
            ))}

            <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            >
                <ChevronRight className="w-5 h-5" />
            </button>
        </div>
    );
};

// ─── Main Profiles Page ─────────────────────────────────────────
const getInitialFilters = () => {
    const saved = sessionStorage.getItem('profilesFilters');
    if (saved) {
        try {
            return JSON.parse(saved);
        } catch (e) { }
    }
    return {
        search: '',
        community: '',
        gender: '',
        ageMin: '',
        ageMax: '',
        maritalStatus: '',
        workingPlace: ''
    };
};

const getInitialPage = () => {
    const saved = sessionStorage.getItem('profilesPage');
    if (saved) return Number(saved);
    return 1;
};

const Profiles = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { user, sessionSeed } = useSelector((state) => state.auth);
    const [profiles, setProfiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [total, setTotal] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const [hasProfile, setHasProfile] = useState(false);

    // Initialize state from sessionStorage
    const initialFilters = getInitialFilters();
    const [page, setPage] = useState(getInitialPage);
    const [searchInput, setSearchInput] = useState(initialFilters.search || '');
    const [filters, setFilters] = useState(initialFilters);

    useEffect(() => {
        sessionStorage.setItem('profilesFilters', JSON.stringify(filters));
    }, [filters]);

    useEffect(() => {
        sessionStorage.setItem('profilesPage', page.toString());
    }, [page]);

    useEffect(() => {
        const timer = setTimeout(() => {
            setFilters(prev => {
                if (prev.search !== searchInput) {
                    setPage(1);
                    return { ...prev, search: searchInput };
                }
                return prev;
            });
        }, 500);
        return () => clearTimeout(timer);
    }, [searchInput]);

    // Check if user already has a profile
    useEffect(() => {
        const checkProfile = async () => {
            try {
                const res = await getMyProfile();
                if (res.success && res.data) setHasProfile(true);
            } catch { /* no profile */ }
        };
        checkProfile();
    }, []);

    const fetchProfiles = useCallback(async () => {
        setLoading(true);
        try {
            const response = await getAllProfiles({
                ...filters,
                page,
                limit: 12,
                seed: sessionSeed
            });
            if (response.success) {
                setProfiles(response.data.profiles);
                setTotal(response.data.total);
                setTotalPages(response.data.totalPages);
            }
        } catch (error) {
            toast.error(error.message || 'Failed to load profiles');
        } finally {
            setLoading(false);
        }
    }, [filters, page]);

    useEffect(() => {
        fetchProfiles();
    }, [fetchProfiles]);

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
        setPage(1); // Reset to first page
    };

    const clearFilters = () => {
        setSearchInput('');
        setFilters({
            search: '',
            community: '',
            gender: '',
            ageMin: '',
            ageMax: '',
            maritalStatus: '',
            workingPlace: ''
        });
        setPage(1);
    };

    const activeFilterCount = Object.entries(filters).filter(([k, v]) => v && k !== 'search').length;

    const handleLogout = () => {
        sessionStorage.removeItem('profilesFilters');
        sessionStorage.removeItem('profilesPage');
        dispatch(logout());
        navigate('/');
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 pt-0">
            {/* Top Bar */}
            <div className="bg-white dark:bg-slate-800 sticky top-0 z-30">
                <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => navigate('/')}
                            className="text-indigo-700 hover:text-indigo-800 font-bold text-[22px]"
                        >
                            VidhiLikhit
                        </button>
                    </div>

                    <div className="flex items-center gap-3">

                        {/* Mobile filter toggle */}
                        <button
                            onClick={() => setMobileFilterOpen(true)}
                            className="lg:hidden btn btn-outline flex items-center gap-2 text-sm relative border-indigo-200 text-indigo-600 hover:bg-indigo-50"
                        >
                            <SlidersHorizontal className="w-4 h-4" />
                            Filters
                            {activeFilterCount > 0 && (
                                <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                                    {activeFilterCount}
                                </span>
                            )}
                        </button>

                        {user && (
                            <button
                                onClick={() => navigate('/unlocked-profiles')}
                                className="px-4 py-2 rounded-lg text-sm hidden sm:flex items-center gap-2 border border-indigo-600 text-indigo-600 font-semibold hover:bg-indigo-50"
                                title="View profiles you have unlocked"
                            >
                                <LockOpen className="w-4 h-4" /> Unlocked Profiles
                            </button>
                        )}

                        <button
                            onClick={() => navigate('/create-profile')}
                            className="hidden sm:block px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm transition-colors shadow-sm"
                        >
                            {hasProfile ? '✎ Edit Profile' : '+ Create Profile'}
                        </button>

                        {!user?.isAdmin && (
                            user?.subscriptionStatus === 'active' && user?.remainingViews > 0 ? (
                                <div className="hidden md:flex items-center px-3 py-1.5 bg-indigo-100 dark:bg-slate-700 rounded-full text-xs font-semibold text-indigo-700 dark:text-slate-300">
                                    <span className="text-indigo-700 dark:text-indigo-400 font-bold mr-1">{user.remainingViews}</span> Unlocks Left
                                </div>
                            ) : (
                                <button
                                    onClick={() => navigate('/payment')}
                                    className="hidden md:flex items-center px-4 py-1.5 rounded-full text-xs font-bold
                                               bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm transition-colors"
                                >
                                    {user?.subscriptionStatus === 'active' && user?.remainingViews === 0 ? 'Renew Subscription' : 'Buy Subscription'}
                                </button>
                            )
                        )}

                        <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 mx-2 hidden sm:block"></div>

                        <div className="hidden sm:flex items-center gap-3">
                            {user?.photoUrl ? (
                                <img
                                    src={user.photoUrl}
                                    alt={user.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : (user.name || user.email?.split('@')[0] || 'User')}
                                    className="w-8 h-8 rounded-full object-cover border border-slate-200 cursor-pointer"
                                    onClick={() => navigate(hasProfile ? '/profile/me' : '/create-profile')}
                                    title={user.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : (user.name || user.email?.split('@')[0] || 'User')}
                                />
                            ) : (
                                <div
                                    className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs cursor-pointer"
                                    title={user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : (user?.name || user?.email?.split('@')[0] || 'User')}
                                >
                                    {(user?.firstName || user?.name || user?.email || 'U').charAt(0).toUpperCase()}
                                </div>
                            )}
                            <button
                                onClick={() => setShowLogoutModal(true)}
                                className="text-slate-500 hover:text-red-600 transition-colors p-1"
                                title="Logout"
                            >
                                <LogOut className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Mobile Menu Toggle */}
                        <div className="sm:hidden flex items-center">
                            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 text-slate-600 dark:text-slate-300">
                                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Dropdown Menu */}
                {mobileMenuOpen && (
                    <div className="sm:hidden absolute w-full left-0 top-full bg-white dark:bg-slate-800 shadow-[0_20px_40px_rgba(0,0,0,0.15)] rounded-b-3xl animate-in slide-in-from-top-2 fade-in duration-300 z-40 border-t border-slate-100 dark:border-slate-700 overflow-hidden">
                        <div className="px-5 py-6">
                            {/* User Header */}
                            {user && (
                                <div className="flex items-center gap-4 mb-6 pb-6 border-b border-slate-100 dark:border-slate-700">
                                    {user?.photoUrl ? (
                                        <img src={user.photoUrl} alt="User" className="w-14 h-14 rounded-full object-cover border-2 border-indigo-100 dark:border-indigo-900 shadow-sm" />
                                    ) : (
                                        <div className="w-14 h-14 rounded-[20px] bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-slate-700 dark:to-slate-600 text-indigo-600 dark:text-indigo-300 flex items-center justify-center font-bold text-2xl shadow-inner border border-white dark:border-slate-800">
                                            {(user?.firstName || user?.name || user?.email || 'U')[0].toUpperCase()}
                                        </div>
                                    )}
                                    <div className="flex-1">
                                        <p className="font-extrabold text-slate-900 dark:text-white text-xl leading-tight tracking-tight">
                                            {user?.firstName
                                                ? `${user.firstName} ${user.lastName || ''}`.trim()
                                                : (user?.name || user?.lastName || user?.email?.split('@')[0] || 'User')}
                                        </p>
                                        <div className="inline-flex items-center mt-1.5 px-2.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-700">
                                            <p className="text-[11px] text-slate-500 dark:text-slate-300 font-bold uppercase tracking-wider">
                                                {!user?.isAdmin ? (user?.subscriptionStatus === 'active' ? 'Premium Member' : 'Free Member') : 'Admin'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Menu Links */}
                            <div className="space-y-2 pb-2">
                                {user && (
                                    <button onClick={() => { setMobileMenuOpen(false); navigate(hasProfile ? '/profile/me' : '/create-profile'); }} className="flex items-center gap-4 w-full text-left font-bold text-slate-700 dark:text-slate-200 py-3.5 px-4 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-all duration-200 active:scale-[0.98] group">
                                        <div className="bg-indigo-50 dark:bg-indigo-500/10 p-2.5 rounded-xl text-indigo-600 dark:text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-300">
                                            <User className="w-5 h-5" />
                                        </div>
                                        <span className="text-[15px]">{hasProfile ? 'My Profile Details' : 'Create Profile'}</span>
                                    </button>
                                )}
                                {user && (
                                    <button onClick={() => { setMobileMenuOpen(false); navigate('/unlocked-profiles'); }} className="flex items-center gap-4 w-full text-left font-bold text-slate-700 dark:text-slate-200 py-3.5 px-4 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-all duration-200 active:scale-[0.98] group">
                                        <div className="bg-emerald-50 dark:bg-emerald-500/10 p-2.5 rounded-xl text-emerald-600 dark:text-emerald-400 group-hover:bg-emerald-500 group-hover:text-white transition-colors duration-300">
                                            <LockOpen className="w-5 h-5" />
                                        </div>
                                        <span className="text-[15px]">Unlocked Profiles</span>
                                    </button>
                                )}
                                {!user?.isAdmin && (
                                    <button onClick={() => { setMobileMenuOpen(false); navigate('/payment'); }} className="flex items-center gap-4 w-full text-left font-bold text-slate-700 dark:text-slate-200 py-3.5 px-4 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-all duration-200 active:scale-[0.98] group">
                                        <div className="bg-amber-50 dark:bg-amber-500/10 p-2.5 rounded-xl text-amber-600 dark:text-amber-400 group-hover:bg-amber-500 group-hover:text-white transition-colors duration-300">
                                            <Shield className="w-5 h-5" />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-[15px]">{user?.subscriptionStatus === 'active' && user?.remainingViews === 0 ? 'Renew Subscription' : (user?.subscriptionStatus === 'active' ? 'Subscription Active' : 'Buy Subscription')}</span>
                                            {user?.subscriptionStatus === 'active' && user?.remainingViews > 0 && (
                                                <span className="text-[11px] text-indigo-600 dark:text-indigo-400 mt-0.5 uppercase tracking-wider font-extrabold">{user.remainingViews} unlocks remaining</span>
                                            )}
                                        </div>
                                    </button>
                                )}
                            </div>

                            <div className="pt-5 mt-2 border-t border-slate-100 dark:border-slate-700">
                                <button onClick={() => { setMobileMenuOpen(false); setShowLogoutModal(true); }} className="flex items-center justify-center gap-3 w-full font-bold text-rose-600 dark:text-rose-400 py-4 px-4 rounded-2xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-500/10 dark:hover:bg-rose-500/20 transition-all duration-200 active:scale-[0.98] border border-rose-100 dark:border-rose-900/50">
                                    <LogOut className="w-5 h-5" />
                                    <span className="text-[15px] tracking-wide uppercase">Log Out</span>
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 py-6">
                <div className="flex gap-6">
                    {/* Sidebar Filters (handles both desktop & mobile) */}
                    <FilterSidebar
                        filters={filters}
                        onChange={handleFilterChange}
                        onClear={clearFilters}
                        isMobileOpen={mobileFilterOpen}
                        onMobileClose={() => setMobileFilterOpen(false)}
                    />

                    {/* Profile Grid */}
                    <div className="flex-1 min-w-0">
                        {/* Search Bar */}
                        <div className="mb-6 relative">
                            <input
                                type="text"
                                placeholder="Search by Profile ID or Name..."
                                value={searchInput}
                                onChange={(e) => setSearchInput(e.target.value)}
                                className="w-full pl-11 pr-10 py-3 rounded-xl bg-white dark:bg-slate-800 focus:ring-2 focus:ring-blue-500 outline-none text-slate-800 dark:text-slate-200 shadow-sm transition-all hover:shadow-md"
                            />
                            <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                            {searchInput && (
                                <button
                                    onClick={() => {
                                        setSearchInput('');
                                        handleFilterChange('search', '');
                                    }}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 p-1 bg-slate-100 dark:bg-slate-700 rounded-full transition-colors"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            )}
                        </div>

                        {/* Active Filters */}
                        {activeFilterCount > 0 && (
                            <div className="flex flex-wrap gap-2 mb-4">
                                {Object.entries(filters).map(([key, value]) => {
                                    if (!value || key === 'search') return null;
                                    const config = FILTER_CONFIG[key];
                                    const option = config?.options.find(o => o.value === value);
                                    return (
                                        <span
                                            key={key}
                                            className="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm"
                                        >
                                            {config?.label}: {option?.label || value}
                                            <button
                                                onClick={() => handleFilterChange(key, '')}
                                                className="hover:text-blue-900 ml-1"
                                            >
                                                <X className="w-3.5 h-3.5" />
                                            </button>
                                        </span>
                                    );
                                })}
                            </div>
                        )}

                        {/* Grid */}
                        {loading ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {Array.from({ length: 10 }).map((_, i) => (
                                    <SkeletonCard key={i} />
                                ))}
                            </div>
                        ) : profiles.length === 0 ? (
                            <div className="text-center py-20">
                                <User className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                                <h3 className="text-xl font-semibold text-slate-700 dark:text-slate-300 mb-2">
                                    No profiles found
                                </h3>
                                <p className="text-slate-500 mb-4">
                                    {activeFilterCount > 0
                                        ? 'Try adjusting your filters to see more results.'
                                        : 'Be the first to create a profile!'}
                                </p>
                                {activeFilterCount > 0 && (
                                    <button onClick={clearFilters} className="btn btn-outline border-blue-500 text-blue-600 hover:bg-blue-50">
                                        Clear Filters
                                    </button>
                                )}
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {profiles.map(profile => (
                                    <ProfileCard
                                        key={profile._id}
                                        profile={profile}
                                        onClick={() => navigate(`/profile/${profile._id}`)}
                                    />
                                ))}
                            </div>
                        )}

                        {/* Pagination */}
                        <Pagination
                            currentPage={page}
                            totalPages={totalPages}
                            onPageChange={setPage}
                        />
                    </div>
                </div>
            </div>

            {showLogoutModal && (
                <div className="fixed inset-0 z-[100] bg-black/50 flex flex-col items-center justify-start pt-10 animate-in fade-in duration-200" onClick={() => setShowLogoutModal(false)}>
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
                            <button onClick={handleLogout} className="px-4 py-2 w-full sm:w-auto rounded-xl text-sm font-bold text-white bg-rose-500 hover:bg-rose-600 transition-colors shadow-md shadow-rose-500/20">Log Out</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Profiles;
