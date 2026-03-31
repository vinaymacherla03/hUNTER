import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface ResumeInputProps {
  onEnhance: (text: string, jobDesc: string, jobTitle: string) => void;
  onTryDemo: () => void;
  draftExists: boolean;
  onLoadDraft: () => void;
}

const ResumeInput: React.FC<ResumeInputProps> = ({ onEnhance, onTryDemo, draftExists, onLoadDraft }) => {
  const [resumeText, setResumeText] = useState('');
  const [jobDesc, setJobDesc] = useState('');
  const [jobTitle, setJobTitle] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onEnhance(resumeText, jobDesc, jobTitle);
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen pt-24 bg-slate-50 relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-100/30 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-teal-100/20 rounded-full blur-[120px]" />
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
            <h1 className="text-4xl lg:text-7xl font-bold text-slate-900 leading-tight mb-8">
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
                    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <rect width="40" height="40" rx="12" fill="#D1FAE5"/>
                      <path d="M20 12C15.5817 12 12 15.5817 12 20C12 24.4183 15.5817 28 20 28C24.4183 28 28 24.4183 28 20C28 15.5817 24.4183 12 20 12Z" stroke="#059669" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M20 16V20L23 23" stroke="#059669" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )
                },
                { 
                  step: "02", 
                  title: "ATS Optimization", 
                  desc: "Keywords are woven naturally into professional language.",
                  logo: (
                    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <rect width="40" height="40" rx="12" fill="#E0E7FF"/>
                      <path d="M14 20L18 24L26 16" stroke="#4F46E5" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M12 28H28" stroke="#4F46E5" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )
                },
                { 
                  step: "03", 
                  title: "Instant Preview", 
                  desc: "See your resume take shape in real-time with beautiful templates.",
                  logo: (
                    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <rect width="40" height="40" rx="12" fill="#FCE7F3"/>
                      <path d="M14 14H26V26H14V14Z" stroke="#DB2777" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M18 18L22 22M22 18L18 22" stroke="#DB2777" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )
                }
              ].map((item, i) => (
                <div key={i} className="flex gap-6 group cursor-default">
                  <div className="flex-shrink-0 transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-3">
                    {item.logo}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 mb-1 group-hover:text-emerald-600 transition-colors">{item.title}</h3>
                    <p className="text-sm text-slate-500 font-medium leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Right Side: The Command Center (Form) */}
          <motion.div 
            className="lg:col-span-7"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="bg-white p-8 lg:p-12 rounded-[2.5rem] shadow-2xl shadow-emerald-900/5 border border-emerald-100/50">
              <form onSubmit={handleSubmit} className="space-y-10">
                <div className="space-y-3">
                  <label className="text-xs font-bold uppercase tracking-widest text-slate-400 ml-1">Target Job Title</label>
                  <input
                    type="text"
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    className="w-full px-6 py-5 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-emerald-500 outline-none transition-all font-bold text-slate-900 placeholder:text-slate-300 text-lg"
                    placeholder="e.g. Software Engineer"
                  />
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-end ml-1">
                    <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Current Resume Content</label>
                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">RAW INPUT</span>
                  </div>
                  <textarea
                    value={resumeText}
                    onChange={(e) => setResumeText(e.target.value)}
                    className="w-full px-6 py-5 bg-slate-50 border-2 border-transparent rounded-2xl h-56 focus:bg-white focus:border-emerald-500 outline-none transition-all font-medium text-slate-900 placeholder:text-slate-300 resize-none leading-relaxed"
                    placeholder="Paste your existing resume text here..."
                    required
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-xs font-bold uppercase tracking-widest text-slate-400 ml-1">Target Job Description (Optional)</label>
                  <textarea
                    value={jobDesc}
                    onChange={(e) => setJobDesc(e.target.value)}
                    className="w-full px-6 py-5 bg-slate-50 border-2 border-transparent rounded-2xl h-32 focus:bg-white focus:border-emerald-500 outline-none transition-all font-medium text-slate-900 placeholder:text-slate-300 resize-none leading-relaxed"
                    placeholder="Paste the job description to tailor your narrative..."
                  />
                </div>

                <div className="flex flex-col sm:flex-row gap-6 pt-4">
                  <button
                    type="submit"
                    className="flex-1 px-10 py-5 bg-emerald-500 text-white font-bold text-lg rounded-full hover:bg-emerald-600 transition-all shadow-xl shadow-emerald-500/20 active:scale-95 disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-4 group"
                    disabled={!resumeText.trim()}
                  >
                    Start Transformation
                    <svg className="w-6 h-6 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 9l3 3m0 0l-3 3m3-3H8m13 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </button>
                  
                  <div className="flex gap-4">
                    <button
                      type="button"
                      onClick={onTryDemo}
                      className="px-8 py-5 bg-white text-slate-700 border-2 border-slate-200 rounded-full font-bold hover:bg-slate-50 hover:border-slate-300 transition-all active:scale-95"
                    >
                      Try Demo
                    </button>
                    {draftExists && (
                      <button
                        type="button"
                        onClick={onLoadDraft}
                        className="px-8 py-5 bg-teal-600 text-white rounded-full font-bold hover:bg-teal-700 transition-all active:scale-95 shadow-xl shadow-teal-600/20"
                      >
                        Load Draft
                      </button>
                    )}
                  </div>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ResumeInput;
