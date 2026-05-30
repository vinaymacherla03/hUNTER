
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
  type?: 'button' | 'submit' | 'reset';
}

const PremiumButton: React.FC<PremiumButtonProps> = ({
  onClick,
  disabled = false,
  isLoading = false,
  children,
  variant = 'primary',
  loadingText = 'Processing...',
  className = '',
  type = 'button',
}) => {

  const baseClasses = 'relative w-full flex items-center justify-center gap-2 px-6 py-3 text-sm font-bold rounded-2xl transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] focus:outline-none focus:ring-4 overflow-hidden group';
  
  const variantClasses = {
    primary: `text-white bg-slate-950 hover:bg-slate-900 focus:ring-slate-500/20 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.3)] hover:shadow-[0_20px_40px_-12px_rgba(0,0,0,0.4)] border border-white/10`,
    secondary: `text-slate-900 bg-slate-100 hover:bg-slate-200 focus:ring-slate-500/20 border border-transparent shadow-sm`,
    outline: `text-slate-700 bg-white hover:bg-slate-50 border-2 border-slate-200 hover:border-slate-300 focus:ring-slate-500/10 shadow-sm`,
    ghost: `text-slate-600 bg-transparent hover:bg-slate-100 hover:text-slate-900 focus:ring-slate-500/10 border border-transparent`,
  };

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled || isLoading}
      className={`${baseClasses} ${variantClasses[variant]} disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      whileHover={{ scale: disabled || isLoading ? 1 : 1.01, y: -1 }}
      whileTap={{ scale: disabled || isLoading ? 1 : 0.98 }}
    >
      {/* Shimmer Effect for Primary */}
      {variant === 'primary' && !disabled && !isLoading && (
        <motion.div 
          className="absolute inset-0 w-[200%] h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12"
          initial={{ x: '-100%' }}
          animate={{ x: '100%' }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear", repeatDelay: 3 }}
        />
      )}

      {/* Hover Gradient for Primary */}
      {variant === 'primary' && (
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      )}

      <div className="relative z-10 flex items-center justify-center gap-2">
        {isLoading ? (
          <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>{loadingText}</span>
          </>
        ) : children}
      </div>
    </motion.button>
  );
};

export default PremiumButton;
