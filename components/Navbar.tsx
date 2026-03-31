
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { User } from 'firebase/auth';

interface NavbarProps {
  user: User | null;
  onLogout: () => void;
  onLogin: () => void;
  onSignup: () => void;
  onGetStarted: () => void;
  showDashboardButton: boolean;
  onGoToDashboard: () => void;
  onGoToHome: () => void;
  minimal?: boolean;
}

const Navbar: React.FC<NavbarProps> = ({
  user,
  onLogout,
  onLogin,
  onSignup,
  onGoToDashboard,
  onGoToHome,
  minimal
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  if (minimal) return null;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/70 backdrop-blur-2xl border-b border-slate-200/50">
        <div className="max-w-7xl mx-auto px-6">
            <div className="flex items-center justify-between h-14 lg:h-16">
                <div className="flex-shrink-0">
                    <a href="#" onClick={onGoToHome} title="HuntDesk Home" className="flex items-center gap-3 group">
                        <div className="w-8 h-8 rounded-xl bg-black flex items-center justify-center text-white transition-all group-hover:scale-105 group-hover:rotate-3 shadow-lg shadow-black/10">
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5"><path d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                        </div>
                        <span className="text-lg font-bold text-black tracking-tight">HuntDesk</span>
                    </a>
                </div>

                <div className="hidden lg:flex lg:items-center lg:justify-center lg:space-x-10">
                    {['Features', 'Solutions', 'Resources', 'Pricing'].map((item) => (
                        <a 
                            key={item}
                            href={`#${item.toLowerCase()}`} 
                            className="text-[13px] font-bold text-slate-500 transition-all hover:text-black hover:translate-y-[-1px]"
                        >
                            {item}
                        </a>
                    ))}
                </div>

                <div className="flex items-center gap-6">
                    {user ? (
                         <button 
                            onClick={onGoToDashboard} 
                            className="text-[12px] font-bold text-white bg-emerald-600 px-5 py-2 rounded-full hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/20 active:scale-95"
                        > 
                            Dashboard 
                        </button>
                    ) : (
                        <div className="flex items-center gap-6">
                            <button 
                                onClick={onLogin}
                                className="text-[13px] font-bold text-slate-600 hover:text-black transition-colors"
                            >
                                Sign In
                            </button>
                            <button 
                                onClick={onSignup}
                                className="text-[12px] font-bold text-white bg-black px-6 py-2.5 rounded-full hover:bg-emerald-600 transition-all shadow-lg shadow-black/10 active:scale-95"
                            > 
                                Join Now 
                            </button>
                        </div>
                    )}
                    
                    <button 
                        type="button" 
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className="inline-flex p-2 text-black lg:hidden z-50"
                    >
                        <svg className="w-6 h-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={isMobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 8h16M4 16h16"} />
                        </svg>
                    </button>
                </div>
            </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
            {isMobileMenuOpen && (
                <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="lg:hidden bg-white border-t border-[#d2d2d7]/30 overflow-hidden shadow-2xl"
                >
                    <div className="p-8 space-y-6">
                        <a href="#features" onClick={() => setIsMobileMenuOpen(false)} className="block text-2xl font-semibold text-[#1d1d1f]">Features</a>
                        <a href="#how-it-works" onClick={() => setIsMobileMenuOpen(false)} className="block text-2xl font-semibold text-[#1d1d1f]">Solutions</a>
                        <a href="#pricing" onClick={() => setIsMobileMenuOpen(false)} className="block text-2xl font-semibold text-[#1d1d1f]">Pricing</a>
                        <hr className="border-[#d2d2d7]/30" />
                        <button onClick={onLogin} className="w-full py-4 bg-emerald-600 text-white font-semibold rounded-2xl">Get Started</button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    </header>
  );
};

export default Navbar;
