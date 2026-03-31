
import React, { useState } from 'react';
import { ResumeData } from '../../../types';
import FormField from '../FormField';
import SparkleIcon from '../../icons/SparkleIcon';
import RewriteSuggestionModal from '../RewriteSuggestionModal';
import { generateAgentSuggestion } from '../../../services/geminiService';

interface Props {
  data: ResumeData;
  onDataChange: (path: string, value: any) => void;
  jobDescription: string;
}

const SummaryForm: React.FC<Props> = ({ data, onDataChange, jobDescription }) => {
  const [modalState, setModalState] = useState<{ isOpen: boolean; originalText: string; suggestion: string; reason: string; path: string; } | null>(null);
  const [isThinking, setIsThinking] = useState(false);

  const handleRewrite = async () => {
        const path = 'summary';
        const originalText = data.summary;
        if (!originalText.trim() && (!data.experience || data.experience.length === 0)) {
            alert("Please add some experience or write a draft summary first so the AI has some context.");
            return;
        }
        setIsThinking(true);
        try {
            const result = await generateAgentSuggestion('WRITE_SUMMARY', { resume: data, jobDescription });
             if (typeof result === 'string') {
                setModalState({
                    isOpen: true,
                    originalText,
                    suggestion: result,
                    reason: "This version is a concise, first-person pitch that highlights your key skills and experience, making a strong first impression on recruiters.",
                    path,
                });
            }
        } catch (error) {
            console.error(error);
            alert(error instanceof Error ? error.message : "Sorry, I couldn't generate a suggestion right now.");
        } finally {
            setIsThinking(false);
        }
    };

  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-2xl font-bold font-display text-slate-900">Professional Summary</h2>
         <button
            type="button"
            onClick={handleRewrite}
            disabled={isThinking}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full text-primary-700 bg-primary-100 hover:bg-primary-200 transition-colors disabled:opacity-60"
        >
            {isThinking ? (
                <svg className="animate-spin h-4 w-4 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg>
            ) : (
                <SparkleIcon className="w-4 h-4" />
            )}
            <span>Improve with AI</span>
        </button>
      </div>
      <p className="text-sm text-slate-500 mb-6">Write a 3-4 sentence summary that highlights your key skills, experience, and career goals.</p>
      <FormField 
        as="textarea"
        rows={8}
        label="Summary"
        name="summary"
        value={data.summary}
        onChange={e => onDataChange('summary', e.target.value)}
        required
      />

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

export default SummaryForm;
