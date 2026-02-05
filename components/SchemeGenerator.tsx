
import React, { useState, useEffect } from 'react';
import { SchemeOfWork, RTBDefaultSettings, AppView, SchemeGenerationConfig } from '../types';
import { generateSchemeOfWork } from '../services/geminiService';
import SchemeDisplay from './SchemeDisplay';

interface SchemeGeneratorProps {
  onSave: (scheme: SchemeOfWork) => void;
  onCancel: () => void;
  onViewArchive?: () => void;
}

const SchemeGenerator: React.FC<SchemeGeneratorProps> = ({ onSave, onCancel, onViewArchive }) => {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [genStep, setGenStep] = useState('Idle');
  const [result, setResult] = useState<SchemeOfWork | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [chronogramFileName, setChronogramFileName] = useState<string | null>(null);
  const [curriculaFileName, setCurriculaFileName] = useState<string | null>(null);

  const [config, setConfig] = useState<SchemeGenerationConfig>({
    academicYear: '2025-2026',
    term: 'TERM 1',
    teacherName: '',
    schoolName: '',
    subject: '',
    gradeLevel: '',
    language: 'English',
    numWeeks: 12,
    sector: '',
    trade: '',
    qualificationTitle: '',
    rqfLevel: 'Level 3',
    moduleCodeTitle: '',
    learningHours: '60 Periods',
    numClasses: '1',
    date: new Date().toISOString().split('T')[0],
    className: '',
    schoolLogoLeft: '',
    schoolLogoRight: ''
  });

  useEffect(() => {
    const saved = localStorage.getItem('rtb_default_settings');
    if (saved) {
      const defaults: RTBDefaultSettings = JSON.parse(saved);
      setConfig(prev => ({
        ...prev,
        schoolName: defaults.schoolName || prev.schoolName,
        teacherName: defaults.trainerName || prev.teacherName,
        trade: defaults.trade || prev.trade,
        sector: defaults.sector || prev.sector,
        academicYear: defaults.academicYear || prev.academicYear,
        rqfLevel: defaults.level || prev.rqfLevel,
        term: defaults.term || prev.term,
        schoolLogoLeft: defaults.schoolLogoLeft || prev.schoolLogoLeft,
        schoolLogoRight: defaults.schoolLogoRight || prev.schoolLogoRight,
      }));
    }
  }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'chronogram' | 'curricula') => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 15 * 1024 * 1024) {
        setError("File size exceeds 15MB limit.");
        return;
      }
      setError(null);
      if (type === 'chronogram') setChronogramFileName(file.name);
      else setCurriculaFileName(file.name);

      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = (reader.result as string).split(',')[1];
        setConfig(prev => ({
          ...prev,
          [type === 'chronogram' ? 'chronogramFile' : 'curriculaFile']: {
            data: base64String,
            mimeType: file.type
          }
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!config.chronogramFile || !config.curriculaFile) {
      setError("Please upload both Chronogram (Date Source) and Curricula (Content Source).");
      return;
    }
    
    setLoading(true);
    setProgress(5);
    setGenStep('Analyzing Chronogram & Curricula...');
    setError(null);

    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 98) return prev;
        return prev + Math.floor(Math.random() * 6);
      });
    }, 1200);
    
    try {
      setGenStep(`Synthesizing pedagogical flow for ${config.term}...`);
      const scheme = await generateSchemeOfWork(config);
      clearInterval(progressInterval);
      setProgress(100);
      setResult(scheme);
      onSave(scheme);
    } catch (err: any) {
      clearInterval(progressInterval);
      setError(err.message || "Synthesis failed. Please ensure the documents contain clear module content.");
    } finally {
      setLoading(false);
      setGenStep('Idle');
    }
  };

  const inputClass = "w-full px-4 py-3 bg-[#f8fafc] border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-600 transition-all text-sm font-medium";
  const labelClass = "block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5";

  if (result) {
    return (
      <div className="max-w-7xl mx-auto py-12 px-4 animate-fadeIn">
        <button onClick={() => setResult(null)} className="mb-6 text-blue-600 font-bold flex items-center hover:underline no-print">
          <i className="fas fa-arrow-left mr-2"></i> Create New Scheme
        </button>
        <SchemeDisplay scheme={result} onUpdate={(u) => { setResult(u); onSave(u); }} />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-12 px-6">
      <div className="mb-10">
        <h1 className="text-4xl font-black text-[#1a2b4b] uppercase tracking-tighter">Scheme Designer</h1>
        <p className="text-slate-500 mt-2 font-medium">Automatic cumulative synthesis of pedagogical curricula.</p>
      </div>

      <div className="bg-white p-10 rounded-[3rem] shadow-2xl border border-slate-100">
        <form onSubmit={handleSubmit} className="space-y-12">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <label className={labelClass}>Chronogram (Dates & Gaps)</label>
              <div className="relative group cursor-pointer">
                <input type="file" onChange={(e) => handleFileUpload(e, 'chronogram')} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                <div className={`p-8 border-2 border-dashed rounded-3xl flex flex-col items-center justify-center transition-all ${chronogramFileName ? 'bg-emerald-50 border-emerald-400' : 'bg-slate-50 border-slate-200 group-hover:border-blue-400 group-hover:bg-blue-50/50'}`}>
                  <i className={`fas ${chronogramFileName ? 'fa-check text-emerald-500' : 'fa-calendar-alt text-slate-300'} text-3xl mb-3`}></i>
                  <span className="text-[10px] font-black uppercase text-center px-4 truncate w-full">
                    {chronogramFileName || 'No file chosen'}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <label className={labelClass}>Curricula (Content Source)</label>
              <div className="relative group cursor-pointer">
                <input type="file" onChange={(e) => handleFileUpload(e, 'curricula')} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                <div className={`p-8 border-2 border-dashed rounded-3xl flex flex-col items-center justify-center transition-all ${curriculaFileName ? 'bg-emerald-50 border-emerald-400' : 'bg-slate-50 border-slate-200 group-hover:border-blue-400 group-hover:bg-blue-50/50'}`}>
                  <i className={`fas ${curriculaFileName ? 'fa-check text-emerald-500' : 'fa-list-ul text-slate-300'} text-3xl mb-3`}></i>
                  <span className="text-[10px] font-black uppercase text-center px-4 truncate w-full">
                    {curriculaFileName || 'No file chosen'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-8">
            <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest border-b pb-4">Metadata Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div><label className={labelClass}>Trainer Name</label><input type="text" value={config.teacherName} onChange={e => setConfig({...config, teacherName: e.target.value})} className={inputClass} /></div>
              <div><label className={labelClass}>Class Name</label><input type="text" placeholder="e.g. L4 SOD" value={config.className} onChange={e => setConfig({...config, className: e.target.value})} className={inputClass} /></div>
              
              <div><label className={labelClass}>Sector</label><input type="text" placeholder="e.g. ICT" value={config.sector} onChange={e => setConfig({...config, sector: e.target.value})} className={inputClass} /></div>
              <div><label className={labelClass}>Trade</label><input type="text" placeholder="e.g. Software Development" value={config.trade} onChange={e => setConfig({...config, trade: e.target.value})} className={inputClass} /></div>
              
              <div className="md:col-span-2"><label className={labelClass}>Qualification Title</label><input type="text" placeholder="e.g. TVET Certificate 4 in Software Development" value={config.qualificationTitle} onChange={e => setConfig({...config, qualificationTitle: e.target.value})} className={inputClass} /></div>
              <div className="md:col-span-2"><label className={labelClass}>Module Code & Title</label><input type="text" placeholder="e.g. FBSSO01 Service Operations" value={config.moduleCodeTitle} onChange={e => setConfig({...config, moduleCodeTitle: e.target.value})} className={inputClass} /></div>
              
              <div><label className={labelClass}>Academic Year</label><input type="text" value={config.academicYear} onChange={e => setConfig({...config, academicYear: e.target.value})} className={inputClass} /></div>
              <div><label className={labelClass}>Term Coverage</label>
                <select value={config.term} onChange={e => setConfig({...config, term: e.target.value})} className={inputClass}>
                  <option value="TERM 1">TERM I (Display Term I only)</option>
                  <option value="TERM 2">TERM II (Display Term II only)</option>
                  <option value="TERM 3">TERM III (Display Term III only)</option>
                  <option value="ALL TERMS">ALL TERMS (Display Full I+II+III)</option>
                </select>
              </div>
            </div>
          </div>

          {loading && (
            <div className="space-y-3 animate-fadeIn">
              <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-[0.2em] text-blue-600">
                <span>{genStep}</span>
                <span>{progress}%</span>
              </div>
              <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden border border-slate-200 shadow-inner">
                <div className="bg-blue-600 h-full transition-all duration-500 ease-out shadow-lg shadow-blue-200" style={{ width: `${progress}%` }}></div>
              </div>
            </div>
          )}

          {error && <div className="p-5 bg-rose-50 border border-rose-100 text-rose-600 rounded-2xl text-[11px] font-bold uppercase flex items-center shadow-sm"><i className="fas fa-exclamation-triangle mr-3"></i> {error}</div>}

          <div className="flex justify-end gap-4 pt-8 border-t border-slate-100">
            <button type="button" onClick={onCancel} className="px-8 py-3 bg-white border border-slate-200 text-slate-500 font-bold rounded-xl hover:bg-slate-50 transition-all text-xs uppercase">Cancel</button>
            <button 
              type="submit" 
              disabled={loading}
              className={`px-12 py-5 rounded-[2rem] font-black text-white uppercase tracking-widest shadow-2xl transition-all ${loading ? 'bg-slate-400 cursor-not-allowed' : 'bg-[#1a2b4b] hover:bg-black hover:scale-105 active:scale-95'}`}
            >
              {loading ? <i className="fas fa-sync fa-spin"></i> : 'Generate Scheme'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SchemeGenerator;
