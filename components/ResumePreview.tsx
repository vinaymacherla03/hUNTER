
import React, { useRef, useEffect, useState } from 'react';
import { ResumeData, Customization, ResumeSectionKey, FontTheme, ColorTheme } from '../types';
import { templates as allTemplates } from './templates/templateData';
import { ResumeContext } from './builder/ResumeContext';

const fontClassMap: Record<FontTheme, string> = {
  jakarta: 'font-sans',
  inter: 'font-sans', 
  roboto: 'font-roboto', 
  lato: 'font-lato', 
  montserrat: 'font-montserrat', 
  'source-sans': 'font-source-sans', 
  lora: 'font-lora', 
  playfair: 'font-serif',
  'roboto-mono': 'font-roboto-mono',
  'open-sans': 'font-open-sans',
  'poppins': 'font-poppins',
  'merriweather': 'font-merriweather',
  'nunito': 'font-nunito',
  'oswald': 'font-oswald',
  'raleway': 'font-raleway',
  'crimson-pro': 'font-crimson-pro',
  'work-sans': 'font-work-sans',
  'jetbrains-mono': 'font-jetbrains-mono',
  'times-new-roman': 'font-times-new-roman',
  'tahoma': 'font-tahoma',
  'verdana': 'font-verdana',
  'arial': 'font-arial',
  'helvetica': 'font-helvetica',
  'calibri': 'font-calibri',
  'georgia': 'font-georgia',
  'cambria': 'font-cambria',
  'gill-sans': 'font-gill-sans',
  'garamond': 'font-garamond',
  'dm-sans': 'font-sans',
  'outfit': 'font-sans',
  'space-grotesk': 'font-sans',
  'quicksand': 'font-sans',
  'cabin': 'font-sans',
  'pt-sans': 'font-sans',
  'pt-serif': 'font-serif',
  'bitter': 'font-serif',
  'libre-baserville': 'font-serif',
  'noto-sans': 'font-sans',
  'noto-serif': 'font-serif',
};

const colorVarMap: Record<ColorTheme, React.CSSProperties> = {
  blue: { '--primary-color': '#2563eb', '--primary-color-light': '#dbeafe', '--primary-color-dark': '#1d4ed8', '--text-on-primary': '#ffffff' } as React.CSSProperties,
  indigo: { '--primary-color': '#4f46e5', '--primary-color-light': '#e0e7ff', '--primary-color-dark': '#3730a3', '--text-on-primary': '#ffffff' } as React.CSSProperties,
  emerald: { '--primary-color': '#059669', '--primary-color-light': '#d1fae5', '--primary-color-dark': '#047857', '--text-on-primary': '#ffffff' } as React.CSSProperties,
  rose: { '--primary-color': '#e11d48', '--primary-color-light': '#ffe4e6', '--primary-color-dark': '#be123c', '--text-on-primary': '#ffffff' } as React.CSSProperties,
  slate: { '--primary-color': '#475569', '--primary-color-light': '#f1f5f9', '--primary-color-dark': '#334155', '--text-on-primary': '#ffffff' } as React.CSSProperties,
  orange: { '--primary-color': '#f97316', '--primary-color-light': '#ffedd5', '--primary-color-dark': '#ea580c', '--text-on-primary': '#ffffff' } as React.CSSProperties,
  amber: { '--primary-color': '#f59e0b', '--primary-color-light': '#fef3c7', '--primary-color-dark': '#d97706', '--text-on-primary': '#ffffff' } as React.CSSProperties,
  violet: { '--primary-color': '#8b5cf6', '--primary-color-light': '#ede9fe', '--primary-color-dark': '#6d28d9', '--text-on-primary': '#ffffff' } as React.CSSProperties,
  fuchsia: { '--primary-color': '#d946ef', '--primary-color-light': '#fae8ff', '--primary-color-dark': '#a21caf', '--text-on-primary': '#ffffff' } as React.CSSProperties,
  pink: { '--primary-color': '#ec4899', '--primary-color-light': '#fce7f3', '--primary-color-dark': '#be185d', '--text-on-primary': '#ffffff' } as React.CSSProperties,
  cyan: { '--primary-color': '#06b6d4', '--primary-color-light': '#cffafe', '--primary-color-dark': '#0e7490', '--text-on-primary': '#ffffff' } as React.CSSProperties,
  teal: { '--primary-color': '#14b8a6', '--primary-color-light': '#ccfbf1', '--primary-color-dark': '#0f766e', '--text-on-primary': '#ffffff' } as React.CSSProperties,
  lime: { '--primary-color': '#84cc16', '--primary-color-light': '#ecfccb', '--primary-color-dark': '#4d7c0f', '--text-on-primary': '#ffffff' } as React.CSSProperties,
  yellow: { '--primary-color': '#eab308', '--primary-color-light': '#fef9c3', '--primary-color-dark': '#a16207', '--text-on-primary': '#ffffff' } as React.CSSProperties,
  red: { '--primary-color': '#ef4444', '--primary-color-light': '#fee2e2', '--primary-color-dark': '#b91c1c', '--text-on-primary': '#ffffff' } as React.CSSProperties,
  black: { '--primary-color': '#000000', '--primary-color-light': '#e2e8f0', '--primary-color-dark': '#000000', '--text-on-primary': '#ffffff' } as React.CSSProperties,
};

