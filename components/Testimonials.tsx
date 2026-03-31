
import React from 'react';
import { motion } from 'framer-motion';

const Testimonials: React.FC = () => {
  const testimonials = [
    {
      quote: "HuntDesk transformed my resume. Within two weeks of using their templates, I had interviews with three major tech companies.",
      author: "Sarah Jenkins",
      role: "Product Manager",
      company: "TechCorp"
    },
    {
      quote: "The AI content generation is incredibly smart. It helped me phrase my achievements in a way that actually caught recruiters' attention.",
      author: "Michael Chen",
      role: "Software Engineer",
      company: "StartupInc"
    },
    {
      quote: "Clean, efficient, and highly effective. The ATS-friendly designs are a game-changer for getting past the initial screening.",
      author: "Elena Rodriguez",
      role: "Marketing Director",
      company: "GlobalMedia"
    }
  ];

  return (
    <section className="py-32 bg-slate-900 text-white" id="testimonials">
      <div className="max-w-7xl mx-auto px-6">
        <div className="mb-20">
          <h2 className="text-5xl md:text-7xl font-bold tracking-tight mb-6">
            Success stories.
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((t, i) => (
            <motion.div 
                key={i} 
                className="p-10 border border-slate-800 rounded-3xl bg-slate-800/50 flex flex-col justify-between"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
            >
              <p className="text-xl leading-relaxed text-slate-300 mb-10 font-serif italic">
                "{t.quote}"
              </p>
              <div>
                <div className="text-lg font-bold text-white">{t.author}</div>
                <div className="text-sm text-slate-400">{t.role}, {t.company}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;