
import React from 'react';
import { ResumeData, SkillCategory } from '../../../types';
import FormField from '../FormField';
import FormSection from '../FormSection';

interface Props {
  data: ResumeData;
  onDataChange: (path: string, value: any) => void;
}

const newCategoryEntry: SkillCategory = {
    id: '',
    name: '',
    skills: [],
};

const SkillsForm: React.FC<Props> = ({ data, onDataChange }) => {
    const handleAddCategory = () => {
        const newEntry = { ...newCategoryEntry, id: `skill-cat-${Date.now()}` };
        onDataChange('skills', [...(data.skills || []), newEntry]);
    };

    const handleRemoveCategory = (index: number) => {
        const newEntries = [...data.skills];
        newEntries.splice(index, 1);
        onDataChange('skills', newEntries);
    };

    return (
        <div>
            <h2 className="text-2xl font-bold font-display text-slate-900 mb-2">Skills</h2>
            <p className="text-sm text-slate-500 mb-6">Group your skills into categories (e.g., Languages, Frameworks, Tools).</p>

            {(data.skills || []).map((category, catIndex) => {
                if (!category) return null;
                return (
                    <FormSection key={category.id || catIndex} title={category.name || `Category #${catIndex + 1}`} onRemove={() => handleRemoveCategory(catIndex)}>
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
                                const newSkills = newSkillNames.map((name, i) => ({
                                    id: category.skills[i]?.id || `id-skill-${catIndex}-${i}-${Date.now()}`,
                                    name,
                                    proficiency: category.skills[i]?.proficiency || 'Intermediate'
                                }));
                                onDataChange(`skills[${catIndex}].skills`, newSkills);
                            }}
                            placeholder="e.g., JavaScript, TypeScript, Python"
                        />
                    </FormSection>
                )
            })}

            <button
                type="button"
                onClick={handleAddCategory}
                className="w-full mt-2 px-4 py-2 text-sm font-semibold rounded-lg text-slate-500 border-2 border-dashed border-slate-300 hover:border-primary hover:text-primary hover:bg-primary-50 transition-colors"
            >
                + Add Skill Category
            </button>
        </div>
    );
};

export default SkillsForm;