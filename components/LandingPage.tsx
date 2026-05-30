
import React, { useRef, useState } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { 
    ArrowRight, 
    CheckCircle2, 
    Check,
    Globe, 
    TrendingUp, 
    Users, 
    Zap, 
    Shield, 
    Cpu, 
    Layers,
    Sparkles,
    BarChart3,
    Search,
    MessageSquare,
    Download,
    History,
    Layout,
    Target,
    Eye,
    ShieldCheck,
    Play,
    UploadCloud,
    Loader2,
    ChevronDown,
    AlertCircle
} from 'lucide-react';
import Footer from './Footer';
import { FadeIn, FadeInStagger, FadeInStaggerItem } from './FadeIn';
import SocialProof from './SocialProof';
import InteractiveTemplateShowcase from './InteractiveTemplateShowcase';
import Pricing from './Pricing';
import { extractTextFromFile } from '../utils/fileProcessing';
import { toast } from 'sonner';

const FeatureIcon: React.FC<{ icon: any; title: string; fallback: any }> = ({ icon, title, fallback: FallbackIcon }) => {
    const [failed, setFailed] = React.useState(false);
    const is3D = typeof icon === 'string';

    if (!is3D || failed) {
        const IconComponent = is3D ? FallbackIcon : icon;
        return <IconComponent className="w-12 h-12 text-emerald-500" />;
    }

    return (
        <motion.img 
            src={icon} 
            alt={title} 
            className="w-20 h-20 object-contain drop-shadow-[0_20px_30px_rgba(0,0,0,0.15)]"
            referrerPolicy="no-referrer"
            onError={() => setFailed(true)}
            whileHover={{ 
                rotateY: 15, 
                rotateX: -15, 
                scale: 1.1,
                filter: "brightness(1.1)"
            }}
            transition={{ type: "spring", stiffness: 300, damping: 15 }}
        />
    );
};

