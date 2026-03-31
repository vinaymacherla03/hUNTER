
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

const AtsExecutive: React.FC<TemplateProps> = ({ data, sectionOrder, customization, sectionVisibility, onDataChange }) => {
  const marginValue = { compact: '0.6in', normal: '0.8in', spacious: '1.2in' }[customization.margin] || '0.8in';
  
  const sectionTitleStyle: React.CSSProperties = {
    fontSize: `12pt`,
    color: '#000',
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
    marginBottom: '8px',
    marginTop: '24px',
    fontWeight: 'bold',
    borderBottom: '2px solid #000',
  };

  const sections: Record<ResumeSectionKey, React.ReactNode> = {
    summary: (
      <section key="summary" className="mb-6">
        <h2 style={sectionTitleStyle}>Summary</h2>
        <EditableField as="p" path="summary" value={data.summary} onChange={onDataChange} className="text-black leading-relaxed text-[11pt] mt-2 font-serif" />
      </section>
    ),
    experience: (
      <section key="experience" className="mb-6">
        <h2 style={sectionTitleStyle}>Experience</h2>
        <EditableList items={data.experience || []} path="experience" onChange={onDataChange} newItem={{ id: '', role: 'Role', company: 'Company', location: 'Location', dates: 'Dates', description: ['Achievement'] }}>
          {(exp, i) => (
            <div key={exp.id} className="mb-6 last:mb-0">
              <div className="flex justify-between items-baseline mb-1">
                <EditableField path={`experience[${i}].company`} value={exp.company} onChange={onDataChange} className="font-bold text-black text-[12pt] font-serif" />
                <EditableField path={`experience[${i}].location`} value={exp.location} onChange={onDataChange} className="text-black text-[10pt] italic" />
              </div>
              <div className="flex justify-between items-baseline mb-2">
                <EditableField path={`experience[${i}].role`} value={exp.role} onChange={onDataChange} className="italic text-black text-[11pt] font-serif" />
                <EditableField path={`experience[${i}].dates`} value={exp.dates} onChange={onDataChange} className="text-black text-[10pt] font-bold" />
              </div>
              <EditableList items={exp.description} path={`experience[${i}].description`} onChange={onDataChange} newItem="New achievement" className="list-disc ml-6 space-y-1">
                {(desc, di) => (
                    <div className="text-black text-[10.5pt] leading-relaxed font-serif">
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
      <section key="skills" className="mb-6">
        <h2 style={sectionTitleStyle}>Skills</h2>
        <div className="mt-2 space-y-2">
          {data.skills.flatMap(cat => cat.skills).map((s, si) => (
            <div key={si} className="text-[10.5pt] text-black leading-normal font-serif flex items-center gap-2">
              <span className="w-1 h-1 bg-black rounded-full" />
              {s.name}
            </div>
          ))}
        </div>
      </section>
    ),
    education: (
        <section key="education" className="mb-6">
          <h2 style={sectionTitleStyle}>Education</h2>
          {data.education.map((edu, i) => (
            <div key={edu.id} className="mb-3 last:mb-0">
              <div className="flex justify-between items-baseline">
                <EditableField path={`education[${i}].institution`} value={edu.institution} onChange={onDataChange} className="font-bold text-black text-[11pt] font-serif" />
                <EditableField path={`education[${i}].graduationDate`} value={edu.graduationDate} onChange={onDataChange} className="text-black text-[10pt] font-bold" />
              </div>
              <div className="flex justify-between items-baseline">
                <EditableField path={`education[${i}].degree`} value={edu.degree} onChange={onDataChange} className="italic text-black text-[10.5pt] font-serif" />
                <EditableField path={`education[${i}].location`} value={edu.location} onChange={onDataChange} className="text-black text-[10pt] italic" />
              </div>
            </div>
          ))}
        </section>
    ),
    projects: (
        <section key="projects" className="mb-6">
          <h2 style={sectionTitleStyle}>Projects</h2>
          {data.projects.map((proj, i) => (
            <div key={proj.id} className="mb-4 last:mb-0">
              <div className="flex justify-between items-baseline mb-1">
                <EditableField path={`projects[${i}].name`} value={proj.name} onChange={onDataChange} className="font-bold text-black text-[11pt] font-serif" />
                <EditableField path={`projects[${i}].role`} value={proj.role} onChange={onDataChange} className="text-black text-[10pt] italic" />
              </div>
              <div className="text-black text-[10.5pt] leading-relaxed font-serif italic">
                  {proj.description.join(' • ')}
              </div>
            </div>
          ))}
        </section>
    ),
    certifications: (
        <section key="certifications" className="mb-6">
          <h2 style={sectionTitleStyle}>Certifications</h2>
          <div className="space-y-2 mt-2">
            {data.certifications?.map((cert, i) => (
                <div key={cert.id} className="text-[10.5pt] text-black leading-normal font-serif">
                <span className="font-bold">{cert.name}</span>, {cert.issuer}
                </div>
            ))}
          </div>
        </section>
    ),
    awards: <div key="awards" />,
    keywords: (
        <section key="keywords" className="mb-6">
          <h2 style={sectionTitleStyle}>Keywords</h2>
          <div className="text-black text-[10.5pt] leading-relaxed font-serif mt-2">
            {data.keywords?.join(', ')}
          </div>
        </section>
    )
  };

  return (
    <div id="resume-content" style={{ padding: marginValue }} className="bg-white font-serif selection:bg-slate-200 selection:text-black">
      <header className="mb-10 border-b-4 border-black pb-6">
        <EditableField as="h1" path="fullName" value={data.fullName} onChange={onDataChange} className="text-[24pt] font-bold text-black mb-2 tracking-tight" />
        <EditableField as="p" path="title" value={data.title} onChange={onDataChange} className="text-[14pt] font-bold text-slate-700 uppercase tracking-widest mb-4" />
        
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-[10.5pt] text-black font-medium">
            <EditableField path="contactInfo.location" value={data.contactInfo.location} onChange={onDataChange} />
            <span className="text-slate-300">|</span>
            <EditableField path="contactInfo.phone" value={data.contactInfo.phone} onChange={onDataChange} />
            <span className="text-slate-300">|</span>
            <EditableField path="contactInfo.email" value={data.contactInfo.email} onChange={onDataChange} className="text-blue-800 underline" />
            {data.contactInfo.linkedin && (
                <>
                    <span className="text-slate-300">|</span>
                    <EditableField path="contactInfo.linkedin" value={data.contactInfo.linkedin} onChange={onDataChange} className="text-blue-800 underline" />
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

export default AtsExecutive;
