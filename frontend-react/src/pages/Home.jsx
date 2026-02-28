import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
    Heart, Users, Shield, Star, Phone, Mail, CheckCircle,
    FileDown, List, PhoneCall, LogOut, Edit3, ChevronRight,
    MapPin, Award, LayoutDashboard
} from 'lucide-react';
import { logout } from '../redux/slices/authSlice';
import { getMyProfile, getAllProfiles } from '../services/profileService';
import RefreshPageButton from '../components/common/RefreshPageButton';

// ─── Animations (injected once) ─────────────────────────────────
const STYLES = `
@keyframes fadeUp {
    from { opacity: 0; transform: translateY(32px); }
    to   { opacity: 1; transform: translateY(0); }
}
@keyframes fadeIn {
    from { opacity: 0; }
    to   { opacity: 1; }
}
@keyframes slideLeft {
    from { opacity: 0; transform: translateX(-40px); }
    to   { opacity: 1; transform: translateX(0); }
}
@keyframes slideRight {
    from { opacity: 0; transform: translateX(40px); }
    to   { opacity: 1; transform: translateX(0); }
}
@keyframes pulse-ring {
    0%   { transform: scale(1);    opacity: 0.8; }
    100% { transform: scale(1.55); opacity: 0; }
}
@keyframes float {
    0%, 100% { transform: translateY(0); }
    50%       { transform: translateY(-10px); }
}
@keyframes shimmer {
    0%   { background-position: -200% center; }
    100% { background-position:  200% center; }
}
@keyframes countUp {
    from { opacity: 0; transform: translateY(10px); }
    to   { opacity: 1; transform: translateY(0); }
}
.animate-fadeUp   { animation: fadeUp   0.7s ease both; }
.animate-fadeIn   { animation: fadeIn   0.6s ease both; }
.animate-slideL   { animation: slideLeft  0.7s ease both; }
.animate-slideR   { animation: slideRight 0.7s ease both; }
.animate-float    { animation: float 3.5s ease-in-out infinite; }
.delay-100 { animation-delay: 0.1s; }
.delay-200 { animation-delay: 0.2s; }
.delay-300 { animation-delay: 0.3s; }
.delay-400 { animation-delay: 0.4s; }
.delay-500 { animation-delay: 0.5s; }
.delay-600 { animation-delay: 0.6s; }
.shimmer-text {
    background: linear-gradient(90deg, #FF344C 0%, #FF8C00 50%, #FF344C 100%);
    background-size: 200% auto;
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
    animation: shimmer 3s linear infinite;
}
.card-hover {
    transition: transform 0.3s ease, box-shadow 0.3s ease;
}
.card-hover:hover {
    transform: translateY(-6px);
    box-shadow: 0 20px 40px rgba(255, 52, 76, 0.15);
}
`;

