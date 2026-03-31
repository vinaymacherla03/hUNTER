
import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

interface FinalCTAProps {
  onGetStarted: () => void;
}

const FinalCTA: React.FC<FinalCTAProps> = ({ onGetStarted }) => {
  return (
    <section className="py-32 bg-[#f5f5f5] border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-6 text-center">
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl mx-auto"
        >
            <h2 className="text-6xl sm:text-8xl font-black text-slate-900 mb-8 tracking-tighter leading-none">
              Ready to build?
            </h2>
            <p className="text-2xl text-slate-600 mb-12 max-w-2xl mx-auto font-medium">
              Join millions of job seekers who have transformed their career trajectory with our advanced resume builder.
            </p>
            
            <button 
                onClick={onGetStarted}
                className="inline-flex items-center justify-center gap-3 px-10 py-5 bg-slate-900 text-white rounded-full text-xl font-medium hover:bg-slate-800 transition-colors group"
            >
                Get Started Free
                <ArrowRight className="w-6 h-6 transition-transform group-hover:translate-x-1" />
            </button>
        </motion.div>
      </div>
    </section>
  );
};

export default FinalCTA;