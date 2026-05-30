
import React, { useState } from 'react';
import { Wand2 } from 'lucide-react';
import { ResumeData } from '../../../types';
import FormField from '../FormField';
import SparkleIcon from '../../icons/SparkleIcon';
import RewriteSuggestionModal from '../RewriteSuggestionModal';
import Tooltip from '../../Tooltip';
import { generateAgentSuggestion } from '../../../services/geminiService';

interface Props {
  data: ResumeData;
  onDataChange: (path: string, value: any) => void;
  jobDescription: string;
  onSmartTailor?: () => void;
}

const SummaryForm: React.FC<Props> = ({ data, onDataChange, jobDescription, onSmartTailor }) => {
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
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-8">
        <div>
            <h1 className="text-[28px] font-black text-slate-900 tracking-tight mb-2 leading-tight">Professional Summary</h1>
            <p className="text-[15px] text-slate-500 font-medium">Write a 3-4 sentence summary that highlights your key skills and trajectory.</p>
        </div>
        <div className="flex flex-col gap-2">
            {onSmartTailor && jobDescription.trim() && (
                <Tooltip content="Automatically rewrite your professional summary to match the target job description" position="bottom">
                    <button
                        type="button"
                        onClick={onSmartTailor}
                        className="flex items-center gap-2 px-5 py-2 bg-violet-50/80 text-violet-600 rounded-xl text-[11px] font-black uppercase tracking-[0.15em] hover:bg-violet-100 transition-all border border-violet-100 shadow-[0_4px_10px_-4px_rgba(124,58,237,0.2)] active:scale-95"
                    >
                        <Wand2 className="w-4 h-4" />
                        AI Optimize
                    </button>
                </Tooltip>
            )}
            <button
                type="button"
                onClick={handleRewrite}
                disabled={isThinking}
                className="flex items-center gap-1.5 px-4 py-2 text-[11px] font-black uppercase tracking-[0.15em] rounded-xl text-emerald-700 bg-emerald-50/80 hover:bg-emerald-100 border border-emerald-100 shadow-[0_4px_10px_-4px_rgba(16,185,129,0.2)] active:scale-95 transition-all disabled:opacity-60"
            >
            {isThinking ? (
                <svg className="animate-spin h-4 w-4 text-emerald-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg>
            ) : (
                <SparkleIcon className="w-4 h-4" />
            )}
            <span>Improve</span>
        </button>
        </div>
      </div>
      
      <FormField 
        as="textarea"
        rows={8}
        hideLabel
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
