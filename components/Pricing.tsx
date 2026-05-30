
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FadeIn, FadeInStagger, FadeInStaggerItem } from './FadeIn';
import { Check, Sparkles, Zap, Shield, Star, ArrowRight } from 'lucide-react';

const Pricing: React.FC = () => {
    const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

    const tiers = [
        {
            name: "Starter",
            price: "$0",
            description: "Perfect for building your first optimized resume.",
            icon: Zap,
            features: [
                "1 AI-Powered Resume",
                "5 Job Application Trackings",
                "1 Saved Resume Version",
                "Standard PDF Export",
                "Basic ATS Analysis"
            ],
            cta: "Get Started",
            highlighted: false
        },
        {
            name: "Professional",
            price: billingCycle === 'monthly' ? "$12" : "$9",
            description: "Full access to AI tools and unlimited resumes.",
            icon: Sparkles,
            highlighted: true,
            badge: "Most Popular",
            features: [
                "Unlimited AI Resumes",
                "Unlimited Job Tracking",
                "Unlimited Resume Versions",
                "AI Cover Letter Generator",
                "AI Interview Preparation",
                "Smart Resume Tailoring",
                "Premium Templates",
                "Priority Support"
            ],
            cta: "Start Free Trial"
        },
        {
            name: "Lifetime",
            price: "$149",
            description: "Pay once, own it forever. Includes all future updates.",
            icon: Star,
            features: [
                "Everything in Pro",
                "Lifetime Access",
                "No Monthly Subscriptions",
                "Early Access to New Features",
                "Personal Branding Consultation",
                "Exclusive Resume Audits"
            ],
            cta: "Get Lifetime"
        }
    ];

    return (
        <section className="py-24 lg:py-32 bg-slate-50 relative overflow-hidden" id="pricing">
            {/* Background Elements */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px]"></div>
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-[400px] bg-emerald-100/30 rounded-full blur-[100px] -z-10" />

            <div className="max-w-7xl mx-auto px-6 relative z-10">
                <FadeIn className="text-center max-w-3xl mx-auto mb-20">
                    <h2 className="text-5xl lg:text-7xl font-extrabold text-slate-900 mb-6 tracking-tighter leading-[1]">
                        Simple, transparent <br className="hidden sm:block" />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500">pricing.</span>
                    </h2>
                    <p className="text-lg text-slate-500 font-normal leading-relaxed mb-12">
                        Invest in your career for less than the price of a lunch.
                    </p>

                    {/* Billing Toggle */}
                    <div className="flex items-center justify-center gap-4">
                        <span className={`text-[15px] font-medium ${billingCycle === 'monthly' ? 'text-slate-900' : 'text-slate-500'}`}>Monthly</span>
                        <button 
                            onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly')}
                            className="w-14 h-8 bg-slate-200 rounded-full p-1 relative transition-colors hover:bg-slate-300 shadow-inner outline-none"
                        >
                            <motion.div 
                                animate={{ x: billingCycle === 'monthly' ? 0 : 24 }}
                                className="w-6 h-6 bg-white rounded-full shadow-sm flex items-center justify-center"
                            >
                                <div className="w-4 h-4 bg-emerald-500 rounded-full" />
                            </motion.div>
                        </button>
                        <span className={`text-[15px] font-medium ${billingCycle === 'yearly' ? 'text-slate-900' : 'text-slate-500'} flex items-center gap-2`}>
                            Yearly <span className="text-emerald-700 text-[11px] font-semibold bg-emerald-100 px-2 py-0.5 rounded-full">Save 25%</span>
                        </span>
                    </div>
                </FadeIn>

                <FadeInStagger className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto items-stretch">
                    {tiers.map((tier, idx) => {
                        const Icon = tier.icon;
                        return (
                            <FadeInStaggerItem key={tier.name} className="h-full">
                                <motion.div 
                                    whileHover={{ y: -4 }}
                                    className={`h-full relative flex flex-col p-8 lg:p-10 rounded-3xl border transition-all duration-300 ${
                                        tier.highlighted 
                                        ? 'bg-slate-900 text-white border-transparent shadow-xl' 
                                        : 'bg-white text-slate-900 border-slate-200 shadow-sm hover:shadow-md'
                                    }`}
                                >
                                    {tier.badge && (
                                        <div className="absolute top-6 right-8 px-3 py-1 rounded-full bg-emerald-500 text-white text-[11px] font-semibold tracking-wide">
                                            {tier.badge}
                                        </div>
                                    )}

                                    <div className="mb-8">
                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-6 shadow-sm ${
                                            tier.highlighted ? 'bg-white/10 text-emerald-400 border border-white/10' : 'bg-slate-50 text-emerald-600 border border-slate-100'
                                        }`}>
                                            <Icon className="w-6 h-6" />
                                        </div>
                                        <h3 className="text-2xl font-semibold tracking-tight mb-2">{tier.name}</h3>
                                        <p className={`text-[14px] leading-relaxed ${tier.highlighted ? 'text-slate-400' : 'text-slate-500'}`}>
                                            {tier.description}
                                        </p>
                                    </div>

                                    <div className="mb-10">
                                        <div className="flex items-baseline gap-1">
                                            <span className="text-5xl lg:text-6xl font-bold tracking-tight">{tier.price}</span>
                                            {tier.price !== '$0' && tier.name !== 'Lifetime' && (
                                                <span className={`text-[15px] font-medium ${tier.highlighted ? 'text-slate-500' : 'text-slate-400'}`}>/mo</span>
                                            )}
                                            {tier.name === 'Lifetime' && (
                                                <span className={`text-[15px] font-medium ${tier.highlighted ? 'text-slate-500' : 'text-slate-400'}`}>once</span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex-1 space-y-4 mb-10">
                                        {tier.features.map((feature) => (
                                            <div key={feature} className="flex items-start gap-3">
                                                <div className={`mt-0.5 shrink-0 w-5 h-5 rounded-full flex items-center justify-center ${
                                                    tier.highlighted ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-50 text-emerald-600'
                                                }`}>
                                                    <Check className="w-3 h-3" />
                                                </div>
                                                <span className={`text-[14px] font-medium ${tier.highlighted ? 'text-slate-300' : 'text-slate-600'}`}>
                                                    {feature}
                                                </span>
                                            </div>
                                        ))}
                                    </div>

                                    <button className={`w-full py-4 rounded-xl font-medium text-[15px] transition-all flex items-center justify-center gap-2 active:scale-95 ${
                                        tier.highlighted 
                                        ? 'bg-white text-slate-900 hover:bg-slate-50 shadow-sm' 
                                        : 'bg-slate-900 text-white hover:bg-slate-800 shadow-sm'
                                    }`}>
                                        {tier.cta}
                                    </button>
                                </motion.div>
                            </FadeInStaggerItem>
                        );
                    })}
                </FadeInStagger>
            </div>
        </section>
    );
};

export default Pricing;
