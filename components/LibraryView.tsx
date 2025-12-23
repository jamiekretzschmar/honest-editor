
import React from 'react';
import { SavedPlaylist } from '../types';

interface LibraryViewProps {
  items: SavedPlaylist[];
  onLoad: (item: SavedPlaylist) => void;
  onDelete: (id: string, e: React.MouseEvent) => void;
  onClose?: () => void;
  isCompact?: boolean;
}

const LibraryView: React.FC<LibraryViewProps> = ({ items, onLoad, onDelete, onClose, isCompact = false }) => {
  if (items.length === 0) {
    return (
      <div className="py-24 text-center glass rounded-[3rem] border-dashed border-zinc-300 dark:border-zinc-800 animate-in fade-in duration-1000">
        <div className="relative inline-block mb-8">
          <i className="fa-solid fa-box-open text-5xl text-zinc-300 dark:text-zinc-800"></i>
          <div className="absolute inset-0 bg-cyan-500/5 blur-2xl rounded-full animate-pulse"></div>
        </div>
        <p className="text-zinc-500 text-[11px] uppercase tracking-[0.5em] font-black">Archive Vault Empty</p>
        <p className="text-zinc-400 dark:text-zinc-600 text-xs mt-4 italic">"True curation begins with a single request."</p>
      </div>
    );
  }

  return (
    <div className={`animate-in fade-in slide-in-from-bottom-8 duration-1000 ease-out ${isCompact ? 'max-w-6xl mx-auto' : ''}`}>
      <div className="flex flex-col md:flex-row justify-between items-end gap-8 mb-16 border-b border-black/5 dark:border-white/5 pb-12">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-4 px-4 py-1.5 bg-cyan-500/10 rounded-full">
             <i className="fa-solid fa-vault text-[11px] text-cyan-600 dark:text-cyan-400"></i>
             <span className="text-[10px] font-black uppercase tracking-[0.3em] text-cyan-600 dark:text-cyan-400">Secure Vault Access</span>
          </div>
          <h2 className="serif text-5xl md:text-7xl font-bold tracking-tighter leading-none">
            {isCompact ? 'Recent Archives' : 'The Master Catalog'}
          </h2>
          <p className="text-zinc-500 dark:text-zinc-400 text-lg italic font-light max-w-xl">
            "Taste is refined through repetition and reflection. Access your preserved curations below."
          </p>
        </div>
        {onClose && (
          <button 
            onClick={onClose}
            className="px-10 py-4 glass rounded-2xl text-[11px] font-black uppercase tracking-[0.3em] hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all shadow-2xl border-white/10"
          >
            Close Archives
          </button>
        )}
      </div>

      <div className={`grid grid-cols-1 md:grid-cols-2 ${isCompact ? 'lg:grid-cols-2' : 'lg:grid-cols-3'} gap-10`}>
        {items.map((item) => (
          <div 
            key={item.id}
            onClick={() => onLoad(item)}
            className="group relative glass rounded-[2.5rem] p-10 cursor-pointer hover:border-cyan-500/50 transition-all duration-700 shadow-xl overflow-hidden hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.4)]"
          >
            {/* Background Pattern */}
            <div className="absolute top-0 right-0 p-12 opacity-[0.03] group-hover:opacity-10 transition-all duration-700 pointer-events-none transform group-hover:scale-110">
               <i className="fa-solid fa-file-audio text-[12rem] -rotate-12"></i>
            </div>

            <div className="relative z-10 flex flex-col h-full">
              <div className="flex justify-between items-start mb-10">
                <div className="w-14 h-14 rounded-2xl bg-black/5 dark:bg-white/5 flex items-center justify-center text-cyan-600 dark:text-cyan-400 group-hover:bg-cyan-500 group-hover:text-white transition-all duration-500 shadow-inner">
                  <i className="fa-solid fa-folder-tree text-2xl"></i>
                </div>
                <button 
                  onClick={(e) => onDelete(item.id, e)}
                  className="w-12 h-12 rounded-full flex items-center justify-center text-zinc-300 dark:text-zinc-700 hover:text-red-500 hover:bg-red-500/10 transition-all duration-300"
                  title="Expunge from Archive"
                >
                  <i className="fa-solid fa-trash-can text-lg"></i>
                </button>
              </div>

              <div className="mb-8">
                <h3 className="serif text-3xl font-bold mb-3 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors duration-500 leading-tight">
                  {item.name}
                </h3>
                <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-500">
                   <span>{item.date}</span>
                   <span className="w-1 h-1 bg-zinc-300 dark:bg-zinc-800 rounded-full"></span>
                   <span>{item.data.items.length} Units</span>
                </div>
              </div>
              
              <div className="mt-auto space-y-6">
                <div className="flex items-center gap-6">
                  <div className="flex-1 h-2 bg-black/5 dark:bg-zinc-900 rounded-full overflow-hidden shadow-inner">
                    <div 
                      className="h-full bg-gradient-to-r from-cyan-600 to-cyan-400 transition-all duration-1500 ease-out group-hover:shadow-[0_0_15px_rgba(6,182,212,0.6)]" 
                      style={{ width: `${item.data.vibeScore}%` }}
                    ></div>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-xl font-black italic serif text-cyan-600 dark:text-cyan-400 leading-none">{item.data.vibeScore}%</span>
                    <span className="text-[8px] font-black uppercase tracking-widest text-zinc-500">Alignment</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-6 border-t border-black/5 dark:border-white/5">
                   <div className="flex gap-2">
                      <div className="px-3 py-1.5 glass bg-black/5 dark:bg-white/5 rounded-lg text-[9px] font-black uppercase tracking-widest text-zinc-500">
                        {item.data.profile.platformMode.replace('_', ' ')}
                      </div>
                   </div>
                   <div className="opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0 transition-all duration-500 flex items-center gap-3 text-cyan-600 dark:text-cyan-400 text-[10px] font-black uppercase tracking-[0.3em]">
                      Retrieve
                      <i className="fa-solid fa-arrow-right-long animate-pulse"></i>
                   </div>
                </div>
              </div>
            </div>

            {/* Subtle Overlay Shimmer */}
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-all duration-1500 skew-x-12"></div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LibraryView;
