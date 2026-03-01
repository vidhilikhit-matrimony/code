import React, { useEffect } from 'react';
import { Mail, Phone, ChevronLeft } from "lucide-react";
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

export default function PrivacyPolicy() {
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

            <div className="max-w-4xl mx-auto p-4 sm:p-8 py-24 mt-12">

                {/* Header */}
                <div className="text-center space-y-4 mb-16">
                    <span className="text-xs font-bold uppercase tracking-[0.2em] text-crimson mb-2 block">Legal & Privacy</span>
                    <h1 className="text-4xl sm:text-5xl font-extrabold text-[#2A2321] font-serif mb-6">
                        Privacy Policy
                    </h1>
                    <p className="text-lg text-[#5A524D] leading-relaxed max-w-2xl mx-auto">
                        At VidhiLikhit, we value your trust and are committed to protecting your personal information.
                        This Privacy Policy explains how we collect, use, and safeguard your data.
                    </p>
                </div>

                <div className="bg-white rounded-xl border border-[#E8E2D9] premium-shadow overflow-hidden border-t-8 border-t-crimson">
                    {/* Section 1 */}
                    <div className="p-8 border-b border-[#E8E2D9]">
                        <h2 className="text-2xl font-bold font-serif text-[#2A2321] mb-4 flex items-center gap-3">
                            <span className="text-crimson text-sm">01.</span> Information We Collect
                        </h2>
                        <div className="space-y-4 pl-8">
                            <p className="text-[#5A524D] leading-relaxed">
                                We collect personal information provided by users during registration, such as:
                            </p>
                            <ul className="list-disc ml-6 text-[#5A524D] space-y-2 leading-relaxed">
                                <li>Full name, gender, age, and contact details.</li>
                                <li>Profile photos, education, occupation, and family details.</li>
                                <li>Payment details (for verification purposes only).</li>
                            </ul>
                            <p className="text-[#5A524D] leading-relaxed">
                                We may also collect non-personal data like browser type, device info, and usage statistics to improve our services.
                            </p>
                        </div>
                    </div>

                    {/* Section 2 */}
                    <div className="p-8 border-b border-[#E8E2D9] bg-[#FAF8F5]">
                        <h2 className="text-2xl font-bold font-serif text-[#2A2321] mb-4 flex items-center gap-3">
                            <span className="text-crimson text-sm">02.</span> How We Use Your Information
                        </h2>
                        <div className="space-y-4 pl-8">
                            <p className="text-[#5A524D] leading-relaxed">Your information is used to:</p>
                            <ul className="list-disc ml-6 text-[#5A524D] space-y-2 leading-relaxed">
                                <li>Create and manage user profiles.</li>
                                <li>Verify payments and issue Access Tokens.</li>
                                <li>Connect suitable matches within the platform.</li>
                                <li>Communicate updates, offers, and important notices.</li>
                                <li>Improve security, performance, and overall user experience.</li>
                            </ul>
                            <p className="text-[#2A2321] font-medium mt-4">
                                We do not sell or rent your personal data to anyone.
                            </p>
                        </div>
                    </div>

                    {/* Section 3 */}
                    <div className="p-8 border-b border-[#E8E2D9]">
                        <h2 className="text-2xl font-bold font-serif text-[#2A2321] mb-4 flex items-center gap-3">
                            <span className="text-crimson text-sm">03.</span> Data Storage & Security
                        </h2>
                        <div className="space-y-4 pl-8">
                            <p className="text-[#5A524D] leading-relaxed">
                                All user data is stored securely in our internal database.
                                We use strong security measures to protect your personal information.
                                However, users are advised to keep their login and token details private to avoid unauthorized access.
                            </p>
                        </div>
                    </div>

                    {/* Section 4 */}
                    <div className="p-8 border-b border-[#E8E2D9] bg-[#FAF8F5]">
                        <h2 className="text-2xl font-bold font-serif text-[#2A2321] mb-4 flex items-center gap-3">
                            <span className="text-crimson text-sm">04.</span> Data Deletion & User Rights
                        </h2>
                        <div className="space-y-4 pl-8">
                            <p className="text-[#5A524D] leading-relaxed">
                                Users can request deletion or modification of their own profile or data anytime by contacting our support team.
                                Once verified, the requested data will be removed from our database within a reasonable time frame.
                            </p>
                        </div>
                    </div>

                    {/* Section 5 */}
                    <div className="p-8 border-b border-[#E8E2D9]">
                        <h2 className="text-2xl font-bold font-serif text-[#2A2321] mb-4 flex items-center gap-3">
                            <span className="text-crimson text-sm">05.</span> Information Accuracy
                        </h2>
                        <div className="space-y-4 pl-8">
                            <p className="text-[#5A524D] leading-relaxed">
                                All details and photos uploaded on the platform are provided voluntarily by the user or their family/relatives.
                                VidhiLikhit is not responsible for any false, incomplete, or misleading information provided by users.
                            </p>
                        </div>
                    </div>

                    {/* Section 6 */}
                    <div className="p-8 border-b border-[#E8E2D9] bg-[#FAF8F5]">
                        <h2 className="text-2xl font-bold font-serif text-[#2A2321] mb-4 flex items-center gap-3">
                            <span className="text-crimson text-sm">06.</span> Policy Updates
                        </h2>
                        <div className="space-y-4 pl-8">
                            <p className="text-[#5A524D] leading-relaxed">
                                VidhiLikhit reserves the right to modify or update this Privacy Policy at any time.
                                Any significant changes will be communicated through our website or official channels.
                            </p>
                        </div>
                    </div>

                    {/* Section 7 */}
                    <div className="p-8 border-b border-[#E8E2D9]">
                        <h2 className="text-2xl font-bold font-serif text-[#2A2321] mb-4 flex items-center gap-3">
                            <span className="text-crimson text-sm">07.</span> Legal Jurisdiction
                        </h2>
                        <div className="space-y-4 pl-8">
                            <p className="text-[#5A524D] leading-relaxed">
                                Any disputes or legal matters related to this Privacy Policy will fall under the jurisdiction of Kalaburagi Judicial Authority only.
                            </p>
                        </div>
                    </div>

                    {/* Contact Section */}
                    <div className="p-10 bg-[#2A2321] text-white text-center">
                        <h2 className="text-2xl font-bold font-serif text-white mb-2">
                            Contact Us
                        </h2>
                        <p className="text-gray-400 mb-8 max-w-xl mx-auto">
                            For questions, corrections, or data removal requests, contact our support team.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                            <div className="flex items-center gap-3 text-white bg-white/10 px-6 py-3 rounded-md border border-white/20">
                                <Mail className="w-5 h-5 text-crimson" />
                                <span className="text-sm tracking-wide">support@vidhilikhit.com</span>
                            </div>
                            <div className="flex items-center gap-3 text-white bg-white/10 px-6 py-3 rounded-md border border-white/20">
                                <Phone className="w-5 h-5 text-crimson" />
                                <span className="text-sm tracking-wide">+91-81236 56445</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
