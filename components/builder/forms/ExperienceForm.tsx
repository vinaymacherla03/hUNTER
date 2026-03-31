
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ResumeData, Experience } from '../../../types';
import FormField from '../FormField';
import FormSection from '../FormSection';
import SparkleIcon from '../../icons/SparkleIcon';
import RewriteSuggestionModal from '../RewriteSuggestionModal';
import { generateAgentSuggestion } from '../../../services/geminiService';

interface Props {
  data: ResumeData;
  onDataChange: (path: string, value: any) => void;
  jobDescription: string;
}

const newExperienceEntry: Experience = {
    id: '',
    role: '',
    company: '',
    location: '',
    dates: '',
    description: [''],
};

const ExperienceForm: React.FC<Props> = ({ data, onDataChange, jobDescription }) => {
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
        const newEntry = { ...newExperienceEntry, id: `exp-${Date.now()}` };
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
        <div>
            <h2 className="text-2xl font-bold font-display text-slate-900 mb-2">Work Experience</h2>
            <p className="text-sm text-slate-500 mb-6">Start with your most recent job. Add achievements one by one for best results.</p>
            
            <div className="relative border-l-2 border-slate-200 ml-3 pl-6 space-y-6">
                {(data.experience || []).map((exp, index) => {
                    if (!exp) return null;
                    return (
                        <div key={exp.id || index} className="relative">
                            {/* Timeline marker */}
                            <div className="absolute -left-[33px] top-6 w-4 h-4 rounded-full bg-white border-2 border-emerald-500 shadow-sm z-10"></div>
                            
                            <FormSection title={exp.role || `Experience #${index + 1}`} onRemove={() => handleRemove(index)}>
                                <FormField label="Role / Title" name={`role-${index}`} value={exp.role} onChange={e => onDataChange(`experience[${index}].role`, e.target.value)} required />
                                <FormField label="Company" name={`company-${index}`} value={exp.company} onChange={e => onDataChange(`experience[${index}].company`, e.target.value)} required />
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4">
                                    <FormField label="Location" name={`location-${index}`} value={exp.location} onChange={e => onDataChange(`experience[${index}].location`, e.target.value)} placeholder="e.g., San Francisco, CA" />
                                    <FormField label="Dates" name={`dates-${index}`} value={exp.dates} onChange={e => onDataChange(`experience[${index}].dates`, e.target.value)} placeholder="e.g., Jun 2020 - Present" />
                                </div>
                                 <div className="mb-4">
                                    <label className="block text-sm font-medium text-slate-600 mb-1.5">Description (Achievements & Responsibilities) <span className="text-xs text-slate-400 font-normal">(Markdown supported)</span></label>
                                    {(exp.description || []).map((desc, descIndex) => (
                                         <div key={descIndex} className="flex items-start gap-2 group mb-1.5">
                                            <textarea
                                                value={desc || ''}
                                                onChange={e => handleDescriptionChange(index, descIndex, e.target.value)}
                                                rows={2}
                                                className="flex-grow text-sm p-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary bg-white text-slate-900 resize-y min-h-[40px]"
                                                placeholder="e.g., Increased user engagement by 20% by..."
                                            />
                                             <div className="flex flex-col gap-1.5 pt-1.5">
                                                <div className="relative">
                                                    <button type="button" onClick={() => setPopoverOpenFor(popoverOpenFor === `${index}-${descIndex}` ? null : `${index}-${descIndex}`)} disabled={!!isThinking} className="p-1.5 rounded-full text-slate-400 hover:bg-primary-100 hover:text-primary transition-colors disabled:opacity-50" title="Improve with AI">
                                                        {isThinking === `experience[${index}].description[${descIndex}]` ? (
                                                            <svg className="animate-spin h-4 w-4 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg>
                                                        ) : (
                                                            <SparkleIcon className="w-4 h-4" />
                                                        )}
                                                    </button>
                                                    <AnimatePresence>
                                                        {popoverOpenFor === `${index}-${descIndex}` && (
                                                            <motion.div
                                                                ref={popoverRef}
                                                                initial={{ opacity: 0, y: -10 }}
                                                                animate={{ opacity: 1, y: 0 }}
                                                                exit={{ opacity: 0, y: -10 }}
                                                                className="absolute top-full right-0 mt-2 w-48 bg-white border border-slate-200 rounded-lg shadow-xl z-10 p-2 space-y-1"
                                                            >
                                                                <button onClick={() => handleRewrite(index, descIndex, 'IMPACT')} className="w-full text-left text-sm px-3 py-1.5 rounded-md hover:bg-slate-100 flex items-center gap-2">Make More Impactful</button>
                                                                <button onClick={() => handleRewrite(index, descIndex, 'CONCISE')} className="w-full text-left text-sm px-3 py-1.5 rounded-md hover:bg-slate-100 flex items-center gap-2">Make More Concise</button>
                                                            </motion.div>
                                                        )}
                                                    </AnimatePresence>
                                                </div>
                                                 <button type="button" onClick={() => handleRemoveDescription(index, descIndex)} className="p-1.5 rounded-full text-slate-400 hover:bg-red-100 hover:text-red-500 transition-colors" title="Remove bullet point">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                                                </button>
                                             </div>
                                         </div>
                                    ))}
                                     <button type="button" onClick={() => handleAddDescription(index)} className="w-full mt-1 px-4 py-1.5 text-xs font-semibold rounded-lg text-slate-500 border border-dashed border-slate-300 hover:border-slate-400 hover:text-slate-600 transition-colors">
                                        + Add Bullet Point
                                    </button>
                                </div>
                            </FormSection>
                        </div>
                    )
                })}
            </div>

            <button
                type="button"
                onClick={handleAdd}
                className="w-full mt-2 px-4 py-2 text-sm font-semibold rounded-lg text-slate-500 border-2 border-dashed border-slate-300 hover:border-primary hover:text-primary hover:bg-primary-50 transition-colors"
            >
                + Add Experience
            </button>
            
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
        </div>
    );
};

export default ExperienceForm;