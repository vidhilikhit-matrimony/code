import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getGalleryItems } from '../services/galleryService';
import { ArrowLeft, Image as ImageIcon, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';

const Gallery = () => {
    const navigate = useNavigate();
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const fetchGallery = async (pageNum) => {
        setLoading(true);
        try {
            const data = await getGalleryItems(pageNum, 12); // Limit 12 per page
            if (data.success) {
                setItems(data.data);
                setTotalPages(data.pages);
                setPage(data.page);
            }
        } catch (error) {
            console.error('Failed to fetch gallery items:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchGallery(page);
    }, [page]);

    return (
        <div className="min-h-screen bg-slate-50 pt-24 pb-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                
                {/* Header Section */}
                <div className="mb-10 flex flex-col md:flex-row items-center justify-between gap-4">
                    <div>
                        <button
                            onClick={() => navigate('/')}
                            className="flex items-center gap-2 text-slate-500 hover:text-primary-600 transition-colors mb-4 font-semibold text-sm"
                        >
                            <ArrowLeft className="w-4 h-4" /> Back to Home
                        </button>
                        <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 font-serif tracking-tight flex items-center gap-3">
                            <ImageIcon className="w-10 h-10 text-primary-600" />
                            Our <span className="text-[#9A031E]">Gallery</span>
                        </h1>
                        <p className="mt-3 text-slate-500 max-w-2xl text-lg">
                            Explore beautiful moments, successful matches, and the vibrant life within our community.
                        </p>
                    </div>
                </div>

                {/* Gallery Grid */}
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <Loader2 className="w-10 h-10 text-primary-600 animate-spin mb-4" />
                        <p className="text-slate-500 font-medium animate-pulse">Loading gallery images...</p>
                    </div>
                ) : items.length === 0 ? (
                    <div className="text-center py-24 bg-white rounded-3xl shadow-sm border border-slate-100">
                        <ImageIcon className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-slate-700 mb-2">No Images Yet</h3>
                        <p className="text-slate-500">Check back later for beautiful moments.</p>
                    </div>
                ) : (
                    <>
                        <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-6 space-y-6">
                            {items.map((item, index) => (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.5, delay: index * 0.05 }}
                                    key={item._id}
                                    className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 break-inside-avoid border border-slate-100"
                                >
                                    <div className="relative overflow-hidden">
                                        <img
                                            src={item.imageUrl}
                                            alt={item.description || 'Gallery Image'}
                                            className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-105"
                                            loading="lazy"
                                        />
                                    </div>
                                    
                                    {/* Description Below Image */}
                                    {item.description && (
                                        <div className="p-5 bg-white">
                                            <p className="text-slate-700 font-medium leading-relaxed">
                                                {item.description}
                                            </p>
                                        </div>
                                    )}
                                </motion.div>
                            ))}
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="mt-16 flex items-center justify-center gap-4">
                                <button
                                    onClick={() => setPage(p => Math.max(1, p - 1))}
                                    disabled={page === 1}
                                    className="w-12 h-12 flex items-center justify-center rounded-full bg-white border border-slate-200 text-slate-600 hover:text-primary-600 hover:border-primary-600 disabled:opacity-50 disabled:pointer-events-none transition-all shadow-sm"
                                >
                                    <ChevronLeft className="w-5 h-5" />
                                </button>
                                
                                <span className="font-bold text-slate-700 bg-white px-6 py-3 rounded-full border border-slate-200 shadow-sm">
                                    Page {page} of {totalPages}
                                </span>

                                <button
                                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                    disabled={page === totalPages}
                                    className="w-12 h-12 flex items-center justify-center rounded-full bg-white border border-slate-200 text-slate-600 hover:text-primary-600 hover:border-primary-600 disabled:opacity-50 disabled:pointer-events-none transition-all shadow-sm"
                                >
                                    <ChevronRight className="w-5 h-5" />
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default Gallery;
