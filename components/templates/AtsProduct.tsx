import React from 'react';
import { ResumeData, ResumeSectionKey, Customization } from '../../types';
import EditableField from '../EditableField';
import { EditableList } from '../EditableList';
import AnimatedSection from '../builder/AnimatedSection';

interface TemplateProps {
  data: ResumeData;
  sectionOrder: ResumeSectionKey[];
  customization: Customization;
  sectionVisibility: Record<ResumeSectionKey, boolean>;
  onDataChange: (path: string, value: any) => void;
}

const AtsProduct: React.FC<TemplateProps> = ({ data, sectionOrder, customization, sectionVisibility, onDataChange }) => {
  const sectionTitleStyle: React.CSSProperties = {
    fontSize: '9pt', 
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
    color: '#64748b', // slate-500
    marginBottom: '12px', 
    marginTop: '20px', 
    fontWeight: '600'
  };

  const sections: Record<ResumeSectionKey, React.ReactNode> = {
    summary: (
      <AnimatedSection key="summary" className="mb-6">
        <h2 style={sectionTitleStyle}>About</h2>
        <EditableField as="p" path="summary" value={data.summary} onChange={onDataChange} className="text-[#334155] text-[10.5pt] leading-relaxed font-normal" />
      </AnimatedSection>
    ),
    experience: (
      <AnimatedSection key="experience" className="mb-6">
        <h2 style={sectionTitleStyle}>Experience</h2>
        <EditableList items={data.experience || []} path="experience" onChange={onDataChange} newItem={{ id: '', role: 'Role', company: 'Company', location: 'Location', dates: 'Dates', description: ['Achievement'] }}>
          {(exp, i) => (
            <div key={`${exp.id || 'exp'}-${i}`} className="mb-6" style={{ pageBreakInside: 'avoid' }}>
              <div className="flex flex-col md:flex-row md:justify-between items-start md:items-baseline mb-2">
                <div>
                    <EditableField path={`experience[${i}].role`} value={exp.role} onChange={onDataChange} className="font-semibold text-[11pt] text-slate-800" />
                    <span className="text-slate-400 mx-2">/</span>
                    <EditableField path={`experience[${i}].company`} value={exp.company} onChange={onDataChange} className="font-semibold text-[11pt] text-slate-800" />
                </div>
                <EditableField path={`experience[${i}].dates`} value={exp.dates} onChange={onDataChange} className="text-[10pt] text-slate-500 mt-1 md:mt-0 font-medium tracking-wide" />
              </div>
              <EditableList items={exp.description || []} path={`experience[${i}].description`} onChange={onDataChange} newItem="Achievement" className="list-disc ml-4 space-y-1">
                {(desc, di) => (
                    <div className="text-[10pt] text-slate-600 leading-relaxed">
                        <EditableField as="div" path={`experience[${i}].description[${di}]`} value={desc} onChange={onDataChange} enableMarkdown />
                    </div>
                )}
              </EditableList>
            </div>
          )}
        </EditableList>
      </AnimatedSection>
    ),
    skills: (
      <AnimatedSection key="skills" className="mb-6">
        <h2 style={sectionTitleStyle}>Skills</h2>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-y-2 mt-1">
          {(data.skills || []).map((cat, i) => (
            <div key={`${cat.id || 'cat'}-${i}`} className="text-[10pt] text-slate-600">
              <div className="font-semibold text-slate-800 mb-0.5">{cat.name}</div> 
              <div className="leading-snug">{(cat.skills || []).filter(Boolean).map(s => s.name).join(', ')}</div>
            </div>
          ))}
        </div>
      </AnimatedSection>
    ),
    education: (
      <AnimatedSection key="education" className="mb-6">
        <h2 style={sectionTitleStyle}>Education</h2>
        <div className="grid grid-cols-2 gap-4">
            {(data.education || []).map((edu, i) => (
                <div key={`${edu.id || 'edu'}-${i}`} className="mb-2">
                    <EditableField path={`education[${i}].degree`} value={edu.degree} onChange={onDataChange} className="font-semibold text-[10.5pt] text-slate-800 block" />
                    <EditableField path={`education[${i}].institution`} value={edu.institution} onChange={onDataChange} className="text-[10pt] text-slate-500 block mt-0.5" />
                    <div className="text-[10pt] text-slate-400 mt-0.5">
                        <EditableField as="span" path={`education[${i}].graduationDate`} value={edu.graduationDate} onChange={onDataChange} />
                    </div>
                </div>
            ))}
        </div>
      </AnimatedSection>
    ),
    projects: data.projects?.length ? (
        <AnimatedSection key="projects" className="mb-6" style={{ pageBreakInside: 'avoid' }}>
          <h2 style={sectionTitleStyle}>Projects</h2>
          {(data.projects || []).map((proj, i) => (
            <div key={`${proj.id || 'proj'}-${i}`} className="mb-4">
              <div className="font-semibold text-[10.5pt] text-slate-800 mb-1">
                  <EditableField as="span" path={`projects[${i}].name`} value={proj.name} onChange={onDataChange} />
              </div>
              <div className="text-[10pt] text-slate-600 leading-relaxed">
                  {proj.description?.join(' ')}
              </div>
            </div>
          ))}
        </AnimatedSection>
    ) : null,
    certifications: null,
    awards: null,
    keywords: null
  };

  return (
    <div id="resume-content" className="bg-white font-sans selection:bg-slate-200 selection:text-black tracking-tight" style={{ fontFamily: 'system-ui, sans-serif' }}>
      <header className="mb-10 text-left">
        <EditableField as="h1" path="fullName" value={data.fullName} onChange={onDataChange} className="text-[32pt] font-bold text-slate-900 tracking-tighter mb-4" />
        <div className="flex flex-col gap-1 text-[10.5pt] font-medium text-slate-500">
            <EditableField path="contactInfo.email" value={data.contactInfo?.email} onChange={onDataChange} />
            <EditableField path="contactInfo.phone" value={data.contactInfo?.phone} onChange={onDataChange} />
            {data.contactInfo?.linkedin && (
                <EditableField path="contactInfo.linkedin" value={data.contactInfo?.linkedin} onChange={onDataChange} className="text-slate-700" />
            )}
            <EditableField path="contactInfo.location" value={data.contactInfo?.location} onChange={onDataChange} />
        </div>
      </header>
      <main>
        {sectionOrder.filter(k => sectionVisibility[k]).map(k => sections[k])}
      </main>
    </div>
  );
};

export default AtsProduct;
