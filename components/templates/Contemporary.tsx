
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

const Contemporary: React.FC<TemplateProps> = ({ data, sectionOrder, customization, sectionVisibility, onDataChange }) => {
  const marginValue = { compact: '0.4in', normal: '0.6in', spacious: '0.8in' }[customization.margin] || '0.6in';
  
  const headerStyle: React.CSSProperties = {
    backgroundColor: customization.color === 'slate' ? '#1e293b' : 'var(--primary-color)',
    padding: '40px',
    color: '#fff',
    borderRadius: '12px',
    marginBottom: '40px'
  };

  const sectionTitleStyle: React.CSSProperties = {
    fontSize: `${customization.sectionTitleSize}pt`,
    color: customization.sectionTitleColor,
    fontWeight: 'black',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '20px',
    marginTop: '40px'
  };

  return (
    <div id="resume-content" style={{ padding: marginValue }} className="bg-white">
      <header style={headerStyle} className="relative overflow-hidden">
        <div className="absolute top-[-100px] right-[-100px] w-[300px] h-[300px] bg-white/10 rounded-full blur-[80px]" />
        <div className="relative z-10 flex justify-between items-end">
            <div>
                <EditableField as="h1" path="fullName" value={data.fullName} onChange={onDataChange} style={{ fontSize: `${customization.nameSize}pt` }} className="font-black leading-none tracking-tighter" />
                <EditableField as="p" path="title" value={data.title} onChange={onDataChange} style={{ fontSize: `${customization.titleSize}pt` }} className="opacity-80 font-bold mt-2" />
            </div>
            <div className="text-right text-[10px] font-black uppercase tracking-widest opacity-70 space-y-1">
                <EditableField path="contactInfo.email" value={data.contactInfo.email} onChange={onDataChange} className="block" />
                <EditableField path="contactInfo.phone" value={data.contactInfo.phone} onChange={onDataChange} className="block" />
                <EditableField path="contactInfo.location" value={data.contactInfo.location} onChange={onDataChange} className="block" />
            </div>
        </div>
      </header>

      <main>
          {sectionOrder.filter(k => sectionVisibility[k]).map(key => {
              if (key === 'summary') return (
                  <section key={key}>
                      <EditableField as="p" path="summary" value={data.summary} onChange={onDataChange} className="text-lg text-slate-600 leading-relaxed font-medium" />
                  </section>
              );

              if (key === 'experience') return (
                  <section key={key}>
                      <h2 style={sectionTitleStyle}>
                          <div className="w-8 h-1 bg-[var(--primary-color)] rounded-full" />
                          Experience
                      </h2>
                      <EditableList items={data.experience} path="experience" onChange={onDataChange} newItem={{ id: '', role: 'Lead', company: 'Tech', location: 'Remote', dates: '2024', description: ['Project'] }}>
                          {(exp, i) => (
                              <div key={exp.id} className="grid grid-cols-[140px_1fr] gap-8 mb-10">
                                  <EditableField path={`experience[${i}].dates`} value={exp.dates} onChange={onDataChange} className="text-xs font-black text-slate-300 uppercase tracking-widest pt-1" />
                                  <div>
                                      <EditableField path={`experience[${i}].role`} value={exp.role} onChange={onDataChange} className="text-lg font-black text-slate-800 leading-tight block mb-1" />
                                      <EditableField path={`experience[${i}].company`} value={exp.company} onChange={onDataChange} className="text-sm font-bold text-[var(--primary-color)] block mb-4" />
                                      <EditableList items={exp.description} path={`experience[${i}].description`} onChange={onDataChange} newItem="Achievement" className="space-y-3">
                                          {(desc, di) => (
                                              <div className="flex gap-3 text-sm text-slate-600 leading-relaxed">
                                                  <svg className="w-3 h-3 text-slate-200 mt-1 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" /></svg>
                                                  <EditableField as="div" path={`experience[${i}].description[${di}]`} value={desc} onChange={onDataChange} enableMarkdown />
                                              </div>
                                          )}
                                      </EditableList>
                                  </div>
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

export default Contemporary;
