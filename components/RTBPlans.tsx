
import React, { useState } from 'react';
import { AppView, LessonPlan, RTBSessionPlan } from '../types';
import LessonDisplay from './LessonDisplay';

interface RTBPlansProps {
  history: LessonPlan[];
  setView: (v: AppView) => void;
  onDelete: (id: string) => void;
  onUpdate?: (lesson: LessonPlan) => void;
}

const RTBPlans: React.FC<RTBPlansProps> = ({ history, setView, onDelete, onUpdate }) => {
  const [selectedPlan, setSelectedPlan] = useState<RTBSessionPlan | null>(null);
  const rtbPlans = history.filter(p => p.type === 'rtb') as RTBSessionPlan[];

  if (selectedPlan) {
    return (
      <div className="p-8 max-w-6xl mx-auto space-y-6">
        <button 
          onClick={() => setSelectedPlan(null)}
          className="flex items-center space-x-2 text-indigo-600 hover:text-indigo-800 font-bold transition-all no-print"
        >
          <i className="fas fa-arrow-left"></i>
          <span>Back to Plans List</span>
        </button>
        
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden p-0">
          <LessonDisplay 
            lesson={selectedPlan} 
            onUpdate={(updated) => {
              if (onUpdate) onUpdate(updated);
              setSelectedPlan(updated as RTBSessionPlan);
            }} 
          />
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-extrabold text-[#1a2b4b]">RTB TVET Session Plans</h1>
          <p className="text-slate-500 mt-2 font-medium">Access and generate standard Rwanda TVET Board session plans</p>
        </div>
        <button 
          onClick={() => setView(AppView.RTB_GENERATOR)}
          className="flex items-center space-x-2 px-6 py-3 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200/50"
        >
          <i className="fas fa-plus"></i>
          <span>Generate Session Plan</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <div className="flex items-center space-x-3 text-indigo-600 mb-2">
            <i className="fas fa-file-invoice"></i>
            <span className="text-xs font-bold uppercase tracking-widest">Total Plans</span>
          </div>
          <div className="text-3xl font-black text-[#1a2b4b]">{rtbPlans.length}</div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <div className="flex items-center space-x-3 text-emerald-600 mb-2">
            <i className="fas fa-check-double"></i>
            <span className="text-xs font-bold uppercase tracking-widest">Verified Formats</span>
          </div>
          <div className="text-3xl font-black text-[#1a2b4b]">RTB-V2</div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <div className="flex items-center space-x-3 text-amber-600 mb-2">
            <i className="fas fa-clock"></i>
            <span className="text-xs font-bold uppercase tracking-widest">Standard Duration</span>
          </div>
          <div className="text-3xl font-black text-[#1a2b4b]">60 min</div>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-8 py-6 border-b border-slate-50 flex items-center justify-between">
          <h3 className="font-bold text-[#1a2b4b]">Generated RTB Plans</h3>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-tighter">Archive Mode</span>
        </div>
        <div className="p-0">
          {rtbPlans.length > 0 ? (
            <div className="divide-y divide-slate-50">
              {rtbPlans.map((h) => (
                <div 
                  key={h.id} 
                  onClick={() => setSelectedPlan(h)}
                  className="px-8 py-5 flex items-center justify-between hover:bg-slate-50 transition-colors group cursor-pointer"
                >
                  <div className="flex items-center space-x-4">
                    <div className="bg-indigo-50 p-3 rounded-xl text-indigo-500 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                      <i className="fas fa-file-contract"></i>
                    </div>
                    <div>
                      <p className="font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">{h.title}</p>
                      <p className="text-xs text-slate-400">{h.trade} • {h.level} • {h.schoolName}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right mr-4 hidden sm:block">
                      <p className="text-xs font-bold text-slate-400">Created on</p>
                      <p className="text-xs font-medium text-slate-500">{new Date(h.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        className="p-2 text-slate-400 hover:text-indigo-600 transition-colors"
                        title="View Plan"
                      >
                        <i className="fas fa-eye"></i>
                      </button>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          if(confirm("Are you sure you want to delete this session plan?")) {
                            onDelete(h.id);
                          }
                        }}
                        className="p-2 text-slate-300 hover:text-rose-500 transition-colors"
                        title="Delete Plan"
                      >
                        <i className="fas fa-trash-alt"></i>
                      </button>
                    </div>
                    <i className="fas fa-chevron-right text-slate-200 text-xs group-hover:translate-x-1 transition-transform"></i>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-20 text-center">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <i className="fas fa-file-signature text-slate-200 text-3xl"></i>
              </div>
              <h4 className="text-xl font-bold text-slate-900 mb-2">Start Planning Now</h4>
              <p className="text-slate-500 max-w-sm mx-auto mb-8">Generate your first RTB standard session plan using our AI-driven system.</p>
              <button 
                onClick={() => setView(AppView.RTB_GENERATOR)}
                className="px-8 py-3 bg-[#1a2b4b] text-white font-bold rounded-xl hover:bg-slate-800 transition-all shadow-md"
              >
                Create New Plan
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RTBPlans;
