
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

const ClassicAcademic: React.FC<TemplateProps> = ({ data, sectionOrder, customization, sectionVisibility, onDataChange }) => {
  const marginValue = { compact: '0.5in', normal: '1in', spacious: '1.25in' }[customization.margin] || '1in';
  
  const sectionTitleStyle: React.CSSProperties = {
    fontSize: `${customization.sectionTitleSize}pt`,
    color: '#000',
    fontWeight: 'bold',
    textTransform: 'uppercase',
    textAlign: 'center',
    marginBottom: '16px',
    marginTop: '32px',
    letterSpacing: '0.2em',
    borderBottom: '1px solid #eee',
    paddingBottom: '8px'
  };

  return (
    <div id="resume-content" style={{ padding: marginValue }} className="font-serif bg-white text-slate-900 leading-relaxed">
      <header className="text-center mb-12">
        <EditableField as="h1" path="fullName" value={data.fullName} onChange={onDataChange} style={{ fontSize: `${customization.nameSize}pt` }} className="font-normal uppercase tracking-[0.3em] mb-4" />
        <div className="flex justify-center gap-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest italic">
            <EditableField path="contactInfo.location" value={data.contactInfo.location} onChange={onDataChange} />
            <EditableField path="contactInfo.email" value={data.contactInfo.email} onChange={onDataChange} />
            <EditableField path="contactInfo.phone" value={data.contactInfo.phone} onChange={onDataChange} />
        </div>
      </header>

      <main className="max-w-3xl mx-auto">
          {sectionOrder.filter(k => sectionVisibility[k]).map(key => {
              if (key === 'summary') return (
                  <section key={key}>
                      <h2 style={sectionTitleStyle}>Objective</h2>
                      <EditableField as="p" path="summary" value={data.summary} onChange={onDataChange} className="text-sm text-center italic text-slate-600 px-12" />
                  </section>
              );

              if (key === 'experience') return (
                  <section key={key}>
                      <h2 style={sectionTitleStyle}>Academic Experience</h2>
                      <EditableList items={data.experience} path="experience" onChange={onDataChange} newItem={{ id: '', role: 'Research Fellow', company: 'Univ', location: 'UK', dates: '2020-2024', description: ['Published work'] }}>
                          {(exp, i) => (
                              <div key={exp.id} className="mb-8">
                                  <div className="text-center mb-2">
                                      <EditableField path={`experience[${i}].role`} value={exp.role} onChange={onDataChange} className="font-bold text-sm" />
                                      <div className="text-xs text-slate-500 uppercase tracking-widest mt-0.5">
                                          <EditableField path={`experience[${i}].company`} value={exp.company} onChange={onDataChange} />
                                          {" | "}
                                          <EditableField path={`experience[${i}].dates`} value={exp.dates} onChange={onDataChange} />
                                      </div>
                                  </div>
                                  <EditableList items={exp.description} path={`experience[${i}].description`} onChange={onDataChange} newItem="Publication point" className="space-y-1">
                                      {(desc, di) => <EditableField as="div" path={`experience[${i}].description[${di}]`} value={desc} onChange={onDataChange} className="text-sm text-slate-700 text-center" enableMarkdown />}
                                  </EditableList>
                              </div>
                          )}
                      </EditableList>
                  </section>
              );

              if (key === 'education') return (
                  <section key={key}>
                      <h2 style={sectionTitleStyle}>Education</h2>
                      <EditableList items={data.education} path="education" onChange={onDataChange} newItem={{ id: '', degree: 'PhD', institution: 'Harvard', location: 'MA', graduationDate: '2019' }}>
                          {(edu, i) => (
                              <div key={edu.id} className="text-center mb-6">
                                  <EditableField path={`education[${i}].degree`} value={edu.degree} onChange={onDataChange} className="font-bold text-sm block" />
                                  <EditableField path={`education[${i}].institution`} value={edu.institution} onChange={onDataChange} className="text-xs text-slate-500 italic block mt-0.5" />
                                  <EditableField path={`education[${i}].graduationDate`} value={edu.graduationDate} onChange={onDataChange} className="text-[10px] font-bold text-slate-400 block mt-1" />
                              </div>
                          )}
                      </EditableList>
                  </section>
              );

              return null;
          })}
      </main>
    </div>
  );
};

export default ClassicAcademic;
