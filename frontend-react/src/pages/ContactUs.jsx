import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, MapPin, Mail, Phone, Clock } from 'lucide-react';

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

export default function ContactUs() {
    const navigate = useNavigate();
    useEffect(() => { window.scrollTo(0, 0); }, []);

    const [formData, setFormData] = useState({ name: '', email: '', phone: '', message: '' });
    const [status, setStatus] = useState('');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Simulate form submission
        setStatus('Sending...');
        setTimeout(() => {
            setStatus('Message sent successfully! We will get back to you soon.');
            setFormData({ name: '', email: '', phone: '', message: '' });
            setTimeout(() => setStatus(''), 5000);
        }, 1000);
    };

    return (
        <div className="min-h-screen bg-[#FAF8F5] font-sans text-[#2A2321] selection:bg-crimson selection:text-white bg-mandala-pattern">
            <style>{STYLES}</style>

            {/* Header */}
            <div className="fixed top-0 left-0 right-0 z-[90] flex items-center px-4 sm:px-6 py-4 bg-white border-b border-[#E8E2D9] shadow-sm">
                <button onClick={() => navigate('/')} className="flex items-center gap-2 text-[#5A524D] hover:text-crimson font-bold text-sm transition-colors">
                    <ChevronLeft className="w-5 h-5" /> Back to Home
                </button>
            </div>

            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-24 mt-12">
                <div className="text-center mb-16 max-w-3xl mx-auto">
                    <span className="text-xs font-bold uppercase tracking-[0.2em] text-crimson mb-2 block">Get in Touch</span>
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
                                        <MapPin className="w-5 h-5 text-crimson" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-[#2A2321] mb-1">Address</p>
                                        <p className="text-sm leading-relaxed">NGO'S Colony, Kalaburagi,<br />Karnataka</p>
                                    </div>
                                </li>
                                <li className="flex gap-4">
                                    <div className="w-10 h-10 rounded-full bg-[#FAF8F5] flex items-center justify-center border border-[#E8E2D9] flex-shrink-0">
                                        <Phone className="w-5 h-5 text-crimson" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-[#2A2321] mb-1">Phone</p>
                                        <p className="text-sm leading-relaxed">+91 8123656445</p>
                                    </div>
                                </li>
                                <li className="flex gap-4">
                                    <div className="w-10 h-10 rounded-full bg-[#FAF8F5] flex items-center justify-center border border-[#E8E2D9] flex-shrink-0">
                                        <Mail className="w-5 h-5 text-crimson" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-[#2A2321] mb-1">Email</p>
                                        <p className="text-sm leading-relaxed">support@vidhilikhit.com</p>
                                    </div>
                                </li>
                                <li className="flex gap-4">
                                    <div className="w-10 h-10 rounded-full bg-[#FAF8F5] flex items-center justify-center border border-[#E8E2D9] flex-shrink-0">
                                        <Clock className="w-5 h-5 text-crimson" />
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
                        <div className="flex flex-col md:flex-row h-full">
                            {/* Contact Form Section */}
                            <div className="w-full md:w-1/2 p-8 lg:p-10">
                                <h2 className="text-2xl font-bold font-serif text-[#2A2321] mb-6 border-b border-[#E8E2D9] pb-4">Send us a message</h2>

                                {status && (
                                    <div className={`p-4 mb-6 rounded-md text-sm font-semibold border ${status.includes('success') ? 'bg-green-50 text-green-800 border-green-200' : 'bg-[#FAF8F5] text-[#5A524D] border-[#E8E2D9]'}`}>
                                        {status}
                                    </div>
                                )}

                                <form onSubmit={handleSubmit} className="space-y-5 text-[#5A524D]">
                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-wider mb-2">Full Name</label>
                                        <input
                                            type="text"
                                            name="name"
                                            required
                                            value={formData.name}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 bg-[#FAF8F5] rounded-md border border-[#E8E2D9] focus:outline-none focus:border-crimson focus:ring-1 focus:ring-crimson transition-colors"
                                            placeholder="Your Name"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-wider mb-2">Email Address</label>
                                        <input
                                            type="email"
                                            name="email"
                                            required
                                            value={formData.email}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 bg-[#FAF8F5] rounded-md border border-[#E8E2D9] focus:outline-none focus:border-crimson focus:ring-1 focus:ring-crimson transition-colors"
                                            placeholder="you@example.com"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-wider mb-2">Phone Number</label>
                                        <input
                                            type="tel"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 bg-[#FAF8F5] rounded-md border border-[#E8E2D9] focus:outline-none focus:border-crimson focus:ring-1 focus:ring-crimson transition-colors"
                                            placeholder="Your Phone Number"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-wider mb-2">Message</label>
                                        <textarea
                                            name="message"
                                            required
                                            rows="4"
                                            value={formData.message}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 bg-[#FAF8F5] rounded-md border border-[#E8E2D9] focus:outline-none focus:border-crimson focus:ring-1 focus:ring-crimson transition-colors resize-none"
                                            placeholder="How can we help you?"
                                        ></textarea>
                                    </div>
                                    <button
                                        type="submit"
                                        className="w-full py-4 bg-crimson text-white font-bold rounded-md hover:bg-[#7A0217] transition-colors shadow-md uppercase tracking-wider text-sm mt-2"
                                    >
                                        Send Message
                                    </button>
                                </form>
                            </div>

                            {/* Map Section */}
                            <div className="w-full md:w-1/2 bg-[#FAF8F5] border-l border-[#E8E2D9] min-h-[300px]">
                                <iframe
                                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15243.619074477811!2d76.82087545!3d17.343015!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bc63df6f50b45b9%3A0xeebd12dfcdbdf612!2sKalaburagi%2C%20Karnataka!5e0!3m2!1sen!2sin!4v1709289234856!5m2!1sen!2sin"
                                    width="100%"
                                    height="100%"
                                    style={{ border: 0 }}
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
