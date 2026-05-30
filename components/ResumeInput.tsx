import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UploadCloud, Wrench, Search, CheckCircle2, Eye, FileText, Loader2, AlertCircle, Wand2 } from 'lucide-react';
import { extractTextFromFile } from '../utils/fileProcessing';
import { toast } from 'sonner';
import { generateAgentSuggestion } from '../services/geminiService';

interface ResumeInputProps {
  onEnhance: (text: string, jobDesc: string, jobTitle: string) => void;
  onTryDemo: () => void;
  draftExists: boolean;
  onLoadDraft: () => void;
  onStartFromScratch?: () => void;
}

const StepIcon: React.FC<{ src: string; alt: string; fallback: any; colorClass: string }> = ({ src, alt, fallback: FallbackIcon, colorClass }) => {
  const [failed, setFailed] = React.useState(false);

  return (
    <div className={`w-12 h-12 ${colorClass} rounded-2xl flex items-center justify-center shadow-sm border border-emerald-100/50`}>
      {failed ? (
        <FallbackIcon className="w-6 h-6 text-slate-400" />
      ) : (
        <img 
          src={src} 
          alt={alt} 
          className="w-8 h-8 object-contain"
          referrerPolicy="no-referrer"
          onError={() => setFailed(true)}
        />
      )}
    </div>
  );
};

