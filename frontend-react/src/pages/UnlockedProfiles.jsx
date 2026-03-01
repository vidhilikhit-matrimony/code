import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUnlockedProfiles } from '../services/profileService';
import { User, Users, LockOpen, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

export default function UnlockedProfiles() {
    const [profiles, setProfiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        loadProfiles();
    }, []);

    const loadProfiles = async () => {
        try {
            setLoading(true);
            const response = await getUnlockedProfiles();
            if (response.success) {
                setProfiles(response.data || []);
            } else {
                toast.error(response.message || 'Failed to fetch unlocked profiles');
            }
        } catch (error) {
            console.error('Failed to load unlocked profiles:', error);
            toast.error('An error occurred while loading unlocked profiles');
        } finally {
            setLoading(false);
        }
    };

    const getAge = (dobString) => {
        if (!dobString) return '';
        const dob = new Date(dobString);
        const today = new Date();
        let age = today.getFullYear() - dob.getFullYear();
        if (today.getMonth() < dob.getMonth() || (today.getMonth() === dob.getMonth() && today.getDate() < dob.getDate())) {
            age--;
        }
        return age;
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fadeIn mt-16 font-sans">
            <div className="mb-4">
                <button
                    onClick={() => navigate('/profiles')}
                    className="flex items-center text-slate-500 hover:text-slate-800 transition-colors font-medium px-2 py-1 -ml-2 rounded-md hover:bg-slate-100"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Profiles
                </button>
            </div>

            <div className="mb-8">
                <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3 font-serif">
                    <LockOpen className="w-8 h-8 text-primary-600" />
                    My Unlocked Profiles
                </h1>
                <p className="text-slate-600 mt-2 text-lg">
                    A collection of all the profiles you have chosen to unlock the contact details for.
                </p>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="bg-slate-100 rounded-xl h-96 animate-pulse" />
                    ))}
                </div>
            ) : profiles.length === 0 ? (
                <div className="bg-white rounded-xl border border-slate-200 p-12 text-center shadow-sm">
                    <Users className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-slate-700 mb-2">No Profiles Unlocked Yet</h3>
                    <p className="text-slate-500 max-w-md mx-auto mb-6">
                        You haven't unlocked any profiles yet. Browse the community and use your available view counts to unlock profile contact details.
                    </p>
                    <button
                        onClick={() => navigate('/profiles')}
                        className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2.5 rounded-lg font-medium transition-colors"
                    >
                        Browse Profiles
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {profiles.map((profile) => {
                        const firstPhoto = profile.photos?.[0]?.url || profile.photoUrl || null;

                        return (
                            <div
                                key={profile._id}
                                onClick={() => navigate(`/profiles/${profile._id}`)}
                                className="bg-white rounded-xl border border-slate-200 overflow-hidden flex flex-col hover:shadow-xl transition-all duration-300 cursor-pointer group"
                            >
                                <div className="relative h-64 bg-slate-50 overflow-hidden">
                                    {firstPhoto ? (
                                        <img
                                            src={firstPhoto}
                                            alt="Profile"
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                            onError={(e) => { e.target.style.display = 'none'; }}
                                        />
                                    ) : (
                                        <div className="w-full h-full flex flex-col items-center justify-center text-slate-300">
                                            <User className="w-16 h-16 mb-2 opacity-30" />
                                        </div>
                                    )}
                                    <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm text-primary-700 border border-primary-600/20 text-[10px] font-bold px-3 py-1.5 rounded uppercase tracking-wider shadow-sm">
                                        ID: {profile.profileCode || 'VERIFIED'}
                                    </div>
                                </div>

                                <div className="p-5 flex flex-col flex-1 border-t-4 border-primary-600">
                                    <h3 className="font-bold text-slate-800 text-lg mb-4 font-serif truncate">
                                        {profile.firstName || 'Member'} {profile.lastName}
                                    </h3>

                                    <div className="grid grid-cols-2 gap-y-4 gap-x-2 text-sm text-slate-600 mt-auto">
                                        <div className="flex flex-col truncate">
                                            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">Age / Height</span>
                                            <span className="font-semibold">{getAge(profile.dateOfBirth)} yrs, {profile.height || '—'}</span>
                                        </div>
                                        <div className="flex flex-col truncate">
                                            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">Community</span>
                                            <span className="font-semibold text-primary-700">{profile.caste || '—'}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
