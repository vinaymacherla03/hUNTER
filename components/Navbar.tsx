
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence, useScroll, useTransform, useSpring } from 'framer-motion';
import type { User } from 'firebase/auth';
import { ChevronDown, User as UserIcon, LogOut, LayoutDashboard, Briefcase, FileText, Sparkles, Zap, Settings } from 'lucide-react';

interface NavbarProps {
  user: User | null;
  onLogout: () => void;
  onLogin: () => void;
  onSignup: () => void;
  onGetStarted: () => void;
  showDashboardButton: boolean;
  onGoToDashboard: () => void;
  onGoToHome: () => void;
  isSolid?: boolean;
}

const Navbar: React.FC<NavbarProps> = ({
  user,
  onLogout,
  onLogin,
  onSignup,
  onGoToDashboard,
  onGoToHome,
  isSolid
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { scrollY, scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });
  
  const navBackground = useTransform(
    scrollY,
    [0, 100],
    ["rgba(255, 255, 255, 0)", "rgba(255, 255, 255, 0.7)"]
  );
  
  const navBorder = useTransform(
    scrollY,
    [0, 100],
    ["rgba(255, 255, 255, 0)", "rgba(226, 232, 240, 0.3)"]
  );

  const navShadow = useTransform(
    scrollY,
    [0, 100],
    ["0px 0px 0px rgba(0,0,0,0)", "0px 10px 30px rgba(0,0,0,0.03)"]
  );

  const navPadding = useTransform(
    scrollY,
    [0, 100],
    ["16px", "10px"]
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsProfileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <motion.header 
        style={isSolid ? {
            backgroundColor: 'rgba(255, 255, 255, 1)',
            borderBottomColor: 'rgba(226, 232, 240, 1)',
            boxShadow: '0px 10px 30px rgba(0,0,0,0.03)',
            paddingTop: '10px',
            paddingBottom: '10px'
        } : { 
            backgroundColor: navBackground,
            borderBottomColor: navBorder,
            boxShadow: navShadow,
            paddingTop: navPadding,
            paddingBottom: navPadding
        }}
        className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl border-b transition-all duration-500"
    >
        <div className="max-w-7xl mx-auto px-6">
            <div className="flex items-center justify-between h-12 lg:h-14">
                <div className="flex-shrink-0">
                    <a href="#" onClick={onGoToHome} title="HuntDesk Home" className="flex items-center gap-3 group">
                        <div className="w-8 h-8 rounded-full bg-black flex items-center justify-center text-white transition-all duration-500 shadow-md relative overflow-hidden">
                            <Zap className="w-4 h-4 relative z-10 fill-white text-white" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xl font-semibold text-black tracking-tight leading-none font-sans">HuntDesk</span>
                        </div>
                    </a>
                </div>

                <div className="hidden lg:flex lg:items-center lg:justify-center lg:space-x-6 absolute left-1/2 -translate-x-1/2">
                    {user ? (
                        <>
                            {[
                                { label: 'Dashboard', action: onGoToDashboard },
                                { label: 'Builder', action: onGoToDashboard },
                                { label: 'Jobs', action: onGoToDashboard }
                            ].map((item) => (
                                <button 
                                    key={item.label}
                                    onClick={item.action} 
                                    className="px-2 py-2 text-[15px] font-medium text-slate-500 transition-colors hover:text-slate-900"
                                >
                                    {item.label}
                                </button>
                            ))}
                        </>
                    ) : (
                        ['Features', 'Solutions', 'Resources', 'Pricing'].map((item) => (
                            <a 
                                key={item}
                                href={`#${item.toLowerCase()}`} 
                                className="px-2 py-2 text-[15px] font-medium text-slate-500 transition-colors hover:text-slate-900"
                            >
                                {item}
                            </a>
                        ))
                    )}
                </div>

                <div className="flex items-center gap-3 lg:gap-6">
                    {user ? (
                        <div className="relative" ref={dropdownRef}>
                            <button 
                                onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                                className="flex items-center gap-2 p-1 pr-2 rounded-full hover:bg-gray-100 transition-colors focus:outline-none"
                            >
                                <div className="relative">
                                    {user.photoURL ? (
                                        <img 
                                            src={user.photoURL} 
                                            alt="Profile" 
                                            className="w-8 h-8 rounded-full object-cover" 
                                            referrerPolicy="no-referrer"
                                            onError={(e) => {
                                                (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName || user.email || 'User')}&background=f5f5f5&color=000&bold=true`;
                                            }}
                                        />
                                    ) : (
                                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
                                            <UserIcon className="w-4 h-4" />
                                        </div>
                                    )}
                                </div>
                                <div className="hidden sm:flex flex-col items-start pr-1">
                                    <span className="text-[13px] font-medium text-black truncate max-w-[100px]">{user.displayName || user.email?.split('@')[0] || 'User'}</span>
                                </div>
                                <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-300 ${isProfileDropdownOpen ? 'rotate-180' : ''}`} />
                            </button>

                            <AnimatePresence>
                                {isProfileDropdownOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                        transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                                        className="absolute right-0 mt-2 w-56 bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg shadow-black/5 border border-black/5 overflow-hidden z-50"
                                    >
                                        <div className="px-5 py-4 border-b border-black/5">
                                            <p className="text-[13px] font-semibold text-black truncate tracking-tight">{user.displayName || 'User'}</p>
                                            <p className="text-[11px] text-gray-500 truncate mt-0.5">{user.email}</p>
                                        </div>
                                        <div className="p-1.5">
                                            <button 
                                                onClick={() => {
                                                    setIsProfileDropdownOpen(false);
                                                    onGoToDashboard();
                                                }}
                                                className="w-full text-left px-3 py-2 text-[13px] text-gray-700 hover:text-black hover:bg-black/5 rounded-xl transition-colors flex items-center gap-2"
                                            >
                                                <LayoutDashboard className="w-4 h-4" />
                                                Dashboard
                                            </button>
                                            <button 
                                                onClick={() => {
                                                    setIsProfileDropdownOpen(false);
                                                    // Placeholder for account settings - future implementation
                                                }}
                                                className="w-full text-left px-3 py-2 text-[13px] text-gray-700 hover:text-black hover:bg-black/5 rounded-xl transition-colors flex items-center gap-2"
                                            >
                                                <Settings className="w-4 h-4" />
                                                Account Settings
                                            </button>
                                            <div className="my-1 border-t border-black/5 mx-2" />
                                            <button 
                                                onClick={() => {
                                                    setIsProfileDropdownOpen(false);
                                                    onLogout();
                                                }}
                                                className="w-full text-left px-3 py-2 text-[13px] text-red-600 hover:bg-red-50 rounded-xl transition-colors flex items-center gap-2"
                                            >
                                                <LogOut className="w-4 h-4" />
                                                Sign Out
                                            </button>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    ) : (
                        <div className="hidden sm:flex items-center gap-4">
                            <button 
                                onClick={onLogin}
                                className="text-[13px] font-medium text-gray-500 hover:text-black transition-colors px-4 py-2 rounded-lg hover:bg-gray-50/50"
                            >
                                Login
                            </button>
                            <motion.button 
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={onSignup}
                                className="flex items-center justify-center gap-2 px-5 py-2 text-[13px] font-medium text-white bg-black rounded-lg transition-all shadow-sm hover:shadow"
                            > 
                                <Sparkles className="w-3.5 h-3.5" />
                                <span>Sign Up</span>
                            </motion.button>
                        </div>
                    )}
                    
                    <button 
                        type="button" 
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className="inline-flex p-2 text-slate-950 lg:hidden z-50 focus:outline-none focus:ring-2 focus:ring-slate-200 rounded-xl"
                    >
                        <svg className="w-6 h-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d={isMobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 8h16M4 16h16"} />
                        </svg>
                    </button>
                </div>
            </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
            {isMobileMenuOpen && (
                <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                    className="lg:hidden bg-white/95 backdrop-blur-2xl border-t border-slate-100 overflow-hidden shadow-2xl"
                >
                    <div className="p-10 space-y-8">
                        <div className="space-y-6">
                            {user ? (
                                <>
                                    {[
                                        { label: 'Dashboard', action: onGoToDashboard, icon: LayoutDashboard },
                                        { label: 'Account Settings', action: () => {}, icon: Settings },
                                        { label: 'Builder', action: onGoToDashboard, icon: FileText },
                                        { label: 'Jobs', action: onGoToDashboard, icon: Briefcase }
                                    ].map((item, i) => (
                                        <motion.button 
                                            key={item.label}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: i * 0.1 }}
                                            onClick={() => { setIsMobileMenuOpen(false); item.action(); }} 
                                            className="flex items-center gap-4 w-full text-left text-3xl font-black text-slate-950 tracking-tighter uppercase hover:text-emerald-600 transition-colors font-display"
                                        >
                                            {item.icon && <item.icon className="w-6 h-6 text-slate-400" />}
                                            {item.label}
                                        </motion.button>
                                    ))}
                                    <motion.div 
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: 0.4 }}
                                        className="pt-6 border-t border-slate-100 flex items-center gap-4"
                                    >
                                        {user.photoURL ? (
                                            <img 
                                                src={user.photoURL} 
                                                alt="Profile" 
                                                className="w-14 h-14 rounded-2xl object-cover border-2 border-white shadow-lg" 
                                                referrerPolicy="no-referrer"
                                                onError={(e) => {
                                                    (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName || user.email || 'User')}&background=f8fafc&color=64748b&bold=true`;
                                                }}
                                            />
                                        ) : (
                                            <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center border-2 border-white shadow-lg text-slate-500">
                                                <UserIcon className="w-6 h-6" />
                                            </div>
                                        )}
                                        <div>
                                            <p className="text-lg font-black text-slate-950 tracking-tight">{user.displayName || 'User'}</p>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{user.email}</p>
                                        </div>
                                    </motion.div>
                                    <motion.button 
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: 0.5 }}
                                        onClick={() => { setIsMobileMenuOpen(false); onLogout(); }}
                                        className="w-full py-5 bg-rose-50 text-rose-600 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] flex items-center justify-center gap-3"
                                    >
                                        <LogOut className="w-4 h-4" />
                                        Sign Out
                                    </motion.button>
                                </>
                            ) : (
                                <>
                                    {['Features', 'Solutions', 'Pricing'].map((item, i) => (
                                        <motion.a 
                                            key={item}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: i * 0.1 }}
                                            href={`#${item.toLowerCase()}`} 
                                            onClick={() => setIsMobileMenuOpen(false)}
                                            className="block w-full text-4xl font-black text-slate-950 tracking-tighter uppercase hover:text-emerald-600 transition-colors"
                                        >
                                            {item}
                                        </motion.a>
                                    ))}
                                    <motion.div 
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.5 }}
                                        className="pt-10 flex flex-col gap-4"
                                    >
                                        <button 
                                            onClick={() => { setIsMobileMenuOpen(false); onLogin(); }}
                                            className="w-full py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 border border-slate-100 rounded-2xl hover:bg-slate-50 transition-all"
                                        >
                                            Login
                                        </button>
                                        <motion.button 
                                            whileTap={{ scale: 0.98 }}
                                            onClick={() => { setIsMobileMenuOpen(false); onSignup(); }}
                                            className="w-full py-6 bg-slate-950 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-2xl shadow-slate-950/20 flex items-center justify-center gap-3 relative overflow-hidden group"
                                        >
                                            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 via-emerald-500 to-emerald-500 opacity-0 group-active:opacity-100 transition-opacity duration-500 bg-[length:200%_100%] animate-gradient-x" />
                                            <Sparkles className="w-4 h-4 relative z-10" />
                                            <span className="relative z-10">Sign Up</span>
                                        </motion.button>
                                    </motion.div>
                                </>
                            )}
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    </motion.header>
  );
};

export default Navbar;

