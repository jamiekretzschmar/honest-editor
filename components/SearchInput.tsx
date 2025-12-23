
import React, { useState, useEffect } from 'react';
import { PlatformMode, SortOrder, RequestProfile } from '../types';

interface SearchInputProps {
  onSearch: (query: string, config: Partial<RequestProfile>) => void;
  onToggleManual: () => void;
  isManualMode: boolean;
  isLoading: boolean;
}

const thinkingStates = [
  "Consulting the archives...",
  "Evaluating cultural relevance...",
  "Verifying source integrity...",
  "Synthesizing editorial takes...",
  "Filtering for peak quality...",
  "Cross-referencing database nodes..."
];

const SearchInput: React.FC<SearchInputProps> = ({ onSearch, onToggleManual, isManualMode, isLoading }) => {
  const [query, setQuery] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [platform, setPlatform] = useState<PlatformMode | 'Auto'>('Auto');
  const [sortOrder, setSortOrder] = useState<SortOrder>(SortOrder.RELEVANCE);
  const [length, setLength] = useState(10);
  
  // New Activated Latent Fields
  const [era, setEra] = useState('');
  const [focus, setFocus] = useState('');
  const [source, setSource] = useState('');
  
  const [thinkingIdx, setThinkingIdx] = useState(0);

  useEffect(() => {
    let interval: number;
    if (isLoading) {
      interval = window.setInterval(() => {
        setThinkingIdx(prev => (prev + 1) % thinkingStates.length);
      }, 2500);
    }
    return () => clearInterval(interval);
  }, [isLoading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim() && !isLoading) {
      onSearch(query, {
        platformMode: platform,
        sortOrder: sortOrder,
        targetLength: length,
        eraConstraint: era || undefined,
        genderFocus: focus || undefined,
        specificSource: source || undefined
      });
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-2 md:px-4 mt-4 md:mt-8 mb-8 md:mb-12">
      <div className="flex justify-center mb-8 md:mb-12">
        <button 
          onClick={onToggleManual}
          className={`px-6 md:px-8 py-2.5 md:py-3 rounded-full text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all border ${
            isManualMode 
            ? 'bg-black text-white dark:bg-white dark:text-black border-transparent shadow-xl' 
            : 'bg-transparent text-zinc-400 dark:text-zinc-500 border-zinc-200 dark:border-zinc-800 hover:text-cyan-600 dark:hover:text-white hover:border-cyan-500 dark:hover:border-zinc-600'
          }`}
        >
          {isManualMode ? 'Switch to AI Curate' : 'Switch to Manual Mode'}
        </button>
      </div>

      {!isManualMode && (
        <form onSubmit={handleSubmit} className="animate-in fade-in zoom-in-95 duration-700">
          <div className="relative group max-w-4xl mx-auto">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="What is the objective of this collection?"
              className="w-full bg-white dark:bg-zinc-900/60 border-2 border-zinc-300 dark:border-zinc-700 focus:border-cyan-600 dark:focus:border-white text-zinc-900 dark:text-white rounded-[1.5rem] md:rounded-[2.5rem] px-6 py-8 md:px-12 md:py-12 text-xl md:text-4xl serif outline-none transition-all duration-500 shadow-2xl dark:shadow-[0_0_80px_rgba(0,0,0,0.8)] focus:ring-4 focus:ring-cyan-500/10 placeholder:text-zinc-500 dark:placeholder:text-zinc-600 placeholder:italic"
              disabled={isLoading}
              autoFocus
            />
          </div>

          <div className="flex justify-center mt-6 md:mt-10">
            <button
              type="submit"
              disabled={isLoading}
              className="px-8 md:px-16 py-5 md:py-7 bg-black text-white dark:bg-white dark:text-black font-black uppercase tracking-[0.2em] rounded-2xl hover:opacity-90 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center min-w-[220px] md:min-w-[360px] shadow-2xl overflow-hidden"
            >
              {isLoading ? (
                <div className="flex flex-col items-center">
                   <div className="w-5 h-5 border-3 border-zinc-400 border-t-transparent rounded-full animate-spin mb-2"></div>
                   <span className="text-[10px] opacity-60 animate-pulse truncate px-4">{thinkingStates[thinkingIdx]}</span>
                </div>
              ) : (
                <>
                  <span className="text-sm md:text-xl">Analyze Request</span>
                  <i className="fa-solid fa-bolt-lightning ml-3 md:ml-4 text-sm md:text-xl"></i>
                </>
              )}
            </button>
          </div>

          <div className="mt-6 md:mt-8 flex flex-col items-center">
            <button 
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="text-zinc-500 dark:text-zinc-400 hover:text-cyan-600 dark:hover:text-white text-[10px] md:text-xs uppercase tracking-[0.3em] font-black flex items-center gap-2 md:gap-3 transition-colors py-3 md:py-4"
            >
              {showAdvanced ? 'Collapse Constraints' : 'Refine Constraints'}
              <i className={`fa-solid fa-chevron-${showAdvanced ? 'up' : 'down'} text-[8px] md:text-[10px]`}></i>
            </button>

            {showAdvanced && (
              <div className="mt-4 md:mt-6 w-full glass rounded-2xl md:rounded-[2.5rem] p-6 md:p-10 space-y-8 animate-in fade-in slide-in-from-top-4 duration-500 shadow-2xl">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
                  <div>
                    <label className="block text-[9px] md:text-[10px] text-zinc-400 dark:text-zinc-500 uppercase tracking-widest font-black mb-4 md:mb-6">Platform Mode</label>
                    <div className="flex bg-black/5 dark:bg-black/50 p-1.5 md:p-2 rounded-xl md:rounded-2xl border border-black/5 dark:border-white/5">
                      {['Auto', PlatformMode.SPOTIFY, PlatformMode.YOUTUBE].map((mode) => (
                        <button
                          key={mode}
                          type="button"
                          onClick={() => setPlatform(mode as any)}
                          className={`flex-1 py-2 md:py-3 px-2 md:px-4 rounded-lg md:rounded-xl text-[8px] md:text-[10px] font-black uppercase tracking-tighter transition-all ${
                            platform === mode ? 'bg-black text-white dark:bg-white dark:text-black shadow-xl' : 'text-zinc-400 dark:text-zinc-500 hover:text-black dark:hover:text-white'
                          }`}
                        >
                          {mode.replace('_Music', '').replace('_Video', '')}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[9px] md:text-[10px] text-zinc-400 dark:text-zinc-500 uppercase tracking-widest font-black mb-4 md:mb-6">Sorting Engine</label>
                    <div className="relative">
                      <select 
                        value={sortOrder}
                        onChange={(e) => setSortOrder(e.target.value as SortOrder)}
                        className="w-full bg-black/5 dark:bg-zinc-900 border border-black/5 dark:border-white/5 rounded-xl md:rounded-2xl px-4 md:px-6 py-2.5 md:py-3.5 text-[10px] md:text-xs font-bold text-zinc-900 dark:text-white outline-none focus:border-cyan-500/30 appearance-none cursor-pointer"
                      >
                        {Object.values(SortOrder).map((order) => (
                          <option key={order} value={order}>{order}</option>
                        ))}
                      </select>
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-400 dark:text-zinc-500 text-[8px]">
                         <i className="fa-solid fa-chevron-down"></i>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[9px] md:text-[10px] text-zinc-400 dark:text-zinc-500 uppercase tracking-widest font-black mb-4 md:mb-6 flex justify-between">
                      Collection Scale <span>{length} Items</span>
                    </label>
                    <input 
                      type="range"
                      min="5"
                      max="50"
                      step="5"
                      value={length}
                      onChange={(e) => setLength(parseInt(e.target.value))}
                      className="w-full accent-cyan-600 dark:accent-white h-1.5 md:h-2 bg-zinc-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-white/5">
                  <div>
                    <label className="block text-[9px] font-black uppercase tracking-widest text-zinc-500 mb-3">Era Constraint</label>
                    <input 
                      type="text" 
                      value={era}
                      onChange={(e) => setEra(e.target.value)}
                      placeholder="e.g. Late 90s, Victorian..."
                      className="w-full bg-black/20 border border-white/5 rounded-xl px-4 py-3 text-xs text-white outline-none focus:border-cyan-500/30"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-black uppercase tracking-widest text-zinc-500 mb-3">Tone / Gender Focus</label>
                    <input 
                      type="text" 
                      value={focus}
                      onChange={(e) => setFocus(e.target.value)}
                      placeholder="e.g. Moody, Female vocals..."
                      className="w-full bg-black/20 border border-white/5 rounded-xl px-4 py-3 text-xs text-white outline-none focus:border-cyan-500/30"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-black uppercase tracking-widest text-zinc-500 mb-3">Preferred Source</label>
                    <input 
                      type="text" 
                      value={source}
                      onChange={(e) => setSource(e.target.value)}
                      placeholder="e.g. Pitchfork, Boiler Room..."
                      className="w-full bg-black/20 border border-white/5 rounded-xl px-4 py-3 text-xs text-white outline-none focus:border-cyan-500/30"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </form>
      )}
    </div>
  );
};

export default SearchInput;
