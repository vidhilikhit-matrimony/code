import React, { useEffect } from 'react';
import { Calendar, MessageCircle, ChevronLeft } from "lucide-react";
import { useNavigate } from 'react-router-dom';

const STYLES = `
.text-crimson { color: #9A031E; }
.bg-crimson { background-color: #9A031E; }
.border-crimson { border-color: #9A031E; }
.text-saffron { color: #F05D23; }
.bg-saffron { background-color: #F05D23; }
.text-gold { color: #E3B23C; }
.bg-gold { background-color: #E3B23C; }
.bg-mandala-pattern {
    background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M54.627 0l.83.83-1.66 1.66-.83-.83.83-.83zM0 54.627l.83.83-1.66 1.66-.83-.83.83-.83zm54.627-54.627l-1.66 1.66-.83-.83 1.66-1.66.83.83zm-54.627 54.627l-1.66 1.66-.83-.83 1.66-1.66.83.83zM15.255 0l.83.83-1.66 1.66-.83-.83.83-.83zm0 54.627l.83.83-1.66 1.66-.83-.83.83-.83zm-15.255-39.372l.83.83-1.66 1.66-.83-.83.83-.83zm54.627 0l.83.83-1.66 1.66-.83-.83.83-.83z' fill='%239A031E' fill-opacity='0.03' fill-rule='evenodd'/%3E%3C/svg%3E");
}
.premium-shadow {
    box-shadow: 0 10px 40px -10px rgba(154, 3, 30, 0.15);
}
`;

