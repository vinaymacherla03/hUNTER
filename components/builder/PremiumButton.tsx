
import React from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

interface PremiumButtonProps {
  onClick?: () => void;
  disabled?: boolean;
  isLoading?: boolean;
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  loadingText?: string;
  className?: string;
}

const PremiumButton: React.FC<PremiumButtonProps> = ({
  onClick,
  disabled = false,
  isLoading = false,
  children,
  variant = 'primary',
  loadingText = 'Processing...',
  className = '',
}) => {

  const baseClasses = 'w-full flex items-center justify-center gap-2 px-6 py-3 text-sm font-bold rounded-2xl transition-all duration-300 ease-in-out focus:outline-none focus:ring-4';
  
  const variantClasses = {
    primary: `text-white bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-500/20 shadow-sm hover:shadow-md border border-transparent`,
    secondary: `text-slate-900 bg-slate-100 hover:bg-slate-200 focus:ring-slate-500/20 border border-transparent`,
    outline: `text-slate-700 bg-white hover:bg-slate-50 border-2 border-slate-200 hover:border-slate-300 focus:ring-slate-500/10`,
    ghost: `text-slate-600 bg-transparent hover:bg-slate-100 hover:text-slate-900 focus:ring-slate-500/10 border border-transparent`,
  };

  return (
    <motion.button
      onClick={onClick}
      disabled={disabled || isLoading}
      className={`${baseClasses} ${variantClasses[variant]} disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      whileHover={{ scale: disabled || isLoading ? 1 : 1.02 }}
      whileTap={{ scale: disabled || isLoading ? 1 : 0.98 }}
    >
      {isLoading ? (
         <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>{loadingText}</span>
         </>
      ) : children}
    </motion.button>
  );
};

export default PremiumButton;
