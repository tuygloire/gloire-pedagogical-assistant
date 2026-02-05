
import React from 'react';
import { AppView, User } from '../types';

interface NavbarProps {
  view: AppView;
  setView: (v: AppView) => void;
  user: User | null;
  onLogout: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ view, setView, user, onLogout }) => {
  const isAuthPage = view === AppView.LANDING || view === AppView.AUTH;

  return (
    <nav className={`sticky top-0 z-[60] w-full transition-all duration-300 ${isAuthPage ? 'bg-white/80 backdrop-blur-md border-b border-slate-200' : 'bg-white border-b border-slate-200'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          {/* Logo Section */}
          <div 
            className="flex items-center space-x-3 cursor-pointer group" 
            onClick={() => setView(user ? AppView.DASHBOARD : AppView.LANDING)}
          >
            <div className="bg-[#1a2b4b] p-2.5 rounded-xl shadow-lg shadow-indigo-100 group-hover:scale-110 transition-transform duration-300">
              <i className="fas fa-graduation-cap text-white text-xl"></i>
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-black text-[#1a2b4b] tracking-tighter leading-none uppercase">
                GLOIRE
              </span>
              <span className="text-[9px] font-black text-slate-400 tracking-[0.2em] uppercase leading-none mt-1">
                Pedagogical Assistant
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="hidden lg:flex items-center space-x-1">
            {!user ? (
              <>
                <button onClick={() => setView(AppView.LANDING)} className={`px-5 py-2 text-sm font-bold uppercase tracking-widest transition-all ${view === AppView.LANDING ? 'text-indigo-600' : 'text-slate-500 hover:text-indigo-600'}`}>Home</button>
                <a href="#features" className="px-5 py-2 text-sm font-bold uppercase tracking-widest text-slate-500 hover:text-indigo-600 transition-all">Features</a>
                <a href="#standards" className="px-5 py-2 text-sm font-bold uppercase tracking-widest text-slate-500 hover:text-indigo-600 transition-all">Standards</a>
              </>
            ) : (
              <>
                <button onClick={() => setView(AppView.DASHBOARD)} className={`px-5 py-2 text-sm font-bold uppercase tracking-widest transition-all ${view === AppView.DASHBOARD ? 'text-indigo-600' : 'text-slate-500 hover:text-indigo-600'}`}>Workspace</button>
                <button onClick={() => setView(AppView.RTB_PLANS)} className={`px-5 py-2 text-sm font-bold uppercase tracking-widest transition-all ${view === AppView.RTB_PLANS ? 'text-indigo-600' : 'text-slate-500 hover:text-indigo-600'}`}>RTB Plans</button>
                <button onClick={() => setView(AppView.SLIDES)} className={`px-5 py-2 text-sm font-bold uppercase tracking-widest transition-all ${view === AppView.SLIDES ? 'text-indigo-600' : 'text-slate-500 hover:text-indigo-600'}`}>Slide Studio</button>
              </>
            )}
          </div>

          {/* Action Area */}
          <div className="flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-4">
                <div className="hidden sm:block text-right">
                  <p className="text-xs font-black text-slate-800 uppercase tracking-tighter">{user.name}</p>
                  <p className="text-[9px] font-bold text-indigo-500 uppercase tracking-widest">{user.role}</p>
                </div>
                <div className="relative group">
                  <button className="h-10 w-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-[#1a2b4b] font-black text-sm hover:bg-indigo-100 transition-all">
                    {user.name.charAt(0).toUpperCase()}
                  </button>
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-2xl border border-slate-100 py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                    <button onClick={() => setView(AppView.HISTORY)} className="w-full text-left px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all flex items-center">
                      <i className="fas fa-history mr-2 text-indigo-400"></i> My History
                    </button>
                    <div className="h-px bg-slate-50 my-1 mx-2"></div>
                    <button onClick={onLogout} className="w-full text-left px-4 py-2 text-xs font-bold text-rose-500 hover:bg-rose-50 transition-all flex items-center">
                      <i className="fas fa-sign-out-alt mr-2"></i> Log Out
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <button 
                  onClick={() => setView(AppView.AUTH)}
                  className="px-6 py-2.5 text-xs font-black uppercase tracking-widest text-[#1a2b4b] hover:text-indigo-600 transition-all"
                >
                  Sign In
                </button>
                <button 
                  onClick={() => setView(AppView.AUTH)}
                  className="bg-[#1a2b4b] text-white px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-black transition-all shadow-xl shadow-indigo-100"
                >
                  Create Account
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
