import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Image as ImageIcon, Loader2, UploadCloud, X } from 'lucide-react';
import { toast } from 'sonner';
import { getGalleryItems, uploadGalleryItem, deleteGalleryItem } from '../../services/galleryService';
import ImageCropModal from '../ImageCropModal';

const AdminGalleryManagement = () => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [description, setDescription] = useState('');
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const fileInputRef = useRef(null);

    const [cropModalOpen, setCropModalOpen] = useState(false);
    const [rawImageSrc, setRawImageSrc] = useState(null);

    const fetchItems = async (pageNum = 1) => {
        setLoading(true);
        try {
            const data = await getGalleryItems(pageNum, 10);
            if (data.success) {
                setItems(data.data);
                setTotalPages(data.pages);
                setPage(data.page);
            }
        } catch (error) {
            toast.error(error.message || 'Failed to fetch gallery items');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchItems(page);
    }, [page]);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                toast.error('File exceeds 5MB limit. Please upload a smaller image.');
                return;
            }
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => {
                setRawImageSrc(reader.result);
                setCropModalOpen(true);
            };
        }
    };

    const handleCropConfirm = (file, preview) => {
        setSelectedFile(file);
        setPreviewUrl(preview);
        setCropModalOpen(false);
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!selectedFile) {
            toast.error('Please select an image to upload');
            return;
        }

        setUploading(true);
        const formData = new FormData();
        formData.append('image', selectedFile);
        formData.append('description', description);

        try {
            const res = await uploadGalleryItem(formData);
            if (res.success) {
                toast.success('Image uploaded successfully');
                setIsUploadModalOpen(false);
                setDescription('');
                setSelectedFile(null);
                setPreviewUrl(null);
                fetchItems(1); // Refresh the first page
            }
        } catch (error) {
            toast.error(error.message || 'Upload failed');
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this image?')) return;
        
        try {
            const res = await deleteGalleryItem(id);
            if (res.success) {
                toast.success('Image deleted successfully');
                fetchItems(page);
            }
        } catch (error) {
            toast.error(error.message || 'Failed to delete image');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-amber-50 rounded-xl">
                        <ImageIcon className="w-6 h-6 text-amber-600" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-slate-800">Gallery Management</h2>
                        <p className="text-sm text-slate-500">Upload and manage images for the public gallery page</p>
                    </div>
                </div>
                <button
                    onClick={() => setIsUploadModalOpen(true)}
                    className="flex items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl shadow-md transition-colors w-full sm:w-auto justify-center"
                >
                    <Plus className="w-4 h-4" /> Add New Image
                </button>
            </div>

            {/* Gallery Grid */}
            {loading ? (
                <div className="flex justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
                </div>
            ) : items.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-2xl border border-slate-100 border-dashed">
                    <ImageIcon className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <h3 className="text-lg font-bold text-slate-700">No Gallery Items Found</h3>
                    <p className="text-slate-500">Upload some images to display them in the gallery.</p>
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                    {items.map((item) => (
                        <div key={item._id} className="relative group bg-white p-2 rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                            <div className="aspect-square rounded-lg overflow-hidden relative">
                                <img src={item.imageUrl} alt={item.description} className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <button
                                        onClick={() => handleDelete(item._id)}
                                        className="p-3 bg-rose-500 hover:bg-rose-600 text-white rounded-full transition-transform transform hover:scale-110 shadow-lg"
                                        title="Delete Image"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                            {item.description && (
                                <p className="mt-2 text-xs text-slate-600 truncate px-1" title={item.description}>
                                    {item.description}
                                </p>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between bg-white px-4 py-3 rounded-2xl border border-slate-100 shadow-sm mt-6">
                    <button
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50 transition-colors"
                    >
                        Previous
                    </button>
                    <span className="text-sm text-slate-700 font-medium">
                        Page {page} of {totalPages}
                    </span>
                    <button
                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages}
                        className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50 transition-colors"
                    >
                        Next
                    </button>
                </div>
            )}

            {/* Upload Modal */}
            <AnimatePresence>
                {isUploadModalOpen && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4"
                        onClick={() => !uploading && setIsUploadModalOpen(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-xl relative"
                            onClick={e => e.stopPropagation()}
                        >
                            <button
                                onClick={() => setIsUploadModalOpen(false)}
                                disabled={uploading}
                                className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors disabled:opacity-50"
                            >
                                <X className="w-5 h-5" />
                            </button>

                            <h3 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                                <UploadCloud className="w-6 h-6 text-amber-500" /> Upload Image
                            </h3>

                            <form onSubmit={handleUpload} className="space-y-5">
                                {/* Image Upload Area */}
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Select Image</label>
                                    <input
                                        type="file"
                                        accept="image/jpeg,image/png,image/jpg"
                                        className="hidden"
                                        ref={fileInputRef}
                                        onChange={handleFileChange}
                                    />
                                    
                                    {!previewUrl ? (
                                        <div
                                            onClick={() => fileInputRef.current?.click()}
                                            className="w-full h-48 border-2 border-dashed border-slate-300 rounded-xl flex flex-col items-center justify-center text-slate-500 hover:bg-slate-50 hover:border-amber-400 cursor-pointer transition-colors"
                                        >
                                            <ImageIcon className="w-10 h-10 mb-2 text-slate-400" />
                                            <p className="font-medium">Click to browse (Max 5MB)</p>
                                            <p className="text-xs text-slate-400 mt-1">JPG, JPEG, PNG</p>
                                        </div>
                                    ) : (
                                        <div className="relative w-full h-48 rounded-xl overflow-hidden border border-slate-200">
                                            <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                                                <button
                                                    type="button"
                                                    onClick={() => { setSelectedFile(null); setPreviewUrl(null); }}
                                                    className="px-4 py-2 bg-white text-rose-600 font-bold rounded-lg shadow-sm"
                                                >
                                                    Remove Image
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Description */}
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Description (Optional)</label>
                                    <textarea
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all resize-none h-24"
                                        placeholder="Add a short caption for this image..."
                                    ></textarea>
                                </div>

                                <button
                                    type="submit"
                                    disabled={!selectedFile || uploading}
                                    className="w-full py-3.5 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl shadow-md transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {uploading ? (
                                        <><Loader2 className="w-5 h-5 animate-spin" /> Uploading...</>
                                    ) : (
                                        <><UploadCloud className="w-5 h-5" /> Upload Now</>
                                    )}
                                </button>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {cropModalOpen && rawImageSrc && (
                <ImageCropModal
                    imageSrc={rawImageSrc}
                    fileName="gallery-image.jpg"
                    aspectRatio={3/4}
                    allowRatioSelection={true}
                    onConfirm={handleCropConfirm}
                    onCancel={() => {
                        setCropModalOpen(false);
                        setRawImageSrc(null);
                        if (fileInputRef.current) fileInputRef.current.value = '';
                    }}
                />
            )}
        </div>
    );
};

export default AdminGalleryManagement;
