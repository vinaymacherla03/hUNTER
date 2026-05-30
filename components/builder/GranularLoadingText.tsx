import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface GranularLoadingTextProps {
    messages: string[];
    intervalMs?: number;
    className?: string;
}

const GranularLoadingText: React.FC<GranularLoadingTextProps> = ({ 
    messages, 
    intervalMs = 2000,
    className = "text-[10px] font-medium text-slate-500"
}) => {
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        if (messages.length <= 1) return;
        
        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % messages.length);
        }, intervalMs);

        return () => clearInterval(interval);
    }, [messages, intervalMs]);

    return (
        <div className="relative overflow-hidden flex items-center justify-start h-4 min-w-[100px]">
            <AnimatePresence mode="popLayout">
                <motion.span
                    key={messages[currentIndex]}
                    initial={{ opacity: 0, y: 15, filter: 'blur(4px)' }}
                    animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                    exit={{ opacity: 0, y: -15, filter: 'blur(4px)' }}
                    transition={{ duration: 0.5, ease: [0.32, 0.72, 0, 1] }}
                    className={`absolute whitespace-nowrap ${className}`}
                >
                    {messages[currentIndex]}
                </motion.span>
            </AnimatePresence>
        </div>
    );
};

export default GranularLoadingText;
