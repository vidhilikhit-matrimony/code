import React from 'react';
import { RefreshCw } from 'lucide-react';

const RefreshPageButton = () => {
    const handleRefresh = () => {
        window.location.reload();
    };

    return (
        <button
            onClick={handleRefresh}
            className="p-2 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-full border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all hover:scale-105 active:scale-95 flex items-center justify-center group shadow-sm"
            aria-label="Refresh Page"
            title="Refresh Page"
        >
            <RefreshCw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" />
        </button>
    );
};

export default RefreshPageButton;
