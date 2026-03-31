
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

const TimelinePro: React.FC<TemplateProps> = ({ data, sectionOrder, customization, sectionVisibility, onDataChange }) => {
  const marginValue = { compact: '0.4in', normal: '0.6in', spacious: '0.8in' }[customization.margin] || '0.6in';
  
  const sectionTitleStyle: React.CSSProperties = {
    fontSize: `${customization.sectionTitleSize}pt`,
    color: '#94a3b8',
    fontWeight: 'black',
    textTransform: 'uppercase',
    letterSpacing: '0.3em',
    marginBottom: '20px',
    marginTop: '40px',
    textAlign: 'center'
  };

  return (
    <div id="resume-content" style={{ padding: marginValue }} className="bg-white">
       <header className="flex flex-col items-center text-center mb-16">
        <EditableField as="h1" path="fullName" value={data.fullName} onChange={onDataChange} style={{ fontSize: `${customization.nameSize}pt` }} className="font-black leading-none tracking-tighter text-slate-900 mb-4" />
        <div className="px-4 py-1.5 bg-slate-900 text-white rounded-full text-[10px] font-black uppercase tracking-widest mb-6">
            <EditableField path="title" value={data.title} onChange={onDataChange} />
        </div>
        <div className="flex gap-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            <EditableField path="contactInfo.email" value={data.contactInfo.email} onChange={onDataChange} />
            <EditableField path="contactInfo.phone" value={data.contactInfo.phone} onChange={onDataChange} />
            <EditableField path="contactInfo.location" value={data.contactInfo.location} onChange={onDataChange} />
        </div>
      </header>

      <main className="relative max-w-3xl mx-auto">
          {/* Vertical Timeline Bar */}
          <div className="absolute left-[70px] top-0 bottom-0 w-0.5 bg-slate-100 hidden sm:block" />

          {sectionOrder.filter(k => sectionVisibility[k]).map(key => {
              if (key === 'experience') return (
                  <section key={key}>
                      <h2 style={sectionTitleStyle}>History</h2>
                      <EditableList items={data.experience} path="experience" onChange={onDataChange} newItem={{ id: '', role: 'Role', company: 'Co', location: 'Loc', dates: '2024', description: ['Achievement'] }}>
                          {(exp, i) => (
                              <div key={exp.id} className="grid grid-cols-[140px_1fr] gap-12 mb-12 relative group">
                                  {/* Timeline Circle */}
                                  <div className="absolute left-[71px] top-1.5 w-4 h-4 rounded-full bg-white border-2 border-slate-900 z-10 hidden sm:block transform -translate-x-1/2 scale-0 group-hover:scale-100 transition-transform" />
                                  
                                  <div className="text-right pt-1">
                                      <EditableField path={`experience[${i}].dates`} value={exp.dates} onChange={onDataChange} className="text-[10px] font-black text-slate-400 uppercase tracking-widest block" />
                                  </div>
                                  <div>
                                      <EditableField path={`experience[${i}].role`} value={exp.role} onChange={onDataChange} className="text-lg font-black text-slate-900 leading-tight block mb-1" />
                                      <EditableField path={`experience[${i}].company`} value={exp.company} onChange={onDataChange} className="text-sm font-bold text-[var(--primary-color)] block mb-4" />
                                      <EditableList items={exp.description} path={`experience[${i}].description`} onChange={onDataChange} newItem="Achievement" className="space-y-2">
                                          {(desc, di) => (
                                              <div className="text-sm text-slate-500 leading-relaxed font-medium">
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

export default TimelinePro;
