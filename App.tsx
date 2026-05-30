
import React, { useState, useCallback, useEffect } from 'react';
import { ResumeData } from './types';
import { enhanceResume, parseResume } from './services/geminiService';
import { sampleResumeData } from './components/sampleData';
import ResumeInput from './components/ResumeInput';
import ErrorDisplay from './components/ErrorDisplay';
import ResumeBuilder from './components/ResumeBuilder';
import AuthModal from './components/AuthModal';
import AuthPage from './components/AuthPage';
import { motion, AnimatePresence } from 'framer-motion';
import { auth, onAuthStateChanged, signOut } from './services/firebase';
import type { User } from 'firebase/auth';
import Navbar from './components/Navbar';
import LandingPage from './components/LandingPage';
import ErrorBoundary from './components/ErrorBoundary';
import GranularLoadingText from './components/builder/GranularLoadingText';

import { Toaster } from 'sonner';

type AppState = 'input' | 'loading' | 'editing' | 'error';

const DRAFT_STORAGE_KEY = 'aiResumeBuilderDraft';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>('input');
  const [resumeData, setResumeData] = useState<ResumeData | null>(null);
  const [draftToLoad, setDraftToLoad] = useState<any | null>(null);
  const [jobDescription, setJobDescription] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [draftExists, setDraftExists] = useState<boolean>(false);
  const [showLandingPage, setShowLandingPage] = useState<boolean>(true);

  // Auth State
  const [user, setUser] = useState<User | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isAuthPageOpen, setIsAuthPageOpen] = useState(false);
  const [authView, setAuthView] = useState<'login' | 'signup'>('login');

  useEffect(() => {
    if (auth) {
      const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
        setUser(currentUser);
      });
      return () => unsubscribe();
    }
  }, []);

  const handleLogout = async () => {
    if (auth) {
      await signOut(auth);
    }
  };

  const openAuth = (view: 'login' | 'signup') => {
    setAuthView(view);
    setIsAuthModalOpen(true);
  };

  const checkDraft = useCallback(async () => {
    // 1. Check local storage first
    let localDraftObj: any = null;
    const savedDraft = localStorage.getItem(DRAFT_STORAGE_KEY);
    const savedInputDraft = localStorage.getItem('resumeInputDraft');
    
    if (savedDraft) {
      try {
        localDraftObj = JSON.parse(savedDraft);
        setDraftExists(true);
        setDraftToLoad(localDraftObj);
      } catch (e) {
        console.error("Failed to parse draft", e);
      }
    } else if (savedInputDraft) {
      setDraftExists(true);
      setDraftToLoad(null);
    }

    // 2. If authenticated, check DB for latest draft
    if (auth?.currentUser) {
        try {
            const { versionService } = await import('./services/versionService');
            const versions = await versionService.getVersions();
            if (versions.length > 0) {
                const latestVersion = versions[0];
                // Check if the DB version is newer than the local draft (or if local draft doesn't exist)
                const dbTime = latestVersion.timestamp ? new Date(latestVersion.timestamp.toDate ? latestVersion.timestamp.toDate() : latestVersion.timestamp).getTime() : 0;
                const localTime = localDraftObj?.updatedAt ? new Date(localDraftObj.updatedAt).getTime() : 0;

                if (dbTime >= localTime || !localDraftObj) {
                    setDraftExists(true);
                    setDraftToLoad({
                        resumeData: latestVersion.resumeData,
                        jobDescription: (latestVersion as any)._jobDescription || '',
                        template: (latestVersion as any)._template || 'modern',
                        customization: (latestVersion as any)._customization || {}
                    });
                }
            }
        } catch (error) {
            console.error("Failed to sync drafts from DB:", error);
        }
    }
  }, []);

  useEffect(() => {
    checkDraft();
  }, [checkDraft, user]);

  const handleGetStarted = () => {
    setShowLandingPage(false);
    setAppState('input');
  };

  const handleEnhance = async (text: string, jobDesc: string, jobTitle: string) => {
    setShowLandingPage(false);
    setAppState('loading');
    setJobDescription(jobDesc);
    setError(null);

    try {
      if (!text || text.trim().length < 50) {
          throw new Error("Input text is too short. Please provide a more detailed resume for analysis.");
      }

      let data: ResumeData;
      if (jobDesc.trim() || jobTitle.trim()) {
          data = await enhanceResume(text, jobDesc, jobTitle);
      } else {
          data = await parseResume(text);
      }
      
      setResumeData(data);
      // Clear input draft since it's now a full draft
      localStorage.removeItem('resumeInputDraft');
      setAppState('editing');
    } catch (err: any) {
      console.error("Enhancement Error:", err);
      
      let userMessage = "Something went wrong while processing your resume.";
      let errString = '';
      try {
        errString = (err.message || JSON.stringify(err)).toLowerCase();
      } catch {
        errString = String(err).toLowerCase();
      }

      if (errString.includes("too short")) {
          userMessage = "Your resume content is a bit too short for our AI to analyze effectively. Please provide at least 50 characters of text.";
      } else if (errString.includes("429") || errString.includes("quota") || errString.includes("resource_exhausted") || errString.includes("rate limit")) {
          userMessage = "Our AI is currently handling a high volume of requests. Please wait a minute and try again.";
      } else if (errString.includes("structure") || errString.includes("json") || errString.includes("parse") || errString.includes("format")) {
          userMessage = "We had trouble reading your resume structure. Try removing complex formatting, or copy-pasting the text instead of uploading a file.";
      } else if (errString.includes("network") || errString.includes("fetch") || errString.includes("connection") || errString.includes("failed to fetch")) {
          userMessage = "We couldn't connect to our servers. Please check your internet connection and try again.";
      } else if (errString.includes("key") || errString.includes("unauthorized")) {
          userMessage = "API configuration error. Please ensure your environment variables are correctly set.";
      } else {
          userMessage = "Optimization failed. This can happen if the resume text is very messy or confusing. Try simplifying your text and trying again.";
      }

      setError(userMessage);
      setAppState('error');
    }
  };

  const handleLoadDraft = () => {
    if (draftToLoad && draftToLoad.resumeData) {
      setResumeData(draftToLoad.resumeData);
      setJobDescription(draftToLoad.jobDescription || '');
      setShowLandingPage(false);
      setAppState('editing');
    } else {
      setShowLandingPage(false);
      setAppState('input');
    }
  };

  const handleStartOver = () => {
    if (window.confirm("Are you sure? This will clear your current session.")) {
      setResumeData(null);
      setJobDescription('');
      localStorage.removeItem(DRAFT_STORAGE_KEY);
      localStorage.removeItem('resumeInputDraft');
      setDraftExists(false);
      setDraftToLoad(null);
      setShowLandingPage(true);
      setAppState('input');
    }
  };

  const handleStartFromScratch = () => {
    const emptyResume: ResumeData = {
      fullName: '',
      title: '',
      contactInfo: {
        email: '',
        phone: '',
        location: '',
        linkedin: '',
        github: ''
      },
      summary: '',
      experience: [],
      education: [],
      skills: [],
      projects: [],
      certifications: [],
      awards: []
    };
    setResumeData(emptyResume);
    setJobDescription('');
    setShowLandingPage(false);
    setAppState('editing');
  };

  const handleTryDemo = () => {
    setResumeData(sampleResumeData);
    setShowLandingPage(false);
    setAppState('editing');
  };

  const renderContent = () => {
    if (isAuthPageOpen) {
      return (
        <motion.div key="auth" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full min-h-screen">
          <AuthPage initialView={authView} onClose={() => setIsAuthPageOpen(false)} />
        </motion.div>
      );
    }

    if (showLandingPage) {
      return (
        <motion.div key="landing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full min-h-screen">
          <LandingPage onGetStarted={handleGetStarted} draftExists={draftExists} onLoadDraft={handleLoadDraft} onEnhance={handleEnhance} />
        </motion.div>
      );
    }

    switch (appState) {
      case 'loading':
        return (
          <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1, backdropFilter: "blur(20px)" }} exit={{ opacity: 0, backdropFilter: "blur(0px)" }} transition={{ duration: 0.5, ease: [0.32, 0.72, 0, 1] }} className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ duration: 0.5, ease: [0.32, 0.72, 0, 1] }}
              className="flex flex-col items-center justify-center max-w-[340px] w-full p-10 bg-white/80 backdrop-blur-3xl rounded-[32px] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.2)] border border-white/40 overflow-hidden relative"
            >
              <div className="absolute inset-0 bg-gradient-to-b from-white/60 to-transparent pointer-events-none" />
              
              <div className="relative mb-8 w-24 h-24 flex items-center justify-center">
                 <motion.div 
                   animate={{ rotate: 360 }}
                   transition={{ repeat: Infinity, duration: 10, ease: "linear" }}
                   className="absolute inset-[-50%] opacity-80 mix-blend-multiply"
                 >
                    <motion.div 
                        animate={{ scale: [1, 1.2, 1], x: [0, 10, 0] }}
                        transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                        className="absolute top-0 right-0 w-24 h-24 bg-purple-400 rounded-full blur-[20px]" 
                    />
                    <motion.div 
                        animate={{ scale: [1, 1.3, 1], y: [0, -10, 0] }}
                        transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
                        className="absolute bottom-0 right-10 w-20 h-20 bg-indigo-400 rounded-full blur-[20px]" 
                    />
                    <motion.div 
                        animate={{ scale: [1, 1.1, 1], x: [0, -10, 0] }}
                        transition={{ repeat: Infinity, duration: 3.5, ease: "easeInOut" }}
                        className="absolute top-10 left-0 w-24 h-24 bg-emerald-400 rounded-full blur-[20px]" 
                    />
                 </motion.div>
                 
                 <div className="relative z-10 w-16 h-16 bg-white/60 backdrop-blur-md rounded-full shadow-[inset_0_1px_1px_rgba(255,255,255,1),0_4px_10px_rgba(0,0,0,0.05)] border border-white/50 flex items-center justify-center">
                     <svg className="w-8 h-8 text-slate-800 animate-[spin_1s_steps(12)_infinite]" viewBox="0 0 24 24" fill="none">
                        {[...Array(12)].map((_, i) => (
                            <line 
                               key={i}
                               x1="12" y1="3" x2="12" y2="7" 
                               stroke="currentColor" 
                               strokeWidth="2.5" 
                               strokeLinecap="round" 
                               transform={`rotate(${i * 30} 12 12)`} 
                               opacity={0.1 + (i / 12) * 0.9} 
                            />
                        ))}
                     </svg>
                 </div>
              </div>
              
              <h2 className="text-[20px] font-semibold text-slate-900 mb-3 tracking-tight text-center relative z-10">Processing Resume</h2>
              
              <div className="flex flex-col items-center w-full mt-2 relative z-10">
                <GranularLoadingText 
                  messages={[
                    "Extracting work experience...",
                    "Analyzing core skills...",
                    "Evaluating impact metrics...",
                    "Structuring education history...",
                    "Reviewing formatting...",
                    "Applying industry best practices..."
                  ]}
                  intervalMs={1800}
                  className="text-[14px] font-medium text-slate-500 tracking-tight text-center"
                />
                
                <div className="w-full mt-6 h-[4px] bg-slate-200/50 rounded-full overflow-hidden relative shadow-[inset_0_1px_1px_rgba(0,0,0,0.05)]">
                  <motion.div 
                    className="absolute inset-y-0 left-0 bg-slate-800 rounded-full"
                    initial={{ width: "0%" }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 12, ease: "linear" }}
                  />
                </div>
              </div>
            </motion.div>
          </motion.div>
        );
      case 'error':
        return (
          <motion.div key="error" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.05 }} transition={{ duration: 0.3 }} className="pt-14 lg:pt-16">
            <ErrorDisplay message={error || "Something went wrong"} onRetry={() => { setShowLandingPage(false); setAppState('input'); }} onStartOver={handleStartOver} />
          </motion.div>
        );
      case 'editing':
        if (!resumeData) return null;
        return (
          <motion.div key="editing" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.4, ease: "easeOut" }} className="w-full min-h-screen flex flex-col">
            <ResumeBuilder
              initialData={resumeData}
              initialDraft={draftToLoad}
              onStartOver={handleStartOver}
              initialJobDescription={jobDescription}
            />
          </motion.div>
        );
      case 'input':
      default:
        return (
          <motion.div
            key="input"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.4, ease: "easeOut" }}
            className="w-full min-h-screen bg-[#F8FAFC] flex-1 flex flex-col pt-14 lg:pt-16"
          >
            <ResumeInput
              onEnhance={handleEnhance}
              onTryDemo={handleTryDemo}
              draftExists={draftExists}
              onLoadDraft={handleLoadDraft}
              onStartFromScratch={handleStartFromScratch}
            />
          </motion.div>
        );
    }
  };
  
  return (
    <ErrorBoundary>
      <Toaster position="bottom-right" />
      <div className="min-h-screen bg-white font-sans text-slate-900 selection:bg-emerald-100 selection:text-emerald-900">
        {appState !== 'editing' && !isAuthPageOpen && (
          <Navbar
            user={user}
            onLogout={handleLogout}
            onLogin={() => openAuth('login')}
            onSignup={() => openAuth('signup')}
            onGetStarted={handleGetStarted}
            showDashboardButton={!showLandingPage} 
            onGoToDashboard={() => { 
              setShowLandingPage(false); 
              setAppState(resumeData ? 'editing' : 'input'); 
            }} 
            onGoToHome={() => { setShowLandingPage(true); setAppState('input'); }}
            isSolid={!showLandingPage}
          />
        )}
        <AnimatePresence mode="wait">
          {renderContent()}
        </AnimatePresence>

        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          initialView={authView}
        />
      </div>
    </ErrorBoundary>
  );
};

export default App;
