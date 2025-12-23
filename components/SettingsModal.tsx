
import React, { useState } from 'react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  spotifyClientId: string;
  onSpotifyClientIdChange: (val: string) => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, spotifyClientId, onSpotifyClientIdChange }) => {
  const [copiedType, setCopiedType] = useState<'full' | 'no-protocol' | null>(null);
  const [isPrivacyMode, setIsPrivacyMode] = useState(true);
  const [isFocused, setIsFocused] = useState(false);
  
  if (!isOpen) return null;

  // Ensure the URI is clean. 
  const rawUri = (window.location.origin + window.location.pathname).replace(/\/$/, "").trim();
  const cleanUri = rawUri.replace(/[^\x00-\x7F]/g, ""); // Strip non-ASCII
  const noProtocolUri = cleanUri.replace(/^https?:\/\//, "");

  const copyToClipboard = (text: string, type: 'full' | 'no-protocol') => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedType(type);
      setTimeout(() => setCopiedType(null), 2000);
    });
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-3 md:p-6 animate-in fade-in duration-300">
      <div className="absolute inset-0 bg-black/95 backdrop-blur-3xl" onClick={onClose}></div>
      
      <div className="relative glass-dark bg-zinc-950/98 w-full max-w-xl rounded-[2.5rem] border border-white/10 p-6 md:p-12 shadow-2xl overflow-y-auto max-h-[90vh] custom-scrollbar ring-1 ring-white/10">
        <div className="absolute -right-20 -top-20 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl"></div>
        
        <div className="relative z-10">
          <div className="flex justify-between items-start mb-6 md:mb-8 border-b border-white/5 pb-6">
            <div>
              <h2 className="serif text-2xl md:text-3xl font-bold mb-1">Bureau of Settings</h2>
              <p className="text-cyan-500 text-[10px] uppercase font-black tracking-widest">Android Connectivity Fix</p>
            </div>
            <button onClick={onClose} className="text-zinc-500 hover:text-white p-2">
              <i className="fa-solid fa-xmark text-xl"></i>
            </button>
          </div>

          <div className="space-y-8">
            {/* Step 1: Client ID with Privacy Shield */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">1. Spotify Client ID</label>
                <button 
                  onClick={() => setIsPrivacyMode(!isPrivacyMode)}
                  className={`flex items-center gap-2 text-[9px] font-black uppercase tracking-widest transition-colors ${isPrivacyMode ? 'text-cyan-500' : 'text-zinc-500 hover:text-white'}`}
                >
                  <i className={`fa-solid ${isPrivacyMode ? 'fa-shield-halved' : 'fa-eye'}`}></i>
                  {isPrivacyMode ? 'Shield Active' : 'Shield Lifted'}
                </button>
              </div>
              <div className="relative group">
                <input 
                  type={(isPrivacyMode && !isFocused) ? "password" : "text"}
                  value={spotifyClientId}
                  onChange={(e) => onSpotifyClientIdChange(e.target.value.trim())}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                  placeholder="Paste 32-character ID..."
                  className={`w-full bg-white/5 border rounded-2xl px-5 py-4 text-sm text-white focus:border-cyan-500 outline-none transition-all font-mono placeholder:text-zinc-800 ${!spotifyClientId ? 'border-amber-500/30' : 'border-white/10'}`}
                />
                {isPrivacyMode && !isFocused && spotifyClientId && (
                  <div className="absolute right-5 top-1/2 -translate-y-1/2 flex gap-1">
                    {[1,2,3].map(i => <div key={i} className="w-1 h-1 bg-cyan-500 rounded-full animate-pulse" style={{ animationDelay: `${i * 0.2}s` }}></div>)}
                  </div>
                )}
              </div>
              <p className="text-[8px] text-zinc-500 italic opacity-60">The Gemini API Key is secured at the environment level and cannot be modified here.</p>
            </div>

            {/* Step 2: Redirect URI */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">2. Redirect URI Control</label>
                <span className="text-[9px] text-amber-500 font-bold uppercase animate-pulse">Fixing Duplication</span>
              </div>
              
              <div className="p-5 bg-black rounded-3xl border border-white/5 space-y-4">
                <div className="text-[11px] font-mono text-cyan-500/80 break-all leading-relaxed bg-zinc-900/50 p-3 rounded-xl border border-white/5">
                  {cleanUri}
                </div>
                
                <div className="grid grid-cols-1 gap-3">
                  <button 
                    onClick={() => copyToClipboard(cleanUri, 'full')}
                    className="w-full py-4 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl text-[10px] font-black uppercase tracking-[0.1em] transition-all flex items-center justify-center gap-3"
                  >
                    {copiedType === 'full' ? <><i className="fa-solid fa-check text-green-500"></i> Full Link Copied</> : <><i className="fa-solid fa-link"></i> Copy Full Link</>}
                  </button>

                  <button 
                    onClick={() => copyToClipboard(noProtocolUri, 'no-protocol')}
                    className="w-full py-4 border border-zinc-800 hover:border-zinc-600 text-zinc-400 hover:text-white rounded-xl text-[10px] font-black uppercase tracking-[0.1em] transition-all flex items-center justify-center gap-3"
                  >
                    {copiedType === 'no-protocol' ? <><i className="fa-solid fa-check text-green-500"></i> Domain Copied</> : <><i className="fa-solid fa-scissors"></i> Copy Without "https://"</>}
                  </button>
                </div>
              </div>
            </div>

            {/* Android Critical Fix Guide */}
            <div className="bg-amber-500/5 border border-amber-500/20 rounded-[2rem] p-6 space-y-5">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-amber-500 flex items-center gap-2">
                <i className="fa-solid fa-triangle-exclamation"></i>
                Critical Android Instructions
              </h3>
              
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="w-6 h-6 rounded-full bg-amber-500 text-black flex items-center justify-center text-[10px] font-black shrink-0">!</div>
                  <p className="text-[11px] text-zinc-300 leading-relaxed font-bold">
                    In the Spotify Dashboard, tap the box and <span className="text-white underline decoration-amber-500 underline-offset-4">DELETE EVERYTHING</span> first. If it says "https://" already, use the "Copy Without" button above.
                  </p>
                </div>
                <div className="flex gap-4">
                  <div className="w-6 h-6 rounded-full bg-zinc-800 flex items-center justify-center text-[10px] font-bold shrink-0">2</div>
                  <p className="text-[11px] text-zinc-400 leading-relaxed">
                    Paste the clean link. If the "Add" button turns purple, tap it.
                  </p>
                </div>
                <div className="flex gap-4">
                  <div className="w-6 h-6 rounded-full bg-zinc-800 flex items-center justify-center text-[10px] font-bold shrink-0">3</div>
                  <p className="text-[11px] text-zinc-400 leading-relaxed">
                    <strong className="text-white">SAVE IS MANDATORY:</strong> Scroll to the very bottom and tap the "SAVE" button or Spotify will forget your changes.
                  </p>
                </div>
              </div>
            </div>

            <button 
              onClick={onClose}
              className="w-full py-5 bg-white text-black rounded-2xl font-black uppercase tracking-[0.3em] text-[10px] hover:bg-cyan-500 hover:text-white transition-all shadow-xl active:scale-95"
            >
              Confirm Setup
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
