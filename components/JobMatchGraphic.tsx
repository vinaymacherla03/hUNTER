
import React from 'react';
import { motion } from 'framer-motion';

const JobMatchGraphic: React.FC = () => {
    const score = 88;
    
    return (
        <motion.div
            className="w-[280px] bg-white rounded-2xl border border-slate-200 shadow-xl p-6 flex flex-col relative overflow-hidden"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Target Role</h4>
                    <p className="text-sm font-bold text-slate-900 mt-0.5">Senior Product Designer</p>
                </div>
                <div className="h-8 w-8 bg-slate-50 rounded-lg flex items-center justify-center text-slate-400">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                </div>
            </div>

            {/* Score Gauge */}
            <div className="relative flex items-center justify-center mb-8">
                 <svg className="w-36 h-36 -rotate-90" viewBox="0 0 36 36">
                    {/* Background Circle */}
                    <path className="text-slate-100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" />
                    {/* Progress Circle */}
                    <motion.path 
                        className="text-emerald-500" 
                        strokeDasharray={`${score}, 100`} 
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" 
                        fill="none" 
                        stroke="currentColor" 
                        strokeWidth="3" 
                        strokeLinecap="round"
                        initial={{ pathLength: 0 }}
                        whileInView={{ pathLength: 1 }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                    />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-4xl font-black text-slate-900 tracking-tighter">{score}</span>
                    <span className="text-[10px] uppercase tracking-wide text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.5 rounded mt-1">Strong Match</span>
                </div>
            </div>

            <div className="space-y-3">
                <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Keywords Found</span>
                    <span className="text-[10px] font-bold text-slate-900">3/4</span>
                </div>
                
                <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs p-2 rounded bg-emerald-50/50 border border-emerald-100">
                        <span className="font-medium text-slate-700">User Research</span>
                        <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                    </div>
                    <div className="flex items-center justify-between text-xs p-2 rounded bg-emerald-50/50 border border-emerald-100">
                        <span className="font-medium text-slate-700">Figma Prototyping</span>
                        <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                    </div>
                    <div className="flex items-center justify-between text-xs p-2 rounded bg-red-50/50 border border-red-100">
                        <span className="font-medium text-slate-400">React Basics</span>
                        <span className="text-[10px] font-bold text-red-500">Missing</span>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default JobMatchGraphic;
