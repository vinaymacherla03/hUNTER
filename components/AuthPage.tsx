
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { auth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, setPersistence, browserLocalPersistence, browserSessionPersistence } from '../services/firebase';
import { Eye, EyeOff, AlertCircle, CheckCircle2, ChevronDown } from 'lucide-react';

interface AuthPageProps {
    initialView?: 'login' | 'signup';
    onClose: () => void;
}

const AuthPage: React.FC<AuthPageProps> = ({ initialView = 'signup', onClose }) => {
    const [view, setView] = useState<'login' | 'signup'>(initialView);
    const [email, setEmail] = useState('');
    const [fullName, setFullName] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [emailError, setEmailError] = useState<string | null>(null);
    const [passwordError, setPasswordError] = useState<string | null>(null);
    const [nameError, setNameError] = useState<string | null>(null);

    const validateEmail = (email: string) => {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email) return 'Email is required.';
        if (!re.test(email)) return 'Please enter a valid email address.';
        return null;
    };

    const validatePassword = (password: string) => {
        if (!password) return 'Password is required.';
        if (password.length < 8) return 'Password must be at least 8 characters long.';
        return null;
    };

    const validateName = (name: string) => {
        if (!name.trim()) return 'Full name is required.';
        return null;
    };

    const formatError = (code: string) => {
        switch (code) {
            case 'auth/invalid-email':
                return 'Please enter a valid email address.';
            case 'auth/user-disabled':
                return 'This account has been disabled.';
            case 'auth/user-not-found':
            case 'auth/wrong-password':
            case 'auth/invalid-credential':
                return 'Invalid email or password.';
            case 'auth/email-already-in-use':
                return 'An account with this email already exists.';
            case 'auth/weak-password':
                return 'Password should be at least 6 characters.';
            case 'auth/popup-closed-by-user':
                return 'Sign-in was cancelled.';
            case 'auth/network-request-failed':
                return 'Network error. Please check your connection.';
            default:
                return 'An unexpected error occurred. Please try again.';
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const eErr = validateEmail(email);
        const pErr = validatePassword(password);
        let nErr = null;

        if (view === 'signup') {
            nErr = validateName(fullName);
        }

        setEmailError(eErr);
        setPasswordError(pErr);
        setNameError(nErr);

        if (eErr || pErr || nErr) return;

        setLoading(true);
        setError(null);
        try {
            await setPersistence(auth, browserLocalPersistence);
            if (view === 'signup') {
                await createUserWithEmailAndPassword(auth, email, password);
                // In a real app, you'd update the profile with fullName here
            } else {
                await signInWithEmailAndPassword(auth, email, password);
            }
            onClose();
        } catch (err: any) {
            setError(formatError(err.code));
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSignIn = async () => {
        setLoading(true);
        setError(null);
        setEmailError(null);
        setPasswordError(null);
        setNameError(null);
        try {
            await setPersistence(auth, browserLocalPersistence);
            const provider = new GoogleAuthProvider();
            await signInWithPopup(auth, provider);
            onClose();
        } catch (err: any) {
            setError(formatError(err.code));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans selection:bg-yellow-100 selection:text-yellow-900">
            {/* Header */}
            <header className="bg-[#1A1A1A] text-white py-3 px-6 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-8">
                        <div className="flex items-center cursor-pointer group" onClick={onClose}>
                            <div className="bg-white text-black w-8 h-8 rounded flex items-center justify-center font-black text-xl mr-1 group-hover:bg-yellow-400 transition-colors">1</div>
                            <span className="text-2xl font-black tracking-tighter">MillionResume</span>
                        </div>
                        <nav className="hidden lg:flex items-center gap-6">
                            {['Resume', 'Resume Services', 'Cover Letter', 'Blog', 'Free Tools'].map((item) => (
                                <button key={item} className="text-sm font-medium hover:text-yellow-400 transition-colors flex items-center gap-1">
                                    {item}
                                    <ChevronDown className="w-3 h-3 opacity-50" />
                                </button>
                            ))}
                        </nav>
                    </div>
                    <div className="flex items-center gap-3">
                        <button 
                            onClick={() => setView('login')}
                            className="px-4 py-1.5 rounded-md text-sm font-bold border border-white text-white hover:bg-white/10 transition-all"
                        >
                            Login
                        </button>
                        <button 
                            onClick={() => setView('signup')}
                            className="px-4 py-1.5 rounded-md text-sm font-bold bg-[#FFC107] text-black hover:bg-[#FFB300] transition-all"
                        >
                            Sign up
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 flex items-center justify-center p-6 lg:p-12">
                <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-center">
                    
                    {/* Left Column: Auth Card */}
                    <motion.div 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 p-8 lg:p-12"
                    >
                        <h1 className="text-3xl font-black text-slate-900 mb-8">
                            {view === 'signup' ? 'Sign up' : 'Login'}
                        </h1>

                        <button 
                            onClick={handleGoogleSignIn}
                            className="w-full py-3.5 bg-[#E53935] hover:bg-[#D32F2F] text-white rounded-lg font-bold flex items-center justify-center gap-3 transition-all shadow-lg shadow-red-500/20 active:scale-[0.98]"
                        >
                            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                                <path d="M12.48 10.92v3.28h4.74c-.2 1.06-.9 1.96-1.9 2.59v2.12h3.07c1.8-1.66 2.83-4.11 2.83-7.01 0-.6-.06-1.17-.16-1.71h-8.68z" />
                                <path d="M12.48 21c2.43 0 4.47-.81 5.96-2.18l-3.07-2.12c-.83.56-1.89.89-2.89.89-2.24 0-4.14-1.51-4.82-3.54H4.54v2.24C6.02 19.3 9.04 21 12.48 21z" />
                                <path d="M7.66 14.05c-.17-.51-.27-1.06-.27-1.63s.1-1.12.27-1.63V8.55H4.54c-.59 1.17-.93 2.5-.93 3.87s.34 2.7 1.01 3.87l3.04-2.24z" />
                                <path d="M12.48 7.37c1.32 0 2.51.45 3.44 1.35l2.58-2.58C16.95 4.6 14.91 3.75 12.48 3.75c-3.44 0-6.46 1.7-7.94 4.8l3.12 2.37c.68-2.03 2.58-3.55 4.82-3.55z" />
                            </svg>
                            {view === 'signup' ? 'Sign up with Google' : 'Login with Google'}
                        </button>

                        <div className="relative my-8 text-center">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-slate-100"></div>
                            </div>
                            <span className="relative px-4 bg-white text-xs font-bold text-slate-400 uppercase tracking-widest">
                                or with email
                            </span>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            {view === 'signup' && (
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-600 ml-1">Full Name<span className="text-red-500">*</span></label>
                                    <input 
                                        type="text" required value={fullName} onChange={(e) => {
                                            setFullName(e.target.value);
                                            if (nameError) setNameError(null);
                                        }}
                                        className={`w-full px-4 py-3.5 rounded-xl border ${nameError ? 'border-red-500 bg-red-50/50 outline-none' : 'border-slate-200'} focus:ring-2 focus:ring-yellow-400 focus:border-transparent outline-none text-sm transition-all`}
                                        placeholder="Enter your full name"
                                    />
                                    {nameError && (
                                        <motion.p 
                                            initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }}
                                            className="text-[10px] font-bold text-red-500 ml-1"
                                        >
                                            {nameError}
                                        </motion.p>
                                    )}
                                </div>
                            )}
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-600 ml-1">Resume Email Id<span className="text-red-500">*</span></label>
                                <input 
                                    type="email" required value={email} onChange={(e) => {
                                        setEmail(e.target.value);
                                        if (emailError) setEmailError(null);
                                    }}
                                    className={`w-full px-4 py-3.5 rounded-xl border ${emailError ? 'border-red-500 bg-red-50/50 outline-none' : 'border-slate-200'} focus:ring-2 focus:ring-yellow-400 focus:border-transparent outline-none text-sm transition-all`}
                                    placeholder="Enter your email"
                                />
                                {emailError && (
                                    <motion.p 
                                        initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }}
                                        className="text-[10px] font-bold text-red-500 ml-1"
                                    >
                                        {emailError}
                                    </motion.p>
                                )}
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-600 ml-1">Password<span className="text-red-500">*</span></label>
                                <div className="relative">
                                    <input 
                                        type={showPassword ? "text" : "password"} required value={password} onChange={(e) => {
                                            setPassword(e.target.value);
                                            if (passwordError) setPasswordError(null);
                                        }}
                                        className={`w-full px-4 py-3.5 rounded-xl border ${passwordError ? 'border-red-500 bg-red-50/50 outline-none' : 'border-slate-200'} focus:ring-2 focus:ring-yellow-400 focus:border-transparent outline-none text-sm transition-all pr-12`}
                                        placeholder="••••••••"
                                    />
                                    <button 
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-slate-400 hover:text-slate-600 transition-colors"
                                    >
                                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                                {passwordError && (
                                    <motion.p 
                                        initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }}
                                        className="text-[10px] font-bold text-red-500 ml-1"
                                    >
                                        {passwordError}
                                    </motion.p>
                                )}
                            </div>

                            {/* Turnstile Placeholder */}
                            <div className="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between shadow-sm">
                                <div className="flex items-center gap-3">
                                    <div className="w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center">
                                        <CheckCircle2 className="w-3 h-3 text-white" />
                                    </div>
                                    <span className="text-sm font-bold text-slate-700">Success!</span>
                                </div>
                                <div className="flex flex-col items-end leading-none">
                                    <div className="flex items-center gap-1">
                                        <span className="text-[7px] font-black text-slate-400 uppercase tracking-widest">Cloudflare</span>
                                        <div className="w-3 h-3 bg-[#F38020] rounded-sm flex items-center justify-center">
                                            <div className="w-1 h-1 bg-white rounded-full" />
                                        </div>
                                    </div>
                                    <div className="flex gap-1 text-[7px] text-slate-400 mt-1">
                                        <span className="hover:underline cursor-pointer">Privacy</span>
                                        <span>•</span>
                                        <span className="hover:underline cursor-pointer">Terms</span>
                                    </div>
                                </div>
                            </div>

                            {error && (
                                <motion.div 
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="flex items-start gap-2 p-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-xs font-bold"
                                >
                                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                                    <span>{error}</span>
                                </motion.div>
                            )}

                            <button 
                                type="submit" 
                                disabled={loading} 
                                className="w-full py-4 bg-[#FFC107] hover:bg-[#FFB300] text-black font-black rounded-xl transition-all shadow-xl shadow-yellow-500/20 active:scale-[0.98] disabled:opacity-50 uppercase tracking-widest text-xs"
                            >
                                {loading ? 'Processing...' : (view === 'signup' ? 'Sign up' : 'Login')}
                            </button>

                            <p className="text-[10px] text-slate-400 text-center font-medium">
                                By clicking {view === 'signup' ? 'Sign up' : 'Login'}, you agree to the <span className="text-slate-600 underline cursor-pointer">terms of use</span>.
                            </p>
                        </form>

                        <div className="mt-8 pt-8 border-t border-slate-100 text-center">
                            <button 
                                onClick={() => setView(view === 'login' ? 'signup' : 'login')}
                                className="text-sm font-bold text-[#4285F4] hover:underline"
                            >
                                {view === 'login' ? 'New User? Create Account' : 'Existing User? Login'}
                            </button>
                        </div>
                    </motion.div>

                    {/* Right Column: Value Prop */}
                    <motion.div 
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="hidden lg:block space-y-10"
                    >
                        <h2 className="text-5xl font-black text-slate-900 leading-[1.1] tracking-tight">
                            Join <span className="text-[#4285F4]">173,000+</span> Job Seekers that Trust 1MillionResume to Supercharge their Resume
                        </h2>

                        <div className="space-y-6">
                            {[
                                '11+ Professional Templates',
                                'Resume Checker Pro (The Best)',
                                'Pass ATS Screening by Targeting Keywords with AI'
                            ].map((item) => (
                                <div key={item} className="flex items-center gap-4">
                                    <div className="w-6 h-6 rounded-full border-2 border-emerald-500 flex items-center justify-center shrink-0">
                                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                                    </div>
                                    <span className="text-lg font-bold text-slate-700">{item}</span>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </main>
        </div>
    );
};

export default AuthPage;