interface ResumePreviewProps {
  data: ResumeData;
  customization: Customization;
  sectionOrder: ResumeSectionKey[];
  sectionVisibility: Record<ResumeSectionKey, boolean>;
  onDataChange: (path: string, value: any) => void;
  templateId?: string;
  isDownloading?: boolean;
  readOnly?: boolean;
  activeSection?: string;
}

const ResumePreview: React.FC<ResumePreviewProps> = ({
  data,
  customization,
  sectionOrder,
  sectionVisibility,
  onDataChange,
  templateId = 'standard-pro',
  isDownloading = false,
  readOnly = false,
  activeSection
}) => {
  const template = allTemplates.find(t => t.key === templateId) || allTemplates[0];
  const TemplateComponent = template.component;
  const contentRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  // A4: 210mm x 297mm (approx 794px x 1123px at 96dpi)
  // Letter: 8.5in x 11in (approx 816px x 1056px at 96dpi)
  const isA4 = customization.pageFormat !== 'LETTER';
  const width = isA4 ? '794px' : '816px';
  const targetHeight = isA4 ? 1123 : 1056;
  const minHeight = isDownloading ? 'auto' : `${targetHeight}px`;
  const fontClass = fontClassMap[customization.font] || 'font-sans';
  const marginValue = { compact: '0.4in', normal: '0.6in', spacious: '0.8in' }[customization.margin] || '0.6in';
  const colorVars = colorVarMap[customization.color] || colorVarMap.slate;

  useEffect(() => {
    if (!customization.fitToOnePage || isDownloading) {
      setScale(1);
      return;
    }

    const checkHeight = () => {
      if (contentRef.current) {
        // Reset scale to measure natural height
        contentRef.current.style.transform = 'none';
        
        const scrollHeight = contentRef.current.scrollHeight;
        if (scrollHeight > targetHeight) {
          const newScale = targetHeight / scrollHeight;
          setScale(newScale);
        } else {
          setScale(1);
        }
      }
    };

    // Check height initially and when data/customization changes
    checkHeight();
    
    // Also check after a small delay to allow for image loading/fonts
    const timeoutId = setTimeout(checkHeight, 100);
    return () => clearTimeout(timeoutId);
  }, [data, customization, sectionOrder, sectionVisibility, templateId, targetHeight, isDownloading]);

  return (
    <div 
      className={`bg-white shadow-[0_30px_100px_-20px_rgba(0,0,0,0.15),0_20px_40px_-20px_rgba(0,0,0,0.1)] border border-slate-200 rounded-sm overflow-hidden resume-preview-container mx-auto ${fontClass} ${isDownloading ? 'pdf-download-mode' : ''} relative`} 
      style={{ width, minHeight, position: 'relative', ...colorVars }}
    >
      {/* Subtle Paper Texture Overlay */}
      {!isDownloading && (
        <div className="absolute inset-0 pointer-events-none opacity-[0.03] mix-blend-multiply z-10" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }} />
      )}

      <div 
        id="resume-container-for-download"
        ref={contentRef}
        className="bg-white w-full origin-top relative z-0"
        style={{ 
          padding: isDownloading ? '0' : marginValue, 
          boxSizing: 'border-box',
          transform: scale < 1 ? `scale(${scale})` : 'none',
          minHeight: scale < 1 ? `${100 / scale}%` : '100%',
        }}
      >
        <ResumeContext.Provider value={{
          resumeData: data,
          jobDescription: '',
          onRewrite: () => {},
          onDataChange: () => {},
          onApplyTailoredResume: () => {},
          onInterviewPrep: () => {},
          isInterviewPrepLoading: false,
          isThinkingPath: null,
          aiSuggestions: {},
          onApplySuggestion: () => {},
          onClearSuggestion: () => {},
          readOnly: readOnly || isDownloading
        }}>
          <TemplateComponent
            data={data}
            customization={customization}
            sectionOrder={sectionOrder}
            sectionVisibility={sectionVisibility}
            onDataChange={onDataChange}
            activeSection={activeSection}
          />
        </ResumeContext.Provider>
      </div>
    </div>
  );
};

export default ResumePreview;
