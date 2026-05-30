import React from 'react';
import { motion } from 'framer-motion';
import { FadeIn } from './FadeIn';
import { Building, Rocket, Target, Briefcase, ArrowRight, FileText, Zap, MessageSquare, Users } from 'lucide-react';

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

const FeatureIcon3D: React.FC<{ iconUrl: string; fallback: React.ElementType }> = ({ iconUrl, fallback: Fallback }) => {
    const [error, setError] = React.useState(false);

    if (error) {
        return <Fallback className="w-8 h-8 relative z-10 group-hover:scale-110 transition-transform duration-300 group-hover:text-white text-emerald-600" />;
    }

    return (
        <img 
            src={iconUrl} 
            alt="Feature Icon" 
            className="w-16 h-16 object-contain relative z-10 group-hover:scale-125 transition-all duration-500 drop-shadow-[0_10px_10px_rgba(16,185,129,0.3)]"
            onError={() => setError(true)}
            referrerPolicy="no-referrer"
        />
    );
};

const SocialProof: React.FC = () => {
    const services = [
        { 
            title: "AI Resume", 
            desc: "ATS-optimized resumes that get shortlisted", 
            icon: FileText, 
            iconUrl: "https://img.icons8.com/3d-fluency/180/resume.png" 
        },
        { 
            title: "Smart Jobs", 
            desc: "AI-matched roles tailored to your profile", 
            icon: Zap, 
            iconUrl: "https://img.icons8.com/3d-fluency/180/star.png" 
        },
        { 
            title: "Interview Prep", 
            desc: "Practice with real-world AI interview simulations", 
            icon: MessageSquare, 
            iconUrl: "https://img.icons8.com/3d-fluency/180/conference-call.png" 
        },
        { 
            title: "Hiring Network", 
            desc: "Connect with recruiters and hidden job opportunities", 
            icon: Users, 
            iconUrl: "https://img.icons8.com/3d-fluency/180/handshake.png" 
        }
    ];

    return (
        <section className="py-24 sm:py-32 bg-slate-50 relative overflow-hidden" id="networks">
            <div className="max-w-7xl mx-auto px-6 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    >
                        <h2 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-slate-900 leading-[1] mb-8 tracking-tighter">
                            Connect with the right <br className="hidden sm:block" />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500">opportunities.</span>
                        </h2>
                        <p className="text-lg text-slate-500 font-normal leading-relaxed mb-12 max-w-lg">
                            HuntDesk uses AI to match your resume with the best jobs, optimize your profile, and connect you with hiring networks that matter.
                        </p>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 pt-12 border-t border-slate-200">
                            <div>
                                <div className="text-5xl sm:text-6xl font-extrabold text-slate-900 tracking-tighter">94%</div>
                                <div className="text-[14px] font-semibold tracking-wide uppercase text-slate-500 mt-2">Match Accuracy</div>
                            </div>
                            <div>
                                <div className="text-5xl sm:text-6xl font-extrabold text-slate-900 tracking-tighter">12k+</div>
                                <div className="text-[14px] font-semibold tracking-wide uppercase text-slate-500 mt-2">Active Seekers</div>
                            </div>
                            <div>
                                <div className="text-5xl sm:text-6xl font-extrabold text-slate-900 tracking-tighter">500+</div>
                                <div className="text-[14px] font-semibold tracking-wide uppercase text-slate-500 mt-2">Hiring Companies</div>
                            </div>
                        </div>
                    </motion.div>

                    <div className="relative">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                            {services.map((item, i) => {
                                return (
                                    <motion.div 
                                        key={i}
                                        initial={{ opacity: 0, y: 20 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ duration: 0.6, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
                                        whileHover={{ y: -4, scale: 1.02 }}
                                        className="p-8 bg-white rounded-3xl shadow-sm border border-slate-200/60 transition-all duration-500 group relative overflow-hidden flex flex-col hover:shadow-md"
                                    >
                                        <div className="relative z-10 w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center mb-6 transition-all duration-500 group-hover:scale-110 border border-slate-100 shadow-sm">
                                            <FeatureIcon3D iconUrl={item.iconUrl} fallback={item.icon} />
                                        </div>
                                        <h3 className="relative z-10 text-xl font-semibold text-slate-900 mb-2 tracking-tight">{item.title}</h3>
                                        <p className="relative z-10 text-[15px] text-slate-500 font-normal leading-relaxed mb-6 flex-grow">{item.desc}</p>
                                        
                                        <div className="relative z-10 flex items-center gap-2 text-emerald-600 font-medium text-[14px] opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-2 group-hover:translate-y-0 mt-auto">
                                            Explore <ArrowRight className="w-4 h-4" />
                                        </div>
                                    </motion.div>
                                );
                            })}
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
