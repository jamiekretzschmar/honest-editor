
import React from 'react';
import { GroundingSource } from '../types';

interface EditorReviewProps {
  commentary: string;
  vibeScore: number;
  sources?: GroundingSource[];
}

const EditorReview: React.FC<EditorReviewProps> = ({ commentary, vibeScore, sources }) => {
  return (
    <div className="glass rounded-[2rem] md:rounded-[3rem] p-6 md:p-10 mb-12 relative overflow-hidden shadow-2xl border-white/5">
      <div className="absolute top-0 right-0 p-8 opacity-5 dark:opacity-10 pointer-events-none">
        <i className="fa-solid fa-quote-right text-9xl"></i>
      </div>
      
      <div className="flex flex-col md:flex-row gap-10 items-start relative z-10">
        <div className="flex-1">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-500">
               <i className="fa-solid fa-pen-nib"></i>
            </div>
            <h2 className="serif text-3xl md:text-4xl italic text-cyan-700 dark:text-white">The Editor's Take</h2>
          </div>
          
          <p className="text-zinc-700 dark:text-zinc-300 text-lg md:text-xl leading-relaxed italic mb-8 border-l-2 border-cyan-500/30 pl-6">
            "{commentary}"
          </p>

          {sources && sources.length > 0 && (
            <div className="mt-8 pt-6 border-t border-black/5 dark:border-white/5">
              <span className="text-[9px] font-black uppercase tracking-[0.3em] text-zinc-400 mb-4 block">Research Attribution & Verification</span>
              <div className="flex flex-wrap gap-3">
                {sources.slice(0, 5).map((source, i) => (
                  <a 
                    key={i} 
                    href={source.uri} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-[10px] bg-black/5 dark:bg-white/5 hover:bg-cyan-500 hover:text-white dark:hover:bg-cyan-500 border border-black/5 dark:border-white/10 px-3 py-1.5 rounded-full transition-all flex items-center gap-2 font-semibold"
                  >
                    <i className="fa-solid fa-link text-[8px]"></i>
                    {source.title || 'Referenced Source'}
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-col items-center bg-black/5 dark:bg-zinc-900/80 p-8 rounded-[2rem] border border-black/5 dark:border-white/5 min-w-[200px] shadow-inner">
          <span className="text-zinc-500 uppercase tracking-widest text-[10px] font-black mb-2">Vibe Alignment</span>
          <div className="relative flex items-center justify-center mb-4">
            <svg className="w-24 h-24 transform -rotate-90">
              <circle
                cx="48"
                cy="48"
                r="42"
                stroke="currentColor"
                strokeWidth="8"
                fill="transparent"
                className="text-zinc-200 dark:text-zinc-800"
              />
              <circle
                cx="48"
                cy="48"
                r="42"
                stroke="currentColor"
                strokeWidth="8"
                fill="transparent"
                strokeDasharray={264}
                strokeDashoffset={264 - (264 * vibeScore) / 100}
                className="text-cyan-500 transition-all duration-1000 ease-out"
              />
            </svg>
            <span className="absolute text-3xl font-black">{vibeScore}%</span>
          </div>
          <div className="text-[9px] text-zinc-400 font-bold uppercase tracking-tighter">Editorial Confidence</div>
        </div>
      </div>
    </div>
  );
};

export default EditorReview;
