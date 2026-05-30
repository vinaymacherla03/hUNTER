import React from 'react';
import { motion } from 'framer-motion';
import { AuditResult } from '../../types';
import { X } from 'lucide-react';
import PremiumButton from './PremiumButton';

interface AiAuditModalProps {
    result: AuditResult;
    onClose: () => void;
    onRewrite: (path: string, originalText: string, type: 'summary' | 'bullet') => void;
}

const ScoreCircle: React.FC<{ score: number; label: string; colorClass: string }> = ({ score, label, colorClass }) => {
    const radius = 45;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (score / 100) * circumference;

    return (
        <div className="relative h-32 w-32 flex flex-col items-center justify-center">
            <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100" aria-label={`${label}: ${score} out of 100`}>
                <circle className="text-slate-100" strokeWidth="8" stroke="currentColor" fill="transparent" r={radius} cx="50" cy="50" />
                <motion.circle
                    className={colorClass}
                    strokeWidth="8"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="transparent"
                    r={radius}
                    cx="50"
                    cy="50"
                    strokeDasharray={circumference}
                    initial={{ strokeDashoffset: circumference }}
                    animate={{ strokeDashoffset: offset }}
                    transition={{ duration: 1.5, ease: 'circOut' }}
                />
            </svg>
            <div className="flex flex-col items-center justify-center z-10">
                <span className="text-4xl font-black text-slate-900 tracking-tighter">{score}</span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-1">{label}</span>
            </div>
        </div>
    );
};

const FeedbackItem: React.FC<{
    item: AuditResult['feedback'][0];
    onRewrite: (path: string, originalText: string, type: 'summary' | 'bullet') => void;
}> = ({ item, onRewrite }) => {
    const categoryColors: Record<string, string> = {
        Impact: 'bg-emerald-50 text-emerald-700 border-emerald-100',
        Quantification: 'bg-emerald-50 text-emerald-700 border-emerald-100',
        Conciseness: 'bg-emerald-50 text-emerald-700 border-emerald-100',
        Skills: 'bg-amber-50 text-amber-700 border-amber-100',
        'ATS Parsability': 'bg-emerald-50 text-emerald-700 border-emerald-100',
        'OpenCATS Compatibility': 'bg-emerald-50 text-emerald-700 border-emerald-100',
    };

    const colorClass = categoryColors[item.category] || 'bg-slate-50 text-slate-700 border-slate-200';

    return (
        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
                <span className={`px-3 py-1 text-[10px] font-bold uppercase tracking-widest rounded-lg border ${colorClass}`}>
                    {item.category}
                </span>
                {item.contextPath && item.suggestion && (
                    <button 
                        onClick={() => onRewrite(item.contextPath!, item.message, item.contextPath === 'summary' ? 'summary' : 'bullet')} 
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl text-emerald-600 bg-emerald-50 hover:bg-emerald-100 transition-colors"
                    >
                        <img 
                            src="https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Activities/Sparkles.png" 
                            alt="Sparkles" 
                            className="w-3.5 h-3.5"
                            referrerPolicy="no-referrer"
                        /> 
                        Fix with AI
                    </button>
                )}
            </div>
            <p className="text-sm text-slate-600 leading-relaxed font-medium">{item.message}</p>
        </div>
    );
};

const AiAuditModal = React.forwardRef<HTMLDivElement, AiAuditModalProps>(({ result, onClose, onRewrite }, ref) => {
    return (
        <motion.div 
            ref={ref}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm" 
            role="dialog" 
            aria-modal="true"
        >
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                className="relative z-10 w-full max-w-2xl max-h-[90vh] flex flex-col bg-white rounded-3xl shadow-2xl overflow-hidden"
            >
                <header className="flex items-center justify-between p-6 sm:p-8 border-b border-slate-100 shrink-0">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 flex items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                            <img 
                                src="https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Activities/Sparkles.png" 
                                alt="Sparkles" 
                                className="w-6 h-6"
                                referrerPolicy="no-referrer"
                            />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-slate-900 tracking-tight">AI Resume Audit</h2>
                            <p className="text-sm text-slate-500 font-medium mt-1">Actionable feedback to improve your resume.</p>
                        </div>
                    </div>
                    <button 
                        onClick={onClose} 
                        className="p-2.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-200" 
                        aria-label="Close modal"
                    >
                       <X className="w-6 h-6" />
                    </button>
                </header>

                <div className="flex-grow p-6 sm:p-8 overflow-y-auto custom-scrollbar bg-slate-50/50">
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-8 mb-10">
                        <div className="flex flex-col items-center text-center">
                            <ScoreCircle score={result.overallScore} label="Overall" colorClass="text-emerald-600" />
                            <p className="mt-4 text-xs text-slate-500 max-w-[200px] font-medium leading-relaxed">
                                Overall impact, clarity, and use of best practices.
                            </p>
                        </div>
                        {result.atsScore !== undefined && (
                            <div className="flex flex-col items-center text-center">
                                <ScoreCircle score={result.atsScore} label="ATS Match" colorClass="text-emerald-600" />
                                <p className="mt-4 text-xs text-slate-500 max-w-[200px] font-medium leading-relaxed">
                                    OpenCATS parsability and keyword optimization.
                                </p>
                            </div>
                        )}
                    </div>

                    <div className="space-y-4">
                        {result.feedback.length > 0 ? (
                            <motion.div 
                                initial="hidden"
                                animate="visible"
                                variants={{
                                    hidden: { opacity: 0 },
                                    visible: {
                                        opacity: 1,
                                        transition: { staggerChildren: 0.1 }
                                    }
                                }}
                                className="space-y-4"
                            >
                                {result.feedback.map((item, index) => (
                                    <motion.div
                                        key={index}
                                        variants={{
                                            hidden: { opacity: 0, y: 20 },
                                            visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
                                        }}
                                    >
                                        <FeedbackItem item={item} onRewrite={onRewrite} />
                                    </motion.div>
                                ))}
                            </motion.div>
                        ) : (
                            <div className="text-center p-8 bg-white rounded-2xl border border-slate-200">
                                <p className="text-slate-600 font-medium">Looks great! The AI couldn't find any specific improvements to suggest.</p>
                            </div>
                        )}
                    </div>
                </div>

                <footer className="flex justify-end p-6 border-t border-slate-100 bg-white shrink-0">
                    <PremiumButton 
                        onClick={onClose} 
                        variant="primary"
                        className="w-auto"
                    >
                        Close Audit
                    </PremiumButton>
                </footer>
            </motion.div>
        </motion.div>
    );
});

AiAuditModal.displayName = 'AiAuditModal';

export default AiAuditModal;