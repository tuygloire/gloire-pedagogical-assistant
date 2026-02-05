
import React from 'react';

interface HeroProps {
  onStart: () => void;
}

const Hero: React.FC<HeroProps> = ({ onStart }) => {
  return (
    <div className="bg-white overflow-x-hidden">
      {/* 1. HERO SECTION */}
      <section className="relative pt-20 pb-32 lg:pt-32 lg:pb-48">
        {/* Abstract Background Shapes */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full -z-10 overflow-hidden">
          <div className="absolute -top-24 -right-24 w-[600px] h-[600px] bg-indigo-50 rounded-full blur-[120px] opacity-60 animate-pulse"></div>
          <div className="absolute top-1/2 -left-24 w-[400px] h-[400px] bg-blue-50 rounded-full blur-[100px] opacity-40"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="text-center lg:text-left space-y-10 animate-fadeInUp">
              <div className="inline-flex items-center px-4 py-2 rounded-2xl bg-indigo-50 border border-indigo-100">
                <span className="flex h-2 w-2 rounded-full bg-indigo-600 mr-3 animate-ping"></span>
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-700">Nex Gen Pedagogical Portal</span>
              </div>
              
              <h1 className="text-5xl md:text-7xl font-black text-slate-900 leading-[1.05] tracking-tighter">
                Master Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-500">Pedagogy</span> with AI Synthesis.
              </h1>
              
              <p className="text-lg md:text-xl text-slate-500 font-medium leading-relaxed max-w-xl mx-auto lg:mx-0">
                Gloire Assistant synthesizes your manuals, curricula, and chronograms into high-fidelity pedagogical documents in seconds.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-4">
                <button
                  onClick={onStart}
                  className="w-full sm:w-auto px-12 py-5 bg-[#1a2b4b] text-white font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-black transition-all transform hover:scale-105 shadow-2xl shadow-indigo-100"
                >
                  Enter Assistant <i className="fas fa-arrow-right ml-3"></i>
                </button>
                <button
                  onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                  className="w-full sm:w-auto px-10 py-5 bg-white text-slate-600 border border-slate-200 font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-slate-50 transition-all"
                >
                  See How it Works
                </button>
              </div>

              <div className="flex items-center justify-center lg:justify-start space-x-8 pt-8">
                <div className="flex -space-x-3">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="h-10 w-10 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center overflow-hidden">
                      <img src={`https://i.pravatar.cc/150?u=${i + 10}`} alt="user" />
                    </div>
                  ))}
                </div>
                <div className="text-left">
                  <p className="text-sm font-black text-slate-800 leading-none">Global Standard</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">REB & RTB COMPLIANT</p>
                </div>
              </div>
            </div>

            <div className="relative group lg:block">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-[4rem] blur-2xl opacity-10 group-hover:opacity-20 transition-opacity"></div>
              <div className="relative bg-white rounded-[3rem] p-4 shadow-2xl border border-slate-100 transform hover:-rotate-1 transition-transform duration-700">
                <img
                  className="rounded-[2.5rem] w-full h-[500px] object-cover"
                  src="https://images.unsplash.com/photo-1497633762265-9d179a990aa6?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80"
                  alt="Educator dashboard"
                />
                <div className="absolute -bottom-8 -left-8 bg-white p-6 rounded-3xl shadow-2xl border border-slate-50 hidden md:block animate-bounce-slow">
                   <div className="flex items-center space-x-4">
                      <div className="h-12 w-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                         <i className="fas fa-check-double text-xl"></i>
                      </div>
                      <div>
                        <p className="text-xs font-black uppercase tracking-widest text-slate-400">Accuracy</p>
                        <p className="text-sm font-bold text-slate-800">100% Curricula Aligned</p>
                      </div>
                   </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. CORE FEATURES SECTION */}
      <section id="features" className="py-32 bg-slate-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-24">
            <h2 className="text-[11px] font-black uppercase tracking-[0.4em] text-indigo-600">The Assistant</h2>
            <h3 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter">Tools for Educational Excellence.</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {[
              {
                title: "TVET Synthesis",
                desc: "Map Learning Outcomes and Indicative Content directly from your technical curricula into professional plans.",
                icon: "fa-microchip",
                color: "indigo"
              },
              {
                title: "Scheme Designer",
                desc: "Merge chronograms with content to generate 12-week cumulative schemes of work automatically.",
                icon: "fa-calendar-alt",
                color: "blue"
              },
              {
                title: "Assessment Studio",
                desc: "Create exams, quizzes, and homework with page references and marking schemes synthesized instantly.",
                icon: "fa-tasks",
                color: "emerald"
              }
            ].map((f, i) => (
              <div key={i} className="group p-10 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
                <div className={`w-14 h-14 rounded-2xl bg-${f.color}-50 text-${f.color}-600 flex items-center justify-center text-2xl mb-8 group-hover:rotate-12 transition-transform`}>
                  <i className={`fas ${f.icon}`}></i>
                </div>
                <h4 className="text-xl font-black text-slate-900 mb-4">{f.title}</h4>
                <p className="text-slate-500 text-sm leading-relaxed font-medium">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Hero;
