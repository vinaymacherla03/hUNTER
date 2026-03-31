import React from 'react';
import { toast } from 'sonner';

const footerLinks = [
  {
    title: 'Platform',
    links: [
      { name: 'Features', href: '#features' },
      { name: 'Templates', href: '#templates' },
      { name: 'AI Writer', href: '#ai-writer' },
    ],
  },
  {
    title: 'Company',
    links: [
      { name: 'About', href: '#about' },
      { name: 'Careers', href: '#careers' },
      { name: 'Press', href: '#press' },
    ],
  },
  {
    title: 'Resources',
    links: [
      { name: 'Blog', href: '#blog' },
      { name: 'Guides', href: '#guides' },
      { name: 'Support', href: '#support' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { name: 'Privacy', href: '#privacy' },
      { name: 'Terms', href: '#terms' },
      { name: 'Cookie Policy', href: '#cookie-policy' },
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
    <footer className="py-20 bg-white border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-12 mb-20">
          <div className="col-span-2 md:col-span-1">
            <div className="text-2xl font-black tracking-tighter text-slate-900 mb-6">HuntDesk</div>
            <p className="text-slate-500 text-sm">
              The modern way to build your resume and land your dream job.
            </p>
          </div>
          {footerLinks.map((section) => (
            <div key={section.title}>
              <h4 className="text-sm font-bold text-slate-900 mb-6">{section.title}</h4>
              <ul className="space-y-4">
                {section.links.map((link) => (
                  <li key={link.name}>
                    <a 
                      href={link.href} 
                      onClick={(e) => handleLinkClick(e, link.name, link.href)}
                      className="text-sm text-slate-500 hover:text-slate-900 transition-colors"
                    >
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="pt-8 border-t border-slate-200 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-sm text-slate-500">
            © 2026 HuntDesk Inc. All rights reserved.
          </div>
          <div className="flex items-center gap-6">
            <a href="#" onClick={(e) => handleLinkClick(e, 'Twitter', '#')} className="text-sm text-slate-500 hover:text-slate-900 transition-colors">Twitter</a>
            <a href="#" onClick={(e) => handleLinkClick(e, 'LinkedIn', '#')} className="text-sm text-slate-500 hover:text-slate-900 transition-colors">LinkedIn</a>
            <a href="#" onClick={(e) => handleLinkClick(e, 'Instagram', '#')} className="text-sm text-slate-500 hover:text-slate-900 transition-colors">Instagram</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;