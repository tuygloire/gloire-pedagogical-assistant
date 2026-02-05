
import React, { useState } from 'react';
import { LessonPlan } from '../types';
import LessonDisplay from './LessonDisplay';

interface HistoryProps {
  lessons: LessonPlan[];
  onDelete: (id: string) => void;
  onUpdate: (lesson: LessonPlan) => void;
}

const History: React.FC<HistoryProps> = ({ lessons, onDelete, onUpdate }) => {
  const [selectedLesson, setSelectedLesson] = useState<LessonPlan | null>(null);

  if (selectedLesson) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <button 
          onClick={() => setSelectedLesson(null)}
          className="mb-6 text-indigo-600 hover:text-indigo-800 font-medium flex items-center transition-colors no-print"
        >
          <i className="fas fa-arrow-left mr-2"></i> Back to History
        </button>
        <LessonDisplay lesson={selectedLesson} onUpdate={onUpdate} />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-900">Your Archive</h2>
          <p className="text-slate-500 mt-1">Access and review your previously generated lesson plans.</p>
        </div>
        <div className="flex items-center text-sm font-medium text-slate-500 bg-white px-4 py-2 rounded-full border border-slate-200 shadow-sm">
          <span className="w-2 h-2 rounded-full bg-indigo-500 mr-2"></span>
          {lessons.length} {lessons.length === 1 ? 'Lesson' : 'Lessons'} Total
        </div>
      </div>

      {lessons.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-slate-200">
          <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="fas fa-folder-open text-slate-300 text-3xl"></i>
          </div>
          <h3 className="text-xl font-semibold text-slate-900">No lessons saved yet</h3>
          <p className="text-slate-500 mt-2 max-w-xs mx-auto">Generate your first pedagogical plan to see it listed here in your personal archive.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {lessons.map((lesson) => (
            <div 
              key={lesson.id}
              className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col group overflow-hidden"
            >
              <div className="p-6 flex-grow">
                <div className="flex justify-between items-start mb-3">
                  <span className="px-2 py-1 rounded bg-indigo-50 text-indigo-600 text-[10px] font-bold uppercase tracking-wider">
                    {lesson.subject}
                  </span>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(lesson.id);
                    }}
                    className="text-slate-300 hover:text-red-500 transition-colors"
                  >
                    <i className="fas fa-trash-alt text-xs"></i>
                  </button>
                </div>
                <h3 className="font-bold text-slate-900 text-lg mb-2 line-clamp-2">
                  {lesson.title}
                </h3>
                <div className="flex flex-wrap gap-y-2 gap-x-4 text-xs text-slate-400 mt-auto">
                  <span className="flex items-center">
                    <i className="fas fa-graduation-cap mr-1"></i> {lesson.gradeLevel}
                  </span>
                  <span className="flex items-center">
                    <i className="fas fa-clock mr-1"></i> {lesson.duration}
                  </span>
                </div>
              </div>
              <button 
                onClick={() => setSelectedLesson(lesson)}
                className="w-full py-3 px-6 bg-slate-50 text-slate-600 font-bold text-sm hover:bg-indigo-600 hover:text-white transition-all border-t border-slate-100"
              >
                View Full Plan
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default History;
