
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
    fontSize: `11pt`,
    color: '#000',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    marginBottom: '6px',
    marginTop: '16px',
    fontWeight: 'bold',
    borderBottom: '1.5px solid #000',
    paddingBottom: '1px',
  };

  const sections: Record<ResumeSectionKey, React.ReactNode> = {
    summary: (
      <section key="summary" className="mb-4">
        <h2 style={sectionTitleStyle}>Profile Summary</h2>
        <EditableField as="p" path="summary" value={data.summary} onChange={onDataChange} className="text-black leading-relaxed text-[10.5pt] mt-1 font-serif" />
      </section>
    ),
    experience: (
      <section key="experience" className="mb-4">
        <h2 style={sectionTitleStyle}>Professional Experience</h2>
        <EditableList items={data.experience || []} path="experience" onChange={onDataChange} newItem={{ id: '', role: 'Role', company: 'Company', location: 'Location', dates: 'Dates', description: ['Achievement'] }}>
          {(exp, i) => (
            <div key={exp.id} className="mb-5 last:mb-0" style={{ pageBreakInside: 'avoid' }}>
              <div className="flex gap-6">
                <div className="w-[130px] shrink-0 text-black text-[10pt]">
                  <EditableField path={`experience[${i}].dates`} value={exp.dates} onChange={onDataChange} className="font-bold block mb-0.5" />
                  <EditableField path={`experience[${i}].location`} value={exp.location} onChange={onDataChange} className="text-slate-600 italic" />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-0.5 gap-4">
                    <div className="flex-1">
                        <EditableField path={`experience[${i}].role`} value={exp.role} onChange={onDataChange} className="font-bold text-black text-[11.5pt] font-serif leading-tight" />
                    </div>
                    <div className="text-right shrink-0">
                        <EditableField path={`experience[${i}].company`} value={exp.company} onChange={onDataChange} className="font-bold text-black text-[10.5pt] leading-tight" />
                    </div>
                  </div>
                  <EditableList items={exp.description} path={`experience[${i}].description`} onChange={onDataChange} newItem="New achievement" className="list-disc ml-5 space-y-1">
                    {(desc, di) => (
                        <div className="text-black text-[10.5pt] leading-relaxed font-serif">
                            <EditableField as="div" path={`experience[${i}].description[${di}]`} value={desc} onChange={onDataChange} enableMarkdown />
                        </div>
                    )}
                  </EditableList>
                </div>
              </div>
            </div>
          )}
        </EditableList>
      </section>
    ),
    skills: (
      <section key="skills" className="mb-6">
        <h2 style={sectionTitleStyle}>Skills</h2>
        <div className="mt-2 space-y-2">
          {data.skills?.flatMap(cat => cat.skills)?.map((s, si) => (
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
          {data.education?.map((edu, i) => (
            <div key={edu.id} className="mb-3 last:mb-0">
              <div className="flex justify-between items-baseline gap-4">
                <EditableField path={`education[${i}].institution`} value={edu.institution} onChange={onDataChange} className="font-bold text-black text-[11pt] font-serif flex-1" />
                <EditableField path={`education[${i}].graduationDate`} value={edu.graduationDate} onChange={onDataChange} className="text-black text-[10pt] font-bold shrink-0" />
              </div>
              <div className="flex justify-between items-baseline gap-4">
                <EditableField path={`education[${i}].degree`} value={edu.degree} onChange={onDataChange} className="italic text-black text-[10.5pt] font-serif flex-1" />
                <EditableField path={`education[${i}].location`} value={edu.location} onChange={onDataChange} className="text-black text-[10pt] italic shrink-0" />
              </div>
            </div>
          ))}
        </section>
    ),
    projects: data.projects?.length ? (
        <section key="projects" className="mb-6" style={{ pageBreakInside: 'avoid' }}>
          <h2 style={sectionTitleStyle}>Projects</h2>
          {data.projects?.map((proj, i) => (
            <div key={proj.id} className="mb-4 last:mb-0">
              <div className="flex justify-between items-baseline mb-1 gap-4">
                <EditableField path={`projects[${i}].name`} value={proj.name} onChange={onDataChange} className="font-bold text-black text-[11pt] font-serif flex-1" />
                <EditableField path={`projects[${i}].role`} value={proj.role} onChange={onDataChange} className="text-black text-[10pt] italic shrink-0" />
              </div>
              <div className="text-black text-[10.5pt] leading-relaxed font-serif italic">
                  {proj.description?.join(' • ')}
              </div>
            </div>
          ))}
        </section>
    ) : null,
    certifications: data.certifications?.length ? (
        <section key="certifications" className="mb-6" style={{ pageBreakInside: 'avoid' }}>
          <h2 style={sectionTitleStyle}>Certifications</h2>
          <div className="space-y-2 mt-2">
            {data.certifications?.map((cert, i) => (
                <div key={cert.id} className="text-[10.5pt] text-black leading-normal font-serif">
                <span className="font-bold">{cert.name}</span>
                {cert.issuer && `, ${cert.issuer}`}
                {cert.date && ` (${cert.date})`}
                </div>
            ))}
          </div>
        </section>
    ) : null,
    awards: data.awards?.length ? (
        <section key="awards" className="mb-6" style={{ pageBreakInside: 'avoid' }}>
          <h2 style={sectionTitleStyle}>Awards</h2>
          <div className="space-y-2 mt-2">
            {data.awards?.map((award, i) => (
                <div key={award.id} className="text-[10.5pt] text-black leading-normal font-serif">
                <span className="font-bold">{award.name}</span>
                {award.issuer && `, ${award.issuer}`}
                {award.date && ` (${award.date})`}
                </div>
            ))}
          </div>
        </section>
    ) : null,
    keywords: data.keywords?.length ? (
        <section key="keywords" className="mb-6" style={{ pageBreakInside: 'avoid' }}>
          <h2 style={sectionTitleStyle}>Keywords</h2>
          <div className="text-black text-[10.5pt] leading-relaxed font-serif mt-2">
            {data.keywords?.join(', ')}
          </div>
        </section>
    ) : null
  };

  const contactItems = [
    data.contactInfo.location,
    data.contactInfo.phone,
    data.contactInfo.email,
    data.contactInfo.linkedin
  ].filter(Boolean);

  return (
    <div id="resume-content" className="bg-white font-serif selection:bg-slate-200 selection:text-black">
      <header className="mb-6 text-center flex flex-col items-center">
        <EditableField as="h1" path="fullName" value={data.fullName} onChange={onDataChange} className="text-[28pt] font-bold text-black mb-1 tracking-tight" />
        <EditableField as="p" path="title" value={data.title} onChange={onDataChange} className="text-[12pt] font-bold text-slate-700 uppercase tracking-widest mb-3" />
        
        <div className="flex justify-center flex-wrap gap-x-3 gap-y-1 text-[10.5pt] text-black">
            {contactItems.map((item, idx) => (
                <React.Fragment key={idx}>
                    <EditableField 
                        path={idx === 0 ? "contactInfo.location" : idx === 1 ? "contactInfo.phone" : idx === 2 ? "contactInfo.email" : "contactInfo.linkedin"} 
                        value={item} 
                        onChange={onDataChange} 
                        className={idx === 2 || idx === 3 ? "text-blue-700 underline" : ""}
                    />
                    {idx < contactItems.length - 1 && <span className="text-slate-400">•</span>}
                </React.Fragment>
            ))}
        </div>
      </header>
      
      <main>
        {sectionOrder.filter(k => sectionVisibility[k]).map(k => sections[k])}
      </main>
    </div>
  );
};

export default AtsExecutive;
