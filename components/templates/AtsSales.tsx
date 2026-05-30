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

const AtsSales: React.FC<TemplateProps> = ({ data, sectionOrder, customization, sectionVisibility, onDataChange }) => {
  const sectionTitleStyle: React.CSSProperties = {
    fontSize: '12pt', 
    textTransform: 'uppercase',
    color: '#0369a1', // sky-700
    borderBottom: '2px solid #0369a1',
    marginBottom: '8px', 
    marginTop: '16px', 
    fontWeight: 'bold'
  };

  const sections: Record<ResumeSectionKey, React.ReactNode> = {
    summary: (
      <AnimatedSection key="summary" className="mb-5">
        <h2 style={sectionTitleStyle}>Executive Summary</h2>
        <EditableField as="p" path="summary" value={data.summary} onChange={onDataChange} className="text-black text-[10.5pt] leading-relaxed font-medium" />
      </AnimatedSection>
    ),
    skills: (
      <AnimatedSection key="skills" className="mb-5">
        <h2 style={sectionTitleStyle}>Areas of Expertise</h2>
        <div className="flex flex-wrap gap-x-6 gap-y-2 mt-2">
          {(data.skills || []).flatMap(c => c.skills || []).filter(Boolean).map((s, i) => (
            <div key={i} className="text-[10.5pt] font-semibold text-slate-800 flex items-center">
              <span className="w-1.5 h-1.5 rounded-full bg-sky-600 mr-2 inline-block"></span>
              {s.name}
            </div>
          ))}
        </div>
      </AnimatedSection>
    ),
    experience: (
      <AnimatedSection key="experience" className="mb-5">
        <h2 style={sectionTitleStyle}>Professional Experience</h2>
        <EditableList items={data.experience || []} path="experience" onChange={onDataChange} newItem={{ id: '', role: 'Role', company: 'Company', location: 'Location', dates: 'Dates', description: ['Achievement'] }}>
          {(exp, i) => (
            <div key={`${exp.id || 'exp'}-${i}`} className="mb-5" style={{ pageBreakInside: 'avoid' }}>
              <div className="flex justify-between items-baseline mb-1">
                <EditableField path={`experience[${i}].company`} value={exp.company} onChange={onDataChange} className="font-bold text-[12pt] text-slate-900" />
                <EditableField path={`experience[${i}].location`} value={exp.location} onChange={onDataChange} className="text-[10pt] font-semibold text-sky-800" />
              </div>
              <div className="flex justify-between items-baseline mb-2 pb-1 border-b border-gray-100">
                <EditableField path={`experience[${i}].role`} value={exp.role} onChange={onDataChange} className="italic text-[11pt] text-slate-700 font-medium" />
                <EditableField path={`experience[${i}].dates`} value={exp.dates} onChange={onDataChange} className="italic text-[10pt] text-slate-500" />
              </div>
              <EditableList items={exp.description || []} path={`experience[${i}].description`} onChange={onDataChange} newItem="Achievement" className="list-disc ml-5 space-y-1 mt-1">
                {(desc, di) => (
                    <div className="text-[10.5pt] text-slate-800 leading-relaxed">
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
            <div key={`${edu.id || 'edu'}-${i}`} className="mb-2">
              <div className="flex justify-between">
                <EditableField path={`education[${i}].institution`} value={edu.institution} onChange={onDataChange} className="font-bold text-[10.5pt]" />
                <EditableField path={`education[${i}].graduationDate`} value={edu.graduationDate} onChange={onDataChange} className="text-[10pt] text-slate-600" />
              </div>
              <div className="flex justify-between text-[10pt] text-slate-700 mt-0.5">
                <EditableField path={`education[${i}].degree`} value={edu.degree} onChange={onDataChange} />
                <EditableField path={`education[${i}].location`} value={edu.location} onChange={onDataChange} />
              </div>
            </div>
        ))}
      </AnimatedSection>
    ),
    projects: null,
    certifications: null,
    awards: data.awards?.length ? (
        <AnimatedSection key="awards" className="mb-5" style={{ pageBreakInside: 'avoid' }}>
          <h2 style={sectionTitleStyle}>Key Achievements & Awards</h2>
          {(data.awards || []).map((award, i) => (
            <div key={`${award.id || 'award'}-${i}`} className="text-[10.5pt] mb-1">
              <span className="font-bold text-sky-800">{award.name}</span>
              {award.issuer && ` | ${award.issuer}`}
              <span className="float-right text-slate-500 italic">{award.date}</span>
            </div>
          ))}
        </AnimatedSection>
    ) : null,
    keywords: null
  };

  return (
    <div id="resume-content" className="bg-white font-sans selection:bg-slate-200 selection:text-black">
      <header className="mb-6 text-center">
        <EditableField as="h1" path="fullName" value={data.fullName} onChange={onDataChange} className="text-[28pt] font-bold text-sky-900 tracking-tight mb-2" />
        <div className="flex justify-center flex-wrap gap-x-4 text-[10pt] font-semibold text-slate-600">
            <EditableField path="contactInfo.location" value={data.contactInfo?.location} onChange={onDataChange} />
            <span className="text-sky-300">|</span>
            <EditableField path="contactInfo.email" value={data.contactInfo?.email} onChange={onDataChange} />
            <span className="text-sky-300">|</span>
            <EditableField path="contactInfo.phone" value={data.contactInfo?.phone} onChange={onDataChange} />
            {data.contactInfo?.linkedin && (
                <>
                    <span className="text-sky-300">|</span>
                    <EditableField path="contactInfo.linkedin" value={data.contactInfo?.linkedin} onChange={onDataChange} className="text-sky-700" />
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

export default AtsSales;
