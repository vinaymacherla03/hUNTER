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

const AtsFederal: React.FC<TemplateProps> = ({ data, sectionOrder, customization, sectionVisibility, onDataChange }) => {
  const sectionTitleStyle: React.CSSProperties = {
    fontSize: '11pt', 
    textTransform: 'uppercase',
    borderTop: '1px solid black',
    borderBottom: '1px solid black',
    padding: '4px 0',
    marginBottom: '10px', 
    marginTop: '16px', 
    fontWeight: 'bold',
    textAlign: 'center',
    backgroundColor: '#fafafa'
  };

  const sections: Record<ResumeSectionKey, React.ReactNode> = {
    summary: (
      <AnimatedSection key="summary" className="mb-4">
        <h2 style={sectionTitleStyle}>Professional Summary</h2>
        <EditableField as="p" path="summary" value={data.summary} onChange={onDataChange} className="text-black text-[10pt] leading-relaxed text-justify" />
      </AnimatedSection>
    ),
    experience: (
      <AnimatedSection key="experience" className="mb-4">
        <h2 style={sectionTitleStyle}>Work Experience</h2>
        <EditableList items={data.experience || []} path="experience" onChange={onDataChange} newItem={{ id: '', role: 'Role', company: 'Company', location: 'Location', dates: 'Dates', description: ['Achievement'] }}>
          {(exp, i) => (
            <div key={`${exp.id || 'exp'}-${i}`} className="mb-6" style={{ pageBreakInside: 'avoid' }}>
              <div className="font-bold text-[11pt] uppercase mb-1">
                  <EditableField path={`experience[${i}].role`} value={exp.role} onChange={onDataChange} />
              </div>
              <div className="text-[10pt] mb-2 border-l-2 border-gray-400 pl-3">
                  <div><strong>Employer:</strong> <EditableField as="span" path={`experience[${i}].company`} value={exp.company} onChange={onDataChange} /></div>
                  <div><strong>Location:</strong> <EditableField as="span" path={`experience[${i}].location`} value={exp.location} onChange={onDataChange} /></div>
                  <div><strong>Dates of Employment:</strong> <EditableField as="span" path={`experience[${i}].dates`} value={exp.dates} onChange={onDataChange} /></div>
              </div>
              <div className="text-[10pt] font-bold mb-1 underline mt-2">Duties, Accomplishments, and Related Skills:</div>
              <EditableList items={exp.description || []} path={`experience[${i}].description`} onChange={onDataChange} newItem="Achievement" className="list-disc ml-6 space-y-1">
                {(desc, di) => (
                    <div className="text-[10pt] text-black leading-relaxed">
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
        {(data.education || []).map((edu, i) => (
            <div key={`${edu.id || 'edu'}-${i}`} className="mb-4" style={{ pageBreakInside: 'avoid' }}>
                <div className="font-bold text-[11pt] uppercase mb-1">
                  <EditableField path={`education[${i}].degree`} value={edu.degree} onChange={onDataChange} />
                </div>
                <div className="text-[10pt] mb-1">
                    <div><strong>Institution:</strong> <EditableField as="span" path={`education[${i}].institution`} value={edu.institution} onChange={onDataChange} /></div>
                    <div><strong>Location:</strong> <EditableField as="span" path={`education[${i}].location`} value={edu.location} onChange={onDataChange} /></div>
                    <div><strong>Completion Date:</strong> <EditableField as="span" path={`education[${i}].graduationDate`} value={edu.graduationDate} onChange={onDataChange} /></div>
                </div>
            </div>
        ))}
      </AnimatedSection>
    ),
    skills: (
      <AnimatedSection key="skills" className="mb-4">
        <h2 style={sectionTitleStyle}>Job Related Skills</h2>
        <div className="space-y-2 mt-1">
          {(data.skills || []).map((cat, i) => (
            <div key={`${cat.id || 'cat'}-${i}`} className="text-[10pt] text-black">
              <strong>{cat.name}:</strong> 
              <span> {(cat.skills || []).filter(Boolean).map(s => s.name).join('; ')}</span>
            </div>
          ))}
        </div>
      </AnimatedSection>
    ),
    certifications: data.certifications?.length ? (
        <AnimatedSection key="certifications" className="mb-4" style={{ pageBreakInside: 'avoid' }}>
          <h2 style={sectionTitleStyle}>Certifications and Licenses</h2>
          {(data.certifications || []).map((cert, i) => (
            <div key={`${cert.id || 'cert'}-${i}`} className="text-[10pt] text-black mb-1">
              <strong>{cert.name}</strong>
              {cert.issuer && `, ${cert.issuer}`}
              {cert.date && ` (Issued: ${cert.date})`}
            </div>
          ))}
        </AnimatedSection>
    ) : null,
    awards: data.awards?.length ? (
        <AnimatedSection key="awards" className="mb-4" style={{ pageBreakInside: 'avoid' }}>
          <h2 style={sectionTitleStyle}>Honors, Awards, and Recognition</h2>
          {(data.awards || []).map((award, i) => (
            <div key={`${award.id || 'award'}-${i}`} className="text-[10pt] text-black mb-1">
              <strong>{award.name}</strong>
              {award.issuer && ` - ${award.issuer}`}
              {award.date && ` (${award.date})`}
            </div>
          ))}
        </AnimatedSection>
    ) : null,
    projects: null,
    keywords: null
  };

  return (
    <div id="resume-content" className="bg-white font-sans selection:bg-slate-200 selection:text-black">
      <header className="mb-8 text-center border-b-4 border-black pb-4">
        <EditableField as="h1" path="fullName" value={data.fullName} onChange={onDataChange} className="text-[20pt] font-bold text-black uppercase mb-4" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[10pt] text-black max-w-2xl mx-auto text-left">
            <div><strong>Location:</strong> <EditableField as="span" path="contactInfo.location" value={data.contactInfo?.location} onChange={onDataChange} /></div>
            <div><strong>Phone:</strong> <EditableField as="span" path="contactInfo.phone" value={data.contactInfo?.phone} onChange={onDataChange} /></div>
            <div><strong>Email:</strong> <EditableField as="span" path="contactInfo.email" value={data.contactInfo?.email} onChange={onDataChange} /></div>
            {data.contactInfo?.linkedin && (
                <div><strong>LinkedIn:</strong> <EditableField as="span" path="contactInfo.linkedin" value={data.contactInfo?.linkedin} onChange={onDataChange} /></div>
            )}
        </div>
      </header>
      <main>
        {sectionOrder.filter(k => sectionVisibility[k]).map(k => sections[k])}
      </main>
    </div>
  );
};

export default AtsFederal;
