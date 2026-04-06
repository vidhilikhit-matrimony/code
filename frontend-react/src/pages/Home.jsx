import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Autoplay, EffectFade } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/effect-fade';
import 'swiper/css/autoplay';
import {
    Heart, Users, Shield, Star, Phone, Mail, FileDown,
    LogOut, Edit3, ChevronRight, ChevronLeft, MapPin, Award,
    LayoutDashboard, Search, Fingerprint, Activity,
    Sunrise, LogIn, LockOpen, Menu, X, Eye
} from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa';

import { logout } from '../redux/slices/authSlice';
import { getMyProfile, getAllProfiles } from '../services/profileService';
import LogoImg from '../assets/vidhilikhit_logo.png';
import HeroBgImg from '../assets/hero_wedding.png';
import FooterBgImg from '../assets/footer_bg.png';

// ─── Animation Variants ─────────────────────────────────────────

const fadeInUp = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } }
};

const staggerContainer = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.2 } }
};

const scaleIn = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.6, ease: "easeOut" } }
};

// ─── Suitable Matches Grid ───────────────────────────────────

function SuitableMatchesGrid({ onViewMore }) {
    const [profiles, setProfiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const { sessionSeed } = useSelector((state) => state.auth);

    useEffect(() => {
        (async () => {
            try {
                const res = await getAllProfiles({ limit: 16, seed: sessionSeed });
                if (res.success && Array.isArray(res.data?.profiles)) {
                    setProfiles(res.data.profiles);
                }
            } catch { /* silently fail for guests */ }
            finally { setLoading(false); }
        })();
    }, [sessionSeed]);

    const getAge = (dob) => {
        if (!dob) return '—';
        const years = Math.floor((Date.now() - new Date(dob)) / (365.25 * 24 * 3600 * 1000));
        return isNaN(years) ? '—' : years;
    };

    return (
        <section className="py-24 bg-gradient-to-b from-white to-orange-50/30 border-t border-slate-100 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjEiIGZpbGw9IiM5YTAzMWUiIGZpbGwtb3BhY2l0eT0iMC4wNSIvPjwvc3ZnPg==')] opacity-60 pointer-events-none rounded-full mask-image:radial-gradient(black,transparent)"></div>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-100px" }}
                    variants={fadeInUp}
                    className="text-center mb-16 max-w-3xl mx-auto"
                >
                    <div className="inline-flex items-center justify-center p-3 bg-orange-100 rounded-full mb-6">
                        <Sunrise className="w-8 h-8 text-orange-600" />
                    </div>
                    <h2 className="text-4xl sm:text-5xl font-extrabold text-slate-900 mb-6 font-serif tracking-tight">
                        Explore Genuine <span className="text-[#9A031E]">Profiles</span>
                    </h2>
                    <p className="text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto">
                        A curated selection of verified biodatas from the Brahmin and Lingayat communities. Every detail is checked with care, ensuring trust in every connection.
                    </p>
                </motion.div>

                {loading ? (
                    <div className="flex gap-6 overflow-hidden mt-12 px-4 -mx-4 pb-8">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <div key={i} className="w-[280px] sm:w-[320px] shrink-0 rounded-3xl bg-slate-100 animate-pulse h-[400px]"></div>
                        ))}
                    </div>
                ) : profiles.length === 0 ? (
                    <motion.div
                        initial="hidden" whileInView="visible" variants={fadeInUp} viewport={{ once: true }}
                        className="text-center py-20 text-slate-600 bg-white rounded-3xl border border-orange-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)]"
                    >
                        <LockOpen className="w-12 h-12 mx-auto text-orange-300 mb-4" />
                        <p className="text-xl font-medium">Log in to view new verified profiles available in your community.</p>
                    </motion.div>
                ) : (
                    <div className="relative mt-8 group">
                        <motion.div
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, margin: "-50px" }}
                            variants={fadeInUp}
                            className="w-full pb-4 pt-4"
                        >
                            <Swiper
                                modules={[Navigation, Autoplay]}
                                spaceBetween={24}
                                slidesPerView={4}
                                slidesPerGroup={4}
                                navigation={{
                                    prevEl: '.swiper-button-prev-custom',
                                    nextEl: '.swiper-button-next-custom',
                                }}
                                autoplay={{ delay: 3500, disableOnInteraction: true }}
                                breakpoints={{
                                    320: { slidesPerView: 1, slidesPerGroup: 1, spaceBetween: 16 },
                                    640: { slidesPerView: 2, slidesPerGroup: 2, spaceBetween: 24 },
                                    1024: { slidesPerView: 3, slidesPerGroup: 3, spaceBetween: 24 },
                                    1280: { slidesPerView: 4, slidesPerGroup: 4, spaceBetween: 32 }
                                }}
                                className="!pb-16 static"
                            >
                                {profiles.slice(0, 16).map((profile, idx) => (
                                    <SwiperSlide key={profile._id || idx} className="h-auto">
                                        <div className="w-full h-full">
                                            <ProfileCard profile={profile} getAge={getAge} />
                                        </div>
                                    </SwiperSlide>
                                ))}

                                {/* Custom Navigation Overlapping Carousel */}
                                {profiles.length > 4 && (
                                    <>
                                        <button className="swiper-button-prev-custom absolute left-0 sm:-left-6 top-1/2 -translate-y-1/2 w-12 h-12 sm:w-14 sm:h-14 rounded-full border border-slate-200 bg-white/90 backdrop-blur-sm flex items-center justify-center text-slate-600 hover:text-[#9A031E] hover:border-[#9A031E] hover:bg-white hover:scale-110 transition-all shadow-[0_8px_30px_rgb(0,0,0,0.15)] disabled:opacity-0 disabled:pointer-events-none z-20">
                                            <ChevronLeft className="w-6 h-6" />
                                        </button>
                                        <button className="swiper-button-next-custom absolute right-0 sm:-right-6 top-1/2 -translate-y-1/2 w-12 h-12 sm:w-14 sm:h-14 rounded-full border border-slate-200 bg-white/90 backdrop-blur-sm flex items-center justify-center text-slate-600 hover:text-[#9A031E] hover:border-[#9A031E] hover:bg-white hover:scale-110 transition-all shadow-[0_8px_30px_rgb(0,0,0,0.15)] disabled:opacity-0 disabled:pointer-events-none z-20">
                                            <ChevronRight className="w-6 h-6" />
                                        </button>
                                    </>
                                )}
                            </Swiper>
                        </motion.div>
                    </div>
                )}

                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    variants={fadeInUp}
                    className="text-center mt-12"
                >
                    <button
                        onClick={onViewMore}
                        className="group inline-flex items-center gap-3 px-10 py-4 rounded-full font-bold text-white bg-slate-900 hover:bg-[#9A031E] transition-all duration-300 shadow-xl hover:shadow-2xl hover:-translate-y-1"
                    >
                        View Full Profile Details <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </button>
                </motion.div>
            </div>
        </section>
    );
}

