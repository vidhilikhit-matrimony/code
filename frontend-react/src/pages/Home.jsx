import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
    Heart, Users, Shield, Star, Phone, Mail, CheckCircle,
    FileDown, List, PhoneCall, LogOut, Edit3, ChevronRight,
    MapPin, Award, LayoutDashboard, Search, Fingerprint, Activity, Sunrise, LogIn, LockOpen
} from 'lucide-react';
import { logout } from '../redux/slices/authSlice';
import { getMyProfile, getAllProfiles } from '../services/profileService';

import { FaWhatsapp } from 'react-icons/fa';

// Assumes we've copied the generated logo to src/assets/vidhilikhit_logo.png
import LogoImg from '../assets/vidhilikhit_logo.png';

// ─── Animations & Custom Styles ─────────────────────────────────
const STYLES = `
@keyframes fadeUp {
    from { opacity: 0; transform: translateY(40px); }
    to   { opacity: 1; transform: translateY(0); }
}
@keyframes fadeIn {
    from { opacity: 0; }
    to   { opacity: 1; }
}
.animate-fadeUp { animation: fadeUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) both; }
.animate-fadeIn { animation: fadeIn 1s ease both; }
.delay-100 { animation-delay: 0.1s; }
.delay-200 { animation-delay: 0.2s; }
.delay-300 { animation-delay: 0.3s; }
.delay-400 { animation-delay: 0.4s; }

/* Traditional Indian Color Palette Elements */
.text-primary-600 { color: #9A031E; }
.bg-primary-600 { background-color: #9A031E; }
.border-primary-600 { border-color: #9A031E; }
.text-indigo-500 { color: #F05D23; }
.bg-indigo-500 { background-color: #F05D23; }
.text-amber-500 { color: #E3B23C; }
.bg-amber-500 { background-color: #E3B23C; }

/* Mandala Texture overlay pattern */
.bg-slate-50 {
    background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M54.627 0l.83.83-1.66 1.66-.83-.83.83-.83zM0 54.627l.83.83-1.66 1.66-.83-.83.83-.83zm54.627-54.627l-1.66 1.66-.83-.83 1.66-1.66.83.83zm-54.627 54.627l-1.66 1.66-.83-.83 1.66-1.66.83.83zM15.255 0l.83.83-1.66 1.66-.83-.83.83-.83zm0 54.627l.83.83-1.66 1.66-.83-.83.83-.83zm-15.255-39.372l.83.83-1.66 1.66-.83-.83.83-.83zm54.627 0l.83.83-1.66 1.66-.83-.83.83-.83z' fill='%239A031E' fill-opacity='0.03' fill-rule='evenodd'/%3E%3C/svg%3E");
}

.premium-shadow {
    box-shadow: 0 10px 40px -10px rgba(154, 3, 30, 0.15);
}
.hover-premium-shadow:hover {
    box-shadow: 0 20px 50px -10px rgba(154, 3, 30, 0.25);
    transform: translateY(-4px);
}
.card-transition {
    transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}
`;

// ─── Intersection Observer hook ──────────────────────────────────
function useInView(threshold = 0.1) {
    const ref = useRef(null);
    const [inView, setInView] = useState(false);
    useEffect(() => {
        const obs = new IntersectionObserver(
            ([entry]) => { if (entry.isIntersecting) { setInView(true); obs.disconnect(); } },
            { threshold }
        );
        if (ref.current) obs.observe(ref.current);
        return () => obs.disconnect();
    }, [threshold]);
    return [ref, inView];
}

// ─── Section wrapper ────────────────────────────────
function Section({ children, className = '' }) {
    const [ref, inView] = useInView();
    return (
        <div
            ref={ref}
            className={`transition-all duration-[1000ms] ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'} ${className}`}
        >
            {children}
        </div>
    );
}

