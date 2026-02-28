import React, { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import { Check, X, ZoomIn, ZoomOut } from 'lucide-react';

// ─── Canvas helper: extract the cropped pixels as a File ─────────
async function getCroppedFile(imageSrc, pixelCrop, fileName) {
    const image = await createImage(imageSrc);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    canvas.width = pixelCrop.width;
    canvas.height = pixelCrop.height;

    ctx.drawImage(
        image,
        pixelCrop.x,
        pixelCrop.y,
        pixelCrop.width,
        pixelCrop.height,
        0,
        0,
        pixelCrop.width,
        pixelCrop.height
    );

    return new Promise((resolve) => {
        canvas.toBlob((blob) => {
            const croppedFile = new File([blob], fileName, { type: 'image/jpeg' });
            resolve({ file: croppedFile, previewUrl: URL.createObjectURL(blob) });
        }, 'image/jpeg', 0.92);
    });
}

function createImage(url) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.addEventListener('load', () => resolve(img));
        img.addEventListener('error', reject);
        img.setAttribute('crossOrigin', 'anonymous');
        img.src = url;
    });
}

// ─── Modal Component ─────────────────────────────────────────────
const ImageCropModal = ({ imageSrc, fileName, onConfirm, onCancel }) => {
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);

    const onCropComplete = useCallback((_, pixels) => {
        setCroppedAreaPixels(pixels);
    }, []);

    const handleConfirm = async () => {
        if (!croppedAreaPixels) return;
        setIsProcessing(true);
        try {
            const result = await getCroppedFile(imageSrc, croppedAreaPixels, fileName);
            onConfirm(result.file, result.previewUrl);
        } catch (err) {
            console.error('Crop failed:', err);
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        // Backdrop
        <div className="fixed inset-0 z-50 flex flex-col bg-black/90 backdrop-blur-sm">

            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-slate-900/80 border-b border-slate-700">
                <h3 className="text-white font-semibold text-sm tracking-wide">Crop Image</h3>

                <button
                    onClick={onCancel}
                    className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>
            </div>

            {/* Cropper Area */}
            <div className="relative flex-1">
                <Cropper
                    image={imageSrc}
                    crop={crop}
                    zoom={zoom}
                    aspect={1}
                    onCropChange={setCrop}
                    onZoomChange={setZoom}
                    onCropComplete={onCropComplete}
                    style={{
                        containerStyle: { background: '#0f172a' },
                        cropAreaStyle: {
                            border: '2px solid rgba(139,92,246,0.8)',
                            boxShadow: '0 0 0 5000px rgba(0,0,0,0.65)'
                        }
                    }}
                />
            </div>

            {/* Zoom Slider + Action Buttons */}
            <div className="px-5 py-4 bg-slate-900/80 border-t border-slate-700 flex flex-col gap-3">
                {/* Zoom control */}
                <div className="flex items-center gap-3">
                    <ZoomOut className="w-4 h-4 text-slate-400 flex-shrink-0" />
                    <input
                        type="range"
                        min={1}
                        max={3}
                        step={0.01}
                        value={zoom}
                        onChange={(e) => setZoom(Number(e.target.value))}
                        className="w-full accent-primary-500 cursor-pointer"
                    />
                    <ZoomIn className="w-4 h-4 text-slate-400 flex-shrink-0" />
                </div>

                {/* Buttons */}
                <div className="flex gap-3 justify-end">
                    <button
                        onClick={onCancel}
                        className="btn btn-outline text-sm flex items-center gap-2"
                    >
                        <X className="w-4 h-4" />
                        Cancel
                    </button>
                    <button
                        onClick={handleConfirm}
                        disabled={isProcessing}
                        className="btn btn-primary text-sm flex items-center gap-2 disabled:opacity-60"
                    >
                        {isProcessing ? (
                            <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                        ) : (
                            <Check className="w-4 h-4" />
                        )}
                        Crop & Use
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ImageCropModal;
