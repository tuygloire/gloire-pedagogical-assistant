
import React, { useState, useRef, useEffect } from 'react';
import { REBGenerationConfig, REBLessonPlan } from '../types';
import { generateREBLessonPlan } from '../services/geminiService';
import REBDisplay from './REBDisplay';

interface REBGeneratorProps {
  onSave: (lesson: REBLessonPlan) => void;
  onCancel: () => void;
}

const REBGenerator: React.FC<REBGeneratorProps> = ({ onSave, onCancel }) => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<REBLessonPlan | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const dateInputRef = useRef<HTMLInputElement>(null);

  const [config, setConfig] = useState<REBGenerationConfig>({
    school: 'Charles Lwanga Primary School',
    teacher: 'GLOIRE IT',
    subject: '',
    gradeLevel: '',
    term: '',
    date: new Date().toISOString().split('T')[0],
    duration: '40',
    classSize: '30',
    location: 'Classroom',
    specialNeeds: '',
    language: 'English',
    unitNo: '',
    unitTitle: '',
    keyUnitCompetence: '',
    lessonNo: '',
    lessonTitle: '',
    includeAIActivities: false,
    isDetailed: false
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
      const plan = await generateREBLessonPlan(config);
      setResult(plan);
      onSave(plan);
    } catch (err) {
      setError("Failed to generate plan. Please try again.");
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
        <button onClick={() => setResult(null)} className="mb-6 text-blue-600 font-bold flex items-center">
          <i className="fas fa-arrow-left mr-2"></i> Back to Studio
        </button>
        <REBDisplay lesson={result} onUpdate={(u) => { setResult(u as REBLessonPlan); onSave(u as REBLessonPlan); }} />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-12 px-6">
      <div className="mb-8">
        <button onClick={onCancel} className="text-slate-400 hover:text-slate-600 text-sm flex items-center mb-4 transition-colors">
          <i className="fas fa-arrow-left mr-2"></i> Back to Dashboard
        </button>
        <h1 className="text-3xl font-black text-[#1e293b]">Create Lesson Plan</h1>
        <p className="text-slate-500 text-sm mt-1">Fill in the details below to generate a comprehensive lesson plan.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-10">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
          <h2 className={sectionTitle}>Lesson Plan Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div><label className={labelClass}>School</label><input type="text" value={config.school} onChange={e => setConfig({...config, school: e.target.value})} className={inputClass} /></div>
            <div><label className={labelClass}>Teacher</label><input type="text" value={config.teacher} onChange={e => setConfig({...config, teacher: e.target.value})} className={inputClass} /></div>
            <div><label className={labelClass}>Subject</label><input type="text" placeholder="Subject" value={config.subject} onChange={e => setConfig({...config, subject: e.target.value})} className={inputClass} /></div>
            <div><label className={labelClass}>Class Level</label><input type="text" placeholder="E.g., Primary 5, Secondary 2" value={config.gradeLevel} onChange={e => setConfig({...config, gradeLevel: e.target.value})} className={inputClass} /></div>
            <div><label className={labelClass}>Term</label><input type="text" placeholder="E.g., Term 1, Term 2, Term 3" value={config.term} onChange={e => setConfig({...config, term: e.target.value})} className={inputClass} /></div>
            <div>
              <label className={labelClass}>Date</label>
              <div className="relative">
                <input type="text" value={config.date} onChange={e => setConfig({...config, date: e.target.value})} className={inputClass} />
                <button type="button" onClick={() => dateInputRef.current?.showPicker()} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"><i className="far fa-calendar"></i></button>
                <input ref={dateInputRef} type="date" className="absolute opacity-0 pointer-events-none" onChange={e => setConfig({...config, date: e.target.value})} />
              </div>
            </div>
            <div><label className={labelClass}>Duration (minutes)</label><input type="number" value={config.duration} onChange={e => setConfig({...config, duration: e.target.value})} className={inputClass} /></div>
            <div><label className={labelClass}>Class Size</label><input type="number" value={config.classSize} onChange={e => setConfig({...config, classSize: e.target.value})} className={inputClass} /></div>
            <div><label className={labelClass}>Location</label><input type="text" value={config.location} onChange={e => setConfig({...config, location: e.target.value})} className={inputClass} /></div>
            <div><label className={labelClass}>Special Needs (Optional)</label><input type="text" placeholder="Any special accommodations" value={config.specialNeeds} onChange={e => setConfig({...config, specialNeeds: e.target.value})} className={inputClass} /></div>
            <div className="md:col-span-2">
              <label className={labelClass}>Language</label>
              <select value={config.language} onChange={e => setConfig({...config, language: e.target.value})} className={inputClass}>
                <option value="English">English</option>
                <option value="Kinyarwanda">Kinyarwanda</option>
                <option value="French">French</option>
              </select>
            </div>
          </div>
        </div>

        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
          <h2 className={sectionTitle}>Lesson Overview</h2>
          <div className="space-y-6">
            <div><label className={labelClass}>Unit No.</label><input type="text" placeholder="E.g., Unit 3" value={config.unitNo} onChange={e => setConfig({...config, unitNo: e.target.value})} className={inputClass} /></div>
            <div><label className={labelClass}>Unit Title</label><input type="text" placeholder="Enter unit title" value={config.unitTitle} onChange={e => setConfig({...config, unitTitle: e.target.value})} className={inputClass} /></div>
            <div><label className={labelClass}>Key Unit Competence</label><textarea rows={4} placeholder="Enter key unit competence" value={config.keyUnitCompetence} onChange={e => setConfig({...config, keyUnitCompetence: e.target.value})} className={`${inputClass} resize-none`} /></div>
            <div><label className={labelClass}>Lesson No.</label><input type="text" placeholder="E.g., Lesson 1" value={config.lessonNo} onChange={e => setConfig({...config, lessonNo: e.target.value})} className={inputClass} /></div>
            <div><label className={labelClass}>Lesson Title</label><input type="text" placeholder="Enter lesson title" value={config.lessonTitle} onChange={e => setConfig({...config, lessonTitle: e.target.value})} className={inputClass} /></div>
          </div>
        </div>

        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
          <h2 className={sectionTitle}>Reference Material</h2>
          <div className="relative">
            <input type="file" onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer z-10" accept=".pdf,.doc,.docx,.txt" />
            <div className={`p-8 border-2 border-dashed rounded-xl flex flex-col items-center justify-center transition-all ${selectedFileName ? 'bg-emerald-50 border-emerald-300' : 'bg-slate-50 border-slate-200 hover:border-blue-400'}`}>
              <i className={`fas ${selectedFileName ? 'fa-file-alt text-emerald-600' : 'fa-cloud-upload-alt text-slate-300'} text-3xl mb-3`}></i>
              <p className="text-sm font-bold text-slate-500">{selectedFileName || 'Click to upload curriculum or manual for AI context'}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
          <h2 className={sectionTitle}>Additional Options</h2>
          <div className="space-y-6">
            <label className="flex items-start space-x-4 cursor-pointer group">
              <input type="checkbox" checked={config.includeAIActivities} onChange={e => setConfig({...config, includeAIActivities: e.target.checked})} className="mt-1 w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
              <div>
                <span className="block text-sm font-bold text-slate-700">Include AI-generated activities description</span>
                <span className="text-xs text-slate-400">Automatically generate a description of how teaching and learning activities will be conducted.</span>
              </div>
            </label>
            <label className="flex items-start space-x-4 cursor-pointer group">
              <input type="checkbox" checked={config.isDetailed} onChange={e => setConfig({...config, isDetailed: e.target.checked})} className="mt-1 w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
              <div>
                <span className="block text-sm font-bold text-slate-700">Generate detailed lesson plan (2+ pages)</span>
                <span className="text-xs text-slate-400">Create a comprehensive lesson plan with longer, more detailed activities and teacher instructions.</span>
              </div>
            </label>
          </div>
        </div>

        {error && <div className="p-4 bg-red-50 text-red-700 rounded-xl font-bold text-xs uppercase border border-red-100"><i className="fas fa-exclamation-circle mr-2"></i> {error}</div>}

        <div className="flex justify-end">
          <button 
            type="submit" 
            disabled={loading}
            className={`px-10 py-4 rounded-xl font-bold text-white transition-all shadow-xl flex items-center space-x-2 ${loading ? 'bg-slate-400 cursor-not-allowed' : 'bg-[#1e293b] hover:bg-black'}`}
          >
            {loading ? <><i className="fas fa-sync fa-spin"></i><span>Generating...</span></> : <span>Submit</span>}
          </button>
        </div>
      </form>
    </div>
  );
};

export default REBGenerator;
