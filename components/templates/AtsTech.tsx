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

const AtsTech: React.FC<TemplateProps> = ({ data, sectionOrder, customization, sectionVisibility, onDataChange }) => {
  const sectionTitleStyle: React.CSSProperties = {
    fontSize: '12pt', 
    textTransform: 'uppercase',
    marginBottom: '8px', 
    marginTop: '12px', 
    fontWeight: '700',
    color: '#334155', // slate-700
    letterSpacing: '0.025em'
  };

  const sections: Record<ResumeSectionKey, React.ReactNode> = {
    summary: (
      <AnimatedSection key="summary" className="mb-5">
        <h2 style={sectionTitleStyle}>Profile</h2>
        <EditableField as="p" path="summary" value={data.summary} onChange={onDataChange} className="text-[#1e293b] text-[10.5pt] leading-snug" />
      </AnimatedSection>
    ),
    skills: (
      <AnimatedSection key="skills" className="mb-5">
        <h2 style={sectionTitleStyle}>Technical Skills</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-1 mt-1">
          {(data.skills || []).map((cat, i) => (
            <div key={`${cat.id || 'cat'}-${i}`} className="text-[10pt] leading-tight flex items-start break-inside-avoid">
              <span className="font-semibold text-slate-700 w-1/3 shrink-0">{cat.name}</span> 
              <span className="text-slate-900 w-2/3">{(cat.skills || []).filter(Boolean).map(s => s.name).join(', ')}</span>
            </div>
          ))}
        </div>
      </AnimatedSection>
    ),
    experience: (
      <AnimatedSection key="experience" className="mb-5">
        <h2 style={sectionTitleStyle}>Experience</h2>
        <EditableList items={data.experience || []} path="experience" onChange={onDataChange} newItem={{ id: '', role: 'Role', company: 'Company', location: 'Location', dates: 'Dates', description: ['Achievement'] }}>
          {(exp, i) => (
            <div key={`${exp.id || 'exp'}-${i}`} className="mb-4" style={{ pageBreakInside: 'avoid' }}>
              <div className="flex justify-between items-baseline mb-0.5">
                <div className="flex items-baseline gap-2">
                    <EditableField path={`experience[${i}].role`} value={exp.role} onChange={onDataChange} className="font-bold text-[11pt] text-slate-900" />
                    <span className="text-slate-400">@</span>
                    <EditableField path={`experience[${i}].company`} value={exp.company} onChange={onDataChange} className="font-semibold text-[10.5pt] text-slate-800" />
                </div>
                <div className="flex gap-2 text-[10pt]">
                    <EditableField path={`experience[${i}].location`} value={exp.location} onChange={onDataChange} className="text-slate-500" />
                    <span className="text-slate-300">|</span>
                    <EditableField path={`experience[${i}].dates`} value={exp.dates} onChange={onDataChange} className="text-slate-600 font-medium whitespace-nowrap" />
                </div>
              </div>
              <EditableList items={exp.description || []} path={`experience[${i}].description`} onChange={onDataChange} newItem="Achievement" className="list-disc ml-4 space-y-1 pl-2">
                {(desc, di) => (
                    <div className="text-[10pt] text-slate-800 leading-snug">
                        <EditableField as="div" path={`experience[${i}].description[${di}]`} value={desc} onChange={onDataChange} enableMarkdown />
                    </div>
                )}
              </EditableList>
            </div>
          )}
        </EditableList>
      </AnimatedSection>
    ),
    education: (
      <AnimatedSection key="education" className="mb-5">
        <h2 style={sectionTitleStyle}>Education</h2>
        {(data.education || []).map((edu, i) => (
            <div key={`${edu.id || 'edu'}-${i}`} className="mb-2 flex justify-between items-start">
              <div>
                <EditableField path={`education[${i}].degree`} value={edu.degree} onChange={onDataChange} className="font-bold text-[10.5pt] text-slate-900 block" />
                <div className="flex gap-1 text-[10pt] text-slate-700 mt-0.5">
                  <EditableField path={`education[${i}].institution`} value={edu.institution} onChange={onDataChange} />
                  <span>,</span>
                  <EditableField path={`education[${i}].location`} value={edu.location} onChange={onDataChange} />
                </div>
              </div>
              <EditableField path={`education[${i}].graduationDate`} value={edu.graduationDate} onChange={onDataChange} className="text-[10pt] font-medium text-slate-600 whitespace-nowrap" />
            </div>
        ))}
      </AnimatedSection>
    ),
    projects: data.projects?.length ? (
        <AnimatedSection key="projects" className="mb-5" style={{ pageBreakInside: 'avoid' }}>
          <h2 style={sectionTitleStyle}>Technical Projects</h2>
          {(data.projects || []).map((proj, i) => (
            <div key={`${proj.id || 'proj'}-${i}`} className="mb-3">
              <div className="flex items-baseline gap-2 mb-1">
                  <EditableField path={`projects[${i}].name`} value={proj.name} onChange={onDataChange} className="font-bold text-[10.5pt] text-slate-900" />
                  <span className="text-slate-400">—</span>
                  <EditableField path={`projects[${i}].role`} value={proj.role} onChange={onDataChange} className="text-[10pt] text-slate-700 font-medium" />
              </div>
              <div className="text-[10pt] leading-snug text-slate-800">
                  {proj.description?.join(' • ')}
              </div>
            </div>
          ))}
        </AnimatedSection>
    ) : null,
    certifications: data.certifications?.length ? (
        <AnimatedSection key="certifications" className="mb-5" style={{ pageBreakInside: 'avoid' }}>
          <h2 style={sectionTitleStyle}>Certifications</h2>
          {(data.certifications || []).map((cert, i) => (
            <div key={`${cert.id || 'cert'}-${i}`} className="text-[10pt] leading-snug text-slate-800">
              <span className="font-bold text-slate-900">{cert.name}</span>
              {cert.issuer && ` - ${cert.issuer}`}
              {cert.date && <span className="float-right text-slate-600">{cert.date}</span>}
            </div>
          ))}
        </AnimatedSection>
    ) : null,
    awards: data.awards?.length ? (
        <AnimatedSection key="awards" className="mb-5" style={{ pageBreakInside: 'avoid' }}>
          <h2 style={sectionTitleStyle}>Awards</h2>
          {(data.awards || []).map((award, i) => (
            <div key={`${award.id || 'award'}-${i}`} className="text-[10pt] leading-snug text-slate-800">
              <span className="font-bold text-slate-900">{award.name}</span>
              {award.issuer && ` - ${award.issuer}`}
              {award.date && <span className="float-right text-slate-600">{award.date}</span>}
            </div>
          ))}
        </AnimatedSection>
    ) : null,
    keywords: data.keywords?.length ? (
        <AnimatedSection key="keywords" className="mb-5" style={{ pageBreakInside: 'avoid' }}>
          <h2 style={sectionTitleStyle}>Keywords</h2>
          <div className="text-[10pt] leading-snug mt-1 text-slate-600">
            {data.keywords?.join('  |  ')}
          </div>
        </AnimatedSection>
    ) : null
  };

  return (
    <div id="resume-content" className="bg-white font-sans selection:bg-slate-200 selection:text-black tracking-tight" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
      <header className="mb-6 flex flex-col items-start pb-2 border-b-2 border-slate-900">
        <EditableField as="h1" path="fullName" value={data.fullName} onChange={onDataChange} className="text-[28pt] font-extrabold text-slate-900 leading-none mb-2 tracking-tight" />
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-[10pt] font-medium text-slate-600 w-full justify-between">
            <div className="flex gap-4">
                <EditableField path="contactInfo.email" value={data.contactInfo?.email} onChange={onDataChange} />
                <EditableField path="contactInfo.phone" value={data.contactInfo?.phone} onChange={onDataChange} />
            </div>
            <div className="flex gap-4 text-right">
                {data.contactInfo?.linkedin && (
                    <EditableField path="contactInfo.linkedin" value={data.contactInfo?.linkedin} onChange={onDataChange} />
                )}
                <EditableField path="contactInfo.location" value={data.contactInfo?.location} onChange={onDataChange} />
            </div>
        </div>
      </header>
      <main>
        {sectionOrder.filter(k => sectionVisibility[k]).map(k => sections[k])}
      </main>
    </div>
  );
};

export default AtsTech;
