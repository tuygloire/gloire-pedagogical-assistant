
import React, { useState, useEffect, useRef } from 'react';
import { 
  LessonPlan, 
  RTBSessionPlan, 
  RTBActivityStep, 
  REBLessonPlan, 
  NurseryLessonPlan, 
  SchemeOfWork 
} from '../types';
import REBDisplay from './REBDisplay';
import NurseryDisplay from './NurseryDisplay';
import SchemeDisplay from './SchemeDisplay';

interface LessonDisplayProps {
  lesson: LessonPlan;
  onUpdate?: (updatedLesson: LessonPlan) => void;
}

// RTBView provides the specific layout for Rwanda TVET session plans
const RTBView: React.FC<{ 
  lesson: RTBSessionPlan; 
  isEditing: boolean; 
  onChange: (updates: Partial<RTBSessionPlan>) => void;
  contentRef: React.RefObject<HTMLDivElement | null>;
  scale: number;
}> = ({ lesson, isEditing, onChange, contentRef, scale }) => {
  const tableCellClass = "p-1.5 border border-black align-top text-[11px] leading-snug font-serif break-words text-black";
  const headerGray = "bg-[#d1d5db] font-bold text-center uppercase py-1.5 border border-black text-[11px]";
  const labelClass = "font-bold mr-1";
  const editInput = "w-full bg-blue-50/50 p-1 border border-blue-200 rounded text-[11px] font-serif text-black outline-none focus:bg-white";
  const [contentHeight, setContentHeight] = useState(0);

  useEffect(() => {
    if (contentRef.current) {
      const resizeObserver = new ResizeObserver(() => {
        if (contentRef.current) setContentHeight(contentRef.current.scrollHeight);
      });
      resizeObserver.observe(contentRef.current);
      return () => resizeObserver.disconnect();
    }
  }, [scale, lesson, contentRef]);

  if (!lesson.procedure) return null;

  const updateProc = (path: 'introduction' | 'conclusion' | 'development', field: keyof RTBActivityStep, value: string, index?: number) => {
    const newProc = { ...lesson.procedure };
    if (path === 'introduction') {
      newProc.introduction = { ...newProc.introduction, [field]: value };
    } else if (path === 'conclusion') {
      const step = index === 0 ? 'summary' : (index === 1 ? 'assessment' : 'evaluation');
      (newProc.conclusion as any)[step] = { ...(newProc.conclusion as any)[step], [field]: value };
    } else if (path === 'development' && typeof index === 'number') {
      newProc.development[index] = { ...newProc.development[index], [field]: value };
    }
    onChange({ procedure: newProc });
  };

  const renderActivityRows = (step: RTBActivityStep, label: string, path: 'introduction' | 'conclusion' | 'development', index?: number) => {
    if (!step) return null;
    return (
      <React.Fragment key={label + index}>
        {label && (
          <tr>
            <td className={`${tableCellClass} font-bold bg-slate-50`} colSpan={1}>{label}:</td>
            <td className={tableCellClass} colSpan={3}></td>
          </tr>
        )}
        <tr>
          <td className={`${tableCellClass} w-[35%]`}>
            <div className="font-bold italic mb-1">Trainer's activity:</div>
            {isEditing ? <textarea className={editInput} rows={3} value={step.trainerActivity} onChange={e => updateProc(path, 'trainerActivity', e.target.value, index)} /> : <div className="whitespace-pre-wrap">{step.trainerActivity}</div>}
            <div className="font-bold italic mt-3 mb-1">Learner's activity:</div>
            {isEditing ? <textarea className={editInput} rows={2} value={step.learnerActivity} onChange={e => updateProc(path, 'learnerActivity', e.target.value, index)} /> : <div className="whitespace-pre-wrap">{step.learnerActivity}</div>}
          </td>
          <td className={`${tableCellClass} w-[30%]`}>
            <div className="font-bold italic mb-1 text-indigo-800 uppercase text-[9px] tracking-widest">Expert View:</div>
            {isEditing ? <textarea className={editInput} rows={4} value={step.expertView || ''} onChange={e => updateProc(path, 'expertView', e.target.value, index)} /> : <div className="whitespace-pre-wrap text-blue-900 italic leading-relaxed">{step.expertView || 'Standard procedure applied.'}</div>}
          </td>
          <td className={`${tableCellClass} w-[25%]`}>
            <div className="font-bold italic mb-1 text-slate-800">Resources (Trainer/Trainee):</div>
            {isEditing ? (
              <div className="space-y-2">
                <textarea className={editInput} rows={2} placeholder="Trainer" value={step.trainerResources} onChange={e => updateProc(path, 'trainerResources', e.target.value, index)} />
                <textarea className={editInput} rows={2} placeholder="Trainee" value={step.traineeResources} onChange={e => updateProc(path, 'traineeResources', e.target.value, index)} />
              </div>
            ) : (
              <div className="text-[10px] space-y-1">
                <div><span className="font-bold">Tr:</span> {step.trainerResources}</div>
                <div><span className="font-bold">Te:</span> {step.traineeResources}</div>
              </div>
            )}
          </td>
          <td className={`${tableCellClass} w-[10%] text-center align-middle font-bold`}>
            {isEditing ? <input className={editInput + " text-center"} value={step.duration} onChange={e => updateProc(path, 'duration', e.target.value, index)} /> : step.duration}
          </td>
        </tr>
      </React.Fragment>
    );
  };

  return (
    <div className="w-full flex justify-center items-start py-8 px-4" style={{ height: `${(contentHeight || 1200) * scale + 100}px` }}>
      <div ref={contentRef} className="session-output bg-white p-12 text-black shadow-2xl border border-black origin-top font-serif relative overflow-hidden" style={{ width: '210mm', minHeight: '297mm', transform: `scale(${scale})` }}>
        
        <div className="relative z-10">
          <div className="flex justify-between items-center mb-6">
            <div className="w-24">
              {lesson.schoolLogoLeft ? <img src={lesson.schoolLogoLeft} alt="Logo" className="w-20 h-20 object-contain" /> : <img src="https://upload.wikimedia.org/wikipedia/commons/1/17/Logo_of_Rwanda.svg" className="w-16 h-16" />}
            </div>
            <div className="text-center flex-grow">
              <h1 className="text-xl font-bold uppercase border-b-2 border-black inline-block pb-0.5 tracking-[0.2em] font-serif">SESSION PLAN</h1>
              {lesson.schoolName && <p className="text-[10px] font-bold uppercase mt-1 italic">{lesson.schoolName}</p>}
            </div>
            <div className="w-24 text-right">
              {lesson.schoolLogoRight ? <img src={lesson.schoolLogoRight} alt="Logo" className="w-20 h-20 object-contain ml-auto" /> : <img src="https://upload.wikimedia.org/wikipedia/commons/1/17/Logo_of_Rwanda.svg" className="w-16 h-16 ml-auto" />}
            </div>
          </div>

          <table className="w-full border-collapse border border-black mb-0 text-[11px]">
            <tbody>
              <tr>
                <td className={tableCellClass} style={{width: '40%'}}><span className={labelClass}>Sector :</span> {isEditing ? <input className={editInput} value={lesson.sector} onChange={e => onChange({sector: e.target.value})} /> : lesson.sector}</td>
                <td className={tableCellClass} style={{width: '20%'}}><span className={labelClass}>Trade :</span> {isEditing ? <input className={editInput} value={lesson.trade} onChange={e => onChange({trade: e.target.value})} /> : lesson.trade}</td>
                <td className={tableCellClass} style={{width: '20%'}}><span className={labelClass}>Level :</span> {isEditing ? <input className={editInput} value={lesson.level} onChange={e => onChange({level: e.target.value})} /> : lesson.level}</td>
                <td className={tableCellClass} style={{width: '20%'}}><span className={labelClass}>Date :</span> {isEditing ? <input className={editInput} value={lesson.date} onChange={e => onChange({date: e.target.value})} /> : lesson.date}</td>
              </tr>
              <tr>
                <td className={tableCellClass} colSpan={3} rowSpan={2}>
                  <span className={labelClass}>Trainer name :</span> 
                  {isEditing ? <input className={editInput + " mt-1 font-bold"} value={lesson.trainerName} onChange={e => onChange({trainerName: e.target.value})} /> : <span className="font-bold">{lesson.trainerName}</span>}
                </td>
                <td className={tableCellClass}><span className={labelClass}>School year:</span> {isEditing ? <input className={editInput} value={lesson.academicYear} onChange={e => onChange({academicYear: e.target.value})} /> : lesson.academicYear}</td>
              </tr>
              <tr>
                <td className={tableCellClass}><span className={labelClass}>Term :</span> {isEditing ? <input className={editInput} value={lesson.term} onChange={e => onChange({term: e.target.value})} /> : lesson.term}</td>
              </tr>
              <tr>
                <td className={tableCellClass}><span className={labelClass}>Module (Code&Name):</span> {isEditing ? <input className={editInput} value={lesson.moduleCodeName} onChange={e => onChange({moduleCodeName: e.target.value})} /> : lesson.moduleCodeName}</td>
                <td className={tableCellClass}><span className={labelClass}>Week :</span> {isEditing ? <input className={editInput} value={lesson.week} onChange={e => onChange({week: e.target.value})} /> : lesson.week}</td>
                <td className={tableCellClass}><span className={labelClass}>No. Trainees:</span> {isEditing ? <input className={editInput} value={lesson.noTrainees} onChange={e => onChange({noTrainees: e.target.value})} /> : lesson.noTrainees}</td>
                <td className={tableCellClass}><span className={labelClass}>Class(es):</span> {isEditing ? <input className={editInput} value={lesson.className} onChange={e => onChange({className: e.target.value})} /> : lesson.className}</td>
              </tr>
              <tr>
                <td className={tableCellClass}><span className={labelClass}>Learning Outcome:</span></td>
                <td className={tableCellClass} colSpan={3}>{isEditing ? <textarea className={editInput} rows={2} value={lesson.learningOutcome} onChange={e => onChange({learningOutcome: e.target.value})} /> : lesson.learningOutcome}</td>
              </tr>
              <tr>
                <td className={tableCellClass}><span className={labelClass}>Indicative content:</span></td>
                <td className={tableCellClass} colSpan={3}>{isEditing ? <textarea className={editInput} rows={2} value={lesson.indicativeContent} onChange={e => onChange({indicativeContent: e.target.value})} /> : lesson.indicativeContent}</td>
              </tr>
              <tr>
                <td className={tableCellClass} colSpan={4}><span className={labelClass}>Topic of the session:</span> <span className="font-bold underline uppercase">{isEditing ? <input className={editInput + " font-bold"} value={lesson.topicOfSession} onChange={e => onChange({topicOfSession: e.target.value})} /> : lesson.topicOfSession}</span></td>
              </tr>
              <tr>
                <td className={tableCellClass} colSpan={2}><span className={labelClass}>Range:</span> {isEditing ? <textarea className={editInput} rows={2} value={lesson.range} onChange={e => onChange({range: e.target.value})} /> : lesson.range}</td>
                <td className={tableCellClass} colSpan={2}>
                   <span className={labelClass}>Duration (min):</span> {isEditing ? <input className={editInput} value={lesson.durationOfSession} onChange={e => onChange({durationOfSession: e.target.value})} /> : lesson.durationOfSession}
                   <div className="mt-2"><span className={labelClass}>Methodology:</span> {isEditing ? <input className={editInput} value={lesson.methodology} onChange={e => onChange({methodology: e.target.value})} /> : lesson.methodology}</div>
                </td>
              </tr>
              <tr>
                <td className={tableCellClass} colSpan={4}>
                   <div className="flex justify-between items-center mb-1">
                      <span className={labelClass}>Objective of the session:</span>
                      {isEditing && (
                        <div className="bg-slate-50 px-3 py-0.5 border border-slate-200 rounded text-[9px] font-black uppercase tracking-widest text-indigo-700">
                           Level: <input className="bg-transparent outline-none w-24" value={lesson.understandingLevel} onChange={e => onChange({understandingLevel: e.target.value})} />
                        </div>
                      )}
                   </div>
                   <div className="mt-1 italic">{isEditing ? <textarea className={editInput} rows={3} value={lesson.objectivesText} onChange={e => onChange({objectivesText: e.target.value})} /> : <div className="whitespace-pre-wrap leading-relaxed">{lesson.objectivesText}</div>}</div>
                </td>
              </tr>
              <tr>
                <td className={tableCellClass} colSpan={4}><span className={labelClass}>Facilitation technique(s):</span> {isEditing ? <input className={editInput} value={lesson.facilitationTechniques} onChange={e => onChange({facilitationTechniques: e.target.value})} /> : lesson.facilitationTechniques}</td>
              </tr>
            </tbody>
          </table>

          <table className="w-full border-collapse border border-black mt-0 text-[11px]">
            <thead>
              <tr>
                <th className={`${headerGray} w-[35%]`}>Trainer & Learner Activities</th>
                <th className={`${headerGray} w-[30%]`}>Expert View</th>
                <th className={`${headerGray} w-[25%]`}>Resources Used</th>
                <th className={`${headerGray} w-[10%]`}>Dur.</th>
              </tr>
            </thead>
            <tbody>
              {renderActivityRows(lesson.procedure.introduction, "", "introduction")}
              <tr><th className={headerGray} colSpan={4}>Development/Body</th></tr>
              {lesson.procedure.development.map((step, i) => renderActivityRows(step, `Step ${i + 1}`, "development", i))}
              <tr><th className={headerGray} colSpan={4}>Conclusion</th></tr>
              {renderActivityRows(lesson.procedure.conclusion.summary, "Summary", "conclusion", 0)}
              {renderActivityRows(lesson.procedure.conclusion.assessment, "Assessment/Assignment", "conclusion", 1)}
              {renderActivityRows(lesson.procedure.conclusion.evaluation, "Evaluation of the session", "conclusion", 2)}
            </tbody>
          </table>

          <table className="w-full border-collapse border border-black mt-0 text-[11px]">
            <tbody>
              <tr><td className={tableCellClass}><span className={labelClass}>Cross Cutting issue:</span> {isEditing ? <input className={editInput} value={lesson.crossCuttingIssue} onChange={e => onChange({crossCuttingIssue: e.target.value})} /> : lesson.crossCuttingIssue}</td></tr>
              <tr><td className={tableCellClass}><span className={labelClass}>References:</span> {isEditing ? <input className={editInput} value={lesson.references} onChange={e => onChange({references: e.target.value})} /> : lesson.references}</td></tr>
              <tr><td className={tableCellClass}><span className={labelClass}>Appendices:</span> {isEditing ? <input className={editInput} value={lesson.appendices} onChange={e => onChange({appendices: e.target.value})} /> : lesson.appendices}</td></tr>
              <tr><td className={tableCellClass}><span className={labelClass}>Reflection:</span> {isEditing ? <textarea className={editInput} rows={3} value={lesson.reflection} onChange={e => onChange({reflection: e.target.value})} /> : <div className="whitespace-pre-wrap">{lesson.reflection}</div>}</td></tr>
            </tbody>
          </table>

          <div className="mt-12 flex justify-between px-10 no-print">
              <div className="text-center border-t border-black pt-2 w-48">
                <p className="text-[10px] font-bold uppercase">Trainer Signature: {lesson.trainerName}</p>
              </div>
              <div className="text-center border-t border-black pt-2 w-48">
                <p className="text-[10px] font-bold uppercase">DOS/HT Signature</p>
              </div>
          </div>

          <div className="mt-8 text-center border-t border-slate-100 pt-4">
            <p className="text-[8px] text-slate-400 uppercase tracking-widest font-sans italic">
              © {new Date().getFullYear()} GLOIRE PEDAGOGICAL ASSISTANT - PROFESSIONAL TVET SESSION PLAN
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// LessonDisplay is a generic component that handles routing to specific pedagogical formats
const LessonDisplay: React.FC<LessonDisplayProps> = ({ lesson, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [scale, setScale] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleResize = () => {
      if (!containerRef.current) return;
      const availableWidth = containerRef.current.clientWidth - 48;
      const targetWidth = 794; 
      setScale(availableWidth < targetWidth ? availableWidth / targetWidth : 1);
    };

    const observer = new ResizeObserver(handleResize);
    if (containerRef.current) observer.observe(containerRef.current);
    handleResize();
    return () => observer.disconnect();
  }, []);

  const handleChange = (updates: Partial<LessonPlan>) => {
    if (onUpdate) {
      onUpdate({ ...lesson, ...updates });
    }
  };

  const renderContent = () => {
    if (lesson.type === 'rtb') {
      return (
        <RTBView 
          lesson={lesson as RTBSessionPlan} 
          isEditing={isEditing} 
          onChange={(updates) => handleChange(updates as Partial<LessonPlan>)}
          contentRef={contentRef}
          scale={scale}
        />
      );
    }
    if (lesson.type === 'reb') {
      return <REBDisplay lesson={lesson as REBLessonPlan} onUpdate={onUpdate as any} />;
    }
    if (lesson.type === 'nursery') {
      return <NurseryDisplay lesson={lesson as NurseryLessonPlan} onUpdate={onUpdate as any} />;
    }
    if (lesson.type === 'scheme') {
      return <SchemeDisplay scheme={lesson as SchemeOfWork} onUpdate={onUpdate as any} />;
    }

    // Default view for standard lesson plans
    return (
      <div ref={contentRef} className="bg-white p-8 sm:p-12 shadow-xl border border-slate-100 rounded-2xl max-w-4xl mx-auto">
        <div className="flex justify-between items-start mb-8">
          <div>
            <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-xs font-bold uppercase tracking-widest">{lesson.subject}</span>
            <h1 className="text-4xl font-black text-[#1a2b4b] uppercase tracking-tighter mt-2">{lesson.title}</h1>
          </div>
          <div className="text-right">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{lesson.gradeLevel}</p>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{lesson.duration}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-12">
          <section>
            <h3 className="text-sm font-black text-[#1a2b4b] uppercase tracking-widest mb-4 border-b pb-2 flex items-center">
              <i className="fas fa-bullseye mr-2 text-indigo-500"></i> Learning Objectives
            </h3>
            <ul className="space-y-3">
              {lesson.objectives.map((obj, i) => (
                <li key={i} className="flex items-start text-sm text-slate-600 font-medium">
                  <span className="text-indigo-500 mr-2 mt-1">•</span> {obj}
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h3 className="text-sm font-black text-[#1a2b4b] uppercase tracking-widest mb-4 border-b pb-2 flex items-center">
              <i className="fas fa-box-open mr-2 text-indigo-500"></i> Materials Needed
            </h3>
            <div className="flex flex-wrap gap-2">
              {lesson.materials.map((mat, i) => (
                <span key={i} className="px-3 py-1 bg-slate-50 border border-slate-100 text-slate-500 rounded-lg text-xs font-bold uppercase">{mat}</span>
              ))}
            </div>
          </section>
        </div>

        <section className="mb-12">
          <h3 className="text-sm font-black text-[#1a2b4b] uppercase tracking-widest mb-6 border-b pb-2 flex items-center">
            <i className="fas fa-map-signs mr-2 text-indigo-500"></i> Lesson Outline
          </h3>
          <div className="space-y-6">
            {lesson.outline.map((sec, i) => (
              <div key={i} className="flex gap-6">
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center font-black text-xs border border-indigo-100">{i + 1}</div>
                  {i < lesson.outline.length - 1 && <div className="w-px flex-grow bg-slate-100 my-2"></div>}
                </div>
                <div className="flex-grow pb-8">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-bold text-slate-800 uppercase text-xs tracking-tight">{sec.title}</h4>
                    <span className="text-[10px] font-black text-slate-400 uppercase">{sec.duration}</span>
                  </div>
                  <p className="text-sm text-slate-500 leading-relaxed font-medium">{sec.content}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <section className="bg-emerald-50/50 p-6 rounded-2xl border border-emerald-100">
            <h3 className="text-xs font-black text-emerald-800 uppercase tracking-widest mb-3 flex items-center">
              <i className="fas fa-tasks mr-2"></i> Assessment
            </h3>
            <p className="text-sm text-emerald-900 leading-relaxed font-medium italic">{lesson.assessment}</p>
          </section>

          <section className="bg-blue-50/50 p-6 rounded-2xl border border-blue-100">
            <h3 className="text-xs font-black text-blue-800 uppercase tracking-widest mb-3 flex items-center">
              <i className="fas fa-home mr-2"></i> Homework
            </h3>
            <p className="text-sm text-blue-900 leading-relaxed font-medium italic">{lesson.homework}</p>
          </section>
        </div>
      </div>
    );
  };

  return (
    <div ref={containerRef} className="w-full">
      <div className="flex justify-end gap-3 mb-8 no-print px-4">
        {lesson.type === 'rtb' && (
          <button 
            onClick={() => setIsEditing(!isEditing)}
            className={`px-6 py-2.5 rounded-xl font-bold text-xs uppercase tracking-widest transition-all border ${isEditing ? 'bg-emerald-600 text-white border-emerald-700' : 'bg-white text-slate-600 border-slate-200 shadow-sm'}`}
          >
            <i className={`fas ${isEditing ? 'fa-check' : 'fa-edit'} mr-2`}></i>
            {isEditing ? 'Save Changes' : 'Edit Plan'}
          </button>
        )}
        <button 
          onClick={() => window.print()}
          className="px-6 py-2.5 bg-white border border-slate-200 text-slate-600 font-bold rounded-xl shadow-sm hover:bg-slate-50 transition-all uppercase text-xs tracking-widest"
        >
          <i className="fas fa-print mr-2 text-indigo-600"></i> Print Plan
        </button>
      </div>
      {renderContent()}
    </div>
  );
};

export default LessonDisplay;
