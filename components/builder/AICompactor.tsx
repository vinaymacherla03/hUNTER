
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import SparkleIcon from '../icons/SparkleIcon';

interface AICompactorProps {
    onCompact: () => Promise<void>;
}

const AICompactor: React.FC<AICompactorProps> = ({ onCompact }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleCompactClick = async () => {
        setIsLoading(true);
        setError(null);
        try {
            await onCompact();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unexpected error occurred.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-gradient-to-br from-indigo-50 to-violet-50 rounded-xl border border-indigo-100 p-4">
            <div className="flex items-start gap-3 mb-3">
                <div className="p-2 bg-white rounded-lg shadow-sm text-indigo-600">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                </div>
                <div>
                    <h4 className="text-sm font-bold text-indigo-900">One-Page Optimizer</h4>
                    <p className="text-xs text-indigo-700/80 leading-snug mt-0.5">
                        Automatically condense your resume to fit perfectly on a single page without losing impact.
                    </p>
                </div>
            </div>
            
            <motion.button
                type="button"
                onClick={handleCompactClick}
                disabled={isLoading}
                whileTap={{ scale: 0.98 }}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
            >
                {isLoading ? (
                    <>
                        <svg className="animate-spin h-3.5 w-3.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg>
                        <span>Optimizing Content...</span>
                    </>
                ) : (
                    <>
                       <SparkleIcon className="h-3.5 w-3.5" />
                       <span>Compact Resume</span>
                    </>
                )}
            </motion.button>
            {error && <p className="text-[10px] text-red-500 text-center mt-2 font-medium">{error}</p>}
        </div>
    );
};

export default AICompactor;