const ResumeInput: React.FC<ResumeInputProps> = ({ onEnhance, onTryDemo, draftExists, onLoadDraft, onStartFromScratch }) => {
  const [resumeText, setResumeText] = useState('');
  const [jobDesc, setJobDesc] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  
  const [step, setStep] = useState<'choose' | 'input'>('choose');
  const [startMode, setStartMode] = useState<'match' | 'scratch' | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [isRewriting, setIsRewriting] = useState(false);
  const [showSkipModal, setShowSkipModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (file: File) => {
    if (!file) return;
    
    setIsExtracting(true);
    try {
      const text = await extractTextFromFile(file);
      if (text.trim()) {
        setResumeText(text);
        toast.success(`Successfully extracted text from ${file.name}`);
        // If we were on 'choose' step and chose 'match', move to 'input'
        if (step === 'choose') {
          setStep('input');
        }
      } else {
        toast.error("Could not extract any text from the file. Please try copy-pasting.");
      }
    } catch (err: any) {
      console.error("File extraction error:", err);
      toast.error(err.message || "Failed to process file. Please try copy-pasting.");
    } finally {
      setIsExtracting(false);
    }
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = () => {
    setIsDragging(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileChange(file);
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleRewriteWithAI = async () => {
    if (!resumeText.trim()) return;
    setIsRewriting(true);
    try {
      const rewritten = await generateAgentSuggestion('REWRITE_RESUME_TEXT', { resumeText });
      setResumeText(rewritten);
      toast.success('Resume rewritten successfully');
    } catch (e: any) {
      toast.error(e.message || 'Failed to rewrite resume');
    } finally {
      setIsRewriting(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onEnhance(resumeText, jobDesc, jobTitle);
  };

  const handleNext = () => {
    if (startMode === 'match') {
      setStep('input');
    } else if (startMode === 'scratch' && onStartFromScratch) {
      onStartFromScratch();
    }
  };

  useEffect(() => {
    const draft = { resumeText, jobDesc, jobTitle };
    if (resumeText || jobDesc || jobTitle) {
      localStorage.setItem('resumeInputDraft', JSON.stringify(draft));
    }
  }, [resumeText, jobDesc, jobTitle]);

  useEffect(() => {
    const saved = localStorage.getItem('resumeInputDraft');
    if (saved && !resumeText && !jobDesc && !jobTitle) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.resumeText) setResumeText(parsed.resumeText);
        if (parsed.jobDesc) setJobDesc(parsed.jobDesc);
        if (parsed.jobTitle) setJobTitle(parsed.jobTitle);
      } catch (e) {
        console.error("Failed to restore input draft", e);
      }
    }
  }, []);

  const handleRestoreInputDraft = () => {
    const saved = localStorage.getItem('resumeInputDraft');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setResumeText(parsed.resumeText || '');
        setJobDesc(parsed.jobDesc || '');
        setJobTitle(parsed.jobTitle || '');
        if (parsed.resumeText) setStep('input');
        toast.success("Input draft restored");
      } catch (e) {
        console.error("Failed to restore input draft", e);
      }
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-slate-50 relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-100/30 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-100/20 rounded-full blur-[120px]" />
      </div>

      <div className="max-w-6xl w-full mx-auto px-6 py-12 lg:py-20 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
          
          {/* Left Side: Strategic Context */}
          <motion.div 
            className="lg:col-span-5"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <p className="text-sm font-semibold tracking-wider text-emerald-600 uppercase mb-4">
              THE TRANSFORMATION
            </p>
            <h1 className="text-4xl lg:text-7xl font-bold text-slate-900 leading-tight mb-8 font-display tracking-tight">
              Raw text to <br />
              <span className="text-emerald-600">interview ready.</span>
            </h1>
            <p className="text-xl text-slate-600 font-medium leading-relaxed mb-12">
              Our AI doesn't just format; it re-engineers your career narrative to pass ATS filters and impress recruiters.
            </p>

            <div className="space-y-8">
              {[
                { 
                  step: "01", 
                  title: "Strategic Analysis", 
                  desc: "We dissect your raw experience to find high-impact narratives.",
                  logo: (
                    <StepIcon 
                      src="https://cdn.jsdelivr.net/gh/Tarikul-Islam-Anik/Animated-Fluent-Emojis@main/Emojis/Smilies/Brain.png" 
                      alt="Strategic Analysis" 
                      fallback={Search} 
                      colorClass="bg-emerald-50" 
                    />
                  )
                },
                { 
                  step: "02", 
                  title: "ATS Optimization", 
                  desc: "Keywords are woven naturally into professional language.",
                  logo: (
                    <StepIcon 
                      src="https://cdn.jsdelivr.net/gh/Tarikul-Islam-Anik/Animated-Fluent-Emojis@main/Emojis/Travel%20and%20Places/Rocket.png" 
                      alt="ATS Optimization" 
                      fallback={CheckCircle2} 
                      colorClass="bg-emerald-50" 
                    />
                  )
                },
                { 
                  step: "03", 
                  title: "Instant Preview", 
                  desc: "See your resume take shape in real-time with beautiful templates.",
                  logo: (
                    <StepIcon 
                      src="https://cdn.jsdelivr.net/gh/Tarikul-Islam-Anik/Animated-Fluent-Emojis@main/Emojis/Objects/Magic%20Wand.png" 
                      alt="Instant Preview" 
                      fallback={Eye} 
                      colorClass="bg-rose-50" 
                    />
                  )
                }
              ].map((item, i) => (
                <div key={i} className="flex gap-6 group cursor-default">
                  <div className="flex-shrink-0 transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-3">
                    {item.logo}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 mb-1 group-hover:text-emerald-600 transition-colors font-display tracking-tight">{item.title}</h3>
                    <p className="text-sm text-slate-500 font-medium leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Right Side: Dynamic Content */}
          <motion.div 
            className="lg:col-span-7"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="bg-white p-8 lg:p-12 rounded-[2.5rem] shadow-2xl shadow-emerald-900/5 border border-emerald-100/50 min-h-[600px] flex flex-col">
              <AnimatePresence mode="wait">
                {step === 'choose' ? (
                  <motion.div 
                    key="choose"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="flex-1 flex flex-col"
                  >
                    <div className="text-center mb-10">
                      <h2 className="text-3xl font-bold text-slate-900 mb-3 font-display tracking-tight">How do you want to start?</h2>
                      <p className="text-slate-500 text-sm font-medium">We'll recommend templates based on the option you choose. You can change it anytime.</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-10 flex-1">
                      {/* Option 1: Match uploaded resume */}
                      <div className="relative group">
                        <input 
                          type="file" 
                          ref={fileInputRef}
                          onChange={(e) => e.target.files?.[0] && handleFileChange(e.target.files[0])}
                          className="hidden"
                          accept=".pdf,.docx,.txt"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setStartMode('match');
                            triggerFileSelect();
                          }}
                          onDragOver={onDragOver}
                          onDragLeave={onDragLeave}
                          onDrop={onDrop}
                          className={`w-full h-full flex flex-col items-center text-center p-8 rounded-2xl border-2 transition-all duration-200 relative ${
                            startMode === 'match' || isDragging
                              ? 'border-emerald-500 bg-emerald-50/50 shadow-md shadow-emerald-100' 
                              : 'border-slate-200 hover:border-emerald-300 hover:bg-slate-50'
                          }`}
                        >
                          {isExtracting ? (
                            <div className="flex flex-col items-center justify-center h-full">
                              <Loader2 className="w-10 h-10 text-emerald-500 animate-spin mb-4" />
                              <p className="text-sm font-bold text-emerald-600">Extracting text...</p>
                            </div>
                          ) : (
                            <>
                              <div className="w-32 h-24 bg-emerald-50 rounded-xl mb-6 flex items-center justify-center text-emerald-500 relative overflow-hidden">
                                 <UploadCloud className="w-10 h-10" />
                                 <div className="absolute top-2 right-2 w-4 h-4 bg-emerald-200 rounded-sm opacity-50 rotate-12"></div>
                                 <div className="absolute bottom-2 left-2 w-3 h-3 bg-emerald-300 rounded-full opacity-50"></div>
                              </div>
                              <h3 className="text-lg font-bold text-slate-900 mb-2">
                                {isDragging ? "Drop your resume here" : "Match my uploaded resume"}
                              </h3>
                              <p className="text-sm text-slate-500 leading-relaxed">
                                {isDragging ? "Release to start extraction" : "Drag & drop your PDF, DOCX or TXT file here."}
                              </p>
                            </>
                          )}
                        </button>
                      </div>

                      {/* Option 2: Start from scratch */}
                      <button
                        type="button"
                        onClick={() => setStartMode('scratch')}
                        className={`flex flex-col items-center text-center p-8 rounded-2xl border-2 transition-all duration-200 ${
                          startMode === 'scratch' 
                            ? 'border-emerald-500 bg-emerald-50/50 shadow-md shadow-emerald-100' 
                            : 'border-slate-200 hover:border-emerald-300 hover:bg-slate-50'
                        }`}
                      >
                        <div className="w-32 h-24 bg-emerald-50 rounded-xl mb-6 flex items-center justify-center text-emerald-500 relative overflow-hidden">
                           <Wrench className="w-10 h-10" />
                           <div className="absolute top-3 left-3 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[10px] border-b-emerald-200 rotate-45"></div>
                           <div className="absolute bottom-3 right-3 w-4 h-4 border-2 border-emerald-200 rounded-sm rotate-12"></div>
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 mb-2">Start from scratch</h3>
                        <p className="text-sm text-slate-500 leading-relaxed">Choose a template based on your desired occupation and style.</p>
                      </button>
                    </div>

                    <div className="flex justify-between items-center mt-auto pt-6 border-t border-slate-100">
                      <button 
                        type="button"
                        onClick={() => setShowSkipModal(true)}
                        className="text-sm font-bold text-slate-500 hover:text-emerald-600 transition-colors underline underline-offset-4"
                      >
                        Skip for now
                      </button>
                      <button
                        type="button"
                        onClick={handleNext}
                        disabled={!startMode}
                        className="px-8 py-3 bg-slate-900 text-white font-bold rounded-full hover:bg-slate-800 focus:outline-none focus:ring-4 focus:ring-slate-900/20 transition-all disabled:opacity-50 disabled:pointer-events-none active:scale-95 shadow-lg shadow-slate-900/10"
                      >
                        Next
                      </button>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div 
                    key="input"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="flex-1 flex flex-col"
                  >
                      <div className="flex items-center mb-8">
                        <button 
                          onClick={() => setStep('choose')}
                          className="p-2 -ml-2 text-slate-400 hover:text-slate-600 transition-colors rounded-full hover:bg-slate-100 mr-2 active:scale-90"
                        >
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                        </button>
                        <h2 className="text-2xl font-bold text-slate-900 font-display tracking-tight">Upload Resume Content</h2>
                      </div>

                    <form onSubmit={handleSubmit} className="space-y-8 flex-1 flex flex-col">
                      <div className="space-y-3">
                        <label className="text-xs font-bold uppercase tracking-widest text-slate-400 ml-1">Target Job Title</label>
                        <input
                          type="text"
                          value={jobTitle}
                          onChange={(e) => setJobTitle(e.target.value)}
                          className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all font-bold text-slate-900 placeholder:text-slate-300 text-lg"
                          placeholder="e.g. Software Engineer"
                        />
                      </div>
                      
                      <div className="space-y-3 flex-1 flex flex-col">
                        <div className="flex justify-between items-end ml-1">
                          <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Current Resume Content</label>
                          <div className="flex gap-2 items-center">
                            {resumeText && (
                              <button
                                type="button"
                                onClick={handleRewriteWithAI}
                                disabled={isRewriting}
                                className="flex items-center gap-1.5 px-3 py-1 bg-violet-50 text-violet-600 border border-violet-200 rounded-lg text-[10px] font-bold uppercase hover:bg-violet-100 transition-colors disabled:opacity-50"
                              >
                                {isRewriting ? <Loader2 className="w-3 h-3 animate-spin"/> : <Wand2 className="w-3 h-3"/>}
                                {isRewriting ? 'Rewriting...' : 'AI Rewrite'}
                              </button>
                            )}
                            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">RAW INPUT</span>
                          </div>
                        </div>
                        <div 
                          className={`relative flex-1 flex flex-col transition-all duration-300 ${isDragging ? 'scale-[1.01]' : ''}`}
                          onDragOver={onDragOver}
                          onDragLeave={onDragLeave}
                          onDrop={onDrop}
                        >
                          {!resumeText.trim() && !isExtracting && (
                            <div className={`absolute inset-0 z-10 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center p-8 transition-colors ${isDragging ? 'border-emerald-500 bg-emerald-50' : 'border-slate-300 bg-slate-50'}`}>
                              <UploadCloud className={`w-12 h-12 mb-4 transition-colors ${isDragging ? 'text-emerald-500' : 'text-slate-400'}`} />
                              <p className="text-slate-600 font-bold mb-4">
                                {isDragging ? "Drop your resume now" : "Drag & drop your resume file"}
                              </p>
                              <button
                                type="button"
                                onClick={triggerFileSelect}
                                className="px-6 py-2.5 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl hover:border-emerald-300 hover:text-emerald-600 transition-all shadow-sm active:scale-95"
                              >
                                Or browse files
                              </button>
                            </div>
                          )}

                          <textarea
                            value={resumeText}
                            onChange={(e) => setResumeText(e.target.value)}
                            className={`w-full px-6 py-4 bg-white border-2 rounded-2xl flex-1 min-h-[150px] focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all font-medium text-slate-900 placeholder:text-slate-300 resize-none leading-relaxed ${
                              isDragging ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200'
                            }`}
                            placeholder="Paste your existing resume text here..."
                            required
                          />
                          
                          {isDragging && (
                            <div className="absolute inset-0 bg-emerald-500/10 backdrop-blur-[2px] rounded-2xl border-2 border-dashed border-emerald-500 flex flex-col items-center justify-center pointer-events-none z-40">
                              <UploadCloud className="w-12 h-12 text-emerald-600 mb-2 animate-bounce" />
                              <p className="text-emerald-700 font-bold">Drop to upload resume</p>
                            </div>
                          )}

                          {isExtracting && (
                            <div className="absolute inset-0 bg-white/90 backdrop-blur-sm rounded-2xl flex flex-col items-center justify-center z-50">
                              <Loader2 className="w-10 h-10 text-emerald-500 animate-spin mb-4" />
                              <p className="text-slate-900 font-bold">Extracting resume content...</p>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="space-y-3">
                        <label className="text-xs font-bold uppercase tracking-widest text-slate-400 ml-1">Target Job Description (Optional)</label>
                        <textarea
                          value={jobDesc}
                          onChange={(e) => setJobDesc(e.target.value)}
                          className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-2xl h-24 focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all font-medium text-slate-900 placeholder:text-slate-300 resize-none leading-relaxed"
                          placeholder="Paste the job description to tailor your narrative..."
                        />
                      </div>

                      <div className="flex flex-col sm:flex-row gap-4 pt-2">
                        <button
                          type="submit"
                          className="flex-1 px-8 py-4 bg-emerald-500 text-white font-bold text-lg rounded-full hover:bg-emerald-600 focus:outline-none focus:ring-4 focus:ring-emerald-500/50 transition-all shadow-xl shadow-emerald-500/20 active:scale-95 disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-3 group"
                          disabled={!resumeText.trim()}
                        >
                          Start Transformation
                          <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 9l3 3m0 0l-3 3m3-3H8m13 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </button>
                        
                        {draftExists && (
                          <button
                            type="button"
                            onClick={onLoadDraft}
                            className="px-8 py-4 bg-emerald-600 text-white rounded-full font-bold hover:bg-emerald-700 focus:outline-none focus:ring-4 focus:ring-emerald-600/50 transition-all active:scale-95 shadow-xl shadow-emerald-600/20"
                          >
                            Load Draft
                          </button>
                        )}
                      </div>
                    </form>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Skip Confirmation Modal */}
      <AnimatePresence>
        {showSkipModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
              onClick={() => setShowSkipModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative z-10 w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden p-8"
            >
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <AlertCircle className="w-8 h-8 text-emerald-500" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-3">Wait, are you sure?</h3>
                <p className="text-slate-500 leading-relaxed">
                  Skipping input will take you to a generic demo. To get the best results, we recommend providing your resume content.
                </p>
                {draftExists && (
                  <div className="mt-4 p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                    <p className="text-sm text-emerald-700 font-medium">
                      💡 We found a saved draft from your previous session. Would you like to load it instead?
                    </p>
                  </div>
                )}
              </div>

              <div className="space-y-3">
                {draftExists && (
                  <button
                    onClick={() => {
                      onLoadDraft();
                      setShowSkipModal(false);
                    }}
                    className="w-full py-4 bg-emerald-500 text-white font-bold rounded-2xl hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/20 active:scale-[0.98]"
                  >
                    Load Saved Draft
                  </button>
                )}
                <button
                  onClick={() => {
                    onTryDemo();
                    setShowSkipModal(false);
                  }}
                  className={`w-full py-4 font-bold rounded-2xl transition-all active:scale-[0.98] ${
                    draftExists 
                      ? 'bg-slate-100 text-slate-600 hover:bg-slate-200' 
                      : 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-lg shadow-emerald-500/20'
                  }`}
                >
                  {draftExists ? 'Skip to Demo anyway' : 'Yes, Skip to Demo'}
                </button>
                <button
                  onClick={() => setShowSkipModal(false)}
                  className="w-full py-4 text-slate-400 font-bold hover:text-slate-600 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ResumeInput;
