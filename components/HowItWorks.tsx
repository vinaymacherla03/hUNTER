import React from 'react';
import { motion } from 'framer-motion';

const SearchLogo = () => (
  <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="48" height="48" rx="16" fill="#DBEAFE"/>
    <circle cx="22" cy="22" r="8" stroke="#3B82F6" strokeWidth="4"/>
    <path d="M28 28L34 34" stroke="#3B82F6" strokeWidth="4" strokeLinecap="round"/>
  </svg>
);

const ZapLogo = () => (
  <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="48" height="48" rx="16" fill="#FEF3C7"/>
    <path d="M26 14L16 26H24L22 36L32 22H24L26 14Z" fill="#F59E0B"/>
  </svg>
);

const SendLogo = () => (
  <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="48" height="48" rx="16" fill="#DCFCE7"/>
    <path d="M34 14L14 22L22 26L26 34L34 14Z" fill="#22C55E"/>
  </svg>
);

const HowItWorks: React.FC = () => {
  const steps = [
    {
      title: "Pick a Template",
      description: "Choose from our library of professional, ATS-friendly templates designed by HR experts to get you noticed.",
      logo: <SearchLogo />,
    },
    {
      title: "Add Your Content",
      description: "Fill in your details or let our AI analyze your career history to generate optimized bullet points and summaries.",
      logo: <ZapLogo />,
    },
    {
      title: "Download & Apply",
      description: "Export your pixel-perfect resume to PDF and start applying to your dream jobs with confidence.",
      logo: <SendLogo />,
    }
  ];

  return (
    <section className="py-32 bg-[#f5f5f5] relative border-t border-slate-200" id="how-it-works">
      <div className="max-w-7xl mx-auto px-6">
        <div className="mb-24">
          <h2 className="text-5xl md:text-7xl font-bold tracking-tight text-slate-900 mb-6">
            How it works
          </h2>
          <p className="text-xl text-slate-600 max-w-2xl">
            We've streamlined the resume creation process so you can focus on what matters: preparing for your interviews and landing the job.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-0 border-t border-l border-slate-200">
          {steps.map((step, index) => (
            <motion.div 
                key={index} 
                className="relative p-10 border-r border-b border-slate-200 bg-white hover:bg-slate-50 transition-colors group"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <div className="text-[120px] font-black text-slate-100 leading-none absolute top-4 right-4 select-none pointer-events-none">
                0{index + 1}
              </div>
              <div className="relative z-10">
                <div className="mb-8 group-hover:scale-110 transition-transform origin-left">
                  {step.logo}
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-4 tracking-tight">
                  {step.title}
                </h3>
                <p className="text-slate-600 leading-relaxed font-medium">
                  {step.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
