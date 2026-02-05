
import React, { useState, useRef, useEffect } from 'react';
import { Homework, HomeworkGenerationConfig, LessonPlan, RTBDefaultSettings, HomeworkQuestion } from '../types';
import { generateHomework } from '../services/geminiService';

interface AssessmentGeneratorProps {
  history: LessonPlan[];
  onSave: (homework: Homework) => void;
  onDelete: (id: string) => void;
  mode: 'homework' | 'quiz' | 'exam';
}

const AssessmentGenerator: React.FC<AssessmentGeneratorProps> = ({ history, onSave, onDelete, mode }) => {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [genStep, setGenStep] = useState('Idle');
  const [isExporting, setIsExporting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [result, setResult] = useState<Homework | null>(null);
  const [editedResult, setEditedResult] = useState<Homework | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showAnswers, setShowAnswers] = useState(false);
  const [showArchive, setShowArchive] = useState(false);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const [scale, setScale] = useState(1);
  const [contentHeight, setContentHeight] = useState(0);
  const contentRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const dateInputRef = useRef<HTMLInputElement>(null);
  
  const assessmentHistory = history.filter(p => p.type === mode) as Homework[];

  const [config, setConfig] = useState<HomeworkGenerationConfig>({
    gradeLevel: '',
    subject: '',
    topic: '',
    numQuestions: mode === 'exam' ? 25 : mode === 'quiz' ? 10 : 10,
    questionType: 'mixed',
    difficulty: 'medium',
    assessmentType: mode,
    term: '1st Term',
    date: new Date().toISOString().split('T')[0],
    schoolName: '',
    district: '',
    sector: '',
    trainerName: '',
    trade: '',
    totalMarks: mode === 'exam' ? 100 : mode === 'quiz' ? 20 : 20,
    schoolLogoLeft: '',
    schoolLogoRight: ''
  });

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
  }, [result, showArchive, isEditing]);

  useEffect(() => {
    if (contentRef.current && (result || editedResult)) {
      const resizeObserver = new ResizeObserver(() => {
        if (contentRef.current) setContentHeight(contentRef.current.scrollHeight);
      });
      resizeObserver.observe(contentRef.current);
      return () => resizeObserver.disconnect();
    }
  }, [scale, result, editedResult, isEditing]);

  useEffect(() => {
    const saved = localStorage.getItem('rtb_default_settings');
    if (saved) {
      const defaults: RTBDefaultSettings = JSON.parse(saved);
      setConfig(prev => ({
        ...prev,
        schoolName: defaults.schoolName || prev.schoolName,
        trainerName: defaults.trainerName || prev.trainerName,
        trade: defaults.trade || prev.trade,
        district: defaults.district || prev.district,
        sector: defaults.sector || prev.sector,
        gradeLevel: defaults.level || prev.gradeLevel,
        term: defaults.term || prev.term,
        schoolLogoLeft: defaults.schoolLogoLeft || prev.schoolLogoLeft,
        schoolLogoRight: defaults.schoolLogoRight || prev.schoolLogoRight
      }));
    }
  }, [mode]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFileName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = (reader.result as string).split(',')[1];
        setConfig(prev => ({ ...prev, referenceFile: { data: base64String, mimeType: file.type } }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setProgress(5);
    setGenStep('Initializing AI Synthesis...');
    setError(null);

    const progressInterval = setInterval(() => {
      setProgress(prev => (prev >= 95 ? prev : prev + Math.floor(Math.random() * 5)));
    }, 1200);

    try {
      setGenStep(`Crafting ${mode.toUpperCase()}...`);
      const assessment = await generateHomework(config);
      clearInterval(progressInterval);
      setProgress(100);
      onSave(assessment);
      setResult(assessment);
      setEditedResult(assessment);
    } catch (err: any) {
      clearInterval(progressInterval);
      setError(err.message || "Synthesis failed. Please refine your topic.");
    } finally {
      setLoading(false);
      setGenStep('Idle');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportPDF = async () => {
    if (!contentRef.current) return;
    setIsExporting(true);
    const element = contentRef.current;
    const opt = {
      margin: 10,
      filename: `GLOIRE_${mode.toUpperCase()}_${Date.now()}.pdf`,
      image: { type: 'jpeg', quality: 1.0 },
      html2canvas: { scale: 4, useCORS: true, letterRendering: true, backgroundColor: '#ffffff' },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait', compress: true },
      pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
    };
    try {
      if ((window as any).html2pdf) {
        await (window as any).html2pdf().set(opt).from(element).save();
      } else { window.print(); }
    } finally { setIsExporting(false); }
  };

  const handleExportWord = () => {
    if (!contentRef.current) return;
    const content = contentRef.current.innerHTML;
    const style = `
      <style>
        table { border-collapse: collapse; width: 100%; border: 1px solid black; margin-bottom: 15px; }
        th, td { border: 1px solid black; padding: 6px; font-family: 'Times New Roman', serif; font-size: 10pt; vertical-align: top; }
        h1 { font-size: 18pt; text-align: center; text-transform: uppercase; margin-bottom: 5px; }
        .instructions { border: 1px solid black; padding: 10px; background-color: #f9fafb; margin-bottom: 20px; font-style: italic; }
        .question { margin-bottom: 25px; page-break-inside: avoid; }
        .marks { font-weight: bold; font-style: italic; float: right; }
      </style>
    `;
    const html = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
        <head><meta charset='utf-8'><title>Assessment Export</title>${style}</head>
        <body>${content}</body>
      </html>
    `;
    const blob = new Blob(['\ufeff', html], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `GLOIRE_${mode.toUpperCase()}_${Date.now()}.doc`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleSaveEdits = () => {
    if (editedResult) {
      onSave(editedResult);
      setResult(editedResult);
      setIsEditing(false);
    }
  };

  const updateMetadata = (field: keyof Homework, value: any) => {
    if (!editedResult) return;
    setEditedResult({ ...editedResult, [field]: value });
  };

  const updateQuestion = (index: number, field: keyof HomeworkQuestion, value: any) => {
    if (!editedResult) return;
    const newQs = [...editedResult.questions];
    newQs[index] = { ...newQs[index], [field]: value };
    setEditedResult({ ...editedResult, questions: newQs });
  };

  const tableCellClass = "p-2 border border-black align-top text-[11px] leading-snug font-serif";
  const headerLabelClass = "font-bold mr-1";
  const inputClass = "w-full px-4 py-3 bg-[#f8fafc] border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-600 transition-all text-sm font-medium";
  const editInput = "w-full p-1 bg-blue-50/50 border border-blue-200 rounded text-[11px] font-serif outline-none focus:bg-white";

  if (result || editedResult) {
    const data = isEditing ? editedResult! : result!;
    const displayTitle = mode === 'exam' ? 'EXAMINATION' : mode === 'quiz' ? 'ASSESSMENT' : 'HOME WORK';
    
    return (
      <div ref={containerRef} className="w-full mx-auto px-4 py-8 animate-fadeIn flex flex-col items-center">
        {isExporting && (
          <div className="fixed inset-0 z-[100] bg-white/95 backdrop-blur-md flex flex-col items-center justify-center">
            <div className="w-16 h-16 border-4 border-[#1a2b4b] border-t-transparent rounded-full animate-spin mb-6"></div>
            <p className="font-bold text-[#1a2b4b] uppercase tracking-widest text-sm">Synthesizing High Quality Document...</p>
          </div>
        )}
        
        <div className="flex flex-wrap gap-4 justify-between items-center mb-8 no-print w-full max-w-4xl">
          <button onClick={() => { setResult(null); setEditedResult(null); setIsEditing(false); }} className="px-6 py-2.5 text-[#1a2b4b] hover:text-blue-800 font-bold flex items-center bg-white border border-slate-200 rounded-xl transition-all">
            <i className="fas fa-arrow-left mr-2"></i> Designer
          </button>
          <div className="flex flex-wrap items-center gap-2">
             <button onClick={() => setShowAnswers(!showAnswers)} className="px-4 py-2.5 rounded-xl font-bold text-xs border border-slate-200 bg-white shadow-sm uppercase tracking-wider">
               {showAnswers ? 'Hide Answers' : 'Show Answer Keys'}
             </button>
             <button onClick={handlePrint} className="px-4 py-2.5 bg-white border border-slate-200 text-slate-600 font-bold rounded-xl shadow-sm hover:bg-slate-50 transition-all uppercase text-xs tracking-wider">
               <i className="fas fa-print mr-2 text-indigo-600"></i> Print
             </button>
             <button onClick={handleExportWord} className="px-4 py-2.5 bg-blue-600 text-white font-bold rounded-xl shadow-lg hover:bg-blue-700 transition-all uppercase text-xs tracking-wider">
               <i className="fas fa-file-word mr-2"></i> Export Word
             </button>
             {isEditing ? (
               <button onClick={handleSaveEdits} className="px-6 py-2.5 bg-emerald-600 text-white font-bold rounded-xl shadow-lg hover:bg-emerald-700 transition-all uppercase text-xs tracking-wider">
                 <i className="fas fa-check mr-2"></i> Save
               </button>
             ) : (
               <button onClick={() => setIsEditing(true)} className="px-6 py-2.5 bg-white border border-slate-200 text-slate-600 font-bold rounded-xl shadow-sm hover:bg-slate-50 transition-all uppercase text-xs tracking-wider">
                 <i className="fas fa-edit mr-2 text-blue-600"></i> Edit
               </button>
             )}
             <button onClick={handleExportPDF} className="px-6 py-2.5 bg-[#1a2b4b] text-white font-bold rounded-xl shadow-lg hover:bg-black transition-all uppercase text-xs tracking-wider">
               <i className="fas fa-file-pdf mr-2"></i> Export PDF
             </button>
          </div>
        </div>

        <div className="w-full flex justify-center items-start py-8 overflow-auto no-scrollbar" style={{ height: `${contentHeight * scale + 80}px` }}>
          <div 
            ref={contentRef} 
            className="session-output bg-white p-12 text-black shadow-2xl border border-black print:shadow-none print:border-none print:m-0 origin-top" 
            style={{ 
              width: '210mm', 
              minHeight: '297mm', 
              boxSizing: 'border-box',
              transform: `scale(${scale})`,
              transition: 'transform 0.2s ease-out',
              fontFamily: "'Times New Roman', Times, serif"
            }}
          >
            <div className="flex justify-between items-center mb-6">
              <div className="w-24">{data.schoolLogoLeft ? <img src={data.schoolLogoLeft} alt="Logo" className="w-20 h-20 object-contain" /> : <img src="https://upload.wikimedia.org/wikipedia/commons/1/17/Logo_of_Rwanda.svg" alt="RTB Logo" className="w-16 h-16 object-contain" />}</div>
              <div className="text-center flex-grow">
                <h1 className="text-2xl font-bold uppercase tracking-[0.2em] border-b-2 border-black inline-block pb-1 font-serif">{displayTitle}</h1>
                {isEditing ? (
                  <input className="block w-full text-center mt-2 font-serif font-bold italic uppercase border-b border-blue-200 outline-none" value={data.schoolName} onChange={e => updateMetadata('schoolName', e.target.value)} />
                ) : (
                  data.schoolName && <p className="text-xs mt-2 font-serif font-bold uppercase tracking-widest">{data.schoolName}</p>
                )}
              </div>
              <div className="w-24 text-right">{data.schoolLogoRight ? <img src={data.schoolLogoRight} alt="Logo" className="w-20 h-20 object-contain ml-auto" /> : <img src="https://upload.wikimedia.org/wikipedia/commons/1/17/Logo_of_Rwanda.svg" alt="RTB Logo" className="w-16 h-16 object-contain ml-auto" />}</div>
            </div>

            <table className="w-full border-collapse border border-black mb-8 text-[11px] font-serif">
              <tbody>
                <tr>
                  <td className={tableCellClass} colSpan={2}><span className={headerLabelClass}>District:</span> {isEditing ? <input className={editInput} value={data.district} onChange={e => updateMetadata('district', e.target.value)} /> : data.district}</td>
                  <td className={tableCellClass}><span className={headerLabelClass}>Trade/Option:</span> {isEditing ? <input className={editInput} value={data.trade} onChange={e => updateMetadata('trade', e.target.value)} /> : data.trade}</td>
                  <td className={tableCellClass}><span className={headerLabelClass}>Level:</span> {isEditing ? <input className={editInput} value={data.gradeLevel} onChange={e => updateMetadata('gradeLevel', e.target.value)} /> : data.gradeLevel}</td>
                  <td className={tableCellClass}><span className={headerLabelClass}>Date:</span> {isEditing ? <input className={editInput} value={data.date} onChange={e => updateMetadata('date', e.target.value)} /> : data.date}</td>
                </tr>
                <tr>
                  <td className={tableCellClass} colSpan={2}><span className={headerLabelClass}>Sector:</span> {isEditing ? <input className={editInput} value={data.sector} onChange={e => updateMetadata('sector', e.target.value)} /> : data.sector}</td>
                  <td className={tableCellClass} colSpan={2}><span className={headerLabelClass}>Trainer/Teacher:</span> {isEditing ? <input className={editInput} value={data.trainerName} onChange={e => updateMetadata('trainerName', e.target.value)} /> : data.trainerName}</td>
                  <td className={tableCellClass}><span className={headerLabelClass}>Term:</span> {isEditing ? <input className={editInput} value={data.term} onChange={e => updateMetadata('term', e.target.value)} /> : data.term}</td>
                </tr>
                <tr>
                  <td className={tableCellClass} colSpan={4}><span className={headerLabelClass}>Subject:</span> {isEditing ? <input className={editInput} value={data.subject} onChange={e => updateMetadata('subject', e.target.value)} /> : data.subject}</td>
                  <td className={tableCellClass}><span className={headerLabelClass}>Marks:</span> {isEditing ? <input type="number" className={editInput} value={data.totalMarks} onChange={e => updateMetadata('totalMarks', parseInt(e.target.value))} /> : data.totalMarks}</td>
                </tr>
                <tr><td className={tableCellClass} colSpan={5}><span className={headerLabelClass}>Topic:</span> {isEditing ? <input className={editInput} value={data.topic} onChange={e => updateMetadata('topic', e.target.value)} /> : data.topic}</td></tr>
              </tbody>
            </table>

            <div className="mb-8 p-4 border border-black bg-slate-50 font-serif text-[12px] instructions">
              <p className="font-bold uppercase underline mb-2 tracking-tight">Instructions:</p>
              {isEditing ? (
                <textarea className="w-full bg-transparent outline-none italic resize-none" rows={3} value={data.instructions} onChange={e => updateMetadata('instructions', e.target.value)} />
              ) : (
                <p className="italic whitespace-pre-wrap leading-relaxed">{data.instructions || 'Answer all questions clearly and concisely as required.'}</p>
              )}
            </div>

            <div className="space-y-10 font-serif">
              {(data.questions || []).map((q, i) => (
                <div key={i} className="text-[13px] page-break-inside-avoid question">
                  <div className="flex justify-between items-start font-bold mb-4">
                    <span className="flex-grow pr-4 leading-relaxed">
                      {i + 1}. {isEditing ? <textarea className={editInput + " w-full font-bold"} rows={2} value={q.question} onChange={e => updateQuestion(i, 'question', e.target.value)} /> : q.question}
                    </span>
                    <span className="flex-shrink-0 italic whitespace-nowrap marks">
                      ({isEditing ? <input type="number" className="w-10 p-0.5 border-b border-blue-200 outline-none bg-transparent" value={q.marks} onChange={e => updateQuestion(i, 'marks', parseInt(e.target.value))} /> : q.marks} Marks)
                    </span>
                  </div>
                  
                  {q.type === 'multiple-choice' && q.options && (
                    <div className="grid grid-cols-2 gap-y-3 gap-x-10 ml-8 mt-2 mb-4">
                       {q.options.map((opt, idx) => (
                         <div key={idx} className="flex items-start">
                           <span className="w-6 font-bold flex-shrink-0">{String.fromCharCode(65 + idx)})</span>
                           {isEditing ? (
                             <input className={editInput + " flex-grow"} value={opt} onChange={e => {
                               const newOpts = [...q.options!];
                               newOpts[idx] = e.target.value;
                               updateQuestion(i, 'options', newOpts);
                             }} />
                           ) : <span className="flex-grow">{opt}</span>}
                         </div>
                       ))}
                    </div>
                  )}

                  {q.page && (
                     <div className="ml-8 text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-2 flex items-center">
                        <i className="fas fa-bookmark mr-2 text-slate-300"></i>
                        Reference: {q.reference || 'Module Guide'} - Page {q.page}
                     </div>
                  )}

                  {(showAnswers || isEditing) && (
                    <div className="mt-6 p-5 bg-blue-50/50 border-l-4 border-[#1a2b4b] text-[11px] no-print rounded-r-xl">
                      <p className="font-bold text-[#1a2b4b] uppercase tracking-[0.2em] text-[10px] mb-2">Answer Key & Synthesis:</p>
                      <div className="flex gap-2 font-black text-slate-900 border-b border-blue-100 pb-2 mb-2">
                        <span>Answer:</span>
                        {isEditing ? <input className={editInput} value={q.answer} onChange={e => updateQuestion(i, 'answer', e.target.value)} /> : <span>{q.answer}</span>}
                      </div>
                      <div className="text-slate-700 leading-relaxed font-medium">
                        <span className="font-bold mr-2 uppercase text-[10px]">Context:</span>
                        {isEditing ? <textarea className={editInput + " italic"} rows={3} value={q.explanation} onChange={e => updateQuestion(i, 'explanation', e.target.value)} /> : <span>{q.explanation}</span>}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-20 pt-8 border-t border-dotted border-slate-300 flex justify-between items-center no-print">
               <p className="text-[9px] text-slate-400 font-sans tracking-widest italic uppercase">Verified by GLOIRE PEDAGOGICAL ASSISTANT AI</p>
               <p className="text-[9px] text-slate-400 font-sans tracking-widest uppercase">Page ___ / ___</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 animate-fadeIn">
      <div className="flex justify-between items-center mb-8 no-print">
        <h2 className="text-4xl font-black text-[#1a2b4b] uppercase tracking-tighter">
          {mode === 'exam' ? 'EXAM' : mode === 'quiz' ? 'QUIZ' : 'HOMEWORK'} DESIGNER
        </h2>
        <button onClick={() => setShowArchive(!showArchive)} className="px-6 py-3 bg-white border border-slate-200 text-slate-600 font-bold rounded-xl shadow-sm hover:bg-slate-50 transition-all text-xs uppercase tracking-widest">
          <i className={`fas ${showArchive ? 'fa-plus' : 'fa-archive'} mr-2 text-blue-600`}></i>
          {showArchive ? 'New Generation' : `${mode} History`}
        </button>
      </div>

      {showArchive ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {assessmentHistory.length === 0 ? (
            <div className="col-span-2 text-center py-20 bg-white rounded-3xl border border-slate-100">
              <i className="fas fa-folder-open text-4xl text-slate-100 mb-4"></i>
              <p className="text-slate-400 font-bold uppercase text-xs tracking-widest">No documents found in history</p>
            </div>
          ) : (
            assessmentHistory.map(item => (
              <div key={item.id} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all group">
                <div className="flex justify-between items-start mb-4">
                  <span className="px-2 py-1 bg-blue-50 text-blue-600 rounded text-[9px] font-black uppercase tracking-widest">{item.subject}</span>
                  <button onClick={(e) => { e.stopPropagation(); if(confirm('Delete?')) onDelete(item.id); }} className="text-slate-200 hover:text-red-500 transition-colors"><i className="fas fa-trash-alt"></i></button>
                </div>
                <h3 className="font-bold text-slate-800 leading-tight mb-2 truncate">{item.topic}</h3>
                <div className="text-[10px] text-slate-400 font-medium mb-4">{new Date(item.createdAt).toLocaleDateString()} • {item.questions.length} Questions</div>
                <button onClick={() => { setResult(item); setEditedResult(item); }} className="mt-auto w-full py-3 bg-slate-50 group-hover:bg-[#1a2b4b] group-hover:text-white text-slate-500 font-bold rounded-xl text-[10px] uppercase transition-all tracking-widest">Open Document</button>
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="bg-white rounded-[3rem] shadow-2xl overflow-hidden border border-slate-100">
          <div className="bg-[#1a2b4b] px-10 py-12 text-white">
            <h2 className="text-3xl font-black uppercase tracking-tighter">Pedagogical Synthesis</h2>
            <p className="mt-2 text-blue-100 opacity-70 font-medium italic">Generate high-fidelity assessments with reference page extraction.</p>
          </div>
          <form onSubmit={handleSubmit} className="p-10 space-y-10">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div><label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest mb-2">Subject Area</label><input type="text" required placeholder="e.g. Computer Networking" value={config.subject} onChange={e => setConfig({...config, subject: e.target.value})} className={inputClass} /></div>
                <div><label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest mb-2">Target Grade / Level</label><input type="text" required placeholder="e.g. Level 3" value={config.gradeLevel} onChange={e => setConfig({...config, gradeLevel: e.target.value})} className={inputClass} /></div>
             </div>
             <div><label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest mb-2">Specific Module / Topic</label><input type="text" required placeholder="e.g. IP Addressing & Subnetting" value={config.topic} onChange={e => setConfig({...config, topic: e.target.value})} className={inputClass} /></div>
             
             <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div><label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest mb-2">Num. Questions</label><input type="number" min="1" max="50" required value={config.numQuestions} onChange={e => setConfig({...config, numQuestions: parseInt(e.target.value) || 1})} className={inputClass} /></div>
                <div><label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest mb-2">Question Type</label>
                  <select value={config.questionType} onChange={e => setConfig({...config, questionType: e.target.value as any})} className={inputClass}>
                    <option value="mixed">Mixed (Recommended)</option>
                    <option value="multiple-choice">Multiple Choice Only</option>
                    <option value="short-answer">Short Answer Only</option>
                  </select>
                </div>
                <div><label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest mb-2">Max Marks</label><input type="number" required value={config.totalMarks} onChange={e => setConfig({...config, totalMarks: parseInt(e.target.value) || 20})} className={inputClass} /></div>
             </div>
             
             <div className="pt-8 border-t border-slate-100">
                <div className="flex justify-between items-center mb-3">
                   <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest">Source Document (Required for Page Refs)</label>
                   <span className="text-[10px] text-blue-600 font-bold uppercase italic">Recommended for extraction</span>
                </div>
                <div className="relative">
                   <input type="file" onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                   <div className={`p-8 border-2 border-dashed rounded-[2rem] flex flex-col items-center justify-center transition-all ${selectedFileName ? 'bg-emerald-50 border-emerald-300' : 'bg-slate-50 border-slate-200 hover:border-blue-400'}`}>
                      <i className={`fas ${selectedFileName ? 'fa-check-circle text-emerald-500' : 'fa-file-upload text-slate-300'} text-3xl mb-3`}></i>
                      <p className="text-sm font-bold text-slate-500">{selectedFileName || 'Click to upload curricula or module guide'}</p>
                   </div>
                </div>
             </div>

             {loading && (
                <div className="space-y-4 animate-fadeIn">
                  <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-[0.3em] text-blue-600">
                    <span>{genStep}</span>
                    <span>{progress}%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-4 rounded-full overflow-hidden border border-slate-200 shadow-inner">
                    <div className="bg-[#1a2b4b] h-full transition-all duration-700 ease-out shadow-lg" style={{ width: `${progress}%` }}></div>
                  </div>
                </div>
              )}

             {error && <div className="p-5 bg-rose-50 text-rose-700 rounded-2xl text-[11px] font-black uppercase border border-rose-100 shadow-sm"><i className="fas fa-bolt mr-2"></i> {error}</div>}
             
             <div className="pt-4">
                <button type="submit" disabled={loading} className={`w-full py-6 rounded-[2rem] font-black text-white uppercase tracking-widest shadow-2xl transition-all ${loading ? 'bg-slate-400 cursor-not-allowed scale-95' : 'bg-[#1a2b4b] hover:bg-black hover:scale-105 active:scale-95'}`}>
                  {loading ? <i className="fas fa-sync fa-spin text-xl"></i> : `Synthesize ${mode.toUpperCase()}`}
                </button>
             </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default AssessmentGenerator;