const LandingPage: React.FC<{ 
    onGetStarted: () => void; 
    onEnhance: (text: string, jobDesc: string, jobTitle: string) => void; 
    draftExists: boolean; 
    onLoadDraft: () => void; 
}> = ({ onGetStarted, onEnhance, draftExists, onLoadDraft }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [isExtracting, setIsExtracting] = useState(false);

    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end end"]
    });

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleFileChange = async (file: File) => {
        if (!file) return;
        
        console.log(`[LandingPage] Starting extraction for: ${file.name} (${file.type})`);
        setIsExtracting(true);
        try {
            const text = await extractTextFromFile(file);
            console.log(`[LandingPage] Extraction successful. Length: ${text.length} chars`);
            
            if (text.trim()) {
                toast.success(`Successfully extracted text from ${file.name}`);
                // Use a small delay to let the toast be seen before the overlay disappears or state changes
                setTimeout(async () => {
                    await onEnhance(text, '', '');
                }, 500);
            } else {
                toast.error("Could not extract any text from the file. Please try copy-pasting.");
                setIsExtracting(false);
            }
        } catch (err: any) {
            console.error("[LandingPage] File extraction error:", err);
            toast.error(err.message || "Failed to process file. Please try copy-pasting.");
            setIsExtracting(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        if (file) {
            handleFileChange(file);
        }
    };

    const triggerFileSelect = () => {
        fileInputRef.current?.click();
    };

    const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
    const scale = useTransform(scrollYProgress, [0, 0.2], [1, 0.95]);
    const y = useTransform(scrollYProgress, [0, 0.2], [0, -50]);

    return (
        <div 
            ref={containerRef} 
            className="relative min-h-screen bg-slate-50 text-slate-900 font-sans overflow-x-hidden selection:bg-emerald-500 selection:text-white"
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
        >
            {/* Global Drag Overlay */}
            <AnimatePresence>
                {isDragging && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] bg-emerald-500/10 backdrop-blur-md border-4 border-dashed border-emerald-500 flex flex-col items-center justify-center pointer-events-none"
                    >
                        <div className="bg-white p-12 rounded-[3rem] shadow-2xl flex flex-col items-center gap-6">
                            <UploadCloud className="w-20 h-20 text-emerald-500 animate-bounce" />
                            <div className="text-center">
                                <h2 className="text-3xl font-black text-slate-900 mb-2">Drop your resume here</h2>
                                <p className="text-slate-500 font-medium">We'll automatically extract your experience and skills.</p>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Global Extraction Overlay */}
            <AnimatePresence>
                {isExtracting && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] bg-slate-950/80 backdrop-blur-xl flex flex-col items-center justify-center"
                    >
                        <div className="flex flex-col items-center gap-8">
                            <div className="relative">
                                <Loader2 className="w-24 h-24 text-emerald-500 animate-spin" />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <Sparkles className="w-8 h-8 text-emerald-400 animate-pulse" />
                                </div>
                            </div>
                            <div className="text-center">
                                <h2 className="text-3xl font-black text-white mb-2">Analyzing Resume</h2>
                                <p className="text-slate-400 font-medium">Our AI is re-engineering your career narrative...</p>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
            {/* Dynamic Background Elements */}
            <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
                <motion.div 
                    animate={{ 
                        scale: [1, 1.2, 1],
                        opacity: [0.05, 0.08, 0.05],
                        x: [0, 50, 0],
                        y: [0, 30, 0]
                    }}
                    transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-500/5 rounded-full blur-[120px]" 
                />
                <motion.div 
                    animate={{ 
                        scale: [1, 1.1, 1],
                        opacity: [0.05, 0.07, 0.05],
                        x: [0, -40, 0],
                        y: [0, -20, 0]
                    }}
                    transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 2 }}
                    className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-500/5 rounded-full blur-[120px]" 
                />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full opacity-[0.02] mix-blend-overlay" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }} />
            </div>

            {/* Hero Section - Premium Halftone Aesthetic */}
            <section className="relative min-h-[90vh] flex flex-col items-center justify-center pt-32 pb-20 px-6 overflow-hidden bg-[#fafafa]">
                {/* Soft Gradient Blob Backgrounds + Premium Halftone */}
                <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
                    {/* Halftone / Dotted Background */}
                    <div 
                        className="absolute inset-0 opacity-[0.3]"
                        style={{
                            backgroundImage: `radial-gradient(#9ca3af 2px, transparent 2px)`,
                            backgroundSize: '32px 32px',
                            maskImage: 'radial-gradient(ellipse 80% 50% at 50% 50%, black 10%, transparent 100%)',
                            WebkitMaskImage: 'radial-gradient(ellipse 80% 50% at 50% 50%, black 10%, transparent 100%)',
                        }}
                    />
                    
                    <motion.div 
                        animate={{ 
                            scale: [1, 1.05, 1],
                            opacity: [0.3, 0.4, 0.3],
                            x: [0, 20, 0]
                        }}
                        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute top-[10%] left-[20%] w-[500px] h-[500px] bg-blue-400/10 rounded-full blur-[100px]" 
                    />
                    <motion.div 
                        animate={{ 
                            scale: [1, 1.1, 1],
                            opacity: [0.2, 0.3, 0.2],
                            y: [0, 30, 0]
                        }}
                        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 2 }}
                        className="absolute bottom-[20%] right-[10%] w-[600px] h-[600px] bg-emerald-400/10 rounded-full blur-[120px]" 
                    />
                </div>

                <div className="max-w-6xl mx-auto relative z-20 w-full flex flex-col items-center text-center">
                    <FadeIn delay={0.1}>
                        <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-slate-200/70 text-slate-500 text-[12px] font-bold mb-12 uppercase tracking-[0.1em]">
                            <Sparkles className="w-4 h-4 text-emerald-500" />
                            Introducing AI Career Engineering
                        </div>
                    </FadeIn>
                    
                    <FadeIn delay={0.2}>
                        <h1 className="flex justify-center items-center gap-3 sm:gap-4 lg:gap-6 text-7xl sm:text-[8rem] lg:text-[9.5rem] font-bold text-[#14151f] leading-none tracking-tighter mb-8 whitespace-nowrap">
                            <span>Get hired</span>
                            <span className="inline-block bg-[#10b981] w-[180px] sm:w-[280px] lg:w-[350px] h-[55px] sm:h-[85px] lg:h-[110px] rounded-sm transform translate-y-1 relative overflow-hidden">
                                <span className="absolute inset-0 bg-white/20 animate-[shimmer_2s_infinite] -skew-x-12 translate-x-[-100%]" style={{ animationName: 'shimmer', animationDuration: '2s', animationIterationCount: 'infinite' }} />
                            </span>
                            <span>faster.</span>
                        </h1>
                    </FadeIn>
                    
                    <FadeIn delay={0.3}>
                        <p className="text-xl sm:text-[26px] text-slate-500 font-medium leading-normal mb-12 max-w-3xl mx-auto">
                            The ultimate career copilot. Intelligent resumes, lightning-fast job matching, and real-time interview guidance—all in one place.
                        </p>
                    </FadeIn>

                    <FadeIn delay={0.4}>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto">
                            <input 
                                type="file" 
                                ref={fileInputRef}
                                onChange={(e) => e.target.files?.[0] && handleFileChange(e.target.files[0])}
                                className="hidden"
                                accept=".pdf,.docx,.txt"
                            />
                            <motion.button 
                                whileHover={{ scale: 1.02, y: -2 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={onGetStarted}
                                className="w-full sm:w-auto group relative flex items-center justify-center gap-3 px-10 py-5 text-[16px] font-bold text-white bg-emerald-600 rounded-full hover:bg-emerald-500 transition-all shadow-[0_15px_40px_rgba(16,185,129,0.3)] hover:shadow-[0_20px_50px_rgba(16,185,129,0.4)]"
                            >
                                <span>Get Started Free</span>
                                <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                            </motion.button>

                            <motion.button 
                                whileHover={{ scale: 1.02, y: -2 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={triggerFileSelect}
                                className="w-full sm:w-auto group relative flex items-center justify-center gap-3 px-10 py-5 text-[16px] font-bold text-slate-700 bg-white border border-slate-200 rounded-full hover:bg-slate-50 transition-all shadow-md hover:shadow-lg hover:border-emerald-200"
                            >
                                <UploadCloud className="w-5 h-5 text-slate-400 group-hover:text-emerald-500 transition-colors" />
                                <span>Import Resume</span>
                            </motion.button>

                            <AnimatePresence>
                                {draftExists && (
                                    <motion.button 
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                        whileHover={{ scale: 1.02, y: -2 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={onLoadDraft}
                                        className="w-full sm:w-auto group relative flex items-center justify-center gap-3 px-8 py-4 text-[15px] font-bold text-slate-700 bg-emerald-50 border border-emerald-200 rounded-full hover:bg-emerald-100 transition-all shadow-sm hover:shadow-md"
                                    >
                                        <History className="w-5 h-5 text-emerald-600 transition-colors" />
                                        <span>Load Draft</span>
                                    </motion.button>
                                )}
                            </AnimatePresence>
                        </div>
                    </FadeIn>

                    <FadeIn delay={0.6} className="w-full mt-24 sm:mt-32">
                        <div className="relative w-full max-w-6xl mx-auto perspective-3000">
                            <motion.div 
                                initial={{ rotateX: 25, y: 150, opacity: 0 }}
                                animate={{ rotateX: 0, y: 0, opacity: 1 }}
                                whileHover={{ rotateX: 5, rotateY: 5, scale: 1.02 }}
                                transition={{ 
                                    rotateX: { duration: 1.5, ease: [0.16, 1, 0.3, 1] },
                                    whileHover: { duration: 0.4 }
                                }}
                                className="relative rounded-3xl sm:rounded-2xl border border-white/20 bg-white/40 backdrop-blur-3xl shadow-[0_40px_120px_-20px_rgba(0,0,0,0.2),inset_0_1px_0_rgba(255,255,255,0.8)] overflow-hidden aspect-[16/10]"
                            >
                                {/* Animated Background Mesh */}
                                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03]" />
                                <motion.div 
                                    animate={{ backgroundPosition: ["0% 0%", "100% 100%"] }}
                                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                                    className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-emerald-100/30 via-transparent to-transparent" 
                                />
                                {/* Glossy Overlay */}
                                <div className="absolute inset-0 bg-gradient-to-tr from-white/30 via-transparent to-white/5 pointer-events-none z-30" />

                                {/* Mac-like Window Header */}
                                <div className="absolute top-0 left-0 right-0 h-12 border-b border-slate-200/50 bg-white/40 flex items-center px-4 gap-2 z-20 backdrop-blur-md">
                                    <div className="flex gap-2 mr-auto relative z-10">
                                        <div className="w-3 h-3 rounded-full bg-red-400 border border-red-500/20" />
                                        <div className="w-3 h-3 rounded-full bg-amber-400 border border-amber-500/20" />
                                        <div className="w-3 h-3 rounded-full bg-emerald-400 border border-emerald-500/20" />
                                    </div>
                                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                        <div className="px-32 py-1.5 rounded-md bg-white/60 border border-slate-200/50 text-[12px] text-slate-500 font-medium flex items-center justify-center gap-2 shadow-sm">
                                            <Shield className="w-3 h-3" />
                                            huntdesk.app
                                        </div>
                                    </div>
                                </div>

                                {/* Dashboard UI Content */}
                                <div className="pt-12 h-full flex bg-[#FCFCFD]">
                                    {/* Left Sidebar */}
                                    <div className="hidden md:flex w-[260px] border-r border-slate-200/60 bg-white/80 flex-col p-5 gap-8">
                                        <div className="flex items-center gap-3 px-2">
                                            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-[0_4px_12px_rgba(16,185,129,0.3)]">
                                                <Layout className="w-4 h-4 text-white" />
                                            </div>
                                            <div>
                                                <div className="text-[14px] font-bold text-slate-900 tracking-tight leading-tight">Builder</div>
                                                <div className="text-[11px] font-medium text-slate-500">Untitled Resume</div>
                                            </div>
                                        </div>
                                        <div className="flex flex-col gap-1.5">
                                            {['Identity', 'Experience', 'Education', 'Skills', 'Projects'].map((item, i) => (
                                                <div key={item} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-semibold transition-all cursor-pointer ${i === 1 ? 'bg-emerald-50/80 text-emerald-700 shadow-sm border border-emerald-100/50' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'}`}>
                                                    <div className={`w-1.5 h-1.5 rounded-full ${i === 1 ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]' : 'bg-slate-300'}`} />
                                                    {item}
                                                </div>
                                            ))}
                                        </div>
                                         <div className="mt-auto px-4 py-4 rounded-xl border border-slate-200/60 bg-slate-50/50 flex flex-col gap-3">
                                             <div className="flex justify-between items-center">
                                                 <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Version</span>
                                                 <span className="text-[10px] font-bold text-slate-600 bg-white px-2 py-0.5 rounded border border-slate-200">v2.4</span>
                                             </div>
                                             <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                                                 <div className="w-3/4 h-full bg-slate-400 rounded-full" />
                                             </div>
                                         </div>
                                    </div>

                                    {/* Center Canvas */}
                                    <div className="flex-1 p-8 sm:p-12 flex flex-col items-center justify-start relative overflow-hidden bg-[#F4F4F5]">
                                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.04]" />
                                        
                                        {/* Floating Editor Toolbar */}
                                        <motion.div 
                                            initial={{ y: -20, opacity: 0 }}
                                            animate={{ y: 0, opacity: 1 }}
                                            transition={{ delay: 1, duration: 0.8 }}
                                            className="w-full max-w-[650px] mb-8 h-12 rounded-xl bg-white border border-slate-200/80 shadow-[0_8px_30px_-12px_rgba(0,0,0,0.1)] flex items-center px-4 gap-4 relative z-20 shrink-0"
                                        >
                                             <div className="flex items-center gap-1.5 border-r border-slate-200/60 pr-4">
                                                 <div className="w-7 h-7 rounded hover:bg-slate-100 flex items-center justify-center cursor-pointer text-slate-700 font-serif font-bold text-sm">B</div>
                                                 <div className="w-7 h-7 rounded hover:bg-slate-100 flex items-center justify-center cursor-pointer text-slate-700 font-serif italic text-sm">I</div>
                                                 <div className="w-7 h-7 rounded hover:bg-slate-100 flex items-center justify-center cursor-pointer text-slate-700 font-serif underline text-sm">U</div>
                                             </div>
                                             <div className="flex items-center gap-2 border-r border-slate-200/60 pr-4 cursor-pointer">
                                                 <div className="text-[13px] font-medium text-slate-600">Inter</div>
                                                 <ChevronDown className="w-4 h-4 text-slate-400" />
                                             </div>
                                             <div className="flex items-center gap-2">
                                                 <div className="text-[13px] font-medium text-slate-600">14px</div>
                                             </div>
                                             <div className="ml-auto flex items-center gap-2">
                                                  <div className="px-3 py-1.5 bg-emerald-50 text-emerald-600 rounded-md text-[11px] font-bold border border-emerald-100 uppercase tracking-wide">Autosaved</div>
                                             </div>
                                        </motion.div>

                                        <motion.div 
                                            initial={{ y: 40, opacity: 0 }}
                                            animate={{ y: 0, opacity: 1 }}
                                            transition={{ delay: 1.2, duration: 1, ease: "easeOut" }}
                                            className="w-full max-w-[650px] bg-white rounded-xl shadow-[0_20px_60px_-20px_rgba(0,0,0,0.15)] relative z-10 p-10 sm:p-14 flex flex-col gap-10 ring-1 ring-slate-900/5 overflow-hidden"
                                        >
                                            {/* Resume Skeleton Header */}
                                            <div className="flex flex-col items-center gap-4 border-b border-slate-100 pb-8">
                                                 <div className="w-56 h-8 bg-slate-800 rounded-md" />
                                                 <div className="w-72 h-3 bg-slate-300 rounded-md" />
                                                 <div className="flex gap-6 mt-1">
                                                     <div className="w-24 h-2 bg-slate-200 rounded-md" />
                                                     <div className="w-24 h-2 bg-slate-200 rounded-md" />
                                                     <div className="w-24 h-2 bg-slate-200 rounded-md" />
                                                 </div>
                                            </div>

                                            {/* Resume Skeleton Experience */}
                                            <div className="flex flex-col gap-8 pb-10">
                                                <div className="w-40 h-5 bg-slate-300 rounded-md mb-2" />
                                                
                                                <div className="flex flex-col gap-5">
                                                    <div className="flex justify-between items-center">
                                                         <div className="w-48 h-5 bg-slate-800 rounded-md" />
                                                         <div className="w-24 h-4 bg-slate-200 rounded-md" />
                                                    </div>
                                                    <div className="w-36 h-4 bg-slate-400 rounded-md mb-2" />
                                                    <div className="space-y-4 pl-5 border-l-2 border-emerald-400 relative">
                                                        {/* AI Optimization Highlight Marker */}
                                                        <div className="absolute -left-[5px] top-1.5 w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)]" />
                                                        <div className="w-full h-4 bg-emerald-50/50 border border-emerald-100 rounded-sm" />
                                                        <div className="w-[95%] h-4 bg-slate-100 rounded-sm" />
                                                        <div className="w-[85%] h-4 bg-slate-100 rounded-sm" />
                                                    </div>
                                                </div>

                                                <div className="flex flex-col gap-5 mt-4">
                                                    <div className="flex justify-between items-center">
                                                         <div className="w-56 h-5 bg-slate-800 rounded-md" />
                                                         <div className="w-24 h-4 bg-slate-200 rounded-md" />
                                                    </div>
                                                    <div className="w-48 h-4 bg-slate-400 rounded-md mb-2" />
                                                    <div className="space-y-4 pl-5 border-l-2 border-slate-200">
                                                        <div className="w-[100%] h-4 bg-slate-100 rounded-sm" />
                                                        <div className="w-[90%] h-4 bg-slate-100 rounded-sm" />
                                                        <div className="w-[95%] h-4 bg-slate-100 rounded-sm" />
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    </div>

                                    {/* Right Sidebar */}
                                    <div className="hidden lg:flex w-[320px] border-l border-slate-200/60 bg-white/80 flex-col p-6 gap-8">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-[0_4px_12px_rgba(99,102,241,0.3)]">
                                                <Sparkles className="w-4 h-4 text-white" />
                                            </div>
                                            <div className="text-[14px] font-bold text-slate-900 tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">Copilot Analysis</div>
                                        </div>

                                        <div className="p-6 rounded-[20px] bg-slate-900 relative overflow-hidden shadow-xl">
                                             <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-500/20 via-transparent to-transparent pointer-events-none" />
                                             <div className="relative z-10 flex flex-col gap-4">
                                                <div className="flex justify-between items-end">
                                                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">ATS Match</span>
                                                    <div className="flex items-baseline gap-0.5">
                                                        <span className="text-4xl font-black text-white">96</span>
                                                        <span className="text-emerald-400 font-bold">%</span>
                                                    </div>
                                                </div>
                                                <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                                                    <motion.div 
                                                        initial={{ width: 0 }} 
                                                        animate={{ width: '96%' }} 
                                                        transition={{ delay: 1.8, duration: 2, ease: "circOut" }}
                                                        className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.5)]" 
                                                    />
                                                </div>
                                                 <p className="text-[13px] text-slate-400 font-medium leading-relaxed">Your profile strongly matches standard <span className="text-indigo-300">Frontend Engineer</span> roles.</p>
                                             </div>
                                        </div>

                                        <div className="flex flex-col gap-4">
                                            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest flex justify-between items-center">
                                                Suggestions
                                                <span className="bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded text-[9px]">3 NEW</span>
                                            </span>
                                            {[
                                                { text: 'Impact quantification is high', type: 'success', icon: CheckCircle2, color: 'text-emerald-500' },
                                                { text: 'Add 2 more React metrics', type: 'warning', icon: AlertCircle, color: 'text-amber-500' },
                                                { text: 'Strong action verbs detected', type: 'success', icon: CheckCircle2, color: 'text-emerald-500' }
                                            ].map((s, i) => (
                                                <motion.div 
                                                    initial={{ x: 20, opacity: 0 }}
                                                    animate={{ x: 0, opacity: 1 }}
                                                    transition={{ delay: 2 + (i * 0.2), duration: 0.5 }}
                                                    key={i} 
                                                    className="flex items-start gap-4 p-4 rounded-xl bg-white border border-slate-200 hover:border-slate-300 transition-all shadow-sm cursor-pointer group"
                                                >
                                                    <s.icon className={`w-5 h-5 ${s.color} shrink-0`} />
                                                    <span className="text-[13px] font-medium text-slate-700 leading-tight group-hover:text-slate-900 transition-colors">{s.text}</span>
                                                </motion.div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </FadeIn>
                </div>
            </section>

            {/* Architectural Feature Introduction Section */}
            <section id="features" className="py-24 lg:py-32 px-6 lg:px-12 bg-white relative overflow-hidden">
                <div className="max-w-7xl mx-auto relative z-10">
                    <div className="flex flex-col lg:flex-row justify-between items-stretch gap-12 mb-32 border-t-2 border-slate-900 pt-16 relative">
                        {/* Decorative structural lines */}
                         <div className="absolute top-0 right-8 w-px h-32 bg-slate-200 hidden lg:block" />
                         <div className="absolute top-0 right-1/4 w-px h-16 bg-slate-200 hidden lg:block" />
                        
                        <div className="lg:w-7/12 relative z-10">
                            <FadeIn>
                                <div className="flex items-center gap-4 mb-10">
                                   <div className="h-[2px] w-12 bg-emerald-500" />
                                   <div className="text-[11px] font-black text-slate-400 uppercase tracking-[0.25em]">Phase 02 // Capability</div>
                                </div>
                                <h2 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-slate-900 leading-[1] mb-8 tracking-tighter">
                                    Engineered for peak <br className="hidden sm:block" />
                                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500">performance.</span>
                                </h2>
                            </FadeIn>
                        </div>

                        <div className="lg:w-5/12 flex flex-col justify-end relative z-10">
                            <FadeIn delay={0.2} className="bg-slate-50 relative p-8 sm:p-10 rounded-[2rem] border border-slate-200 overflow-hidden group">
                                {/* Diagonal brutalist circles */}
                                <div className="absolute top-0 right-0 w-32 h-32 overflow-hidden pointer-events-none opacity-[0.03] group-hover:opacity-[0.08] transition-opacity duration-700">
                                   <div className="absolute -top-4 -right-4 w-40 h-40 border-[2px] border-slate-900 rounded-full" />
                                   <div className="absolute top-2 right-2 w-32 h-32 border-[2px] border-slate-900 rounded-full" />
                                   <div className="absolute top-8 right-8 w-24 h-24 border-[2px] border-slate-900 rounded-full" />
                                </div>

                                <p className="text-xl sm:text-2xl text-slate-700 font-medium leading-relaxed mb-12 relative z-10 tracking-tight">
                                    We've rebuilt the career search from the ground up. Every tool is <span className="text-emerald-600 font-bold">precision-engineered</span> to give you an unfair advantage in the market.
                                </p>
                                
                                <div className="flex flex-col sm:flex-row sm:items-center gap-6 relative z-10 pt-8 border-t border-slate-200">
                                    <div className="flex -space-x-4">
                                         <div className="w-16 h-16 rounded-full bg-slate-900 flex items-center justify-center border-4 border-slate-50 relative z-30 shadow-lg group-hover:-translate-y-2 transition-transform duration-500">
                                             <Cpu className="w-6 h-6 text-emerald-400" />
                                         </div>
                                         <div className="w-16 h-16 rounded-full bg-emerald-600 flex items-center justify-center border-4 border-slate-50 relative z-20 shadow-lg group-hover:-translate-y-2 transition-transform duration-500 delay-75">
                                             <Zap className="w-6 h-6 text-white" />
                                         </div>
                                          <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center border-4 border-slate-50 relative z-10 shadow-lg group-hover:-translate-y-2 transition-transform duration-500 delay-150">
                                             <Target className="w-6 h-6 text-slate-900" />
                                         </div>
                                    </div>
                                    <div className="flex flex-col">
                                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Architecture</div>
                                        <div className="text-lg font-extrabold text-slate-900 tracking-tight">
                                            Next-Gen AI Systems
                                        </div>
                                    </div>
                                </div>
                            </FadeIn>
                        </div>
                    </div>

                    {/* SaaS Core Features Grid */}
                    <FadeIn delay={0.3}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 relative z-10">
                            {[
                                {
                                    icon: Zap,
                                    title: "Speed",
                                    desc: "Build a professional, tailored resume in under 5 minutes. Say goodbye to hours of formatting and tweaking."
                                },
                                {
                                    icon: Sparkles,
                                    title: "AI Personalization",
                                    desc: "Not generic ChatGPT outputs. Our AI analyzes your unique experience to generate personalized, high-converting content."
                                },
                                {
                                    icon: Target,
                                    title: "Job Matching",
                                    desc: "Your resume and job applications connected together. Target specific roles with unprecedented accuracy."
                                },
                                {
                                    icon: ShieldCheck,
                                    title: "ATS-First Design",
                                    desc: "Most resume builders fail here. Our systems are scientifically designed to parse flawlessly through Applicant Tracking Systems."
                                }
                            ].map((feature, i) => (
                                <motion.div 
                                    key={i}
                                    whileHover={{ y: -5, transition: { duration: 0.2 } }}
                                    className="p-8 rounded-[1.5rem] bg-white border border-slate-200 hover:border-emerald-500/30 shadow-sm hover:shadow-[0_20px_40px_-15px_rgba(16,185,129,0.15)] transition-all group"
                                >
                                    <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-6 group-hover:bg-emerald-500 group-hover:text-white transition-colors duration-300">
                                        <feature.icon className="w-6 h-6" />
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
                                    <p className="text-slate-500 font-medium leading-relaxed">
                                        {feature.desc}
                                    </p>
                                </motion.div>
                            ))}
                        </div>
                    </FadeIn>
                </div>
            </section>

            {/* Social Proof Section - Integrated */}
            <SocialProof />

            <InteractiveTemplateShowcase />

            <Pricing />

            {/* Impact Numbers Section - High Contrast */}
            <section id="resources" className="py-24 lg:py-32 px-6 lg:px-12 bg-slate-900 text-white relative overflow-hidden">
                {/* Decorative background elements */}
                <div className="absolute top-0 right-0 w-1/2 h-full bg-emerald-600/10 blur-[100px] -z-0" />
                
                <div className="max-w-7xl mx-auto relative z-10">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
                        <div>
                            <FadeIn>
                                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-white text-[13px] font-medium mb-6">
                                    <BarChart3 className="w-4 h-4" />
                                    Performance Metrics
                                </div>
                                <h2 className="text-5xl lg:text-7xl font-extrabold text-white leading-[1] tracking-tighter mb-6">
                                    Velocity & <br />
                                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">Volume.</span>
                                </h2>
                                <p className="text-lg text-slate-400 font-normal leading-relaxed mb-10 max-w-xl">
                                    Stop sending resumes into the void. Our engine tracks ATS pass rates across Naukri, LinkedIn, and corporate portals, giving you the analytics needed to close offers 5x faster.
                                </p>
                                <button 
                                    onClick={onGetStarted}
                                    className="flex items-center gap-2 text-emerald-400 font-medium hover:text-emerald-300 transition-colors text-[15px]"
                                >
                                    View Success Framework <ArrowRight className="w-4 h-4" />
                                </button>
                            </FadeIn>
                        </div>
                        
                        <FadeInStagger className="grid grid-cols-2 gap-6 lg:gap-8">
                            {[
                                { val: "30+", label: "Industries" },
                                { val: "20k+", label: "Interviews" },
                                { val: "85%", label: "Faster" },
                                { val: "10x", label: "Callbacks" }
                            ].map((stat, i) => (
                                <FadeInStaggerItem key={i}>
                                    <div className="p-8 bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl hover:bg-white/10 transition-all group">
                                        <div className="text-5xl lg:text-6xl font-extrabold text-emerald-400 mb-2 tracking-tighter transition-transform origin-left">{stat.val}</div>
                                        <div className="text-[15px] xl:text-[16px] text-slate-300 font-medium tracking-wide uppercase">{stat.label}</div>
                                    </div>
                                </FadeInStaggerItem>
                            ))}
                        </FadeInStagger>
                    </div>
                </div>
            </section>

            {/* Final CTA Section - Minimalist & Bold */}
            <section className="py-24 lg:py-32 px-6 lg:px-12 bg-white relative overflow-hidden">
                <div className="max-w-4xl mx-auto text-center relative z-10">
                    <FadeIn>
                        <h2 className="text-5xl lg:text-7xl font-extrabold text-slate-900 leading-[1] tracking-tighter mb-8">
                            Ready to <br className="hidden sm:block" />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500">Level Up?</span>
                        </h2>
                        <p className="text-xl text-slate-600 font-normal leading-relaxed mb-12 max-w-2xl mx-auto">
                            Stop experimenting with your future. Deploy a proven AI solution and accelerate your career trajectory today.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <motion.button 
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={onGetStarted}
                                className="w-full sm:w-auto px-10 py-5 text-[16px] font-bold text-white bg-emerald-600 rounded-full hover:bg-emerald-500 transition-all shadow-[0_15px_40px_rgba(16,185,129,0.3)] hover:shadow-[0_20px_50px_rgba(16,185,129,0.4)]"
                            >
                                Get Started Now
                            </motion.button>
                            <motion.button 
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                                className="w-full sm:w-auto px-10 py-5 text-[16px] font-bold text-slate-700 bg-white border border-slate-200 rounded-full hover:bg-slate-50 hover:border-slate-300 transition-all shadow-md hover:shadow-lg"
                            >
                                Request Demo
                            </motion.button>
                        </div>
                    </FadeIn>
                </div>
                
                {/* Decorative background elements */}
            </section>

            <Footer />
        </div>
    );
};

export default LandingPage;

