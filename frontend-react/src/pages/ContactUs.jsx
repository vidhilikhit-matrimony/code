import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, MapPin, Mail, Phone, Clock } from 'lucide-react';

const STYLES = `
.bg-mandala-pattern {
    background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M54.627 0l.83.83-1.66 1.66-.83-.83.83-.83zM0 54.627l.83.83-1.66 1.66-.83-.83.83-.83zm54.627-54.627l-1.66 1.66-.83-.83 1.66-1.66.83.83zm-54.627 54.627l-1.66 1.66-.83-.83 1.66-1.66.83.83zM15.255 0l.83.83-1.66 1.66-.83-.83.83-.83zm0 54.627l.83.83-1.66 1.66-.83-.83.83-.83zm-15.255-39.372l.83.83-1.66 1.66-.83-.83.83-.83zm54.627 0l.83.83-1.66 1.66-.83-.83.83-.83z' fill='%23ea580c' fill-opacity='0.03' fill-rule='evenodd'/%3E%3C/svg%3E");
}
.premium-shadow {
    box-shadow: 0 10px 40px -10px rgba(234, 88, 12, 0.15);
}
`;

export default function ContactUs() {
    const navigate = useNavigate();
    useEffect(() => { window.scrollTo(0, 0); }, []);

    return (
        <div className="min-h-screen bg-[#FAF8F5] font-sans text-[#2A2321] selection:bg-primary-600 selection:text-white bg-mandala-pattern">
            <style>{STYLES}</style>

            {/* Header */}
            <div className="fixed top-0 left-0 right-0 z-[90] flex items-center px-4 sm:px-6 py-4 bg-white border-b border-[#E8E2D9] shadow-sm">
                <button onClick={() => navigate('/')} className="flex items-center gap-2 text-[#5A524D] hover:text-primary-600 font-bold text-sm transition-colors">
                    <ChevronLeft className="w-5 h-5" /> Back to Home
                </button>
            </div>

            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-24 mt-12">
                <div className="text-center mb-16 max-w-3xl mx-auto">
                    <span className="text-xs font-bold uppercase tracking-[0.2em] text-primary-600 mb-2 block">Get in Touch</span>
                    <h1 className="text-4xl sm:text-5xl font-extrabold text-[#2A2321] font-serif mb-6">Contact Us</h1>
                    <p className="text-lg text-[#5A524D] leading-relaxed">
                        Have a question or need assistance? We are here to help you find your perfect life partner.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
                    {/* Contact Details Panel */}
                    <div className="lg:col-span-4 space-y-6">
                        <div className="bg-white rounded-xl border border-[#E8E2D9] premium-shadow p-8 border-t-4 border-t-saffron">
                            <h3 className="font-bold text-[#2A2321] font-serif text-2xl mb-8">Head Office</h3>

                            <ul className="space-y-6 text-[#5A524D]">
                                <li className="flex gap-4">
                                    <div className="w-10 h-10 rounded-full bg-[#FAF8F5] flex items-center justify-center border border-[#E8E2D9] flex-shrink-0">
                                        <MapPin className="w-5 h-5 text-primary-600" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-[#2A2321] mb-1">Address</p>
                                        <p className="text-sm leading-relaxed">NGO'S Colony, Kalaburagi,<br />Karnataka</p>
                                    </div>
                                </li>
                                <li className="flex gap-4">
                                    <div className="w-10 h-10 rounded-full bg-[#FAF8F5] flex items-center justify-center border border-[#E8E2D9] flex-shrink-0">
                                        <Phone className="w-5 h-5 text-primary-600" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-[#2A2321] mb-1">Phone</p>
                                        <p className="text-sm leading-relaxed">+91 8123656445</p>
                                    </div>
                                </li>
                                <li className="flex gap-4">
                                    <div className="w-10 h-10 rounded-full bg-[#FAF8F5] flex items-center justify-center border border-[#E8E2D9] flex-shrink-0">
                                        <Mail className="w-5 h-5 text-primary-600" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-[#2A2321] mb-1">Email</p>
                                        <p className="text-sm leading-relaxed">support@vidhilikhit.com</p>
                                    </div>
                                </li>
                                <li className="flex gap-4">
                                    <div className="w-10 h-10 rounded-full bg-[#FAF8F5] flex items-center justify-center border border-[#E8E2D9] flex-shrink-0">
                                        <Clock className="w-5 h-5 text-primary-600" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-[#2A2321] mb-1">Working Hours</p>
                                        <p className="text-sm leading-relaxed">Mon - Sat: 10:00 AM - 6:00 PM</p>
                                    </div>
                                </li>
                            </ul>
                        </div>
                    </div>

                    <div className="lg:col-span-8 bg-white rounded-xl overflow-hidden border border-[#E8E2D9] premium-shadow border-t-4 border-t-crimson">
                        <div className="flex flex-col h-full w-full">
                            {/* Map Section */}
                            <div className="w-full bg-[#FAF8F5] min-h-[400px]">
                                <iframe
                                    src="https://maps.google.com/maps?width=100%25&amp;height=600&amp;hl=en&amp;q=NGO'S%20Colony,%20Kalaburagi,%20Karnataka+(VidhiLikhit)&amp;t=&amp;z=15&amp;ie=UTF8&amp;iwloc=B&amp;output=embed"
                                    width="100%"
                                    height="100%"
                                    style={{ border: 0, minHeight: '400px' }}
                                    allowFullScreen=""
                                    loading="lazy"
                                    referrerPolicy="no-referrer-when-downgrade"
                                    title="VidhiLikhit Office Location"
                                ></iframe>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
