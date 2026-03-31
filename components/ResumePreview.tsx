
import React from 'react';
import { ResumeData, Customization, ResumeSectionKey, FontTheme } from '../types';
import { templates as allTemplates } from './templates/templateData';

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
};

interface ResumePreviewProps {
  data: ResumeData;
  customization: Customization;
  sectionOrder: ResumeSectionKey[];
  sectionVisibility: Record<ResumeSectionKey, boolean>;
  onDataChange: (path: string, value: any) => void;
  templateId?: string;
}

const ResumePreview: React.FC<ResumePreviewProps> = ({
  data,
  customization,
  sectionOrder,
  sectionVisibility,
  onDataChange,
  templateId = 'standard-pro'
}) => {
  const template = allTemplates.find(t => t.key === templateId) || allTemplates[0];
  const TemplateComponent = template.component;

  // A4: 210mm x 297mm (approx 794px x 1123px at 96dpi)
  // Letter: 8.5in x 11in (approx 816px x 1056px at 96dpi)
  const isA4 = customization.pageFormat !== 'LETTER';
  const width = isA4 ? '794px' : '816px';
  const minHeight = isA4 ? '1123px' : '1056px';
  const fontClass = fontClassMap[customization.font] || 'font-sans';

  return (
    <div 
      className={`bg-white shadow-xl rounded-sm overflow-hidden resume-preview-container mx-auto ${fontClass}`} 
      style={{ width, minHeight }}
    >
      <TemplateComponent
        data={data}
        customization={customization}
        sectionOrder={sectionOrder}
        sectionVisibility={sectionVisibility}
        onDataChange={onDataChange}
      />
    </div>
  );
};

export default ResumePreview;
