import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';

const S3_STATIC = import.meta.env.VITE_STATIC_S3_URL || '';

const STYLES = `
.text-saffron { color: #F05D23; }
.bg-saffron { background-color: #F05D23; }
.text-gold { color: #E3B23C; }
.bg-gold { background-color: #E3B23C; }
.bg-mandala-pattern {
    background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M54.627 0l.83.83-1.66 1.66-.83-.83.83-.83zM0 54.627l.83.83-1.66 1.66-.83-.83.83-.83zm54.627-54.627l-1.66 1.66-.83-.83 1.66-1.66.83.83zm-54.627 54.627l-1.66 1.66-.83-.83 1.66-1.66.83.83zM15.255 0l.83.83-1.66 1.66-.83-.83.83-.83zm0 54.627l.83.83-1.66 1.66-.83-.83.83-.83zm-15.255-39.372l.83.83-1.66 1.66-.83-.83.83-.83zm54.627 0l.83.83-1.66 1.66-.83-.83.83-.83z' fill='%23ea580c' fill-opacity='0.03' fill-rule='evenodd'/%3E%3C/svg%3E");
}
.premium-shadow {
    box-shadow: 0 10px 40px -10px rgba(234, 88, 12, 0.15);
}
`;

const AboutUs = () => {
    const navigate = useNavigate();

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="min-h-screen bg-[#FAF8F5] font-sans text-[#2A2321] selection:bg-primary-600 selection:text-white bg-mandala-pattern">
            <style>{STYLES}</style>

            {/* Header */}
            <div className="fixed top-0 left-0 right-0 z-[90] flex items-center px-4 sm:px-6 py-4 bg-white border-b border-[#E8E2D9] shadow-sm">
                <button onClick={() => navigate('/')} className="flex items-center gap-2 text-[#5A524D] hover:text-primary-600 font-bold text-sm transition-colors">
                    <ChevronLeft className="w-5 h-5" /> Back to Home
                </button>
            </div>

            <section className="py-24 px-4 md:px-8 lg:px-16 max-w-7xl mx-auto mt-12">
                {/* Title */}
                <div className="text-center mb-16 max-w-3xl mx-auto">
                    <span className="text-xs font-bold uppercase tracking-[0.2em] text-primary-600 mb-2 block">Meeting Our Visionary Leader</span>
                    <h1 className="text-4xl sm:text-5xl font-extrabold text-[#2A2321] font-serif mb-6">
                        Mr. Vasudev B. Allagikar
                    </h1>
                    <p className="text-lg text-[#5A524D] leading-relaxed">
                        Founder and guiding force behind Vidhilikhit Matrimony. His vision and values laid the foundation of a trusted platform that unites families with faith and tradition.
                    </p>
                </div>

                {/* Info & Journey */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start bg-white p-8 md:p-12 rounded-xl border border-[#E8E2D9] premium-shadow border-t-4 border-t-primary-600">
                    <div className="w-full relative">
                        <div className="absolute inset-0 bg-primary-600 transform translate-x-4 translate-y-4 rounded-xl -z-10 opacity-20"></div>
                        <img
                            src={S3_STATIC ? `${S3_STATIC}/images/ceo.webp` : '/images/ceo.png'}
                            alt="Mr. Vasudev B. Allagikar"
                            className="rounded-xl w-full h-auto object-cover border border-[#E8E2D9] bg-[#FAF8F5]"
                        />
                    </div>

                    <div className="space-y-8">
                        <div>
                            <h2 className="text-3xl font-bold font-serif text-[#2A2321] mb-6 border-b border-[#E8E2D9] pb-4">The Journey</h2>
                            <div className="space-y-4 text-[#5A524D] leading-relaxed font-medium">
                                <p>
                                    Founded on 12th January 2017 and registered in Kalaburagi, Karnataka, Vidhilikhit Matrimony began as a humble initiative by Mr. Vasudev B. Allagikar, a devoted father with a noble vision — to create a platform where finding a compatible life partner could be simple, secure, and meaningful.
                                </p>
                                <p>
                                    At Vidhilikhit Matrimony, our mission is to simplify the sacred journey of finding a life partner through a trusted, privacy-focused, and user-friendly platform. We understand that marriage is one of life's most important decisions, and we strive to help individuals connect based on values, compatibility, and mutual respect.
                                </p>
                            </div>
                        </div>

                        <div className="bg-[#FAF8F5] p-6 rounded-lg border-l-4 border-primary-600">
                            <p className="text-sm font-bold uppercase tracking-wider text-[#B0A8A3] mb-2">Quote</p>
                            <p className="italic text-[#2A2321] font-serif text-lg leading-relaxed">
                                "Uniting families with faith and tradition, laying the foundation of a trusted platform."
                            </p>
                        </div>
                    </div>
                </div>

                {/* Sons Section */}
                <div className="mt-20">
                    <div className="text-center mb-12 max-w-3xl mx-auto">
                        <h2 className="text-3xl sm:text-4xl font-extrabold text-[#2A2321] font-serif mb-6">Continuing the Legacy</h2>
                        <p className="text-lg text-[#5A524D] leading-relaxed">
                            Today, his two sons proudly continue this legacy, blending tradition, technology, and trust to serve families across India.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                        {/* Son 1: Ankit */}
                        <div className="bg-white p-6 rounded-xl border border-[#E8E2D9] premium-shadow border-t-4 border-t-saffron text-center">
                            <div className="w-32 h-32 mx-auto mb-6 rounded-full overflow-hidden border-4 border-[#FAF8F5]">
                                <img
                                    src={S3_STATIC ? `${S3_STATIC}/images/md.webp` : '/images/md.png'}
                                    alt="Mr. Ankit Allagikar"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <h4 className="font-bold font-serif text-2xl text-[#2A2321] mb-1">Mr. Ankit Allagikar</h4>
                            <p className="text-xs uppercase tracking-widest font-bold text-saffron mb-4">Managing Director</p>
                            <p className="text-[#5A524D] text-sm leading-relaxed">
                                Managing Director who upholds the legacy with dedication and sincerity. He ensures that every family's journey towards finding a life partner is smooth, respectful, and meaningful.
                            </p>
                        </div>

                        {/* Son 2: Ajeet */}
                        <div className="bg-white p-6 rounded-xl border border-[#E8E2D9] premium-shadow border-t-4 border-t-gold text-center">
                            <div className="w-32 h-32 mx-auto mb-6 rounded-full overflow-hidden border-4 border-[#FAF8F5]">
                                <img
                                    src={S3_STATIC ? `${S3_STATIC}/images/td.webp` : '/images/td.png'}
                                    alt="Mr. Ajeet Allagikar"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <h4 className="font-bold font-serif text-2xl text-[#2A2321] mb-1">Mr. Ajeet Allagikar</h4>
                            <p className="text-xs uppercase tracking-widest font-bold text-gold mb-4">Technical Director</p>
                            <p className="text-[#5A524D] text-sm leading-relaxed">
                                Technical Director with a passion for innovation and respect for cultural values. He brings modern technology together with tradition to enhance the matchmaking experience.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Mission Text */}
                <div className="mt-20 bg-[#2A2321] text-white p-12 rounded-xl text-center relative overflow-hidden premium-shadow border-t-4 border-t-primary-600">
                    <div className="absolute inset-0 opacity-10 bg-mandala-pattern invert"></div>
                    <div className="relative z-10 max-w-4xl mx-auto space-y-6 text-gray-300 leading-relaxed font-medium">
                        <p>
                            Every profile on our platform undergoes careful verification to ensure authenticity, transparency, and safety. With a thoughtful balance of modern matchmaking technology and a personalized human approach, we help every member search for their perfect match with confidence and peace of mind.
                        </p>
                        <p>
                            Originally established to serve the Brahmin community, Vidhilikhit Matrimony has now expanded its trusted services to the Lingayat community, recognizing the shared importance of tradition, culture, and family values.
                        </p>
                        <p>
                            While our primary focus remains on fresh marriages, we also extend our services to divorcees, widows, and widowers, offering them a respectful and dignified space to rediscover companionship.
                        </p>
                        <div className="pt-8 border-t border-white/20 mt-8">
                            <h2 className="text-3xl font-extrabold font-serif text-white mb-2">Join VidhiLikhit</h2>
                            <p className="text-gold uppercase tracking-widest text-sm font-bold">A bright ray of hope for every heart seeking a true connection.</p>
                        </div>
                    </div>
                </div>

                {/* Video Message Section */}
                <div className="mt-20">
                    <div className="text-center mb-12 max-w-3xl mx-auto">
                        <span className="text-xs font-bold uppercase tracking-[0.2em] text-primary-600 mb-2 block">Premium Matchmaking</span>
                        <h2 className="text-3xl sm:text-4xl font-extrabold text-[#2A2321] font-serif mb-6">Our Commitment to Families</h2>
                        <p className="text-lg text-[#5A524D] leading-relaxed">
                            Watch our founder share his vision and commitment to bringing families together.
                        </p>
                    </div>

                    <div className="max-w-4xl mx-auto bg-white p-4 rounded-xl border border-[#E8E2D9] premium-shadow">
                        <div className="relative bg-[#2A2321] rounded-lg overflow-hidden aspect-video">
                            <iframe
                                src="https://www.youtube.com/embed/79hnfkNtdTE"
                                title="A Message from Vasudev"
                                className="w-full h-full"
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                allowFullScreen
                            ></iframe>
                        </div>
                    </div>
                </div>

            </section>
        </div>
    );
};

export default AboutUs;
