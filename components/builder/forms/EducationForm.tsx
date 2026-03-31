
import React from 'react';
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
        const newEntry = { ...newEducationEntry, id: `edu-${Date.now()}` };
        onDataChange('education', [...(data.education || []), newEntry]);
    };

    const handleRemove = (index: number) => {
        const newEntries = [...data.education];
        newEntries.splice(index, 1);
        onDataChange('education', newEntries);
    };

  return (
    <div>
      <h2 className="text-2xl font-bold font-display text-slate-900 mb-6">Education</h2>
      {(data.education || []).map((edu, index) => {
        if (!edu) return null;
        return (
            <FormSection key={edu.id || index} title={edu.degree || `Education #${index + 1}`} onRemove={() => handleRemove(index)}>
                <FormField label="Degree" name={`degree-${index}`} value={edu.degree} onChange={e => onDataChange(`education[${index}].degree`, e.target.value)} required />
                <FormField label="Institution" name={`institution-${index}`} value={edu.institution} onChange={e => onDataChange(`education[${index}].institution`, e.target.value)} required />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4">
                    <FormField label="Location" name={`location-${index}`} value={edu.location} onChange={e => onDataChange(`education[${index}].location`, e.target.value)} />
                    <FormField label="Graduation Date" name={`graduationDate-${index}`} value={edu.graduationDate} onChange={e => onDataChange(`education[${index}].graduationDate`, e.target.value)} />
                </div>
                 <FormField label="Relevant Coursework (comma-separated)" name={`courses-${index}`} value={(edu.relevantCoursework || []).join(', ')} onChange={e => onDataChange(`education[${index}].relevantCoursework`, e.target.value.split(',').map(s => s.trim()))} />
            </FormSection>
        )
      })}
      <button
        type="button"
        onClick={handleAdd}
        className="w-full mt-2 px-4 py-2 text-sm font-semibold rounded-lg text-slate-500 border-2 border-dashed border-slate-300 hover:border-primary hover:text-primary hover:bg-primary-50 transition-colors"
      >
        + Add Education
      </button>
    </div>
  );
};

export default EducationForm;