import React from 'react';

interface FormSectionProps {
    title: string;
    onRemove?: () => void;
    children: React.ReactNode;
}

const FormSection: React.FC<FormSectionProps> = ({ title, onRemove, children }) => {
    return (
        <div className="bg-white border border-slate-200 rounded-lg p-4 mb-4 relative">
            <div className="flex justify-between items-center mb-3">
                <h3 className="text-md font-semibold text-slate-800">{title}</h3>
                {onRemove && (
                    <button
                        type="button"
                        onClick={onRemove}
                        className="p-1 rounded-full text-slate-400 hover:bg-red-500/10 hover:text-red-500 transition-colors"
                        aria-label="Remove item"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                    </button>
                )}
            </div>
            {children}
        </div>
    );
};

export default FormSection;