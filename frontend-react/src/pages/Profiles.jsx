import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Search, SlidersHorizontal, X, MapPin, Briefcase, GraduationCap, ChevronLeft, ChevronRight, User, Heart, Loader2, LogOut } from 'lucide-react';
import { getAllProfiles, getMyProfile } from '../services/profileService';
import { logout } from '../redux/slices/authSlice';
import { toast } from 'sonner';
import RefreshPageButton from '../components/common/RefreshPageButton';

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
        <div className="bg-slate-200 dark:bg-slate-700 h-56 rounded-t-lg" />
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
            className="card cursor-pointer group overflow-hidden transform transition-all duration-300 hover:scale-[1.02] hover:shadow-xl"
        >
            {/* Photo */}
            <div className="relative h-56 bg-gradient-to-br from-primary-100 to-secondary-100 dark:from-slate-700 dark:to-slate-600 overflow-hidden">
                {photoUrl ? (
                    <img
                        src={photoUrl}
                        alt={firstName}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <User className="w-20 h-20 text-slate-300 dark:text-slate-500" />
                    </div>
                )}

                {/* Profile Code Badge */}
                <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full font-medium">
                    {profileCode}
                </div>

                {/* Lock/Unlock Badge */}
                {profile.isUnlocked && (
                    <div className="absolute top-2 right-2 bg-green-500/80 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full">
                        ✓ Unlocked
                    </div>
                )}

                {/* Age Badge */}
                {age && (
                    <div className="absolute bottom-2 left-2 bg-primary-600/90 backdrop-blur-sm text-white text-sm px-3 py-1 rounded-full font-semibold">
                        {age} yrs
                    </div>
                )}
            </div>

            {/* Info */}
            <div className="p-4 space-y-2">
                <h3 className="font-bold text-lg text-slate-900 dark:text-white truncate">
                    {displayName}
                </h3>

                {caste && (
                    <div className="flex items-center gap-1.5 text-sm text-slate-600 dark:text-slate-400">
                        <Heart className="w-3.5 h-3.5 text-secondary-500 flex-shrink-0" />
                        <span className="truncate">{caste}</span>
                    </div>
                )}

                {education && (
                    <div className="flex items-center gap-1.5 text-sm text-slate-600 dark:text-slate-400">
                        <GraduationCap className="w-3.5 h-3.5 text-primary-500 flex-shrink-0" />
                        <span className="truncate">{education}</span>
                    </div>
                )}

                {location && (
                    <div className="flex items-center gap-1.5 text-sm text-slate-600 dark:text-slate-400">
                        <MapPin className="w-3.5 h-3.5 text-accent-500 flex-shrink-0" />
                        <span className="truncate">{location}</span>
                    </div>
                )}

                {maritalStatus && (
                    <div className="mt-2">
                        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 capitalize">
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
                fixed top-0 left-0 h-full w-72 bg-white dark:bg-slate-800 z-50 
                transform transition-transform duration-300 overflow-y-auto
                lg:static lg:transform-none lg:z-auto lg:h-auto lg:rounded-lg 
                lg:border lg:border-slate-200 lg:dark:border-slate-700
                ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            `}>
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700 sticky top-0 bg-white dark:bg-slate-800 z-10">
                    <div className="flex items-center gap-2">
                        <SlidersHorizontal className="w-5 h-5 text-primary-600" />
                        <h2 className="font-bold text-lg">Filters</h2>
                        {activeCount > 0 && (
                            <span className="bg-primary-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                                {activeCount}
                            </span>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        {activeCount > 0 && (
                            <button onClick={onClear} className="text-xs text-primary-600 hover:underline font-medium">
                                Clear all
                            </button>
                        )}
                        <button onClick={onMobileClose} className="lg:hidden p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded">
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Filter Groups */}
                <div className="p-4 space-y-6">
                    {/* Manual Age Range Slider */}
                    <div>
                        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-3 flex justify-between items-center">
                            Age Range
                            <span className="text-primary-600 text-xs normal-case bg-primary-50 px-2 py-0.5 rounded">
                                {filters.ageMin || 18} - {filters.ageMax || 60} yrs
                            </span>
                        </h3>
                        <div className="px-2 space-y-4">
                            <div className="flex items-center gap-4">
                                <div className="flex-1">
                                    <label className="text-xs text-slate-500 mb-1 block">Min Age</label>
                                    <input
                                        type="range"
                                        min="18"
                                        max={filters.ageMax || 60}
                                        value={filters.ageMin || 18}
                                        onChange={(e) => onChange('ageMin', e.target.value)}
                                        className="w-full accent-primary-600 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                                    />
                                </div>
                                <div className="flex-1">
                                    <label className="text-xs text-slate-500 mb-1 block">Max Age</label>
                                    <input
                                        type="range"
                                        min={filters.ageMin || 18}
                                        max="60"
                                        value={filters.ageMax || 60}
                                        onChange={(e) => onChange('ageMax', e.target.value)}
                                        className="w-full accent-primary-600 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {Object.entries(FILTER_CONFIG).map(([key, config]) => (
                        <div key={key}>
                            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-3">
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
                                            className="w-4 h-4 text-primary-600 focus:ring-primary-500 border-slate-300 dark:border-slate-600 cursor-pointer"
                                        />
                                        <span className="text-sm text-slate-600 dark:text-slate-400 group-hover/item:text-primary-600 transition-colors">
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
const Profiles = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { user } = useSelector((state) => state.auth);
    const [profiles, setProfiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
    const [hasProfile, setHasProfile] = useState(false);
    const [filters, setFilters] = useState({
        community: '',
        gender: '',
        ageMin: '',
        ageMax: '',
        maritalStatus: '',
        workingPlace: ''
    });

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
                limit: 12
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
        setFilters({
            community: '',
            gender: '',
            ageMin: '',
            ageMax: '',
            maritalStatus: '',
            workingPlace: ''
        });
        setPage(1);
    };

    const activeFilterCount = Object.values(filters).filter(v => v).length;

    const handleLogout = () => {
        dispatch(logout());
        navigate('/');
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
            {/* Top Bar */}
            <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-30">
                <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={handleLogout}
                            className="text-primary-600 hover:text-primary-700 font-bold text-xl"
                        >
                            VidhiLikhit
                        </button>
                        <span className="hidden sm:inline text-slate-400">|</span>
                        <h1 className="hidden sm:inline text-lg font-semibold text-slate-700 dark:text-slate-300">
                            Browse Profiles
                        </h1>
                    </div>

                    <div className="flex items-center gap-3">
                        <span className="text-sm text-slate-500">
                            <span className="font-bold text-slate-900 dark:text-white">{total}</span> profiles
                        </span>

                        {/* Mobile filter toggle */}
                        <button
                            onClick={() => setMobileFilterOpen(true)}
                            className="lg:hidden btn btn-outline flex items-center gap-2 text-sm relative"
                        >
                            <SlidersHorizontal className="w-4 h-4" />
                            Filters
                            {activeFilterCount > 0 && (
                                <span className="absolute -top-1 -right-1 bg-primary-600 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                                    {activeFilterCount}
                                </span>
                            )}
                        </button>

                        <button
                            onClick={() => navigate('/create-profile')}
                            className="btn btn-primary text-sm"
                        >
                            {hasProfile ? '✎ Edit Profile' : '+ Create Profile'}
                        </button>

                        {!user?.isAdmin && (
                            user?.subscriptionStatus === 'active' && user?.remainingViews > 0 ? (
                                <div className="hidden md:flex items-center px-3 py-1 bg-slate-100 dark:bg-slate-700 rounded-full border border-slate-200 dark:border-slate-600 text-xs font-medium text-slate-700 dark:text-slate-300">
                                    <span className="text-primary-600 dark:text-primary-400 font-bold mr-1">{user.remainingViews}</span> Unlocks Left
                                </div>
                            ) : (
                                <button
                                    onClick={() => navigate('/payment')}
                                    className="hidden md:flex items-center px-4 py-1.5 rounded-full text-xs font-bold
                                               bg-primary-600 text-white hover:bg-primary-700 shadow-sm transition-colors"
                                >
                                    {user?.subscriptionStatus === 'active' && user?.remainingViews === 0 ? 'Renew Subscription' : 'Buy Subscription'}
                                </button>
                            )
                        )}

                        <RefreshPageButton />

                        <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 mx-2 hidden sm:block"></div>

                        <div className="hidden sm:flex items-center gap-3">
                            {user?.photoUrl ? (
                                <img
                                    src={user.photoUrl}
                                    alt={user.firstName || user.username}
                                    className="w-8 h-8 rounded-full object-cover border border-slate-200 cursor-pointer"
                                    onClick={() => navigate(hasProfile ? '/profile/me' : '/create-profile')}
                                    title={user.firstName || user.username}
                                />
                            ) : (
                                <div
                                    className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-bold text-xs cursor-pointer"
                                    onClick={() => navigate(hasProfile ? '/profile/me' : '/create-profile')}
                                    title={user?.firstName || user?.username}
                                >
                                    {(user?.firstName || user?.username || 'U').charAt(0).toUpperCase()}
                                </div>
                            )}
                            <button
                                onClick={() => {
                                    dispatch(logout());
                                    navigate('/');
                                }}
                                className="text-slate-500 hover:text-red-600 transition-colors p-1"
                                title="Logout"
                            >
                                <LogOut className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>
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
                        {/* Active Filters */}
                        {activeFilterCount > 0 && (
                            <div className="flex flex-wrap gap-2 mb-4">
                                {Object.entries(filters).map(([key, value]) => {
                                    if (!value) return null;
                                    const config = FILTER_CONFIG[key];
                                    const option = config?.options.find(o => o.value === value);
                                    return (
                                        <span
                                            key={key}
                                            className="inline-flex items-center gap-1 px-3 py-1 bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-full text-sm"
                                        >
                                            {config?.label}: {option?.label || value}
                                            <button
                                                onClick={() => handleFilterChange(key, '')}
                                                className="hover:text-primary-900 ml-1"
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
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                {Array.from({ length: 8 }).map((_, i) => (
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
                                    <button onClick={clearFilters} className="btn btn-outline">
                                        Clear Filters
                                    </button>
                                )}
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
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
        </div>
    );
};

export default Profiles;