// ─── Suitable Matches Grid ───────────────────────────────────
function SuitableMatchesGrid({ onViewMore }) {
    const [profiles, setProfiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const { sessionSeed } = useSelector((state) => state.auth);

    useEffect(() => {
        (async () => {
            try {
                const res = await getAllProfiles({ limit: 4, seed: sessionSeed });
                if (res.success && Array.isArray(res.data?.profiles)) {
                    setProfiles(res.data.profiles);
                }
            } catch { /* silently fail for guests */ }
            finally { setLoading(false); }
        })();
    }, []);

    const getAge = (dob) => {
        if (!dob) return '—';
        const years = Math.floor((Date.now() - new Date(dob)) / (365.25 * 24 * 3600 * 1000));
        return isNaN(years) ? '—' : years;
    };

    return (
        <section className="py-24 bg-slate-50 bg-slate-50 border-t border-slate-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <Section>
                    <div className="text-center mb-16 max-w-3xl mx-auto">
                        <div className="flex justify-center mb-4">
                            <Sunrise className="w-8 h-8 text-indigo-500 opacity-80" />
                        </div>
                        <h2 className="text-4xl sm:text-5xl font-extrabold text-slate-900 mb-6 font-serif tracking-tight">
                            Explore Genuine <span className="text-primary-600">Profiles</span>
                        </h2>
                        <p className="text-lg text-slate-600 leading-relaxed">
                            A curated selection of verified biodatas from the Brahmin and Lingayat communities. Every detail is checked with care, ensuring trust in every connection.
                        </p>
                    </div>
                </Section>

                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <div key={i} className="rounded-xl bg-slate-200 animate-pulse h-96"></div>
                        ))}
                    </div>
                ) : profiles.length === 0 ? (
                    <div className="text-center py-16 text-slate-600 bg-white rounded-2xl border border-slate-200 premium-shadow">
                        Log in to view new verified profiles available in your community.
                    </div>
                ) : (
                    <Section>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                            {profiles.slice(0, 4).map((profile, idx) => (
                                <ProfileCard key={profile._id || idx} profile={profile} getAge={getAge} />
                            ))}
                        </div>
                    </Section>
                )}

                <Section>
                    <div className="text-center mt-16">
                        <button
                            onClick={onViewMore}
                            className="inline-flex items-center gap-3 px-10 py-4 rounded-md font-bold text-slate-50 bg-slate-900 hover:bg-primary-600 transition-colors card-transition shadow-lg"
                        >
                            View Full Profile Details <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>
                </Section>
            </div>
        </section>
    );
}

