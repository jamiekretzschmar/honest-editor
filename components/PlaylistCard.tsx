
import React, { useState, useEffect } from 'react';
import { PlaylistItem, PlatformMode } from '../types';

interface PlaylistCardProps {
  item: PlaylistItem;
  mode: PlatformMode;
  index: number;
  isCurrentlyPlaying: boolean;
  onPlay: () => void;
  onPause: () => void;
  onNext: () => void;
  onPrev: () => void;
  hasNext: boolean;
  hasPrev: boolean;
}

const PlaylistCard: React.FC<PlaylistCardProps> = ({ 
  item, 
  mode, 
  index, 
  isCurrentlyPlaying,
  onPlay,
  onPause,
  onNext,
  onPrev,
  hasNext,
  hasPrev
}) => {
  const isVideo = mode === PlatformMode.YOUTUBE || (item.url && item.url.includes('youtube.com'));
  const [imgStatus, setImgStatus] = useState<'loading' | 'loaded' | 'error'>('loading');
  const [showInfo, setShowInfo] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  // Intelligent Thumbnail Construction
  const youtubeUrl = (isVideo && item.platformId && item.platformId.length === 11) 
    ? `https://i.ytimg.com/vi/${item.platformId}/mqdefault.jpg` 
    : null;
  
  const primaryUrl = item.thumbnail || youtubeUrl;
  const generativeUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(item.title + " " + item.creator + " album art aesthetic minimalist high quality cinematic")}?width=480&height=270&nologo=true&seed=${item.id || index}`;

  // Determine the source based on current error state
  const [currentSrc, setCurrentSrc] = useState<string | null>(primaryUrl || generativeUrl);

  const handleImageError = () => {
    if (retryCount === 0 && currentSrc !== generativeUrl) {
      setRetryCount(1);
      setCurrentSrc(generativeUrl);
      setImgStatus('loading');
    } else {
      setImgStatus('error');
    }
  };

  const hasValidId = item.platformId && item.platformId.length > 5;

  // Iframe construction
  const getEmbedUrl = () => {
    if (!item.platformId) return null;
    if (isVideo) {
      return `https://www.youtube.com/embed/${item.platformId}?autoplay=1&rel=0&modestbranding=1`;
    } else {
      return `https://open.spotify.com/embed/track/${item.platformId}`;
    }
  };

  return (
    <div className={`group relative glass rounded-2xl overflow-hidden transition-all duration-500 flex flex-col h-full shadow-lg border-white/5 ${isCurrentlyPlaying ? 'ring-2 ring-cyan-500 shadow-cyan-500/20 z-50 scale-[1.02]' : 'hover:border-cyan-500/30 hover:shadow-cyan-500/10'}`}>
      <div className="relative aspect-video overflow-hidden bg-zinc-200 dark:bg-zinc-950">
        
        {/* Active Player Layer */}
        {isCurrentlyPlaying && hasValidId ? (
          <div className="absolute inset-0 z-30 animate-in fade-in zoom-in duration-500 bg-black">
            <iframe
              src={getEmbedUrl() || ''}
              className="w-full h-full border-0"
              allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
              loading="lazy"
            ></iframe>
            
            {/* Custom Transport Controls Overlay (Mini) */}
            <div className="absolute bottom-0 inset-x-0 p-4 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              <div className="flex gap-2 pointer-events-auto">
                <button 
                  onClick={(e) => { e.stopPropagation(); onPrev(); }}
                  disabled={!hasPrev}
                  className="w-8 h-8 rounded-full glass bg-black/50 text-white flex items-center justify-center hover:bg-cyan-500 transition-all disabled:opacity-30"
                >
                  <i className="fa-solid fa-backward-step"></i>
                </button>
                <button 
                  onClick={(e) => { e.stopPropagation(); onPause(); }}
                  className="w-8 h-8 rounded-full glass bg-white text-black flex items-center justify-center hover:bg-cyan-500 hover:text-white transition-all"
                >
                  <i className="fa-solid fa-pause"></i>
                </button>
                <button 
                  onClick={(e) => { e.stopPropagation(); onNext(); }}
                  disabled={!hasNext}
                  className="w-8 h-8 rounded-full glass bg-black/50 text-white flex items-center justify-center hover:bg-cyan-500 transition-all disabled:opacity-30"
                >
                  <i className="fa-solid fa-forward-step"></i>
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Static Thumbnail Layer */
          <>
            {imgStatus === 'loading' && (
              <div className="absolute inset-0 z-20 overflow-hidden bg-zinc-200 dark:bg-zinc-900">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-[shimmer_2s_infinite] skew-x-12"></div>
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                  <div className="relative">
                    <i className="fa-solid fa-compact-disc text-zinc-400 dark:text-zinc-700 text-5xl animate-spin"></i>
                    <div className="absolute inset-0 bg-cyan-500/10 rounded-full blur-xl animate-pulse"></div>
                  </div>
                  <span className="text-[8px] font-black uppercase tracking-[0.3em] text-zinc-500 dark:text-zinc-600 animate-pulse">Resolving Asset</span>
                </div>
              </div>
            )}

            {imgStatus === 'error' && (
              <div className="absolute inset-0 bg-zinc-100 dark:bg-zinc-900 flex flex-col items-center justify-center p-6 text-center z-30 animate-in fade-in duration-500">
                <div className="w-16 h-16 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center mb-4">
                  <i className="fa-solid fa-image-slash text-zinc-400 dark:text-zinc-600 text-2xl"></i>
                </div>
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-500">Asset Unresolved</span>
                <p className="text-[8px] text-zinc-400 mt-2 italic opacity-60">Metadata integrity maintained; visual link severed.</p>
              </div>
            )}

            {imgStatus !== 'error' && currentSrc && (
              <img 
                src={currentSrc} 
                alt={item.title}
                onLoad={() => setImgStatus('loaded')}
                onError={handleImageError}
                className={`w-full h-full object-cover transition-all duration-1000 transform will-change-transform ${
                  imgStatus === 'loaded' ? 'opacity-90 dark:opacity-70 group-hover:opacity-100 group-hover:scale-105' : 'opacity-0 scale-110'
                }`}
              />
            )}

            {/* Play Trigger Layer */}
            <div className="absolute inset-0 flex items-center justify-center z-10 opacity-0 group-hover:opacity-100 transition-all duration-500">
              <button 
                onClick={onPlay}
                className="w-16 h-16 rounded-full glass bg-white/20 backdrop-blur-xl text-white flex items-center justify-center shadow-2xl hover:scale-110 hover:bg-cyan-500 transition-all group/play"
              >
                <i className="fa-solid fa-play ml-1 text-2xl group-hover/play:animate-pulse"></i>
              </button>
            </div>
          </>
        )}

        {/* Info Overlay Toggle */}
        <div className={`absolute inset-0 bg-black/95 backdrop-blur-xl p-6 transition-all duration-500 flex flex-col justify-center z-40 ${showInfo ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-full pointer-events-none'}`}>
          <button 
            onClick={(e) => { e.stopPropagation(); setShowInfo(false); }}
            className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors"
          >
            <i className="fa-solid fa-xmark"></i>
          </button>
          <div className="mb-4">
             <span className="text-[10px] font-black uppercase tracking-[0.3em] text-cyan-500 mb-2 block">Editorial Deep-Dive</span>
             <p className="text-white text-sm italic leading-relaxed">"{item.description || 'No detailed review available for this unit.'}"</p>
          </div>
          
          {item.heuristics && item.heuristics.length > 0 && (
            <div className="mb-4">
               <span className="text-[9px] font-black uppercase tracking-widest text-zinc-500 mb-2 block">Curation Signals</span>
               <div className="flex flex-wrap gap-2">
                 {item.heuristics.map(h => (
                   <span key={h} className="text-[8px] border border-white/10 px-2 py-1 rounded bg-white/5 text-zinc-300 uppercase tracking-tighter">{h}</span>
                 ))}
               </div>
            </div>
          )}

          {item.releaseDate && (
            <div className="text-[10px] text-zinc-500 font-bold uppercase mt-auto">Archived: {item.releaseDate}</div>
          )}
        </div>

        <div className="absolute top-3 left-3 bg-black/80 backdrop-blur-md px-2.5 py-1 rounded-lg text-[10px] font-black text-white z-10 border border-white/10 shadow-lg">
          #{index + 1}
        </div>

        {hasValidId && (
          <div className="absolute top-3 right-3 bg-cyan-500 px-1.5 py-0.5 rounded text-[8px] font-black text-white z-10 border border-white/20 shadow-lg uppercase tracking-widest flex items-center gap-1">
             <i className="fa-solid fa-check-double"></i> Verified
          </div>
        )}
        
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-60 pointer-events-none"></div>
        
        <div className="absolute bottom-3 right-3 flex flex-col items-end gap-2 z-10">
          <button 
            onClick={() => setShowInfo(true)}
            className="bg-white/10 backdrop-blur-md hover:bg-white/20 text-white p-2 rounded-lg text-[10px] transition-all border border-white/10"
            title="Read Detailed Review"
          >
            <i className="fa-solid fa-circle-info"></i>
          </button>
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-2xl border border-white/10 transition-colors ${isCurrentlyPlaying ? 'bg-cyan-500 text-white' : 'bg-black dark:bg-white text-white dark:text-black'}`}>
             <i className={`fa-solid fa-star text-[8px] ${isCurrentlyPlaying ? 'text-white' : 'text-cyan-500'}`}></i>
             {item.score}
          </div>
        </div>
      </div>

      <div className="p-6 flex-1 flex flex-col">
        <div className="flex items-start justify-between gap-4 mb-3">
          <h3 className={`font-bold text-base md:text-lg leading-tight transition-colors line-clamp-2 serif ${isCurrentlyPlaying ? 'text-cyan-600 dark:text-cyan-400' : 'dark:group-hover:text-white'}`}>
            {item.title}
          </h3>
          <div className="flex-shrink-0 mt-1">
            {isVideo ? (
              <i className="fa-brands fa-youtube text-red-600 text-2xl drop-shadow-sm"></i>
            ) : (
              <i className="fa-brands fa-spotify text-green-500 text-2xl drop-shadow-sm"></i>
            )}
          </div>
        </div>
        <p className="text-zinc-500 dark:text-zinc-400 text-xs md:text-sm mb-5 font-semibold italic opacity-80">{item.creator}</p>
        
        <div className="mt-auto space-y-4">
          <div className="flex flex-wrap gap-2">
            <span className={`text-[9px] md:text-[10px] px-3 py-1.5 rounded-lg uppercase tracking-widest font-black border transition-all ${isCurrentlyPlaying ? 'bg-cyan-500 text-white border-cyan-400 animate-pulse' : 'bg-black/5 dark:bg-white/5 text-zinc-700 dark:text-zinc-300 border-black/5 dark:border-white/5 shadow-inner'}`}>
              {item.metadata}
            </span>
            {item.heuristics && item.heuristics.slice(0, 1).map(h => (
              <span key={h} className="text-[9px] md:text-[10px] bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 px-3 py-1.5 rounded-lg uppercase tracking-widest font-black border border-cyan-500/10">
                {h}
              </span>
            ))}
          </div>
          
          <div className="flex gap-2">
            {isCurrentlyPlaying ? (
              <button 
                className="flex-1 py-3.5 bg-red-500 text-white rounded-xl text-[10px] font-black uppercase tracking-[0.3em] transition-all transform active:scale-95 flex items-center justify-center gap-3 shadow-xl"
                onClick={onPause}
              >
                Terminate Stream
                <i className="fa-solid fa-stop text-[8px]"></i>
              </button>
            ) : (
              <button 
                className="flex-1 py-3.5 bg-black text-white dark:bg-zinc-100 dark:hover:bg-white dark:text-black rounded-xl text-[10px] font-black uppercase tracking-[0.3em] transition-all transform active:scale-95 flex items-center justify-center gap-3 shadow-xl hover:shadow-cyan-500/20"
                onClick={onPlay}
              >
                {hasValidId ? 'Initialize Playback' : 'Access Asset'}
                <i className={`fa-solid ${hasValidId ? 'fa-play' : 'fa-arrow-up-right-from-square'} text-[8px] opacity-50`}></i>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlaylistCard;
