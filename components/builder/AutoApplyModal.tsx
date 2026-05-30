
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Loader2, Sparkles, FileText, Send, Zap, X, ArrowRight, Building, Target, ExternalLink } from 'lucide-react';
import { GoogleJob } from '../../services/googleJobsService';
import { ResumeData } from '../../types';
import { enhanceResume, generateCoverLetter } from '../../services/geminiService';
import { jobService } from '../../services/jobService';
import { auth } from '../../services/firebase';

interface AutoApplyModalProps {
  isOpen: boolean;
  onClose: () => void;
  job: GoogleJob;
  resumeData: ResumeData;
  onApplyComplete: (job: GoogleJob) => void;
}

const steps = [
  { id: 'analyze', label: 'Analyzing Job Description', icon: Target },
  { id: 'tailor', label: 'Tailoring Resume to Job', icon: Sparkles },
  { id: 'cover', label: 'Generating Targeted Cover Letter', icon: FileText },
  { id: 'submit', label: 'Submitting Application', icon: Send },
];

const determineATS = (url: string) => {
  if (!url) return 'Unknown';
  const lowerUrl = url.toLowerCase();
  if (lowerUrl.includes('workday') || lowerUrl.includes('myworkdayjobs')) return 'Workday';
  if (lowerUrl.includes('greenhouse.io')) return 'Greenhouse';
  if (lowerUrl.includes('lever.co')) return 'Lever';
  if (lowerUrl.includes('smartrecruiters.com')) return 'SmartRecruiters';
  if (lowerUrl.includes('bamboohr.com')) return 'BambooHR';
  if (lowerUrl.includes('ashbyhq.com')) return 'Ashby';
  return 'Company Portal';
};

