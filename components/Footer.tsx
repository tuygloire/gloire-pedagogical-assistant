
import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-400 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center text-white mb-4">
              <div className="bg-indigo-600 p-2 rounded-lg mr-2">
                <i className="fas fa-graduation-cap text-white text-xl"></i>
              </div>
              <span className="text-xl font-black uppercase tracking-tight">GLOIRE PEDAGOGICAL ASSISTANT</span>
            </div>
            <p className="text-sm leading-relaxed max-w-sm">
              Helping educators worldwide save time and deliver better learning experiences through intelligent, AI-driven lesson planning.
            </p>
          </div>
          
          <div>
            <h4 className="text-white font-bold mb-4">Platform</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-indigo-400 transition-colors">Lesson Generator</a></li>
              <li><a href="#" className="hover:text-indigo-400 transition-colors">Pricing</a></li>
              <li><a href="#" className="hover:text-indigo-400 transition-colors">Case Studies</a></li>
              <li><a href="#" className="hover:text-indigo-400 transition-colors">Resources</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-4">Connect</h4>
            <div className="flex space-x-4 mb-4">
              <a href="#" className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center hover:bg-indigo-600 transition-all text-white">
                <i className="fab fa-twitter"></i>
              </a>
              <a href="#" className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center hover:bg-indigo-600 transition-all text-white">
                <i className="fab fa-linkedin-in"></i>
              </a>
              <a href="#" className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center hover:bg-indigo-600 transition-all text-white">
                <i className="fab fa-facebook-f"></i>
              </a>
            </div>
            <p className="text-xs">© 2024 GLOIRE PEDAGOGICAL ASSISTANT. All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
