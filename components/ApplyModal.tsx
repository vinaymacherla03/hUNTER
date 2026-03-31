import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle2, Loader2 } from 'lucide-react';
import { ResumeData } from '../types';
import { JSearchJob } from '../services/jsearchService';

interface ApplyModalProps {
  isOpen: boolean;
  onClose: () => void;
  job: JSearchJob;
  resumeData?: ResumeData;
}

const ApplyModal: React.FC<ApplyModalProps> = ({ isOpen, onClose, job, resumeData }) => {
  const [formData, setFormData] = useState({ 
    name: '', 
    email: '', 
    phone: '',
    resumeLink: '',
    coverLetter: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (resumeData) {
      setFormData(prev => ({
        ...prev,
        name: resumeData.fullName || '',
        email: resumeData.contactInfo?.email || '',
        phone: resumeData.contactInfo?.phone || '',
        resumeLink: resumeData.contactInfo?.portfolio || resumeData.contactInfo?.linkedin || '',
      }));
    }
  }, [resumeData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call for application submission
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    console.log('Applying for job:', job.job_title, formData);
    
    setIsSubmitting(false);
    setIsSuccess(true);
    
    setTimeout(() => {
      setIsSuccess(false);
      onClose();
    }, 2000);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white rounded-3xl p-8 w-full max-w-lg shadow-2xl relative overflow-hidden"
        >
          {isSuccess ? (
             <motion.div 
               initial={{ opacity: 0, scale: 0.8 }}
               animate={{ opacity: 1, scale: 1 }}
               className="flex flex-col items-center justify-center py-12 text-center"
             >
               <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
                 <CheckCircle2 className="w-10 h-10 text-green-600" />
               </div>
               <h3 className="text-2xl font-bold text-slate-900 mb-2">Application Sent!</h3>
               <p className="text-slate-500">Your application for {job.job_title} has been successfully submitted.</p>
             </motion.div>
          ) : (
            <>
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-1">Apply Now</h2>
                  <p className="text-sm text-slate-500 font-medium">{job.job_title} at {job.employer_name}</p>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-slate-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2 sm:col-span-1">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Full Name</label>
                    <input 
                      type="text" 
                      required 
                      value={formData.name}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all" 
                      onChange={e => setFormData({...formData, name: e.target.value})} 
                    />
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Email Address</label>
                    <input 
                      type="email" 
                      required 
                      value={formData.email}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all" 
                      onChange={e => setFormData({...formData, email: e.target.value})} 
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Phone Number</label>
                  <input 
                    type="tel" 
                    value={formData.phone}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all" 
                    onChange={e => setFormData({...formData, phone: e.target.value})} 
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Portfolio / Resume Link</label>
                  <input 
                    type="url" 
                    value={formData.resumeLink}
                    placeholder="https://"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all" 
                    onChange={e => setFormData({...formData, resumeLink: e.target.value})} 
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Cover Letter (Optional)</label>
                  <textarea 
                    rows={4}
                    value={formData.coverLetter}
                    placeholder="Why are you a good fit for this role?"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all resize-none" 
                    onChange={e => setFormData({...formData, coverLetter: e.target.value})} 
                  />
                </div>

                <div className="pt-4">
                  <button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="w-full py-4 bg-emerald-600 text-white rounded-xl font-bold tracking-wide hover:bg-emerald-700 transition-colors disabled:opacity-70 flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      'Submit Application'
                    )}
                  </button>
                  <p className="text-center text-xs text-slate-400 mt-4">
                    By applying, you agree to share your profile information with the employer.
                  </p>
                </div>
              </form>
            </>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ApplyModal;
