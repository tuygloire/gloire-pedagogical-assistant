
import React, { useState } from 'react';
import { 
  User, CMSResource, SystemStats, UserRole, GlobalSettings, AuditLog, 
  CMSContent, SystemMenu 
} from '../types';
import { generateCMSContent } from '../services/geminiService';

interface AdminPanelProps {
  stats: SystemStats;
  users: User[];
  resources: CMSResource[];
  content: CMSContent[];
  menu: SystemMenu[];
  settings: GlobalSettings;
  logs: AuditLog[];
  onAddUser: (user: Omit<User, 'id'>) => void;
  onUpdateUser: (userId: string, updates: Partial<User>) => void;
  onDeleteUser: (userId: string) => void;
  onAddResource: (resource: Omit<CMSResource, 'id' | 'createdAt'>) => void;
  onDeleteResource: (id: string) => void;
  onUpdateSettings: (settings: GlobalSettings) => void;
  onBulkUserStatus: (status: 'active' | 'deactivated') => void;
  onContent: {
    add: (item: Omit<CMSContent, 'id' | 'createdAt'>) => void;
    update: (id: string, updates: Partial<CMSContent>) => void;
    delete: (id: string) => void;
  };
  onMenu: {
    add: (item: Omit<SystemMenu, 'id'>) => void;
    delete: (id: string) => void;
  };
  mode: 'dashboard' | 'users' | 'cms' | 'reports' | 'settings';
}

