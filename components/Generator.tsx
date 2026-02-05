
import React, { useState } from 'react';
import { GenerationConfig, LessonPlan } from '../types';
import { generateLessonPlan } from '../services/geminiService';
import LessonDisplay from './LessonDisplay';

interface GeneratorProps {
  onSave: (lesson: LessonPlan) => void;
}

const Generator: React.FC<GeneratorProps> = ({ onSave }) => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<LessonPlan | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [config, setConfig] = useState<GenerationConfig>({
    gradeLevel: '',
    subject: '',
    topic: '',
    duration: '45 Minutes',
    pedagogicalApproach: 'Inquiry-Based Learning'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!config.topic || !config.subject || !config.gradeLevel) {
      setError("Please fill in all required fields.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const lesson = await generateLessonPlan(config);
      setResult(lesson);
      onSave(lesson);
    } catch (err) {
      console.error(err);
      setError("Failed to generate lesson plan. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = (updated: LessonPlan) => {
    setResult(updated);
    onSave(updated);
  };

  const reset = () => {
    setResult(null);
    setConfig({ ...config, topic: '', subject: '', gradeLevel: '' });
  };

  if (result) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6 no-print">
          <h2 className="text-2xl font-bold text-slate-900">Your New Lesson Plan</h2>
          <button 
            onClick={reset}
            className="text-indigo-600 hover:text-indigo-800 font-medium flex items-center"
          >
            <i className="fas fa-arrow-left mr-2"></i> Create Another
          </button>
        </div>
        <LessonDisplay lesson={result} onUpdate={handleUpdate} />
      </div>
    );
  }

  const inputClass = "w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all";
  const labelClass = "block text-sm font-semibold text-slate-700 mb-2";

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100">
        <div className="bg-indigo-600 px-8 py-10 text-white">
          <h2 className="text-3xl font-bold">Lesson Creator</h2>
          <p className="mt-2 text-indigo-100 opacity-90">Enter your lesson details to generate a structured pedagogical plan.</p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className={labelClass}>Subject</label>
              <input 
                type="text"
                required
                placeholder="e.g. Science, Mathematics..."
                value={config.subject}
                onChange={(e) => setConfig({ ...config, subject: e.target.value })}
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>Grade Level</label>
              <input 
                type="text"
                required
                placeholder="e.g. Grade 5, Level 3..."
                value={config.gradeLevel}
                onChange={(e) => setConfig({ ...config, gradeLevel: e.target.value })}
                className={inputClass}
              />
            </div>
          </div>

          <div>
            <label className={labelClass}>Topic / Title</label>
            <input 
              type="text"
              required
              placeholder="e.g. Introduction to Photosynthesis, Quadratic Equations..."
              value={config.topic}
              onChange={(e) => setConfig({ ...config, topic: e.target.value })}
              className={inputClass}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className={labelClass}>Duration</label>
              <select 
                value={config.duration}
                onChange={(e) => setConfig({ ...config, duration: e.target.value })}
                className={inputClass}
              >
                {['30 Minutes', '45 Minutes', '60 Minutes', '90 Minutes', '120 Minutes', 'Full Week'].map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            <div>
              <label className={labelClass}>Teaching Approach</label>
              <select 
                value={config.pedagogicalApproach}
                onChange={(e) => setConfig({ ...config, pedagogicalApproach: e.target.value })}
                className={inputClass}
              >
                {['Direct Instruction', 'Inquiry-Based Learning', 'Collaborative Learning', 'Project-Based Learning', 'Flipped Classroom', 'Gamification'].map(a => (
                  <option key={a} value={a}>{a}</option>
                ))}
              </select>
            </div>
          </div>

          {error && (
            <div className="p-4 bg-red-50 text-red-700 rounded-xl border border-red-100 text-sm">
              <i className="fas fa-exclamation-circle mr-2"></i> {error}
            </div>
          )}

          <div className="pt-4">
            <button 
              type="submit"
              disabled={loading}
              className={`w-full py-4 rounded-xl font-bold text-white transition-all transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center space-x-2 ${
                loading ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-100'
              }`}
            >
              {loading ? (
                <>
                  <i className="fas fa-circle-notch fa-spin mr-2"></i>
                  <span>Crafting your lesson...</span>
                </>
              ) : (
                <>
                  <i className="fas fa-wand-magic-sparkles mr-2"></i>
                  <span>Generate Lesson Plan</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      <div className="mt-12 text-center text-slate-400 text-sm">
        <p>Tip: Be specific with your topic for more accurate results.</p>
      </div>
    </div>
  );
};

export default Generator;
