
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wand2 } from 'lucide-react';
import { ResumeData, SkillCategory } from '../../../types';
import FormField from '../FormField';
import FormSection from '../FormSection';
import SparkleIcon from '../../icons/SparkleIcon';
import { generateAgentSuggestion } from '../../../services/geminiService';
import { toast } from 'sonner';
import Tooltip from '../../Tooltip';

interface Props {
  data: ResumeData;
  onDataChange: (path: string, value: any) => void;
  jobDescription: string;
  onSmartTailor?: () => void;
}

const newCategoryEntry: SkillCategory = {
    id: '',
    name: '',
    skills: [],
};

const SkillsForm: React.FC<Props> = ({ data, onDataChange, jobDescription, onSmartTailor }) => {
    const [isThinking, setIsThinking] = React.useState(false);

    const handleAddCategory = () => {
        const newEntry = { ...newCategoryEntry, id: `skill-cat-${Date.now()}` };
        onDataChange('skills', [...(data.skills || []), newEntry]);
    };

    const handleRemoveCategory = (index: number) => {
        const newEntries = [...(data.skills || [])];
        newEntries.splice(index, 1);
        onDataChange('skills', newEntries);
    };

    const handleSuggestSkills = async () => {
        if (!jobDescription.trim()) {
            toast.error("Please provide a job description first to get tailored skill suggestions.");
            return;
        }

        setIsThinking(true);
        try {
            const result = await generateAgentSuggestion('GET_SKILL_SUGGESTIONS', { jobDescription, currentSkills: data.skills });
            if (result && result.categories) {
                const updatedSkills = [...(data.skills || [])];
                let addedCount = 0;

                result.categories.forEach((cat: { name: string, skills: string[] }) => {
                    if (!cat.skills || cat.skills.length === 0) return;

                    // Try to find matching category by name
                    let targetCategory = updatedSkills.find(c => c.name.toLowerCase() === cat.name.toLowerCase());
                    
                    if (!targetCategory) {
                        targetCategory = { id: `skill-cat-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`, name: cat.name, skills: [] };
                        updatedSkills.push(targetCategory);
                    }

                    const existingSkillNames = new Set(targetCategory.skills.map(s => s.name.toLowerCase()));
                    const newSkills = cat.skills
                        .filter(s => !existingSkillNames.has(s.toLowerCase()))
                        .map(name => ({
                            id: `skill-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
                            name,
                            proficiency: 'Intermediate' as const
                        }));

                    if (newSkills.length > 0) {
                        targetCategory.skills = [...targetCategory.skills, ...newSkills];
                        addedCount += newSkills.length;
                    }
                });

                if (addedCount > 0) {
                    onDataChange('skills', updatedSkills);
                    toast.success(`Added ${addedCount} missing skills from the job description!`);
                } else {
                    toast.info("Your skills already match the required skills from the job description.");
                }
            } else {
                toast.error("No relevant skills found.");
            }
        } catch (error) {
            console.error(error);
            toast.error("Failed to suggest skills.");
        } finally {
            setIsThinking(false);
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-2">
                <h2 className="text-2xl font-bold font-display text-slate-900">Skills</h2>
                <div className="flex items-center gap-2">
                    {onSmartTailor && jobDescription.trim() && (
                        <Tooltip content="Automatically highlight skills from your profile that best match the target job description">
                            <button
                                type="button"
                                onClick={onSmartTailor}
                                className="flex items-center gap-2 px-4 py-1.5 bg-violet-50 text-violet-600 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-violet-100 transition-all border border-violet-100"
                            >
                                <Wand2 className="w-3.5 h-3.5" />
                                AI Optimize All
                            </button>
                        </Tooltip>
                    )}
                    {jobDescription.trim() && (
                        <button
                            type="button"
                            onClick={handleSuggestSkills}
                            disabled={isThinking}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full text-emerald-700 bg-emerald-100 hover:bg-emerald-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 active:scale-95 transition-all disabled:opacity-60"
                        >
                        {isThinking ? (
                            <svg className="animate-spin h-4 w-4 text-emerald-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg>
                        ) : (
                            <SparkleIcon className="w-4 h-4" />
                        )}
                        <span>Suggest Skills</span>
                    </button>
                )}
                </div>
            </div>
            <p className="text-sm text-slate-500 mb-6">Group your skills into categories (e.g., Languages, Frameworks, Tools).</p>
            <div className="space-y-6">
                <AnimatePresence>
                {(data.skills || []).map((category, catIndex) => {
                    if (!category) return null;
                    return (
                        <motion.div 
                            key={`${category.id || 'cat'}-${catIndex}`}
                            initial={{ opacity: 0, height: 0, overflow: 'hidden' }}
                            animate={{ opacity: 1, height: 'auto', overflow: 'visible' }}
                            exit={{ opacity: 0, height: 0, overflow: 'hidden' }}
                        >
                            <FormSection title={category.name || `Category #${catIndex + 1}`} onRemove={() => handleRemoveCategory(catIndex)}>
                                <FormField
                                    label="Category Name"
                                    name={`category-name-${catIndex}`}
                                    value={category.name}
                                    onChange={e => onDataChange(`skills[${catIndex}].name`, e.target.value)}
                                    placeholder="e.g., Programming Languages"
                                    required
                                />
                                <FormField
                                    as="textarea"
                                    rows={3}
                                    label="Skills (comma-separated)"
                                    name={`skills-list-${catIndex}`}
                                    value={(category.skills || []).filter(Boolean).map(s => s.name).join(', ')}
                                    onChange={e => {
                                        const newSkillNames = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
                                        const newSkills = newSkillNames.map((name, i) => {
                                            const existingSkill = category.skills.find(s => s.name === name);
                                            return {
                                                id: existingSkill?.id || `skill-${catIndex}-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
                                                name,
                                                proficiency: existingSkill?.proficiency || 'Intermediate'
                                            };
                                        });
                                        onDataChange(`skills[${catIndex}].skills`, newSkills);
                                    }}
                                    placeholder="e.g., JavaScript, TypeScript, Python"
                                />
                            </FormSection>
                        </motion.div>
                    )
                })}
                </AnimatePresence>
            </div>

            <button
                type="button"
                onClick={handleAddCategory}
                className="w-full mt-2 px-4 py-2 text-sm font-semibold rounded-lg text-slate-500 border-2 border-dashed border-slate-300 hover:border-emerald-500 hover:text-emerald-600 hover:bg-emerald-50 hover:scale-[1.02] focus:outline-none focus:ring-4 focus:ring-emerald-500/20 active:scale-95 transition-all"
            >
                + Add Skill Category
            </button>
        </div>
    );
};

export default SkillsForm;