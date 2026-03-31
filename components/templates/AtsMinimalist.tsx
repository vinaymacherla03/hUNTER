
import React from 'react';
import { ResumeData, ResumeSectionKey, Customization } from '../../types';
import EditableField from '../EditableField';
import { EditableList } from '../EditableList';

interface TemplateProps {
  data: ResumeData;
  sectionOrder: ResumeSectionKey[];
  customization: Customization;
  sectionVisibility: Record<ResumeSectionKey, boolean>;
  onDataChange: (path: string, value: any) => void;
}

const AtsMinimalist: React.FC<TemplateProps> = ({ data, sectionOrder, customization, sectionVisibility, onDataChange }) => {
  const marginValue = { compact: '0.5in', normal: '0.75in', spacious: '1in' }[customization.margin] || '0.75in';
  
  const sectionTitleStyle: React.CSSProperties = {
    fontSize: `11pt`,
    color: '#000',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    marginBottom: '8px',
    marginTop: '20px',
    fontWeight: 'bold',
    borderBottom: '1px solid #eee',
  };

  const sections: Record<ResumeSectionKey, React.ReactNode> = {
    summary: (
      <section key="summary" className="mb-4">
        <h2 style={sectionTitleStyle}>Summary</h2>
        <EditableField as="p" path="summary" value={data.summary} onChange={onDataChange} className="text-black leading-normal text-[10pt] mt-1" />
      </section>
    ),
    experience: (
      <section key="experience" className="mb-4">
        <h2 style={sectionTitleStyle}>Experience</h2>
        <EditableList items={data.experience || []} path="experience" onChange={onDataChange} newItem={{ id: '', role: 'Role', company: 'Company', location: 'Location', dates: 'Dates', description: ['Achievement'] }}>
          {(exp, i) => (
            <div key={exp.id} className="mb-4 last:mb-0">
              <div className="flex justify-between items-baseline">
                <EditableField path={`experience[${i}].company`} value={exp.company} onChange={onDataChange} className="font-bold text-black text-[10.5pt]" />
                <EditableField path={`experience[${i}].dates`} value={exp.dates} onChange={onDataChange} className="text-black text-[10pt] font-bold" />
              </div>
              <div className="flex justify-between items-baseline mb-1">
                <EditableField path={`experience[${i}].role`} value={exp.role} onChange={onDataChange} className="italic text-black text-[10pt] block" />
                <EditableField path={`experience[${i}].location`} value={exp.location} onChange={onDataChange} className="text-black text-[10pt] italic" />
              </div>
              <EditableList items={exp.description} path={`experience[${i}].description`} onChange={onDataChange} newItem="New achievement" className="list-disc ml-5 space-y-0.5">
                {(desc, di) => (
                    <div className="text-black text-[10pt] leading-normal">
                        <EditableField as="div" path={`experience[${i}].description[${di}]`} value={desc} onChange={onDataChange} enableMarkdown />
                    </div>
                )}
              </EditableList>
            </div>
          )}
        </EditableList>
      </section>
    ),
    skills: (
      <section key="skills" className="mb-4">
        <h2 style={sectionTitleStyle}>Skills</h2>
        <div className="mt-1">
          {data.skills.map((cat, i) => (
            <div key={cat.id} className="text-[10pt] text-black leading-normal mb-1">
              <span className="font-bold">{cat.name}: </span>
              <span>{cat.skills.map(s => s.name).join(', ')}</span>
            </div>
          ))}
        </div>
      </section>
    ),
    education: (
        <section key="education" className="mb-4">
          <h2 style={sectionTitleStyle}>Education</h2>
          {data.education.map((edu, i) => (
            <div key={edu.id} className="mb-2 last:mb-0">
              <div className="flex justify-between items-baseline">
                <EditableField path={`education[${i}].institution`} value={edu.institution} onChange={onDataChange} className="font-bold text-black text-[10.5pt]" />
                <EditableField path={`education[${i}].graduationDate`} value={edu.graduationDate} onChange={onDataChange} className="text-black text-[10pt] font-bold" />
              </div>
              <div className="flex justify-between items-baseline">
                <EditableField path={`education[${i}].degree`} value={edu.degree} onChange={onDataChange} className="italic text-black text-[10pt] block" />
                <EditableField path={`education[${i}].location`} value={edu.location} onChange={onDataChange} className="text-black text-[10pt] italic" />
              </div>
            </div>
          ))}
        </section>
    ),
    projects: (
        <section key="projects" className="mb-4">
          <h2 style={sectionTitleStyle}>Projects</h2>
          {data.projects.map((proj, i) => (
            <div key={proj.id} className="mb-3 last:mb-0">
              <div className="flex justify-between items-baseline">
                <EditableField path={`projects[${i}].name`} value={proj.name} onChange={onDataChange} className="font-bold text-black text-[10.5pt]" />
                <EditableField path={`projects[${i}].dates`} value={`${proj.startDate || ''} - ${proj.endDate || ''}`} onChange={onDataChange} className="text-black text-[10pt] font-bold" />
              </div>
              <div className="text-black text-[10pt] leading-normal mt-0.5 italic">
                  {proj.description.join(' • ')}
              </div>
            </div>
          ))}
        </section>
    ),
    certifications: (
        <section key="certifications" className="mb-4">
          <h2 style={sectionTitleStyle}>Certifications</h2>
          {data.certifications?.map((cert, i) => (
            <div key={cert.id} className="text-[10pt] text-black leading-normal mb-1">
              <span className="font-bold">{cert.name}</span> | {cert.issuer} | {cert.date}
            </div>
          ))}
        </section>
    ),
    awards: <div key="awards" />,
    keywords: (
        <section key="keywords" className="mb-4">
          <h2 style={sectionTitleStyle}>Keywords</h2>
          <div className="text-black text-[10pt] leading-normal mt-1">
            {data.keywords?.join(', ')}
          </div>
        </section>
    )
  };

  return (
    <div id="resume-content" style={{ padding: marginValue }} className="bg-white font-sans selection:bg-slate-100 selection:text-black">
      <header className="mb-8 text-center">
        <EditableField as="h1" path="fullName" value={data.fullName} onChange={onDataChange} className="text-[20pt] font-bold text-black mb-1 tracking-tight" />
        <div className="flex justify-center flex-wrap gap-x-3 text-[10pt] text-black font-medium">
            <EditableField path="contactInfo.location" value={data.contactInfo.location} onChange={onDataChange} />
            <EditableField path="contactInfo.phone" value={data.contactInfo.phone} onChange={onDataChange} />
            <EditableField path="contactInfo.email" value={data.contactInfo.email} onChange={onDataChange} className="text-blue-700" />
            {data.contactInfo.linkedin && (
                <EditableField path="contactInfo.linkedin" value={data.contactInfo.linkedin} onChange={onDataChange} className="text-blue-700" />
            )}
        </div>
      </header>
      
      <main>
        {sectionOrder.filter(k => sectionVisibility[k]).map(k => sections[k])}
      </main>
    </div>
  );
};

export default AtsMinimalist;
