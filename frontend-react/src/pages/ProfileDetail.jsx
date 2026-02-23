import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { toast } from 'sonner';
import {
    ArrowLeft, Heart, MapPin, Briefcase, GraduationCap, Calendar, Ruler,
    Phone, Mail, Users, Star, Clock, Shield, Edit3, User, Loader2, Lock, LogOut,
    ChevronLeft, ChevronRight, FileText, Download
} from 'lucide-react';
import { logout } from '../redux/slices/authSlice';
import { getProfileById, unlockProfile, deleteProfile } from '../services/profileService';


// ─── Detail Row Component ───────────────────────────────────────
const DetailRow = ({ icon: Icon, label, value, iconColor = 'text-primary-500' }) => {
    if (!value || value === 'N/A') return null;
    return (
        <div className="flex items-start gap-3 py-2.5">
            <Icon className={`w-4.5 h-4.5 ${iconColor} mt-0.5 flex-shrink-0`} />
            <div className="flex-1 min-w-0">
                <p className="text-xs text-slate-400 uppercase tracking-wider font-medium">{label}</p>
                <p className="text-sm text-slate-800 dark:text-slate-200 font-medium mt-0.5">{value}</p>
            </div>
        </div>
    );
};

// ─── Section Component ──────────────────────────────────────────
const Section = ({ title, children }) => (
    <div className="mb-6">
        <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-3 pb-2 border-b border-slate-100 dark:border-slate-700">
            {title}
        </h3>
        <div className="space-y-1">{children}</div>
    </div>
);

