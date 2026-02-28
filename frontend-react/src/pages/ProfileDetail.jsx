import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { toast } from 'sonner';
import {
    ArrowLeft, Heart, MapPin, Briefcase, GraduationCap, Calendar, Ruler,
    Phone, Mail, Users, Star, Clock, Shield, Edit3, User, Loader2, Lock, LogOut,
    ChevronLeft, ChevronRight, FileText, Download, LayoutDashboard
    ChevronLeft, ChevronRight, FileText, Download, CheckCircle, AlertCircle, X
} from 'lucide-react';
import { logout, updateUser } from '../redux/slices/authSlice';
import { getProfileById, unlockProfile, deleteProfile } from '../services/profileService';
import RefreshPageButton from '../components/common/RefreshPageButton';

// ─── Detail Row Component ───────────────────────────────────────
const DetailRow = ({ icon: Icon, label, value, iconColor = 'text-primary-500', className = '' }) => {
    if (!value || value === 'N/A') return null;
    return (
        <div className={`flex items-start gap-4 p-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-xl transition-colors ${className}`}>
            <div className={`p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-sm flex-shrink-0 ${iconColor}`}>
                <Icon className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0 flex flex-col justify-center">
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mb-0.5">{label}</p>
                <p className="text-sm text-slate-900 dark:text-slate-100 font-semibold">{value}</p>
            </div>
        </div>
    );
};

// ─── Section Component ──────────────────────────────────────────
const Section = ({ title, children, icon: Icon, iconColor = 'text-slate-500' }) => (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden mb-6 transition-all hover:shadow-md">
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 flex items-center gap-3">
            {Icon && <Icon className={`w-5 h-5 ${iconColor}`} />}
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                {title}
            </h3>
        </div>
        <div className="p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4">
            {children}
        </div>
    </div>
);

// ─── Loading Skeleton ───────────────────────────────────────────
const DetailSkeleton = () => (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
        <div className="h-48 md:h-64 bg-slate-200 dark:bg-slate-800 animate-pulse" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-24 relative z-10 pb-20">
            <div className="flex flex-col md:flex-row gap-8">
                <div className="w-full md:w-1/3 lg:w-1/4 animate-pulse">
                    <div className="aspect-[4/5] bg-slate-300 dark:bg-slate-700 rounded-2xl border-4 border-white dark:border-slate-800 shadow-xl" />
                    <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded mt-4 w-1/2 mx-auto" />
                </div>
                <div className="w-full md:w-2/3 lg:w-3/4 pt-8 md:pt-24 space-y-6 animate-pulse">
                    <div className="h-10 bg-slate-200 dark:bg-slate-700 rounded w-1/2" />
                    <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-1/4" />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
                        <div className="h-24 bg-slate-200 dark:bg-slate-700 rounded-xl" />
                        <div className="h-24 bg-slate-200 dark:bg-slate-700 rounded-xl" />
                    </div>
                </div>
            </div>
        </div>
    </div>
);

