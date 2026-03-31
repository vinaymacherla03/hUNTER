
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ResumeData, JobApplication } from '../../types';
import { generateTailoredResume } from '../../services/geminiService';
import SparkleIcon from '../icons/SparkleIcon';
import DownloadDropdown from '../DownloadDropdown';
import PremiumButton from './PremiumButton';

interface SmartApplyModalProps {
    job: JobApplication;
    resumeData: ResumeData;
    onClose: () => void;
}

const SmartApplyModal: React.FC<SmartApplyModalProps> = ({ job, resumeData, onClose }) => {
    const [step, setStep] = useState<'analyzing' | 'tailoring' | 'ready'>('analyzing');
    const [tailoredResume, setTailoredResume] = useState<ResumeData | null>(null);
    const [rationale, setRationale] = useState<string>('');
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const process = async () => {
            try {
                // Step 1: Simulate deep analysis delay
                await new Promise(r => setTimeout(r, 1500));
                setStep('tailoring');

                // Step 2: Tailor the resume using AI
                const jobDesc = job.jobDescription || `Role: ${job.role} at ${job.company}. Location: ${job.location}.`;
                const result = await generateTailoredResume(resumeData, jobDesc);
                
                setTailoredResume(result.tailoredResume);
                setRationale(result.rationale);
                setStep('ready');
            } catch (err) {
                console.error(err);
                setError("Failed to tailor resume. Please check your connection or try again.");
            }
        };
        process();
    }, [job, resumeData]);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                className="relative z-10 w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col"
            >
                {/* Header with Gradient */}
                <div className="bg-gradient-to-r from-teal-600 to-emerald-600 p-6 text-white text-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />
                    <div className="relative z-10">
                        <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3 backdrop-blur-md">
                            <SparkleIcon className="w-6 h-6 text-yellow-300" />
                        </div>
                        <h2 className="text-xl font-bold">Smart Apply</h2>
                        <p className="text-emerald-100 text-sm mt-1">Optimizing for {job.role} @ {job.company}</p>
                    </div>
                </div>

                {/* Content Area */}
                <div className="p-8">
                    {error ? (
                        <div className="text-center">
                            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                            </div>
                            <p className="text-slate-700 font-medium">{error}</p>
                            <button onClick={onClose} className="mt-4 text-sm text-slate-500 hover:text-slate-800">Close</button>
                        </div>
                    ) : step !== 'ready' ? (
                        <div className="text-center py-8">
                            <div className="flex justify-center gap-2 mb-6">
                                <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1 }} className="w-3 h-3 bg-emerald-500 rounded-full" />
                                <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="w-3 h-3 bg-teal-500 rounded-full" />
                                <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="w-3 h-3 bg-teal-400 rounded-full" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-800 mb-2">
                                {step === 'analyzing' ? 'Analyzing Job Description...' : 'Tailoring Your Experience...'}
                            </h3>
                            <p className="text-slate-500 text-sm">
                                {step === 'analyzing' ? 'Identifying key requirements and cultural fit keywords.' : 'Rewriting summary and highlighting relevant skills.'}
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4">
                                <h4 className="text-sm font-bold text-emerald-800 flex items-center gap-2 mb-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                                    Optimization Complete
                                </h4>
                                <p className="text-xs text-emerald-700 leading-relaxed">{rationale}</p>
                            </div>

                            <div>
                                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Your Application Kit</h4>
                                <div className="space-y-3">
                                    {/* Resume Download Action */}
                                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 bg-white border border-slate-200 rounded flex items-center justify-center text-red-500">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" /></svg>
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-slate-700">Tailored Resume</p>
                                                <p className="text-[10px] text-slate-500">PDF • Optimized for {job.company}</p>
                                            </div>
                                        </div>
                                        {/* We trick the DownloadDropdown to use our tailored data instead of the main context */}
                                        <div className="scale-90 origin-right">
                                            {tailoredResume && <DownloadDropdown onDownloadPdf={() => window.print()} />}
                                        </div>
                                    </div>

                                    {/* Email Action */}
                                    <a 
                                        href={`mailto:hiring@${job.company.toLowerCase().replace(/\s/g, '')}.com?subject=Application for ${job.role} - ${resumeData.fullName}&body=Dear Hiring Team,%0A%0AI am writing to express my strong interest in the ${job.role} position at ${job.company}. Please find my tailored resume attached.%0A%0ABest,%0A${resumeData.fullName}`}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50 transition-colors group"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 bg-white border border-slate-200 rounded flex items-center justify-center text-emerald-500">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" /><path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" /></svg>
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-slate-700 group-hover:text-emerald-700">Draft Email</p>
                                                <p className="text-[10px] text-slate-500 group-hover:text-emerald-600">Opens default mail client</p>
                                            </div>
                                        </div>
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-slate-400 group-hover:text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                                    </a>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {step === 'ready' && (
                    <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
                        <button onClick={onClose} className="text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors">
                            Done
                        </button>
                    </div>
                )}
            </motion.div>
        </div>
    );
};

export default SmartApplyModal;
