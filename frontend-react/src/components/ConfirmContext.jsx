import React, { createContext, useContext, useState, useCallback } from 'react';
import { AlertCircle, X, Check, Info } from 'lucide-react';

const ConfirmContext = createContext(null);

export const useConfirm = () => {
    const context = useContext(ConfirmContext);
    if (!context) {
        throw new Error('useConfirm must be used within a ConfirmProvider');
    }
    return context;
};

export const ConfirmProvider = ({ children }) => {
    const [confirmState, setConfirmState] = useState({
        isOpen: false,
        message: '',
        onConfirm: null,
        onCancel: null,
        resolve: null,
        type: 'warning' // 'warning', 'danger', 'info'
    });

    const confirm = useCallback((options) => {
        return new Promise((resolve) => {
            let message = '';
            let type = 'warning';

            if (typeof options === 'string') {
                message = options;
            } else {
                message = options.message || '';
                type = options.type || 'warning';
            }

            setConfirmState({
                isOpen: true,
                message,
                type,
                resolve
            });
        });
    }, []);

    const handleConfirm = () => {
        if (confirmState.resolve) {
            confirmState.resolve(true);
        }
        closeModal();
    };

    const handleCancel = () => {
        if (confirmState.resolve) {
            confirmState.resolve(false);
        }
        closeModal();
    };

    const closeModal = () => {
        setConfirmState((prev) => ({ ...prev, isOpen: false }));
    };

    return (
        <ConfirmContext.Provider value={confirm}>
            {children}
            {confirmState.isOpen && (
                <div className="fixed inset-0 z-[200] bg-black/50 flex flex-col items-center justify-start sm:justify-center pt-10 sm:pt-0 animate-in fade-in duration-200 p-4" onClick={handleCancel}>
                    <div
                        className="bg-white dark:bg-slate-800 rounded-2xl p-5 sm:p-6 w-full max-w-md shadow-xl border border-slate-200 dark:border-slate-700 flex flex-col gap-4 sm:gap-6 relative"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Close button for top right */}
                        <button onClick={handleCancel} className="absolute top-4 right-4 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
                            <X className="w-5 h-5" />
                        </button>

                        <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-4 mt-2 sm:mt-0">
                            {/* Icon based on type */}
                            <div className={`w-12 h-12 shrink-0 rounded-full flex items-center justify-center
                                ${confirmState.type === 'danger' ? 'bg-rose-50 dark:bg-rose-500/10' :
                                    confirmState.type === 'warning' ? 'bg-amber-50 dark:bg-amber-500/10' :
                                        'bg-blue-50 dark:bg-blue-500/10'}`}
                            >
                                {confirmState.type === 'danger' && <AlertCircle className="w-6 h-6 text-rose-500" />}
                                {confirmState.type === 'warning' && <AlertCircle className="w-6 h-6 text-amber-500" />}
                                {confirmState.type === 'info' && <Info className="w-6 h-6 text-blue-500" />}
                            </div>

                            <div className="flex-1 min-w-0 pr-4">
                                <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                                    {confirmState.type === 'danger' ? 'Wait, are you sure?' :
                                        confirmState.type === 'warning' ? 'Please Confirm' : 'Information'}
                                </h2>
                                <p className="text-sm text-slate-600 dark:text-slate-300">
                                    {confirmState.message}
                                </p>
                            </div>
                        </div>

                        <div className="flex flex-col-reverse sm:flex-row gap-3 mt-4 sm:mt-0 pt-4 sm:pt-0 border-t border-slate-100 sm:border-0 dark:border-slate-700/50 justify-end">
                            <button
                                onClick={handleCancel}
                                className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-sm font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleConfirm}
                                className={`w-full sm:w-auto px-5 py-2.5 flex justify-center items-center gap-2 rounded-xl text-sm font-bold text-white transition-colors shadow-md
                                    ${confirmState.type === 'danger' ? 'bg-rose-500 hover:bg-rose-600 shadow-rose-500/20' :
                                        confirmState.type === 'warning' ? 'bg-primary-600 hover:bg-primary-700 shadow-primary-500/20' :
                                            'bg-blue-500 hover:bg-blue-600 shadow-blue-500/20'}`}
                            >
                                <Check className="w-4 h-4" />
                                Confirm
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </ConfirmContext.Provider>
    );
};
