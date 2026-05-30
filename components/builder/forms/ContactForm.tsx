
import React from 'react';
import { ResumeData } from '../../../types';
import FormField from '../FormField';

import { motion } from 'framer-motion';

interface Props {
  data: ResumeData;
  onDataChange: (path: string, value: any) => void;
}

const ContactForm: React.FC<Props> = ({ data, onDataChange }) => {
  const { fullName, title, contactInfo } = data;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-10"
    >
      <motion.div variants={itemVariants}>
        <div className="mb-8">
            <h1 className="text-[28px] font-black text-slate-900 tracking-tight mb-2 leading-tight">How should recruiters contact you?</h1>
            <p className="text-[15px] text-slate-500 font-medium">Include your full name and at least an email or phone number.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
            <FormField 
                label="Full Name" 
                name="fullName" 
                value={fullName} 
                onChange={e => onDataChange('fullName', e.target.value)} 
                required 
                placeholder="e.g. Sarah Chen"
                tip="Use your legal name as it appears on official documents."
            />
            <FormField 
                label="Professional Title" 
                name="title" 
                value={title} 
                onChange={e => onDataChange('title', e.target.value)} 
                placeholder="e.g. Senior Product Manager" 
                required 
                tip="Match this to the job title you are applying for."
            />
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className="pt-8 border-t border-slate-200/50">
        <div className="mb-6">
            <h2 className="text-[20px] font-black text-slate-900 tracking-tight mb-1">Reachability</h2>
            <p className="text-[14px] text-slate-500 font-medium">Ensure your contact methods are professional and up-to-date.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
            <FormField 
                label="Email" 
                name="email" 
                type="email" 
                value={contactInfo.email} 
                onChange={e => onDataChange('contactInfo.email', e.target.value)} 
                validation="email" 
                required 
                placeholder="name@example.com"
            />
            <FormField 
                label="Phone Number" 
                name="phone" 
                type="tel" 
                value={contactInfo.phone} 
                onChange={e => onDataChange('contactInfo.phone', e.target.value)} 
                validation="phone"
                placeholder="(555) 000-0000"
            />
        </div>
        
        <div className="mt-4">
            <FormField 
                label="Location" 
                name="location" 
                value={contactInfo.location} 
                onChange={e => onDataChange('contactInfo.location', e.target.value)} 
                placeholder="e.g. San Francisco, CA" 
                required 
                tip="City and State is sufficient. No need for a full street address."
            />
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className="pt-8 border-t border-slate-200/50">
        <div className="mb-6">
            <h2 className="text-[20px] font-black text-slate-900 tracking-tight mb-1">Online Presence</h2>
            <p className="text-[14px] text-slate-500 font-medium">Link to your professional portfolios and social proof.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
            <FormField label="LinkedIn" name="linkedin" type="url" value={contactInfo.linkedin} onChange={e => onDataChange('contactInfo.linkedin', e.target.value)} validation="url" placeholder="linkedin.com/in/username" />
            <FormField label="Portfolio / Website" name="portfolio" type="url" value={contactInfo.portfolio || ''} onChange={e => onDataChange('contactInfo.portfolio', e.target.value)} validation="url" placeholder="yourportfolio.com" />
            <FormField label="GitHub" name="github" type="url" value={contactInfo.github || ''} onChange={e => onDataChange('contactInfo.github', e.target.value)} validation="url" placeholder="github.com/username" />
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ContactForm;