// ─── Main Component ─────────────────────────────────────────────
const ProfileDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { user } = useSelector((state) => state.auth);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedPhoto, setSelectedPhoto] = useState(0);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);
    const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);

    const handleUnlock = async () => {
        const confirmUnlock = window.confirm("Are you sure you want to unlock this profile? This will consume 1 view from your subscription.");
        if (!confirmUnlock) return;

        try {
            const response = await unlockProfile(id);
            if (response.success) {
                toast.success('Profile unlocked successfully!');
                setProfile(response.data);

                // Update the Redux store with the new remainingViews count
                if (response.remainingViews !== undefined) {
                    dispatch(updateUser({ remainingViews: response.remainingViews }));
                }
            } else {
                if (response.message?.toLowerCase().includes('upgrade') || response.message?.toLowerCase().includes('plan')) {
                    toast.error(response.message);
                    navigate('/payment');
                } else {
                    toast.error(response.message || 'Failed to unlock profile');
                }
            }
        } catch (error) {
            toast.error(error.message || 'Failed to unlock profile');
            if (error.status === 403) {
                navigate('/payment');
            }
        }
    };

    const handleDelete = async () => {
        if (!window.confirm('Are you sure you want to delete your profile? This action will deactivate your account.')) {
            return;
        }

        setIsDeleting(true);
        try {
            const response = await deleteProfile(profile._id);
            if (response.success) {
                toast.success(response.message || 'Profile deleted successfully');
                navigate('/');
            } else {
                toast.error(response.message || 'Failed to delete profile');
            }
        } catch (error) {
            toast.error(error.message || 'Failed to delete profile');
        } finally {
            setIsDeleting(false);
        }
    };

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await getProfileById(id);
                if (response.success) {
                    setProfile(response.data);
                } else {
                    toast.error('Failed to load profile');
                    navigate('/profiles');
                }
            } catch (error) {
                toast.error(error.message || 'Profile not found');
                navigate('/profiles');
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, [id, navigate]);

    const handleDownloadPdf = async () => {
        setIsDownloading(true);
        try {
            const token = localStorage.getItem('accessToken');
            if (!token) {
                toast.error('Please login to download PDF');
                navigate('/login');
                return;
            }

            const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/profiles/${id}/pdf`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to download PDF');
            }

            const blob = await response.blob();
            const pdfBlob = new Blob([blob], { type: 'application/pdf' });
            const url = window.URL.createObjectURL(pdfBlob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `Profile_${profile.profileCode}.pdf`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            toast.success('PDF downloaded successfully');
        } catch (error) {
            console.error('Download error:', error);
            toast.error(error.message || 'Failed to download PDF');
        } finally {
            setIsDownloading(false);
        }
    };

    if (loading) return <DetailSkeleton />;
    if (!profile) return null;

    const isUnlocked = profile.isUnlocked;
    const photos = profile.photos?.length > 0 ? profile.photos : null;
    const mainPhoto = (photos && photos[selectedPhoto]?.url) || profile.photoUrl;

    const ageDisplay = profile.age ? `${profile.age} years` : null;
    const dobDisplay = profile.dateOfBirth
        ? new Date(profile.dateOfBirth).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
        : null;

    const isOwner = user && profile.userId === user.id;

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-20">
            {/* ─── Top Navigation Bar ─── */}
            <div className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 supports-[backdrop-filter]:bg-white/60">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
                    <button
                        onClick={() => navigate('/profiles')}
                        className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors font-medium group"
                    >
                        <div className="p-1.5 rounded-full bg-slate-100 dark:bg-slate-800 group-hover:bg-primary-50 dark:group-hover:bg-primary-900/30 transition-colors">
                            <ArrowLeft className="w-4 h-4" />
                        </div>
                        <span className="hidden sm:inline">Back to Search</span>
                    </button>

                    <div className="flex items-center gap-3 sm:gap-4">
                        {/* Profile Code Badge */}
                        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-full border border-slate-200 dark:border-slate-700">
                            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium tracking-wider uppercase">ID</span>
                            <span className="text-sm text-slate-900 dark:text-white font-bold tracking-wide">{profile.profileCode}</span>
                        </div>

                        {/* Download PDF Button */}
                        {(isUnlocked || isOwner || user?.role === 'admin') && (
                            <button
                                onClick={handleDownloadPdf}
                                disabled={isDownloading}
                                className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-200 hover:border-primary-300 dark:hover:border-primary-700 hover:text-primary-600 dark:hover:text-primary-400 hover:shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                title="Download Biodata"
                            >
                                {isDownloading ? <Loader2 className="w-4 h-4 animate-spin text-primary-600" /> : <Download className="w-4 h-4" />}
                                <span className="hidden sm:inline">{isDownloading ? 'Generating...' : 'Download PDF'}</span>
                            </button>
                        )}

                        {/* Unlocks Remaining */}
                        <div className="hidden md:flex flex-col items-end">
                            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">Remaining</span>
                            <div className="flex items-center gap-1.5 text-sm font-medium text-slate-900 dark:text-slate-100">
                                <Shield className="w-3.5 h-3.5 text-primary-500" />
                                <span><span className="font-bold text-primary-600 dark:text-primary-400">{user?.remainingViews || 0}</span> Unlocks</span>
                            </div>
                        </div>

                        <div className="w-px h-8 bg-slate-200 dark:bg-slate-700 hidden sm:block mx-1"></div>

                        {/* User Interaction */}
                        <div className="flex items-center gap-2">
                            {user?.photoUrl ? (
                                <img
                                    src={user.photoUrl}
                                    alt={user.firstName || user.username}
                                    className="w-9 h-9 rounded-full object-cover border-2 border-white dark:border-slate-800 shadow-sm cursor-pointer hover:border-primary-200 transition-colors"
                                    onClick={() => navigate('/profile/me')}
                                />
                            ) : (
                                <div
                                    className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 text-white flex items-center justify-center font-bold text-sm shadow-sm cursor-pointer hover:opacity-90 transition-opacity"
                                    onClick={() => navigate('/profile/me')}
                                >
                                    {(user?.firstName || user?.username || 'U').charAt(0).toUpperCase()}
                                </div>
                            )}
                            <button
                                onClick={() => { dispatch(logout()); navigate('/'); }}
                                className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-full transition-colors"
                                title="Logout"
                            >
                                <LogOut className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* ─── Hero Banner ─── */}
            <div className="relative bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-800">
                {/* Subtle Pattern Background Banner instead of bright gradient */}
                <div className="absolute inset-0 h-48 md:h-64 overflow-hidden bg-slate-100 dark:bg-slate-800/80">
                    <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjEiIGZpbGw9IiNjYmQ1ZTEiIGZpbGwtb3BhY2l0eT0iMC40Ii8+PC9zdmc+')] [mask-image:linear-gradient(to_bottom,white,transparent)]"></div>
                    <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white dark:from-slate-800 to-transparent"></div>
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative pt-20 md:pt-32 pb-8">
                    <div className="flex flex-col md:flex-row gap-6 md:gap-10 items-center md:items-end">

                        {/* Profile Photo Avatar */}
                        <div className="relative group w-40 h-40 md:w-56 md:h-56 flex-shrink-0 z-10 transition-transform duration-300 hover:scale-[1.02]">
                            <div className="absolute inset-0 bg-white dark:bg-slate-800 rounded-[2rem] md:rounded-[2.5rem] rotate-3 opacity-20 group-hover:rotate-6 transition-transform duration-300"></div>
                            <div className="absolute inset-0 bg-white dark:bg-slate-800 rounded-[2rem] md:rounded-[2.5rem] -rotate-3 opacity-20 group-hover:-rotate-6 transition-transform duration-300"></div>

                            <div
                                className={`relative w-full h-full rounded-[2rem] md:rounded-[2.5rem] border-4 md:border-8 border-white dark:border-slate-800 shadow-xl overflow-hidden bg-slate-100 dark:bg-slate-700 ${mainPhoto ? 'cursor-pointer' : ''}`}
                                onClick={() => mainPhoto && setIsPhotoModalOpen(true)}
                            >
                                {mainPhoto ? (
                                    <div className="group/img w-full h-full relative">
                                        <img
                                            src={mainPhoto}
                                            alt={profile.firstName}
                                            className="w-full h-full object-cover transition-transform duration-500 group-hover/img:scale-105"
                                        />
                                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover/img:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                                            <span className="text-white text-sm font-medium bg-black/50 px-3 py-1.5 rounded-full backdrop-blur-sm">View Photo</span>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800">
                                        <User className="w-16 md:w-20 h-16 md:h-20 text-slate-300 dark:text-slate-500" />
                                    </div>
                                )}

                                {/* Lock Status overlay on photo */}
                                <div className="absolute top-3 right-3 md:top-4 md:right-4 z-20">
                                    {isUnlocked ? (
                                        <div className="bg-green-500/90 text-white p-1.5 md:p-2 rounded-xl backdrop-blur-md shadow-lg" title="Profile Unlocked">
                                            <Shield className="w-4 h-4 md:w-5 md:h-5" />
                                        </div>
                                    ) : (
                                        <div className="bg-slate-900/80 text-white p-1.5 md:p-2 rounded-xl backdrop-blur-md shadow-lg" title="Profile Locked">
                                            <Lock className="w-4 h-4 md:w-5 md:h-5" />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Basic Info (Hero Content) */}
                        <div className="flex-1 text-center md:text-left pt-4 md:pt-0 md:pb-4 z-10">
                            <div className="sm:hidden mb-2 inline-flex items-center gap-1.5 px-3 py-1 bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300 rounded-full text-xs font-bold">
                                {profile.profileCode}
                            </div>

                            <h1 className="text-3xl md:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight drop-shadow-sm mb-2">
                                {(isUnlocked || isOwner)
                                    ? `${profile.firstName} ${profile.lastName || ''}`.trim()
                                    : profile.firstName}
                            </h1>

                            <p className="text-slate-500 dark:text-slate-400 text-lg md:text-xl font-medium mb-6">
                                {profile.education && <span>{profile.education}</span>}
                                {profile.education && profile.occupation && <span className="mx-2 text-slate-300">•</span>}
                                {profile.occupation && <span>{profile.occupation}</span>}
                            </p>

                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                                {ageDisplay && (
                                    <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-700/50 px-4 py-2 rounded-xl text-slate-700 dark:text-slate-300 font-medium border border-slate-200 dark:border-slate-700">
                                        <Calendar className="w-4 h-4 text-primary-500" />
                                        {ageDisplay}
                                    </div>
                                )}
                                {profile.height && (
                                    <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-700/50 px-4 py-2 rounded-xl text-slate-700 dark:text-slate-300 font-medium border border-slate-200 dark:border-slate-700">
                                        <Ruler className="w-4 h-4 text-emerald-500" />
                                        {profile.height}
                                    </div>
                                )}
                                {profile.maritalStatus && (
                                    <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-700/50 px-4 py-2 rounded-xl text-slate-700 dark:text-slate-300 font-medium capitalize border border-slate-200 dark:border-slate-700">
                                        <Heart className="w-4 h-4 text-rose-500" />
                                        {profile.maritalStatus}
                                    </div>
                                )}
                                {profile.currentLocation && profile.currentLocation !== 'N/A' && (
                                    <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-700/50 px-4 py-2 rounded-xl text-slate-700 dark:text-slate-300 font-medium border border-slate-200 dark:border-slate-700">
                                        <MapPin className="w-4 h-4 text-blue-500" />
                                        {profile.currentLocation}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ─── Main Content Grid ─── */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">

                {/* Owner Actions & Dashboard Banner */}
                {isOwner && (
                    <div className="mb-8 p-1 rounded-2xl bg-gradient-to-r from-orange-400 via-rose-400 to-pink-500 shadow-xl overflow-hidden">
                        <div className="bg-white dark:bg-slate-900 rounded-xl p-5 md:p-6 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
                            {/* Decorative background element */}
                            <div className="absolute right-0 top-0 w-64 h-64 bg-gradient-to-br from-orange-50 to-rose-50 dark:from-orange-900/10 dark:to-rose-900/10 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>

                            <div className="relative z-10 w-full md:w-auto">
                                <h2 className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-orange-600 to-rose-600 dark:from-orange-400 dark:to-rose-400 mb-1">
                                    My Profile Dashboard
                                </h2>
                                <p className="text-slate-600 dark:text-slate-400 text-sm font-medium">Manage your profile visibility and settings</p>

                                <div className="flex flex-wrap items-center gap-4 mt-4">
                                    <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-100 dark:border-slate-700 shadow-sm">
                                        <span className="text-xs text-slate-500 font-medium">Status:</span>
                                        {profile.isActive ? <span className="text-sm font-bold text-emerald-600 flex items-center gap-1"><CheckCircle className="w-3.5 h-3.5" /> Active</span> : <span className="text-sm font-bold text-rose-600 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" /> Inactive</span>}
                                    </div>
                                    <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-100 dark:border-slate-700 shadow-sm">
                                        <span className="text-xs text-slate-500 font-medium">Visible:</span>
                                        {profile.isPublished ? <span className="text-sm font-bold text-emerald-600 flex items-center gap-1"><CheckCircle className="w-3.5 h-3.5" /> Yes</span> : <span className="text-sm font-bold text-amber-600 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" /> Pending</span>}
                                    </div>
                                </div>
                            </div>

                            <div className="flex w-full md:w-auto gap-3 relative z-10">
                                <button
                                    onClick={() => navigate('/create-profile')}
                                    className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 dark:text-slate-900 text-white rounded-xl font-bold transition-all shadow-md hover:shadow-lg"
                                >
                                    <Edit3 className="w-4 h-4" /> Edit Profile
                                </button>
                                <button
                                    onClick={handleDelete}
                                    disabled={isDeleting}
                                    className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-rose-50 hover:bg-rose-100 dark:bg-rose-500/10 dark:hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 rounded-xl font-bold transition-all disabled:opacity-50"
                                >
                                    {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogOut className="w-4 h-4" />}
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">

                    {/* Left Sidebar (Gallery & Expectations) */}
                    <div className="lg:col-span-4 space-y-8">

                        {/* More Photos Gallery */}
                        {photos && photos.length > 1 && (
                            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-5">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="font-bold text-slate-800 dark:text-white">Photo Gallery</h3>
                                    <span className="text-xs font-semibold px-2 py-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-md">
                                        {photos.length} photos
                                    </span>
                                </div>
                                <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-3 gap-3">
                                    {photos.map((p, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => {
                                                setSelectedPhoto(idx);
                                                setIsPhotoModalOpen(true);
                                            }}
                                            className={`relative aspect-square rounded-xl overflow-hidden transition-all duration-200 group ${selectedPhoto === idx
                                                ? 'ring-4 ring-primary-500 ring-offset-2 dark:ring-offset-slate-800 scale-[0.98]'
                                                : 'hover:opacity-90 hover:ring-2 hover:ring-slate-300 hover:scale-105'}`}
                                        >
                                            <img src={p.url} alt={`Photo ${idx + 1}`} className="w-full h-full object-cover" />
                                            {selectedPhoto !== idx && (
                                                <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors duration-300"></div>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Partner Expectations (highlighted on the left for visibility) */}
                        {profile.expectations && (
                            <div className="bg-gradient-to-br from-primary-50 to-primary-100 dark:from-slate-800 dark:to-slate-800/80 rounded-2xl shadow-sm border border-primary-200/50 dark:border-slate-700 p-6 relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-4 opacity-10">
                                    <Heart className="w-24 h-24 text-primary-600" />
                                </div>
                                <div className="relative z-10">
                                    <h3 className="flex items-center gap-2 text-lg font-bold text-primary-900 dark:text-white mb-4">
                                        <Heart className="w-5 h-5 text-primary-500" />
                                        Partner Preferences
                                    </h3>
                                    <p className="text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                                        {profile.expectations}
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Profile Locked Banner (Sidebar for Desktop) */}
                        {!isUnlocked && (
                            <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 shadow-xl relative overflow-hidden text-center sm:text-left flex flex-col items-center sm:items-start">
                                {/* Decor */}
                                <div className="absolute -right-6 -top-6 w-24 h-24 bg-primary-500/20 rounded-full blur-2xl"></div>

                                <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mb-4 backdrop-blur-md">
                                    <Lock className="w-6 h-6 text-primary-400" />
                                </div>
                                <h3 className="text-white font-bold text-xl mb-2">Profile is Locked</h3>
                                <p className="text-slate-400 text-sm mb-6 leading-relaxed">
                                    Unlock this profile to view contact numbers and complete address details. Keep your search moving forward!
                                </p>
                                <button
                                    onClick={handleUnlock}
                                    className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-600 hover:to-secondary-600 text-white rounded-xl font-bold transition-all shadow-lg hover:shadow-primary-500/25 active:scale-[0.98]"
                                >
                                    <Shield className="w-5 h-5" /> Unlock Now
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Right Main Content (Details Sections) */}
                    <div className="lg:col-span-8 space-y-6">
                        {/* Personal & Religious Background */}
                        <Section title="Personal Background" icon={User} iconColor="text-indigo-500">
                            <DetailRow icon={Calendar} label="Date of Birth" value={dobDisplay} iconColor="text-indigo-500" />
                            <DetailRow icon={Clock} label="Time of Birth" value={profile.timeOfBirth} iconColor="text-indigo-500" />
                            <DetailRow icon={Ruler} label="Height" value={profile.height} iconColor="text-indigo-500" />
                            <DetailRow icon={Users} label="Profile For" value={profile.profileFor} iconColor="text-indigo-500" />
                            <DetailRow icon={Heart} label="Marital Status" value={profile.maritalStatus} iconColor="text-rose-500" className="col-span-1 sm:col-span-2" />
                        </Section>

                        <Section title="Community Details" icon={Star} iconColor="text-amber-500">
                            <DetailRow icon={Star} label="Caste" value={profile.caste} iconColor="text-amber-500" />
                            <DetailRow icon={Star} label="Sub-Caste" value={profile.subCaste} iconColor="text-amber-500" />
                            <DetailRow icon={Star} label="Gotra" value={profile.gotra} iconColor="text-amber-500" />
                            <DetailRow icon={Star} label="Rashi" value={profile.rashi} iconColor="text-amber-500" />
                            <DetailRow icon={Star} label="Nakshatra" value={profile.nakshatra} iconColor="text-amber-500" />
                            <DetailRow icon={Star} label="Nadi" value={profile.nadi} iconColor="text-amber-500" />
                        </Section>

                        {/* Education & Career */}
                        <Section title="Education & Career" icon={Briefcase} iconColor="text-blue-500">
                            <DetailRow icon={GraduationCap} label="Highest Education" value={profile.education} iconColor="text-blue-500" />
                            <DetailRow icon={Briefcase} label="Current Occupation" value={profile.occupation} iconColor="text-blue-500" />
                            <DetailRow icon={Briefcase} label="Annual Income" value={profile.annualIncome} iconColor="text-emerald-500" />
                            <DetailRow icon={MapPin} label="Working Place" value={profile.workingPlace} iconColor="text-blue-500" />
                            {profile.assets && (
                                <DetailRow icon={Briefcase} label="Assets / Properties" value={profile.assets} iconColor="text-emerald-500" className="col-span-1 sm:col-span-2" />
                            )}
                        </Section>

                        {/* Family details - Always show structure */}
                        <Section title="Family Details" icon={Users} iconColor="text-purple-500">
                            <DetailRow icon={User} label="Father's Name" value={profile.fatherName} iconColor="text-purple-500" />
                            <DetailRow icon={User} label="Mother's Name" value={profile.motherName} iconColor="text-purple-500" />
                            <DetailRow icon={Users} label="Brothers" value={profile.brother} iconColor="text-purple-500" />
                            <DetailRow icon={Users} label="Sisters" value={profile.sister} iconColor="text-purple-500" />
                        </Section>

                        {/* Contact details */}
                        <Section title="Contact Information" icon={Phone} iconColor="text-emerald-500">
                            {/* Unlocked fields */}
                            {isUnlocked ? (
                                <>
                                    <DetailRow icon={Phone} label="Primary Contact" value={profile.contactNumber} iconColor="text-emerald-500" />
                                    <DetailRow icon={MapPin} label="Complete Address" value={profile.postalAddress} iconColor="text-emerald-500" />
                                </>
                            ) : (
                                /* Locked placeholders for protected fields */
                                <div className="col-span-1 sm:col-span-2 flex flex-col sm:flex-row items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-dashed border-slate-300 dark:border-slate-600 gap-4">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-slate-200 dark:bg-slate-700 rounded-lg">
                                            <Lock className="w-5 h-5 text-slate-500" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-slate-800 dark:text-slate-200">Contact Details Hidden</p>
                                            <p className="text-xs text-slate-500">Phone number and addresses are locked.</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={handleUnlock}
                                        className="text-sm font-bold text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 underline underline-offset-2"
                                    >
                                        Unlock to View
                                    </button>
                                </div>
                            )}

                            {/* Always visible contact fields */}
                            <DetailRow icon={User} label="Profile Managed By" value={profile.sendersInfo} iconColor="text-slate-600 dark:text-slate-400" />
                        </Section>

                    </div>
                </div>
            </div>

            {/* ─── Photo Viewer Modal ─── */}
            {isPhotoModalOpen && mainPhoto && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <button
                        onClick={() => setIsPhotoModalOpen(false)}
                        className="absolute top-4 sm:top-6 right-4 sm:right-6 p-2 bg-white/10 hover:bg-white/25 rounded-full text-white transition-colors z-50"
                    >
                        <X className="w-6 h-6" />
                    </button>

                    <div className="relative w-full max-w-5xl h-[80vh] flex items-center justify-center">
                        <img
                            src={mainPhoto}
                            alt={`${profile.firstName}'s photo`}
                            className="max-w-full max-h-full object-contain rounded-lg"
                        />

                        {/* Prev / Next Controls for Modal */}
                        {photos && photos.length > 1 && (
                            <>
                                <button
                                    onClick={(e) => { e.stopPropagation(); setSelectedPhoto((prev) => (prev - 1 + photos.length) % photos.length); }}
                                    className="absolute left-0 sm:-left-12 top-1/2 -translate-y-1/2 p-3 bg-black/50 hover:bg-white/20 text-white rounded-full backdrop-blur-md transition-all"
                                >
                                    <ChevronLeft className="w-6 h-6" />
                                </button>
                                <button
                                    onClick={(e) => { e.stopPropagation(); setSelectedPhoto((prev) => (prev + 1) % photos.length); }}
                                    className="absolute right-0 sm:-right-12 top-1/2 -translate-y-1/2 p-3 bg-black/50 hover:bg-white/20 text-white rounded-full backdrop-blur-md transition-all"
                                >
                                    <ChevronRight className="w-6 h-6" />
                                </button>

                                {/* Image Counter */}
                                <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 text-white/70 font-medium">
                                    {selectedPhoto + 1} / {photos.length}
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProfileDetail;
