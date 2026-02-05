import React, { useState, useEffect, useRef } from 'react';
import { RTBGenerationConfig, RTBSessionPlan, RTBDefaultSettings } from '../types';
import { generateRTBSessionPlan } from '../services/geminiService';
import LessonDisplay from './LessonDisplay';

interface RTBGeneratorProps {
  onSave: (lesson: RTBSessionPlan) => void;
  onCancel?: () => void;
}

const PREDEFINED_TECHNIQUES = [
  'Lecture-Demonstration', 'Brainstorming', 'Group Discussion', 'Practical Exercise', 
  'Case Study', 'Role Play', 'Q&A Session', 'Observation', 'Presentation', 'Peer Coaching',
  'Field Trip', 'Project Work', 'Simulation', 'Workshop Rotation'
];

const RTBGenerator: React.FC<RTBGeneratorProps> = ({ onSave, onCancel }) => {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [genStep, setGenStep] = useState('Idle');
  const [result, setResult] = useState<RTBSessionPlan | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const [customTechnique, setCustomTechnique] = useState('');
  const [selectedTechniques, setSelectedTechniques] = useState<string[]>(['Lecture-Demonstration']);

  const [config, setConfig] = useState<RTBGenerationConfig>({
    schoolName: '',
    academicYear: '2025-2026',
    term: 'Term 1',
    trainerName: '',
    trade: '',
    sector: '',
    level: 'Level 3',
    date: new Date().toISOString().split('T')[0],
    week: '1',
    noTrainees: '30',
    className: '',
    moduleCodeName: '',
    topicOfSession: '',
    learningOutcome: '',
    indicativeContent: '',
    durationOfSession: '60',
    methodology: 'Lecture-Demonstration',
    range: '',
    language: 'English',
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
        trainerName: defaults.trainerName || prev.trainerName,
        trade: defaults.trade || prev.trade,
        sector: defaults.sector || prev.sector,
        academicYear: defaults.academicYear || prev.academicYear,
        level: defaults.level || prev.level,
        term: defaults.term || prev.term,
        moduleCodeName: defaults.moduleCodeName || prev.moduleCodeName,
        schoolLogoLeft: defaults.schoolLogoLeft || prev.schoolLogoLeft,
        schoolLogoRight: defaults.schoolLogoRight || prev.schoolLogoRight
      }));
    }
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem('rtb_default_settings');
    let defaults = saved ? JSON.parse(saved) : {};
    if (defaults.moduleCodeName !== config.moduleCodeName) {
      defaults.moduleCodeName = config.moduleCodeName;
      localStorage.setItem('rtb_default_settings', JSON.stringify(defaults));
    }
  }, [config.moduleCodeName]);

  const toggleTechnique = (t: string) => {
    setSelectedTechniques(prev => 
      prev.includes(t) ? prev.filter(item => item !== t) : [...prev, t]
    );
  };

  const addCustomTechnique = () => {
    if (customTechnique && !selectedTechniques.includes(customTechnique)) {
      setSelectedTechniques([...selectedTechniques, customTechnique]);
      setCustomTechnique('');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFileName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = (reader.result as string).split(',')[1];
        setConfig(prev => ({
          ...prev,
          referenceFile: { data: base64String, mimeType: file.type }
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setProgress(5);
    setGenStep('Analyzing source & synthesizing...');
    setError(null);

    const progressInterval = setInterval(() => {
      setProgress(prev => (prev >= 98 ? prev : prev + Math.floor(Math.random() * 8)));
    }, 600);

    try {
      const finalConfig = { ...config, methodology: selectedTechniques.join(', ') };
      const plan = await generateRTBSessionPlan(finalConfig);
      clearInterval(progressInterval);
      setProgress(100);
      setResult(plan);
      onSave(plan);
    } catch (err: any) {
      clearInterval(progressInterval);
      setError(err.message || "Synthesis failed.");
    } finally {
      setLoading(false);
      setGenStep('Idle');
    }
  };

  const inputClass = "w-full px-4 py-2 bg-[#f4f4f4] border border-[#e2e8f0] rounded-md outline-none focus:ring-1 focus:ring-indigo-400 transition-all text-[13px]";
  const labelClass = "block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1";

  if (result) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 animate-fadeIn">
        <div className="flex justify-between items-center mb-6 no-print">
          <h2 className="text-2xl font-black text-[#1a2b4b] uppercase tracking-tighter">CBT Session Portal</h2>
          <button onClick={() => setResult(null)} className="text-indigo-600 hover:text-indigo-800 font-bold flex items-center transition-all">
            <i className="fas fa-arrow-left mr-2"></i> Design New Plan
          </button>
        </div>
        <LessonDisplay lesson={result} onUpdate={(u) => {
           const updated = u as RTBSessionPlan;
           setResult(updated);
           onSave(updated);
        }} />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-8">
          <div className="mb-10">
            <h1 className="text-3xl font-black text-[#1a2b4b] uppercase tracking-tighter leading-none">RTB SESSION PLAN CREATION</h1>
            <p className="text-[12px] text-slate-500 mt-2 font-medium">Professional TVET synthesis following Rwanda CBT standards.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-10">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
               <div className="lg:col-span-2">
                  <label className={labelClass}>Module (Code & Name) - Auto Saved</label>
                  <input type="text" required placeholder="e.g. FBSSO01 Service Operations" value={config.moduleCodeName} onChange={e => setConfig({...config, moduleCodeName: e.target.value})} className={inputClass} />
               </div>
               <div>
                  <label className={labelClass}>Trade</label>
                  <input type="text" required value={config.trade} onChange={e => setConfig({...config, trade: e.target.value})} className={inputClass} />
               </div>
               <div>
                  <label className={labelClass}>Sector</label>
                  <input type="text" required value={config.sector} onChange={e => setConfig({...config, sector: e.target.value})} className={inputClass} />
               </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
               <div>
                  <label className={labelClass}>Term</label>
                  <select value={config.term} onChange={e => setConfig({...config, term: e.target.value})} className={inputClass}>
                     <option value="Term 1">Term 1</option>
                     <option value="Term 2">Term 2</option>
                     <option value="Term 3">Term 3</option>
                  </select>
               </div>
               <div>
                  <label className={labelClass}>Duration (Minutes)</label>
                  <input type="number" value={config.durationOfSession} onChange={e => setConfig({...config, durationOfSession: e.target.value})} className={inputClass} />
               </div>
               <div>
                  <label className={labelClass}>No. Trainees</label>
                  <input type="text" value={config.noTrainees} onChange={e => setConfig({...config, noTrainees: e.target.value})} className={inputClass} />
               </div>
               <div>
                  <label className={labelClass}>Level</label>
                  <select value={config.level} onChange={e => setConfig({...config, level: e.target.value})} className={inputClass}>
                     <option value="Level 3">L3</option><option value="Level 4">L4</option><option value="Level 5">L5</option>
                  </select>
               </div>
            </div>

            <div className="pt-6 border-t border-slate-50">
               <label className={labelClass}>Facilitation Techniques (Select Multiple)</label>
               <div className="flex flex-wrap gap-2 mt-3">
                  {PREDEFINED_TECHNIQUES.map(t => (
                    <button 
                      key={t} 
                      type="button"
                      onClick={() => toggleTechnique(t)}
                      className={`px-3 py-1.5 rounded-full text-[10px] font-bold border transition-all ${selectedTechniques.includes(t) ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white border-slate-200 text-slate-500 hover:border-indigo-400'}`}
                    >
                      {t}
                    </button>
                  ))}
                  <div className="flex items-center gap-2">
                    <input 
                      type="text" 
                      placeholder="Add New..." 
                      className="px-3 py-1 bg-[#f4f4f4] border border-[#e2e8f0] rounded-full text-[10px] outline-none w-24"
                      value={customTechnique}
                      onChange={e => setCustomTechnique(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addCustomTechnique())}
                    />
                    <button type="button" onClick={addCustomTechnique} className="w-6 h-6 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center hover:bg-indigo-600 hover:text-white transition-all"><i className="fas fa-plus text-[10px]"></i></button>
                  </div>
               </div>
            </div>

            <div className="pt-6 border-t border-slate-50">
               <label className={labelClass}>Trainer Guide / Curricula (Source for Extraction)</label>
               <div className="relative mt-2">
                  <input type="file" onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer z-10" accept=".pdf,.doc,.docx,.txt" />
                  <div className={`p-8 border-2 border-dashed rounded-[2rem] flex flex-col items-center justify-center transition-all ${selectedFileName ? 'bg-emerald-50 border-emerald-300' : 'bg-slate-50 border-slate-200 hover:border-blue-400'}`}>
                     <i className={`fas ${selectedFileName ? 'fa-check-circle text-emerald-600' : 'fa-cloud-upload-alt text-slate-300'} text-3xl mb-3`}></i>
                     <p className="text-sm font-bold text-slate-500">{selectedFileName || "Upload Trainer's Guide for high-accuracy synthesis"}</p>
                  </div>
               </div>
            </div>

            <div className="space-y-6 pt-6 border-t border-slate-50">
               <div>
                  <label className={labelClass}>Topic of the Session</label>
                  <input type="text" required placeholder="Focused technical idea" value={config.topicOfSession} onChange={e => setConfig({...config, topicOfSession: e.target.value})} className={`${inputClass} text-lg font-bold py-3`} />
               </div>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                     <label className={labelClass}>Learning Outcome (Optional Input)</label>
                     <textarea rows={2} placeholder="Leave blank for AI extraction from file" value={config.learningOutcome} onChange={e => setConfig({...config, learningOutcome: e.target.value})} className={inputClass} />
                  </div>
                  <div>
                     <label className={labelClass}>Indicative Content (Optional Input)</label>
                     <textarea rows={2} placeholder="Leave blank for AI extraction from file" value={config.indicativeContent} onChange={e => setConfig({...config, indicativeContent: e.target.value})} className={inputClass} />
                  </div>
               </div>
               <div>
                  <label className={labelClass}>Range (Optional Input)</label>
                  <textarea rows={2} placeholder="Scope of the session" value={config.range} onChange={e => setConfig({...config, range: e.target.value})} className={inputClass} />
               </div>
            </div>

            {loading && (
              <div className="space-y-4 animate-fadeIn">
                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-[0.3em] text-indigo-600">
                  <span>{genStep}</span>
                  <span>{progress}%</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden border border-slate-200">
                  <div className="bg-indigo-600 h-full transition-all duration-300 ease-out" style={{ width: `${progress}%` }}></div>
                </div>
              </div>
            )}

            {error && <div className="p-4 bg-rose-50 text-rose-700 rounded-xl text-xs font-bold border border-rose-100 shadow-sm"><i className="fas fa-exclamation-triangle mr-2"></i> {error}</div>}

            <div className="pt-6 flex justify-end gap-3">
              <button type="button" onClick={onCancel} className="px-8 py-3 bg-white text-slate-400 font-bold rounded-xl border border-slate-200 text-xs uppercase tracking-widest">Cancel</button>
              <button type="submit" disabled={loading} className={`px-12 py-4 rounded-xl uppercase text-xs shadow-xl tracking-[0.2em] font-black text-white transition-all transform active:scale-95 ${loading ? 'bg-slate-400' : 'bg-[#1a2b4b] hover:bg-black'}`}>
                {loading ? "Synthesizing..." : "Generate Session Plan"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RTBGenerator;
