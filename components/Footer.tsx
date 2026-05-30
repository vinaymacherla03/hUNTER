
import React from 'react';
import { toast } from 'sonner';
import { Zap, Globe, Users, Shield, ArrowUpRight } from 'lucide-react';

const footerLinks = [
  {
    title: 'Platform',
    links: [
      { name: 'Features', href: '#features' },
      { name: 'Templates', href: '#templates' },
      { name: 'AI Writer', href: '#ai-writer' },
      { name: 'Pricing', href: '#pricing' },
    ],
  },
  {
    title: 'Company',
    links: [
      { name: 'About', href: '#about' },
      { name: 'Careers', href: '#careers' },
      { name: 'Press', href: '#press' },
      { name: 'Contact', href: '#contact' },
    ],
  },
  {
    title: 'Resources',
    links: [
      { name: 'Blog', href: '#blog' },
      { name: 'Guides', href: '#guides' },
      { name: 'Support', href: '#support' },
      { name: 'API Docs', href: '#api' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { name: 'Privacy', href: '#privacy' },
      { name: 'Terms', href: '#terms' },
      { name: 'Security', href: '#security' },
    ],
  },
];

const Footer: React.FC = () => {
  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, name: string, href: string) => {
    e.preventDefault();
    const targetId = href.replace('#', '');
    const element = document.getElementById(targetId);
    
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    } else {
      toast.info(`${name} page is coming soon!`);
    }
  };

  return (
    <footer className="py-24 bg-slate-50 border-t border-slate-200 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-12 mb-16 lg:mb-24">
          <div className="col-span-2">
            <div className="flex items-center gap-3 mb-6 group cursor-pointer">
                <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center transition-all group-hover:bg-slate-800 shadow-sm">
                    <Zap className="w-4 h-4 text-emerald-400 fill-emerald-400" />
                </div>
                <span className="text-xl font-semibold text-slate-900 tracking-tight">HuntDesk</span>
            </div>
            <p className="text-slate-500 text-[15px] font-normal leading-relaxed max-w-xs mb-8">
              The modern platform for career development. Engineered for performance, built for clarity.
            </p>
            <div className="flex items-center gap-3">
                {[
                    { icon: Globe, href: '#' },
                    { icon: Users, href: '#' },
                    { icon: Zap, href: '#' },
                    { icon: Shield, href: '#' }
                ].map((social, i) => (
                    <a 
                        key={i} 
                        href={social.href}
                        className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-200 transition-all"
                    >
                        <social.icon className="w-4 h-4" />
                    </a>
                ))}
            </div>
          </div>
          
          {footerLinks.map((section) => (
            <div key={section.title}>
              <h4 className="text-sm font-semibold text-slate-900 mb-6">{section.title}</h4>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.name}>
                    <a 
                      href={link.href} 
                      onClick={(e) => handleLinkClick(e, link.name, link.href)}
                      className="text-[15px] font-normal text-slate-500 hover:text-slate-900 transition-colors flex items-center gap-1 group"
                    >
                      {link.name}
                      <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        
        <div className="pt-8 border-t border-slate-200 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-[14px] font-normal text-slate-500">
            © 2026 HuntDesk Inc. All rights reserved.
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[14px] font-medium text-slate-600">All systems operational</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Decorative background element */}
      <div className="absolute bottom-0 right-0 w-1/3 h-1/2 bg-emerald-500/5 blur-[120px] -z-0" />
    </footer>
  );
};

export default Footer;
