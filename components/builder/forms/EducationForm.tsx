
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ResumeData, Education } from '../../../types';
import FormField from '../FormField';
import FormSection from '../FormSection';

interface Props {
  data: ResumeData;
  onDataChange: (path: string, value: any) => void;
}

const newEducationEntry: Education = {
    id: '',
    degree: '',
    institution: '',
    location: '',
    graduationDate: '',
    relevantCoursework: []
};

const EducationForm: React.FC<Props> = ({ data, onDataChange }) => {
    const handleAdd = () => {
        const newEntry = { ...newEducationEntry, id: `edu-${Date.now()}-${Math.random().toString(36).substr(2, 9)}` };
        onDataChange('education', [...(data.education || []), newEntry]);
    };

    const handleRemove = (index: number) => {
        const newEntries = [...data.education];
        newEntries.splice(index, 1);
        onDataChange('education', newEntries);
    };

  return (
    <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
    >
      <h2 className="text-2xl font-bold font-display text-slate-900 mb-6">Education</h2>
      <div className="space-y-8">
        <AnimatePresence initial={false}>
        {(data.education || []).map((edu, index) => {
          if (!edu) return null;
          return (
              <motion.div 
                  key={`${edu.id || 'edu'}-${index}`}
                  initial={{ opacity: 0, x: -20, height: 0 }}
                  animate={{ opacity: 1, x: 0, height: 'auto' }}
                  exit={{ opacity: 0, x: 20, height: 0 }}
                  transition={{ type: "spring", stiffness: 300, damping: 30, delay: index * 0.05 }}
                  className="relative"
              >
                  <FormSection title={edu.degree || `Education #${index + 1}`} onRemove={() => handleRemove(index)}>
                      <div className="space-y-4">
                        <FormField label="Degree" name={`degree-${index}`} value={edu.degree} onChange={e => onDataChange(`education[${index}].degree`, e.target.value)} required />
                        <FormField label="Institution" name={`institution-${index}`} value={edu.institution} onChange={e => onDataChange(`education[${index}].institution`, e.target.value)} required />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4">
                            <FormField label="Location" name={`location-${index}`} value={edu.location} onChange={e => onDataChange(`education[${index}].location`, e.target.value)} />
                            <FormField label="Graduation Date" name={`graduationDate-${index}`} value={edu.graduationDate} onChange={e => onDataChange(`education[${index}].graduationDate`, e.target.value)} />
                        </div>
                        <FormField label="Relevant Coursework (comma-separated)" name={`courses-${index}`} value={(edu.relevantCoursework || []).join(', ')} onChange={e => onDataChange(`education[${index}].relevantCoursework`, e.target.value.split(',').map(s => s.trim()))} />
                      </div>
                  </FormSection>
              </motion.div>
          )
        })}
        </AnimatePresence>
      </div>
      <motion.button
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        type="button"
        onClick={handleAdd}
        className="w-full mt-4 p-4 text-[10px] font-black uppercase tracking-widest rounded-2xl text-slate-500 border-2 border-dashed border-slate-200 hover:border-emerald-500 hover:text-emerald-600 hover:bg-emerald-50/30 transition-all shadow-sm"
      >
        + Add New Education Entry
      </motion.button>
    </motion.div>
  );
};

export default EducationForm;