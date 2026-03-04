import React, { useEffect } from 'react';
import { ArrowLeft, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const TermsOfService = () => {
    const navigate = useNavigate();

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="min-h-screen bg-slate-50 font-sans selection:bg-primary-600 selection:text-white">
            {/* Header Area */}
            <div className="bg-white border-b border-slate-200 sticky top-0 z-40">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center text-slate-500 hover:text-slate-900 transition-colors font-medium group"
                    >
                        <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
                        Back
                    </button>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20 lg:py-24">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="bg-white rounded-[2rem] p-8 md:p-16 shadow-xl border border-slate-100 relative overflow-hidden"
                >
                    {/* Decorative Background */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-slate-50 opacity-50 rounded-bl-full pointer-events-none -z-10" />

                    <div className="mb-12">
                        <div className="w-20 h-20 bg-amber-50 rounded-2xl flex items-center justify-center mb-8 border border-amber-100 shadow-sm">
                            <Shield className="w-10 h-10 text-amber-500" />
                        </div>
                        <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 font-serif mb-6 leading-tight">
                            Terms and Service
                        </h1>
                        <p className="text-lg md:text-xl text-slate-600 font-medium">
                            Very Special Information to all Bride & Bridegrooms, their Parents / Relatives.
                        </p>
                    </div>

                    <div className="space-y-8 text-slate-700 leading-relaxed font-medium">
                        <div className="flex gap-4 p-6 bg-slate-50 rounded-2xl border border-slate-100">
                            <div className="w-2 h-2 rounded-full bg-primary-600 mt-2.5 shrink-0" />
                            <p>
                                Vidilikhit Organization serves as a medium of contact information and offer their services on best effort basis but does not take responsibility of any mis-information given by the member. The all information of profile candidate is displayed in magazine is given by the profile candidate, their parents / relatives and our colleagues, marriage bureaus through phones, whatsapp, emails, websites etc..... If any information provided by the member to be inaccurate, then Vidhilikhit Organization has every right to refuse, terminate or delete the profile from our database any time without assigning any reason. Vidhilikhit Organization reserves the right to withdraw, modify if any.
                            </p>
                        </div>

                        <div className="flex gap-4 p-6 bg-slate-50 rounded-2xl border border-slate-100">
                            <div className="w-2 h-2 rounded-full bg-primary-600 mt-2.5 shrink-0" />
                            <p>
                                If any profile candidate wants to fix their marriage with any profile candidate confirm all information which they want necessary for marriage purpose. Vidhilikhit Organization is not responsible for any wrong information given by them.
                            </p>
                        </div>

                        <div className="flex gap-4 p-6 bg-slate-50 rounded-2xl border border-slate-100">
                            <div className="w-2 h-2 rounded-full bg-primary-600 mt-2.5 shrink-0" />
                            <p>
                                While you are contacting to any profile candidate especially with female profiles communicate, contact as per their qualification, expectation and suitability. Those who are approaching with female profile candidates, their parents / relatives communicate in a systematic manner because all are suffering from various problems, situations, etc.
                            </p>
                        </div>

                        <div className="flex gap-4 p-6 bg-slate-50 rounded-2xl border border-slate-100">
                            <div className="w-2 h-2 rounded-full bg-primary-600 mt-2.5 shrink-0" />
                            <p>
                                If any one profile candidate marriage is fixed then inform us Vidhilikhit Organization immediately. We will delete their name from our data base, contact list. It is their bounden duty.
                            </p>
                        </div>

                        <div className="flex gap-4 p-6 bg-slate-50 rounded-2xl border border-slate-100">
                            <div className="w-2 h-2 rounded-full bg-slate-400 mt-2.5 shrink-0" />
                            <p>
                                Intentionally we are not uploaded photos of profile candidates, if you want to see it, you can contact us.
                            </p>
                        </div>

                        <div className="flex gap-4 p-6 bg-slate-50 rounded-2xl border border-slate-100">
                            <div className="w-2 h-2 rounded-full bg-amber-500 mt-2.5 shrink-0" />
                            <p>
                                Any disputes or any legally matter etc. come under Kalaburagi Judicial Only.
                            </p>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default TermsOfService;
