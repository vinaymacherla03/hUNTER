
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LucideIcon, Sparkles } from 'lucide-react';

interface AIProcessingStateProps {
    title: string;
    description?: string;
    messages?: string[];
    icon?: LucideIcon;
    color?: 'emerald' | 'blue' | 'violet' | 'amber';
}

const AIProcessingState: React.FC<AIProcessingStateProps> = ({ 
    title, 
    description, 
    messages,
    icon: Icon = Sparkles,
    color = 'emerald'
}) => {
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        if (!messages || messages.length <= 1) return;
        
        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % messages.length);
        }, 2500);

        return () => clearInterval(interval);
    }, [messages]);
    const colorMap = {
        emerald: {
            bg: 'bg-emerald-50',
            border: 'border-emerald-100',
            iconBg: 'bg-emerald-100',
            iconText: 'text-emerald-600',
            ring: 'border-emerald-500',
            pulse: 'bg-emerald-400/20'
        },
        blue: {
            bg: 'bg-emerald-50',
            border: 'border-emerald-100',
            iconBg: 'bg-emerald-100',
            iconText: 'text-emerald-600',
            ring: 'border-emerald-500',
            pulse: 'bg-emerald-400/20'
        },
        violet: {
            bg: 'bg-emerald-50',
            border: 'border-emerald-100',
            iconBg: 'bg-emerald-100',
            iconText: 'text-emerald-600',
            ring: 'border-emerald-500',
            pulse: 'bg-emerald-400/20'
        },
        amber: {
            bg: 'bg-emerald-50',
            border: 'border-emerald-100',
            iconBg: 'bg-emerald-100',
            iconText: 'text-emerald-600',
            ring: 'border-emerald-500',
            pulse: 'bg-emerald-400/20'
        }
    };

    const colors = colorMap[color];

    return (
        <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className={`py-12 sm:py-16 px-4 sm:px-8 flex flex-col items-center justify-center text-center rounded-[2rem] sm:rounded-[2.5rem] border-2 border-dashed ${colors.border} ${colors.bg} relative overflow-hidden`}
        >
            {/* Background Pulse */}
            <div className={`absolute inset-0 ${colors.pulse} animate-pulse pointer-events-none`} />
            
            <div className="relative z-10 flex flex-col items-center">
                <div className="relative w-20 h-20 sm:w-24 sm:h-24 mb-6 sm:mb-8">
                    {/* Outer Rotating Ring */}
                    <motion.div 
                        animate={{ rotate: 360 }}
                        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                        className={`absolute inset-0 border-4 border-dashed ${colors.ring} opacity-20 rounded-full`}
                    />
                    
                    {/* Inner Rotating Ring */}
                    <motion.div 
                        animate={{ rotate: -360 }}
                        transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
                        className={`absolute inset-2 border-2 border-dotted ${colors.ring} opacity-40 rounded-full`}
                    />
 
                    {/* Center Icon Container */}
                    <div className={`absolute inset-0 m-auto w-12 h-12 sm:w-14 sm:h-14 ${colors.iconBg} rounded-xl sm:rounded-2xl flex items-center justify-center shadow-xl shadow-black/5 border border-white/50`}>
                        <Icon className={`w-6 h-6 sm:w-7 sm:h-7 ${colors.iconText} animate-pulse`} />
                    </div>
                </div>
 
                <h3 className="text-lg sm:text-xl font-black text-slate-900 uppercase tracking-widest mb-3">
                    {title}
                </h3>
                
                <div className="h-12 flex items-center justify-center">
                    {messages && messages.length > 0 ? (
                        <AnimatePresence mode="popLayout">
                            <motion.p
                                key={currentIndex}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.3 }}
                                className="text-sm text-slate-500 max-w-xs mx-auto font-medium leading-relaxed"
                            >
                                {messages[currentIndex]}
                            </motion.p>
                        </AnimatePresence>
                    ) : (
                        <p className="text-sm text-slate-500 max-w-xs mx-auto font-medium leading-relaxed">
                            {description}
                        </p>
                    )}
                </div>

                {/* Thinking Dots */}
                <div className="flex gap-1.5 mt-6">
                    {[0, 1, 2].map((i) => (
                        <motion.div
                            key={i}
                            animate={{ 
                                scale: [1, 1.5, 1],
                                opacity: [0.3, 1, 0.3]
                            }}
                            transition={{ 
                                duration: 1, 
                                repeat: Infinity, 
                                delay: i * 0.2 
                            }}
                            className={`w-1.5 h-1.5 rounded-full ${colors.iconText}`}
                        />
                    ))}
                </div>
            </div>
        </motion.div>
    );
};

export default AIProcessingState;
