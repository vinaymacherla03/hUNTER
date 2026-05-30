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

const AtsOperations: React.FC<TemplateProps> = ({ data, sectionOrder, customization, sectionVisibility, onDataChange }) => {
  const sectionTitleStyle: React.CSSProperties = {
    fontSize: '11pt', 
    textTransform: 'uppercase',
    borderBottom: '1px solid #d1d5db',
    paddingBottom: '4px',
    marginBottom: '8px', 
    marginTop: '16px', 
    fontWeight: 'bold',
    color: '#1f2937'
  };

  const sections: Record<ResumeSectionKey, React.ReactNode> = {
    summary: (
      <AnimatedSection key="summary" className="mb-4">
        <h2 style={sectionTitleStyle}>Profile</h2>
        <EditableField as="p" path="summary" value={data.summary} onChange={onDataChange} className="text-[#374151] text-[10.5pt] leading-relaxed" />
      </AnimatedSection>
    ),
    experience: (
      <AnimatedSection key="experience" className="mb-4">
        <h2 style={sectionTitleStyle}>Professional Background</h2>
        <EditableList items={data.experience || []} path="experience" onChange={onDataChange} newItem={{ id: '', role: 'Role', company: 'Company', location: 'Location', dates: 'Dates', description: ['Achievement'] }}>
          {(exp, i) => (
            <div key={`${exp.id || 'exp'}-${i}`} className="mb-4" style={{ pageBreakInside: 'avoid' }}>
              <div className="flex justify-between items-center bg-gray-50 border border-gray-200 px-3 py-1 mb-2">
                <div className="font-bold text-[11pt] text-gray-900">
                    <EditableField as="span" path={`experience[${i}].company`} value={exp.company} onChange={onDataChange} />
                </div>
                <EditableField path={`experience[${i}].location`} value={exp.location} onChange={onDataChange} className="text-[10pt] text-gray-600" />
              </div>
              <div className="flex justify-between items-baseline mb-2 px-1">
                <EditableField path={`experience[${i}].role`} value={exp.role} onChange={onDataChange} className="font-bold text-[10.5pt] text-gray-800" />
                <EditableField path={`experience[${i}].dates`} value={exp.dates} onChange={onDataChange} className="italic text-[10pt] text-gray-600" />
              </div>
              <EditableList items={exp.description || []} path={`experience[${i}].description`} onChange={onDataChange} newItem="Achievement" className="list-disc ml-6 space-y-1">
                {(desc, di) => (
                    <div className="text-[10pt] text-gray-700 leading-relaxed">
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
        <div className="flex flex-wrap gap-2 mt-2">
          {(data.skills || []).map((cat, i) => (
            <div key={`${cat.id || 'cat'}-${i}`} className="text-[10pt] text-gray-700 bg-gray-100 border border-gray-200 px-2 py-1 rounded">
              <span className="font-bold mr-1">{cat.name}:</span> 
              <span>{(cat.skills || []).filter(Boolean).map(s => s.name).join(', ')}</span>
            </div>
          ))}
        </div>
      </AnimatedSection>
    ),
    education: (
      <AnimatedSection key="education" className="mb-4">
        <h2 style={sectionTitleStyle}>Education & Certifications</h2>
        {(data.education || []).map((edu, i) => (
            <div key={`${edu.id || 'edu'}-${i}`} className="mb-2 pl-3 border-l-2 border-gray-300">
                <EditableField path={`education[${i}].degree`} value={edu.degree} onChange={onDataChange} className="font-bold text-[10.5pt] text-gray-900 block" />
                <div className="flex justify-between items-baseline text-[10pt] text-gray-600 mt-1">
                    <div>
                        <EditableField as="span" path={`education[${i}].institution`} value={edu.institution} onChange={onDataChange} />
                        {', '}
                        <EditableField as="span" path={`education[${i}].location`} value={edu.location} onChange={onDataChange} />
                    </div>
                    <EditableField path={`education[${i}].graduationDate`} value={edu.graduationDate} onChange={onDataChange} />
                </div>
            </div>
        ))}
      </AnimatedSection>
    ),
    certifications: data.certifications?.length ? (
        <AnimatedSection key="certifications" className="mb-4" style={{ pageBreakInside: 'avoid' }}>
          <h2 style={sectionTitleStyle}>Licenses</h2>
          <ul className="list-disc ml-5 space-y-1">
            {(data.certifications || []).map((cert, i) => (
                <li key={`${cert.id || 'cert'}-${i}`} className="text-[10pt] text-gray-700">
                <span className="font-bold">{cert.name}</span>
                {cert.issuer && ` - ${cert.issuer}`}
                {cert.date && ` (${cert.date})`}
                </li>
            ))}
          </ul>
        </AnimatedSection>
    ) : null,
    projects: null,
    awards: null,
    keywords: null
  };

  return (
    <div id="resume-content" className="bg-white font-sans selection:bg-gray-200 selection:text-black">
      <header className="mb-6 flex gap-6 items-center bg-gray-800 text-white p-6 rounded-sm">
        <div className="flex-1">
            <EditableField as="h1" path="fullName" value={data.fullName} onChange={onDataChange} className="text-[26pt] font-bold tracking-tight mb-2" />
        </div>
        <div className="flex flex-col gap-1 text-[10pt] text-gray-300">
            <EditableField path="contactInfo.location" value={data.contactInfo?.location} onChange={onDataChange} />
            <EditableField path="contactInfo.phone" value={data.contactInfo?.phone} onChange={onDataChange} />
            <EditableField path="contactInfo.email" value={data.contactInfo?.email} onChange={onDataChange} />
            {data.contactInfo?.linkedin && (
                <EditableField path="contactInfo.linkedin" value={data.contactInfo?.linkedin} onChange={onDataChange} className="text-gray-400" />
            )}
        </div>
      </header>
      <main>
        {sectionOrder.filter(k => sectionVisibility[k]).map(k => sections[k])}
      </main>
    </div>
  );
};

export default AtsOperations;
