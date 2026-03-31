
import React from 'react';
import { motion } from 'framer-motion';

const AILogo = () => (
  <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="48" height="48" rx="16" fill="#F3E8FF"/>
    <path d="M24 12C24 18.6274 18.6274 24 12 24C18.6274 24 24 29.3726 24 36C24 29.3726 29.3726 24 36 24C29.3726 24 24 18.6274 24 12Z" fill="#A855F7"/>
    <path d="M34 14C34 16.7614 32.2091 19 30 19C32.2091 19 34 21.2386 34 24C34 21.2386 35.7909 19 38 19C35.7909 19 34 16.7614 34 14Z" fill="#D8B4FE"/>
  </svg>
);

const ATSLogo = () => (
  <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="48" height="48" rx="16" fill="#DCFCE7"/>
    <path d="M24 12L14 16V24.5C14 30.5 18.5 36 24 38C29.5 36 34 30.5 34 24.5V16L24 12Z" fill="#22C55E"/>
    <path d="M20 25L23 28L30 19" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const TemplateLogo = () => (
  <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="48" height="48" rx="16" fill="#DBEAFE"/>
    <rect x="14" y="14" width="20" height="20" rx="4" fill="#3B82F6"/>
    <rect x="18" y="18" width="12" height="3" rx="1.5" fill="#93C5FD"/>
    <rect x="18" y="24" width="7" height="2" rx="1" fill="#BFDBFE"/>
    <rect x="18" y="29" width="10" height="2" rx="1" fill="#BFDBFE"/>
  </svg>
);

const PDFLogo = () => (
  <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="48" height="48" rx="16" fill="#FEE2E2"/>
    <path d="M16 14C16 12.8954 16.8954 12 18 12H25L32 19V34C32 35.1046 31.1046 36 30 36H18C16.8954 36 16 35.1046 16 34V14Z" fill="#EF4444"/>
    <path d="M25 12V19H32" fill="#FCA5A5"/>
    <path d="M24 22V29M24 29L21 26M24 29L27 26" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const FeatureCard: React.FC<{ title: string; desc: string; logo: React.ReactNode; className?: string }> = ({ title, desc, logo, className }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5 }}
    className={`p-10 bg-white rounded-3xl border border-slate-200 flex flex-col group hover:border-slate-300 transition-colors ${className}`}
  >
    <div className="mb-8 group-hover:scale-110 transition-transform origin-left">
      {logo}
    </div>
    <h3 className="text-2xl font-bold text-slate-900 mb-3 tracking-tight">{title}</h3>
    <p className="text-slate-600 leading-relaxed font-medium">{desc}</p>
  </motion.div>
);

const Features: React.FC = () => {
  return (
    <section className="py-32 bg-white" id="features">
      <div className="max-w-7xl mx-auto px-6">
        <div className="mb-20 max-w-4xl">
          <h2 className="text-5xl md:text-7xl font-bold tracking-tight text-slate-900 mb-6">
            Everything you need.
          </h2>
          <p className="text-xl text-slate-600 mb-12">
            Your resume is an extension of yourself. Make one that's truly you with our advanced builder.
          </p>
          
          {/* Color Logos Section */}
          <div className="pt-10 border-t border-slate-100">
            <p className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-8">
              Our users have been hired at
            </p>
            <div className="flex flex-wrap gap-8 md:gap-12 items-center">
              {/* Google */}
              <div className="flex items-center transition-all duration-300 hover:scale-105 cursor-default">
                <svg className="h-7 w-auto" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                <span className="ml-2 text-xl font-semibold text-slate-700">Google</span>
              </div>
              
              {/* Microsoft */}
              <div className="flex items-center transition-all duration-300 hover:scale-105 cursor-default">
                <svg className="h-6 w-auto" viewBox="0 0 23 23" xmlns="http://www.w3.org/2000/svg">
                  <path d="M0 0h11v11H0z" fill="#f25022"/>
                  <path d="M12 0h11v11H12z" fill="#7fba00"/>
                  <path d="M0 12h11v11H0z" fill="#00a4ef"/>
                  <path d="M12 12h11v11H12z" fill="#ffb900"/>
                </svg>
                <span className="ml-2 text-xl font-semibold text-slate-700">Microsoft</span>
              </div>

              {/* Spotify */}
              <div className="flex items-center transition-all duration-300 hover:scale-105 cursor-default">
                <svg className="h-7 w-auto" viewBox="0 0 24 24" fill="#1DB954" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.48.659.24 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.84.24 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.781-.18-.6.18-1.2.78-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.239.54-.959.72-1.5.42h-.12z"/>
                </svg>
                <span className="ml-2 text-xl font-semibold text-slate-700 tracking-tight">Spotify</span>
              </div>

              {/* Slack */}
              <div className="flex items-center transition-all duration-300 hover:scale-105 cursor-default">
                <svg className="h-7 w-auto" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zM6.313 15.165a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313z" fill="#E01E5A"/>
                  <path d="M8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zM8.834 6.313a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312z" fill="#36C5F0"/>
                  <path d="M18.956 8.835a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.835a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.835zM17.688 8.835a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.165 0a2.528 2.528 0 0 1 2.523 2.522v6.313z" fill="#2EB67D"/>
                  <path d="M15.165 18.958a2.528 2.528 0 0 1 2.523 2.52 2.528 2.528 0 0 1-2.523 2.522 2.528 2.528 0 0 1-2.52-2.522v-2.52h2.52zM15.165 17.687a2.528 2.528 0 0 1-2.523-2.52 2.528 2.528 0 0 1 2.523-2.521h6.313A2.528 2.528 0 0 1 24 15.167a2.528 2.528 0 0 1-2.522 2.52H15.165z" fill="#ECB22E"/>
                </svg>
                <span className="ml-2 text-xl font-bold text-slate-700 tracking-tight">slack</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <FeatureCard 
            className="md:col-span-2 bg-slate-50"
            title="AI Content Generation"
            desc="Stuck on what to write? Our AI analyzes your role and generates tailored bullet points that highlight your achievements and skills."
            logo={<AILogo />}
          />
          <FeatureCard 
            title="ATS-Friendly"
            desc="Our templates are designed to pass through Applicant Tracking Systems, ensuring your resume reaches human eyes."
            logo={<ATSLogo />}
          />
          <FeatureCard 
            title="Modern Templates"
            desc="Choose from a variety of professional, recruiter-approved templates that stand out from the crowd."
            logo={<TemplateLogo />}
          />
          <FeatureCard 
            className="md:col-span-2 bg-slate-50"
            title="Export to PDF"
            desc="Download your pixel-perfect resume as a PDF in one click, ready to be sent to employers or uploaded to job boards."
            logo={<PDFLogo />}
          />
        </div>
      </div>
    </section>
  );
};

export default Features;
