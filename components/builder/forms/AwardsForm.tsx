
import React from 'react';
import { ResumeData, Award } from '../../../types';
import FormField from '../FormField';
import FormSection from '../FormSection';

interface Props {
  data: ResumeData;
  onDataChange: (path: string, value: any) => void;
}

const newAwardEntry: Award = {
    id: '',
    name: '',
    issuer: '',
    date: '',
};

const AwardsForm: React.FC<Props> = ({ data, onDataChange }) => {
    const handleAdd = () => {
        const newEntry = { ...newAwardEntry, id: `award-${Date.now()}` };
        onDataChange('awards', [...(data.awards || []), newEntry]);
    };

    const handleRemove = (index: number) => {
        const newEntries = [...(data.awards || [])];
        newEntries.splice(index, 1);
        onDataChange('awards', newEntries);
    };

    return (
        <div>
            <h2 className="text-2xl font-bold font-display text-slate-900 mb-6">Awards & Honors</h2>
            {(data.awards || []).map((award, index) => {
                if (!award) return null;
                return (
                    <FormSection key={award.id || index} title={award.name || `Award #${index + 1}`} onRemove={() => handleRemove(index)}>
                        <FormField label="Award Name" name={`award-name-${index}`} value={award.name} onChange={e => onDataChange(`awards[${index}].name`, e.target.value)} required />
                        <FormField label="Issuing Organization" name={`award-issuer-${index}`} value={award.issuer} onChange={e => onDataChange(`awards[${index}].issuer`, e.target.value)} required />
                        <FormField label="Date Received" name={`award-date-${index}`} value={award.date} onChange={e => onDataChange(`awards[${index}].date`, e.target.value)} placeholder="e.g., May 2022" />
                    </FormSection>
                )
            })}
            <button
                type="button"
                onClick={handleAdd}
                className="w-full mt-2 px-4 py-2 text-sm font-semibold rounded-lg text-slate-500 border-2 border-dashed border-slate-300 hover:border-primary hover:text-primary hover:bg-primary-50 transition-colors"
            >
                + Add Award
            </button>
        </div>
    );
};

export default AwardsForm;