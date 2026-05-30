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

const AtsFinance: React.FC<TemplateProps> = ({ data, sectionOrder, customization, sectionVisibility, onDataChange }) => {
  const sectionTitleStyle: React.CSSProperties = {
    fontSize: '11pt', 
    textTransform: 'uppercase', 
    borderBottom: '2px solid black',
    marginBottom: '8px', 
    marginTop: '16px', 
    fontWeight: 'bold',
    fontFamily: 'Georgia, serif'
  };

  const sections: Record<ResumeSectionKey, React.ReactNode> = {
    summary: (
      <AnimatedSection key="summary" className="mb-4">
        <h2 style={sectionTitleStyle}>Summary of Qualifications</h2>
        <EditableField as="p" path="summary" value={data.summary} onChange={onDataChange} className="text-black text-[10pt] leading-tight text-justify" />
      </AnimatedSection>
    ),
    experience: (
      <AnimatedSection key="experience" className="mb-4">
        <h2 style={sectionTitleStyle}>Professional Experience</h2>
        <EditableList items={data.experience || []} path="experience" onChange={onDataChange} newItem={{ id: '', role: 'Role', company: 'Company', location: 'Location', dates: 'Dates', description: ['Achievement'] }}>
          {(exp, i) => (
            <div key={`${exp.id || 'exp'}-${i}`} className="mb-3" style={{ pageBreakInside: 'avoid' }}>
              <div className="flex justify-between items-baseline">
                <EditableField path={`experience[${i}].company`} value={exp.company} onChange={onDataChange} className="font-bold text-[11pt]" />
                <EditableField path={`experience[${i}].location`} value={exp.location} onChange={onDataChange} className="text-[10pt]" />
              </div>
              <div className="flex justify-between items-baseline mb-1 border-b border-gray-100 pb-1">
                <EditableField path={`experience[${i}].role`} value={exp.role} onChange={onDataChange} className="italic text-[10pt]" />
                <EditableField path={`experience[${i}].dates`} value={exp.dates} onChange={onDataChange} className="italic text-[10pt] font-semibold" />
              </div>
              <EditableList items={exp.description || []} path={`experience[${i}].description`} onChange={onDataChange} newItem="Achievement" className="list-disc ml-5 space-y-0.5">
                {(desc, di) => (
                    <div className="text-[10pt] text-justify leading-tight">
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
      <AnimatedSection key="skills" className="mb-4">
        <h2 style={sectionTitleStyle}>Core Competencies</h2>
        <div className="text-[10pt] leading-snug">
          {(data.skills || []).map((cat, i) => (
            <div key={`${cat.id || 'cat'}-${i}`}>
              <span className="font-bold border-b border-gray-200">{cat.name}:</span> 
              <span> {(cat.skills || []).filter(Boolean).map(s => s.name).join(', ')}</span>
            </div>
          ))}
        </div>
      </AnimatedSection>
    ),
    education: (
      <AnimatedSection key="education" className="mb-4">
        <h2 style={sectionTitleStyle}>Education & Certifications</h2>
        {(data.education || []).map((edu, i) => (
            <div key={`${edu.id || 'edu'}-${i}`} className="mb-2">
              <div className="flex justify-between font-bold text-[10pt]">
                <EditableField path={`education[${i}].institution`} value={edu.institution} onChange={onDataChange} />
                <EditableField path={`education[${i}].location`} value={edu.location} onChange={onDataChange} />
              </div>
              <div className="flex justify-between text-[10pt]">
                <EditableField path={`education[${i}].degree`} value={edu.degree} onChange={onDataChange} className="italic" />
                <EditableField path={`education[${i}].graduationDate`} value={edu.graduationDate} onChange={onDataChange} />
              </div>
            </div>
        ))}
      </AnimatedSection>
    ),
    projects: data.projects?.length ? (
        <AnimatedSection key="projects" className="mb-4" style={{ pageBreakInside: 'avoid' }}>
          <h2 style={sectionTitleStyle}>Key Projects</h2>
          {(data.projects || []).map((proj, i) => (
            <div key={`${proj.id || 'proj'}-${i}`} className="mb-2">
              <EditableField path={`projects[${i}].name`} value={proj.name} onChange={onDataChange} className="font-bold text-[10pt] uppercase text-xs inline-block mr-2" />
              <EditableField path={`projects[${i}].role`} value={proj.role} onChange={onDataChange} className="italic text-[10pt] inline-block mr-2" />
              <span className="text-[10pt] leading-tight">
                  {proj.description?.join(' • ')}
              </span>
            </div>
          ))}
        </AnimatedSection>
    ) : null,
    certifications: data.certifications?.length ? (
        <AnimatedSection key="certifications" className="mb-4" style={{ pageBreakInside: 'avoid' }}>
          <h2 style={sectionTitleStyle}>Licenses & Certifications</h2>
          {(data.certifications || []).map((cert, i) => (
            <div key={`${cert.id || 'cert'}-${i}`} className="text-[10pt] leading-tight flex justify-between">
              <span className="font-bold">{cert.name} {cert.issuer && `| ${cert.issuer}`}</span>
              <span>{cert.date}</span>
            </div>
          ))}
        </AnimatedSection>
    ) : null,
    awards: data.awards?.length ? (
        <AnimatedSection key="awards" className="mb-4" style={{ pageBreakInside: 'avoid' }}>
          <h2 style={sectionTitleStyle}>Honors & Awards</h2>
          {(data.awards || []).map((award, i) => (
            <div key={`${award.id || 'award'}-${i}`} className="text-[10pt] leading-tight flex justify-between">
              <span className="font-bold">{award.name} {award.issuer && `| ${award.issuer}`}</span>
              <span>{award.date}</span>
            </div>
          ))}
        </AnimatedSection>
    ) : null,
    keywords: data.keywords?.length ? (
        <AnimatedSection key="keywords" className="mb-4" style={{ pageBreakInside: 'avoid' }}>
          <h2 style={sectionTitleStyle}>Keywords</h2>
          <div className="text-[10pt] leading-tight mt-1">
            {data.keywords?.join(', ')}
          </div>
        </AnimatedSection>
    ) : null
  };

  return (
    <div id="resume-content" className="bg-white font-serif selection:bg-slate-200 selection:text-black">
      <header className="mb-6 border-b-4 border-double border-gray-800 pb-4 text-center">
        <EditableField as="h1" path="fullName" value={data.fullName} onChange={onDataChange} className="text-[24pt] font-serif font-bold text-black uppercase tracking-wider mb-1" />
        <div className="flex justify-center flex-wrap gap-x-2 gap-y-1 text-[10pt] font-serif text-black tracking-wide">
            <EditableField path="contactInfo.location" value={data.contactInfo?.location} onChange={onDataChange} />
            <span className="font-bold text-gray-400">•</span>
            <EditableField path="contactInfo.phone" value={data.contactInfo?.phone} onChange={onDataChange} />
            <span className="font-bold text-gray-400">•</span>
            <EditableField path="contactInfo.email" value={data.contactInfo?.email} onChange={onDataChange} />
            {data.contactInfo?.linkedin && (
                <>
                    <span className="font-bold text-gray-400">•</span>
                    <EditableField path="contactInfo.linkedin" value={data.contactInfo?.linkedin} onChange={onDataChange} />
                </>
            )}
        </div>
      </header>
      <main>
        {sectionOrder.filter(k => sectionVisibility[k]).map(k => sections[k])}
      </main>
    </div>
  );
};

export default AtsFinance;
