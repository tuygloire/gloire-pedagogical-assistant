
import React, { useState } from 'react';
import { AppView, LessonPlan, NurseryLessonPlan } from '../types';
import NurseryDisplay from './NurseryDisplay';

interface NurseryPlansProps {
  history: LessonPlan[];
  setView: (v: AppView) => void;
  onDelete: (id: string) => void;
  onUpdate: (lesson: LessonPlan) => void;
}

const NurseryPlans: React.FC<NurseryPlansProps> = ({ history, setView, onDelete, onUpdate }) => {
  const [selectedPlan, setSelectedPlan] = useState<NurseryLessonPlan | null>(null);
  const nurseryPlans = history.filter(p => p.type === 'nursery') as NurseryLessonPlan[];

  if (selectedPlan) {
    return (
      <div className="p-8 max-w-6xl mx-auto space-y-6">
        <button onClick={() => setSelectedPlan(null)} className="flex items-center space-x-2 text-blue-600 font-bold no-print">
          <i className="fas fa-arrow-left"></i><span>Back to Archive</span>
        </button>
        <NurseryDisplay lesson={selectedPlan} onUpdate={(u) => { onUpdate(u); setSelectedPlan(u); }} />
      </div>
    );
  }

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-extrabold text-[#1a2b4b]">Nursery Lesson Plans</h1>
          <p className="text-slate-500 mt-2 font-medium">Archive of your early childhood pedagogical content</p>
        </div>
        <button onClick={() => setView(AppView.NURSERY_GENERATOR)} className="px-6 py-3 bg-[#1a2b4b] text-white font-bold rounded-2xl hover:bg-black transition-all shadow-lg">
          <i className="fas fa-plus mr-2"></i> Create Nursery Plan
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        {nurseryPlans.length > 0 ? (
          <div className="divide-y divide-slate-50">
            {nurseryPlans.map(p => (
              <div key={p.id} onClick={() => setSelectedPlan(p)} className="px-8 py-6 flex items-center justify-between hover:bg-slate-50 transition-all cursor-pointer group">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:bg-amber-600 group-hover:text-white transition-all">
                    <i className="fas fa-child"></i>
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800">{p.title}</h4>
                    <p className="text-xs text-slate-400">{p.gradeLevel} • {p.subject} • {p.schoolName}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="text-xs font-bold text-slate-400">{new Date(p.createdAt).toLocaleDateString()}</span>
                  <button onClick={(e) => { e.stopPropagation(); onDelete(p.id); }} className="text-slate-300 hover:text-red-500 p-2"><i className="fas fa-trash-alt"></i></button>
                  <i className="fas fa-chevron-right text-slate-200"></i>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-20 text-center">
            <i className="fas fa-folder-open text-4xl text-slate-100 mb-4"></i>
            <p className="text-slate-400 font-bold uppercase text-xs tracking-widest">Archive is empty</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default NurseryPlans;
