
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGrammarCheck } from '../../hooks/useGrammarCheck';
import GrammarIndicator from './GrammarIndicator';

interface FormFieldProps {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  placeholder?: string;
  type?: 'text' | 'email' | 'tel' | 'url';
  as?: 'input' | 'textarea';
  rows?: number;
  required?: boolean;
  validation?: 'url' | 'email' | 'phone';
  tip?: string;
  hideLabel?: boolean;
  compact?: boolean;
}

const FormField: React.FC<FormFieldProps> = ({
  label,
  name,
  value,
  onChange,
  placeholder = '',
  type = 'text',
  as = 'input',
  rows = 3,
  required = false,
  validation,
  tip,
  hideLabel = false,
  compact = false
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const shouldCheckGrammar = (as === 'textarea' || type === 'text') && !name.includes('name') && !name.includes('email') && !name.includes('link') && !name.includes('date');
  
  const { isChecking, result, clearParams, checkGrammar } = useGrammarCheck(value, shouldCheckGrammar && isFocused);

  const handleBlur = () => {
    setIsFocused(false);
    let validationError: string | null = null;
    const trimmedValue = (value || '').trim();

    if (required && !trimmedValue) {
        validationError = "This field is required.";
    } else if (trimmedValue) {
        if (validation === 'email') {
            const emailPattern = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
            if (!emailPattern.test(trimmedValue)) {
                validationError = "Please enter a valid email address.";
            }
        } else if (validation === 'url') {
            if (!/^(https?:\/\/|mailto:)/i.test(trimmedValue) && !(!trimmedValue.startsWith('http') && trimmedValue.includes('.') && !trimmedValue.includes(' '))) {
                validationError = "Please enter a valid URL.";
            }
        } else if (validation === 'phone') {
            const phonePattern = /^(\+\d{1,2}\s?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/;
            if (!phonePattern.test(trimmedValue)) {
                validationError = "Please enter a valid phone number.";
            }
        }
    }
    setError(validationError);
  };
  
  const handleFocus = () => {
      setIsFocused(true);
      setError(null);
  };

  const handleChangeAndClearError = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      if (error) {
          setError(null);
      }
      onChange(e);
  };

  const handleApplyCorrection = (corrected: string) => {
    const event = {
      target: { name, value: corrected }
    } as React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>;
    onChange(event);
    clearParams();
  };

  const isValid = (value || '').trim().length > 0 && !error;

  const baseClasses = compact 
    ? "block w-full text-[13px] px-3 py-2.5 border rounded-lg shadow-sm outline-none transition-all duration-200 bg-white text-slate-900 placeholder:text-slate-400 font-medium"
    : "block w-full text-[14px] px-4 py-3 border rounded-xl shadow-[0_1px_2px_rgba(0,0,0,0.04)] outline-none transition-all duration-200 bg-white text-slate-900 placeholder:text-slate-400 font-medium";
  
  const stateClasses = error 
    ? "border-rose-400 ring-2 ring-rose-500/20"
    : result && result.issues.length > 0
    ? "border-amber-400 ring-2 ring-amber-500/20"
    : isFocused 
    ? "border-slate-400 ring-4 ring-slate-100 shadow-[0_0_10px_rgba(0,0,0,0.02)]"
    : "border-slate-200 hover:border-slate-300";

  const commonProps = {
    id: name,
    name,
    value,
    onChange: handleChangeAndClearError,
    onFocus: handleFocus,
    onBlur: handleBlur,
    placeholder,
    required,
    spellCheck: true,
    className: `${baseClasses} ${stateClasses} ${isValid || (result && result.issues.length > 0) ? 'pr-10' : ''}`,
  };

  return (
    <div className={`${compact ? 'mb-3' : 'mb-5'} group`}>
      {!hideLabel && (
        <div className="flex justify-between items-center mb-1.5 px-0.5">
          <label htmlFor={name} className="text-[13px] font-bold text-slate-700 transition-colors">
              {label}
              {required && <span className="text-rose-500 ml-1 font-black">*</span>}
          </label>
          {tip && !error && (
              <div className="relative">
                   <div className="group/tip flex items-center justify-center w-4 h-4 rounded-full bg-slate-100 hover:bg-slate-200 transition-colors cursor-help">
                      <span className="text-[10px] font-bold text-slate-500">i</span>
                      <div className="absolute bottom-full right-0 mb-2 w-56 p-2.5 bg-slate-800 text-white text-[11px] font-medium leading-relaxed rounded-xl opacity-0 pointer-events-none group-hover/tip:opacity-100 transition-opacity z-10 shadow-xl">
                          {tip}
                          <div className="absolute top-full right-1.5 -mt-1 border-4 border-transparent border-t-slate-800"></div>
                      </div>
                  </div>
              </div>
          )}
        </div>
      )}
      
      <div className="relative">
          {as === 'textarea' ? (
            <textarea {...commonProps} rows={rows} className={`${commonProps.className} resize-none`} />
          ) : (
            <input {...commonProps} type={type} />
          )}
          
          {isValid && !isFocused && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-500">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                      <path fillRule="evenodd" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" clipRule="evenodd" />
                  </svg>
              </div>
          )}

          {shouldCheckGrammar && (
             <div className="absolute top-3 right-3 flex items-center gap-2">
                <GrammarIndicator 
                    isChecking={isChecking} 
                    isFocused={isFocused}
                    result={result} 
                    onApply={handleApplyCorrection} 
                    onDismiss={clearParams} 
                />
             </div>
          )}
      </div>
      
      <AnimatePresence>
        {error && (
            <motion.p 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="text-[11px] font-bold text-rose-500 mt-1.5 pl-1"
            >
                {error}
            </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FormField;
