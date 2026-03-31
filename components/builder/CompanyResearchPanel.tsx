
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Building, Newspaper, Rocket, Target, Loader2, Globe, ExternalLink } from 'lucide-react';
import { researchCompany } from '../../services/geminiService';

const CompanyResearchPanel: React.FC = () => {
    const [companyName, setCompanyName] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [report, setReport] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleResearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!companyName.trim()) return;

        setIsLoading(true);
        setError(null);
        setReport(null);

        try {
            const data = await researchCompany(companyName);
            setReport(data);
        } catch (err) {
            setError("Failed to research company. Please try again.");
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex flex-col gap-2">
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Company Intelligence</h2>
                <p className="text-xs sm:text-sm text-slate-500 font-medium">Deep dive into any company's mission, news, and tech stack using real-time search.</p>
            </div>

            <form onSubmit={handleResearch} className="relative group">
                <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
                    <Building className="h-6 w-6 text-slate-400 group-focus-within:text-emerald-600 transition-colors" />
                </div>
                <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="Enter company name (e.g., Google, Stripe, SpaceX)..."
                    className="block w-full pl-16 pr-32 py-6 bg-white border-2 border-slate-100 rounded-[2rem] text-lg font-bold text-slate-900 placeholder:text-slate-300 focus:outline-none focus:border-emerald-600 focus:ring-4 focus:ring-emerald-50 transition-all shadow-sm"
                />
                <button
                    type="submit"
                    disabled={isLoading || !companyName.trim()}
                    className="absolute right-3 top-3 bottom-3 px-8 bg-emerald-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-emerald-700 transition-all disabled:opacity-50 flex items-center gap-2 shadow-lg shadow-emerald-200"
                >
                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                    Research
                </button>
            </form>

            <AnimatePresence mode="wait">
                {isLoading ? (
                    <motion.div 
                        key="loading"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="py-20 flex flex-col items-center justify-center text-center"
                    >
                        <div className="relative w-24 h-24 mb-8">
                            <div className="absolute inset-0 border-4 border-emerald-100 rounded-full"></div>
                            <div className="absolute inset-0 border-4 border-emerald-600 rounded-full border-t-transparent animate-spin"></div>
                            <Building className="absolute inset-0 m-auto w-10 h-10 text-emerald-600" />
                        </div>
                        <h3 className="text-xl font-black text-slate-900 uppercase tracking-widest mb-2">Scanning the Web</h3>
                        <p className="text-sm text-slate-500 max-w-xs mx-auto font-medium">Our AI is gathering intelligence on {companyName} from the latest news and reports...</p>
                    </motion.div>
                ) : report ? (
                    <motion.div 
                        key="report"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-8"
                    >
                        <div className="p-8 bg-white border-2 border-slate-100 rounded-[2.5rem] shadow-sm relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-8">
                                <Globe className="w-12 h-12 text-slate-50" />
                            </div>
                            
                            <div className="prose prose-slate max-w-none prose-headings:font-black prose-headings:uppercase prose-headings:tracking-widest prose-headings:text-slate-900 prose-p:text-slate-600 prose-p:font-medium prose-li:text-slate-600 prose-li:font-medium">
                                <div className="flex items-center gap-3 mb-8">
                                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center border border-emerald-100">
                                        <Target className="w-6 h-6 text-emerald-600" />
                                    </div>
                                    <h3 className="text-xl font-black text-slate-900 uppercase tracking-widest m-0">Intelligence Report</h3>
                                </div>
                                
                                <div className="whitespace-pre-wrap text-slate-700 leading-relaxed font-medium">
                                    {report}
                                </div>
                            </div>

                            <div className="mt-12 pt-8 border-t border-slate-100 flex items-center justify-between">
                                <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest">
                                    <Newspaper className="w-4 h-4" />
                                    Source: Google Search Real-time
                                </div>
                                <button className="flex items-center gap-2 text-emerald-600 text-xs font-black uppercase tracking-widest hover:gap-3 transition-all">
                                    Open Official Site <ExternalLink className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        {/* Quick Actions */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="p-6 bg-slate-50 rounded-3xl border-2 border-slate-100 hover:border-emerald-500 transition-all cursor-pointer group">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-all">
                                        <Rocket className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest">Tailor Resume</h4>
                                        <p className="text-xs text-slate-500 font-medium">Optimize for this company's culture.</p>
                                    </div>
                                </div>
                            </div>
                            <div className="p-6 bg-slate-50 rounded-3xl border-2 border-slate-100 hover:border-emerald-500 transition-all cursor-pointer group">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-all">
                                        <Target className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest">Interview Prep</h4>
                                        <p className="text-xs text-slate-500 font-medium">Generate company-specific questions.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ) : (
                    <div className="py-20 text-center border-2 border-dashed border-slate-100 rounded-[2.5rem]">
                        <Building className="w-16 h-16 text-slate-200 mx-auto mb-6" />
                        <h3 className="text-lg font-black text-slate-900 uppercase tracking-widest mb-2">Ready for Intelligence</h3>
                        <p className="text-sm text-slate-500 max-w-xs mx-auto font-medium">Enter a company name above to get a deep-dive report on their mission, latest news, and technology stack.</p>
                    </div>
                )}
            </AnimatePresence>

            {error && (
                <div className="p-4 bg-red-50 text-red-600 text-xs font-bold rounded-xl border border-red-100">
                    {error}
                </div>
            )}
        </div>
    );
};

export default CompanyResearchPanel;