function ProfileCard({ profile, getAge }) {
    const firstPhoto = profile.photos?.[0]?.url || profile.photoUrl || null;
    const [imgError, setImgError] = useState(false);

    return (
        <motion.div
            variants={scaleIn}
            className="group bg-white rounded-3xl border border-slate-100 overflow-hidden flex flex-col hover:shadow-[0_20px_50px_rgba(154,3,30,0.1)] transition-all duration-500 cursor-pointer relative"
        >
            <div className="relative h-72 bg-slate-100 overflow-hidden">
                {firstPhoto && !imgError ? (
                    <img
                        src={firstPhoto}
                        alt="Profile"
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        onError={() => setImgError(true)}
                    />
                ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-slate-300 bg-slate-50">
                        <Users className="w-16 h-16 mb-2 opacity-50" />
                    </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent opacity-60"></div>
                <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm text-[#9A031E] text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-wider shadow-sm z-10">
                    ID: {profile.profileCode || 'VERIFIED'}
                </div>
                <div className="absolute bottom-4 left-4 z-10">
                    <h3 className="font-bold text-white text-2xl font-serif drop-shadow-md">
                        {profile.firstName || 'Member'} {profile.isUnlocked ? profile.lastName : ''}
                    </h3>
                </div>
            </div>

            <div className="p-6 flex flex-col flex-1 bg-white relative z-20">
                <div className="flex justify-between items-center text-sm text-slate-600 mt-2">
                    <div className="flex flex-col">
                        <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">Age / Height</span>
                        <span className="font-semibold text-slate-800">{getAge(profile.dateOfBirth)} yrs, {profile.height || '—'}</span>
                    </div>
                    <div className="w-px h-8 bg-slate-200"></div>
                    <div className="flex flex-col text-right">
                        <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">Community</span>
                        <span className="font-semibold text-[#9A031E]">{profile.caste || '—'}</span>
                    </div>
                </div>
            </div>
        </motion.div>
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
        setCommunity('all'); setGender('all'); setError(''); setIsDownloading(false); onClose();
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
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md"
                    onClick={handleClose}
                >
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        className="bg-white rounded-3xl p-8 w-full max-w-lg shadow-[0_20px_60px_rgba(0,0,0,0.3)] relative overflow-hidden"
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[#9A031E] to-amber-500"></div>
                        <button onClick={handleClose} className="absolute top-6 right-6 text-slate-400 hover:text-[#9A031E] transition-colors p-2 bg-slate-50 rounded-full hover:bg-red-50">
                            <X className="w-5 h-5" />
                        </button>

                        <div className="w-20 h-20 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner border border-orange-100">
                            <FileDown className="w-10 h-10 text-[#9A031E]" />
                        </div>

                        <h2 className="text-3xl font-bold text-slate-900 mb-3 text-center font-serif">Download Verified PDFs</h2>
                        <p className="text-slate-500 text-sm mb-8 text-center leading-relaxed px-4">
                            Instantly download trusted, detailed biodata PDFs. A bright ray of hope for finding your perfect match in your community.
                        </p>

                        <div className="space-y-5">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wide">Select Community</label>
                                <select
                                    value={community} onChange={e => { setCommunity(e.target.value); setError(''); }}
                                    className="w-full px-5 py-4 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 focus:outline-none focus:border-[#9A031E] focus:ring-1 focus:ring-[#9A031E] focus:bg-white transition-all appearance-none"
                                >
                                    <option value="all">All Communities</option>
                                    <option value="brahmin">Brahmin</option>
                                    <option value="lingayat">Lingayat</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wide">Select Gender</label>
                                <select
                                    value={gender} onChange={e => { setGender(e.target.value); setError(''); }}
                                    className="w-full px-5 py-4 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 focus:outline-none focus:border-[#9A031E] focus:ring-1 focus:ring-[#9A031E] focus:bg-white transition-all appearance-none"
                                >
                                    <option value="all">All Genders</option>
                                    <option value="male">Groom</option>
                                    <option value="female">Bride</option>
                                </select>
                            </div>

                            {error && <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="text-rose-600 text-sm p-4 rounded-xl font-medium bg-rose-50 border border-rose-100">{error}</motion.div>}

                            <button
                                onClick={handleDownload} disabled={isDownloading}
                                className="w-full py-4 rounded-xl font-bold text-white bg-gradient-to-r from-primary-600 to-[#b30826] hover:from-[#7a0218] hover:to-primary-600 shadow-[0_8px_20px_primary-600/30] disabled:opacity-70 transition-all flex justify-center items-center gap-2 tracking-wider uppercase text-sm mt-6"
                            >
                                {isDownloading ? (
                                    <div className="fixed inset-0 bg-[#FAF8F5] flex items-center justify-center z-50"><div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div></div>
                                ) : 'Download Profiles Now'}
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

// ─── Main Component ──────────────────────────────────────────────

const Home = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { isAuthenticated, user } = useSelector((state) => state.auth);
    const [hasProfile, setHasProfile] = useState(false);
    const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const [visitorCount, setVisitorCount] = useState(null);

    useEffect(() => {
        if (!isAuthenticated) return;
        (async () => {
            try {
                const res = await getMyProfile();
                if (res.success && res.data) setHasProfile(true);
            } catch { /* no profile */ }
        })();
    }, [isAuthenticated]);

    useEffect(() => {
        const fetchVisitors = async () => {
            try {
                const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
                const alreadyVisited = sessionStorage.getItem('vl_visited');
                if (!alreadyVisited) {
                    const res = await fetch(`${API_BASE}/visitors/increment`, { method: 'POST' });
                    const data = await res.json();
                    if (data.success) { setVisitorCount(data.count); sessionStorage.setItem('vl_visited', '1'); }
                } else {
                    const res = await fetch(`${API_BASE}/visitors`);
                    const data = await res.json();
                    if (data.success) setVisitorCount(data.count);
                }
            } catch { /* silently ignore */ }
        };
        fetchVisitors();
    }, []);

    const formatVisitors = (n) => {
        if (n === null) return null;
        return n;
    };

    const handleLogout = () => { dispatch(logout()); navigate('/'); setShowLogoutModal(false); };

    return (
        <div className="min-h-screen bg-white font-sans text-slate-900 selection:bg-primary-600 selection:text-white">

            {/* ── HEADER NAVIGATION ── */}
            <header className="fixed top-0 left-0 right-0 z-[90] bg-white/90 backdrop-blur-md border-b border-slate-100 shadow-sm transition-all duration-300">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-20">
                        {/* Logo */}
                        <motion.button
                            initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}
                            onClick={() => navigate('/')}
                            className="flex items-center gap-3 focus:outline-none group"
                        >
                            <img src={LogoImg} alt="VidhiLikhit Logo" className="h-14 w-auto object-contain transition-transform group-hover:scale-105" />
                            <div className="hidden sm:flex flex-col text-left">
                                <span className="font-serif font-extrabold text-2xl tracking-tight text-slate-900 group-hover:text-primary-600 transition-colors">VidhiLikhit</span>
                                <span className="text-[9px] uppercase font-bold tracking-[0.3em] text-primary-600 mt-0.5">Matrimony</span>
                            </div>
                        </motion.button>

                        {/* Desktop Navigation */}
                        <div className="hidden lg:flex items-center gap-8">
                            <nav className="flex items-center gap-6 text-[13px] font-bold text-slate-600 uppercase tracking-wider">
                                {visitorCount !== null && (
                                    <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-50 border border-orange-200 text-primary-600 text-[10px] font-bold tracking-wide normal-case">
                                        <Eye className="w-3 h-3" />
                                        <span className="text-slate-500">Total Visitors:</span>
                                        <span>{formatVisitors(visitorCount)}</span>
                                    </span>
                                )}
                                <button onClick={() => navigate('/about-us')} className="hover:text-primary-600 transition-colors">About</button>
                                <button onClick={() => navigate('/contact-us')} className="hover:text-primary-600 transition-colors">Contact</button>
                                <button onClick={() => navigate('/help-faq')} className="hover:text-primary-600 transition-colors">FAQ</button>
                            </nav>

                            <div className="w-px h-6 bg-slate-200"></div>

                            {isAuthenticated && !user?.isAdmin && (
                                <div className="flex items-center px-4 py-2 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-xs font-bold shadow-sm">
                                    <Star className="w-3.5 h-3.5 mr-1.5 fill-amber-500 text-amber-500" /> {user?.remainingViews || 0} Unlocks
                                </div>
                            )}

                            {user?.isAdmin && (
                                <button onClick={() => navigate('/admin/dashboard')} className="flex items-center text-xs font-bold text-white bg-slate-800 hover:bg-slate-900 px-5 py-2.5 rounded-full transition-colors shadow-md">
                                    <LayoutDashboard className="w-4 h-4 mr-2" /> Admin
                                </button>
                            )}

                            {isAuthenticated ? (
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={() => navigate('/unlocked-profiles')}
                                        className="flex items-center gap-2 p-2.5 rounded-full bg-slate-50 hover:bg-primary-600 text-slate-600 hover:text-white transition-all shadow-sm border border-slate-100 group"
                                        title="Unlocked Profiles"
                                    >
                                        <LockOpen className="w-4 h-4 group-hover:scale-110 transition-transform" />
                                    </button>

                                    <button
                                        onClick={() => navigate(hasProfile ? '/profile/me' : '/create-profile')}
                                        className="flex items-center gap-3 pl-1.5 pr-4 py-1.5 rounded-full border border-slate-200 bg-white hover:border-primary-600 hover:shadow-md transition-all"
                                    >
                                        {user?.photoUrl ? (
                                            <img src={user.photoUrl} alt="User" className="w-8 h-8 rounded-full object-cover shadow-sm" />
                                        ) : (
                                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-600 to-[#f05d23] flex items-center justify-center text-white font-bold text-sm shadow-inner">
                                                {(user?.firstName || 'U')[0]}
                                            </div>
                                        )}
                                        <span className="font-bold text-sm text-slate-700">{user?.firstName || 'Dashboard'}</span>
                                    </button>

                                    <button onClick={() => setShowLogoutModal(true)} className="p-2.5 rounded-full text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors">
                                        <LogOut className="w-5 h-5" />
                                    </button>
                                </div>
                            ) : (
                                <div className="flex items-center gap-4">
                                    <button onClick={() => navigate('/login')} className="font-bold text-sm text-white bg-primary-600 hover:bg-primary-700 px-6 py-2.5 rounded-full transition-colors uppercase tracking-wider shadow-sm">
                                        Login
                                    </button>
                                    <button onClick={() => navigate('/register')} className="px-7 py-3 rounded-full bg-primary-600 text-white font-bold text-sm uppercase tracking-wider hover:bg-primary-700 shadow-[0_8px_20px_rgba(234,88,12,0.3)] hover:-translate-y-0.5 transition-all">
                                        Register Free
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Mobile Menu Toggle */}
                        <div className="lg:hidden flex items-center gap-4">
                            {isAuthenticated && (
                                <button onClick={() => navigate(hasProfile ? '/profile/me' : '/create-profile')}>
                                    {user?.photoUrl ? (
                                        <img src={user.photoUrl} alt="User" className="w-8 h-8 rounded-full object-cover" />
                                    ) : (
                                        <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center text-white font-bold text-sm shadow-inner">
                                            {(user?.firstName || 'U')[0]}
                                        </div>
                                    )}
                                </button>
                            )}
                            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 text-slate-600">
                                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Dropdown Menu */}
                <AnimatePresence>
                    {mobileMenuOpen && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                            className="lg:hidden bg-white border-t border-slate-100 overflow-hidden"
                        >
                            <div className="px-4 py-6 space-y-4">
                                {visitorCount !== null && (
                                    <div className="flex items-center gap-2 py-2 px-3 rounded-xl bg-orange-50 border border-orange-200">
                                        <Eye className="w-4 h-4 text-primary-600" />
                                        <span className="text-xs font-bold text-slate-500">Total Visitors:</span>
                                        <span className="text-sm font-extrabold text-primary-600">{formatVisitors(visitorCount)}</span>
                                    </div>
                                )}
                                <div className="flex items-center justify-between">
                                    <button onClick={() => navigate('/about-us')} className="font-bold text-slate-600 py-2">About Us</button>
                                </div>
                                <button onClick={() => navigate('/contact-us')} className="block w-full text-left font-bold text-slate-600 py-2">Contact Us</button>
                                <button onClick={() => navigate('/help-faq')} className="block w-full text-left font-bold text-slate-600 py-2">Help / FAQ</button>

                                <hr className="border-slate-100 my-4" />

                                {isAuthenticated ? (
                                    <>
                                        {user?.isAdmin && <button onClick={() => navigate('/admin/dashboard')} className="block w-full text-left font-bold text-primary-600 py-2">Admin Console</button>}
                                        <button onClick={() => navigate('/unlocked-profiles')} className="block w-full text-left font-bold text-slate-600 py-2">Unlocked Profiles</button>
                                        <button onClick={() => setShowLogoutModal(true)} className="block w-full text-left font-bold text-rose-600 py-2">Log Out</button>
                                    </>
                                ) : (
                                    <div className="flex flex-col gap-3 pt-2">
                                        <button onClick={() => navigate('/login')} className="w-full py-3 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-bold uppercase text-sm transition-colors">Login</button>
                                        <button onClick={() => navigate('/register')} className="w-full py-3 rounded-xl border-2 border-primary-600 text-primary-600 font-bold uppercase text-sm hover:bg-orange-50 transition-colors">Register Free</button>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </header>

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

            {/* 1. ── MAIN HERO SECTION ── */}
            <section className="relative bg-slate-900 min-h-[100vh] flex items-center overflow-hidden pt-20">
                {/* Stunning Auto-Sliding Background Images */}
                <div className="absolute inset-0 z-0 h-full w-full">
                    <Swiper
                        modules={[Autoplay, EffectFade]}
                        effect="fade"
                        fadeEffect={{ crossFade: true }}
                        speed={2000}
                        autoplay={{ delay: 4000, disableOnInteraction: false }}
                        loop={true}
                        allowTouchMove={false}
                        className="w-full h-full"
                    >
                        {[
                            '/assets/hero/hero_background_1_1772572844785.png',
                            '/assets/hero/vidhi_hero_1_1772573568582.png',
                            '/assets/hero/vidhi_hero_3_1772573596985.png',
                            '/assets/hero/wedding_bg_1_1772574128889.png',
                            '/assets/hero/hero_background_2_1772572866107.png'
                        ].map((src, i) => (
                            <SwiperSlide key={i} className="w-full h-full">
                                <img
                                    src={src}
                                    alt="Traditional Hindu Wedding"
                                    className="w-full h-full object-cover object-[center_35%]"
                                />
                            </SwiperSlide>
                        ))}
                    </Swiper>
                    {/* Multi-layered elegant gradient overlays */}
                    <div className="absolute inset-0 bg-gradient-to-r from-slate-900/95 via-slate-900/70 to-transparent mix-blend-multiply" />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-90" />
                </div>

                <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pt-20 pb-40 lg:pb-20">
                    <motion.div
                        initial="hidden" animate="visible" variants={staggerContainer}
                        className="max-w-2xl text-shadow-lg"
                    >
                        <motion.div variants={fadeInUp} className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-primary-600/90 backdrop-blur-md border border-primary-600 text-white text-xs font-black uppercase tracking-[0.2em] shadow-2xl mb-8">
                            <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span>
                            Premium Matrimony For Brahmin & Lingayat
                        </motion.div>

                        <motion.h1 variants={fadeInUp} className="text-5xl sm:text-6xl lg:text-7xl font-serif font-extrabold leading-[1.1] text-white mb-6 drop-shadow-[0_5px_5px_rgba(0,0,0,0.8)]">
                            A Bright Ray <br /> Of Hope.
                        </motion.h1>

                        <motion.p variants={fadeInUp} className="text-2xl font-serif italic text-amber-300 mb-8 border-l-4 border-amber-400 pl-6 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] font-bold">
                            Built on trust, tradition, and love.
                        </motion.p>

                        <motion.p variants={fadeInUp} className="text-lg text-white leading-relaxed max-w-xl font-bold mb-12 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                            Finding your perfect life partner starts here. We bring traditional matchmaking into the modern world—secure, personalized, and effortless. Step into a world of genuine connections.
                        </motion.p>

                        <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row flex-wrap gap-5">
                            <button onClick={() => navigate(isAuthenticated ? (hasProfile ? '/profiles' : '/create-profile') : '/register')} className="group px-10 py-4 rounded-full bg-gradient-to-r from-primary-500 to-primary-700 text-white font-bold uppercase tracking-wider text-sm shadow-[0_10px_30px_rgba(234,88,12,0.5)] hover:-translate-y-1 transition-all flex items-center justify-center gap-3">
                                {isAuthenticated ? 'Browse Matches' : 'Create Your Profile Free'}
                                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </button>
                            {!isAuthenticated && (
                                <button onClick={() => navigate('/login')} className="px-10 py-4 rounded-full bg-primary-600 hover:bg-primary-700 text-white font-bold uppercase tracking-wider text-sm shadow-[0_10px_30px_rgba(234,88,12,0.3)] transition-all flex items-center justify-center gap-3">
                                    <LogIn className="w-5 h-5" /> Login
                                </button>
                            )}
                        </motion.div>

                        <motion.div variants={fadeInUp} className="grid grid-cols-3 gap-8 pt-12 mt-12 border-t border-white/10">
                            <div>
                                <h4 className="text-white font-serif font-bold text-3xl sm:text-4xl">10K+</h4>
                                <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold mt-2">Verified Profiles</p>
                            </div>
                            <div>
                                <h4 className="text-amber-400 font-serif font-bold text-3xl sm:text-4xl">400+</h4>
                                <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold mt-2">Happy Marriages</p>
                            </div>
                            <div>
                                <h4 className="text-white font-serif font-bold text-3xl sm:text-4xl">2017</h4>
                                <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold mt-2">Established</p>
                            </div>
                        </motion.div>
                    </motion.div>
                </div>

                {/* Scroll Indicator */}
                <motion.div
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2, duration: 1 }}
                    className="absolute bottom-10 right-6 sm:right-12 md:right-24 flex flex-col items-center gap-2 text-white/50"
                >
                    <span className="text-[10px] uppercase font-bold tracking-widest">Scroll to Explore</span>
                    <div className="w-px h-10 bg-gradient-to-b from-white/50 to-transparent"></div>
                </motion.div>
            </section>

            {/* 2. ── EXPLORE PROFILE CARDS ── */}
            <SuitableMatchesGrid onViewMore={() => navigate('/profiles')} />

            {/* 3. ── DOWNLOAD PDF BANNER ── */}
            <section className="py-24 bg-gradient-to-br from-slate-900 to-primary-600 text-white relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1544161515-4ab6ce6db874?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80')] opacity-10 mix-blend-overlay object-cover"></div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <motion.div
                        initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer}
                        className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl p-10 md:p-16 flex flex-col md:flex-row items-center justify-between gap-12 shadow-2xl"
                    >
                        <div className="flex-1 max-w-2xl">
                            <motion.div variants={fadeInUp} className="inline-block bg-amber-500/20 text-amber-300 font-bold px-4 py-1.5 rounded-full text-xs uppercase tracking-widest mb-6 border border-amber-500/30">
                                Offline Access
                            </motion.div>
                            <motion.h2 variants={fadeInUp} className="text-3xl md:text-5xl font-extrabold font-serif mb-6 leading-tight">
                                Download Verified <span className="text-amber-400 border-b-2 border-amber-400">PDF Profiles</span> Instantly
                            </motion.h2>
                            <motion.p variants={fadeInUp} className="text-lg text-slate-200 leading-relaxed font-medium">
                                Shortlist your favorites offline. Instantly download detailed biodata PDFs of verified matching profiles complete with personal, educational, and professional details.
                            </motion.p>
                        </div>

                        <motion.div variants={scaleIn} className="flex-none w-full md:w-auto">
                            <button
                                onClick={() => setIsDownloadModalOpen(true)}
                                className="w-full md:w-auto flex items-center justify-center gap-4 px-10 py-6 rounded-2xl font-bold text-primary-700 bg-white hover:bg-slate-50 transition-all shadow-[0_10px_40px_rgba(0,0,0,0.3)] hover:-translate-y-2 text-lg uppercase tracking-wider group"
                            >
                                <div className="bg-orange-50 p-3 rounded-full group-hover:bg-primary-600 group-hover:text-white transition-colors">
                                    <FileDown className="w-6 h-6" />
                                </div>
                                Access Biodata PDFs
                            </button>
                        </motion.div>
                    </motion.div>
                </div>
            </section>
            <DownloadModal isOpen={isDownloadModalOpen} onClose={() => setIsDownloadModalOpen(false)} />

            {/* 4. ── HOW IT WORKS ── */}
            <section className="py-32 bg-slate-50 relative">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div
                        initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}
                        className="text-center max-w-3xl mx-auto mb-20"
                    >
                        <span className="text-xs font-bold uppercase tracking-[0.2em] text-orange-600 mb-4 block">Simple & Intuitive</span>
                        <h2 className="text-4xl sm:text-5xl font-extrabold text-slate-900 font-serif mb-6">
                            How VidhiLikhit Works
                        </h2>
                        <p className="text-slate-600 text-lg leading-relaxed">
                            Our platform is designed with a thoughtful understanding of traditional Indian matchmaking, streamlined into four easy, safe, and transparent steps.
                        </p>
                    </motion.div>

                    <motion.div
                        initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={staggerContainer}
                        className="grid md:grid-cols-4 gap-6 lg:gap-10 relative max-w-6xl mx-auto"
                    >
                        <div className="hidden md:block absolute top-[44px] left-[10%] right-[10%] h-[2px] bg-gradient-to-r from-orange-100 via-orange-300 to-orange-100 z-0"></div>

                        {[
                            { no: "01", title: "Create Your Profile", desc: "Easily register to access our huge, private database of Brides and Grooms.", icon: Edit3 },
                            { no: "02", title: "Set Preferences", desc: "Define your Partner Preferences regarding age, height, and community.", icon: Search },
                            { no: "03", title: "Receive Matches", desc: "Receive tailored profiles that exactly match your requirements daily.", icon: Activity },
                            { no: "04", title: "Connect", desc: "Express interest securely and initiate communication seamlessly.", icon: Heart }
                        ].map((step, idx) => (
                            <motion.div key={idx} variants={fadeInUp} className="relative z-10 flex flex-col items-center group">
                                <div className="w-24 h-24 bg-white rounded-full flex justify-center items-center mb-8 shadow-xl border-4 border-slate-50 group-hover:border-primary-600 transition-colors relative">
                                    <step.icon className="w-10 h-10 text-slate-400 group-hover:text-primary-600 transition-colors" />
                                    <div className="absolute -top-2 -right-2 w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 text-white text-sm font-bold flex items-center justify-center border-4 border-slate-50 shadow-md">
                                        {step.no}
                                    </div>
                                </div>
                                <h3 className="font-bold text-slate-900 text-xl mb-4 font-serif text-center">{step.title}</h3>
                                <p className="text-sm text-slate-500 leading-relaxed text-center px-4">{step.desc}</p>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* 5. ── WHY CHOOSE US ── */}
            <section className="py-32 bg-white relative overflow-hidden border-t border-slate-100">
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-orange-50 opacity-50 rounded-bl-full pointer-events-none -z-10" />
                <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-red-50 opacity-50 rounded-tr-full pointer-events-none -z-10" />

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <motion.div
                        initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}
                        className="text-center mb-20 max-w-4xl mx-auto"
                    >
                        <h2 className="text-4xl sm:text-5xl font-extrabold text-slate-900 font-serif mb-6">Why Choose Us</h2>
                        <div className="w-24 h-1 bg-primary-600 mx-auto mb-8 rounded-full"></div>
                        <p className="text-xl text-slate-600 leading-relaxed font-medium">
                            The most trusted and premium matrimony service based in Karnataka, building families on authenticity, privacy, and deep community values.
                        </p>
                    </motion.div>

                    <motion.div
                        initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={staggerContainer}
                        className="grid md:grid-cols-3 gap-10 max-w-6xl mx-auto"
                    >
                        <motion.div variants={fadeInUp} className="group bg-white p-12 rounded-3xl border border-slate-100 shadow-[0_10px_40px_rgba(0,0,0,0.04)] hover:shadow-[0_20px_50px_rgba(234,88,12,0.1)] transition-all duration-500 hover:-translate-y-2 relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-2 bg-primary-600 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
                            <div className="w-16 h-16 bg-orange-50 rounded-2xl flex items-center justify-center mb-8 group-hover:rotate-6 transition-transform">
                                <Fingerprint className="w-8 h-8 text-primary-600" />
                            </div>
                            <h3 className="text-2xl font-bold font-serif text-slate-900 mb-4">100% Verified Profiles</h3>
                            <p className="text-slate-600 leading-relaxed text-lg">
                                Contact genuine profiles with verified numbers. Every registration is meticulously checked to protect our members from fraudulent intents.
                            </p>
                        </motion.div>

                        <motion.div variants={fadeInUp} className="group bg-white p-12 rounded-3xl border border-slate-100 shadow-[0_10px_40px_rgba(0,0,0,0.04)] hover:shadow-[0_20px_50px_rgba(240,93,35,0.1)] transition-all duration-500 hover:-translate-y-2 relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-2 bg-[#F05D23] transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
                            <div className="w-16 h-16 bg-orange-50 rounded-2xl flex items-center justify-center mb-8 group-hover:-rotate-6 transition-transform">
                                <Shield className="w-8 h-8 text-[#F05D23]" />
                            </div>
                            <h3 className="text-2xl font-bold font-serif text-slate-900 mb-4">Most Trusted Brand</h3>
                            <p className="text-slate-600 leading-relaxed text-lg">
                                Established in 2017, VidhiLikhit has grown to become the most trusted wedding platform within the Brahmin and Lingayat communities.
                            </p>
                        </motion.div>

                        <motion.div variants={fadeInUp} className="group bg-white p-12 rounded-3xl border border-slate-100 shadow-[0_10px_40px_rgba(0,0,0,0.04)] hover:shadow-[0_20px_50px_rgba(227,178,60,0.1)] transition-all duration-500 hover:-translate-y-2 relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-2 bg-amber-500 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
                            <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                                <Award className="w-8 h-8 text-amber-500" />
                            </div>
                            <h3 className="text-2xl font-bold font-serif text-slate-900 mb-4">Success Stories</h3>
                            <p className="text-slate-600 leading-relaxed text-lg">
                                Hundreds of people have successfully found their life partner through our dedicated services, turning hope into beautiful marriages.
                            </p>
                        </motion.div>
                    </motion.div>
                </div>
            </section>

            {/* 6. ── FOOTER ── */}
            <footer className="relative bg-slate-900 border-t-8 border-[#9A031E] overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <img src={FooterBgImg} alt="Wedding Background" className="w-full h-full object-cover object-center opacity-85" />
                    <div className="absolute inset-0 bg-slate-900/60" />
                </div>
                <div className="relative z-10 py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 xl:gap-20 border-b border-slate-700/60 pb-16 mb-12">
                        {/* Column 1 */}
                        <div className="space-y-6">
                            <div className="flex items-center gap-3">
                                <img src={LogoImg} alt="VidhiLikhit Footer Logo" className="h-14 w-auto object-contain bg-white rounded-xl p-1" />
                                <span className="font-serif font-bold text-2xl text-white">VidhiLikhit</span>
                            </div>
                            <p className="text-sm leading-relaxed text-white mt-6">
                                The premier platform helping you connect with genuine matches who share your values, dreams, and goals within your community.
                            </p>
                            <div className="flex gap-4 pt-4">
                                <a href="https://wa.me/918123656445" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:bg-[#25D366] hover:text-white transition-colors" target="_blank" rel="noopener noreferrer">
                                    <FaWhatsapp className="w-5 h-5" />
                                </a>
                            </div>
                        </div>

                        {/* Column 2: GET IN TOUCH */}
                        <div>
                            <h4 className="text-white font-serif font-bold text-lg mb-8 uppercase tracking-widest text-[#9A031E]">
                                Get In Touch
                            </h4>
                            <ul className="space-y-5 text-sm font-medium text-white">
                                <li className="flex gap-4">
                                    <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center flex-shrink-0"><MapPin className="w-4 h-4 text-[#9A031E]" /></div>
                                    <span className="mt-1">NGO'S Colony, Kalaburagi,<br />Karnataka</span>
                                </li>
                                <li className="flex gap-4">
                                    <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center flex-shrink-0"><Phone className="w-4 h-4 text-[#9A031E]" /></div>
                                    <span className="mt-1.5">+91 8123656445</span>
                                </li>
                                <li className="flex gap-4">
                                    <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center flex-shrink-0"><Mail className="w-4 h-4 text-[#9A031E]" /></div>
                                    <span className="mt-1.5">support@vidhilikhit.com</span>
                                </li>
                            </ul>
                        </div>

                        {/* Column 3: Resources */}
                        <div>
                            <h4 className="text-white font-serif font-bold text-lg mb-8 uppercase tracking-widest text-orange-500">
                                Resources
                            </h4>
                            <ul className="space-y-4 text-sm font-medium text-white">
                                <li><button onClick={() => navigate('/about-us')} className="hover:text-orange-400 transition-colors flex items-center gap-2"><ChevronRight className="w-3 h-3 text-orange-500" /> About Us</button></li>
                                <li><button onClick={() => navigate('/contact-us')} className="hover:text-orange-400 transition-colors flex items-center gap-2"><ChevronRight className="w-3 h-3 text-orange-500" /> Contact Us</button></li>
                            </ul>
                        </div>

                        {/* Column 4: Support */}
                        <div>
                            <h4 className="text-white font-serif font-bold text-lg mb-8 uppercase tracking-widest text-amber-500">
                                Support
                            </h4>
                            <ul className="space-y-4 text-sm font-medium text-white">
                                <li><button onClick={() => navigate('/help-faq')} className="hover:text-amber-400 transition-colors flex items-center gap-2"><ChevronRight className="w-3 h-3 text-amber-500" /> Help / FAQs</button></li>
                                <li><button onClick={() => navigate('/privacy-policy')} className="hover:text-amber-400 transition-colors flex items-center gap-2"><ChevronRight className="w-3 h-3 text-amber-500" /> Privacy Policy</button></li>
                                <li><button onClick={() => navigate('/terms-of-service')} className="hover:text-amber-400 transition-colors flex items-center gap-2"><ChevronRight className="w-3 h-3 text-amber-500" /> Terms of Service</button></li>
                            </ul>
                        </div>
                    </div>

                    <div className="flex flex-col md:flex-row justify-between items-center text-xs font-bold tracking-widest uppercase gap-6 text-white">
                        <p className="text-white">© {new Date().getFullYear()} VidhiLikhit Matrimony. All rights reserved.</p>
                        <div className="flex gap-6">
                            <span className="text-white hover:text-amber-400 transition-colors cursor-pointer">Premium Service</span>
                            <span className="w-1 h-1 rounded-full bg-slate-400 mt-1.5"></span>
                            <span className="text-white hover:text-amber-400 transition-colors cursor-pointer">Trusted Framework</span>
                        </div>
                    </div>
                </div>
            </footer>

            {/* ── WHATSAPP FLOATING BUTTON ── */}
            <a
                href="https://wa.me/918123656445"
                target="_blank"
                rel="noopener noreferrer"
                className="fixed bottom-8 right-8 z-[100] bg-[#25D366] text-white p-4 rounded-full shadow-[0_10px_40px_rgba(37,211,102,0.5)] hover:bg-[#1EBE57] hover:-translate-y-2 hover:scale-110 transition-all duration-300 flex items-center justify-center group"
                title="Chat with Admin on WhatsApp"
            >
                <span className="absolute right-full mr-6 bg-slate-900 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-xl opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-4 group-hover:translate-x-0 whitespace-nowrap pointer-events-none before:content-[''] before:absolute before:top-1/2 before:-right-2 before:-translate-y-1/2 before:border-8 before:border-transparent before:border-l-slate-900">
                    Chat with Admin
                </span>
                <FaWhatsapp className="w-8 h-8" />
            </a>
        </div>
    );
};

export default Home;
