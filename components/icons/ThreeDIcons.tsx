import React from 'react';

const IconWrapper: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
    <div className={`relative w-16 h-16 flex items-center justify-center transition-transform group-hover:scale-110 duration-500 ${className}`}>
        {children}
    </div>
);

export const AiOrbIcon = ({ className }: { className?: string }) => (
    <IconWrapper className={className}>
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-violet-400 via-purple-500 to-indigo-600 shadow-lg shadow-violet-500/40 flex items-center justify-center relative overflow-hidden border border-white/20">
             <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent" />
             <div className="w-4 h-4 bg-white/80 rounded-full blur-[2px] absolute top-2 left-3" />
        </div>
    </IconWrapper>
);

export const TargetIcon = ({ className }: { className?: string }) => (
    <IconWrapper className={className}>
        <div className="w-14 h-14 rounded-full bg-white border-4 border-emerald-500 shadow-lg shadow-emerald-500/20 flex items-center justify-center relative">
            <div className="w-5 h-5 rounded-full bg-emerald-500 shadow-sm" />
            <div className="absolute inset-0 rounded-full border border-black/5" />
        </div>
    </IconWrapper>
);

export const PipelineIcon = ({ className }: { className?: string }) => (
    <IconWrapper className={className}>
         <div className="w-12 h-10 bg-white rounded-lg shadow-xl shadow-slate-200/50 border border-slate-100 flex gap-1.5 p-2 items-center justify-center transform rotate-3">
            <div className="w-2.5 h-6 bg-gradient-to-b from-rose-300 to-rose-400 rounded-full shadow-sm" />
            <div className="w-2.5 h-4 bg-gradient-to-b from-amber-300 to-amber-400 rounded-full shadow-sm" />
            <div className="w-2.5 h-7 bg-gradient-to-b from-emerald-300 to-emerald-400 rounded-full shadow-sm" />
        </div>
    </IconWrapper>
);

export const BoltIcon = ({ className }: { className?: string }) => (
    <IconWrapper className={className}>
         <div className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-300 to-amber-500 shadow-lg shadow-amber-500/40 flex items-center justify-center border border-white/30 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent" />
            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-white drop-shadow-md transform -rotate-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
        </div>
    </IconWrapper>
);

export const MagicPenIcon = ({ className }: { className?: string }) => (
    <IconWrapper className={className}>
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-400 to-indigo-600 shadow-lg shadow-indigo-500/30 flex items-center justify-center border border-white/20 transform -rotate-6">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7 text-white drop-shadow-md" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
        </div>
    </IconWrapper>
);

export const StyleIcon = ({ className }: { className?: string }) => (
    <IconWrapper className={className}>
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-400 to-rose-600 shadow-lg shadow-rose-500/30 flex items-center justify-center border border-white/20 transform rotate-3">
             <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7 text-white drop-shadow-md" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" /></svg>
        </div>
    </IconWrapper>
);

export const TemplatesIcon = ({ className }: { className?: string }) => (
    <IconWrapper className={className}>
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 shadow-lg shadow-blue-500/30 flex items-center justify-center border border-white/20 transform -rotate-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-white drop-shadow-md" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M4 5a1 1 0 011-1h4a1 1 0 011 1v5a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h4a1 1 0 011 1v5a1 1 0 01-1 1H5a1 1 0 01-1-1v-5zM11 5a1 1 0 011-1h4a1 1 0 011 1v5a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM11 13a1 1 0 011-1h4a1 1 0 011 1v5a1 1 0 01-1 1h-4a1 1 0 01-1-1v-5z" /></svg>
        </div>
    </IconWrapper>
);

export const SectionsIcon = ({ className }: { className?: string }) => (
    <IconWrapper className={className}>
         <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 shadow-lg shadow-teal-500/30 flex items-center justify-center border border-white/20 transform rotate-6">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-white drop-shadow-md" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" /></svg>
        </div>
    </IconWrapper>
);