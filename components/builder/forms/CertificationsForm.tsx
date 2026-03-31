
import React from 'react';
import { ResumeData, Certification } from '../../../types';
import FormField from '../FormField';
import FormSection from '../FormSection';

interface Props {
  data: ResumeData;
  onDataChange: (path: string, value: any) => void;
}

const newCertificationEntry: Certification = {
    id: '',
    name: '',
    issuer: '',
    date: '',
};

const CertificationsForm: React.FC<Props> = ({ data, onDataChange }) => {
    const handleAdd = () => {
        const newEntry = { ...newCertificationEntry, id: `cert-${Date.now()}` };
        onDataChange('certifications', [...(data.certifications || []), newEntry]);
    };

    const handleRemove = (index: number) => {
        const newEntries = [...(data.certifications || [])];
        newEntries.splice(index, 1);
        onDataChange('certifications', newEntries);
    };

    return (
        <div>
            <h2 className="text-2xl font-bold font-display text-slate-900 mb-6">Certifications & Licenses</h2>
            {(data.certifications || []).map((cert, index) => {
                if (!cert) return null;
                return (
                    <FormSection key={cert.id || index} title={cert.name || `Certification #${index + 1}`} onRemove={() => handleRemove(index)}>
                        <FormField label="Certification Name" name={`cert-name-${index}`} value={cert.name} onChange={e => onDataChange(`certifications[${index}].name`, e.target.value)} required />
                        <FormField label="Issuing Organization" name={`cert-issuer-${index}`} value={cert.issuer} onChange={e => onDataChange(`certifications[${index}].issuer`, e.target.value)} required />
                        <FormField label="Date Obtained" name={`cert-date-${index}`} value={cert.date} onChange={e => onDataChange(`certifications[${index}].date`, e.target.value)} placeholder="e.g., Aug 2023" />
                    </FormSection>
                )
            })}
            <button
                type="button"
                onClick={handleAdd}
                className="w-full mt-2 px-4 py-2 text-sm font-semibold rounded-lg text-slate-500 border-2 border-dashed border-slate-300 hover:border-primary hover:text-primary hover:bg-primary-50 transition-colors"
            >
                + Add Certification
            </button>
        </div>
    );
};

export default CertificationsForm;