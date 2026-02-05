
import React, { useState, useEffect, useRef } from 'react';
import { NurseryLessonPlan } from '../types';

interface NurseryDisplayProps {
  lesson: NurseryLessonPlan;
  onUpdate?: (updated: NurseryLessonPlan) => void;
}

const NurseryDisplay: React.FC<NurseryDisplayProps> = ({ lesson, onUpdate }) => {
  const [scale, setScale] = useState(1);
  const [contentHeight, setContentHeight] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (let entry of entries) {
        const availableWidth = entry.contentRect.width - 40;
        const targetWidth = 794;
        setScale(availableWidth < targetWidth ? availableWidth / targetWidth : 1);
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (contentRef.current) {
      const resizeObserver = new ResizeObserver(() => {
        if (contentRef.current) setContentHeight(contentRef.current.scrollHeight);
      });
      resizeObserver.observe(contentRef.current);
      return () => resizeObserver.disconnect();
    }
  }, [scale, lesson]);

  const handleExport = async () => {
    if (!contentRef.current) return;
    const opt = {
      margin: 10,
      filename: `NURSERY_PLAN_${lesson.title.replace(/\s+/g, '_')}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    if ((window as any).html2pdf) await (window as any).html2pdf().set(opt).from(contentRef.current).save();
    else window.print();
  };

  const tableCellClass = "p-2 border border-black align-top text-[11px] font-serif leading-tight";
  const headerLabel = "font-bold uppercase mr-1";

  return (
    <div ref={containerRef} className="w-full flex flex-col items-center">
      <div className="flex justify-end w-full max-w-4xl no-print mb-6">
        <button onClick={handleExport} className="px-8 py-2 bg-[#1a2b4b] text-white font-bold rounded-xl shadow-lg hover:bg-slate-800 transition-all">Download PDF</button>
      </div>
      
      <div className="w-full flex justify-center items-start" style={{ height: `${contentHeight * scale + 60}px` }}>
        <div 
          ref={contentRef}
          className="session-output bg-white p-12 text-black shadow-2xl border border-slate-200 origin-top"
          style={{ width: '210mm', minHeight: '297mm', transform: `scale(${scale})` }}
        >
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold border-b-2 border-black inline-block pb-1 font-serif uppercase">Nursery Session Plan</h1>
          </div>

          <table className="w-full border-collapse border border-black mb-6 font-serif text-[11px]">
            <tbody>
              <tr>
                <td className={tableCellClass} colSpan={2}><span className={headerLabel}>School Name:</span> {lesson.schoolName}</td>
                <td className={tableCellClass} colSpan={2}><span className={headerLabel}>Teacher Name:</span> {lesson.teacherName}</td>
              </tr>
              <tr>
                <td className={tableCellClass}><span className={headerLabel}>Subject:</span> {lesson.subject}</td>
                <td className={tableCellClass}><span className={headerLabel}>Class Level:</span> {lesson.gradeLevel}</td>
                <td className={tableCellClass}><span className={headerLabel}>Term:</span> {lesson.term}</td>
                <td className={tableCellClass}><span className={headerLabel}>Date:</span> {lesson.date}</td>
              </tr>
              <tr>
                <td className={tableCellClass}><span className={headerLabel}>Duration:</span> {lesson.duration}min</td>
                <td className={tableCellClass}><span className={headerLabel}>Class Size:</span> {lesson.classSize}</td>
                <td className={tableCellClass} colSpan={2}><span className={headerLabel}>Language:</span> {lesson.language}</td>
              </tr>
            </tbody>
          </table>

          <div className="mb-6 p-4 border border-black font-serif text-[12px] bg-slate-50">
            <p className="font-bold underline mb-2 uppercase">Learning Objectives:</p>
            <ul className="list-disc ml-5 italic">
              {lesson.objectives?.map((obj, i) => <li key={i}>{obj}</li>)}
            </ul>
          </div>

          <table className="w-full border-collapse border border-black font-serif text-[11px]">
            <thead>
              <tr className="bg-slate-200 uppercase font-black">
                <th className={tableCellClass} style={{width: '20%'}}>Step</th>
                <th className={tableCellClass} style={{width: '50%'}}>Activities</th>
                <th className={tableCellClass} style={{width: '20%'}}>Materials</th>
                <th className={tableCellClass} style={{width: '10%'}}>Dur.</th>
              </tr>
            </thead>
            <tbody>
              {lesson.lessonSteps.map((s, idx) => (
                <tr key={idx} className="page-break-inside-avoid">
                  <td className={tableCellClass}><p className="font-bold">{s.stepName}</p></td>
                  <td className={tableCellClass}><div className="whitespace-pre-wrap">{s.activities}</div></td>
                  <td className={tableCellClass}>{s.materials}</td>
                  <td className={`${tableCellClass} text-center`}>{s.duration}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="mt-8 space-y-4 font-serif text-[11px]">
             <div className="p-3 border border-black"><span className={headerLabel}>Instructional Materials:</span> {lesson.materials?.join(', ')}</div>
             <div className="p-3 border border-black"><span className={headerLabel}>Assessment:</span> {lesson.assessment}</div>
             <div className="p-3 border border-black"><span className={headerLabel}>Homework/Follow-up:</span> {lesson.homework}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NurseryDisplay;
