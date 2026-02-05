
import React from 'react';
import { AppView, LessonPlan, User, SystemStats } from '../types';

interface DashboardProps {
  user: User;
  history: LessonPlan[];
  setView: (v: AppView) => void;
  stats: SystemStats;
  onDownload: (id: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ user, history, setView, stats, onDownload }) => {
  return (
    <div className="p-4 sm:p-8 max-w-6xl mx-auto space-y-8 sm:space-y-12 animate-fadeIn">
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-black text-[#1a2b4b] uppercase tracking-tighter">
            Bonjour, {user.name.split(' ')[0]}
          </h1>
          <p className="text-slate-500 mt-2 font-medium">Your pedagogical activity summary for the current academic cycle.</p>
        </div>
        <div className="px-5 py-2.5 bg-indigo-50 border border-indigo-100 rounded-2xl flex items-center space-x-3">
          <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></div>
          <span className="text-[10px] font-black uppercase text-indigo-700 tracking-widest">Active Session</span>
        </div>
      </div>

      {/* High-Impact Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center space-x-4 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <i className="fas fa-file-invoice text-xl"></i>
            </div>
            <div>
              <p className="text-2xl font-black text-[#1a2b4b] leading-none">{stats.totalPlans}</p>
              <p className="text-[10px] font-black uppercase text-slate-400 mt-1 tracking-widest">Plans Generated</p>
            </div>
          </div>
          <div className="w-full bg-slate-50 h-1.5 rounded-full overflow-hidden">
            <div className="bg-blue-600 h-full w-[85%] rounded-full"></div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center space-x-4 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <i className="fas fa-tasks text-xl"></i>
            </div>
            <div>
              <p className="text-2xl font-black text-[#1a2b4b] leading-none">{stats.totalAssessments}</p>
              <p className="text-[10px] font-black uppercase text-slate-400 mt-1 tracking-widest">Assessments</p>
            </div>
          </div>
          <div className="w-full bg-slate-50 h-1.5 rounded-full overflow-hidden">
            <div className="bg-emerald-600 h-full w-[42%] rounded-full"></div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center space-x-4 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <i className="fas fa-calendar-alt text-xl"></i>
            </div>
            <div>
              <p className="text-2xl font-black text-[#1a2b4b] leading-none">{stats.totalSchemes}</p>
              <p className="text-[10px] font-black uppercase text-slate-400 mt-1 tracking-widest">Termly Schemes</p>
            </div>
          </div>
          <div className="w-full bg-slate-50 h-1.5 rounded-full overflow-hidden">
            <div className="bg-amber-600 h-full w-[15%] rounded-full"></div>
          </div>
        </div>

        <div className="bg-[#1a2b4b] p-6 rounded-3xl shadow-xl shadow-indigo-100">
          <div className="flex items-center space-x-4 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-white/10 text-white flex items-center justify-center">
              <i className="fas fa-download text-xl"></i>
            </div>
            <div>
              <p className="text-2xl font-black text-white leading-none">{stats.totalDownloads}</p>
              <p className="text-[10px] font-black uppercase text-blue-200 mt-1 tracking-widest">Exports Performed</p>
            </div>
          </div>
          <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
            <div className="bg-blue-400 h-full w-[70%] rounded-full"></div>
          </div>
        </div>
      </div>

      {/* Main Vision Card */}
      <div className="bg-gradient-to-br from-[#1a2b4b] to-[#0a1529] rounded-[3rem] p-10 flex flex-col lg:flex-row items-center justify-between shadow-2xl relative overflow-hidden group">
        <div className="absolute inset-0 opacity-10 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
        
        <div className="flex items-center space-x-8 relative z-10 w-full lg:w-auto">
          <div className="bg-white/10 p-6 rounded-[2rem] border border-white/20 backdrop-blur-md transform group-hover:scale-110 transition-transform duration-500 shadow-2xl">
            <i className="fas fa-rocket text-4xl text-blue-400"></i>
          </div>
          <div>
            <h2 className="text-3xl font-black text-white uppercase tracking-tighter leading-none">Global Pedagogy</h2>
            <p className="text-blue-200/60 font-medium text-lg mt-2">Standardized Excellence for African Classrooms.</p>
          </div>
        </div>

        <div className="mt-10 lg:mt-0 flex flex-wrap gap-4 relative z-10 justify-center">
          {[
            { label: 'RTB SESSION', view: AppView.RTB_GENERATOR, color: 'emerald' },
            { label: 'REB LESSON', view: AppView.REB_GENERATOR, color: 'blue' },
            { label: 'SCHEME', view: AppView.SCHEME_GENERATOR, color: 'amber' },
            { label: 'SLIDES', view: AppView.SLIDES, color: 'indigo' },
          ].map((action) => (
            <button 
              key={action.label}
              onClick={() => setView(action.view)}
              className={`px-8 py-3 bg-white/5 hover:bg-white/20 text-white font-black text-[10px] uppercase tracking-widest border border-white/10 rounded-2xl transition-all hover:scale-105 active:scale-95 backdrop-blur-sm`}
            >
              {action.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent History Table */}
        <div className="lg:col-span-2 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-8 py-6 border-b border-slate-50 flex items-center justify-between">
            <h3 className="font-bold text-[#1a2b4b] uppercase tracking-tighter">Recent Documents</h3>
            <button 
              onClick={() => setView(AppView.HISTORY)}
              className="text-[10px] font-black uppercase text-blue-600 hover:text-blue-800 tracking-widest"
            >
              View Archive <i className="fas fa-arrow-right ml-1"></i>
            </button>
          </div>
          <div className="p-0">
            {history.length > 0 ? (
              <div className="divide-y divide-slate-50">
                {history.slice(0, 6).map((h) => (
                  <div key={h.id} className="px-8 py-5 flex items-center justify-between hover:bg-slate-50 transition-colors">
                    <div className="flex items-center space-x-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xs ${
                        h.type === 'rtb' ? 'bg-emerald-50 text-emerald-600' :
                        h.type === 'exam' ? 'bg-rose-50 text-rose-600' :
                        h.type === 'scheme' ? 'bg-amber-50 text-amber-600' : 'bg-slate-50 text-slate-500'
                      }`}>
                        <i className={`fas ${
                          h.type === 'rtb' ? 'fa-file-contract' :
                          h.type === 'exam' ? 'fa-file-signature' :
                          h.type === 'scheme' ? 'fa-calendar-check' : 'fa-file-alt'
                        }`}></i>
                      </div>
                      <div>
                        <p className="font-bold text-slate-800 text-sm line-clamp-1">{h.title}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{h.subject} • {h.type?.toUpperCase() || 'PLAN'}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-6">
                       <div className="hidden sm:block text-right">
                          <p className="text-[10px] font-black text-[#1a2b4b] uppercase tracking-widest">{h.downloads || 0} EXPORTS</p>
                          <p className="text-[9px] text-slate-400 font-bold uppercase">{new Date(h.createdAt).toLocaleDateString()}</p>
                       </div>
                       <button 
                        onClick={() => { setView(AppView.HISTORY); onDownload(h.id); }}
                        className="p-2.5 text-slate-300 hover:text-blue-600 transition-colors"
                       >
                         <i className="fas fa-chevron-right"></i>
                       </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-24 text-center">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                   <i className="fas fa-ghost text-slate-200 text-2xl"></i>
                </div>
                <p className="text-[11px] font-black uppercase text-slate-400 tracking-widest">Activity Feed Empty</p>
              </div>
            )}
          </div>
        </div>

        {/* Support & Community Card */}
        <div className="space-y-6">
           <div className="bg-[#e9f7f0] border border-emerald-100 rounded-[2.5rem] p-8 group hover:shadow-xl transition-all">
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-2xl mb-6 shadow-sm group-hover:rotate-12 transition-transform">
                🌍
              </div>
              <h3 className="text-xl font-bold text-emerald-900 leading-tight">Missing your country's format?</h3>
              <p className="text-emerald-700 text-sm mt-3 font-medium leading-relaxed">Send us a sample. Our synthesis engine updates every Friday with new regional pedagogical standards.</p>
              <button className="mt-8 w-full py-3.5 bg-emerald-600 text-white font-black uppercase text-[10px] tracking-widest rounded-xl hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200">
                Contact Support
              </button>
           </div>

           <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">System Broadcast</h4>
              <div className="space-y-4">
                 <div className="p-4 bg-slate-50 rounded-2xl border-l-4 border-indigo-500">
                    <p className="text-xs font-bold text-slate-800">Version 2.5.0 Deployment</p>
                    <p className="text-[10px] text-slate-500 mt-1">High-fidelity RTB synthesis is now live for L3-L5 trades.</p>
                 </div>
                 <div className="p-4 bg-slate-50 rounded-2xl border-l-4 border-amber-500">
                    <p className="text-xs font-bold text-slate-800">Term II Schemes Active</p>
                    <p className="text-[10px] text-slate-500 mt-1">Teachers can now bridge cumulative learning to Term II.</p>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
