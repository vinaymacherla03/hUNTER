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

const AtsHealthcare: React.FC<TemplateProps> = ({ data, sectionOrder, customization, sectionVisibility, onDataChange }) => {
  const sectionTitleStyle: React.CSSProperties = {
    fontSize: '11pt', 
    textTransform: 'uppercase',
    backgroundColor: '#e2e8f0', // slate-200
    padding: '4px 8px',
    marginBottom: '8px', 
    marginTop: '12px', 
    fontWeight: 'bold',
    color: '#0f172a',
    display: 'inline-block',
    width: '100%'
  };

  const sections: Record<ResumeSectionKey, React.ReactNode> = {
    summary: (
      <AnimatedSection key="summary" className="mb-4">
        <h2 style={sectionTitleStyle}>Professional Profile</h2>
        <EditableField as="p" path="summary" value={data.summary} onChange={onDataChange} className="text-black text-[10.5pt] leading-relaxed" />
      </AnimatedSection>
    ),
    certifications: data.certifications?.length ? (
        <AnimatedSection key="certifications" className="mb-4" style={{ pageBreakInside: 'avoid' }}>
          <h2 style={sectionTitleStyle}>Licenses & Certifications</h2>
          <div className="grid grid-cols-2 gap-x-4 gap-y-2">
            {(data.certifications || []).map((cert, i) => (
                <div key={`${cert.id || 'cert'}-${i}`} className="text-[10pt] text-black">
                <span className="font-bold">{cert.name}</span>
                <span className="text-slate-600 block text-[9pt]">{cert.issuer} {cert.date ? `• ${cert.date}` : ''}</span>
                </div>
            ))}
          </div>
        </AnimatedSection>
    ) : null,
    experience: (
      <AnimatedSection key="experience" className="mb-4">
        <h2 style={sectionTitleStyle}>Clinical & Professional Experience</h2>
        <EditableList items={data.experience || []} path="experience" onChange={onDataChange} newItem={{ id: '', role: 'Role', company: 'Company', location: 'Location', dates: 'Dates', description: ['Achievement'] }}>
          {(exp, i) => (
            <div key={`${exp.id || 'exp'}-${i}`} className="mb-4" style={{ pageBreakInside: 'avoid' }}>
              <div className="flex flex-col mb-1">
                <div className="flex justify-between items-baseline">
                    <EditableField path={`experience[${i}].role`} value={exp.role} onChange={onDataChange} className="font-bold text-[11pt] text-black" />
                    <EditableField path={`experience[${i}].dates`} value={exp.dates} onChange={onDataChange} className="text-[10pt] font-bold text-black" />
                </div>
                <div className="flex justify-between items-baseline">
                    <EditableField path={`experience[${i}].company`} value={exp.company} onChange={onDataChange} className="italic text-[10pt] text-black" />
                    <EditableField path={`experience[${i}].location`} value={exp.location} onChange={onDataChange} className="text-[10pt] text-slate-700" />
                </div>
              </div>
              <EditableList items={exp.description || []} path={`experience[${i}].description`} onChange={onDataChange} newItem="Achievement" className="list-disc ml-6 space-y-1">
                {(desc, di) => (
                    <div className="text-[10.5pt] text-black leading-relaxed">
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
      <AnimatedSection key="education" className="mb-4">
        <h2 style={sectionTitleStyle}>Education</h2>
        <div className="space-y-3">
            {(data.education || []).map((edu, i) => (
                <div key={`${edu.id || 'edu'}-${i}`} className="flex justify-between items-start">
                    <div>
                        <EditableField path={`education[${i}].degree`} value={edu.degree} onChange={onDataChange} className="font-bold text-[10.5pt] text-black block" />
                        <EditableField path={`education[${i}].institution`} value={edu.institution} onChange={onDataChange} className="text-[10pt] text-black block" />
                        <EditableField path={`education[${i}].location`} value={edu.location} onChange={onDataChange} className="text-[10pt] text-slate-700 italic block" />
                    </div>
                    <EditableField path={`education[${i}].graduationDate`} value={edu.graduationDate} onChange={onDataChange} className="text-[10pt] text-black font-semibold" />
                </div>
            ))}
        </div>
      </AnimatedSection>
    ),
    skills: (
      <AnimatedSection key="skills" className="mb-4">
        <h2 style={sectionTitleStyle}>Core Competencies</h2>
        <div className="mt-1">
          {(data.skills || []).map((cat, i) => (
            <div key={`${cat.id || 'cat'}-${i}`} className="text-[10pt] text-black leading-relaxed mb-1">
              <span className="font-bold underline mr-2">{cat.name}:</span> 
              <span>{(cat.skills || []).filter(Boolean).map(s => s.name).join(' • ')}</span>
            </div>
          ))}
        </div>
      </AnimatedSection>
    ),
    projects: null,
    awards: data.awards?.length ? (
        <AnimatedSection key="awards" className="mb-4" style={{ pageBreakInside: 'avoid' }}>
          <h2 style={sectionTitleStyle}>Honors & Awards</h2>
          {(data.awards || []).map((award, i) => (
            <div key={`${award.id || 'award'}-${i}`} className="text-[10pt] leading-relaxed text-black">
              <span className="font-bold">{award.name}</span>
              {award.issuer && ` — ${award.issuer}`}
              {award.date && ` (${award.date})`}
            </div>
          ))}
        </AnimatedSection>
    ) : null,
    keywords: null
  };

  return (
    <div id="resume-content" className="bg-white font-sans selection:bg-slate-200 selection:text-black">
      <header className="mb-6 text-center">
        <EditableField as="h1" path="fullName" value={data.fullName} onChange={onDataChange} className="text-[26pt] font-bold text-black mb-1" />
        <div className="flex justify-center flex-wrap gap-x-2 text-[10pt] text-slate-800">
            <EditableField path="contactInfo.location" value={data.contactInfo?.location} onChange={onDataChange} />
            <span className="text-slate-400">|</span>
            <EditableField path="contactInfo.phone" value={data.contactInfo?.phone} onChange={onDataChange} />
            <span className="text-slate-400">|</span>
            <EditableField path="contactInfo.email" value={data.contactInfo?.email} onChange={onDataChange} />
            {data.contactInfo?.linkedin && (
                <>
                    <span className="text-slate-400">|</span>
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

export default AtsHealthcare;
