
import React from 'react';
import { motion } from 'framer-motion';
import { FadeIn, FadeInStagger, FadeInStaggerItem } from './FadeIn';
import { Check } from 'lucide-react';

const Pricing: React.FC = () => {
    return (
        <section className="py-24 sm:py-32 bg-slate-50 relative overflow-hidden" id="pricing">
            {/* Background Elements */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px]"></div>
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-[400px] bg-emerald-100/40 rounded-full blur-[120px] -z-10" />

            <div className="max-w-7xl mx-auto px-6 relative z-10">
                <FadeIn className="text-center max-w-3xl mx-auto mb-20">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-100 mb-6">
                        <span className="flex h-2 w-2 rounded-full bg-emerald-600"></span>
                        <span className="text-xs font-bold uppercase tracking-widest text-emerald-600">Pricing</span>
                    </div>
                    <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 mb-6 tracking-tight">
                        Simple, transparent <br className="hidden sm:block" />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-600">pricing.</span>
                    </h2>
                    <p className="text-lg sm:text-xl text-slate-600 font-medium leading-relaxed">
                        Invest in your career for less than the price of a lunch.
                    </p>
                </FadeIn>

                <FadeInStagger className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto items-center">
                    {/* Free Tier */}
                    <FadeInStaggerItem>
                        <div className="bg-white rounded-[2rem] p-8 sm:p-10 shadow-xl shadow-slate-200/40 border border-slate-100 hover:shadow-2xl hover:shadow-slate-200/60 transition-all duration-300 flex flex-col h-full relative group">
                            <div className="absolute inset-0 bg-gradient-to-br from-slate-50/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-[2rem]" />
                            <div className="relative z-10">
                                <h3 className="text-2xl font-bold text-slate-900 tracking-tight">Starter</h3>
                                <div className="my-8 flex items-baseline">
                                    <span className="text-6xl font-black text-slate-900 tracking-tight">$0</span>
                                    <span className="text-slate-500 ml-2 text-lg font-medium">/ forever</span>
                                </div>
                                <p className="text-slate-600 text-base mb-8 font-medium leading-relaxed">Perfect for building your first optimized resume.</p>
                                <button className="w-full py-4 px-6 bg-white border-2 border-slate-200 text-slate-900 font-bold rounded-xl hover:border-slate-900 transition-colors duration-300 text-lg">
                                    Get Started
                                </button>
                                <ul className="mt-10 space-y-5 text-base text-slate-600 font-medium">
                                    <li className="flex items-start gap-3">
                                        <div className="mt-1 bg-emerald-50 p-1 rounded-full"><Check className="w-4 h-4 text-emerald-600" /></div>
                                        1 Resume
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <div className="mt-1 bg-emerald-50 p-1 rounded-full"><Check className="w-4 h-4 text-emerald-600" /></div>
                                        Basic Templates
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <div className="mt-1 bg-emerald-50 p-1 rounded-full"><Check className="w-4 h-4 text-emerald-600" /></div>
                                        PDF Download
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </FadeInStaggerItem>

                    {/* Pro Tier */}
                    <FadeInStaggerItem>
                        <motion.div 
                            whileHover={{ y: -8 }}
                            className="bg-slate-900 rounded-[2.5rem] p-8 sm:p-10 shadow-2xl shadow-emerald-900/20 border border-slate-800 flex flex-col relative overflow-hidden h-full md:scale-105 z-10"
                        >
                            {/* Glow effect */}
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-1/2 bg-emerald-600/20 blur-[60px] rounded-full pointer-events-none" />
                            
                            <div className="absolute top-0 right-8 bg-gradient-to-b from-emerald-500 to-teal-600 text-white text-xs font-bold px-4 py-2 rounded-b-xl uppercase tracking-widest shadow-lg">
                                Most Popular
                            </div>
                            <div className="relative z-10">
                                <h3 className="text-2xl font-bold text-white tracking-tight mt-4">Professional</h3>
                                <div className="my-8 flex items-baseline">
                                    <span className="text-6xl font-black text-white tracking-tight">$12</span>
                                    <span className="text-slate-400 ml-2 text-lg font-medium">/ month</span>
                                </div>
                                <p className="text-slate-300 text-base mb-8 font-medium leading-relaxed">Full access to AI tools and unlimited resumes.</p>
                                <button className="w-full py-4 px-6 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-500 transition-colors duration-300 shadow-lg shadow-emerald-600/30 text-lg">
                                    Start Free Trial
                                </button>
                                <ul className="mt-10 space-y-5 text-base text-slate-300 font-medium">
                                    <li className="flex items-start gap-3">
                                        <div className="mt-1 bg-emerald-500/20 p-1 rounded-full"><Check className="w-4 h-4 text-emerald-400" /></div>
                                        Unlimited Resumes
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <div className="mt-1 bg-emerald-500/20 p-1 rounded-full"><Check className="w-4 h-4 text-emerald-400" /></div>
                                        AI Rewrite & Optimization
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <div className="mt-1 bg-emerald-500/20 p-1 rounded-full"><Check className="w-4 h-4 text-emerald-400" /></div>
                                        Job Tracker & Board
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <div className="mt-1 bg-emerald-500/20 p-1 rounded-full"><Check className="w-4 h-4 text-emerald-400" /></div>
                                        Cover Letter Generator
                                    </li>
                                </ul>
                            </div>
                        </motion.div>
                    </FadeInStaggerItem>

                    {/* Lifetime Tier */}
                    <FadeInStaggerItem>
                        <div className="bg-white rounded-[2rem] p-8 sm:p-10 shadow-xl shadow-slate-200/40 border border-slate-100 hover:shadow-2xl hover:shadow-slate-200/60 transition-all duration-300 flex flex-col h-full relative group">
                            <div className="absolute inset-0 bg-gradient-to-br from-slate-50/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-[2rem]" />
                            <div className="relative z-10">
                                <h3 className="text-2xl font-bold text-slate-900 tracking-tight">Lifetime</h3>
                                <div className="my-8 flex items-baseline">
                                    <span className="text-6xl font-black text-slate-900 tracking-tight">$149</span>
                                    <span className="text-slate-500 ml-2 text-lg font-medium">/ once</span>
                                </div>
                                <p className="text-slate-600 text-base mb-8 font-medium leading-relaxed">Pay once, own it forever. Includes all future updates.</p>
                                <button className="w-full py-4 px-6 bg-white border-2 border-slate-200 text-slate-900 font-bold rounded-xl hover:border-slate-900 transition-colors duration-300 text-lg">
                                    Get Lifetime
                                </button>
                                <ul className="mt-10 space-y-5 text-base text-slate-600 font-medium">
                                    <li className="flex items-start gap-3">
                                        <div className="mt-1 bg-slate-100 p-1 rounded-full"><Check className="w-4 h-4 text-slate-600" /></div>
                                        Everything in Pro
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <div className="mt-1 bg-slate-100 p-1 rounded-full"><Check className="w-4 h-4 text-slate-600" /></div>
                                        Priority Support
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <div className="mt-1 bg-slate-100 p-1 rounded-full"><Check className="w-4 h-4 text-slate-600" /></div>
                                        Early Access Features
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </FadeInStaggerItem>
                </FadeInStagger>
            </div>
        </section>
    );
};

export default Pricing;
