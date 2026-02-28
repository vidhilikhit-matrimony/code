import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useSelector } from 'react-redux';
import { QrCode, Upload, Check, Loader2, ArrowLeft, Shield, AlertCircle } from 'lucide-react';
import api from '../services/api';
import qrCodeImg from '../assets/payment-qr.jpeg';
import RefreshPageButton from '../components/common/RefreshPageButton';

const PLANS = [
    { id: 'basic', name: 'Basic Plan', amount: 1000, views: 30, color: 'bg-blue-500' },
    { id: 'standard', name: 'Standard Plan', amount: 1500, views: 50, color: 'bg-purple-500', popular: true },
    { id: 'premium', name: 'Premium Plan', amount: 3000, views: 120, color: 'bg-amber-500' }
];

const Payment = () => {
    const navigate = useNavigate();
    const { user } = useSelector((state) => state.auth);
    const [selectedPlan, setSelectedPlan] = useState(PLANS[1].id); // Default to Standard
    const [transactionId, setTransactionId] = useState('');
    const [screenshot, setScreenshot] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [step, setStep] = useState(1); // 1: Select Plan, 2: Payment & Upload

    const handleScreenshotChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                toast.error('File size must be less than 5MB');
                return;
            }
            setScreenshot(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!transactionId || !screenshot) {
            toast.error('Please provide transaction ID and screenshot');
            return;
        }

        setIsSubmitting(true);

        try {
            const formData = new FormData();
            formData.append('planId', selectedPlan);
            formData.append('transactionId', transactionId);
            formData.append('screenshot', screenshot);

            const response = await api.post('/subscriptions/payment', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            if (response.success) {
                toast.success('Payment submitted successfully! Admin will verify shortly.');
                navigate('/profiles');
            } else {
                toast.error(response.message || 'Submission failed');
            }
        } catch (error) {
            console.error('Payment error:', error);
            toast.error(error.response?.data?.message || 'Failed to submit payment');
        } finally {
            setIsSubmitting(false);
        }
    };

    const currentPlan = PLANS.find(p => p.id === selectedPlan);

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-8 px-4">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-8 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => step === 1 ? navigate(-1) : setStep(1)}
                            className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
                        >
                            <ArrowLeft className="w-6 h-6 text-slate-600 dark:text-slate-400" />
                        </button>
                        <div>
                            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                                Unlock Profiles
                            </h1>
                            <p className="text-slate-500">Choose a plan to view full profile details</p>
                        </div>
                    </div>
                    <div>
                        <RefreshPageButton />
                    </div>
                </div>

                {!user?.hasProfile && (
                    <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 flex gap-3 text-red-800 dark:text-red-200">
                        <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                        <div>
                            <h3 className="font-bold">Profile Required</h3>
                            <p className="text-sm mt-1">Please create your profile before buying or renewing a subscription.</p>
                            <p className="text-sm mt-1 font-semibold">Note: Until a profile is created, you cannot proceed to buy or renew a subscription.</p>
                            <button
                                onClick={() => navigate('/create-profile')}
                                className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm"
                            >
                                Create Profile Now
                            </button>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Left Column: Plan Selection */}
                    <div className="space-y-4">
                        <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-4">
                            Select a Plan
                        </h2>
                        {PLANS.map((plan) => (
                            <div
                                key={plan.id}
                                onClick={() => setSelectedPlan(plan.id)}
                                className={`
                                    relative cursor-pointer rounded-xl p-6 border-2 transition-all duration-300
                                    ${selectedPlan === plan.id
                                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/10 shadow-md'
                                        : 'border-slate-200 dark:border-slate-700 hover:border-primary-300 dark:hover:border-slate-600 bg-white dark:bg-slate-800'}
                                `}
                            >
                                {plan.popular && (
                                    <span className="absolute -top-3 right-4 bg-gradient-to-r from-pink-500 to-rose-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                                        MOST POPULAR
                                    </span>
                                )}

                                <div className="flex justify-between items-center">
                                    <div>
                                        <h3 className="font-bold text-lg text-slate-900 dark:text-white">{plan.name}</h3>
                                        <p className="text-slate-500 text-sm mt-1">Unlock <strong className="text-primary-600">{plan.views} Profiles</strong></p>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-2xl font-bold text-slate-900 dark:text-white">₹{plan.amount}</div>
                                        {selectedPlan === plan.id && (
                                            <div className="flex justify-end mt-2">
                                                <div className="bg-primary-500 text-white rounded-full p-1">
                                                    <Check className="w-4 h-4" />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}

                        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl flex gap-3 mt-6">
                            <Shield className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                            <p className="text-sm text-blue-800 dark:text-blue-200">
                                <strong>Secure Payment:</strong> Verification usually takes less than 30 minutes during business hours.
                            </p>
                        </div>
                    </div>

                    {/* Right Column: Payment & Upload */}
                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 p-6 lg:p-8">
                        {step === 1 ? (
                            <div className="text-center py-10">
                                <QrCode className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Ready to Pay?</h3>
                                <p className="text-slate-500 mb-8 max-w-xs mx-auto">
                                    Selected: <strong>{currentPlan.name}</strong> (₹{currentPlan.amount})
                                </p>
                                <button
                                    onClick={() => setStep(2)}
                                    disabled={!user?.hasProfile}
                                    className={`btn w-full py-3 text-lg ${user?.hasProfile ? 'btn-primary' : 'bg-slate-300 text-slate-500 cursor-not-allowed dark:bg-slate-700 dark:text-slate-400'}`}
                                >
                                    Proceed to Payment
                                </button>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="text-center mb-6">
                                    <p className="text-sm text-slate-500 uppercase tracking-widest font-semibold mb-4">Scan QR & Pay</p>

                                    <div className="bg-white p-2 rounded-xl border-2 border-dashed border-slate-300 inline-block mb-4">
                                        <img src={qrCodeImg} alt="UPI QR Code" className="w-56 h-auto" />
                                    </div>

                                    <p className="text-lg font-bold text-slate-900 dark:text-white">
                                        Pay ₹{currentPlan.amount}
                                    </p>
                                    <p className="text-xs text-slate-500 mt-1 font-mono">UPI ID: allagikar007-1@oksbi</p>
                                </div>

                                <div className="space-y-4 pt-6 border-t border-slate-200 dark:border-slate-700">
                                    <div>
                                        <label className="label">Transaction ID / UTR</label>
                                        <input
                                            type="text"
                                            value={transactionId}
                                            onChange={(e) => setTransactionId(e.target.value)}
                                            placeholder="e.g. 123456789012"
                                            className="input"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="label">Upload Screenshot</label>
                                        <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-slate-300 dark:border-slate-600 border-dashed rounded-xl hover:border-primary-500 transition-colors cursor-pointer relative overflow-hidden group">
                                            {previewUrl ? (
                                                <div className="relative w-full h-48">
                                                    <img src={previewUrl} alt="Preview" className="w-full h-full object-contain" />
                                                    <button
                                                        type="button"
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            setScreenshot(null);
                                                            setPreviewUrl(null);
                                                        }}
                                                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 shadow-lg hover:bg-red-600"
                                                    >
                                                        <ArrowLeft className="w-4 h-4 rotate-45" />
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="space-y-1 text-center">
                                                    <Upload className="mx-auto h-12 w-12 text-slate-400 group-hover:text-primary-500 transition-colors" />
                                                    <div className="flex text-sm text-slate-600 dark:text-slate-400">
                                                        <label className="relative cursor-pointer rounded-md font-medium text-primary-600 hover:text-primary-500 focus-within:outline-none">
                                                            <span>Upload a file</span>
                                                            <input
                                                                type="file"
                                                                className="sr-only"
                                                                accept="image/*"
                                                                onChange={handleScreenshotChange}
                                                                required
                                                            />
                                                        </label>
                                                        <p className="pl-1">or drag and drop</p>
                                                    </div>
                                                    <p className="text-xs text-slate-500">PNG, JPG up to 5MB</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="btn btn-primary w-full py-3"
                                >
                                    {isSubmitting ? (
                                        <><Loader2 className="w-5 h-5 animate-spin mr-2" /> Submitting...</>
                                    ) : (
                                        'Submit for Verification'
                                    )}
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Payment;