// ─── Intersection Observer hook ──────────────────────────────────
function useInView(threshold = 0.15) {
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

// ─── Animated counter ────────────────────────────────────────────
function Counter({ target, suffix = '' }) {
    const [count, setCount] = useState(0);
    const [ref, inView] = useInView(0.3);
    useEffect(() => {
        if (!inView) return;
        let start = 0;
        const step = Math.ceil(target / 60);
        const timer = setInterval(() => {
            start += step;
            if (start >= target) { setCount(target); clearInterval(timer); }
            else setCount(start);
        }, 20);
        return () => clearInterval(timer);
    }, [inView, target]);
    return <span ref={ref}>{count}{suffix}</span>;
}

// ─── Section wrapper with fade-in ────────────────────────────────
function Section({ children, className = '' }) {
    const [ref, inView] = useInView();
    return (
        <div
            ref={ref}
            className={`transition-all duration-700 ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'} ${className}`}
        >
            {children}
        </div>
    );
}

// ─── Suitable Matches Carousel ───────────────────────────────────
function SuitableMatchesCarousel({ onViewMore }) {
    const [profiles, setProfiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [current, setCurrent] = useState(0);
    const [perSlide, setPerSlide] = useState(4);
    const autoRef = useRef(null);

    // Responsive: how many cards per "slide"
    useEffect(() => {
        const calc = () => {
            const w = window.innerWidth;
            if (w < 640) setPerSlide(1);
            else if (w < 1024) setPerSlide(2);
            else setPerSlide(4);
        };
        calc();
        window.addEventListener('resize', calc);
        return () => window.removeEventListener('resize', calc);
    }, []);

    useEffect(() => {
        (async () => {
            try {
                const res = await getAllProfiles({ limit: 20 });
                if (res.success && Array.isArray(res.data?.profiles)) {
                    setProfiles(res.data.profiles);
                }
            } catch { /* silently fail for guests */ }
            finally { setLoading(false); }
        })();
    }, []);

    const totalSlides = Math.max(1, Math.ceil(profiles.length / perSlide));

    const prev = () => setCurrent(c => (c - 1 + totalSlides) % totalSlides);
    const next = () => setCurrent(c => (c + 1) % totalSlides);

    // Auto-play
    useEffect(() => {
        if (profiles.length === 0) return;
        autoRef.current = setInterval(next, 4000);
        return () => clearInterval(autoRef.current);
    }, [profiles.length, totalSlides]);

    const pauseAuto = () => clearInterval(autoRef.current);
    const resumeAuto = () => { autoRef.current = setInterval(next, 4000); };

    const slice = profiles.slice(current * perSlide, current * perSlide + perSlide);

    const getAge = (dob) => {
        if (!dob) return '—';
        const years = Math.floor((Date.now() - new Date(dob)) / (365.25 * 24 * 3600 * 1000));
        return isNaN(years) ? '—' : years;
    };

    return (
        <section className="py-20 bg-gradient-to-b from-rose-50/60 to-white dark:from-slate-900 dark:to-slate-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Heading */}
                <div className="text-center mb-12">
                    <h2 className="text-4xl sm:text-5xl font-extrabold shimmer-text">
                        Suitable Matches
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400 mt-3 text-base">
                        Explore verified profiles from our community
                    </p>
                </div>

                {loading ? (
                    /* Skeleton */
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {Array.from({ length: perSlide }).map((_, i) => (
                            <div key={i} className="rounded-2xl bg-white dark:bg-slate-800 shadow animate-pulse overflow-hidden">
                                <div className="h-52 bg-rose-100 dark:bg-slate-700" />
                                <div className="p-4 space-y-2">
                                    <div className="h-3 bg-rose-100 dark:bg-slate-700 rounded w-2/3 mx-auto" />
                                    <div className="h-5 bg-rose-200 dark:bg-slate-600 rounded w-4/5 mx-auto" />
                                    <div className="h-3 bg-rose-100 dark:bg-slate-700 rounded w-full mt-3" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : profiles.length === 0 ? (
                    <div className="text-center py-12 text-slate-400">No profiles available yet.</div>
                ) : (
                    <div
                        className="relative"
                        onMouseEnter={pauseAuto}
                        onMouseLeave={resumeAuto}
                    >
                        {/* Left Arrow */}
                        <button
                            onClick={prev}
                            className="absolute -left-5 top-1/2 -translate-y-1/2 z-10
                                       w-10 h-10 rounded-full bg-white dark:bg-slate-800 shadow-lg border border-rose-100 dark:border-slate-700
                                       flex items-center justify-center text-rose-500 hover:bg-rose-50 transition-all"
                            aria-label="Previous"
                        >
                            <ChevronRight className="w-5 h-5 rotate-180" />
                        </button>

                        {/* Cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 transition-all duration-500">
                            {slice.map((profile, idx) => (
                                <ProfileMatchCard key={profile._id || idx} profile={profile} getAge={getAge} />
                            ))}
                        </div>

                        {/* Right Arrow */}
                        <button
                            onClick={next}
                            className="absolute -right-5 top-1/2 -translate-y-1/2 z-10
                                       w-10 h-10 rounded-full bg-white dark:bg-slate-800 shadow-lg border border-rose-100 dark:border-slate-700
                                       flex items-center justify-center text-rose-500 hover:bg-rose-50 transition-all"
                            aria-label="Next"
                        >
                            <ChevronRight className="w-5 h-5" />
                        </button>

                        {/* Dots */}
                        <div className="flex justify-center gap-2 mt-8">
                            {Array.from({ length: totalSlides }).map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => setCurrent(i)}
                                    className={`rounded-full transition-all ${i === current
                                        ? 'w-6 h-2.5 bg-rose-500'
                                        : 'w-2.5 h-2.5 bg-rose-200 hover:bg-rose-300'}`}
                                    aria-label={`Go to slide ${i + 1}`}
                                />
                            ))}
                        </div>
                    </div>
                )}

                {/* View More */}
                <div className="text-center mt-10">
                    <button
                        onClick={onViewMore}
                        className="px-10 py-4 rounded-xl font-bold text-base
                                   bg-gradient-to-r from-rose-500 to-orange-500 text-white
                                   hover:from-rose-600 hover:to-orange-600 shadow-lg shadow-rose-200
                                   transition-all hover:scale-105 active:scale-95"
                    >
                        View More Profiles
                    </button>
                </div>
            </div>
        </section>
    );
}

// ─── Single Profile Card ──────────────────────────────────────────
function ProfileMatchCard({ profile, getAge }) {
    const firstPhoto = profile.photos?.[0]?.url || profile.photoUrl || null;
    const [imgError, setImgError] = useState(false);

    const fields = [
        { label: 'AGE', value: getAge(profile.dateOfBirth) },
        { label: 'HEIGHT', value: profile.height || '—' },
        { label: 'CASTE', value: profile.caste || '—', highlight: true },
    ];

    return (
        <div className="card-hover bg-white dark:bg-slate-800 rounded-2xl shadow-md overflow-hidden border border-rose-50 dark:border-slate-700 flex flex-col">
            {/* Photo */}
            <div className="relative h-52 bg-gradient-to-br from-rose-100 to-orange-100 dark:from-slate-700 dark:to-slate-600">
                {firstPhoto && !imgError ? (
                    <img
                        src={firstPhoto}
                        alt={profile.firstName || 'Profile'}
                        className="w-full h-full object-cover"
                        onError={() => setImgError(true)}
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <div className="text-5xl opacity-40">👤</div>
                    </div>
                )}
            </div>

            {/* Info */}
            <div className="p-4 flex flex-col flex-1">
                {/* Profile ID */}
                <p className="text-[10px] font-bold tracking-widest text-slate-400 uppercase text-center mb-1">
                    Profile ID: {profile.profileCode || profile._id?.slice(-6).toUpperCase() || '——'}
                </p>

                {/* Name */}
                <h3 className="text-center font-bold text-slate-900 dark:text-white text-base mb-3 leading-tight">
                    {profile.firstName || 'Groom/Bride'}{' '}
                    {profile.isUnlocked ? (profile.lastName || '') : ''}
                </h3>

                {/* Stats row */}
                <div className="grid grid-cols-3 gap-1 border-t border-slate-100 dark:border-slate-700 pt-3 mt-auto">
                    {fields.map((f) => (
                        <div key={f.label} className="text-center">
                            <p className="text-[9px] font-bold tracking-widest text-slate-400 uppercase mb-0.5">{f.label}</p>
                            <p className={`text-xs font-bold ${f.highlight ? 'text-rose-500' : 'text-slate-700 dark:text-slate-200'}`}>
                                {String(f.value).length > 10 ? String(f.value).slice(0, 10) + '…' : f.value}
                            </p>
                        </div>
                    ))}
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
        setCommunity('');
        setGender('');
        setError('');
        setIsDownloading(false);
        onClose();
    };

    const handleDownload = async () => {
        setError('');
        setIsDownloading(true);
        try {
            const query = new URLSearchParams({ community, gender }).toString();
            const url = `${API_BASE_URL}/reports/profiles/public?${query}`;
            const response = await fetch(url, { method: 'GET' });

            if (!response.ok) {
                let msg = 'Download failed. Please try again.';
                try {
                    const body = await response.json();
                    if (body?.message?.toLowerCase().includes('no published profiles')) {
                        msg = 'No profiles found for the selected filters. Please try a different combination.';
                    } else {
                        msg = body?.message || msg;
                    }
                } catch { }
                setError(msg);
                return;
            }

            const blob = await response.blob();
            const downloadUrl = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            const cd = response.headers.get('content-disposition');
            const match = cd?.match(/filename="?([^"]+)"?/i);
            link.href = downloadUrl;
            link.download = match ? match[1] : `VidhiLikhit_${community}_${gender}_Profiles.pdf`;
            link.target = '_blank';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(downloadUrl);
            handleClose();
        } catch (err) {
            setError('Network error. Please check your connection.');
        } finally {
            setIsDownloading(false);
        }
    };

    return (
        <div
            style={{
                position: 'fixed', inset: 0, zIndex: 9999,
                background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px'
            }}
            onClick={handleClose}
        >
            <div
                style={{
                    background: '#fff', borderRadius: '16px', padding: '32px',
                    width: '100%', maxWidth: '420px', boxShadow: '0 24px 64px rgba(0,0,0,0.25)',
                    position: 'relative'
                }}
                onClick={e => e.stopPropagation()}
            >
                {/* Close Button */}
                <button
                    onClick={handleClose}
                    style={{
                        position: 'absolute', top: '16px', right: '16px',
                        background: 'none', border: 'none', cursor: 'pointer',
                        fontSize: '20px', color: '#999', lineHeight: 1
                    }}
                >✕</button>

                {/* Title */}
                <h2 style={{ textAlign: 'center', fontSize: '22px', fontWeight: 800, color: '#FE6F61', marginBottom: '8px' }}>
                    Download Biodata Profiles
                </h2>
                <p style={{ textAlign: 'center', color: '#888', fontSize: '13px', marginBottom: '24px' }}>
                    Select community and gender to get the PDF
                </p>

                {/* Community Select */}
                <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#FE6F61', marginBottom: '6px' }}>Community</label>
                    <select
                        value={community}
                        onChange={e => { setCommunity(e.target.value); setError(''); }}
                        style={{
                            width: '100%', padding: '10px 14px', borderRadius: '10px',
                            border: community ? '1.5px solid #FE6F61' : '1.5px solid #e2e8f0',
                            fontSize: '14px', outline: 'none',
                            appearance: 'none', cursor: 'pointer', background: '#fff'
                        }}
                    >
                        <option value="all">All Communities</option>
                        <option value="brahmin">Brahmin</option>
                        <option value="lingayat">Lingayat</option>
                    </select>
                </div>

                {/* Gender Select */}
                <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#FE6F61', marginBottom: '6px' }}>Gender</label>
                    <select
                        value={gender}
                        onChange={e => { setGender(e.target.value); setError(''); }}
                        style={{
                            width: '100%', padding: '10px 14px', borderRadius: '10px',
                            border: gender ? '1.5px solid #FE6F61' : '1.5px solid #e2e8f0',
                            fontSize: '14px', outline: 'none',
                            appearance: 'none', cursor: 'pointer', background: '#fff'
                        }}
                    >
                        <option value="all">All Genders</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                    </select>
                </div>

                {/* Error */}
                {error && (
                    <div style={{ marginBottom: '16px', padding: '10px 14px', borderRadius: '8px', background: '#fff5f5', border: '1px solid #fed7d7', color: '#c53030', fontSize: '13px' }}>
                        {error}
                    </div>
                )}

                {/* Download Button */}
                <button
                    onClick={handleDownload}
                    disabled={isDownloading}
                    style={{
                        width: '100%', padding: '12px', borderRadius: '10px',
                        border: 'none', cursor: isDownloading ? 'not-allowed' : 'pointer',
                        background: isDownloading ? '#ffd4d0' : 'linear-gradient(135deg, #FE6F61, #FF8C00)',
                        color: '#fff', fontWeight: 800, fontSize: '15px',
                        transition: 'all 0.3s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
                    }}
                >
                    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    {isDownloading ? 'Downloading...' : 'Download Profiles PDF'}
                </button>
            </div>
        </div>
    );
}

// ─── Download Profiles Section ───────────────────────────────────
function DownloadProfilesSection() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [sectionRef, inView] = useInView();

    const features = [
        'Separate downloads for Brahmin & Lingayat profiles',
        'Verified details with authentic information',
        'Family & educational background included',
        'Contact the website owner for selected matches',
    ];

    return (
        <>
            <section
                ref={sectionRef}
                style={{
                    background: 'linear-gradient(135deg, #fff9f5 0%, #fff0e8 50%, #ffedf0 100%)',
                    padding: '80px 0',
                    position: 'relative',
                    overflow: 'hidden'
                }}
            >
                {/* Decorative background blobs */}
                <div style={{ position: 'absolute', top: '-40px', right: '-40px', width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(255,110,97,0.12) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />
                <div style={{ position: 'absolute', bottom: '-60px', left: '-60px', width: '350px', height: '350px', background: 'radial-gradient(circle, rgba(255,140,0,0.1) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />

                <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>
                    {/* Section top label */}
                    <div
                        className={`transition-all duration-700 ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
                        style={{ textAlign: 'center', marginBottom: '32px' }}
                    >
                        <span style={{
                            fontSize: '12px', fontWeight: 700, letterSpacing: '3px',
                            textTransform: 'uppercase', color: '#FE6F61', opacity: 0.8
                        }}>Community-Based Matches</span>
                    </div>

                    {/* Main Grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '48px', alignItems: 'center' }}>

                        {/* Left: Text Content */}
                        <div className={`transition-all duration-700 delay-100 ${inView ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'}`}>
                            <h2 style={{
                                fontSize: 'clamp(28px, 5vw, 48px)', fontWeight: 900, lineHeight: 1.15,
                                background: 'linear-gradient(135deg, #FF2754, #FF6600)',
                                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                                backgroundClip: 'text', marginBottom: '14px'
                            }}>
                                Download Verified Brahmin &amp; Lingayat Profiles Instantly
                            </h2>

                            <p style={{
                                fontSize: '16px', fontWeight: 600, lineHeight: 1.4,
                                background: 'linear-gradient(135deg, #FF2754, #FF6600)',
                                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                                backgroundClip: 'text', marginBottom: '20px'
                            }}>
                                A Bright Ray of Hope — Find Your Perfect Match With Trusted Biodata PDFs.
                            </p>

                            <div style={{ color: '#555', marginBottom: '24px', lineHeight: 1.7 }}>
                                <p style={{ fontSize: '16px', fontWeight: 600, marginBottom: '8px' }}>
                                    Looking For The Right Life Partner In Your Own Community?
                                </p>
                                <p style={{ fontSize: '14px', marginBottom: '6px' }}>
                                    With VidhiLikhit, you can instantly download verified biodata PDFs of Brahmin and Lingayat profiles — complete with personal details, education, and profession details.
                                </p>
                                <p style={{ fontSize: '14px' }}>
                                    Shortlist your favourites, and connect directly through us for the next step.
                                </p>
                            </div>

                            {/* Feature Checklist */}
                            <div style={{ marginBottom: '32px' }}>
                                {features.map((feature, i) => (
                                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                                        <div style={{
                                            width: '24px', height: '24px', borderRadius: '50%',
                                            background: '#e8f5e9', flexShrink: 0,
                                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                                        }}>
                                            <svg width="14" height="14" viewBox="0 0 20 20" fill="#22c55e">
                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                        <span style={{ color: '#444', fontSize: '14px' }}>{feature}</span>
                                    </div>
                                ))}
                            </div>

                            {/* CTA Button */}
                            <button
                                onClick={() => setIsModalOpen(true)}
                                style={{
                                    display: 'inline-flex', alignItems: 'center', gap: '10px',
                                    padding: '14px 32px', borderRadius: '12px',
                                    border: 'none', cursor: 'pointer',
                                    background: '#FE6F61',
                                    color: '#fff', fontWeight: 800, fontSize: '16px',
                                    boxShadow: '0 8px 24px rgba(254,111,97,0.35)',
                                    transition: 'all 0.3s'
                                }}
                                onMouseEnter={e => { e.currentTarget.style.background = '#e5594a'; e.currentTarget.style.transform = 'scale(1.04)'; }}
                                onMouseLeave={e => { e.currentTarget.style.background = '#FE6F61'; e.currentTarget.style.transform = 'scale(1)'; }}
                            >
                                <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                </svg>
                                Download PDF
                            </button>
                        </div>

                        {/* Right: Decorative Visual */}
                        <div className={`transition-all duration-700 delay-200 ${inView ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'}`}
                            style={{ display: 'flex', justifyContent: 'center' }}
                        >
                            <div style={{ position: 'relative', width: '100%', maxWidth: '360px' }}>
                                {/* Rotated accent card */}
                                <div style={{
                                    position: 'absolute', inset: 0, background: '#FFD5C2',
                                    borderRadius: '20px', transform: 'rotate(8deg)',
                                    top: '-10px', right: '-10px'
                                }} />
                                {/* Main card */}
                                <div style={{
                                    position: 'relative', borderRadius: '20px',
                                    background: 'linear-gradient(135deg, #fff5f0, #fff0f5)',
                                    boxShadow: '0 16px 48px rgba(255,111,97,0.18)',
                                    padding: '48px 32px', textAlign: 'center', zIndex: 1
                                }}>
                                    <div style={{ fontSize: '80px', marginBottom: '16px', lineHeight: 1 }}>👫</div>
                                    <div style={{
                                        fontSize: '20px', fontWeight: 800, color: '#333', marginBottom: '8px'
                                    }}>Community Profiles</div>
                                    <div style={{ fontSize: '13px', color: '#888', lineHeight: 1.6 }}>
                                        Brahmin &amp; Lingayat<br />Verified Biodata PDFs
                                    </div>
                                    {/* Mini stats */}
                                    <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', marginTop: '24px' }}>
                                        {[{ val: '10K+', label: 'Profiles' }, { val: '400+', label: 'Weddings' }].map(s => (
                                            <div key={s.label} style={{
                                                background: '#fff', borderRadius: '10px',
                                                padding: '10px 18px', boxShadow: '0 4px 12px rgba(0,0,0,0.06)'
                                            }}>
                                                <div style={{ fontSize: '18px', fontWeight: 900, color: '#FE6F61' }}>{s.val}</div>
                                                <div style={{ fontSize: '11px', color: '#999' }}>{s.label}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </section>

            {/* Download Modal */}
            <DownloadModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
        </>
    );
}

// ─── Main Component ──────────────────────────────────────────────

const Home = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { isAuthenticated, user } = useSelector((state) => state.auth);
    const [hasProfile, setHasProfile] = useState(false);

    useEffect(() => {
        if (!isAuthenticated) return;
        (async () => {
            try {
                const res = await getMyProfile();
                if (res.success && res.data) setHasProfile(true);
            } catch { /* no profile yet */ }
        })();
    }, [isAuthenticated]);

    const handleLogout = () => { dispatch(logout()); navigate('/'); };

    return (
        <div className="min-h-screen bg-white dark:bg-slate-900 overflow-x-hidden">
            <style>{STYLES}</style>

            {/* ── NAVBAR STRIP ── */}
            {isAuthenticated && (
                <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 py-2
                                bg-white/70 dark:bg-slate-900/70 backdrop-blur-lg
                                border-b border-white/30 shadow-sm">
                    <button
                        onClick={handleLogout}
                        className="font-bold text-lg shimmer-text tracking-wide focus:outline-none"
                    >
                        VidhiLikhit
                    </button>
                    <div className="flex items-center gap-3">
                        {!user?.isAdmin && (
                            user?.subscriptionStatus === 'active' && user?.remainingViews > 0 ? (
                                <div
                                    className="hidden sm:flex items-center px-3 py-1 rounded-full text-xs font-semibold
                                               bg-rose-50 text-rose-600 border border-rose-200 cursor-pointer"
                                    onClick={() => navigate('/payment')}
                                >
                                    <Star className="w-3 h-3 mr-1" />
                                    {user.remainingViews} Unlocks Left
                                </div>
                            ) : (
                                <button
                                    onClick={() => navigate('/payment')}
                                    className="hidden sm:flex items-center px-4 py-1.5 rounded-full text-xs font-bold
                                               bg-gradient-to-r from-rose-500 to-orange-500 text-white
                                               hover:from-rose-600 hover:to-orange-600 shadow-md transition-all hover:scale-105 active:scale-95"
                                >
                                    <Star className="w-3.5 h-3.5 mr-1" />
                                    {user?.subscriptionStatus === 'active' && user?.remainingViews === 0 ? 'Renew Subscription' : 'Buy Subscription'}
                                </button>
                            )
                        )}
                        <RefreshPageButton />

                        {user?.isAdmin && (
                            <button
                                onClick={() => navigate('/admin/dashboard')}
                                className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium
                                           bg-indigo-50 text-indigo-600 border border-indigo-200 hover:bg-indigo-100
                                           transition-all shadow-sm"
                            >
                                <LayoutDashboard className="w-4 h-4" /> Admin Dashboard
                            </button>
                        )}

                        <div
                            className="flex items-center gap-2 cursor-pointer px-3 py-1.5 rounded-full
                                       bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700
                                       hover:shadow-md transition-all text-sm font-medium"
                            onClick={() => navigate(hasProfile ? '/profile/me' : '/create-profile')}
                        >
                            {user?.photoUrl ? (
                                <img src={user.photoUrl} alt={user.firstName} className="w-6 h-6 rounded-full object-cover" />
                            ) : (
                                <div className="w-6 h-6 rounded-full bg-rose-100 flex items-center justify-center text-rose-600 text-xs font-bold">
                                    {(user?.firstName || user?.username || 'U').charAt(0).toUpperCase()}
                                </div>
                            )}
                            <span className="text-slate-700 dark:text-slate-200">{user?.firstName || user?.username}</span>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium
                                       border border-slate-200 hover:border-rose-300 hover:text-rose-600
                                       transition-all text-slate-600 dark:text-slate-300"
                        >
                            <LogOut className="w-3.5 h-3.5" /> Logout
                        </button>
                    </div>
                </div>
            )}

            {/* ══════════════════════════════════════════════════
                SECTION 1: HERO
            ══════════════════════════════════════════════════ */}
            <section className="relative min-h-screen flex items-center overflow-hidden">
                {/* Background gradient + decorative circles */}
                <div className="absolute inset-0 bg-gradient-to-br from-rose-50 via-orange-50 to-pink-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900" />
                <div className="absolute top-20 right-10 w-72 h-72 bg-rose-200/30 rounded-full blur-3xl" />
                <div className="absolute bottom-20 left-10 w-96 h-96 bg-orange-200/20 rounded-full blur-3xl" />
                {/* Dot grid */}
                <div className="absolute inset-0 opacity-30"
                    style={{ backgroundImage: 'radial-gradient(circle, #FF344C22 1px, transparent 1px)', backgroundSize: '32px 32px' }} />

                <div className={`relative z-10 w-full ${isAuthenticated ? 'pt-16' : 'pt-0'}`}>
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="grid lg:grid-cols-2 gap-12 items-center py-16">

                            {/* Left: Text */}
                            <div className="space-y-6">
                                <div className="animate-fadeUp delay-100 inline-flex items-center gap-2 px-4 py-2 rounded-full
                                               bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300
                                               text-sm font-semibold border border-rose-200 dark:border-rose-800">
                                    <Heart className="w-4 h-4 fill-current" />
                                    Trusted Matrimony for Brahmin & Lingayat
                                </div>

                                <h1 className="animate-fadeUp delay-200 text-5xl sm:text-6xl lg:text-7xl font-extrabold leading-tight text-slate-900 dark:text-white">
                                    Find Your{' '}
                                    <span className="shimmer-text">Perfect</span>
                                    <br />Match
                                </h1>

                                <p className="animate-fadeUp delay-300 text-xl text-slate-600 dark:text-slate-300 leading-relaxed max-w-xl">
                                    Built on <strong>trust, tradition, and love.</strong> A bright ray of hope for
                                    families seeking their perfect life partner.
                                </p>

                                <div className="animate-fadeUp delay-400 flex flex-wrap gap-4">
                                    {isAuthenticated && hasProfile ? (
                                        <>
                                            <button
                                                onClick={() => navigate('/create-profile')}
                                                className="flex items-center gap-2 px-8 py-4 rounded-xl font-bold text-base
                                                           bg-gradient-to-r from-rose-500 to-orange-500 text-white
                                                           hover:from-rose-600 hover:to-orange-600 shadow-lg shadow-rose-200
                                                           transition-all hover:scale-105 active:scale-95"
                                            >
                                                <Edit3 className="w-5 h-5" /> Edit Profile
                                            </button>
                                            <button
                                                onClick={() => navigate('/login')}
                                                className="flex items-center gap-2 px-8 py-4 rounded-xl font-bold text-base
                                                           border-2 border-rose-400 text-rose-600 dark:text-rose-400
                                                           hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-all"
                                            >
                                                Login <ChevronRight className="w-5 h-5" />
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <button
                                                onClick={() => navigate(isAuthenticated ? '/create-profile' : '/register')}
                                                className="flex items-center gap-2 px-8 py-4 rounded-xl font-bold text-base
                                                           bg-gradient-to-r from-rose-500 to-orange-500 text-white
                                                           hover:from-rose-600 hover:to-orange-600 shadow-lg shadow-rose-200
                                                           transition-all hover:scale-105 active:scale-95"
                                            >
                                                {isAuthenticated ? 'Create Profile' : 'Registration Free'}
                                                <ChevronRight className="w-5 h-5" />
                                            </button>
                                            <button
                                                onClick={() => navigate('/login')}
                                                className="flex items-center gap-2 px-8 py-4 rounded-xl font-bold text-base
                                                           border-2 border-rose-400 text-rose-600 dark:text-rose-400
                                                           hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-all"
                                            >
                                                Login <ChevronRight className="w-5 h-5" />
                                            </button>
                                        </>
                                    )}
                                </div>

                                {/* Quick stats */}
                                <div className="animate-fadeUp delay-500 flex flex-wrap gap-6 pt-4">
                                    {[
                                        { val: 400, suffix: '+', label: 'Weddings' },
                                        { val: 10000, suffix: '+', label: 'Profiles' },
                                        { val: 7, suffix: ' yrs', label: 'Trusted Since 2017' },
                                    ].map((s, i) => (
                                        <div key={i} className="text-center">
                                            <div className="text-2xl font-extrabold text-rose-600 dark:text-rose-400">
                                                <Counter target={s.val} suffix={s.suffix} />
                                            </div>
                                            <div className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">{s.label}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Right: Decorative illustration */}
                            <div className="hidden lg:flex items-center justify-center relative">
                                <div className="animate-float relative w-80 h-80">
                                    {/* Outer ring */}
                                    <div className="absolute inset-0 rounded-full border-4 border-rose-200/60 animate-ping" style={{ animationDuration: '3s' }} />
                                    {/* Inner circle */}
                                    <div className="absolute inset-4 rounded-full bg-gradient-to-br from-rose-100 to-orange-100 dark:from-rose-900/30 dark:to-orange-900/30 flex items-center justify-center shadow-2xl">
                                        <div className="text-center space-y-3">
                                            <div className="text-7xl font-black shimmer-text">❤</div>
                                            <div className="text-lg font-bold text-slate-700 dark:text-slate-200">VidhiLikhit</div>
                                            <div className="text-sm text-slate-500 dark:text-slate-400">Matrimony</div>
                                        </div>
                                    </div>
                                    {/* Floating badges */}
                                    {[
                                        { label: '✓ Verified', top: '0%', left: '70%', cls: 'bg-green-100 text-green-700 border-green-200' },
                                        { label: '🔒 Private', top: '75%', left: '-5%', cls: 'bg-blue-100 text-blue-700 border-blue-200' },
                                        { label: '💍 Matches', top: '80%', left: '70%', cls: 'bg-rose-100 text-rose-700 border-rose-200' },
                                        { label: '🛡 Trusted', top: '5%', left: '-5%', cls: 'bg-orange-100 text-orange-700 border-orange-200' },
                                    ].map((b, i) => (
                                        <div key={i}
                                            className={`absolute px-3 py-1.5 rounded-full text-xs font-bold border shadow-md ${b.cls}`}
                                            style={{ top: b.top, left: b.left }}
                                        >
                                            {b.label}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Wave divider */}
                <div className="absolute bottom-0 left-0 right-0">
                    <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
                        <path d="M0,40 C360,80 1080,0 1440,40 L1440,80 L0,80 Z" className="fill-white dark:fill-slate-800" />
                    </svg>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════
                SECTION 1.5: SUITABLE MATCHES CAROUSEL
            ══════════════════════════════════════════════════ */}
            <SuitableMatchesCarousel onViewMore={() => navigate('/profiles')} />

            {/* ══════════════════════════════════════════════════
                SECTION 1.7: DOWNLOAD PROFILES PDF
            ══════════════════════════════════════════════════ */}
            <DownloadProfilesSection />

            {/* ══════════════════════════════════════════════════
                SECTION 2: HOW IT WORKS
            ══════════════════════════════════════════════════ */}
            <section className="py-24 bg-white dark:bg-slate-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <Section>
                        <div className="text-center mb-16">
                            <p className="text-sm font-bold tracking-widest text-slate-500 uppercase mb-3">Simple Process</p>
                            <h2 className="text-4xl sm:text-5xl font-extrabold text-slate-900 dark:text-white mb-4">
                                How <span className="shimmer-text">VidhiLikhit</span> Works
                            </h2>
                            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
                                Simple steps to find your perfect life partner
                            </p>
                        </div>
                    </Section>

                    <div className="grid md:grid-cols-3 gap-8 relative">
                        {/* Connector line */}
                        <div className="hidden md:block absolute top-16 left-1/3 right-1/3 h-0.5 bg-gradient-to-r from-rose-200 via-orange-300 to-rose-200 z-0" />

                        {[
                            {
                                step: '01',
                                Icon: FileDown,
                                title: 'Download PDF',
                                desc: 'Get instant access to detailed PDF profiles of potential matches',
                                color: 'from-rose-500 to-pink-500',
                                bg: 'bg-rose-50 dark:bg-rose-900/20',
                            },
                            {
                                step: '02',
                                Icon: List,
                                title: 'Browse & Shortlist',
                                desc: 'Review profiles and create your personalized shortlist of interests',
                                color: 'from-orange-500 to-amber-500',
                                bg: 'bg-orange-50 dark:bg-orange-900/20',
                            },
                            {
                                step: '03',
                                Icon: PhoneCall,
                                title: 'Contact Us',
                                desc: 'Reach out to your matches and start meaningful conversations',
                                color: 'from-pink-500 to-rose-500',
                                bg: 'bg-pink-50 dark:bg-pink-900/20',
                            },
                        ].map((item, i) => (
                            <Section key={i}>
                                <div className={`relative z-10 card-hover rounded-2xl p-8 text-center ${item.bg} border border-white dark:border-slate-700 shadow-lg`}>
                                    <div className={`w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center shadow-lg`}>
                                        <item.Icon className="w-8 h-8 text-white" />
                                    </div>
                                    <div className="text-4xl font-black text-slate-200 dark:text-slate-700 mb-3 select-none">{item.step}</div>
                                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">{item.title}</h3>
                                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{item.desc}</p>
                                </div>
                            </Section>
                        ))}
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════
                SECTION 3: WHY CHOOSE US
            ══════════════════════════════════════════════════ */}
            <section className="py-24 bg-gradient-to-br from-rose-50 via-orange-50 to-pink-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-rose-200/20 rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-orange-200/20 rounded-full blur-3xl" />

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <Section>
                        <div className="text-center mb-16">
                            <span className="inline-block px-4 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase
                                            bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 mb-4">
                                Wedding Website
                            </span>
                            <h2 className="text-4xl sm:text-5xl font-extrabold text-slate-900 dark:text-white mb-4">
                                Why <span className="shimmer-text">Choose Us</span>
                            </h2>
                            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
                                Most Trusted and premium Matrimony Service in Karnataka
                            </p>
                        </div>
                    </Section>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            {
                                Icon: CheckCircle,
                                title: 'Genuine Profiles',
                                desc: 'Contact genuine profiles with 100% verified mobile numbers',
                                color: 'text-rose-600',
                                iconBg: 'bg-rose-100 dark:bg-rose-900/40',
                            },
                            {
                                Icon: Shield,
                                title: 'Most Trusted',
                                desc: 'The most trusted wedding matrimony brand in the region',
                                color: 'text-orange-600',
                                iconBg: 'bg-orange-100 dark:bg-orange-900/40',
                            },
                            {
                                Icon: Award,
                                title: '400+ Weddings',
                                desc: 'Hundreds of people have found their life partner through us',
                                color: 'text-pink-600',
                                iconBg: 'bg-pink-100 dark:bg-pink-900/40',
                            },
                        ].map((f, i) => (
                            <Section key={i}>
                                <div className="card-hover bg-white dark:bg-slate-800 rounded-2xl p-8 text-center shadow-lg border border-white dark:border-slate-700">
                                    <div className={`w-20 h-20 mx-auto mb-6 rounded-full ${f.iconBg} flex items-center justify-center`}>
                                        <f.Icon className={`w-10 h-10 ${f.color}`} />
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">{f.title}</h3>
                                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{f.desc}</p>
                                </div>
                            </Section>
                        ))}
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════
                SECTION 4: STATS BANNER
            ══════════════════════════════════════════════════ */}
            <section className="py-16 bg-gradient-to-r from-rose-600 via-pink-600 to-orange-500">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center text-white">
                        {[
                            { val: 400, suffix: '+', label: 'Successful Weddings' },
                            { val: 10000, suffix: '+', label: 'Active Profiles' },
                            { val: 2, suffix: '', label: 'Communities Served' },
                            { val: 7, suffix: '+', label: 'Years of Trust' },
                        ].map((s, i) => (
                            <Section key={i}>
                                <div className="text-4xl sm:text-5xl font-black mb-1">
                                    <Counter target={s.val} suffix={s.suffix} />
                                </div>
                                <div className="text-rose-100 text-sm font-medium">{s.label}</div>
                            </Section>
                        ))}
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════
                SECTION 5: WELCOME / ABOUT
            ══════════════════════════════════════════════════ */}
            <section className="py-24 bg-white dark:bg-slate-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">

                        {/* Left: Visual */}
                        <Section>
                            <div className="relative">
                                <div className="rounded-3xl overflow-hidden shadow-2xl bg-gradient-to-br from-rose-100 to-orange-100 dark:from-rose-900/30 dark:to-orange-900/30 aspect-square flex items-center justify-center">
                                    <div className="text-center p-12 space-y-6">
                                        <div className="text-9xl">👫</div>
                                        <div className="text-2xl font-bold text-slate-700 dark:text-slate-200">
                                            Welcome to VidhiLikhit Matrimony
                                        </div>
                                        <p className="text-slate-500 dark:text-slate-400 text-base leading-relaxed">
                                            Founded 12th January 2017 · Kalaburagi, Karnataka
                                        </p>
                                    </div>
                                </div>
                                {/* Decorative accent */}
                                <div className="absolute -bottom-6 -right-6 w-32 h-32 rounded-2xl bg-gradient-to-br from-rose-500 to-orange-500 opacity-20 rotate-12" />
                                <div className="absolute -top-6 -left-6 w-20 h-20 rounded-xl bg-gradient-to-br from-orange-400 to-rose-400 opacity-20 -rotate-12" />
                            </div>
                        </Section>

                        {/* Right: Text */}
                        <Section>
                            <div className="space-y-6">
                                <div>
                                    <h2 className="text-4xl sm:text-5xl font-extrabold mb-2">
                                        <span className="shimmer-text">WELCOME TO</span>
                                    </h2>
                                    <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-800 dark:text-white">
                                        VIDHILIKHIT MATRIMONY
                                    </h2>
                                </div>

                                <p className="text-slate-600 dark:text-slate-300 text-base leading-relaxed">
                                    Finding your perfect life partner starts here. At VidhiLikhit Matrimony, we believe
                                    that every relationship begins with trust and understanding. Our platform helps you
                                    connect with genuine matches who share your values, dreams, and goals.
                                </p>

                                <p className="text-slate-600 dark:text-slate-300 text-base leading-relaxed">
                                    We bring traditional matchmaking into the modern world — secure, personalized, and
                                    effortless. Originally serving the Brahmin community, we have now expanded to the
                                    Lingayat community, preserving their unique heritage.
                                </p>

                                <p className="text-slate-600 dark:text-slate-300 text-base leading-relaxed">
                                    While our primary focus remains on fresh marriages, we also extend our services to
                                    divorcees, widows, and widowers, offering a respectful space to rediscover companionship.
                                </p>

                                {/* Contact bar */}
                                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                                    <a href="tel:8123656445"
                                        className="flex items-center gap-3 px-5 py-3 rounded-xl bg-rose-50 dark:bg-rose-900/20
                                                   border border-rose-200 dark:border-rose-800 hover:bg-rose-100 transition-colors group">
                                        <div className="w-9 h-9 rounded-full bg-rose-500 flex items-center justify-center">
                                            <Phone className="w-4 h-4 text-white" />
                                        </div>
                                        <span className="font-semibold text-slate-700 dark:text-slate-200 group-hover:text-rose-600">8123656445</span>
                                    </a>
                                    <a href="mailto:support@vidhilikhit.com"
                                        className="flex items-center gap-3 px-5 py-3 rounded-xl bg-orange-50 dark:bg-orange-900/20
                                                   border border-orange-200 dark:border-orange-800 hover:bg-orange-100 transition-colors group">
                                        <div className="w-9 h-9 rounded-full bg-orange-500 flex items-center justify-center">
                                            <Mail className="w-4 h-4 text-white" />
                                        </div>
                                        <span className="font-semibold text-slate-700 dark:text-slate-200 group-hover:text-orange-600 text-sm">support@vidhilikhit.com</span>
                                    </a>
                                </div>

                                <button
                                    onClick={() => navigate(isAuthenticated ? (hasProfile ? '/profiles' : '/create-profile') : '/register')}
                                    className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-bold text-base
                                               bg-gradient-to-r from-rose-500 to-orange-500 text-white
                                               hover:from-rose-600 hover:to-orange-600 shadow-lg shadow-rose-200
                                               transition-all hover:scale-105 active:scale-95"
                                >
                                    Begin Your Journey <ChevronRight className="w-5 h-5" />
                                </button>
                            </div>
                        </Section>
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════
                SECTION 6: SUCCESS STORIES PLACEHOLDER
            ══════════════════════════════════════════════════ */}
            <section className="py-24 bg-gradient-to-b from-rose-50 to-white dark:from-slate-900 dark:to-slate-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <Section>
                        <div className="text-center mb-16">
                            <p className="text-sm font-bold tracking-widest text-slate-500 uppercase mb-3">Trusted Brand</p>
                            <h2 className="text-4xl sm:text-5xl font-extrabold mb-4">
                                <span className="shimmer-text">Success Stories</span>
                            </h2>
                            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
                                Real couples who found their perfect match on VidhiLikhit Matrimony
                            </p>
                        </div>
                    </Section>

                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[
                            { emoji: '💑', names: 'Rahul & Priya', community: 'Brahmin', desc: 'Found each other through VidhiLikhit and couldn\'t be happier. The platform made our families feel safe and connected.' },
                            { emoji: '👰', names: 'Arjun & Kavya', community: 'Lingayat', desc: 'The verification process gave us confidence. Within 3 months we found our perfect match. Eternally grateful!' },
                            { emoji: '💍', names: 'Suresh & Deepa', community: 'Brahmin', desc: 'Traditional values met modern convenience. VidhiLikhit understood our community\'s needs perfectly.' },
                        ].map((story, i) => (
                            <Section key={i}>
                                <div className="card-hover bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-lg border border-rose-100 dark:border-slate-700">
                                    <div className="flex justify-center mb-6">
                                        <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-rose-100 to-orange-100 dark:from-rose-900/30 dark:to-orange-900/30 flex items-center justify-center text-4xl shadow-lg">
                                            {story.emoji}
                                        </div>
                                    </div>
                                    <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed mb-6 italic">
                                        "{story.desc}"
                                    </p>
                                    <div className="border-t border-rose-100 dark:border-slate-700 pt-4">
                                        <h3 className="font-bold text-slate-900 dark:text-white">{story.names}</h3>
                                        <p className="text-xs text-rose-500 font-medium mt-0.5">{story.community} · VidhiLikhit Matrimony</p>
                                    </div>
                                </div>
                            </Section>
                        ))}
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════
                SECTION 7: JOIN CTA
            ══════════════════════════════════════════════════ */}
            <section className="py-24 bg-white dark:bg-slate-800">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <Section>
                        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-rose-500 via-pink-500 to-orange-500 p-12 text-center shadow-2xl">
                            {/* Decorative dots */}
                            <div className="absolute inset-0 opacity-10"
                                style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
                            <div className="relative z-10 space-y-6">
                                <div className="text-5xl">💍</div>
                                <h2 className="text-4xl sm:text-5xl font-extrabold text-white">
                                    Join VidhiLikhit
                                </h2>
                                <p className="text-rose-100 text-lg leading-relaxed max-w-2xl mx-auto">
                                    Over the years, VidhiLikhit Matrimony has grown from a family initiative into a
                                    trusted name in matrimonial services — connecting hearts, building families, and
                                    nurturing lifelong relationships.
                                </p>
                                <p className="text-white/80 text-base max-w-xl mx-auto">
                                    A family-run platform, devoted to the Brahmin and Lingayat communities, and a
                                    bright ray of hope for every heart seeking a true connection.
                                </p>
                                <div className="flex flex-wrap justify-center gap-4 pt-4">
                                    <button
                                        onClick={() => navigate(isAuthenticated ? (hasProfile ? '/profiles' : '/create-profile') : '/login')}
                                        className="px-10 py-4 rounded-xl font-bold text-rose-600 bg-white
                                                   hover:bg-rose-50 shadow-lg transition-all hover:scale-105 active:scale-95"
                                    >
                                        {isAuthenticated ? 'Login' : 'Registration Free'}
                                    </button>
                                    {!isAuthenticated && (
                                        <button
                                            onClick={() => navigate('/login')}
                                            className="px-10 py-4 rounded-xl font-bold text-white border-2 border-white/60
                                                       hover:bg-white/10 transition-all"
                                        >
                                            Sign In
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </Section>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════
                FOOTER STRIP
            ══════════════════════════════════════════════════ */}
            <footer className="bg-slate-900 text-slate-400 py-8 text-center text-sm">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="font-bold text-white text-xl shimmer-text mb-2">VidhiLikhit Matrimony</div>
                    <p>Founded 12th January 2017 · Kalaburagi, Karnataka</p>
                    <p className="mt-1">© {new Date().getFullYear()} VidhiLikhit Matrimony. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
};

export default Home;
