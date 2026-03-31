
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
  isDownloading?: boolean;
}

const ResumePreview: React.FC<ResumePreviewProps> = ({
  data,
  customization,
  sectionOrder,
  sectionVisibility,
  onDataChange,
  templateId = 'standard-pro',
  isDownloading = false
}) => {
  const template = allTemplates.find(t => t.key === templateId) || allTemplates[0];
  const TemplateComponent = template.component;

  // A4: 210mm x 297mm (approx 794px x 1123px at 96dpi)
  // Letter: 8.5in x 11in (approx 816px x 1056px at 96dpi)
  const isA4 = customization.pageFormat !== 'LETTER';
  const width = isA4 ? '794px' : '816px';
  const minHeight = isDownloading ? 'auto' : (isA4 ? '1123px' : '1056px');
  const fontClass = fontClassMap[customization.font] || 'font-sans';
  const marginValue = { compact: '0.4in', normal: '0.6in', spacious: '0.8in' }[customization.margin] || '0.6in';

  return (
    <div 
      className={`bg-white shadow-xl rounded-sm overflow-hidden resume-preview-container mx-auto ${fontClass} ${isDownloading ? 'pdf-download-mode' : ''}`} 
      style={{ width, minHeight }}
    >
      <div 
        id="resume-container-for-download"
        className="bg-white w-full"
        style={{ padding: isDownloading ? '0' : marginValue, boxSizing: 'border-box' }}
      >
        <TemplateComponent
          data={data}
          customization={customization}
          sectionOrder={sectionOrder}
          sectionVisibility={sectionVisibility}
          onDataChange={onDataChange}
        />
      </div>
    </div>
  );
};

export default ResumePreview;