const AdminPanel: React.FC<AdminPanelProps> = ({ 
  stats, users, resources, content, menu, settings, logs,
  onAddUser, onUpdateUser, onDeleteUser, onAddResource, onDeleteResource,
  onUpdateSettings, onBulkUserStatus, onContent, onMenu, mode 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [isAddingResource, setIsAddingResource] = useState(false);
  const [cmsTab, setCmsTab] = useState<'posts' | 'pages' | 'menu' | 'announcements' | 'resources'>('posts');
  const [isAddingContent, setIsAddingContent] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  
  const [newUser, setNewUser] = useState<Omit<User, 'id'>>({ name: '', email: '', role: 'Teacher', status: 'active' });
  const [newResource, setNewResource] = useState<Omit<CMSResource, 'id' | 'createdAt'>>({ title: '', type: 'pdf', category: 'General', url: '' });
  const [newContent, setNewContent] = useState<Omit<CMSContent, 'id' | 'createdAt'>>({ 
    title: '', body: '', author: 'Admin', type: 'post', status: 'published', category: 'General', featuredImage: '', attachmentUrl: '' 
  });
  const [newMenuItem, setNewMenuItem] = useState<Omit<SystemMenu, 'id'>>({ label: '', url: '', order: 0, target: '_self' });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, field: 'featuredImage' | 'attachmentUrl') => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { alert("File exceeds 2MB limit for portal storage."); return; }
      const reader = new FileReader();
      reader.onloadend = () => setNewContent(prev => ({ ...prev, [field]: reader.result as string }));
      reader.readAsDataURL(file);
    }
  };

  const handleAiAssist = async () => {
    if (!aiPrompt) return;
    setIsGeneratingAi(true);
    try {
      const result = await generateCMSContent(aiPrompt, cmsTab === 'menu' ? 'page' : cmsTab.slice(0, -1));
      setNewContent(prev => ({ ...prev, title: result.title, body: result.body }));
      setAiPrompt('');
    } catch (err) { alert("AI synthesis failed. Try a simpler prompt."); } finally { setIsGeneratingAi(false); }
  };

  /**
   * Safe backup logic that handles circular structures in administrative exports.
   */
  const handleSystemBackup = () => {
    const data = { users, resources, content, menu, settings, timestamp: Date.now() };
    
    // Circular-safe JSON stringify for the backup file
    const cache = new WeakSet();
    const json = JSON.stringify(data, (key, value) => {
      if (typeof value === 'object' && value !== null) {
        if (cache.has(value)) return undefined;
        cache.add(value);
      }
      return value;
    }, 2);

    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url; link.download = `gloire_backup_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const renderDashboard = () => (
    <div className="space-y-8 animate-fadeIn">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Users', val: stats.totalUsers, icon: 'fa-users', color: 'blue' },
          { label: 'Plans Synthesized', val: stats.totalPlans, icon: 'fa-file-alt', color: 'indigo' },
          { label: 'System Exports', val: stats.totalDownloads, icon: 'fa-download', color: 'emerald' },
          { label: 'Current Term', val: settings.currentTerm, icon: 'fa-calendar-check', color: 'slate', isFull: true }
        ].map(card => (
          <div key={card.label} className={`p-6 rounded-3xl border border-slate-100 shadow-sm ${card.isFull ? 'bg-[#1a2b4b] text-white' : 'bg-white'}`}>
            <div className={`w-10 h-10 rounded-xl mb-4 flex items-center justify-center ${card.isFull ? 'bg-white/10' : `bg-${card.color}-50 text-${card.color}-600`}`}>
              <i className={`fas ${card.icon}`}></i>
            </div>
            <p className={`text-[10px] font-black uppercase tracking-widest ${card.isFull ? 'text-slate-300' : 'text-slate-400'}`}>{card.label}</p>
            <p className="text-2xl font-black mt-1 truncate">{card.val}</p>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-8 py-6 border-b border-slate-50 flex justify-between items-center"><h3 className="font-bold text-[#1a2b4b]">Audit Feed</h3></div>
          <div className="p-8 max-h-[300px] overflow-y-auto custom-scrollbar space-y-4">
            {logs.map(log => (
              <div key={log.id} className="flex gap-4 pb-4 border-b border-slate-50 last:border-0">
                <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-[10px] text-indigo-500 flex-shrink-0"><i className="fas fa-history"></i></div>
                <div><p className="text-xs font-bold text-slate-700">{log.action}</p><p className="text-[9px] text-slate-400 uppercase font-black">{new Date(log.timestamp).toLocaleString()} • {log.adminName}</p></div>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8">
          <h3 className="font-bold text-[#1a2b4b] mb-6">Quick Infrastructure Ops</h3>
          <div className="grid grid-cols-2 gap-4">
            <button onClick={() => onBulkUserStatus('active')} className="p-5 bg-emerald-50 text-emerald-700 rounded-2xl text-left hover:bg-emerald-100 transition-all">
              <i className="fas fa-check-circle text-xl mb-2"></i><p className="font-black text-[10px] uppercase">Activate All</p>
            </button>
            <button onClick={() => onBulkUserStatus('deactivated')} className="p-5 bg-rose-50 text-rose-700 rounded-2xl text-left hover:bg-rose-100 transition-all">
              <i className="fas fa-power-off text-xl mb-2"></i><p className="font-black text-[10px] uppercase">Freeze Portal</p>
            </button>
            <button onClick={handleSystemBackup} className="p-5 bg-blue-50 text-blue-700 rounded-2xl text-left hover:bg-blue-100 transition-all">
              <i className="fas fa-database text-xl mb-2"></i><p className="font-black text-[10px] uppercase">Export Backup</p>
            </button>
            <button onClick={() => setIsAddingUser(true)} className="p-5 bg-slate-50 text-slate-700 rounded-2xl text-left hover:bg-slate-100 transition-all">
              <i className="fas fa-user-plus text-xl mb-2"></i><p className="font-black text-[10px] uppercase">Add Teacher</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderUsers = () => (
    <div className="space-y-8 animate-fadeIn">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
        <div className="relative w-full md:w-96">
          <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-300">
            <i className="fas fa-search"></i>
          </span>
          <input 
            type="text" 
            placeholder="Search teachers by name or email..." 
            className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button 
          onClick={() => setIsAddingUser(true)}
          className="w-full md:w-auto px-8 py-3 bg-[#1a2b4b] text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg hover:bg-black transition-all flex items-center justify-center gap-2"
        >
          <i className="fas fa-user-plus"></i> Add New Teacher
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">User Details</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">System Role</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {users.filter(u => u.name.toLowerCase().includes(searchTerm.toLowerCase()) || u.email.toLowerCase().includes(searchTerm.toLowerCase())).map(u => (
                <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-black text-xs">
                        {u.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-slate-800 text-sm">{u.name}</p>
                        <p className="text-[10px] text-slate-400 font-medium">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${u.role === 'Super Admin' ? 'bg-amber-50 text-amber-600' : 'bg-blue-50 text-blue-600'}`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-8 py-5">
                    <button 
                      onClick={() => onUpdateUser(u.id, { status: u.status === 'active' ? 'deactivated' : 'active' })}
                      className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-widest ${u.status === 'active' ? 'text-emerald-500' : 'text-rose-500'}`}
                    >
                      <i className={`fas fa-circle text-[6px]`}></i>
                      {u.status}
                    </button>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => onDeleteUser(u.id)} className="p-2 text-slate-300 hover:text-rose-500 transition-colors"><i className="fas fa-trash-alt"></i></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isAddingUser && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-[2rem] w-full max-w-md shadow-2xl overflow-hidden animate-slideUp">
            <div className="bg-[#1a2b4b] p-6 text-white">
              <h3 className="text-lg font-black uppercase tracking-tighter">Register New Teacher</h3>
            </div>
            <div className="p-8 space-y-6">
              <div>
                <label className="text-[9px] font-black text-slate-400 uppercase mb-2 block">Full Name</label>
                <input type="text" className="w-full p-3 bg-slate-50 rounded-xl border border-slate-100" value={newUser.name} onChange={e => setNewUser({...newUser, name: e.target.value})} />
              </div>
              <div>
                <label className="text-[9px] font-black text-slate-400 uppercase mb-2 block">Email Address</label>
                <input type="email" className="w-full p-3 bg-slate-50 rounded-xl border border-slate-100" value={newUser.email} onChange={e => setNewUser({...newUser, email: e.target.value})} />
              </div>
              <div>
                <label className="text-[9px] font-black text-slate-400 uppercase mb-2 block">User Role</label>
                <select className="w-full p-3 bg-slate-50 rounded-xl border border-slate-100" value={newUser.role} onChange={e => setNewUser({...newUser, role: e.target.value as UserRole})}>
                  <option value="Teacher">Teacher</option>
                  <option value="Pedagogical Assistant">Pedagogical Assistant</option>
                  <option value="Super Admin">Super Admin</option>
                </select>
              </div>
              <div className="flex gap-3 pt-4">
                <button onClick={() => setIsAddingUser(false)} className="flex-1 py-3 bg-slate-100 text-slate-400 rounded-xl text-[10px] font-black uppercase">Cancel</button>
                <button onClick={() => { onAddUser(newUser); setIsAddingUser(false); setNewUser({name: '', email: '', role: 'Teacher', status: 'active'}); }} className="flex-1 py-3 bg-[#1a2b4b] text-white rounded-xl text-[10px] font-black uppercase shadow-lg">Create User</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderCMS = () => (
    <div className="space-y-8 animate-fadeIn">
      <div className="flex flex-wrap gap-2 border-b border-slate-100 pb-4">
        {['posts', 'pages', 'menu', 'announcements', 'resources'].map(tab => (
          <button key={tab} onClick={() => setCmsTab(tab as any)} className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest ${cmsTab === tab ? 'bg-[#1a2b4b] text-white' : 'bg-slate-100 text-slate-400'}`}>
            {tab}
          </button>
        ))}
      </div>
      <div className="flex justify-between items-center">
        <div><h3 className="text-xl font-bold text-[#1a2b4b] uppercase">{cmsTab} Mgmt</h3><p className="text-slate-400 text-xs mt-1">Design and publish portal content.</p></div>
        <button onClick={() => { setIsAddingContent(true); if(cmsTab === 'resources') setIsAddingResource(true); }} className="px-6 py-2.5 bg-indigo-600 text-white font-black text-[10px] uppercase rounded-xl">Add {cmsTab.slice(0, -1)}</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cmsTab === 'resources' && resources.map(res => (
          <div key={res.id} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm relative group">
            <button onClick={() => onDeleteResource(res.id)} className="absolute top-4 right-4 text-slate-200 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all"><i className="fas fa-trash"></i></button>
            <div className={`w-10 h-10 rounded-xl mb-4 flex items-center justify-center ${res.type === 'pdf' ? 'bg-rose-50 text-rose-500' : 'bg-blue-50 text-blue-500'}`}><i className="fas fa-file"></i></div>
            <h4 className="font-bold text-slate-800 text-sm">{res.title}</h4>
            <p className="text-[9px] font-black text-slate-400 uppercase mt-1">{res.category}</p>
          </div>
        ))}
        {['posts', 'pages', 'announcements'].includes(cmsTab) && content.filter(c => c.type === (cmsTab === 'posts' ? 'post' : (cmsTab === 'pages' ? 'page' : 'announcement'))).map(c => (
          <div key={c.id} className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
            {c.featuredImage && <img src={c.featuredImage} className="h-32 w-full object-cover" alt="" />}
            <div className="p-6">
              <h4 className="font-bold text-slate-800 text-sm">{c.title}</h4>
              <div className="text-[10px] text-slate-400 mt-4 border-t pt-4 flex justify-between items-center">
                <span>{new Date(c.createdAt).toLocaleDateString()}</span>
                <button onClick={() => onContent.delete(c.id)} className="text-rose-500 font-bold uppercase">Delete</button>
              </div>
            </div>
          </div>
        ))}
        {cmsTab === 'menu' && (
          <div className="col-span-full bg-white p-8 rounded-3xl border border-slate-100">
            <div className="space-y-4 mb-8">
              {menu.map(m => (
                <div key={m.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="flex items-center gap-4"><span className="w-8 h-8 rounded bg-white flex items-center justify-center font-bold text-xs">{m.order}</span><p className="font-bold text-sm">{m.label}</p></div>
                  <button onClick={() => onMenu.delete(m.id)} className="text-slate-300 hover:text-rose-500"><i className="fas fa-times-circle"></i></button>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 p-6 bg-indigo-50/30 rounded-3xl">
              <input type="text" placeholder="Label" className="p-3 rounded-xl border border-indigo-100 text-xs" value={newMenuItem.label} onChange={e => setNewMenuItem({...newMenuItem, label: e.target.value})} />
              <input type="text" placeholder="URL" className="p-3 rounded-xl border border-indigo-100 text-xs" value={newMenuItem.url} onChange={e => setNewMenuItem({...newMenuItem, url: e.target.value})} />
              <input type="number" placeholder="Sort" className="p-3 rounded-xl border border-indigo-100 text-xs" value={newMenuItem.order} onChange={e => setNewMenuItem({...newMenuItem, order: parseInt(e.target.value) || 0})} />
              <button onClick={() => { if(newMenuItem.label) { onMenu.add(newMenuItem); setNewMenuItem({label:'', url:'', order:0, target:'_self'}); } }} className="bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase">Add Link</button>
            </div>
          </div>
        )}
      </div>

      {isAddingContent && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-[2rem] w-full max-w-5xl max-h-[90vh] shadow-2xl flex flex-col overflow-hidden animate-slideUp">
            <div className="bg-[#1a2b4b] p-6 text-white flex justify-between items-center">
              <div><h3 className="text-lg font-black uppercase tracking-tighter">Content Studio</h3><p className="text-xs text-blue-200">Compose with AI-Assisted Synthesis</p></div>
              <button onClick={() => setIsAddingContent(false)} className="text-white/40 hover:text-white transition-colors"><i className="fas fa-times text-xl"></i></button>
            </div>
            <div className="p-8 overflow-y-auto flex-grow space-y-8">
              <div className="bg-indigo-50 p-6 rounded-2xl space-y-4">
                <p className="text-[10px] font-black uppercase text-indigo-700 tracking-widest flex items-center gap-2"><i className="fas fa-magic"></i> AI Pedagogy Assistant</p>
                <div className="flex gap-4">
                  <input type="text" placeholder="E.g. A blog post about how to use ChatGPT for grading math homework." className="flex-grow p-4 bg-white rounded-xl text-sm border-none outline-none ring-1 ring-indigo-200 focus:ring-2 focus:ring-indigo-400" value={aiPrompt} onChange={e => setAiPrompt(e.target.value)} />
                  <button onClick={handleAiAssist} disabled={isGeneratingAi} className="px-6 bg-indigo-600 text-white rounded-xl font-black text-[10px] uppercase flex items-center gap-2 disabled:bg-slate-300">
                    {isGeneratingAi ? <i className="fas fa-sync fa-spin"></i> : <i className="fas fa-wand-magic-sparkles"></i>} <span>Generate</span>
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                  <div><label className="text-[9px] font-black uppercase text-slate-400 mb-1 block">Subject Line / Title</label><input type="text" className="w-full p-4 bg-slate-50 border-none rounded-xl font-bold" value={newContent.title} onChange={e => setNewContent({...newContent, title: e.target.value})} /></div>
                  <div><label className="text-[9px] font-black uppercase text-slate-400 mb-1 block">Body (HTML Supported)</label><textarea className="w-full h-80 p-6 bg-slate-50 rounded-2xl font-mono text-xs" value={newContent.body} onChange={e => setNewContent({...newContent, body: e.target.value})} /></div>
                </div>
                <div className="space-y-6">
                  <div>
                    <label className="text-[9px] font-black uppercase text-slate-400 mb-2 block">Visual Banner</label>
                    <div className="h-32 border-2 border-dashed border-slate-200 rounded-2xl flex items-center justify-center relative overflow-hidden bg-slate-50">
                      <input type="file" accept="image/*" onChange={e => handleFileUpload(e, 'featuredImage')} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                      {newContent.featuredImage ? <img src={newContent.featuredImage} className="w-full h-full object-cover" /> : <i className="fas fa-image text-slate-300 text-2xl"></i>}
                    </div>
                  </div>
                  <div>
                    <label className="text-[9px] font-black uppercase text-slate-400 mb-2 block">Downloadable Asset</label>
                    <div className="p-4 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50 flex items-center gap-3 relative">
                      <input type="file" onChange={e => handleFileUpload(e, 'attachmentUrl')} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                      <i className="fas fa-paperclip text-slate-300"></i><span className="text-[9px] font-bold text-slate-400 truncate">{newContent.attachmentUrl ? 'Document Attached' : 'Click to upload'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="p-6 border-t flex justify-end gap-3 bg-slate-50/50">
              <button onClick={() => setIsAddingContent(false)} className="px-8 py-3 text-[10px] font-bold uppercase text-slate-400">Cancel</button>
              <button onClick={() => { onContent.add(newContent); setIsAddingContent(false); }} className="px-12 py-3 bg-[#1a2b4b] text-white rounded-xl text-[10px] font-black uppercase shadow-xl">Publish Portal Content</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderSettings = () => (
    <div className="space-y-8 animate-fadeIn max-w-5xl">
      <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm space-y-12">
        <h3 className="text-2xl font-black text-[#1a2b4b] uppercase tracking-tighter">Global System Config</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="space-y-6">
            <h4 className="text-[10px] font-black text-indigo-600 uppercase tracking-widest"><i className="fas fa-id-card mr-2"></i> Identity</h4>
            <div><label className="text-[10px] font-bold text-slate-400 mb-1 block uppercase">System Title</label><input type="text" className="w-full p-3 bg-slate-50 rounded-xl" value={settings.systemName} onChange={e => onUpdateSettings({...settings, systemName: e.target.value})} /></div>
            <div><label className="text-[10px] font-bold text-slate-400 mb-1 block uppercase">Support Endpoint</label><input type="email" className="w-full p-3 bg-slate-50 rounded-xl" value={settings.supportEmail} onChange={e => onUpdateSettings({...settings, supportEmail: e.target.value})} /></div>
          </div>
          <div className="space-y-6">
            <h4 className="text-[10px] font-black text-indigo-600 uppercase tracking-widest"><i className="fas fa-search mr-2"></i> SEO & Analytics</h4>
            <div><label className="text-[10px] font-bold text-slate-400 mb-1 block uppercase">Portal SEO Title</label><input type="text" className="w-full p-3 bg-slate-50 rounded-xl" value={settings.seoTitle} onChange={e => onUpdateSettings({...settings, seoTitle: e.target.value})} /></div>
            <div><label className="text-[10px] font-bold text-slate-400 mb-1 block uppercase">Tracking ID (GA4)</label><input type="text" className="w-full p-3 bg-slate-50 rounded-xl" placeholder="G-XXXXXXXX" value={settings.googleAnalyticsId} onChange={e => onUpdateSettings({...settings, googleAnalyticsId: e.target.value})} /></div>
          </div>
        </div>
        <div className="pt-8 border-t border-slate-50">
          <h4 className="text-[10px] font-black text-rose-600 uppercase tracking-widest mb-6"><i className="fas fa-shield-halved mr-2"></i> Portal Access Controls</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="p-6 bg-emerald-50 rounded-2xl flex justify-between items-center">
              <div><p className="font-bold text-sm">Public Registration</p><p className="text-[9px] text-slate-400">Allow new teachers to join</p></div>
              <button onClick={() => onUpdateSettings({...settings, registrationOpen: !settings.registrationOpen})} className={`w-12 h-6 rounded-full relative ${settings.registrationOpen ? 'bg-emerald-500' : 'bg-slate-300'}`}><div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${settings.registrationOpen ? 'right-1' : 'left-1'}`}></div></button>
            </div>
            <div className="p-6 bg-rose-50 rounded-2xl flex justify-between items-center">
              <div><p className="font-bold text-sm">Maintenance Mode</p><p className="text-[9px] text-slate-400">Lock portal for maintenance</p></div>
              <button onClick={() => onUpdateSettings({...settings, maintenanceMode: !settings.maintenanceMode})} className={`w-12 h-6 rounded-full relative ${settings.maintenanceMode ? 'bg-rose-500' : 'bg-slate-300'}`}><div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${settings.maintenanceMode ? 'right-1' : 'left-1'}`}></div></button>
            </div>
          </div>
        </div>
        <div className="flex justify-end pt-8"><button onClick={() => { onUpdateSettings(settings); alert('Global configurations saved.'); }} className="px-12 py-4 bg-[#1a2b4b] text-white rounded-[2rem] font-black text-xs uppercase shadow-2xl hover:scale-105 transition-all">Save Portal Config</button></div>
      </div>
    </div>
  );

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto min-h-screen">
      <div className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div><h2 className="text-4xl font-black text-[#1a2b4b] uppercase tracking-tighter leading-none">{mode.replace('_', ' ')}</h2><p className="text-slate-500 mt-2 font-medium">Portal Control Center</p></div>
        <div className="px-4 py-2 bg-white rounded-xl border border-slate-100 shadow-sm text-[10px] font-black text-slate-400">STABLE BUILD 2.5.3</div>
      </div>
      {mode === 'dashboard' && renderDashboard()}
      {mode === 'users' && renderUsers()}
      {mode === 'cms' && renderCMS()}
      {mode === 'settings' && renderSettings()}
    </div>
  );
};

export default AdminPanel;
