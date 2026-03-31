
import React, { useRef, useEffect, useState, ComponentProps } from 'react';
import { useGrammarCheck } from '../hooks/useGrammarCheck';
import GrammarIndicator from './builder/GrammarIndicator';
import { useResumeContext } from './builder/ResumeContext';
import SparkleIcon from './icons/SparkleIcon';
import { AnimatePresence, motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';

type ElementType = 'p' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'span' | 'div' | 'li' | 'a';

interface EditableFieldProps<T extends ElementType> {
  as?: T;
  path: string;
  value: any;
  onChange: (path: string, value: string) => void;
  className?: string;
  placeholder?: string;
  required?: boolean;
  validation?: 'url' | 'email' | 'phone';
  enableMarkdown?: boolean;
}

const EditableField = <T extends ElementType = 'span'>({
  as,
  path,
  value,
  onChange,
  className = '',
  placeholder,
  required,
  validation,
  enableMarkdown,
  ...rest
}: EditableFieldProps<T> & Omit<ComponentProps<T>, keyof EditableFieldProps<T>>) => {
  const Component: any = as || 'span';
  const elementRef = useRef<HTMLElement>(null);
  const [currentValue, setCurrentValue] = useState(value);
  const [error, setError] = useState<string | null>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [showAiTools, setShowAiTools] = useState(false);
  
  const { onRewrite, isThinkingPath } = useResumeContext();
  const isAiEnabled = (typeof value === 'string' && value.length > 10) && (path.includes('summary') || path.includes('description'));
  const isThinking = isThinkingPath === path;

  // Only check grammar for non-short fields and regular text when focused
  const shouldCheckGrammar = !validation && (typeof value === 'string' && value.length > 15);
  const { isChecking, result, clearParams } = useGrammarCheck(typeof value === 'string' ? value : '', shouldCheckGrammar && isFocused);

  useEffect(() => {
    setCurrentValue(value);
  }, [value]);

  useEffect(() => {
    if (isFocused && elementRef.current) {
      elementRef.current.focus();
    }
  }, [isFocused]);
  
  const handleFocus = () => {
    setError(null);
    setIsFocused(true);
  };

  const handleViewClick = () => {
    setIsFocused(true);
  };

  const handleBlur = (e: React.FocusEvent) => {
    // Don't hide if moving to the AI tool buttons
    if (e.relatedTarget && (e.relatedTarget as HTMLElement).closest('.ai-tools-container')) {
        return;
    }

    setIsFocused(false);
    setShowAiTools(false);
    
    if (!elementRef.current) return;

    const newValue = elementRef.current.innerText.trim();
    let validationError: string | null = null;
    let finalValue = newValue;

    if (required && !newValue) {
        validationError = "This field cannot be empty.";
    } else if (newValue) {
        if (validation === 'email') {
            const emailPattern = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
            if (!emailPattern.test(newValue)) {
                validationError = "Please enter a valid email address.";
            }
        } else if (validation === 'url') {
            if (!/^(https?:\/\/|mailto:)/i.test(newValue)) {
                // If it doesn't have a protocol, but looks like a domain, prepend https://
                if (newValue.includes('.') && !newValue.includes(' ')) {
                    finalValue = `https://${newValue}`;
                } else {
                    validationError = "Please enter a valid URL (e.g., example.com).";
                }
            }
        } else if (validation === 'phone') {
            const phonePattern = /^(\+\d{1,2}\s?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/;
            if (!phonePattern.test(newValue)) {
                validationError = "Please enter a valid phone number format (e.g., (123) 456-7890).";
            }
        }
    }

    setError(validationError);

    if (!validationError && finalValue !== value) {
        onChange(path, finalValue);
    }
  };

  const handleInput = (e: React.FormEvent<HTMLElement>) => {
    setCurrentValue(e.currentTarget.innerText);
  };

  const handleApplyGrammar = (corrected: string) => {
      onChange(path, corrected);
      if (elementRef.current) {
          elementRef.current.innerText = corrected;
      }
      clearParams();
  };

  const handleAiAction = (mode: 'IMPACT' | 'CONCISE') => {
      if (typeof value === 'string') {
          onRewrite(path, value, path.includes('summary') ? 'summary' : 'bullet', mode);
          setShowAiTools(false);
      }
  };

  const renderContent = () => {
    if (enableMarkdown && !isFocused) {
        return (
            <Component
                className={`${className} cursor-text min-h-[1.2em]`}
                onClick={handleViewClick}
                onMouseEnter={() => isAiEnabled && !isFocused && setShowAiTools(true)}
                onMouseLeave={() => isAiEnabled && !isFocused && setShowAiTools(false)}
                {...rest}
            >
                <ReactMarkdown 
                    components={{ 
                        p: React.Fragment,
                        a: ({node, ...props}) => <a {...props} className="text-primary hover:underline" target="_blank" rel="noopener noreferrer" />,
                        ul: ({node, ...props}) => <ul {...props} className="list-disc pl-4 my-1" />,
                        ol: ({node, ...props}) => <ol {...props} className="list-decimal pl-4 my-1" />,
                        li: ({node, ...props}) => <li {...props} className="my-0.5" />
                    }}
                >
                    {value || ''}
                </ReactMarkdown>
            </Component>
        );
    }

    return (
      <Component
      ref={elementRef as any}
      contentEditable={true}
      suppressContentEditableWarning={true}
      spellCheck={true}
      onBlur={handleBlur}
      onFocus={handleFocus}
      onInput={handleInput}
      onMouseEnter={() => isAiEnabled && !isFocused && setShowAiTools(true)}
      onMouseLeave={() => isAiEnabled && !isFocused && setShowAiTools(false)}
      className={`${className} focus:outline-none rounded-sm transition-all p-0.5 -m-0.5 ${
        error
          ? 'bg-red-100/50 ring-1 ring-red-500'
          : 'focus:bg-blue-50 focus:ring-1 focus:ring-blue-300'
      } ${result ? 'decoration-amber-400 decoration-wavy underline underline-offset-2' : ''}`}
      {...rest}
      title={error || undefined}
      aria-label={`${placeholder || (path || '').split('.').pop()?.replace(/([A-Z])/g, ' $1').toLowerCase()} editable text`}
      data-placeholder={placeholder}
    >
      {value || ''}
    </Component>
    );
  };

  const isBlock = as === 'div' || as?.startsWith('h') || as === 'p' || as === 'li';
  const Wrapper: any = isBlock ? 'div' : 'span';

  return (
    <Wrapper className={`relative group/editable ${isBlock ? 'block w-full' : 'inline-block'}`}>
        {renderContent()}
        <GrammarIndicator 
            isChecking={isChecking} 
            result={result} 
            onApply={handleApplyGrammar} 
            onDismiss={clearParams} 
            className={`${isAiEnabled && (isFocused || showAiTools) ? 'top-1 right-12' : 'top-1 right-1'}`}
        />
        
        {/* AI Tools Floating Toolbar */}
        <AnimatePresence>
            {isAiEnabled && (isFocused || showAiTools || isThinking) && (
                <motion.div
                    initial={{ opacity: 0, y: 5, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 5, scale: 0.95 }}
                    transition={{ duration: 0.3, ease: 'easeOut' }}
                    className="absolute -top-9 right-0 z-50 flex items-center gap-1 bg-white rounded-full shadow-lg border border-slate-100 p-1 pr-2 ai-tools-container print-hide"
                    onMouseEnter={() => setShowAiTools(true)}
                    onMouseLeave={() => !isFocused && setShowAiTools(false)}
                    contentEditable={false}
                >
                     {isThinking ? (
                        <div className="flex items-center gap-2 px-2">
                            <svg className="animate-spin h-3.5 w-3.5 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                            <span className="text-[10px] font-medium text-slate-500">Thinking...</span>
                        </div>
                     ) : (
                         <>
                             <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary-500 to-amber-500 flex items-center justify-center shadow-sm">
                                <SparkleIcon className="w-3.5 h-3.5 text-white" />
                             </div>
                             {path.includes('summary') ? (
                                 <button 
                                    onClick={() => handleAiAction('IMPACT')}
                                    className="text-[10px] font-semibold text-slate-700 hover:text-primary hover:bg-slate-50 px-2 py-1 rounded transition-colors whitespace-nowrap"
                                    aria-label="Rewrite summary with AI"
                                 >
                                     Rewrite Summary
                                 </button>
                             ) : (
                                 <>
                                    <button 
                                        onClick={() => handleAiAction('IMPACT')}
                                        className="text-[10px] font-semibold text-slate-700 hover:text-primary hover:bg-slate-50 px-2 py-1 rounded transition-colors whitespace-nowrap"
                                        aria-label="Make impactful with AI"
                                    >
                                        Make Impactful
                                    </button>
                                    <div className="w-px h-3 bg-slate-200 mx-0.5"></div>
                                    <button 
                                        onClick={() => handleAiAction('CONCISE')}
                                        className="text-[10px] font-semibold text-slate-700 hover:text-primary hover:bg-slate-50 px-2 py-1 rounded transition-colors whitespace-nowrap"
                                        aria-label="Shorten with AI"
                                    >
                                        Shorten
                                    </button>
                                 </>
                             )}
                         </>
                     )}
                </motion.div>
            )}
        </AnimatePresence>
    </Wrapper>
  );
};

export default EditableField;
