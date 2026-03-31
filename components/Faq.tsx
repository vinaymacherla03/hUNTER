
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus } from 'lucide-react';

const Faq: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      question: "How does the AI optimize my resume?",
      answer: "Our AI analyzes your career data against thousands of successful profiles and specific ATS algorithms to reconstruct your narrative for maximum impact."
    },
    {
      question: "Is my data secure?",
      answer: "Yes. We use enterprise-grade encryption and never share your personal data with third parties. Your career history is yours alone."
    },
    {
      question: "Can I use HuntDesk for multiple roles?",
      answer: "Absolutely. You can create and manage multiple versions of your resume, each tailored to different strategic career paths."
    }
  ];

  return (
    <section className="py-32 bg-white" id="faq">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          <div className="lg:col-span-5">
            <h2 className="text-5xl md:text-7xl font-bold tracking-tight text-slate-900 mb-6">
              FAQs
            </h2>
            <p className="text-xl text-slate-600 mb-10">
              Everything you need to know about the platform.
            </p>
            <a href="mailto:support@huntdesk.com" className="inline-flex items-center justify-center px-6 py-3 border border-slate-200 rounded-full text-sm font-medium hover:bg-slate-50 transition-colors">
              Contact Support
            </a>
          </div>

          <div className="lg:col-span-7">
            <div className="border-t border-slate-200">
              {faqs.map((faq, i) => (
                <div key={i} className="border-b border-slate-200">
                  <button 
                    onClick={() => setOpenIndex(openIndex === i ? null : i)}
                    className="flex items-center justify-between w-full py-8 text-left group"
                  >
                    <span className="text-2xl font-medium text-slate-900 group-hover:text-slate-600 transition-colors">
                      {faq.question}
                    </span>
                    <span className="ml-6 flex-shrink-0 text-slate-400 group-hover:text-slate-900 transition-colors">
                      {openIndex === i ? <Minus className="w-6 h-6" /> : <Plus className="w-6 h-6" />}
                    </span>
                  </button>
                  <AnimatePresence>
                    {openIndex === i && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="overflow-hidden"
                      >
                        <div className="pb-8 pr-12">
                          <p className="text-lg text-slate-600 leading-relaxed font-medium">
                            {faq.answer}
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Faq;