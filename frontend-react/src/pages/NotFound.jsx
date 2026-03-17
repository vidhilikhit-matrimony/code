import React from 'react';
import { Link } from 'react-router-dom';
import { Home as HomeIcon, ArrowLeft } from 'lucide-react';

const NotFound = () => {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-secondary-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 p-4">
            <div className="text-center">
                <h1 className="text-9xl font-bold text-gradient mb-4">404</h1>
                <h2 className="text-3xl font-bold mb-4">Page Not Found</h2>
                <p className="text-slate-600 dark:text-slate-400 mb-8">
                    The page you're looking for doesn't exist or has been moved.
                </p>

                <div className="flex gap-4 justify-center">
                    <Link to="/" className="btn btn-primary">
                        <HomeIcon className="w-5 h-5 inline mr-2" />
                        Go Home
                    </Link>
                    <button onClick={() => window.history.back()} className="btn btn-outline">
                        <ArrowLeft className="w-5 h-5 inline mr-2" />
                        Go Back
                    </button>
                </div>
            </div>
        </div>
    );
};

export default NotFound;
