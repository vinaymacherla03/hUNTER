
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

const ExecutiveTier: React.FC<TemplateProps> = ({ data, sectionOrder, customization, sectionVisibility, onDataChange }) => {
  const marginValue = { compact: '0.5in', normal: '0.75in', spacious: '1in' }[customization.margin] || '0.75in';
  
  const sectionTitleStyle: React.CSSProperties = {
    fontSize: `${customization.sectionTitleSize}pt`,
    color: customization.sectionTitleColor,
    textTransform: customization.sectionTitleUppercase ? 'uppercase' : 'none',
    fontWeight: 'bold',
    borderBottom: `2px solid ${customization.sectionTitleBorderColor}`,
    paddingBottom: '2px',
    marginBottom: '10px',
    marginTop: '16px',
    fontFamily: customization.font === 'inter' ? 'serif' : 'inherit'
  };

  return (
    <div id="resume-content" style={{ padding: marginValue }} className="font-serif">
      <header className="text-center mb-8">
        <EditableField as="h1" path="fullName" value={data.fullName} onChange={onDataChange} style={{ fontSize: `${customization.nameSize}pt` }} className="font-bold mb-1" />
        <div className="flex justify-center flex-wrap gap-x-2 text-sm text-slate-600 italic">
            <EditableField path="contactInfo.location" value={data.contactInfo.location} onChange={onDataChange} />
            <span>•</span>
            <EditableField path="contactInfo.phone" value={data.contactInfo.phone} onChange={onDataChange} />
            <span>•</span>
            <EditableField path="contactInfo.email" value={data.contactInfo.email} onChange={onDataChange} />
            <span>•</span>
            <EditableField path="contactInfo.linkedin" value={data.contactInfo.linkedin} onChange={onDataChange} />
        </div>
      </header>

      <main>
          {sectionOrder.filter(k => sectionVisibility[k]).map(key => {
              if (key === 'summary') return (
                  <section key={key} className="mb-6">
                      <h2 style={sectionTitleStyle}>Executive Profile</h2>
                      <EditableField as="p" path="summary" value={data.summary} onChange={onDataChange} className="text-sm leading-relaxed text-justify italic" />
                  </section>
              );

              if (key === 'experience') return (
                  <section key={key} className="mb-6">
                      <h2 style={sectionTitleStyle}>Professional Leadership</h2>
                      <EditableList items={data.experience} path="experience" onChange={onDataChange} newItem={{ id: '', role: 'Executive', company: 'Corp', location: 'NY', dates: '2020-2024', description: ['Strategy'] }}>
                          {(exp, i) => (
                              <div key={exp.id} className="mb-5">
                                  <div className="flex justify-between items-baseline font-bold text-slate-800">
                                      <EditableField path={`experience[${i}].role`} value={exp.role} onChange={onDataChange} style={{ fontSize: `${customization.itemTitleSize}pt` }} />
                                      <EditableField path={`experience[${i}].dates`} value={exp.dates} onChange={onDataChange} className="text-sm" />
                                  </div>
                                  <div className="flex justify-between items-baseline mb-2">
                                      <EditableField path={`experience[${i}].company`} value={exp.company} onChange={onDataChange} className="text-sm font-semibold text-slate-600" />
                                      <EditableField path={`experience[${i}].location`} value={exp.location} onChange={onDataChange} className="text-xs text-slate-500 italic" />
                                  </div>
                                  <EditableList items={exp.description} path={`experience[${i}].description`} onChange={onDataChange} newItem="New strategic achievement" className="list-disc pl-5 space-y-1">
                                      {(desc, di) => <EditableField as="div" path={`experience[${i}].description[${di}]`} value={desc} onChange={onDataChange} className="text-sm text-slate-700" enableMarkdown />}
                                  </EditableList>
                              </div>
                          )}
                      </EditableList>
                  </section>
              );

              if (key === 'skills') return (
                  <section key={key} className="mb-6">
                      <h2 style={sectionTitleStyle}>Core Competencies</h2>
                      <div className="grid grid-cols-3 gap-4">
                          {data.skills.map((cat, i) => (
                              <div key={cat.id}>
                                  <EditableField path={`skills[${i}].name`} value={cat.name} onChange={onDataChange} className="text-xs font-bold block mb-1 underline" />
                                  <div className="text-[10px] leading-relaxed text-slate-600">
                                      <EditableField path={`skills[${i}].skills`} value={cat.skills.map(s => s.name).join(', ')} onChange={(p, v) => onDataChange(p, v.split(',').map(s => ({ name: s.trim(), proficiency: 'Expert' })))} />
                                  </div>
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

export default ExecutiveTier;
