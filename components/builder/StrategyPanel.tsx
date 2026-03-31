
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getCareerStrategy, getSkillResources } from '../../services/geminiService';
import { ResumeData } from '../../types';
import { Compass, Target, Zap, ChevronRight, Award, Lightbulb, RefreshCw, TrendingUp, ExternalLink, Loader2, BookOpen, AlertCircle } from 'lucide-react';

interface StrategyPanelProps {
    resumeData: ResumeData;
}

const StrategyPanel: React.FC<StrategyPanelProps> = ({ resumeData }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [strategy, setStrategy] = useState<{ roadmap: { step: string; description: string }[]; skillGaps: string[]; positioning: string } | null>(null);
    const [selectedSkill, setSelectedSkill] = useState<string | null>(null);
    const [skillResources, setSkillResources] = useState<{ title: string; provider: string; url: string; type: string }[]>([]);
    const [isFetchingResources, setIsFetchingResources] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchStrategy = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await getCareerStrategy(resumeData);
            setStrategy(data);
        } catch (err) {
            setError("Failed to generate your career strategy. Please try again.");
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchResources = async (skill: string) => {
        setSelectedSkill(skill);
        setIsFetchingResources(true);
        try {
            const resources = await getSkillResources(skill);
            setSkillResources(resources);
        } catch (err) {
            console.error(err);
        } finally {
            setIsFetchingResources(false);
        }
    };

    useEffect(() => {
        if (!strategy && !isLoading) {
            fetchStrategy();
        }
    }, [resumeData]);

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between bg-white p-6 rounded-[2rem] shadow-sm border border-slate-200/50">
                <div>
                    <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mb-1">Career Strategy</h2>
                    <p className="text-sm text-slate-500 font-medium">Your personalized roadmap to the next level.</p>
                </div>
                <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={fetchStrategy}
                    disabled={isLoading}
                    className="p-4 bg-slate-50 border border-slate-200 rounded-2xl hover:bg-slate-100 hover:border-slate-300 transition-all disabled:opacity-50 text-slate-600 hover:text-slate-900 shadow-sm"
                >
                    <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
                </motion.button>
            </div>

            <AnimatePresence mode="wait">
                {isLoading ? (
                    <motion.div 
                        key="loading"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="py-24 flex flex-col items-center justify-center text-center bg-white rounded-[2rem] border border-slate-200/50 shadow-sm"
                    >
                        <div className="relative w-24 h-24 mb-8">
                            <Compass className="w-full h-full text-emerald-600 animate-[spin_3s_linear_infinite]" />
                            <div className="absolute inset-0 border-[6px] border-slate-100 rounded-full"></div>
                        </div>
                        <h3 className="text-xl font-black text-slate-900 tracking-tight mb-3">Mapping Your Future</h3>
                        <p className="text-base text-slate-500 max-w-sm mx-auto font-medium leading-relaxed">Our AI strategist is analyzing your profile to build a custom roadmap...</p>
                    </motion.div>
                ) : strategy ? (
                    <motion.div 
                        key="results"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-8"
                    >
                        {/* Positioning Statement */}
                        <div className="p-10 bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-600 rounded-[2rem] text-white shadow-xl shadow-emerald-500/20 relative overflow-hidden border border-emerald-500/30">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
                            <div className="absolute bottom-0 left-0 w-48 h-48 bg-black/10 rounded-full translate-y-1/2 -translate-x-1/2 blur-2xl"></div>
                            <div className="relative z-10">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                                        <Target className="w-6 h-6 text-white" />
                                    </div>
                                    <h3 className="text-sm font-black uppercase tracking-widest text-emerald-100">Market Positioning</h3>
                                </div>
                                <p className="text-2xl sm:text-3xl font-bold leading-tight tracking-tight">
                                    "{strategy.positioning}"
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* Career Roadmap */}
                            <div className="lg:col-span-2 space-y-6 bg-white p-8 rounded-[2rem] border border-slate-200/50 shadow-sm">
                                <div className="flex items-center gap-4 mb-8">
                                    <div className="p-3 bg-emerald-50 rounded-2xl text-emerald-600">
                                        <TrendingUp className="w-6 h-6" />
                                    </div>
                                    <h3 className="text-xl font-black text-slate-900 tracking-tight">3-Step Roadmap</h3>
                                </div>
                                <div className="space-y-6 relative before:absolute before:inset-0 before:ml-8 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
                                    {strategy.roadmap.map((item, i) => (
                                        <div key={i} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                                            <div className="flex items-center justify-center w-16 h-16 rounded-full border-4 border-white bg-slate-100 text-slate-500 font-black text-xl shadow-sm shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 group-hover:bg-emerald-600 group-hover:text-white transition-colors duration-300 z-10">
                                                0{i + 1}
                                            </div>
                                            <div className="w-[calc(100%-5rem)] md:w-[calc(50%-3rem)] p-6 rounded-3xl bg-white border border-slate-200 shadow-sm group-hover:border-emerald-300 group-hover:shadow-md transition-all duration-300">
                                                <div className="flex items-center justify-between mb-2">
                                                    <h4 className="font-bold text-lg text-slate-900 group-hover:text-emerald-600 transition-colors">{item.step}</h4>
                                                </div>
                                                <p className="text-sm text-slate-600 font-medium leading-relaxed">{item.description}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Skill Gaps */}
                            <div className="space-y-6 bg-white p-8 rounded-[2rem] border border-slate-200/50 shadow-sm">
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="p-3 bg-teal-50 rounded-2xl text-teal-500">
                                        <Zap className="w-6 h-6" />
                                    </div>
                                    <h3 className="text-xl font-black text-slate-900 tracking-tight">Skill Gaps</h3>
                                </div>
                                <div className="space-y-6">
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Click to find resources:</p>
                                    <div className="space-y-3">
                                        {strategy.skillGaps.map((skill, i) => (
                                            <button 
                                                key={i} 
                                                onClick={() => fetchResources(skill)}
                                                className={`w-full flex items-center justify-between p-4 rounded-2xl border-2 transition-all duration-300 text-left ${selectedSkill === skill ? 'bg-teal-50 border-teal-500 shadow-sm' : 'bg-slate-50 border-transparent hover:border-slate-200 hover:bg-slate-100'}`}
                                            >
                                                <div className="flex items-center gap-3 text-sm font-bold text-slate-700">
                                                    <div className={`w-2.5 h-2.5 rounded-full ${selectedSkill === skill ? 'bg-teal-500' : 'bg-slate-300'}`}></div>
                                                    {skill}
                                                </div>
                                                <ChevronRight className={`w-4 h-4 text-slate-400 transition-transform duration-300 ${selectedSkill === skill ? 'rotate-90 text-teal-500' : ''}`} />
                                            </button>
                                        ))}
                                    </div>

                                    {/* Actionable Resources */}
                                    <AnimatePresence>
                                        {selectedSkill && (
                                            <motion.div 
                                                initial={{ opacity: 0, height: 0, marginTop: 0 }}
                                                animate={{ opacity: 1, height: 'auto', marginTop: 24 }}
                                                exit={{ opacity: 0, height: 0, marginTop: 0 }}
                                                className="pt-6 border-t border-slate-100 space-y-4 overflow-hidden"
                                            >
                                                <div className="flex items-center justify-between">
                                                    <h4 className="text-[10px] font-black text-teal-600 uppercase tracking-widest">Top Resources for {selectedSkill}:</h4>
                                                    {isFetchingResources && <Loader2 className="w-4 h-4 animate-spin text-teal-500" />}
                                                </div>
                                                
                                                <div className="space-y-3">
                                                    {skillResources.map((res, i) => (
                                                        <a 
                                                            key={i}
                                                            href={res.url}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-2xl hover:border-teal-400 hover:shadow-md group transition-all duration-300"
                                                        >
                                                            <div className="flex items-center gap-4">
                                                                <div className="p-2 bg-slate-50 rounded-xl group-hover:bg-teal-50 transition-colors">
                                                                    <BookOpen className="w-4 h-4 text-slate-400 group-hover:text-teal-500 transition-colors" />
                                                                </div>
                                                                <div>
                                                                    <p className="text-sm font-bold text-slate-800 leading-tight group-hover:text-teal-700 transition-colors">{res.title}</p>
                                                                    <p className="text-[10px] text-slate-500 font-medium mt-1 uppercase tracking-wider">{res.provider} • {res.type}</p>
                                                                </div>
                                                            </div>
                                                            <ExternalLink className="w-4 h-4 text-slate-300 group-hover:text-teal-500 transition-colors" />
                                                        </a>
                                                    ))}
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </div>
                        </div>

                        {/* Pro Tip */}
                        <div className="flex items-start gap-6 p-8 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-100 rounded-[2rem] shadow-sm">
                            <div className="w-14 h-14 rounded-2xl bg-white shadow-sm border border-emerald-100 flex items-center justify-center shrink-0">
                                <Lightbulb className="w-7 h-7 text-emerald-500" />
                            </div>
                            <div>
                                <h4 className="text-sm font-black text-emerald-800 uppercase tracking-widest mb-2">Pro Tip</h4>
                                <p className="text-base text-emerald-900/80 leading-relaxed font-medium">
                                    Your profile shows strong potential in leadership. Focus on quantifying your impact in your next role to accelerate your path to a Senior position.
                                </p>
                            </div>
                        </div>
                    </motion.div>
                ) : (
                    <div className="py-24 text-center bg-white rounded-[2rem] border border-slate-200/50 shadow-sm">
                        <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 border border-slate-100">
                            <Compass className="w-10 h-10 text-slate-300" />
                        </div>
                        <h3 className="text-xl font-black text-slate-900 tracking-tight mb-3">Strategy Not Generated</h3>
                        <p className="text-base text-slate-500 max-w-sm mx-auto font-medium leading-relaxed">Click the refresh button above to generate your personalized career strategy.</p>
                    </div>
                )}
            </AnimatePresence>

            {error && (
                <div className="p-6 bg-rose-50 text-rose-700 text-sm font-bold rounded-[2rem] border border-rose-100 flex items-center gap-3">
                    <AlertCircle className="w-5 h-5" />
                    {error}
                </div>
            )}
        </div>
    );
};

export default StrategyPanel;
