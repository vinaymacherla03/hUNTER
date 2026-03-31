
import React from 'react';
import { motion } from 'framer-motion';
import Hero3D from './Hero3D';
import HowItWorks from './HowItWorks';
import Features from './Features';
import Testimonials from './Testimonials';
import Faq from './Faq';
import FinalCTA from './FinalCTA';
import Footer from './Footer';

const LandingPage: React.FC<{ onGetStarted: () => void; onEnhance: any; draftExists: boolean; onLoadDraft: any }> = ({ onGetStarted }) => {
    return (
        <div className="relative min-h-screen bg-[#f5f5f4] text-[#0a0a0a] font-sans overflow-x-hidden">
            {/* Split Layout Hero */}
            <main className="grid grid-cols-1 lg:grid-cols-2 min-h-screen">
                {/* Left Pane: Content */}
                <div className="flex flex-col justify-center px-8 lg:px-16 xl:px-24 py-20 relative border-r border-[#0a0a0a]/10">
                    {/* Vertical rail text */}
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 hidden xl:block" style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>
                        <span className="text-[11px] uppercase tracking-[0.08em] font-semibold opacity-50">HuntDesk • Career Command Center</span>
                    </div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                        className="max-w-2xl"
                    >
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#0a0a0a] mb-8 text-xs font-bold uppercase tracking-widest">
                            <span className="flex h-2 w-2 rounded-full bg-[#0a0a0a] animate-pulse"></span>
                            AI Resume Builder
                        </div>
                        
                        <h1 className="text-6xl sm:text-7xl xl:text-[112px] font-semibold leading-[0.88] tracking-[-0.02em] mb-8">
                            Land more<br />interviews.
                        </h1>
                        
                        <p className="text-lg sm:text-xl opacity-70 font-medium leading-relaxed max-w-lg mb-12">
                            Create a professional resume that results in interview callbacks. Pick a template, use AI to optimize your content, and build your resume in minutes.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center gap-6">
                            <button 
                                onClick={onGetStarted}
                                className="w-full sm:w-auto flex items-center justify-center px-8 py-4 text-sm font-bold text-white bg-[#0a0a0a] rounded-full hover:bg-black/80 transition-colors"
                            >
                                Build Your Resume
                            </button>
                            
                            <button 
                                onClick={onGetStarted}
                                className="w-full sm:w-auto flex items-center justify-center px-8 py-4 text-sm font-bold text-[#0a0a0a] bg-transparent border border-[#0a0a0a] rounded-full hover:bg-black/5 transition-colors"
                            >
                                View Templates
                            </button>
                        </div>
                    </motion.div>
                </div>

                {/* Right Pane: Visuals */}
                <div className="bg-[#0a0a0a] text-white flex items-center justify-center relative overflow-hidden min-h-[500px] lg:min-h-screen">
                    {/* Decorative elements */}
                    <div className="absolute top-10 right-10 w-24 h-24 rounded-full border border-white/20 flex items-center justify-center text-[10px] uppercase tracking-[0.14em] text-center p-2">
                        ATS<br/>Optimized
                    </div>
                    
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 1, delay: 0.2 }}
                        className="relative z-10 w-full max-w-lg p-8"
                    >
                        <div className="bg-white text-[#0a0a0a] rounded-3xl p-6 shadow-2xl transform -rotate-2">
                            <div className="flex items-center gap-4 mb-6 border-b border-black/10 pb-4">
                                <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                                <div>
                                    <div className="h-4 w-32 bg-gray-200 rounded mb-2"></div>
                                    <div className="h-3 w-24 bg-gray-100 rounded"></div>
                                </div>
                            </div>
                            <div className="space-y-3">
                                <div className="h-3 w-full bg-gray-100 rounded"></div>
                                <div className="h-3 w-5/6 bg-gray-100 rounded"></div>
                                <div className="h-3 w-4/6 bg-gray-100 rounded"></div>
                            </div>
                            <div className="mt-6 flex gap-2">
                                <div className="px-3 py-1 bg-emerald-100 text-emerald-800 text-xs rounded-full font-medium">React</div>
                                <div className="px-3 py-1 bg-blue-100 text-blue-800 text-xs rounded-full font-medium">TypeScript</div>
                            </div>
                        </div>
                        
                        <div className="absolute -bottom-10 -right-10 bg-[#f5f5f4] text-[#0a0a0a] rounded-full px-6 py-4 shadow-xl transform rotate-6 border border-[#0a0a0a]/10 font-medium text-sm">
                            ✨ AI Enhanced
                        </div>
                    </motion.div>
                </div>
            </main>

            <div className="relative z-20 bg-[#f5f5f4]">
                <HowItWorks />
                <Features />
                <Testimonials />
                <Faq />
                <FinalCTA onGetStarted={onGetStarted} />
                <Footer />
            </div>
        </div>
    );
};

export default LandingPage;
