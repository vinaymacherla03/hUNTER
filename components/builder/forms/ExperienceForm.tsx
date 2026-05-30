
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wand2, Sparkles as SparklesIcon } from 'lucide-react';
import { ResumeData, Experience } from '../../../types';
import FormField from '../FormField';
import FormSection from '../FormSection';
import SparkleIcon from '../../icons/SparkleIcon';
import RewriteSuggestionModal from '../RewriteSuggestionModal';
import Tooltip from '../../Tooltip';
import { generateAgentSuggestion } from '../../../services/geminiService';

interface Props {
  data: ResumeData;
  onDataChange: (path: string, value: any) => void;
  jobDescription: string;
  onSmartTailor?: () => void;
}

const newExperienceEntry: Experience = {
    id: '',
    role: '',
    company: '',
    location: '',
    dates: '',
    description: [''],
};

const ExperienceForm: React.FC<Props> = ({ data, onDataChange, jobDescription, onSmartTailor }) => {
    const [modalState, setModalState] = useState<{ isOpen: boolean; originalText: string; suggestion: string; reason: string; path: string; } | null>(null);
    const [isThinking, setIsThinking] = useState<string | null>(null);
    const [popoverOpenFor, setPopoverOpenFor] = useState<string | null>(null);
    const popoverRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
                setPopoverOpenFor(null);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const handleAdd = () => {
        const newEntry = { ...newExperienceEntry, id: `exp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}` };
        onDataChange('experience', [...(data.experience || []), newEntry]);
    };

    const handleRemove = (index: number) => {
        const newEntries = [...data.experience];
        newEntries.splice(index, 1);
        onDataChange('experience', newEntries);
    };

    const handleDescriptionChange = (expIndex: number, descIndex: number, value: string) => {
        const newDesc = [...data.experience[expIndex].description];
        newDesc[descIndex] = value;
        onDataChange(`experience[${expIndex}].description`, newDesc);
    };

    const handleAddDescription = (expIndex: number) => {
        const newDesc = [...data.experience[expIndex].description, ''];
        onDataChange(`experience[${expIndex}].description`, newDesc);
    };

    const handleRemoveDescription = (expIndex: number, descIndex: number) => {
        const newDesc = [...data.experience[expIndex].description];
        newDesc.splice(descIndex, 1);
        onDataChange(`experience[${expIndex}].description`, newDesc);
    };
    
    const handleRewrite = async (expIndex: number, descIndex: number, action: 'IMPACT' | 'CONCISE') => {
        setPopoverOpenFor(null);
        const path = `experience[${expIndex}].description[${descIndex}]`;
        const originalText = data.experience[expIndex].description[descIndex];
        if (!originalText.trim()) {
            alert("Please write something in the bullet point first.");
            return;
        }
        setIsThinking(path);
        try {
            const promptType = action === 'IMPACT'
                ? 'REWRITE_EXPERIENCE_BULLET_WITH_REASON'
                : 'COMPACT_EXPERIENCE_BULLET_WITH_REASON';

            const result = await generateAgentSuggestion(promptType, { bulletPoint: originalText, jobDescription });
            if (typeof result === 'object' && 'rewritten' in result) {
                setModalState({
                    isOpen: true,
                    originalText,
                    suggestion: result.rewritten,
                    reason: result.reason,
                    path,
                });
            }
        } catch (error) {
            console.error(error);
            alert(error instanceof Error ? error.message : "Sorry, I couldn't generate a suggestion right now.");
        } finally {
            setIsThinking(null);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-6"
        >
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-[28px] font-black text-slate-900 tracking-tight mb-2 leading-tight">Work Experience</h1>
                    <p className="text-[15px] text-slate-500 font-medium">Start with your most recent job. Add achievements one by one for best results.</p>
                </div>
                {onSmartTailor && jobDescription.trim() && (
                    <Tooltip content="Automatically rewrite all experience entries to match the target job description">
                        <button
                            type="button"
                            onClick={onSmartTailor}
                            className="flex items-center gap-2 px-5 py-2.5 bg-violet-50/80 text-violet-600 rounded-xl text-[11px] font-black uppercase tracking-[0.15em] hover:bg-violet-100 transition-all border border-violet-100 shadow-[0_4px_10px_-4px_rgba(124,58,237,0.2)] active:scale-95"
                        >
                            <Wand2 className="w-4 h-4" />
                            AI Optimize All
                        </button>
                    </Tooltip>
                )}
            </div>
            
            <div className="relative border-l-2 border-slate-100 ml-3 pl-8 space-y-10">
                <AnimatePresence initial={false}>
                {(data.experience || []).map((exp, index) => {
                    if (!exp) return null;
                    return (
                        <motion.div 
                            key={`${exp.id || 'exp'}-${index}`} 
                            initial={{ opacity: 0, x: -20, height: 0 }}
                            animate={{ opacity: 1, x: 0, height: 'auto' }}
                            exit={{ opacity: 0, x: 20, height: 0 }}
                            transition={{ type: "spring", stiffness: 300, damping: 30, delay: index * 0.05 }}
                            className="relative group/exp"
                        >
                            {/* Timeline marker */}
                            <motion.div 
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: index * 0.1 + 0.2 }}
                                className="absolute -left-[33px] top-6 w-4 h-4 rounded-full bg-white border-2 border-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)] z-10 transition-transform group-hover/exp:scale-125"
                            />
                            
                            <FormSection title={exp.role || `Experience #${index + 1}`} onRemove={() => handleRemove(index)}>
                                <div className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4">
                                        <FormField label="Role / Title" name={`role-${index}`} value={exp.role} onChange={e => onDataChange(`experience[${index}].role`, e.target.value)} required />
                                        <FormField label="Company" name={`company-${index}`} value={exp.company} onChange={e => onDataChange(`experience[${index}].company`, e.target.value)} required />
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4">
                                        <FormField label="Location" name={`location-${index}`} value={exp.location} onChange={e => onDataChange(`experience[${index}].location`, e.target.value)} placeholder="e.g., San Francisco, CA" />
                                        <FormField label="Dates" name={`dates-${index}`} value={exp.dates} onChange={e => onDataChange(`experience[${index}].dates`, e.target.value)} placeholder="e.g., Jun 2020 - Present" />
                                    </div>
                                    <div className="pt-4 border-t border-slate-50">
                                        <label className="block text-xs font-black text-slate-400 mb-3 uppercase tracking-widest">Achievements & Impact</label>
                                        <AnimatePresence initial={false}>
                                        {(exp.description || []).map((desc, descIndex) => (
                                             <motion.div 
                                                key={`desc-${index}-${descIndex}`} 
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, scale: 0.95 }}
                                                className="flex items-start gap-2 group/bullet mb-2"
                                             >
                                                <div className="flex-grow">
                                                    <FormField 
                                                        label="Achievement"
                                                        hideLabel
                                                        compact
                                                        as="textarea"
                                                        name={`exp-${index}-desc-${descIndex}`}
                                                        value={desc || ''}
                                                        onChange={e => handleDescriptionChange(index, descIndex, e.target.value)}
                                                        rows={2}
                                                        placeholder="e.g., Increased user engagement by 20% by..."
                                                    />
                                                </div>
                                                 <div className="flex flex-col gap-1.5 pt-1 transition-opacity">
                                                    <div className="relative">
                                                        <button 
                                                            id={index === 0 && descIndex === 0 ? "tour-ai-rewrite" : undefined}
                                                            type="button" 
                                                            onClick={() => setPopoverOpenFor(popoverOpenFor === `${index}-${descIndex}` ? null : `${index}-${descIndex}`)} 
                                                            disabled={!!isThinking} 
                                                            className="p-1.5 rounded-full text-slate-400 hover:bg-emerald-50 hover:text-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all disabled:opacity-50 active:scale-90" 
                                                            title="Improve with AI"
                                                        >
                                                            {isThinking === `experience[${index}].description[${descIndex}]` ? (
                                                                <svg className="animate-spin h-4 w-4 text-emerald-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg>
                                                            ) : (
                                                                <SparkleIcon className="w-4 h-4" />
                                                            )}
                                                        </button>
                                                        <AnimatePresence>
                                                            {popoverOpenFor === `${index}-${descIndex}` && (
                                                                <motion.div
                                                                    ref={popoverRef}
                                                                    initial={{ opacity: 0, scale: 0.95, y: -10 }}
                                                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                                                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                                                                    className="absolute top-full right-0 mt-2 w-52 bg-slate-900 text-white rounded-xl shadow-2xl z-20 p-2 space-y-1 ring-1 ring-white/10"
                                                                >
                                                                    <button onClick={() => handleRewrite(index, descIndex, 'IMPACT')} className="w-full text-left text-[10px] font-black uppercase tracking-widest px-3 py-2 rounded-lg hover:bg-white/10 flex items-center gap-2 active:bg-white/20 transition-colors">
                                                                        <SparklesIcon className="w-3 h-3 text-emerald-400" />
                                                                        Make Impactful
                                                                    </button>
                                                                    <button onClick={() => handleRewrite(index, descIndex, 'CONCISE')} className="w-full text-left text-[10px] font-black uppercase tracking-widest px-3 py-2 rounded-lg hover:bg-white/10 flex items-center gap-2 active:bg-white/20 transition-colors">
                                                                        <Wand2 className="w-3 h-3 text-emerald-400" />
                                                                        Make Concise
                                                                    </button>
                                                                </motion.div>
                                                            )}
                                                        </AnimatePresence>
                                                    </div>
                                                     <button type="button" onClick={() => handleRemoveDescription(index, descIndex)} className="p-1.5 rounded-full text-slate-400 hover:bg-rose-50 hover:text-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-500/50 transition-all active:scale-90" title="Remove bullet point">
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                                                    </button>
                                                 </div>
                                             </motion.div>
                                        ))}
                                        </AnimatePresence>
                                        <button 
                                            type="button" 
                                            onClick={() => handleAddDescription(index)} 
                                            className="w-full mt-4 px-4 py-3 text-[10px] font-black uppercase tracking-widest rounded-2xl text-slate-500 border-2 border-dashed border-slate-100 hover:border-emerald-500 hover:text-emerald-700 hover:bg-emerald-50/50 transition-all active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-emerald-500/20 shadow-sm"
                                        >
                                            + Add Achievement Bullet
                                        </button>
                                    </div>
                                </div>
                            </FormSection>
                        </motion.div>
                    )
                })}
                </AnimatePresence>
            </div>

            <motion.button
                whileHover={{ scale: 1.02, y: -4 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={handleAdd}
                className="w-full mt-10 p-6 text-[12px] font-black uppercase tracking-[0.25em] rounded-[3rem] text-slate-700 bg-white border-2 border-dashed border-slate-200 hover:border-emerald-500 hover:text-emerald-800 hover:bg-emerald-50/40 transition-all shadow-lg hover:shadow-xl active:shadow-sm"
            >
                + Add New Experience Entry
            </motion.button>
            
             {modalState?.isOpen && (
                <RewriteSuggestionModal
                    originalText={modalState.originalText}
                    suggestion={modalState.suggestion}
                    reason={modalState.reason}
                    onClose={() => setModalState(null)}
                    onApply={() => {
                        onDataChange(modalState.path, modalState.suggestion);
                        setModalState(null);
                    }}
                />
            )}
        </motion.div>
    );
};

export default ExperienceForm;