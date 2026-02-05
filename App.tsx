
import React, { useState, useEffect } from 'react';
import { 
  AppView, User, LessonPlan, RTBSessionPlan, Presentation, 
  Homework, SchemeOfWork, CMSResource, SystemStats, GlobalSettings, AuditLog,
  CMSContent, SystemMenu
} from './types';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Generator from './components/Generator';
import SlideGenerator from './components/SlideGenerator';
import RTBGenerator from './components/RTBGenerator';
import RTBPlans from './components/RTBPlans';
import RTBSettings from './components/RTBSettings';
import REBGenerator from './components/REBGenerator';
import REBPlans from './components/REBPlans';
import NurseryGenerator from './components/NurseryGenerator';
import NurseryPlans from './components/NurseryPlans';
import SchemeGenerator from './components/SchemeGenerator';
import SchemePlans from './components/SchemePlans';
import History from './components/History';
import Auth from './components/Auth';
import Footer from './components/Footer';
import Dashboard from './components/Dashboard';
import AssessmentGenerator from './components/HomeworkGenerator';
import AdminPanel from './components/AdminPanel';

// Firebase
import { auth, db } from './services/firebase';
import { onAuthStateChanged, signOut } from "firebase/auth";
import { 
  collection, 
  doc, 
  setDoc, 
  deleteDoc, 
  query, 
  orderBy, 
  onSnapshot, 
  getDoc
} from "firebase/firestore";