// ─── Loading Skeleton ───────────────────────────────────────────
const DetailSkeleton = () => (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-8 px-4">
        <div className="max-w-6xl mx-auto">
            <div className="animate-pulse">
                <div className="h-8 w-32 bg-slate-200 dark:bg-slate-700 rounded mb-6" />
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="aspect-[3/4] bg-slate-200 dark:bg-slate-700 rounded-2xl" />
                    <div className="space-y-4">
                        <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-3/4" />
                        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/2" />
                        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-2/3" />
                        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/3" />
                        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4" />
                        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/2" />
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

    const handleUnlock = async () => {
        try {
            const response = await unlockProfile(id);
            if (response.success) {
                toast.success('Profile unlocked successfully!');
                setProfile(response.data);
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
                // Force a reload of the user state or just navigate away
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
            // We need to fetch the blob manually to handle the download
            // profileService doesn't have a specific method yet, but we can add it or call api directly.
            // Let's add it to profileService for consistency, but for now direct is fine if service is not open.
            // Actually, I should update profileService first.
            // But let's check if I can just use the token.
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

            // Ensure we handle it as a blob correctly with specific type
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

    // Format age display
    const ageDisplay = profile.age ? `${profile.age} years` : null;

    // Format date of birth
    const dobDisplay = profile.dateOfBirth
        ? new Date(profile.dateOfBirth).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
        : null;

    return (
        <div className="h-[100dvh] bg-slate-50 dark:bg-slate-900 flex flex-col overflow-hidden">
            {/* Top Navigation */}
            <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex-none z-30">
                <div className="max-w-6xl mx-auto px-3 sm:px-4 py-3 flex items-center justify-between">
                    <button
                        onClick={() => navigate('/profiles')}
                        className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-primary-600 transition-colors font-medium"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        <span className="hidden sm:inline">Back to Profiles</span>
                    </button>

                    <div className="flex items-center gap-2 sm:gap-4">
                        <div className="flex items-center gap-2">
                            <span className="text-xs bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 px-3 py-1 rounded-full font-semibold">
                                {profile.profileCode}
                            </span>
                        </div>

                        {/* Download PDF Button - Visible to everyone who can unlock or owner/admin */}
                        {(isUnlocked || (user && (profile.userId === user.id || user.role === 'admin'))) && (
                            <button
                                onClick={handleDownloadPdf}
                                disabled={isDownloading}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                title="Download Biodata"
                            >
                                {isDownloading ? (
                                    <Loader2 className="w-4 h-4 animate-spin text-primary-600" />
                                ) : (
                                    <FileText className="w-4 h-4" />
                                )}
                                <span className="hidden sm:inline">{isDownloading ? 'Downloading...' : 'PDF'}</span>
                            </button>
                        )}

                        <div className="hidden md:flex items-center px-3 py-1 bg-slate-100 dark:bg-slate-700 rounded-full border border-slate-200 dark:border-slate-600 text-xs font-medium text-slate-700 dark:text-slate-300">
                            <span className="text-primary-600 dark:text-primary-400 font-bold mr-1">{user?.remainingViews || 0}</span> Unlocks Left
                        </div>


                        <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 hidden sm:block"></div>

                        <div className="flex items-center gap-2 sm:gap-3">
                            {user?.photoUrl ? (
                                <img
                                    src={user.photoUrl}
                                    alt={user.firstName || user.username}
                                    className="w-8 h-8 rounded-full object-cover border border-slate-200 cursor-pointer"
                                    onClick={() => navigate('/profile/me')}
                                    title={user.firstName || user.username}
                                />
                            ) : (
                                <div
                                    className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-bold text-xs cursor-pointer"
                                    onClick={() => navigate('/profile/me')}
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

            {/* Main Content — scrollable on mobile, fixed h/overflow-hidden on desktop */}
            <div className="w-full max-w-6xl mx-auto px-4 py-6 lg:py-0 flex-1 overflow-y-auto lg:overflow-hidden min-h-0">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 lg:h-full">

                    {/* ─── Left: Photo Gallery ─── */}
                    <div className="flex flex-col items-center gap-3 lg:py-10 lg:self-center">
                        {/* Main Photo — compact square */}
                        <div className="relative w-full max-w-md aspect-square rounded-2xl overflow-hidden bg-gradient-to-br from-primary-100 to-secondary-100 dark:from-slate-700 dark:to-slate-600 shadow-lg mx-auto">
                            {mainPhoto ? (
                                <img
                                    src={mainPhoto}
                                    alt={profile.firstName}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex flex-col items-center justify-center">
                                    <User className="w-20 h-20 text-slate-300 dark:text-slate-500" />
                                    <p className="text-slate-400 mt-2 text-sm">No photo available</p>
                                </div>
                            )}

                            {/* Prev / Next */}
                            {photos && photos.length > 1 && (
                                <>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); setSelectedPhoto((prev) => (prev - 1 + photos.length) % photos.length); }}
                                        className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 bg-black/30 hover:bg-black/50 text-white rounded-full backdrop-blur-sm transition-all"
                                    >
                                        <ChevronLeft className="w-5 h-5" />
                                    </button>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); setSelectedPhoto((prev) => (prev + 1) % photos.length); }}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-black/30 hover:bg-black/50 text-white rounded-full backdrop-blur-sm transition-all"
                                    >
                                        <ChevronRight className="w-5 h-5" />
                                    </button>
                                </>
                            )}

                            {/* Age Badge */}
                            {profile.age && (
                                <div className="absolute bottom-3 left-3 bg-primary-600/90 backdrop-blur-sm text-white px-3 py-1 rounded-full font-bold text-sm shadow">
                                    {profile.age} yrs
                                </div>
                            )}

                            {/* Lock Badge */}
                            <div className={`absolute top-3 right-3 backdrop-blur-sm text-white text-xs px-2.5 py-1 rounded-full font-medium flex items-center gap-1 ${isUnlocked ? 'bg-green-500/80' : 'bg-slate-800/60'}`}>
                                {isUnlocked ? <Shield className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                                {isUnlocked ? 'Unlocked' : 'Locked'}
                            </div>
                        </div>

                        {/* Thumbnail strip — only when multiple photos */}
                        {photos && photos.length > 1 && (
                            <div className="flex gap-2 justify-center flex-wrap max-w-sm">
                                {photos.map((p, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setSelectedPhoto(idx)}
                                        className={`w-14 h-14 rounded-lg overflow-hidden border-2 transition-all flex-shrink-0 ${selectedPhoto === idx
                                            ? 'border-primary-500 shadow-md scale-105'
                                            : 'border-transparent opacity-60 hover:opacity-100'}`}
                                    >
                                        <img src={p.url} alt={`Photo ${idx + 1}`} className="w-full h-full object-cover" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>


                    {/* ─── Right: Profile Details (scrollable details only) ─── */}
                    <div className="lg:h-full lg:py-10 lg:pr-2 flex flex-col lg:overflow-hidden">
                        {/* Name & Basic Info Header (Fixed) */}
                        <div className="mb-6 flex-none">
                            {/* MY PROFILE DASHBOARD - Only visible for own profile */}
                            {user && profile.userId === user.id && (
                                <div className="mb-6">
                                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-3">
                                        <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-secondary-600">
                                            My Profile
                                        </h2>
                                        <div className="flex flex-wrap gap-2 sm:gap-3">
                                            <button
                                                onClick={() => navigate('/create-profile')} // Assuming create-profile handles edit/update logic based on existence
                                                className="btn bg-orange-500 hover:bg-orange-600 text-white flex items-center gap-2 px-3 py-2 text-sm"
                                            >
                                                <Edit3 className="w-4 h-4" /> Edit
                                            </button>
                                            <button
                                                onClick={handleDelete}
                                                disabled={isDeleting}
                                                className="btn bg-red-600 hover:bg-red-700 text-white flex items-center gap-2 px-3 py-2 text-sm disabled:opacity-50"
                                            >
                                                {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogOut className="w-4 h-4" />}
                                                Delete
                                            </button>
                                        </div>
                                    </div>

                                    <div className="bg-orange-50 dark:bg-orange-900/10 border border-orange-100 dark:border-orange-900/30 rounded-xl p-4 mb-6">
                                        <h3 className="text-orange-600 dark:text-orange-400 font-bold mb-3 border-b border-orange-200 dark:border-orange-800 pb-2">
                                            Profile Status
                                        </h3>
                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                            <div className="bg-white dark:bg-slate-800 p-3 rounded-lg border border-slate-100 dark:border-slate-700 shadow-sm">
                                                <p className="text-xs text-slate-500">Status</p>
                                                <p className="font-bold text-slate-800 dark:text-slate-200 text-sm mt-1 flex items-center gap-1.5">
                                                    {profile.isActive ? (
                                                        <span className="text-green-600 flex items-center gap-1">✔ Active</span>
                                                    ) : (
                                                        <span className="text-red-600">Inactive</span>
                                                    )}
                                                </p>
                                            </div>
                                            <div className="bg-white dark:bg-slate-800 p-3 rounded-lg border border-slate-100 dark:border-slate-700 shadow-sm">
                                                <p className="text-xs text-slate-500">Published</p>
                                                <p className="font-bold text-slate-800 dark:text-slate-200 text-sm mt-1 flex items-center gap-1.5">
                                                    {profile.isPublished ? (
                                                        <span className="text-green-600 flex items-center gap-1">✔ Yes</span>
                                                    ) : (
                                                        <span className="text-amber-600">Pending</span>
                                                    )}
                                                </p>
                                            </div>
                                            <div className="bg-white dark:bg-slate-800 p-3 rounded-lg border border-slate-100 dark:border-slate-700 shadow-sm">
                                                <p className="text-xs text-slate-500">Subscription</p>
                                                <p className="font-bold text-slate-800 dark:text-slate-200 text-sm mt-1 flex items-center gap-1.5">
                                                    {profile.subscriptionStatus === 'active' ? (
                                                        <span className="text-green-600 flex items-center gap-1">✔ Active</span>
                                                    ) : (
                                                        <span className="text-slate-500 capitalize">{profile.subscriptionStatus || 'None'}</span>
                                                    )}
                                                </p>
                                            </div>
                                            <div className="bg-white dark:bg-slate-800 p-3 rounded-lg border border-slate-100 dark:border-slate-700 shadow-sm">
                                                <p className="text-xs text-slate-500">Created</p>
                                                <p className="font-bold text-slate-800 dark:text-slate-200 text-sm mt-1">
                                                    {new Date(profile.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-1">
                                {(isUnlocked || (user && profile.userId === user.id))
                                    ? `${profile.firstName} ${profile.lastName || ''}`.trim()
                                    : profile.firstName}
                            </h1>
                            <p className="text-slate-500 text-sm">
                                Profile Code: <span className="font-semibold text-primary-600">{profile.profileCode}</span>
                            </p>

                            {/* Quick Stats */}
                            <div className="flex flex-wrap gap-2 mt-4">
                                {ageDisplay && (
                                    <span className="inline-flex items-center gap-1.5 text-sm bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 px-3 py-1.5 rounded-full font-medium">
                                        <Calendar className="w-3.5 h-3.5" /> {ageDisplay}
                                    </span>
                                )}
                                {profile.maritalStatus && (
                                    <span className="inline-flex items-center gap-1.5 text-sm bg-secondary-50 dark:bg-secondary-900/20 text-secondary-700 dark:text-secondary-300 px-3 py-1.5 rounded-full font-medium capitalize">
                                        <Heart className="w-3.5 h-3.5" /> {profile.maritalStatus}
                                    </span>
                                )}
                                {profile.currentLocation && (
                                    <span className="inline-flex items-center gap-1.5 text-sm bg-accent-50 dark:bg-accent-900/20 text-accent-700 dark:text-accent-300 px-3 py-1.5 rounded-full font-medium">
                                        <MapPin className="w-3.5 h-3.5" /> {profile.currentLocation}
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Details CardContainer (Scrollable) */}
                        <div className="flex-1 lg:overflow-y-auto min-h-0 scrollbar-thin pr-2">
                            <div className="card p-6 space-y-0">
                                {/* Personal Section */}
                                <Section title="Personal Details">
                                    <DetailRow icon={Calendar} label="Date of Birth" value={dobDisplay} />
                                    <DetailRow icon={Ruler} label="Height" value={profile.height} />
                                    <DetailRow icon={Heart} label="Marital Status" value={profile.maritalStatus} />
                                    <DetailRow icon={Users} label="Profile For" value={profile.profileFor} />
                                </Section>

                                {/* Community Section */}
                                <Section title="Community Details">
                                    <DetailRow icon={Star} label="Caste" value={profile.caste} iconColor="text-secondary-500" />
                                    <DetailRow icon={Star} label="Sub-Caste" value={profile.subCaste} iconColor="text-secondary-500" />
                                    <DetailRow icon={Star} label="Gotra" value={profile.gotra} iconColor="text-secondary-500" />
                                    <DetailRow icon={Star} label="Rashi" value={profile.rashi} iconColor="text-secondary-500" />
                                    <DetailRow icon={Star} label="Nakshatra" value={profile.nakshatra} iconColor="text-secondary-500" />
                                    <DetailRow icon={Star} label="Nadi" value={profile.nadi} iconColor="text-secondary-500" />
                                    <DetailRow icon={Clock} label="Time of Birth" value={profile.timeOfBirth} iconColor="text-secondary-500" />
                                </Section>

                                {/* Professional Section */}
                                <Section title="Professional Details">
                                    <DetailRow icon={GraduationCap} label="Education" value={profile.education} iconColor="text-blue-500" />
                                    <DetailRow icon={Briefcase} label="Occupation" value={profile.occupation} iconColor="text-blue-500" />
                                    <DetailRow icon={Briefcase} label="Annual Income" value={profile.annualIncome} iconColor="text-blue-500" />
                                    <DetailRow icon={Briefcase} label="Assets" value={profile.assets} iconColor="text-blue-500" />
                                    <DetailRow icon={MapPin} label="Working Place" value={profile.workingPlace} iconColor="text-blue-500" />
                                </Section>

                                {/* Family — only when unlocked */}
                                {isUnlocked && (
                                    <Section title="Family Details">
                                        <DetailRow icon={User} label="Father's Name" value={profile.fatherName} iconColor="text-green-500" />
                                        <DetailRow icon={User} label="Mother's Name" value={profile.motherName} iconColor="text-green-500" />
                                        <DetailRow icon={Users} label="Brothers" value={profile.brother} iconColor="text-green-500" />
                                        <DetailRow icon={Users} label="Sisters" value={profile.sister} iconColor="text-green-500" />
                                    </Section>
                                )}

                                {/* Contact — only when unlocked */}
                                {isUnlocked && (
                                    <Section title="Contact Details">
                                        <DetailRow icon={Phone} label="Contact Number" value={profile.contactNumber} iconColor="text-emerald-500" />
                                        <DetailRow icon={MapPin} label="Postal Address" value={profile.postalAddress} iconColor="text-emerald-500" />
                                        <DetailRow icon={User} label="Sender's Info" value={profile.sendersInfo} iconColor="text-emerald-500" />
                                    </Section>
                                )}

                                {/* Expectations */}
                                {profile.expectations && (
                                    <Section title="Partner Expectations">
                                        <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl">
                                            {profile.expectations}
                                        </p>
                                    </Section>
                                )}

                                {/* Locked Notice */}
                                {!isUnlocked && (
                                    <div className="bg-gradient-to-r from-primary-50 to-secondary-50 dark:from-primary-900/20 dark:to-secondary-900/20 rounded-xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4 mt-4 border border-primary-100 dark:border-primary-800">
                                        <div className="flex items-start gap-3">
                                            <div className="p-2 bg-white dark:bg-slate-800 rounded-lg shadow-sm">
                                                <Lock className="w-6 h-6 text-primary-600" />
                                            </div>
                                            <div>
                                                <p className="text-base font-bold text-slate-800 dark:text-slate-200">Profile Locked</p>
                                                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-sm">
                                                    Unlock this profile to view family details, contact information, and more.
                                                </p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={handleUnlock}
                                            className="btn btn-primary whitespace-nowrap px-6 py-2.5 shadow-lg shadow-primary-500/30 hover:shadow-primary-500/40"
                                        >
                                            Unlock Profile
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div >
    );
};

export default ProfileDetail;
