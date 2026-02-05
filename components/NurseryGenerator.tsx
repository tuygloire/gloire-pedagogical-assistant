
import React, { useState, useRef } from 'react';
import { NurseryGenerationConfig, NurseryLessonPlan } from '../types';
import { generateNurseryLessonPlan } from '../services/geminiService';
import NurseryDisplay from './NurseryDisplay';

interface NurseryGeneratorProps {
  onSave: (lesson: NurseryLessonPlan) => void;
  onCancel: () => void;
}

const NurseryGenerator: React.FC<NurseryGeneratorProps> = ({ onSave, onCancel }) => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<NurseryLessonPlan | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const dateInputRef = useRef<HTMLInputElement>(null);

  const [config, setConfig] = useState<NurseryGenerationConfig>({
    schoolName: '',
    teacherName: '',
    term: '',
    date: new Date().toISOString().split('T')[0],
    subject: '',
    gradeLevel: '',
    lessonName: '',
    duration: '30',
    classSize: '20',
    language: 'English'
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFileName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = (reader.result as string).split(',')[1];
        setConfig(prev => ({
          ...prev,
          referenceFile: {
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
    setLoading(true);
    setError(null);
    try {
      const plan = await generateNurseryLessonPlan(config);
      setResult(plan);
      onSave(plan);
    } catch (err) {
      setError("Failed to generate nursery plan. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full px-4 py-3 bg-[#f3f4f6] border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm";
  const labelClass = "block text-xs font-bold text-[#1e293b] mb-1.5 uppercase tracking-wide";
  const sectionTitle = "text-lg font-bold text-[#1e293b] mb-6 border-b pb-4";

  if (result) {
    return (
      <div className="max-w-5xl mx-auto py-12 px-4">
        <button onClick={() => setResult(null)} className="mb-6 text-blue-600 font-bold flex items-center no-print">
          <i className="fas fa-arrow-left mr-2"></i> Back to Studio
        </button>
        <NurseryDisplay lesson={result} onUpdate={(u) => { setResult(u); onSave(u); }} />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-12 px-6 animate-fadeIn">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-[#1e293b]">Create Nursery Lesson Plan</h1>
        <p className="text-slate-500 text-sm mt-1">Fill in the details below to generate a nursery lesson plan with AI assistance</p>
      </div>

      <div className="bg-white p-10 rounded-2xl shadow-sm border border-slate-100">
        <h2 className={sectionTitle}>Basic Information</h2>
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-6">
            <div>
              <label className={labelClass}>School Name</label>
              <input type="text" value={config.schoolName} onChange={e => setConfig({...config, schoolName: e.target.value})} className={inputClass} placeholder="Enter school name" />
            </div>
            <div>
              <label className={labelClass}>Teacher Name</label>
              <input type="text" value={config.teacherName} onChange={e => setConfig({...config, teacherName: e.target.value})} className={inputClass} placeholder="Enter teacher name" />
            </div>
            <div>
              <label className={labelClass}>Term</label>
              <input type="text" placeholder="e.g., Term 1, Term 2" value={config.term} onChange={e => setConfig({...config, term: e.target.value})} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Date</label>
              <div className="relative">
                <input type="text" value={config.date} onChange={e => setConfig({...config, date: e.target.value})} className={inputClass} />
                <button type="button" onClick={() => dateInputRef.current?.showPicker()} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"><i className="far fa-calendar"></i></button>
                <input ref={dateInputRef} type="date" className="absolute opacity-0 pointer-events-none" onChange={e => setConfig({...config, date: e.target.value})} />
              </div>
            </div>
            <div>
              <label className={labelClass}>Subject</label>
              <input type="text" placeholder="e.g., Numbers, Colors, Shapes" value={config.subject} onChange={e => setConfig({...config, subject: e.target.value})} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Class Level</label>
              <input type="text" placeholder="e.g., Nursery 1, Nursery 2" value={config.gradeLevel} onChange={e => setConfig({...config, gradeLevel: e.target.value})} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Lesson Name</label>
              <input type="text" placeholder="e.g., Learning to Count 1-10" value={config.lessonName} onChange={e => setConfig({...config, lessonName: e.target.value})} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Total Duration (minutes)</label>
              <input type="number" value={config.duration} onChange={e => setConfig({...config, duration: e.target.value})} className={inputClass} placeholder="30" />
            </div>
            <div>
              <label className={labelClass}>Class Size (number of children)</label>
              <input type="number" value={config.classSize} onChange={e => setConfig({...config, classSize: e.target.value})} className={inputClass} placeholder="20" />
            </div>
            <div>
              <label className={labelClass}>Language</label>
              <select value={config.language} onChange={e => setConfig({...config, language: e.target.value})} className={inputClass}>
                <option value="English">English</option>
                <option value="Kinyarwanda">Kinyarwanda</option>
                <option value="French">French</option>
              </select>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-100">
            <h2 className={sectionTitle}>Reference Material</h2>
            <div className="relative">
              <input type="file" onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer z-10" accept=".pdf,.doc,.docx,.txt" />
              <div className={`p-8 border-2 border-dashed rounded-xl flex flex-col items-center justify-center transition-all ${selectedFileName ? 'bg-emerald-50 border-emerald-300' : 'bg-slate-50 border-slate-200 hover:border-blue-400'}`}>
                <i className={`fas ${selectedFileName ? 'fa-file-alt text-emerald-600' : 'fa-cloud-upload-alt text-slate-300'} text-3xl mb-3`}></i>
                <p className="text-sm font-bold text-slate-500">{selectedFileName || 'Click to upload nursery curriculum for AI context'}</p>
              </div>
            </div>
          </div>

          {error && <div className="p-4 bg-red-50 text-red-700 rounded-xl text-xs font-bold uppercase border border-red-100">{error}</div>}

          <div className="flex justify-end space-x-4 pt-6 border-t border-slate-100">
            <button type="button" onClick={onCancel} className="px-8 py-3 bg-white border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition-all text-sm">Cancel</button>
            <button type="submit" disabled={loading} className={`px-10 py-3 rounded-xl font-bold text-white transition-all shadow-xl flex items-center space-x-2 ${loading ? 'bg-slate-400' : 'bg-[#1a2b4b] hover:bg-black'}`}>
              {loading ? <><i className="fas fa-sync fa-spin"></i><span>Generating...</span></> : <span>Generate Lesson Plan</span>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NurseryGenerator;