const App: React.FC = () => {
  const [view, setView] = useState<AppView>(AppView.LANDING);
  const [user, setUser] = useState<User | null>(null);
  const [history, setHistory] = useState<LessonPlan[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  const [cmsResources, setCmsResources] = useState<CMSResource[]>([]);
  const [cmsContent, setCmsContent] = useState<CMSContent[]>([]);
  const [cmsMenu, setCmsMenu] = useState<SystemMenu[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [systemSettings, setSystemSettings] = useState<GlobalSettings>({
    systemName: 'GLOIRE PEDAGOGICAL ASSISTANT',
    academicYear: '2025-2026',
    currentTerm: 'TERM I',
    maintenanceMode: false,
    registrationOpen: true,
    supportEmail: 'support@nexvecta.com',
    defaultLogoLeft: '',
    defaultLogoRight: '',
    seoTitle: 'Gloire - Smart Pedagogical Tools',
    seoDescription: 'Revolutionizing classroom preparation with AI-driven lesson plans and assessments.',
    facebookUrl: '',
    twitterUrl: '',
    linkedinUrl: '',
    youtubeUrl: '',
    footerText: '© 2025 GLOIRE. Empowering Educators Worldwide.',
    primaryColor: '#1a2b4b',
    faviconUrl: '',
    googleAnalyticsId: ''
  });

  /**
   * NUCLEAR DEEP SANITIZATION:
   * Aggressive circularity protection and non-serializable object filtering.
   * Specifically targets Firebase internal obfuscated class instances.
   */
  const deepSanitize = (obj: any): any => {
    const seen = new WeakSet();
    const BLACKLIST = ['chronogramFile', 'curriculaFile', 'referenceFile'];

    function clean(val: any): any {
      if (val === null || typeof val !== 'object') return val;
      
      // Handle circularity
      if (seen.has(val)) return undefined;
      seen.add(val);

      // Handle Dates & Firestore Timestamps
      if (val instanceof Date) return val.getTime();
      if (val.toDate && typeof val.toDate === 'function') return val.toDate().getTime();

      // Prune DOM elements, Window, and Document
      if (val.nodeType || val instanceof Window || val instanceof Document || (val.constructor && val.constructor.name === 'Window')) {
        return undefined;
      }

      // If it's a complex class instance (likely internal library object), skip it
      if (val.constructor && val.constructor.name !== 'Object' && val.constructor.name !== 'Array') {
        // Only allow plain objects and arrays to prevent internal circular refs from libs like Firebase
        return undefined;
      }

      if (Array.isArray(val)) {
        return val.map(item => clean(item)).filter(item => item !== undefined);
      }

      const result: any = {};
      for (const key in val) {
        if (Object.prototype.hasOwnProperty.call(val, key)) {
          if (BLACKLIST.includes(key)) continue;
          
          const v = val[key];
          // Skip complex types
          if (typeof v === 'function' || typeof v === 'symbol') continue;
          if (key === 'firestore' || key === 'db' || key.startsWith('_')) continue;

          const cleanedValue = clean(v);
          if (cleanedValue !== undefined) {
            result[key] = cleanedValue;
          }
        }
      }
      return result;
    }

    return clean(obj);
  };

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser && firebaseUser.emailVerified) {
        const emailLower = (firebaseUser.email || '').toLowerCase();
        const isAdmin = emailLower.includes('admin') || emailLower === 'admin@demo.com';
        const u: User = {
          id: firebaseUser.uid,
          email: firebaseUser.email || '',
          name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
          role: isAdmin ? 'Super Admin' : 'Teacher',
          status: 'active'
        };
        setUser(u);
        const uid = firebaseUser.uid;
        try {
          const userRef = doc(db, "users", uid);
          const userSnap = await getDoc(userRef);
          if (!userSnap.exists()) await setDoc(userRef, { ...u, createdAt: Date.now() });
        } catch (e) { console.debug("User setup handled."); }

        const unsubHistory = onSnapshot(
          query(collection(db, `users/${uid}/history`), orderBy("createdAt", "desc")), 
          (snap) => setHistory(snap.docs.map(d => deepSanitize(d.data()) as LessonPlan))
        );
        const unsubSettings = onSnapshot(
          doc(db, `users/${uid}/settings`, "global"), 
          (d) => { if (d.exists()) setSystemSettings(deepSanitize(d.data()) as GlobalSettings); }
        );
        const unsubContent = onSnapshot(
          query(collection(db, `users/${uid}/cms_content`), orderBy("createdAt", "desc")), 
          (snap) => setCmsContent(snap.docs.map(d => deepSanitize(d.data()) as CMSContent))
        );
        const unsubResources = onSnapshot(
          query(collection(db, `users/${uid}/cms_resources`), orderBy("createdAt", "desc")), 
          (snap) => setCmsResources(snap.docs.map(d => deepSanitize(d.data()) as CMSResource))
        );
        const unsubMenu = onSnapshot(
          query(collection(db, `users/${uid}/cms_menu`), orderBy("order", "asc")), 
          (snap) => setCmsMenu(snap.docs.map(d => deepSanitize(d.data()) as SystemMenu))
        );
        const unsubLogs = onSnapshot(
          query(collection(db, `users/${uid}/audit_logs`), orderBy("timestamp", "desc")), 
          (snap) => setAuditLogs(snap.docs.map(d => deepSanitize(d.data()) as AuditLog))
        );
        if (view === AppView.LANDING || view === AppView.AUTH) setView(AppView.DASHBOARD);
        return () => { unsubHistory(); unsubSettings(); unsubContent(); unsubResources(); unsubMenu(); unsubLogs(); };
      } else {
        setUser(null);
        setHistory([]);
      }
    });
    return () => unsubscribeAuth();
  }, []);

  const saveLesson = async (lesson: LessonPlan) => {
    if (!user) return;
    const cleanData = deepSanitize({ ...lesson, updatedAt: Date.now() });
    try {
      await setDoc(doc(db, `users/${user.id}/history`, lesson.id), cleanData);
    } catch (err: any) {
      console.error("Persistence Error:", err.message);
      if (err.message?.includes('size')) {
        const fallback = { ...cleanData };
        if (fallback.rows && fallback.rows.length > 10) {
          fallback.rows = fallback.rows.slice(0, 10);
          fallback.isTruncated = true;
        }
        await setDoc(doc(db, `users/${user.id}/history`, lesson.id), fallback);
      }
    }
  };

  const deleteLesson = async (id: string) => {
    if (!user) return;
    await deleteDoc(doc(db, `users/${user.id}/history`, id));
  };

  const trackDownload = async (id: string) => {
    if (!user) return;
    const lesson = history.find(h => h.id === id);
    if (lesson) {
      await setDoc(doc(db, `users/${user.id}/history`, id), { downloads: (lesson.downloads || 0) + 1 }, { merge: true });
    }
  };

  const handleUpdateSettings = async (settings: GlobalSettings) => {
    if (!user) return;
    const cleanSettings = deepSanitize(settings);
    await setDoc(doc(db, `users/${user.id}/settings`, "global"), cleanSettings);
    setSystemSettings(cleanSettings);
  };

  const handleCMSContent = {
    add: async (item: Omit<CMSContent, 'id' | 'createdAt'>) => {
      if (!user) return;
      const id = Math.random().toString(36).substr(2, 9);
      await setDoc(doc(db, `users/${user.id}/cms_content`, id), deepSanitize({ ...item, id, createdAt: Date.now() }));
    },
    update: async (id: string, updates: Partial<CMSContent>) => {
      if (!user) return;
      await setDoc(doc(db, `users/${user.id}/cms_content`, id), deepSanitize(updates), { merge: true });
    },
    delete: async (id: string) => {
      if (!user) return;
      await deleteDoc(doc(db, `users/${user.id}/cms_content`, id));
    }
  };

  const handleCMSMenu = {
    add: async (item: Omit<SystemMenu, 'id'>) => {
      if (!user) return;
      const id = Math.random().toString(36).substr(2, 9);
      await setDoc(doc(db, `users/${user.id}/cms_menu`, id), deepSanitize({ ...item, id }));
    },
    delete: async (id: string) => {
      if (!user) return;
      await deleteDoc(doc(db, `users/${user.id}/cms_menu`, id));
    }
  };

  const handleCMSResource = async (resource: Omit<CMSResource, 'id' | 'createdAt'>) => {
    if (!user) return;
    const id = Math.random().toString(36).substr(2, 9);
    await setDoc(doc(db, `users/${user.id}/cms_resources`, id), deepSanitize({ ...resource, id, createdAt: Date.now() }));
  };

  const systemStats: SystemStats = {
    totalUsers: 1, 
    totalPlans: history.length,
    totalAssessments: history.filter(h => ['homework', 'quiz', 'exam'].includes(h.type || '')).length,
    totalSchemes: history.filter(h => h.type === 'scheme').length,
    totalSlides: history.filter(h => h.type === 'slides').length,
    totalDownloads: history.reduce((sum, h) => sum + (h.downloads || 0), 0),
    activeNow: 1
  };

  const renderViewContent = () => {
    if (!user && view !== AppView.LANDING && view !== AppView.AUTH) return <Auth onLogin={setUser} />;
    switch (view) {
      case AppView.LANDING: return <Hero onStart={() => setView(user ? AppView.DASHBOARD : AppView.AUTH)} />;
      case AppView.AUTH: return <Auth onLogin={setUser} />;
      case AppView.DASHBOARD: return <Dashboard user={user!} history={history} setView={setView} stats={systemStats} onDownload={trackDownload} />;
      case AppView.GENERATOR: return <Generator onSave={saveLesson} />;
      case AppView.RTB_PLANS: return <RTBPlans history={history} setView={setView} onDelete={deleteLesson} onUpdate={saveLesson} />;
      case AppView.RTB_GENERATOR: return <RTBGenerator onSave={saveLesson} onCancel={() => setView(AppView.RTB_PLANS)} />;
      case AppView.RTB_SETTINGS: return <RTBSettings setView={setView} />;
      case AppView.REB_PLANS: return <REBPlans history={history} setView={setView} onDelete={deleteLesson} onUpdate={saveLesson} />;
      case AppView.REB_GENERATOR: return <REBGenerator onSave={saveLesson} onCancel={() => setView(AppView.REB_PLANS)} />;
      case AppView.NURSERY_PLANS: return < NurseryPlans history={history} setView={setView} onDelete={deleteLesson} onUpdate={saveLesson} />;
      case AppView.NURSERY_GENERATOR: return <NurseryGenerator onSave={saveLesson} onCancel={() => setView(AppView.NURSERY_PLANS)} />;
      case AppView.SCHEME_PLANS: return <SchemePlans history={history} setView={setView} onDelete={deleteLesson} onUpdate={saveLesson} />;
      case AppView.SCHEME_GENERATOR: return <SchemeGenerator onSave={saveLesson} onCancel={() => setView(AppView.DASHBOARD)} />;
      case AppView.SLIDES: return <SlideGenerator history={history} onDelete={deleteLesson} onSave={saveLesson} />;
      case AppView.HOMEWORK: return <AssessmentGenerator mode="homework" history={history} onDelete={deleteLesson} onSave={saveLesson} />;
      case AppView.QUIZZES: return <AssessmentGenerator mode="quiz" history={history} onDelete={deleteLesson} onSave={saveLesson} />;
      case AppView.EXAMS: return <AssessmentGenerator mode="exam" history={history} onDelete={deleteLesson} onSave={saveLesson} />;
      case AppView.HISTORY: return <History lessons={history} onDelete={deleteLesson} onUpdate={saveLesson} />;
      case AppView.ADMIN_DASHBOARD: 
      case AppView.ADMIN_USERS:
      case AppView.ADMIN_CMS:
      case AppView.ADMIN_SETTINGS:
        return (
          <AdminPanel 
            mode={view === AppView.ADMIN_USERS ? 'users' : view === AppView.ADMIN_SETTINGS ? 'settings' : view === AppView.ADMIN_CMS ? 'cms' : 'dashboard'}
            stats={systemStats}
            users={user ? [user] : []}
            resources={cmsResources}
            content={cmsContent}
            menu={cmsMenu}
            settings={systemSettings}
            logs={auditLogs}
            onAddUser={() => alert("Restricted.")}
            onUpdateUser={(id, u) => setUser(prev => prev ? {...prev, ...u} : null)}
            onDeleteUser={() => alert("Restricted.")}
            onAddResource={handleCMSResource}
            onDeleteResource={(id) => deleteDoc(doc(db, `users/${user?.id}/cms_resources`, id))}
            onUpdateSettings={handleUpdateSettings}
            onBulkUserStatus={() => alert("Restricted.")}
            onContent={handleCMSContent}
            onMenu={handleCMSMenu}
          />
        );
      default: return <Hero onStart={() => setView(AppView.AUTH)} />;
    }
  };

  const isAuthPage = view === AppView.LANDING || view === AppView.AUTH;

  if (user && !isAuthPage) {
    return (
      <div className="min-h-screen flex bg-[#f8fafc] relative">
        {isSidebarOpen && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setIsSidebarOpen(false)}></div>}
        <Sidebar view={view} setView={(v) => { setView(v); setIsSidebarOpen(false); }} onLogout={() => signOut(auth)} isOpen={isSidebarOpen} userRole={user.role} />
        <div className="flex-grow flex flex-col min-h-screen relative w-full overflow-x-hidden">
          <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-30 no-print">
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="lg:hidden p-2 text-slate-500 rounded-lg"><i className={`fas ${isSidebarOpen ? 'fa-times' : 'fa-bars'} text-xl`}></i></button>
            <div className="flex-grow px-4 font-black text-[#1a2b4b] uppercase text-xs tracking-widest truncate">{view.replace('_', ' ')}</div>
            <div className="flex items-center space-x-3">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-bold text-slate-800">{user.name}</p>
                <p className="text-[9px] text-slate-400 font-black uppercase tracking-tighter">{user.role}</p>
              </div>
              <div className={`h-8 w-8 rounded-lg flex items-center justify-center text-white font-bold text-xs ${user.role === 'Super Admin' ? 'bg-amber-600' : 'bg-[#1a2b4b]'}`}>
                {user.name.charAt(0).toUpperCase()}
              </div>
            </div>
          </header>
          <main className="flex-grow bg-slate-50 print:bg-white overflow-y-auto">
            {renderViewContent()}
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col w-full">
      <Navbar view={view} setView={setView} user={user} onLogout={() => signOut(auth)} />
      <main className="flex-grow">{renderViewContent()}</main>
      <Footer />
    </div>
  );
};

export default App;
