
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

const FunctionalSkills: React.FC<TemplateProps> = ({ data, sectionOrder, customization, sectionVisibility, onDataChange }) => {
  const marginValue = { compact: '0.4in', normal: '0.6in', spacious: '0.8in' }[customization.margin] || '0.6in';
  
  const sectionTitleStyle: React.CSSProperties = {
    fontSize: `${customization.sectionTitleSize}pt`,
    color: '#fff',
    backgroundColor: customization.sectionTitleColor,
    padding: '4px 10px',
    borderRadius: '4px',
    fontWeight: 'black',
    marginBottom: '10px',
    marginTop: '20px',
    textTransform: 'uppercase'
  };

  return (
    <div id="resume-content" style={{ padding: marginValue }} className="flex flex-col h-full bg-white">
      <header className="flex justify-between items-center mb-8 border-b-4 border-slate-100 pb-6">
        <div>
            <EditableField as="h1" path="fullName" value={data.fullName} onChange={onDataChange} style={{ fontSize: `${customization.nameSize}pt` }} className="font-black leading-tight tracking-tighter text-slate-900" />
            <EditableField as="p" path="title" value={data.title} onChange={onDataChange} style={{ fontSize: `${customization.titleSize}pt` }} className="text-slate-400 font-bold uppercase tracking-[0.2em]" />
        </div>
        <div className="text-right text-xs font-bold text-slate-500 space-y-1">
             <EditableField path="contactInfo.email" value={data.contactInfo.email} onChange={onDataChange} className="block" />
             <EditableField path="contactInfo.phone" value={data.contactInfo.phone} onChange={onDataChange} className="block" />
             <EditableField path="contactInfo.location" value={data.contactInfo.location} onChange={onDataChange} className="block" />
        </div>
      </header>

      <div className="flex gap-10">
          {/* Main Column */}
          <div className="flex-1">
              <section className="mb-8">
                  <h2 style={sectionTitleStyle}>Core Competencies</h2>
                  <div className="grid grid-cols-2 gap-x-8 gap-y-4 pt-2">
                      {data.skills.map((cat, i) => (
                          <div key={cat.id}>
                              <EditableField path={`skills[${i}].name`} value={cat.name} onChange={onDataChange} className="text-xs font-black text-slate-900 uppercase block mb-1" />
                              <ul className="text-xs text-slate-600 space-y-1">
                                  {cat.skills.map((s, si) => (
                                      <li key={s.id} className="flex items-center gap-2">
                                          <div className="w-1 h-1 rounded-full bg-[var(--primary-color)]" />
                                          <EditableField path={`skills[${i}].skills[${si}].name`} value={s.name} onChange={onDataChange} />
                                      </li>
                                  ))}
                              </ul>
                          </div>
                      ))}
                  </div>
              </section>

              <section className="mb-8">
                  <h2 style={sectionTitleStyle}>Professional Journey</h2>
                  <EditableList items={data.experience} path="experience" onChange={onDataChange} newItem={{ id: '', role: 'Role', company: 'Co', location: 'Loc', dates: 'Dates', description: ['Key Achievement'] }}>
                      {(exp, i) => (
                          <div key={exp.id} className="mb-4">
                              <div className="flex justify-between items-center mb-1">
                                  <EditableField path={`experience[${i}].role`} value={exp.role} onChange={onDataChange} className="font-bold text-slate-800" />
                                  <EditableField path={`experience[${i}].dates`} value={exp.dates} onChange={onDataChange} className="text-[10px] font-bold text-slate-400" />
                              </div>
                              <EditableField path={`experience[${i}].company`} value={exp.company} onChange={onDataChange} className="text-[10px] uppercase font-black text-slate-300 block mb-1" />
                              <div className="text-xs text-slate-600 italic">
                                  <EditableField as="div" path={`experience[${i}].description[0]`} value={exp.description[0]} onChange={onDataChange} enableMarkdown />
                              </div>
                          </div>
                      )}
                  </EditableList>
              </section>
          </div>

          {/* Narrow Column */}
          <div className="w-48 shrink-0">
               <section className="mb-8">
                  <h2 style={{ ...sectionTitleStyle, backgroundColor: '#f1f5f9', color: '#64748b' }}>Summary</h2>
                  <EditableField as="p" path="summary" value={data.summary} onChange={onDataChange} className="text-xs leading-loose text-slate-500 font-medium" />
              </section>

              <section>
                  <h2 style={{ ...sectionTitleStyle, backgroundColor: '#f1f5f9', color: '#64748b' }}>Education</h2>
                  <EditableList items={data.education} path="education" onChange={onDataChange} newItem={{ id: '', degree: 'Deg', institution: 'Inst', location: 'Loc', graduationDate: 'Date' }}>
                      {(edu, i) => (
                          <div key={edu.id} className="mb-4">
                              <EditableField path={`education[${i}].degree`} value={edu.degree} onChange={onDataChange} className="text-xs font-black text-slate-800 block leading-tight" />
                              <EditableField path={`education[${i}].institution`} value={edu.institution} onChange={onDataChange} className="text-[10px] font-bold text-slate-400 block mt-1" />
                          </div>
                      )}
                  </EditableList>
              </section>
          </div>
      </div>
    </div>
  );
};

export default FunctionalSkills;
