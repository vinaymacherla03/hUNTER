
import React, { useState, useCallback, useEffect } from 'react';
import { ResumeData } from './types';
import { enhanceResume } from './services/geminiService';
import { sampleResumeData } from './components/sampleData';
import ResumeInput from './components/ResumeInput';
import LoadingSpinner from './components/LoadingSpinner';
import ErrorDisplay from './components/ErrorDisplay';
import ResumeBuilder from './components/ResumeBuilder';
import AuthModal from './components/AuthModal';
import { motion, AnimatePresence } from 'framer-motion';
import { auth, onAuthStateChanged, signOut } from './services/firebase';
import type { User } from 'firebase/auth';
import Navbar from './components/Navbar';
import LandingPage from './components/LandingPage';
import ErrorBoundary from './components/ErrorBoundary';

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

  const checkDraft = useCallback(() => {
    const savedDraft = localStorage.getItem(DRAFT_STORAGE_KEY);
    if (savedDraft) {
      setDraftExists(true);
      try {
        setDraftToLoad(JSON.parse(savedDraft));
      } catch (e) {
        console.error("Failed to parse draft", e);
        setDraftExists(false);
      }
    }
  }, []);

  useEffect(() => {
    checkDraft();
  }, [checkDraft]);

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

      const enhancedData = await enhanceResume(text, jobDesc, jobTitle);
      setResumeData(enhancedData);
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
    }
  };

  const handleStartOver = () => {
    if (window.confirm("Are you sure? This will clear your current session.")) {
      setResumeData(null);
      setJobDescription('');
      localStorage.removeItem(DRAFT_STORAGE_KEY);
      setDraftExists(false);
      setDraftToLoad(null);
      setShowLandingPage(true);
      setAppState('input');
    }
  };

  const handleTryDemo = () => {
    setResumeData(sampleResumeData);
    setShowLandingPage(false);
    setAppState('editing');
  };

  const renderContent = () => {
    if (showLandingPage) {
      return (
        <motion.div key="landing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full min-h-screen">
          <LandingPage onGetStarted={handleGetStarted} draftExists={draftExists} onLoadDraft={handleLoadDraft} onEnhance={handleEnhance} />
        </motion.div>
      );
    }

    switch (appState) {
      case 'loading':
        return <LoadingSpinner />;
      case 'error':
        return <ErrorDisplay message={error || "Something went wrong"} onRetry={() => { setShowLandingPage(false); setAppState('input'); }} onStartOver={handleStartOver} />;
      case 'editing':
        if (!resumeData) return null;
        return (
          <ResumeBuilder
            initialData={resumeData}
            initialDraft={draftToLoad}
            onStartOver={handleStartOver}
            initialJobDescription={jobDescription}
          />
        );
      case 'input':
      default:
        return (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="w-full min-h-screen bg-[#F8FAFC] flex-1 flex flex-col"
          >
            <ResumeInput
              onEnhance={handleEnhance}
              onTryDemo={handleTryDemo}
              draftExists={draftExists}
              onLoadDraft={handleLoadDraft}
            />
          </motion.div>
        );
    }
  };
  
  const isMinimalNavbar = !showLandingPage;

  return (
    <ErrorBoundary>
      <Toaster position="bottom-right" />
      <div className="min-h-screen bg-white font-sans text-slate-900 selection:bg-emerald-100 selection:text-emerald-900">
        {appState !== 'editing' && (
          <Navbar
            user={user}
            onLogout={handleLogout}
            onLogin={() => openAuth('login')}
            onSignup={() => openAuth('signup')}
            onGetStarted={handleGetStarted}
            showDashboardButton={!showLandingPage} 
            onGoToDashboard={() => { setShowLandingPage(false); setAppState('editing'); }} 
            onGoToHome={() => { setShowLandingPage(true); setAppState('input'); }}
            minimal={isMinimalNavbar}
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