function ProfileCard({ profile, getAge }) {
    const firstPhoto = profile.photos?.[0]?.url || profile.photoUrl || null;
    const [imgError, setImgError] = useState(false);

    return (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden flex flex-col hover-premium-shadow card-transition cursor-pointer">
            <div className="relative h-64 bg-slate-50 overflow-hidden">
                {firstPhoto && !imgError ? (
                    <img
                        src={firstPhoto}
                        alt="Profile"
                        className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                        onError={() => setImgError(true)}
                    />
                ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
                        <Users className="w-16 h-16 mb-2 opacity-30" />
                    </div>
                )}
                <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm text-primary-600 border border-primary-600/20 text-[10px] font-bold px-3 py-1.5 rounded uppercase tracking-wider shadow-sm">
                    ID: {profile.profileCode || 'VERIFIED'}
                </div>
            </div>

            <div className="p-6 flex flex-col flex-1 border-t-4 border-primary-600">
                <h3 className="font-bold text-slate-900 text-xl mb-4 font-serif">
                    {profile.firstName || 'Member'} {profile.isUnlocked ? profile.lastName : ''}
                </h3>

                <div className="grid grid-cols-2 gap-y-4 gap-x-2 text-sm text-slate-600 mt-auto">
                    <div className="flex flex-col">
                        <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">Age / Height</span>
                        <span className="font-semibold">{getAge(profile.dateOfBirth)} yrs, {profile.height || '—'}</span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">Community</span>
                        <span className="font-semibold text-primary-600">{profile.caste || '—'}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ─── Download Modal ───────────────────────────────────────────────
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

function DownloadModal({ isOpen, onClose }) {
    const [community, setCommunity] = useState('all');
    const [gender, setGender] = useState('all');
    const [isDownloading, setIsDownloading] = useState(false);
    const [error, setError] = useState('');

    if (!isOpen) return null;

    const handleClose = () => {
        setCommunity(''); setGender(''); setError(''); setIsDownloading(false); onClose();
    };

    const handleDownload = async () => {
        setError(''); setIsDownloading(true);
        try {
            const query = new URLSearchParams({ community, gender }).toString();
            const url = `${API_BASE_URL}/reports/profiles/public?${query}`;
            const response = await fetch(url, { method: 'GET' });

            if (!response.ok) {
                let msg = 'Download failed. Please try again.';
                try {
                    const body = await response.json();
                    msg = body?.message || msg;
                } catch { }
                setError(msg); return;
            }

            const blob = await response.blob();
            const downloadUrl = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            const cd = response.headers.get('content-disposition');
            const match = cd?.match(/filename="?([^"]+)"?/i);
            link.href = downloadUrl;
            link.download = match ? match[1] : `VidhiLikhit_Profiles.pdf`;
            link.target = '_blank';
            document.body.appendChild(link);
            link.click(); document.body.removeChild(link);
            window.URL.revokeObjectURL(downloadUrl);
            handleClose();
        } catch (err) {
            setError('Network error. Please check your connection and try again.');
        } finally {
            setIsDownloading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm" onClick={handleClose}>
            <div className="bg-slate-50 rounded-xl p-8 w-full max-w-lg shadow-[0_20px_60px_rgba(0,0,0,0.5)] relative border-t-8 border-primary-600" onClick={e => e.stopPropagation()}>
                <button onClick={handleClose} className="absolute top-4 right-4 text-slate-400 hover:text-primary-600 transition-colors p-2">
                    <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                <div className="w-16 h-16 bg-white border border-slate-200 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                    <FileDown className="w-8 h-8 text-primary-600" />
                </div>

                <h2 className="text-2xl font-bold text-slate-900 mb-2 text-center font-serif">Download Verified PDFs</h2>
                <p className="text-slate-600 text-sm mb-8 text-center leading-relaxed">
                    Instantly download trusted, detailed biodata PDFs. A bright ray of hope for finding your perfect match in your community.
                </p>

                <div className="space-y-6">
                    <div>
                        <label className="block text-xs font-bold text-slate-600 mb-2 uppercase tracking-wide">Select Community</label>
                        <select
                            value={community} onChange={e => { setCommunity(e.target.value); setError(''); }}
                            className="w-full px-4 py-3 rounded-md border border-slate-200 bg-white text-slate-900 focus:outline-none focus:border-primary-600 focus:ring-1 focus:ring-crimson transition-colors"
                        >
                            <option value="all">All Communities</option>
                            <option value="brahmin">Brahmin</option>
                            <option value="lingayat">Lingayat</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-600 mb-2 uppercase tracking-wide">Select Gender</label>
                        <select
                            value={gender} onChange={e => { setGender(e.target.value); setError(''); }}
                            className="w-full px-4 py-3 rounded-md border border-slate-200 bg-white text-slate-900 focus:outline-none focus:border-primary-600 focus:ring-1 focus:ring-crimson transition-colors"
                        >
                            <option value="all">All Genders</option>
                            <option value="male">Groom</option>
                            <option value="female">Bride</option>
                        </select>
                    </div>

                    {error && <div className="text-rose-600 text-sm p-4 rounded-md font-medium border border-rose-200 bg-rose-50">{error}</div>}

                    <button
                        onClick={handleDownload} disabled={isDownloading}
                        className="w-full py-4 rounded-md font-bold text-white bg-primary-600 hover:bg-primary-800 shadow-lg disabled:opacity-50 transition-colors flex justify-center items-center gap-2 tracking-wide uppercase text-sm mt-4"
                    >
                        {isDownloading ? 'Structuring PDF...' : 'Download Profiles Now'}
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─── Main Component ──────────────────────────────────────────────
const Home = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { isAuthenticated, user } = useSelector((state) => state.auth);
    const [hasProfile, setHasProfile] = useState(false);
    const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);

    useEffect(() => {
        if (!isAuthenticated) return;
        (async () => {
            try {
                const res = await getMyProfile();
                if (res.success && res.data) setHasProfile(true);
            } catch { /* no profile */ }
        })();
    }, [isAuthenticated]);

    const handleLogout = () => { dispatch(logout()); navigate('/'); };

    return (
        <div className="min-h-screen bg-white font-sans text-slate-900 selection:bg-primary-600 selection:text-white">
            <style>{STYLES}</style>

            {/* ── HEADER NAVIGATION ── */}
            <div className="fixed top-0 left-0 right-0 z-[90] flex items-center justify-between px-6 py-3 bg-white border-b border-slate-200 shadow-sm">
                <button onClick={() => navigate('/')} className="flex items-center gap-3 focus:outline-none">
                    <img src={LogoImg} alt="VidhiLikhit Logo" className="h-12 w-auto object-contain" />
                    <div className="hidden sm:flex flex-col text-left">
                        <span className="font-serif font-bold text-xl leading-none text-slate-900">VidhiLikhit</span>
                        <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-slate-400 mt-1">Matrimony</span>
                    </div>
                </button>
                <div className="flex items-center gap-4">
                    {!user?.isAdmin && user?.subscriptionStatus === 'active' && (
                        <div className="hidden md:flex items-center px-4 py-2 rounded-md bg-slate-50 border border-slate-200 text-slate-600 text-sm font-bold">
                            <Star className="w-4 h-4 mr-2 text-amber-500" /> {user.remainingViews} Unlocks
                        </div>
                    )}


                    {user?.isAdmin && (
                        <button onClick={() => navigate('/admin/dashboard')} className="hidden lg:flex items-center text-sm font-bold text-slate-600 hover:text-primary-600 border border-slate-200 px-4 py-2 rounded-md">
                            <LayoutDashboard className="w-4 h-4 mr-2" /> Admin Console
                        </button>
                    )}

                    {isAuthenticated ? (
                        <>
                            <button
                                onClick={() => navigate('/unlocked-profiles')}
                                className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-md border border-slate-200 text-slate-600 hover:bg-primary-600 hover:text-white hover:border-primary-600 transition-colors font-bold text-sm"
                                title="View profiles you have unlocked"
                            >
                                <LockOpen className="w-4 h-4" /> Unlocked Profiles
                            </button>
                            <div
                                onClick={() => navigate(hasProfile ? '/profile/me' : '/create-profile')}
                                className="flex items-center gap-3 cursor-pointer py-1.5 px-3 pr-4 rounded-md border border-slate-200 bg-slate-50 hover:border-slate-300 transition-colors"
                            >
                                {user?.photoUrl ? (
                                    <img src={user.photoUrl} alt="User" className="w-8 h-8 rounded-full border border-slate-200 object-cover" />
                                ) : (
                                    <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center text-white font-bold text-sm">
                                        {(user?.firstName || 'U')[0]}
                                    </div>
                                )}
                                <span className="font-semibold text-sm hidden sm:block">{user?.firstName || 'Dashboard'}</span>
                            </div>
                            <button onClick={handleLogout} className="p-2 border border-slate-200 rounded-md text-slate-600 hover:text-primary-600 hover:bg-slate-50 transition-colors bg-white">
                                <LogOut className="w-5 h-5" />
                            </button>
                        </>
                    ) : (
                        <div className="flex items-center gap-3">
                            <button onClick={() => navigate('/login')} className="hidden sm:block font-bold text-sm text-slate-600 hover:text-primary-600 uppercase tracking-wider px-2">
                                Login
                            </button>
                            <button onClick={() => navigate('/register')} className="px-6 py-2.5 rounded-md bg-primary-600 text-white font-bold text-sm uppercase tracking-wider hover:bg-primary-800 shadow-md transition-colors">
                                Register Free
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* ── INFO-DENSE HERO SECTION ── */}
            <section className={`relative bg-black overflow-hidden ${isAuthenticated ? 'pt-[72px]' : 'pt-[72px]'}`}>
                {/* Traditional Background Image (Darkened for text readability) */}
                <div className="absolute inset-0 z-0">
                    <img
                        src="https://images.unsplash.com/photo-1621801306185-8c0ccf9c8eb8?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                        alt="Traditional Hindu Marriage Ritual"
                        className="w-full h-full object-cover opacity-40 focus:opacity-50 object-center"
                    />
                    {/* Deep gradient overlay merging left to right for content placement */}
                    <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/70 to-transparent" />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent" />
                </div>

                <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32 flex items-center min-h-[85vh]">
                    <div className="max-w-2xl animate-fadeUp space-y-8">

                        <div className="inline-flex items-center gap-3 px-4 py-2 rounded-sm bg-primary-600/90 backdrop-blur-sm border-l-4 border-gold text-white text-xs font-bold uppercase tracking-[0.2em] shadow-lg">
                            <Heart className="w-4 h-4 fill-white text-white" />
                            Trusted Matrimony Only For Brahmin & Lingayat Communities
                        </div>

                        <h1 className="text-5xl sm:text-6xl font-serif font-bold leading-[1.1] text-white my-6">
                            A Bright Ray of Hope. <br />
                            <span className="text-amber-500">Built on trust, tradition, and love.</span>
                        </h1>

                        <p className="text-lg text-gray-200 leading-relaxed max-w-xl font-medium border-l border-white/20 pl-6">
                            Finding your perfect life partner starts here. We bring traditional matchmaking into the modern world—secure, personalized, and effortless. Start exploring genuine profiles, connect with compatible matches, and take the first step toward your happily ever after.
                        </p>

                        <div className="flex flex-wrap gap-4 pt-6">
                            <button onClick={() => navigate(isAuthenticated ? (hasProfile ? '/profiles' : '/create-profile') : '/register')} className="px-10 py-4 rounded-md bg-indigo-500 hover:bg-indigo-600 text-white font-bold uppercase tracking-wider text-sm card-transition shadow-lg flex items-center gap-2">
                                {isAuthenticated ? 'Browse Matches' : 'Create Your Profile Free'}
                                <ChevronRight className="w-4 h-4" />
                            </button>
                            {!isAuthenticated && (
                                <button onClick={() => navigate('/login')} className="px-10 py-4 rounded-md bg-white hover:bg-gray-100 text-slate-900 font-bold uppercase tracking-wider text-sm card-transition shadow-lg flex items-center gap-2">
                                    <LogIn className="w-4 h-4" /> Login
                                </button>
                            )}
                        </div>

                        <div className="grid grid-cols-3 gap-6 pt-10 mt-10 border-t border-white/20">
                            <div>
                                <h4 className="text-white font-serif font-bold text-3xl mb-1">10K+</h4>
                                <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Verified Profiles</p>
                            </div>
                            <div>
                                <h4 className="text-amber-500 font-serif font-bold text-3xl mb-1">400+</h4>
                                <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Successful Weddings</p>
                            </div>
                            <div>
                                <h4 className="text-white font-serif font-bold text-3xl mb-1">2017</h4>
                                <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Established Year</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── 4-STEP "HOW IT WORKS" ── */}
            <section className="py-24 bg-white border-b border-slate-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <Section>
                        <div className="text-center max-w-3xl mx-auto mb-20">
                            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-serif mb-6">
                                How VidhiLikhit Works
                            </h2>
                            <p className="text-slate-600 text-lg leading-relaxed">
                                Our platform is designed with a thoughtful understanding of traditional Indian matchmaking, streamlined into four easy, safe, and transparent steps.
                            </p>
                        </div>
                    </Section>

                    {/* Timeline grid - Non-minimal */}
                    <div className="grid md:grid-cols-4 gap-8 relative max-w-6xl mx-auto">
                        <div className="hidden md:block absolute top-12 left-[10%] right-[10%] h-[2px] bg-gradient-to-r from-transparent via-[#E8E2D9] to-transparent z-0"></div>

                        {[
                            {
                                no: "01",
                                title: "Create Your Profile",
                                desc: "Easily register on VidhiLikhit to access our huge, private database of Brides and Grooms.",
                                icon: Edit3
                            },
                            {
                                no: "02",
                                title: "Set Partner Preference",
                                desc: "Define your Partner Preferences regarding age, height, education, and community specifics.",
                                icon: Search
                            },
                            {
                                no: "03",
                                title: "Receive Matching Profile",
                                desc: "Receive matching profiles tailored to your exact requirements daily via our system.",
                                icon: Activity
                            },
                            {
                                no: "04",
                                title: "Send/Receive Interest",
                                desc: "Express interest to suitable profiles securely and initiate communication seamlessly.",
                                icon: Heart
                            }
                        ].map((step, idx) => (
                            <Section key={idx} className={`delay-${idx * 100}`}>
                                <div className="relative z-10 bg-white border border-slate-200 rounded-xl p-8 hover-premium-shadow text-center min-h-full">
                                    <div className="w-20 h-20 mx-auto bg-slate-50 border-2 border-primary-600 rounded-full flex justify-center items-center mb-6 shadow-sm relative">
                                        <step.icon className="w-8 h-8 text-primary-600" />
                                        <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-indigo-500 text-white text-xs font-bold flex items-center justify-center border-2 border-white shadow-sm">
                                            {step.no}
                                        </div>
                                    </div>
                                    <h3 className="font-bold text-slate-900 text-lg mb-4 font-serif">{step.title}</h3>
                                    <p className="text-sm text-slate-600 leading-relaxed">{step.desc}</p>
                                </div>
                            </Section>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── WHY CHOOSE US (Rich Content Grid) ── */}
            <section className="py-24 bg-slate-50 border-b border-slate-200 relative overflow-hidden">
                {/* Decorative side mandala portions to break minimalism */}
                <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-slate-50 opacity-10 pointer-events-none rounded-bl-full border-b border-l border-primary-600/10" />
                <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-slate-50 opacity-10 pointer-events-none rounded-tr-full border-t border-r border-primary-600/10" />

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <Section>
                        <div className="text-center mb-16 max-w-4xl mx-auto">
                            <span className="text-xs font-bold uppercase tracking-[0.2em] text-primary-600 mb-2 block">Premium Matrimony Service</span>
                            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-serif mb-6">Why Choose Us</h2>
                            <p className="text-lg text-slate-600 leading-relaxed font-medium">
                                We are intensely focused on building families. As the most trusted and premium matrimony service based in Karnataka, we prioritize authenticity, privacy, and community values above all else.
                            </p>
                        </div>
                    </Section>

                    <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                        <Section>
                            <div className="bg-white p-10 rounded-xl border border-slate-200 premium-shadow h-full border-t-4 border-t-crimson">
                                <Fingerprint className="w-12 h-12 text-primary-600 mb-6" />
                                <h3 className="text-xl font-bold font-serif text-slate-900 mb-4">Genuine profiles</h3>
                                <p className="text-slate-600 leading-relaxed">
                                    Contact genuine profiles with 100% verified mobile numbers. Every registration is meticulously checked to protect our members from fraudulent intents.
                                </p>
                            </div>
                        </Section>

                        <Section>
                            <div className="bg-white p-10 rounded-xl border border-slate-200 premium-shadow h-full border-t-4 border-t-indigo-500">
                                <Shield className="w-12 h-12 text-indigo-500 mb-6" />
                                <h3 className="text-xl font-bold font-serif text-slate-900 mb-4">Most trusted brand</h3>
                                <p className="text-slate-600 leading-relaxed">
                                    Established in 2017, VidhiLikhit has grown to become the most trusted wedding matrimony platform within the Brahmin and Lingayat communities.
                                </p>
                            </div>
                        </Section>

                        <Section>
                            <div className="bg-white p-10 rounded-xl border border-slate-200 premium-shadow h-full border-t-4 border-t-amber-500">
                                <Award className="w-12 h-12 text-amber-500 mb-6" />
                                <h3 className="text-xl font-bold font-serif text-slate-900 mb-4">400+ Weddings</h3>
                                <p className="text-slate-600 leading-relaxed">
                                    Hundreds of people have found their life partner through our dedicated services, turning hope into beautiful, lifelong relationships.
                                </p>
                            </div>
                        </Section>
                    </div>
                </div>
            </section>

            {/* ── SUITABLE MATCHES COMPONENT ── */}
            <SuitableMatchesGrid onViewMore={() => navigate('/profiles')} />

            {/* ── PDF DOWNLOAD BANNER (Elaborate Design) ── */}
            <section className="py-24 bg-slate-900 text-white overflow-hidden relative border-t-8 border-primary-600">
                {/* Background Texture image */}
                <div className="absolute inset-0 opacity-20">
                    <img src="https://images.unsplash.com/photo-1544161515-4ab6ce6db874?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80" alt="Texture" className="w-full h-full object-cover" />
                </div>
                <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm" />

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
                    <Section>
                        <div className="max-w-4xl mx-auto">
                            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold font-serif mb-8 text-white">
                                Download Verified <span className="text-amber-500">Brahmin & Lingayat</span> Profiles Instantly
                            </h2>
                            <p className="text-lg text-gray-300 leading-relaxed font-medium mb-10 text-left border-l-4 border-primary-600 pl-6 bg-white/5 p-6 rounded-r-xl">
                                Looking For The Right Life Partner In Your Own Community? With VidhiLikhit, you can instantly download verified biodata PDFs — complete with personal, educational, and professional details. Shortlist your favorites, and connect directly through us for the next crucial step.
                            </p>

                            <button
                                onClick={() => setIsDownloadModalOpen(true)}
                                className="inline-flex items-center gap-3 px-12 py-5 rounded-md font-bold text-white bg-primary-600 hover:bg-primary-800 transition-colors shadow-2xl text-lg uppercase tracking-wider border border-red-900"
                            >
                                <FileDown className="w-6 h-6" /> Access Biodata PDFs
                            </button>
                        </div>
                    </Section>
                </div>
            </section>

            <DownloadModal isOpen={isDownloadModalOpen} onClose={() => setIsDownloadModalOpen(false)} />

            {/* ── EXPANDED FOOTER (Original style) ── */}
            <footer className="bg-slate-900 text-slate-400 py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 border-b border-slate-800 pb-12 mb-12">
                        {/* Column 1 */}
                        <div className="space-y-6">
                            <img src={LogoImg} alt="VidhiLikhit Footer Logo" className="h-16 w-auto object-contain bg-white/10 p-2 rounded-lg" />
                            <p className="text-sm leading-relaxed">
                                Our platform helps you connect with genuine matches who share your values, dreams, and goals. We bring traditional matchmaking into the modern world.
                            </p>
                        </div>

                        {/* Column 2: GET IN TOUCH */}
                        <div>
                            <h4 className="text-white font-serif font-bold text-lg mb-6 uppercase tracking-wider flex items-center gap-2">
                                <span className="w-4 h-1 bg-primary-600 inline-block"></span> Get In Touch
                            </h4>
                            <ul className="space-y-4 text-sm font-medium">
                                <li className="flex gap-3">
                                    <MapPin className="w-5 h-5 text-primary-600 flex-shrink-0" />
                                    <span>NGO'S Colony, Kalaburagi,<br />Karnataka</span>
                                </li>
                                <li className="flex gap-3">
                                    <Phone className="w-5 h-5 text-primary-600 flex-shrink-0" />
                                    <span>+91 8123656445</span>
                                </li>
                                <li className="flex gap-3">
                                    <Mail className="w-5 h-5 text-primary-600 flex-shrink-0" />
                                    <span>support@vidhilikhit.com</span>
                                </li>
                            </ul>
                        </div>

                        {/* Column 3: Resources */}
                        <div>
                            <h4 className="text-white font-serif font-bold text-lg mb-6 uppercase tracking-wider flex items-center gap-2">
                                <span className="w-4 h-1 bg-indigo-500 inline-block"></span> Resources
                            </h4>
                            <ul className="space-y-3 text-sm">
                                <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Submit Feedback</a></li>
                            </ul>
                        </div>

                        {/* Column 4: Support */}
                        <div>
                            <h4 className="text-white font-serif font-bold text-lg mb-6 uppercase tracking-wider flex items-center gap-2">
                                <span className="w-4 h-1 bg-amber-500 inline-block"></span> Support
                            </h4>
                            <ul className="space-y-3 text-sm">
                                <li><a href="#" className="hover:text-white transition-colors">Help / FAQs</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
                            </ul>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row justify-between items-center text-xs font-bold tracking-wider uppercase">
                        <p>© 2026 VidhiLikhit. All rights reserved.</p>
                        <div className="flex gap-4 mt-4 sm:mt-0">
                            <span className="text-primary-600">Trusted Framework</span>
                            <span className="text-indigo-500">Premium Service</span>
                        </div>
                    </div>
                </div>
            </footer>

            {/* ── WHATSAPP FLOATING BUTTON ── */}
            <a
                href="https://wa.me/918123656445"
                target="_blank"
                rel="noopener noreferrer"
                className="fixed bottom-6 right-6 z-[100] bg-[#25D366] text-white p-4 rounded-full shadow-2xl hover:bg-[#1EBE57] hover:-translate-y-1 transition-all duration-300 flex items-center justify-center group"
                style={{ boxShadow: '0 10px 40px -10px rgba(37, 211, 102, 0.6)' }}
                title="Chat with Admin on WhatsApp"
            >
                <span className="absolute right-full mr-4 bg-white text-slate-900 text-sm font-bold px-4 py-2 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap pointer-events-none border border-slate-200">
                    Chat with Admin
                </span>
                <FaWhatsapp className="w-8 h-8" />
            </a>
        </div>
    );
};

export default Home;