export default function HelpFAQ() {
    const navigate = useNavigate();
    useEffect(() => { window.scrollTo(0, 0); }, []);

    return (
        <div className="min-h-screen bg-[#FAF8F5] font-sans text-[#2A2321] selection:bg-crimson selection:text-white bg-mandala-pattern">
            <style>{STYLES}</style>

            {/* Header */}
            <div className="fixed top-0 left-0 right-0 z-[90] flex items-center px-4 sm:px-6 py-4 bg-white border-b border-[#E8E2D9] shadow-sm">
                <button onClick={() => navigate('/')} className="flex items-center gap-2 text-[#5A524D] hover:text-crimson font-bold text-sm transition-colors">
                    <ChevronLeft className="w-5 h-5" /> Back to Home
                </button>
            </div>

            <div className="max-w-5xl mx-auto p-4 sm:p-8 py-24 mt-12">

                {/* Header */}
                <div className="text-center space-y-4 mb-16 max-w-3xl mx-auto">
                    <span className="text-xs font-bold uppercase tracking-[0.2em] text-crimson mb-2 block">Support Center</span>
                    <h1 className="text-4xl sm:text-5xl font-extrabold text-[#2A2321] font-serif mb-6">
                        Help & FAQs
                    </h1>
                    <p className="text-lg text-[#5A524D] leading-relaxed">
                        Here you'll find answers about creating your account, upgrading to
                        premium, unlocking profiles, and maintaining your privacy.
                    </p>
                </div>

                {/* Account and Registration */}
                <section className="mb-10">
                    <div className="bg-white rounded-xl p-8 lg:p-10 border border-[#E8E2D9] premium-shadow border-l-8 border-l-crimson text-left">
                        <h2 className="text-2xl font-bold font-serif text-[#2A2321] mb-8 border-b border-[#E8E2D9] pb-4">
                            Account & Registration
                        </h2>
                        <div className="space-y-8">
                            <div>
                                <p className="text-[#2A2321] font-bold mb-2 text-lg">
                                    1. How do I create an account?
                                </p>
                                <p className="text-[#5A524D] leading-relaxed">
                                    Click the "Register" button on the homepage and fill in your
                                    basic details. After registering, verify your email or mobile
                                    number to activate your account.
                                </p>
                            </div>

                            <div>
                                <p className="text-[#2A2321] font-bold mb-2 text-lg">
                                    2. Is registration free?
                                </p>
                                <p className="text-[#5A524D] leading-relaxed">
                                    Yes, registration and browsing limited profiles are free. To
                                    view full profile details, you need a Premium Membership.
                                </p>
                            </div>

                            <div>
                                <p className="text-[#2A2321] font-bold mb-2 text-lg">
                                    3. I forgot my password. What should I do?
                                </p>
                                <p className="text-[#5A524D] leading-relaxed">
                                    Click on "Forgot Password" on the login page and follow the
                                    instructions to reset it.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Premium Membership & Payments */}
                <section className="mb-10">
                    <div className="bg-white rounded-xl p-8 lg:p-10 border border-[#E8E2D9] premium-shadow border-l-8 border-l-saffron text-left">
                        <h2 className="text-2xl font-bold font-serif text-[#2A2321] mb-8 border-b border-[#E8E2D9] pb-4">
                            Premium Membership & Payments
                        </h2>
                        <div className="space-y-8">
                            <div>
                                <p className="text-[#2A2321] font-bold mb-2 text-lg">
                                    4. How do I become a Premium Member?
                                </p>
                                <p className="text-[#5A524D] leading-relaxed">
                                    If you like someone's profile, you can unlock their full details
                                    by becoming a Premium Member.
                                </p>
                            </div>

                            <div>
                                <p className="text-[#2A2321] font-bold mb-2 text-lg">
                                    5. How do I make the payment?
                                </p>
                                <p className="text-[#5A524D] leading-relaxed">
                                    We currently do not use an online payment gateway. You can pay
                                    using the Matrimony Team's official QR code or bank account
                                    details shown on the Premium page.
                                </p>
                            </div>

                            <div>
                                <p className="text-[#2A2321] font-bold mb-2 text-lg">
                                    6. What should I do after making the payment?
                                </p>
                                <p className="text-[#5A524D] leading-relaxed">
                                    After payment, note your Transaction ID and submit it in the
                                    payment confirmation form on the website. Alternatively, you can
                                    share your payment proof and profile ID directly with the
                                    Matrimony Team on WhatsApp.
                                </p>
                            </div>

                            <div>
                                <p className="text-[#2A2321] font-bold mb-2 text-lg">
                                    7. How long does it take to verify my payment?
                                </p>
                                <p className="text-[#5A524D] leading-relaxed">
                                    Once you share your payment details, our Matrimony Team verifies
                                    them manually within 1–2 working hours or within 24 hours at
                                    most.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Profile Unlock & Tokens */}
                <section className="mb-10">
                    <div className="bg-white rounded-xl p-8 lg:p-10 border border-[#E8E2D9] premium-shadow border-l-8 border-l-gold text-left">
                        <h2 className="text-2xl font-bold font-serif text-[#2A2321] mb-8 border-b border-[#E8E2D9] pb-4">
                            Profile Unlock & Access Tokens
                        </h2>
                        <div className="space-y-8">
                            <div>
                                <p className="text-[#2A2321] font-bold mb-2 text-lg">
                                    8. What is an Access Token?
                                </p>
                                <p className="text-[#5A524D] leading-relaxed">
                                    An Access Token is a unique code that allows you to unlock and
                                    view full details of selected profiles.
                                </p>
                            </div>

                            <div>
                                <p className="text-[#2A2321] font-bold mb-2 text-lg">
                                    9. How do I use my Access Token?
                                </p>
                                <p className="text-[#5A524D] leading-relaxed">
                                    When you visit a profile, click the "Unlock Profile" button.
                                    Enter your Access Token, and the full profile details will be
                                    displayed.
                                </p>
                            </div>

                            <div>
                                <p className="text-[#2A2321] font-bold mb-2 text-lg">
                                    10. Can I view unlimited profiles with one token?
                                </p>
                                <p className="text-[#5A524D] leading-relaxed">
                                    No. Your plan allows you to view 35 profiles in total. Each time
                                    you unlock a profile, your remaining count decreases.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Communication & Privacy */}
                <section className="mb-10">
                    <div className="bg-white rounded-xl p-8 lg:p-10 border border-[#E8E2D9] premium-shadow border-l-8 border-l-crimson text-left">
                        <h2 className="text-2xl font-bold font-serif text-[#2A2321] mb-8 border-b border-[#E8E2D9] pb-4">
                            Communication & Privacy
                        </h2>
                        <div className="space-y-8">
                            <div>
                                <p className="text-[#2A2321] font-bold mb-2 text-lg">
                                    11. Can I contact a profile directly?
                                </p>
                                <p className="text-[#5A524D] leading-relaxed">
                                    Yes. Once you unlock a profile using your Access Token, you'll
                                    be able to view the person's full profile details, including
                                    contact information.
                                </p>
                            </div>

                            <div>
                                <p className="text-[#2A2321] font-bold mb-2 text-lg">
                                    12. How is my data protected?
                                </p>
                                <p className="text-[#5A524D] leading-relaxed">
                                    Your personal information is secure. Contact details are only
                                    visible to verified premium users. We never share your data with
                                    third parties.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Contact Support */}
                <section className="mt-12">
                    <div className="bg-[#2A2321] text-white rounded-xl p-8 md:p-12 text-center relative overflow-hidden premium-shadow border-t-4 border-t-crimson">
                        <div className="absolute inset-0 opacity-10 bg-mandala-pattern invert"></div>
                        <div className="relative z-10">
                            <h2 className="text-3xl font-extrabold font-serif text-white mb-4">
                                Still need help?
                            </h2>
                            <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
                                Reach out to our support team and we will be happy to assist you in your journey.
                            </p>

                            <div className="flex flex-col sm:flex-row justify-center items-center gap-6">
                                {/* Availability */}
                                <div className="flex items-center gap-4 bg-white/10 px-6 py-4 rounded-lg backdrop-blur-sm border border-white/20">
                                    <Calendar className="w-6 h-6 text-gold" />
                                    <p className="text-sm font-semibold tracking-wide">Mon–Sat, 10 AM – 6 PM (IST)</p>
                                </div>

                                {/* WhatsApp */}
                                <div className="flex items-center gap-4 bg-white/10 px-6 py-4 rounded-lg backdrop-blur-sm border border-white/20">
                                    <MessageCircle className="w-6 h-6 text-[#25D366]" />
                                    <p className="text-sm font-semibold tracking-wide">+91-81236 56445</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}
