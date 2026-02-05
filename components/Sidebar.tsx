
import React, { useState } from 'react';
import { AppView, UserRole } from '../types';

interface SidebarProps {
  view: AppView;
  setView: (v: AppView) => void;
  onLogout: () => void;
  isOpen: boolean;
  userRole?: UserRole;
}

const Sidebar: React.FC<SidebarProps> = ({ view, setView, onLogout, isOpen, userRole = 'Teacher' }) => {
  const [isRwandaOpen, setIsRwandaOpen] = useState(true);
  const [isLessonPlansOpen, setIsLessonPlansOpen] = useState(true);
  const [isAssessmentOpen, setIsAssessmentOpen] = useState(true);
  const [isAdminOpen, setIsAdminOpen] = useState(true);

  const isAdmin = userRole === 'Super Admin' || userRole === 'Pedagogical Assistant';

  const navItemClass = (itemView: AppView) => 
    `flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 cursor-pointer ${
      view === itemView 
        ? 'bg-blue-600/30 text-white font-semibold border-l-4 border-blue-400' 
        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
    }`;

  const adminNavItemClass = (itemView: AppView) => 
    `flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 cursor-pointer ${
      view === itemView 
        ? 'bg-amber-600/30 text-amber-200 font-semibold border-l-4 border-amber-400' 
        : 'text-slate-400 hover:bg-slate-800 hover:text-white'
    }`;

  const subNavItemClass = (itemView: AppView) => `flex items-center space-x-3 px-4 py-2 ml-4 rounded-lg text-sm transition-colors cursor-pointer ${
    view === itemView ? 'text-white bg-slate-800' : 'text-slate-400 hover:text-white hover:bg-slate-800'
  }`;

  return (
    <aside className={`
      fixed lg:sticky top-0 left-0 h-full lg:h-screen w-64 bg-[#1a2b4b] flex flex-col border-r border-slate-700/50 z-50 no-print transition-transform duration-300 transform
      ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
    `}>
      <div className="p-6 flex items-center space-x-3">
        <div className="bg-white p-1.5 rounded-lg shadow-inner">
          <i className="fas fa-book-open text-[#1a2b4b]"></i>
        </div>
        <span className="text-sm font-black text-white tracking-tighter leading-tight uppercase">GLOIRE PEDAGOGICAL ASSISTANT</span>
      </div>

      <nav className="flex-grow px-3 space-y-1 overflow-y-auto custom-scrollbar">
        {isAdmin && (
          <div className="mb-4">
            <div 
              onClick={() => setIsAdminOpen(!isAdminOpen)}
              className="flex items-center justify-between px-4 py-2 text-[10px] font-black text-amber-400 uppercase tracking-widest cursor-pointer hover:text-amber-300"
            >
              <span>Admin Panel</span>
              <i className={`fas fa-chevron-${isAdminOpen ? 'down' : 'right'}`}></i>
            </div>
            {isAdminOpen && (
              <div className="space-y-1 mt-1">
                <div onClick={() => setView(AppView.ADMIN_DASHBOARD)} className={adminNavItemClass(AppView.ADMIN_DASHBOARD)}>
                  <i className="fas fa-chart-line w-5 text-center"></i>
                  <span>Admin Hub</span>
                </div>
                <div onClick={() => setView(AppView.ADMIN_USERS)} className={adminNavItemClass(AppView.ADMIN_USERS)}>
                  <i className="fas fa-user-shield w-5 text-center"></i>
                  <span>User Mgmt</span>
                </div>
                <div onClick={() => setView(AppView.ADMIN_CMS)} className={adminNavItemClass(AppView.ADMIN_CMS)}>
                  <i className="fas fa-folder-open w-5 text-center"></i>
                  <span>Resources</span>
                </div>
                <div onClick={() => setView(AppView.ADMIN_SETTINGS)} className={adminNavItemClass(AppView.ADMIN_SETTINGS)}>
                  <i className="fas fa-tools w-5 text-center"></i>
                  <span>Settings</span>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-4 py-2">Workspace</div>

        <div onClick={() => setView(AppView.DASHBOARD)} className={navItemClass(AppView.DASHBOARD)}>
          <i className="fas fa-th-large w-5 text-center"></i>
          <span>Dashboard</span>
        </div>

        <div onClick={() => setView(AppView.SLIDES)} className={navItemClass(AppView.SLIDES)}>
          <i className="fas fa-desktop w-5 text-center"></i>
          <span>Presentation Slides</span>
        </div>

        <div onClick={() => setView(AppView.RTB_SETTINGS)} className={navItemClass(AppView.RTB_SETTINGS)}>
          <i className="fas fa-cog w-5 text-center"></i>
          <span>RTB Global Settings</span>
        </div>

        <div>
          <div 
            onClick={() => setIsAssessmentOpen(!isAssessmentOpen)}
            className="flex items-center justify-between px-4 py-3 text-slate-300 hover:bg-slate-800 rounded-lg cursor-pointer transition-colors"
          >
            <div className="flex items-center space-x-3">
              <i className="fas fa-tasks w-5 text-center"></i>
              <span>Assessments</span>
            </div>
            <i className={`fas fa-chevron-${isAssessmentOpen ? 'down' : 'right'} text-[10px]`}></i>
          </div>

          {isAssessmentOpen && (
            <div className="mt-1 space-y-1">
              <div onClick={() => setView(AppView.HOMEWORK)} className={subNavItemClass(AppView.HOMEWORK)}>
                <i className="fas fa-home w-4 text-center"></i>
                <span>Homework</span>
              </div>
              <div onClick={() => setView(AppView.QUIZZES)} className={subNavItemClass(AppView.QUIZZES)}>
                <i className="fas fa-vial w-4 text-center"></i>
                <span>Quiz (Assessment)</span>
              </div>
              <div onClick={() => setView(AppView.EXAMS)} className={subNavItemClass(AppView.EXAMS)}>
                <i className="fas fa-file-signature w-4 text-center"></i>
                <span>Exams</span>
              </div>
            </div>
          )}
        </div>

        <div onClick={() => setView(AppView.SCHEME_PLANS)} className={navItemClass(AppView.SCHEME_PLANS)}>
          <i className="fas fa-calendar-alt w-5 text-center"></i>
          <span>Scheme of Work</span>
        </div>

        <div>
          <div 
            onClick={() => setIsLessonPlansOpen(!isLessonPlansOpen)}
            className="flex items-center justify-between px-4 py-3 text-slate-300 hover:bg-slate-800 rounded-lg cursor-pointer transition-colors"
          >
            <div className="flex items-center space-x-3">
              <i className="fas fa-file-alt w-5 text-center"></i>
              <span>Lesson Plans</span>
            </div>
            <i className={`fas fa-chevron-${isLessonPlansOpen ? 'down' : 'right'} text-[10px]`}></i>
          </div>

          {isLessonPlansOpen && (
            <div className="mt-1 space-y-1">
              <div>
                <div 
                  onClick={() => setIsRwandaOpen(!isRwandaOpen)}
                  className="flex items-center justify-between px-4 py-2 ml-2 text-xs font-bold text-slate-500 uppercase tracking-widest cursor-pointer hover:text-slate-300 transition-colors"
                >
                  <div className="flex items-center">
                    <span className="mr-2">RW</span>
                    <span>Rwanda</span>
                  </div>
                  <i className={`fas fa-chevron-${isRwandaOpen ? 'down' : 'right'} text-[8px]`}></i>
                </div>
                
                {isRwandaOpen && (
                  <div className="space-y-1">
                    <div onClick={() => setView(AppView.RTB_PLANS)} className={subNavItemClass(AppView.RTB_PLANS)}>
                      <i className="far fa-file-alt w-4 text-center"></i>
                      <span>RTB Session Plan</span>
                    </div>
                    <div onClick={() => setView(AppView.REB_PLANS)} className={subNavItemClass(AppView.REB_PLANS)}>
                      <i className="far fa-file-alt w-4 text-center"></i>
                      <span>REB Lesson Plans</span>
                    </div>
                    <div onClick={() => setView(AppView.NURSERY_PLANS)} className={subNavItemClass(AppView.NURSERY_PLANS)}>
                      <i className="far fa-file-alt w-4 text-center"></i>
                      <span>Nursery Lesson Plans</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </nav>

      <div className="p-4 border-t border-slate-700/50">
        <button 
          onClick={onLogout}
          className="w-full flex items-center space-x-3 px-4 py-3 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
        >
          <i className="fas fa-sign-out-alt"></i>
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