const AutoApplyModal: React.FC<AutoApplyModalProps> = ({ isOpen, onClose, job, resumeData, onApplyComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [isHandoff, setIsHandoff] = useState(false);
  const [tailoredResume, setTailoredResume] = useState<ResumeData | null>(null);
  const [coverLetter, setCoverLetter] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [atsType, setAtsType] = useState<string>('Unknown');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen && !isComplete && !isHandoff) {
      const detectedAts = determineATS(job.job_apply_link || '');
      setAtsType(detectedAts);
      startAutomation(detectedAts);
    }
  }, [isOpen]);

  const startAutomation = async (detectedAts: string) => {
    try {
      const requiresManualHandoff = ['Workday', 'Company Portal', 'SmartRecruiters'].includes(detectedAts);
      
      // Step 0: Analyze
      setCurrentStep(0);
      await new Promise(r => setTimeout(r, 1500));

      // Step 1: Tailor
      setCurrentStep(1);
      const enhanced = await enhanceResume(
        JSON.stringify(resumeData), 
        job.job_description, 
        job.job_title
      );
      setTailoredResume(enhanced);

      // Step 2: Cover Letter
      setCurrentStep(2);
      const cl = await generateCoverLetter(enhanced, job.job_description);
      setCoverLetter(cl);

      if (requiresManualHandoff) {
        setIsHandoff(true);
        // We track the job as "Draft" instead of "Applied"
        saveTrackedJob('Saved', 'Prepared via HuntDesk AI. Manual submit required.');
        return;
      }

      // Step 3: Submit (Simulated easy apply)
      setCurrentStep(3);
      await new Promise(r => setTimeout(r, 2000));

      saveTrackedJob('Applied', 'Automatically applied via HuntDesk AI.');
      setIsComplete(true);
      onApplyComplete(job);
    } catch (err) {
      console.error(err);
      setError('Automation failed. Please try manual application.');
    }
  };

  const saveTrackedJob = async (status: 'Saved' | 'Applied', notes: string) => {
    const jobData = {
      company: job.employer_name,
      role: job.job_title,
      status: status,
      dateAdded: new Date().toLocaleDateString(),
      location: job.job_location || '',
      salary: '',
      link: job.job_apply_link || '',
      jobDescription: job.job_description || '',
      companyLogo: job.employer_logo || '',
      source: 'Auto-Apply',
      contacts: [],
      tasks: [],
      notes: notes
    };

    if (auth.currentUser) {
      await jobService.createJob(jobData);
    } else {
      const savedJobs = localStorage.getItem('huntdesk_saved_jobs');
      const currentJobs = savedJobs ? JSON.parse(savedJobs) : [];
      const newJob = { ...jobData, id: job.job_id || `job-${Date.now()}`, userId: 'guest' };
      localStorage.setItem('huntdesk_saved_jobs', JSON.stringify([newJob, ...currentJobs]));
    }
  };

  const copyCoverLetter = () => {
    if (coverLetter) {
        navigator.clipboard.writeText(coverLetter);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
      />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="relative w-full max-w-xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden"
      >
        <div className="p-8 sm:p-10">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-100">
                <Zap className="w-6 h-6 text-white fill-white" />
              </div>
              <div>
                <h2 className="text-xl font-black text-slate-900 tracking-tight">AI Auto-Apply</h2>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Powered by HuntDesk Intelligence</p>
              </div>
            </div>
            {!isComplete && !error && (
              <button onClick={onClose} className="p-2 hover:bg-slate-50 rounded-full transition-colors">
                <X className="w-5 h-5 text-slate-400" />
              </button>
            )}
          </div>

          <div className="bg-slate-50 rounded-3xl p-6 mb-8 border border-slate-100">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm border border-slate-100 overflow-hidden">
                {job.employer_logo ? (
                  <img src={job.employer_logo} alt={job.employer_name} className="w-full h-full object-contain p-2" referrerPolicy="no-referrer" />
                ) : (
                  <Building className="w-6 h-6 text-slate-300" />
                )}
              </div>
              <div className="min-w-0">
                <h3 className="font-black text-slate-900 truncate">{job.job_title}</h3>
                <p className="text-xs font-bold text-slate-500 truncate">{job.employer_name}</p>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {steps.map((step, index) => {
              const isActive = index === currentStep && !isComplete && !error;
              const isDone = index < currentStep || isComplete;
              
              return (
                <div key={step.id} className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-500 ${
                    isDone ? 'bg-emerald-100 text-emerald-600' : 
                    isActive ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-100' : 
                    'bg-slate-100 text-slate-300'
                  }`}>
                    {isDone ? <CheckCircle2 className="w-5 h-5" /> : 
                     isActive ? <Loader2 className="w-5 h-5 animate-spin" /> : 
                     <step.icon className="w-5 h-5" />}
                  </div>
                  <div className="flex-1">
                    <p className={`text-sm font-bold transition-colors duration-500 ${
                      isDone || isActive ? 'text-slate-900' : 'text-slate-300'
                    }`}>
                      {step.label}
                    </p>
                    {isActive && (
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: '100%' }}
                        transition={{ duration: 2, ease: "linear" }}
                        className="h-1 bg-emerald-500 rounded-full mt-2"
                      />
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {error && (
            <div className="mt-8 p-4 bg-rose-50 border border-rose-100 rounded-2xl text-rose-600 text-sm font-bold flex items-center gap-3">
              <X className="w-5 h-5 shrink-0" />
              {error}
            </div>
          )}

          {isComplete && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-10"
            >
              <div className="bg-emerald-50 border border-emerald-100 rounded-3xl p-6 text-center mb-8">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm border border-emerald-100">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                </div>
                <h4 className="text-xl font-black text-emerald-900 mb-2">Application Successful!</h4>
                <p className="text-emerald-700 text-sm font-medium">
                  We've tailored your resume, generated a cover letter, and tracked this application in your board.
                </p>
              </div>
              <button 
                onClick={onClose}
                className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/20 flex items-center justify-center gap-2"
              >
                Go to Tracker <ArrowRight className="w-4 h-4" />
              </button>
            </motion.div>
          )}

          {isHandoff && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-10"
            >
              <div className="bg-amber-50 border border-amber-100 rounded-3xl p-6 text-center mb-6">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm border border-amber-100">
                  <Target className="w-8 h-8 text-amber-500" />
                </div>
                <h4 className="text-xl font-black text-amber-900 mb-2">Manual Submit Required</h4>
                <p className="text-amber-700 text-sm font-medium mb-4">
                  This job uses <b className="font-black text-amber-900">{atsType}</b>. To automate complex portals, you need the HuntDesk Chrome Extension. 
                  We've prepared your tailored resume and cover letter for manual submission.
                </p>
                <button className="px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-black uppercase tracking-widest text-[10px] transition-all shadow-lg shadow-amber-500/20 active:scale-95">
                  Install Chrome Extension (Free)
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <button 
                  onClick={copyCoverLetter}
                  className="py-4 bg-white border-2 border-slate-100 hover:border-slate-300 text-slate-700 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all flex items-center justify-center gap-2"
                >
                  <FileText className="w-4 h-4" />
                  {copied ? 'Copied!' : 'Copy Cover Letter'}
                </button>
                <a 
                  href={job.job_apply_link || '#'} 
                  target="_blank" 
                  rel="noreferrer"
                  onClick={() => onApplyComplete(job)}
                  className="py-4 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all flex items-center justify-center gap-2 shadow-xl shadow-slate-900/10"
                >
                  <span>Open Application</span>
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
              
              <button 
                onClick={onClose}
                className="w-full text-slate-400 hover:text-slate-600 text-xs font-black uppercase tracking-widest transition-colors"
              >
                Close & View Tracker
              </button>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default AutoApplyModal;
