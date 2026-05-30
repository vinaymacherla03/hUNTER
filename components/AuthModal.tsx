
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { auth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, setPersistence, browserLocalPersistence, browserSessionPersistence } from '../services/firebase';
import { Eye, EyeOff, AlertCircle, X } from 'lucide-react';
import PremiumButton from './builder/PremiumButton';

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialView?: 'login' | 'signup';
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, initialView = 'login' }) => {
    const [view, setView] = useState<'login' | 'signup'>(initialView);

    useEffect(() => {
        if (isOpen) {
            setView(initialView);
            setError(null);
        }
    }, [isOpen, initialView]);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [emailError, setEmailError] = useState<string | null>(null);
    const [passwordError, setPasswordError] = useState<string | null>(null);

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
        
        setEmailError(eErr);
        setPasswordError(pErr);
        
        if (eErr || pErr) return;

        setLoading(true);
        setError(null);
        try {
            await setPersistence(auth, rememberMe ? browserLocalPersistence : browserSessionPersistence);
            if (view === 'signup') {
                await createUserWithEmailAndPassword(auth, email, password);
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
        try {
            await setPersistence(auth, rememberMe ? browserLocalPersistence : browserSessionPersistence);
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
        <AnimatePresence>
            {isOpen && (
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center p-4" 
                    role="dialog"
                >
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                        onClick={onClose}
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative z-10 w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden"
                    >
                        <div className="p-8 relative">
                            <button 
                                onClick={onClose}
                                className="absolute right-4 top-4 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-all"
                            >
                                <X className="w-5 h-5" />
                            </button>
                            <div className="text-center mb-8">
                                <h2 className="text-3xl font-black text-slate-900 mb-2 font-display tracking-tight">{view === 'login' ? 'Welcome back' : 'Create account'}</h2>
                                <p className="text-sm text-slate-500 font-medium">Access your career command center.</p>
                            </div>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">Email</label>
                                    <input 
                                        type="email" 
                                        value={email} 
                                        onChange={(e) => {
                                            setEmail(e.target.value);
                                            if (emailError) setEmailError(null);
                                        }}
                                        className={`w-full px-4 py-3.5 rounded-2xl border ${emailError ? 'border-red-500 bg-red-50/50 shadow-[0_0_15px_rgba(239,68,68,0.1)]' : 'border-slate-200 bg-slate-50/50'} focus:ring-4 focus:ring-slate-900/5 focus:border-slate-900 focus:bg-white outline-none text-sm transition-all duration-300 placeholder:text-slate-300`}
                                        placeholder="name@company.com"
                                    />
                                    {emailError && (
                                        <motion.p 
                                            initial={{ opacity: 0, y: -5 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="text-[10px] font-bold text-red-500 ml-1"
                                        >
                                            {emailError}
                                        </motion.p>
                                    )}
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">Password</label>
                                    <div className="relative">
                                        <input 
                                            type={showPassword ? "text" : "password"} 
                                            value={password} 
                                            onChange={(e) => {
                                                setPassword(e.target.value);
                                                if (passwordError) setPasswordError(null);
                                            }}
                                            className={`w-full px-4 py-3.5 rounded-2xl border ${passwordError ? 'border-red-500 bg-red-50/50 shadow-[0_0_15px_rgba(239,68,68,0.1)]' : 'border-slate-200 bg-slate-50/50'} focus:ring-4 focus:ring-slate-900/5 focus:border-slate-900 focus:bg-white outline-none text-sm transition-all duration-300 pr-12 placeholder:text-slate-300`}
                                            placeholder="••••••••"
                                        />
                                        <button 
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-slate-400 hover:text-slate-900 transition-colors"
                                        >
                                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                    {passwordError && (
                                        <motion.p 
                                            initial={{ opacity: 0, y: -5 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="text-[10px] font-bold text-red-500 ml-1"
                                        >
                                            {passwordError}
                                        </motion.p>
                                    )}
                                </div>
                                <div className="flex items-center justify-between py-1">
                                    <div className="flex items-center">
                                        <input 
                                            type="checkbox" 
                                            id="rememberMe" 
                                            checked={rememberMe} 
                                            onChange={(e) => setRememberMe(e.target.checked)}
                                            className="h-4 w-4 text-slate-900 focus:ring-slate-900 border-slate-300 rounded cursor-pointer transition-all"
                                        />
                                        <label htmlFor="rememberMe" className="ml-2 block text-xs font-bold text-slate-500 cursor-pointer select-none hover:text-slate-900 transition-colors">
                                            Remember me
                                        </label>
                                    </div>
                                    {view === 'login' && (
                                        <button type="button" className="text-xs font-bold text-slate-400 hover:text-slate-950 transition-colors">
                                            Forgot password?
                                        </button>
                                    )}
                                </div>
                                {error && (
                                    <motion.div 
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="flex items-start gap-2 p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-[11px] font-bold uppercase tracking-wider"
                                    >
                                        <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                                        <span>{error}</span>
                                    </motion.div>
                                )}
                                <PremiumButton 
                                    type="submit" 
                                    isLoading={loading}
                                    loadingText="Processing..."
                                    className="py-4"
                                >
                                    {view === 'login' ? 'Login' : 'Sign Up'}
                                </PremiumButton>
                            </form>
                            <div className="my-6 flex items-center gap-4">
                                <div className="h-px bg-slate-100 flex-1" />
                                <span className="text-xs text-slate-400 font-medium">OR</span>
                                <div className="h-px bg-slate-100 flex-1" />
                            </div>
                            <button onClick={handleGoogleSignIn} className="w-full py-3 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-slate-200 active:scale-95 transition-all flex items-center justify-center gap-2">
                                <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" /><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" /><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" /><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" /></svg>
                                Continue with Google
                            </button>
                        </div>
                        <div className="bg-slate-50 p-4 text-center text-xs font-medium text-slate-500">
                            {view === 'login' ? "Don't have an account? " : "Already have an account? "}
                            <button onClick={() => setView(view === 'login' ? 'signup' : 'login')} className="text-slate-900 hover:underline focus:outline-none focus:ring-2 focus:ring-slate-900/20 rounded-sm px-1">
                                {view === 'login' ? 'Sign up' : 'Log in'}
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default AuthModal;
