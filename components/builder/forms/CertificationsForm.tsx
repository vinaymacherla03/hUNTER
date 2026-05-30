
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
        const newEntry = { ...newCertificationEntry, id: `cert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}` };
        onDataChange('certifications', [...(data.certifications || []), newEntry]);
    };

    const handleRemove = (index: number) => {
        const newEntries = [...(data.certifications || [])];
        newEntries.splice(index, 1);
        onDataChange('certifications', newEntries);
    };

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
            <h2 className="text-2xl font-bold font-display text-slate-900 mb-6">Certifications & Licenses</h2>
            <div className="space-y-6">
                <AnimatePresence initial={false}>
                {(data.certifications || []).map((cert, index) => {
                    if (!cert) return null;
                    return (
                        <motion.div 
                            key={`${cert.id || 'cert'}-${index}`}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ type: "spring", stiffness: 300, damping: 30, delay: index * 0.05 }}
                        >
                            <FormSection title={cert.name || `Certification #${index + 1}`} onRemove={() => handleRemove(index)}>
                                <div className="space-y-4">
                                    <FormField label="Certification Name" name={`cert-name-${index}`} value={cert.name} onChange={e => onDataChange(`certifications[${index}].name`, e.target.value)} required />
                                    <FormField label="Issuing Organization" name={`cert-issuer-${index}`} value={cert.issuer} onChange={e => onDataChange(`certifications[${index}].issuer`, e.target.value)} required />
                                    <FormField label="Date Obtained" name={`cert-date-${index}`} value={cert.date} onChange={e => onDataChange(`certifications[${index}].date`, e.target.value)} placeholder="e.g., Aug 2023" />
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
                + Add New Certification
            </motion.button>
        </motion.div>
    );
};

export default CertificationsForm;