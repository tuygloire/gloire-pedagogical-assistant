
import React, { useState, useEffect } from 'react';
import { AppView, RTBDefaultSettings } from '../types';

interface RTBSettingsProps {
  setView: (v: AppView) => void;
}

const RTBSettings: React.FC<RTBSettingsProps> = ({ setView }) => {
  const [settings, setSettings] = useState<RTBDefaultSettings>({
    schoolName: '',
    trainerName: '',
    trade: '',
    academicYear: '2025-2026',
    province: '',
    district: '',
    sector: '',
    level: 'Level 3',
    term: 'Term 1',
    schoolAddress: '',
    schoolPhone: '',
    schoolEmail: '',
    schoolLogoLeft: '',
    schoolLogoRight: '',
    schoolCode: '',
    additionalInfo: ''
  });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    try {
      const savedSettings = localStorage.getItem('rtb_default_settings');
      if (savedSettings) {
        setSettings(JSON.parse(savedSettings));
      }
    } catch (e) {
      console.warn("Settings could not be loaded from local storage.");
    }
  }, []);

  /**
   * Safe stringify that handles potential circularity by skipping repeated objects.
   */
  const safeJsonStringify = (obj: any) => {
    const cache = new WeakSet();
    return JSON.stringify(obj, (key, value) => {
      if (typeof value === 'object' && value !== null) {
        if (cache.has(value)) return undefined;
        cache.add(value);
      }
      return value;
    });
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Use circular-safe stringification for local storage
      const json = safeJsonStringify(settings);
      localStorage.setItem('rtb_default_settings', json);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error("Failed to persist settings:", err);
      alert("System could not save your settings due to data size or complexity.");
    }
  };

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete all saved settings?")) {
      localStorage.removeItem('rtb_default_settings');
      setSettings({
        schoolName: '',
        trainerName: '',
        trade: '',
        academicYear: '2025-2026',
        province: '',
        district: '',
        sector: '',
        level: 'Level 3',
        term: 'Term 1',
        schoolAddress: '',
        schoolPhone: '',
        schoolEmail: '',
        schoolLogoLeft: '',
        schoolLogoRight: '',
        schoolCode: '',
        additionalInfo: ''
      });
    }
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>, side: 'Left' | 'Right') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSettings(prev => ({ 
          ...prev, 
          [side === 'Left' ? 'schoolLogoLeft' : 'schoolLogoRight']: reader.result as string 
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const inputClass = "w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm";
  const labelClass = "block text-sm font-bold text-slate-700 mb-2";

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 sm:py-12">
      <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100">
        <form onSubmit={handleSave} className="p-6 sm:p-10 space-y-8">
          <div>
            <h2 className="text-2xl font-bold text-indigo-900 mb-1">RTB Global Settings</h2>
            <p className="text-sm text-slate-500 mb-8">Set defaults for all your pedagogical documents. Logos and school names will persist across Session Plans and Schemes of Work.</p>
            
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <label className={labelClass}>Left Logo (e.g., RTB/National)</label>
                  <div className="flex flex-col space-y-3">
                    <div className="flex items-center space-x-3">
                      <input 
                        type="file" 
                        accept="image/*"
                        onChange={(e) => handleLogoChange(e, 'Left')}
                        className="block w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200 transition-all border border-slate-200 rounded-xl bg-slate-50/50 p-1"
                      />
                      {settings.schoolLogoLeft && (
                        <div className="relative w-12 h-12 bg-slate-50 border border-slate-200 rounded-lg overflow-hidden flex-shrink-0">
                          <img src={settings.schoolLogoLeft} alt="Logo Left" className="w-full h-full object-contain" />
                          <button 
                            type="button"
                            onClick={() => setSettings(p => ({ ...p, schoolLogoLeft: '' }))}
                            className="absolute inset-0 bg-black/40 flex items-center justify-center text-white opacity-0 hover:opacity-100 transition-opacity"
                          >
                            <i className="fas fa-times text-xs"></i>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <label className={labelClass}>Right Logo (e.g., School/Trade)</label>
                  <div className="flex flex-col space-y-3">
                    <div className="flex items-center space-x-3">
                      <input 
                        type="file" 
                        accept="image/*"
                        onChange={(e) => handleLogoChange(e, 'Right')}
                        className="block w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200 transition-all border border-slate-200 rounded-xl bg-slate-50/50 p-1"
                      />
                      {settings.schoolLogoRight && (
                        <div className="relative w-12 h-12 bg-slate-50 border border-slate-200 rounded-lg overflow-hidden flex-shrink-0">
                          <img src={settings.schoolLogoRight} alt="Logo Right" className="w-full h-full object-contain" />
                          <button 
                            type="button"
                            onClick={() => setSettings(p => ({ ...p, schoolLogoRight: '' }))}
                            className="absolute inset-0 bg-black/40 flex items-center justify-center text-white opacity-0 hover:opacity-100 transition-opacity"
                          >
                            <i className="fas fa-times text-xs"></i>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className={labelClass}>District</label>
                  <input type="text" required value={settings.district} onChange={e => setSettings({...settings, district: e.target.value})} className={inputClass} placeholder="e.g., MUHANGA" />
                </div>
                <div>
                  <label className={labelClass}>Sector</label>
                  <input type="text" required value={settings.sector} onChange={e => setSettings({...settings, sector: e.target.value})} className={inputClass} placeholder="e.g., KIYUMBA" />
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <label className={labelClass}>School Name (Display Title)</label>
                  <input type="text" required value={settings.schoolName} onChange={e => setSettings({...settings, schoolName: e.target.value})} className={inputClass} placeholder="e.g., KIYUMBA TSS" />
                </div>
                <div>
                  <label className={labelClass}>Trainer Name</label>
                  <input type="text" required value={settings.trainerName} onChange={e => setSettings({...settings, trainerName: e.target.value})} className={inputClass} placeholder="e.g., GLOIRE" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div>
                  <label className={labelClass}>Trade/Option</label>
                  <input type="text" value={settings.trade} onChange={e => setSettings({...settings, trade: e.target.value})} className={inputClass} placeholder="e.g., SOD" />
                </div>
                <div>
                  <label className={labelClass}>Academic Year</label>
                  <input type="text" value={settings.academicYear} onChange={e => setSettings({...settings, academicYear: e.target.value})} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Level</label>
                  <input type="text" value={settings.level} onChange={e => setSettings({...settings, level: e.target.value})} className={inputClass} />
                </div>
              </div>
            </div>
          </div>

          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-100">
            <button 
              type="button" 
              onClick={handleDelete}
              className="w-full sm:w-auto px-6 py-3 bg-rose-50 text-rose-500 font-bold rounded-xl hover:bg-rose-500 hover:text-white transition-all flex items-center justify-center space-x-2"
            >
              <i className="fas fa-trash-alt"></i>
              <span>Reset Settings</span>
            </button>

            <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
              <button 
                type="button"
                onClick={() => setView(AppView.RTB_PLANS)}
                className="w-full sm:w-auto px-6 py-3 bg-white text-slate-500 font-bold rounded-xl border border-slate-200 hover:bg-slate-50 transition-all"
              >
                Back to Plans
              </button>
              <button 
                type="submit" 
                className="w-full sm:w-auto px-10 py-3 bg-[#1a2b4b] text-white font-bold rounded-xl hover:bg-black transition-all shadow-lg flex items-center justify-center space-x-2"
              >
                <i className={`fas ${saved ? 'fa-check' : 'fa-save'}`}></i>
                <span>{saved ? 'Settings Updated!' : 'Update Defaults'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RTBSettings;
