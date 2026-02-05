
import React, { useState, useEffect, useRef } from 'react';
import { SchemeOfWork, SchemeRow } from '../types';

interface SchemeDisplayProps {
  scheme: SchemeOfWork;
  onUpdate?: (updated: SchemeOfWork) => void;
}

const SchemeDisplay: React.FC<SchemeDisplayProps> = ({ scheme, onUpdate }) => {
  const [scale, setScale] = useState(1);
  const [isEditing, setIsEditing] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [editedScheme, setEditedScheme] = useState<SchemeOfWork>(scheme);
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setEditedScheme(scheme);
  }, [scheme]);

  useEffect(() => {
    const handleResize = () => {
      if (!containerRef.current) return;
      const availableWidth = containerRef.current.clientWidth - 48; 
      const targetWidth = 1122; // A4 Landscape width
      setScale(availableWidth < targetWidth ? availableWidth / targetWidth : 1);
    };

    const observer = new ResizeObserver(handleResize);
    if (containerRef.current) observer.observe(containerRef.current);
    handleResize();
    return () => observer.disconnect();
  }, []);

  const handlePrint = () => {
    window.print();
  };

  const handleExportPDF = async () => {
    if (!contentRef.current) return;
    setIsExporting(true);
    const element = contentRef.current;
    const opt = {
      margin: [5, 5, 5, 5],
      filename: `SCHEME_OF_WORK_${editedScheme.moduleCodeTitle.replace(/\s+/g, '_') || 'TVET'}.pdf`,
      image: { type: 'jpeg', quality: 1.0 },
      html2canvas: { scale: 3, useCORS: true, letterRendering: true, backgroundColor: '#ffffff' },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'landscape', compress: true },
      pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
    };
    try {
      if ((window as any).html2pdf) await (window as any).html2pdf().set(opt).from(element).save();
      else window.print();
    } finally { setIsExporting(false); }
  };

  const tableCellClass = "p-1.5 border border-black align-top text-[10px] font-serif leading-tight break-words text-black";
  const labelClass = "font-bold uppercase mr-1";
  const inputClass = "w-full bg-blue-50/50 p-0.5 border border-blue-200 rounded text-[10px] font-serif outline-none focus:bg-white text-black";
  const textareaClass = "w-full bg-blue-50/50 p-0.5 border border-blue-200 rounded text-[10px] font-serif outline-none focus:bg-white resize-none text-black";

  const handleRowChange = (index: number, field: keyof SchemeRow, value: string) => {
    const newRows = [...(editedScheme.rows || [])];
    newRows[index] = { ...newRows[index], [field]: value };
    setEditedScheme({ ...editedScheme, rows: newRows });
  };

  const handleMetadataChange = (field: keyof SchemeOfWork, value: string) => {
    setEditedScheme({ ...editedScheme, [field]: value });
  };

  const saveChanges = () => {
    if (onUpdate) onUpdate(editedScheme);
    setIsEditing(false);
  };

  return (
    <div ref={containerRef} className="w-full flex flex-col items-center">
      <style>{`
        @media print {
          @page { size: landscape; margin: 3mm; }
          body { background: white !important; padding: 0 !important; margin: 0 !important; }
          .no-print { display: none !important; }
          .session-output { transform: none !important; width: 100% !important; margin: 0 !important; box-shadow: none !important; border: none !important; padding: 0 !important; }
          table { width: 100% !important; border-collapse: collapse !important; }
          tr { page-break-inside: avoid !important; }
        }
      `}</style>

      <div className="flex flex-wrap justify-end gap-3 w-full max-w-[1122px] no-print mb-6 px-4">
        {isEditing ? (
          <button onClick={saveChanges} className="px-6 py-2 bg-emerald-600 text-white font-bold rounded-xl shadow-lg hover:bg-emerald-700 transition-all flex items-center">
            <i className="fas fa-check mr-2"></i> Save Changes
          </button>
        ) : (
          <button onClick={() => setIsEditing(true)} className="px-6 py-2 bg-white border border-slate-200 text-slate-600 font-bold rounded-xl shadow-sm hover:bg-slate-50 transition-all flex items-center">
            <i className="fas fa-edit mr-2 text-blue-600"></i> Edit Scheme
          </button>
        )}
        <button onClick={handlePrint} className="px-6 py-2 bg-white border border-slate-200 text-slate-600 font-bold rounded-xl shadow-sm hover:bg-slate-50 transition-all flex items-center">
          <i className="fas fa-print mr-2 text-indigo-600"></i> Print
        </button>
        <button onClick={handleExportPDF} className="px-8 py-2 bg-[#1a2b4b] text-white font-bold rounded-xl shadow-lg hover:bg-black transition-all flex items-center">
          <i className="fas fa-file-pdf mr-2"></i> Download PDF
        </button>
      </div>
      
      <div className="w-full flex justify-center items-start overflow-auto no-scrollbar bg-slate-100/30 py-10 rounded-[3rem] border border-slate-200 shadow-inner" style={{ maxHeight: '88vh' }}>
        <div 
          ref={contentRef}
          className="session-output bg-white p-12 text-black shadow-2xl border border-black origin-top font-serif mb-10 relative"
          style={{ 
            width: '297mm', 
            minHeight: '210mm', 
            transform: `scale(${scale})`, 
            transformOrigin: 'top center',
            fontFamily: "'Times New Roman', Times, serif" 
          }}
        >
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold uppercase tracking-[0.3em]">SCHEME OF WORK</h1>
          </div>

          <table className="w-full border-collapse border border-black mb-4">
            <tbody>
              <tr>
                <td className={tableCellClass} style={{width: '40%'}}>
                  <span className={labelClass}>Sector:</span> 
                  {isEditing ? <input className={inputClass} value={editedScheme.sector} onChange={e => handleMetadataChange('sector', e.target.value)} /> : editedScheme.sector}
                </td>
                <td className={tableCellClass} style={{width: '60%'}}>
                  <span className={labelClass}>Trainer:</span> 
                  {isEditing ? <input className={inputClass} value={editedScheme.teacherName} onChange={e => handleMetadataChange('teacherName', e.target.value)} /> : editedScheme.teacherName}
                </td>
              </tr>
              <tr>
                <td className={tableCellClass}>
                  <span className={labelClass}>Trade:</span> 
                  {isEditing ? <input className={inputClass} value={editedScheme.trade} onChange={e => handleMetadataChange('trade', e.target.value)} /> : editedScheme.trade}
                </td>
                <td className={tableCellClass}>
                  <span className={labelClass}>School Year:</span> 
                  {isEditing ? <input className={inputClass} value={editedScheme.academicYear} onChange={e => handleMetadataChange('academicYear', e.target.value)} /> : editedScheme.academicYear}
                </td>
              </tr>
              <tr>
                <td className={tableCellClass}>
                  <span className={labelClass}>Qualification Title:</span> 
                  {isEditing ? <input className={inputClass} value={editedScheme.qualificationTitle} onChange={e => handleMetadataChange('qualificationTitle', e.target.value)} /> : editedScheme.qualificationTitle}
                </td>
                <td className={tableCellClass}>
                  <span className={labelClass}>Term:</span> 
                  {isEditing ? <input className={inputClass} value={editedScheme.term} onChange={e => handleMetadataChange('term', e.target.value)} /> : editedScheme.term}
                </td>
              </tr>
              <tr>
                <td className={tableCellClass} rowSpan={4}>
                  <span className={labelClass}>RQF Level:</span> 
                  {isEditing ? <input className={inputClass} value={editedScheme.rqfLevel} onChange={e => handleMetadataChange('rqfLevel', e.target.value)} /> : editedScheme.rqfLevel}
                </td>
                <td className={`${tableCellClass} bg-gray-100 font-bold text-center uppercase`}>Module details</td>
              </tr>
              <tr>
                <td className={tableCellClass}>
                  <span className={labelClass}>Module code and title:</span> 
                  {isEditing ? <input className={inputClass} value={editedScheme.moduleCodeTitle} onChange={e => handleMetadataChange('moduleCodeTitle', e.target.value)} /> : editedScheme.moduleCodeTitle}
                </td>
              </tr>
              <tr>
                <td className={tableCellClass}>
                  <span className={labelClass}>Learning hours:</span> 
                  {isEditing ? <input className={inputClass} value={editedScheme.learningHours} onChange={e => handleMetadataChange('learningHours', e.target.value)} /> : editedScheme.learningHours}
                </td>
              </tr>
              <tr>
                <td className={tableCellClass}>
                  <span className={labelClass}>Number of Classes:</span> 
                  {isEditing ? <input className={inputClass} value={editedScheme.numClasses} onChange={e => handleMetadataChange('numClasses', e.target.value)} /> : editedScheme.numClasses}
                </td>
              </tr>
              <tr>
                <td className={tableCellClass}>
                  <span className={labelClass}>Date:</span> 
                  {isEditing ? <input className={inputClass} value={editedScheme.date} onChange={e => handleMetadataChange('date', e.target.value)} /> : editedScheme.date}
                </td>
                <td className={tableCellClass}>
                  <span className={labelClass}>Class Name:</span> 
                  {isEditing ? <input className={inputClass} value={editedScheme.className} onChange={e => handleMetadataChange('className', e.target.value)} /> : editedScheme.className}
                </td>
              </tr>
            </tbody>
          </table>

          <table className="w-full border-collapse border border-black text-[9px] mb-8">
            <thead>
              <tr className="bg-gray-100">
                <th className={tableCellClass} rowSpan={2} style={{width: '5%'}}>Weeks</th>
                <th className={tableCellClass} colSpan={3} style={{width: '35%'}}>Competence code and name</th>
                <th className={tableCellClass} rowSpan={2} style={{width: '15%'}}>Learning Activities</th>
                <th className={tableCellClass} rowSpan={2} style={{width: '12%'}}>Resources (Equipment, tools, and materials)</th>
                <th className={tableCellClass} rowSpan={2} style={{width: '12%'}}>Evidences of formative assessment</th>
                <th className={tableCellClass} rowSpan={2} style={{width: '10%'}}>Learning Place</th>
                <th className={tableCellClass} rowSpan={2} style={{width: '11%'}}>Observation</th>
              </tr>
              <tr className="bg-gray-100">
                <th className={tableCellClass} style={{width: '12%'}}>Learning outcome (LO)</th>
                <th className={tableCellClass} style={{width: '6%'}}>Duration</th>
                <th className={tableCellClass} style={{width: '17%'}}>Indicative content (IC)</th>
              </tr>
            </thead>
            <tbody>
              {(editedScheme.rows || []).map((row, idx) => (
                <tr key={idx} className="page-break-inside-avoid">
                  <td className={`${tableCellClass} text-center font-bold`}>
                    {isEditing ? (
                      <div className="space-y-1">
                        <input className={inputClass + " text-center"} value={row.week} onChange={e => handleRowChange(idx, 'week', e.target.value)} />
                        <input className={inputClass + " text-center text-[8px] italic"} value={row.dateRange} onChange={e => handleRowChange(idx, 'dateRange', e.target.value)} />
                      </div>
                    ) : (
                      <>
                        <div>{row.week}</div>
                        <div className="text-[8px] italic">{row.dateRange}</div>
                      </>
                    )}
                  </td>
                  <td className={tableCellClass}>
                    {isEditing ? <textarea className={textareaClass} rows={2} value={row.learningOutcome} onChange={e => handleRowChange(idx, 'learningOutcome', e.target.value)} /> : row.learningOutcome}
                  </td>
                  <td className={`${tableCellClass} text-center`}>
                    {isEditing ? <input className={inputClass + " text-center"} value={row.duration} onChange={e => handleRowChange(idx, 'duration', e.target.value)} /> : row.duration}
                  </td>
                  <td className={tableCellClass}>
                    {isEditing ? <textarea className={textareaClass} rows={2} value={row.indicativeContent} onChange={e => handleRowChange(idx, 'indicativeContent', e.target.value)} /> : row.indicativeContent}
                  </td>
                  <td className={tableCellClass}>
                    {isEditing ? <textarea className={textareaClass} rows={2} value={row.learningActivities} onChange={e => handleRowChange(idx, 'learningActivities', e.target.value)} /> : row.learningActivities}
                  </td>
                  <td className={tableCellClass}>
                    {isEditing ? <textarea className={textareaClass} rows={2} value={row.resources} onChange={e => handleRowChange(idx, 'resources', e.target.value)} /> : row.resources}
                  </td>
                  <td className={tableCellClass}>
                    {isEditing ? <textarea className={textareaClass} rows={2} value={row.evidences} onChange={e => handleRowChange(idx, 'evidences', e.target.value)} /> : row.evidences}
                  </td>
                  <td className={tableCellClass}>
                    {isEditing ? <input className={inputClass} value={row.learningPlace} onChange={e => handleRowChange(idx, 'learningPlace', e.target.value)} /> : row.learningPlace}
                  </td>
                  <td className={tableCellClass}>
                    {isEditing ? <textarea className={textareaClass} rows={1} value={row.observation} onChange={e => handleRowChange(idx, 'observation', e.target.value)} /> : row.observation}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="mt-12 flex flex-col space-y-6">
            <div className="flex items-center">
              <span className="w-64 font-bold uppercase text-xs">Trainer's name and signature:</span>
              <div className="flex-grow border-b border-black font-bold uppercase text-sm ml-2 pb-1">
                {editedScheme.teacherName}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 pt-4">
              <div className="flex items-center">
                <span className="w-64 font-bold text-xs uppercase">Prepared by: (Name, position and Signature)</span>
                <div className="flex-grow border-b border-black pb-1 italic text-slate-400">....................................................................................................</div>
              </div>
              <div className="flex items-center">
                <span className="w-64 font-bold text-xs uppercase">Verified by: (Name, position and Signature)</span>
                <div className="flex-grow border-b border-black pb-1 italic text-slate-400">....................................................................................................</div>
              </div>
              <div className="flex items-center">
                <span className="w-64 font-bold text-xs uppercase">Approved by: (Name, position and Signature)</span>
                <div className="flex-grow border-b border-black pb-1 italic text-slate-400">....................................................................................................</div>
              </div>
            </div>
          </div>

          <div className="mt-12 text-center border-t border-slate-100 pt-3">
             <p className="text-[7pt] text-slate-300 font-sans tracking-[0.2em] italic uppercase">
               © {new Date().getFullYear()} GLOIRE PEDAGOGICAL ASSISTANT - GENERATED PROFESSIONAL TVET SCHEME
             </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SchemeDisplay;
