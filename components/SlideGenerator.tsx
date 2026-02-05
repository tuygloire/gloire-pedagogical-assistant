
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { SlideGenerationConfig, Presentation, SlideContent, LessonPlan } from '../types';
import { generateSlideOutline, fillSlideBatchContent, generateSlideImage } from '../services/geminiService';
import pptxgen from 'pptxgenjs';

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

interface SlideGeneratorProps {
  history: LessonPlan[];
  onSave: (presentation: Presentation) => void;
  onDelete: (id: string) => void;
}

const SlideGenerator: React.FC<SlideGeneratorProps> = ({ history, onSave, onDelete }) => {
  const [loading, setLoading] = useState(false);
  const [genStep, setGenStep] = useState<string>('');
  const [result, setResult] = useState<Presentation | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isSlideShow, setIsSlideShow] = useState(false);
  const [scale, setScale] = useState(1);
  const slideContainerRef = useRef<HTMLDivElement>(null);
  const [editMode, setEditMode] = useState(true);
  
  const [config, setConfig] = useState<SlideGenerationConfig>({
    gradeLevel: '',
    subject: '',
    topic: '',
    duration: 'N/A',
    numSlides: 8
  });

  useEffect(() => {
    const handleResize = () => {
      if (!slideContainerRef.current) return;
      const parent = slideContainerRef.current.parentElement;
      if (!parent) return;

      const availableWidth = parent.clientWidth - 80;
      const availableHeight = parent.clientHeight - 80;
      
      const targetWidth = 1280;
      const targetHeight = 720;
      
      const scaleX = availableWidth / targetWidth;
      const scaleY = availableHeight / targetHeight;
      const newScale = Math.min(scaleX, scaleY, 1);
      
      setScale(newScale);
    };

    window.addEventListener('resize', handleResize);
    const timer = setTimeout(handleResize, 100);
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(timer);
    };
  }, [result, isSlideShow, editMode]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!isSlideShow) return;
    if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'PageDown') {
      setCurrentSlideIndex(prev => Math.min(prev + 1, (result?.slides.length || 1) - 1));
    } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
      setCurrentSlideIndex(prev => Math.max(prev - 1, 0));
    } else if (e.key === 'Escape') {
      setIsSlideShow(false);
    }
  }, [isSlideShow, result]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const compressImage = async (base64: string): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = base64;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return resolve(base64);
        const maxDimension = 1000; 
        const scaleFactor = Math.min(1, maxDimension / Math.max(img.width, img.height));
        canvas.width = img.width * scaleFactor;
        canvas.height = img.height * scaleFactor;
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', 0.8));
      };
      img.onerror = () => resolve(base64);
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = (reader.result as string).split(',')[1];
        setConfig(prev => ({ ...prev, referenceFile: { data: base64String, mimeType: file.type } }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!config.topic || !config.subject) {
      setError("Provide topic and subject.");
      return;
    }

    setLoading(true);
    setError(null);
    setGenStep('Initializing instructional structure...');
    
    try {
      const presentation = await generateSlideOutline(config);
      setResult(presentation);

      let currentSlides = [...presentation.slides];
      const batchSize = 1; // Minimum batch size for extreme reliability with source docs

      for (let i = 0; i < currentSlides.length; i += batchSize) {
        const chunkIndices = Array.from({ length: Math.min(batchSize, currentSlides.length - i) }, (_, k) => i + k);
        const chunkTitles = chunkIndices.map(idx => currentSlides[idx].title);
        
        setGenStep(`Synthesizing Slide ${i + 1} / ${currentSlides.length}`);
        
        const contentBatch = await fillSlideBatchContent(chunkTitles, config);
        
        if (contentBatch && contentBatch.length > 0) {
          contentBatch.forEach((filled, batchIdx) => {
            const globalIdx = i + batchIdx;
            if (currentSlides[globalIdx]) {
              currentSlides[globalIdx] = { 
                ...currentSlides[globalIdx], 
                points: Array.isArray(filled.points) ? filled.points : ["Consulting source document..."], 
                imagePrompt: filled.imagePrompt || currentSlides[globalIdx].title,
                goal: filled.goal || 'Understand key concepts',
                isAchieved: false
              };
            }
          });
        }

        try {
          const raw = await generateSlideImage(currentSlides[i].imagePrompt || currentSlides[i].title);
          if (raw) currentSlides[i].imageUrl = await compressImage(raw);
        } catch(e) { console.warn("Visual aid failed."); }

        setResult(prev => prev ? { ...prev, slides: [...currentSlides] } : null);
        await sleep(100);
      }

      onSave({ ...presentation, slides: currentSlides });
      setCurrentSlideIndex(0);
    } catch (err: any) {
      console.error("Slide error:", err);
      setError("Generation failed. This document is likely too large. Try focusing on a specific chapter title.");
    } finally {
      setLoading(false);
      setGenStep('');
    }
  };

  const handleEditField = (field: 'title' | 'point' | 'goal', value: string, pointIdx?: number) => {
    if (!result) return;
    const newSlides = [...result.slides];
    const s = newSlides[currentSlideIndex];
    if (!s) return;
    if (field === 'title') s.title = value;
    else if (field === 'goal') s.goal = value;
    else if (field === 'point' && pointIdx !== undefined) s.points[pointIdx] = value;
    setResult({ ...result, slides: newSlides });
  };

  const toggleAchieved = () => {
    if (!result || !result.slides[currentSlideIndex]) return;
    const newSlides = [...result.slides];
    newSlides[currentSlideIndex].isAchieved = !newSlides[currentSlideIndex].isAchieved;
    setResult({ ...result, slides: newSlides });
    onSave({ ...result, slides: newSlides });
  };

  if (isSlideShow && result) {
    const s = result.slides[currentSlideIndex];
    if (!s) return <div className="fixed inset-0 bg-slate-900 flex items-center justify-center text-white font-bold">Rendering...</div>;
    return (
      <div className="fixed inset-0 z-[100] bg-slate-950 flex flex-col items-center justify-center text-white select-none overflow-hidden">
        <div className="absolute top-6 left-6 right-6 flex justify-between items-center z-[110] no-print">
           <button onClick={() => setIsSlideShow(false)} className="px-6 py-2.5 bg-white/10 hover:bg-rose-600 rounded-full backdrop-blur-md transition-all flex items-center group">
              <i className="fas fa-times mr-2 group-hover:rotate-90"></i>
              <span className="text-[10px] font-black uppercase">Close</span>
           </button>
           <button onClick={toggleAchieved} className={`px-8 py-2.5 rounded-full backdrop-blur-md transition-all flex items-center border ${s.isAchieved ? 'bg-emerald-600' : 'bg-white/10 hover:bg-emerald-500'}`}>
              <i className={`fas ${s.isAchieved ? 'fa-check-circle' : 'fa-circle'} mr-2`}></i>
              <span className="text-[10px] font-black uppercase">{s.isAchieved ? 'Outcome Met' : 'Mark Progress'}</span>
           </button>
        </div>
        <div ref={slideContainerRef} className="w-full h-full flex items-center justify-center overflow-hidden">
          <div 
            className="bg-white/5 backdrop-blur-xl p-24 flex flex-col lg:flex-row items-center justify-between gap-16 origin-center relative border border-white/10"
            style={{ width: '1280px', height: '720px', transform: `scale(${scale})`, borderRadius: '3rem' }}
          >
            <div className="flex-1 w-full lg:w-3/5 space-y-10 text-left">
              <div className="space-y-4">
                <p className="text-blue-400 font-black text-[10px] uppercase tracking-[0.4em] animate-fadeInUp">Slide {currentSlideIndex + 1} / {result.slides.length}</p>
                <h2 className="text-6xl font-black border-l-[18px] border-blue-600 pl-10 leading-[1.1] uppercase animate-slideInLeft">{s.title}</h2>
              </div>
              <ul className="space-y-6">
                {s.points.map((p, i) => (
                  <li key={i} className="text-3xl flex items-start text-blue-50/90 leading-snug animate-fadeInUp" style={{ animationDelay: `${0.1 + i * 0.1}s` }}>
                    <span className="text-blue-500 mr-8 mt-4"><i className="fas fa-arrow-right"></i></span>{p}
                  </li>
                ))}
              </ul>
              {s.goal && (
                <div className="mt-16 p-8 bg-blue-600/10 border-l-8 border-blue-500 rounded-r-3xl">
                  <p className="text-[11px] font-black uppercase text-blue-400 mb-2">Pedagogical Goal</p>
                  <p className="text-2xl font-bold italic text-blue-100/80">"{s.goal}"</p>
                </div>
              )}
            </div>
            <div className="w-full lg:w-2/5 flex justify-center items-center h-full">
              {s.imageUrl && <img src={s.imageUrl} className="max-w-full max-h-[520px] object-contain rounded-[2.5rem] shadow-2xl" alt="" />}
            </div>
          </div>
        </div>
        <div className="absolute bottom-8 left-0 right-0 px-16 flex justify-between items-center z-[110]">
          <div className="flex space-x-8">
            <button disabled={currentSlideIndex === 0} onClick={() => setCurrentSlideIndex(i => i - 1)} className="w-16 h-16 rounded-3xl bg-white/5 hover:bg-blue-600 flex items-center justify-center disabled:opacity-0 transition-all border border-white/10 shadow-2xl"><i className="fas fa-chevron-left text-2xl"></i></button>
            <button disabled={currentSlideIndex === result.slides.length - 1} onClick={() => setCurrentSlideIndex(i => i + 1)} className="w-16 h-16 rounded-3xl bg-white/5 hover:bg-blue-600 flex items-center justify-center disabled:opacity-0 transition-all border border-white/10 shadow-2xl"><i className="fas fa-chevron-right text-2xl"></i></button>
          </div>
          <div className="px-10 py-3 bg-white/5 backdrop-blur-3xl rounded-3xl text-white font-black text-2xl border border-white/10">
            {currentSlideIndex + 1} / {result.slides.length}
          </div>
        </div>
      </div>
    );
  }

  if (result) {
    const s = result.slides[currentSlideIndex];
    return (
      <div className="h-[calc(100vh-64px)] flex flex-col bg-slate-200 overflow-hidden">
        <div className="flex justify-between items-center px-8 py-4 bg-white border-b border-slate-300 shadow-sm z-10 no-print">
          <div className="flex items-center space-x-6">
             <button onClick={() => setResult(null)} className="px-5 py-2.5 text-[#1a2b4b] font-black text-[10px] uppercase flex items-center hover:bg-slate-100 rounded-2xl transition-all border border-slate-200"><i className="fas fa-arrow-left mr-2"></i> Dashboard</button>
             <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200">
                <button onClick={() => setEditMode(true)} className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase ${editMode ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400'}`}>Edit</button>
                <button onClick={() => setEditMode(false)} className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase ${!editMode ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400'}`}>Preview</button>
             </div>
          </div>
          <button onClick={() => setIsSlideShow(true)} className="px-8 py-3 bg-[#1a2b4b] text-white rounded-2xl font-black text-xs uppercase shadow-xl hover:bg-blue-600 transition-all"><i className="fas fa-play mr-3"></i> Present</button>
        </div>
        <div className="flex-grow flex items-center justify-center p-12 relative overflow-hidden bg-slate-100/50">
          {!s ? (
            <div className="text-center animate-pulse"><i className="fas fa-cog fa-spin text-4xl text-blue-600 mb-4"></i><p className="font-bold text-slate-500 uppercase text-xs">Building Slide...</p></div>
          ) : (
            <div 
              ref={slideContainerRef}
              className="bg-white rounded-[3rem] shadow-2xl flex flex-col lg:flex-row overflow-hidden border border-slate-300 origin-center transition-transform"
              style={{ width: '1280px', height: '720px', transform: `scale(${scale})` }}
            >
              <div className="flex-grow p-16 sm:p-24 flex flex-col justify-center overflow-hidden">
                {editMode ? (
                  <input className="text-6xl font-black text-[#1a2b4b] mb-12 border-l-[16px] border-blue-600 pl-8 uppercase bg-blue-50/20 outline-none w-full border border-transparent focus:border-blue-200" value={s.title} onChange={(e) => handleEditField('title', e.target.value)} />
                ) : (
                  <h2 className="text-6xl font-black text-[#1a2b4b] mb-12 border-l-[16px] border-blue-600 pl-8 uppercase">{s.title}</h2>
                )}
                <div className="space-y-6 mb-12">
                  {s.points.map((p, idx) => (
                    <div key={idx} className="flex items-start">
                      <span className="text-blue-600 mr-8 mt-4"><i className="fas fa-square text-[10px] rotate-45"></i></span>
                      {editMode ? (
                        <textarea rows={1} className="text-3xl text-slate-700 font-bold bg-slate-50/50 outline-none w-full resize-none p-2 border-b border-transparent focus:border-blue-200" value={p} onChange={(e) => handleEditField('point', e.target.value, idx)} />
                      ) : ( <p className="text-3xl text-slate-700 font-bold">{p}</p> )}
                    </div>
                  ))}
                </div>
                <div className={`mt-auto p-8 rounded-[2rem] border-2 ${s.isAchieved ? 'bg-emerald-50 border-emerald-200' : 'bg-slate-50 border-slate-200'}`}>
                  <p className="text-[10px] font-black uppercase text-slate-400 mb-3">Slide Objective</p>
                  {editMode ? (
                    <textarea rows={2} className="w-full bg-transparent border-none outline-none text-xl font-bold italic text-slate-600 resize-none" value={s.goal || ''} onChange={(e) => handleEditField('goal', e.target.value)} />
                  ) : ( <p className="text-xl font-bold text-slate-600 italic leading-snug">"{s.goal || 'Extracting objective...'}"</p> )}
                </div>
              </div>
              <div className="w-full lg:w-[38%] bg-slate-50/80 flex items-center justify-center border-l-2 border-slate-200 p-16">
                {s.imageUrl ? <img src={s.imageUrl} className="max-w-full max-h-[480px] object-contain rounded-[2rem] shadow-2xl border-4 border-white" alt="" /> : <div className="text-center opacity-30 animate-pulse"><i className="fas fa-palette text-8xl mb-6"></i><p className="text-[11px] font-black uppercase">Visuals</p></div>}
              </div>
            </div>
          )}
          <div className="absolute top-1/2 left-8 -translate-y-1/2"><button disabled={currentSlideIndex === 0} onClick={() => setCurrentSlideIndex(i => i - 1)} className="w-16 h-16 rounded-[1.5rem] bg-white shadow-2xl border border-slate-200 flex items-center justify-center disabled:opacity-20 hover:bg-blue-600 hover:text-white transition-all"><i className="fas fa-chevron-left text-xl"></i></button></div>
          <div className="absolute top-1/2 right-8 -translate-y-1/2"><button disabled={currentSlideIndex === (result?.slides.length || 1) - 1} onClick={() => setCurrentSlideIndex(i => i + 1)} className="w-16 h-16 rounded-[1.5rem] bg-white shadow-2xl border border-slate-200 flex items-center justify-center disabled:opacity-20 hover:bg-blue-600 hover:text-white transition-all"><i className="fas fa-chevron-right text-xl"></i></button></div>
          <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex space-x-3 bg-white/80 backdrop-blur-md px-6 py-3 rounded-full border border-slate-200 shadow-xl no-print">
            {result.slides.map((_, idx) => ( <button key={idx} onClick={() => setCurrentSlideIndex(idx)} className={`w-3 h-3 rounded-full transition-all ${idx === currentSlideIndex ? 'bg-blue-600 w-10' : 'bg-slate-300'}`} /> ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center p-10 bg-slate-100">
      <div className="bg-white rounded-[4rem] shadow-2xl border border-slate-200 w-full max-w-6xl overflow-hidden flex flex-col md:flex-row">
        <div className="md:w-[40%] bg-[#1a2b4b] p-20 flex flex-col justify-center items-center text-center text-white relative">
          <div className="w-32 h-32 bg-gradient-to-tr from-blue-500 to-indigo-700 rounded-[2.5rem] flex items-center justify-center text-5xl shadow-2xl mb-10"><i className="fas fa-laptop-code"></i></div>
          <h2 className="text-4xl font-black uppercase tracking-tighter leading-none mb-6">Presentation Studio</h2>
          <p className="text-sm text-blue-200 font-medium opacity-80">Synthesize pedagogical slides from your curriculum source.</p>
        </div>
        <form onSubmit={handleSubmit} className="flex-grow p-20 space-y-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-10">
            <div><label className="text-[11px] font-black uppercase text-slate-400 block mb-3">Subject</label><input type="text" required placeholder="e.g. Science" value={config.subject} onChange={e => setConfig({...config, subject: e.target.value})} className="w-full px-7 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-blue-500 font-bold" /></div>
            <div><label className="text-[11px] font-black uppercase text-slate-400 block mb-3">Level</label><input type="text" required placeholder="e.g. Level 3" value={config.gradeLevel} onChange={e => setConfig({...config, gradeLevel: e.target.value})} className="w-full px-7 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-blue-500 font-bold" /></div>
          </div>
          <div><label className="text-[11px] font-black uppercase text-slate-400 block mb-3">Specific Chapter / Topic</label><input type="text" required placeholder="e.g. Vue Project Installation" value={config.topic} onChange={e => setConfig({...config, topic: e.target.value})} className="w-full px-8 py-6 bg-slate-50 border-2 border-slate-100 rounded-[2rem] outline-none focus:border-blue-500 font-black text-2xl" /></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-10 items-end">
            <div><label className="text-[11px] font-black uppercase text-slate-400 block mb-3">Slides</label><input type="number" min="3" max="25" value={config.numSlides} onChange={e => setConfig({...config, numSlides: parseInt(e.target.value) || 3})} className="w-full px-7 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-blue-500 font-black text-blue-600" /></div>
            <div className="relative"><input type="file" onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer z-10" /><div className="px-6 py-4 bg-blue-50 border-2 border-dashed border-blue-200 rounded-2xl flex items-center justify-center text-[10px] font-black uppercase text-blue-600"><i className="fas fa-paperclip mr-2"></i> {config.referenceFile ? "Manual Attached" : "Upload Manual"}</div></div>
          </div>
          {error && <div className="p-6 bg-rose-50 border-2 border-rose-100 text-rose-600 rounded-3xl text-[11px] font-black uppercase flex items-center"><i className="fas fa-bolt mr-4"></i> {error}</div>}
          <button type="submit" disabled={loading} className={`w-full py-8 rounded-[2.5rem] font-black text-white uppercase tracking-widest shadow-2xl transition-all flex flex-col items-center justify-center ${loading ? 'bg-slate-400' : 'bg-[#1a2b4b] hover:bg-blue-600'}`}>{loading ? <><i className="fas fa-sync fa-spin text-3xl mb-1"></i><span className="text-[11px] font-bold">{genStep}</span></> : <><i className="fas fa-magic text-2xl mb-1"></i><span className="text-lg">Synthesize Slides</span></>}</button>
        </form>
      </div>
    </div>
  );
};

export default SlideGenerator;
