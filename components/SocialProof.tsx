import React from 'react';
import { motion } from 'framer-motion';
import { FadeIn } from './FadeIn';
import { Building, Rocket, Target, Briefcase, ArrowRight } from 'lucide-react';

// FIX: Added and exported LogoBlock3D component to resolve import error in components/builder/JobTracker.tsx
export const LogoBlock3D: React.FC<{ name: string; logoUrl: string; size?: 'small' | 'large' }> = ({ name, logoUrl, size = 'small' }) => {
    const dimensions = size === 'large' ? 'w-12 h-12' : 'w-10 h-10';
    return (
        <div className={`${dimensions} bg-white rounded-xl shadow-lg border border-slate-100 flex items-center justify-center p-2 relative overflow-hidden group/logo`}>
            <div className="absolute inset-0 bg-gradient-to-br from-slate-50 to-white opacity-50" />
            <img 
                src={logoUrl} 
                alt={name} 
                className="w-full h-full object-contain relative z-10 grayscale group-hover/logo:grayscale-0 transition-all duration-300"
                referrerPolicy="no-referrer"
                onError={(e) => {
                    (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=f1f5f9&color=64748b&bold=true`;
                }}
            />
        </div>
    );
};

const SocialProof: React.FC = () => {
    return (
        <section className="py-24 sm:py-32 bg-white relative overflow-hidden" id="networks">
            <div className="max-w-7xl mx-auto px-6 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    >
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 mb-6">
                            <span className="flex h-2 w-2 rounded-full bg-blue-600"></span>
                            <span className="text-xs font-bold uppercase tracking-widest text-blue-600">The Elite Network</span>
                        </div>
                        <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 leading-[1.1] mb-6 tracking-tight">
                            Connect with the <br className="hidden sm:block" />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">experts.</span>
                        </h2>
                        <p className="text-lg sm:text-xl text-slate-600 font-medium leading-relaxed mb-10 max-w-lg">
                            HuntDesk connects you with the most exclusive talent ecosystems in the world, optimized by executive-level AI strategy.
                        </p>
                        
                        <div className="grid grid-cols-2 gap-8 pt-8 border-t border-slate-100">
                            <div>
                                <div className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight">94%</div>
                                <div className="text-sm font-bold text-slate-500 uppercase tracking-widest mt-2">Placement Rate</div>
                            </div>
                            <div>
                                <div className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight">12k+</div>
                                <div className="text-sm font-bold text-slate-500 uppercase tracking-widest mt-2">Elite Members</div>
                            </div>
                        </div>
                    </motion.div>

                    <div className="relative">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                            {[
                                { title: "Enterprise", desc: "Fortune 500 networks", icon: Building, color: "blue" },
                                { title: "Venture", desc: "High-growth startups", icon: Rocket, color: "orange" },
                                { title: "Executive", desc: "C-suite leadership", icon: Target, color: "red" },
                                { title: "Capital", desc: "Private equity & VC", icon: Briefcase, color: "indigo" }
                            ].map((item, i) => (
                                <motion.div 
                                    key={i}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.6, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
                                    whileHover={{ y: -4, scale: 1.02 }}
                                    className="p-8 bg-white rounded-[2rem] shadow-xl shadow-slate-200/40 border border-slate-100 transition-all duration-300 group relative overflow-hidden flex flex-col"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                    
                                    <div className={`relative z-10 w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mb-6 transition-all duration-300 group-hover:bg-blue-600 group-hover:scale-110 border border-blue-100/50`}>
                                        <item.icon className="w-7 h-7 text-blue-600 group-hover:text-white transition-colors duration-300" />
                                    </div>
                                    <h3 className="relative z-10 text-xl font-bold text-slate-900 mb-2 tracking-tight">{item.title}</h3>
                                    <p className="relative z-10 text-sm text-slate-600 font-medium leading-relaxed mb-6 flex-grow">{item.desc}</p>
                                    
                                    <div className="relative z-10 flex items-center gap-2 text-blue-600 font-bold text-xs uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0 mt-auto">
                                        Explore Network <ArrowRight className="w-4 h-4" />
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                        
                        {/* Decorative blob */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-50/50 rounded-full blur-[100px] -z-10" />
                    </div>
                </div>
            </div>
        </section>
    );
};

export default SocialProof;
