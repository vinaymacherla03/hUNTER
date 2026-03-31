
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

const CorporateATS: React.FC<TemplateProps> = ({ data, sectionOrder, customization, sectionVisibility, onDataChange }) => {
  const marginValue = { compact: '0.3in', normal: '0.5in', spacious: '0.8in' }[customization.margin] || '0.5in';
  
  const sectionTitleStyle: React.CSSProperties = {
    fontSize: `${customization.sectionTitleSize}pt`,
    color: customization.sectionTitleColor,
    textTransform: customization.sectionTitleUppercase ? 'uppercase' : 'none',
    fontWeight: 'bold',
    borderBottom: '1px solid #000',
    marginBottom: '6px',
    marginTop: '12px',
  };

  return (
    <div id="resume-content" style={{ padding: marginValue }} className="text-black bg-white">
      <header className="mb-4">
        <EditableField as="h1" path="fullName" value={data.fullName} onChange={onDataChange} style={{ fontSize: '18pt' }} className="font-bold text-center" />
        <div className="flex justify-center flex-wrap gap-2 text-xs font-medium mt-1">
            <EditableField path="contactInfo.email" value={data.contactInfo.email} onChange={onDataChange} />
            <span>|</span>
            <EditableField path="contactInfo.phone" value={data.contactInfo.phone} onChange={onDataChange} />
            <span>|</span>
            <EditableField path="contactInfo.location" value={data.contactInfo.location} onChange={onDataChange} />
            <span>|</span>
            <EditableField path="contactInfo.linkedin" value={data.contactInfo.linkedin} onChange={onDataChange} />
        </div>
      </header>

      <main>
          {sectionOrder.filter(k => sectionVisibility[k]).map(key => {
              if (key === 'summary') return (
                  <section key={key} className="mb-3">
                      <h2 style={sectionTitleStyle}>Professional Summary</h2>
                      <EditableField as="p" path="summary" value={data.summary} onChange={onDataChange} className="text-xs leading-relaxed" />
                  </section>
              );

              if (key === 'experience') return (
                  <section key={key} className="mb-3">
                      <h2 style={sectionTitleStyle}>Work Experience</h2>
                      <EditableList items={data.experience} path="experience" onChange={onDataChange} newItem={{ id: '', role: 'Role', company: 'Company', location: 'Loc', dates: 'Dates', description: ['Achievement'] }}>
                          {(exp, i) => (
                              <div key={exp.id} className="mb-3">
                                  <div className="flex justify-between font-bold text-xs">
                                      <span>
                                          <EditableField path={`experience[${i}].company`} value={exp.company} onChange={onDataChange} />
                                          {", "}
                                          <EditableField path={`experience[${i}].location`} value={exp.location} onChange={onDataChange} />
                                      </span>
                                      <EditableField path={`experience[${i}].dates`} value={exp.dates} onChange={onDataChange} />
                                  </div>
                                  <EditableField path={`experience[${i}].role`} value={exp.role} onChange={onDataChange} className="italic text-xs block mb-1" />
                                  <EditableList items={exp.description} path={`experience[${i}].description`} onChange={onDataChange} newItem="Bullet point" className="list-disc pl-5">
                                      {(desc, di) => <EditableField as="div" path={`experience[${i}].description[${di}]`} value={desc} onChange={onDataChange} className="text-xs" enableMarkdown />}
                                  </EditableList>
                              </div>
                          )}
                      </EditableList>
                  </section>
              );

              if (key === 'skills') return (
                  <section key={key} className="mb-3">
                      <h2 style={sectionTitleStyle}>Skills</h2>
                      <div className="text-xs leading-tight">
                        {data.skills.map((cat, i) => (
                            <div key={cat.id} className="mb-1">
                                <span className="font-bold"><EditableField path={`skills[${i}].name`} value={cat.name} onChange={onDataChange} />:</span>{" "}
                                <EditableField path={`skills[${i}].skills`} value={cat.skills.map(s => s.name).join(', ')} onChange={(p, v) => onDataChange(p, v.split(',').map(s => ({ name: s.trim(), proficiency: 'Intermediate' })))} />
                            </div>
                        ))}
                      </div>
                  </section>
              );

              return null;
          })}
      </main>
    </div>
  );
};

export default CorporateATS;
