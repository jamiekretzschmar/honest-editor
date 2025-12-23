
import React, { useState, useCallback, useEffect } from 'react';
import { GeneratorResult, RequestProfile, ManualItem, PlatformMode, SavedPlaylist } from './types';
import { generatePlaylist, analyzeManualPlaylist } from './geminiService';
import SearchInput from './components/SearchInput';
import ManualEntry from './components/ManualEntry';
import EditorReview from './components/EditorReview';
import PlaylistCard from './components/PlaylistCard';
import TransferStation from './components/TransferStation';
import SettingsModal from './components/SettingsModal';
import LibraryView from './components/LibraryView';

const App: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<GeneratorResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isManualMode, setIsManualMode] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [library, setLibrary] = useState<SavedPlaylist[]>([]);
  const [showLibrary, setShowLibrary] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [spotifyToken, setSpotifyToken] = useState<string | null>(null);
  const [playingIndex, setPlayingIndex] = useState<number | null>(null);
  const [spotifyClientId, setSpotifyClientId] = useState(() => localStorage.getItem('hc_spotify_id') || '');
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    const saved = localStorage.getItem('hc_theme');
    return (saved as 'dark' | 'light') || 'dark';
  });

  // Spotify Auth Management
  useEffect(() => {
    const hash = window.location.hash;
    if (hash) {
      const params = new URLSearchParams(hash.substring(1));
      const token = params.get('access_token');
      if (token) {
        setSpotifyToken(token);
        showToast("Spotify Connectivity Established.");
        window.history.replaceState(null, '', window.location.pathname + window.location.search);
      }
    }
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem('hc_library');
    if (stored) {
      try {
        setLibrary(JSON.parse(stored));
      } catch (e) {
        console.error("Failed to load library", e);
      }
    }
  }, []);

  useEffect(() => {
    // Apply theme class to documentElement for global CSS variable control
    if (theme === 'light') {
      document.documentElement.classList.add('light-theme');
    } else {
      document.documentElement.classList.remove('light-theme');
    }
    localStorage.setItem('hc_theme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('hc_spotify_id', spotifyClientId);
  }, [spotifyClientId]);

  const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');

  const saveToLocalStorage = (newLibrary: SavedPlaylist[]) => {
    localStorage.setItem('hc_library', JSON.stringify(newLibrary));
    setLibrary(newLibrary);
  };

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleSearch = useCallback(async (query: string, config: Partial<RequestProfile>) => {
    setLoading(true);
    setResult(null);
    setError(null);
    setShowLibrary(false);
    setPlayingIndex(null);
    try {
      const data = await generatePlaylist(query, config);
      setResult(data);
    } catch (err: any) {
      console.error(err);
      setError("The curation engines are currently overwhelmed. Please try a different vibe.");
    } finally {
      setLoading(false);
    }
  }, []);

  const handleManualAnalyze = useCallback(async (items: ManualItem[]) => {
    setLoading(true);
    setResult(null);
    setError(null);
    setShowLibrary(false);
    setPlayingIndex(null);
    try {
      const data = await analyzeManualPlaylist(items);
      setResult(data);
    } catch (err: any) {
      console.error(err);
      setError("The editor is currently unavailable to review your manual collection.");
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSavePlaylist = () => {
    if (!result) return;
    
    const defaultName = result.profile.keywords || "New Collection";
    const name = window.prompt("Enter a name for this collection:", defaultName);
    
    // Graceful cancellation handling
    if (name === null) return;
    
    const finalName = name.trim() || defaultName;

    const newEntry: SavedPlaylist = {
      id: Math.random().toString(36).substr(2, 9),
      name: finalName,
      date: new Date().toLocaleDateString(),
      data: result
    };
    
    const updated = [newEntry, ...library];
    saveToLocalStorage(updated);
    showToast(`Playlist "${finalName}" archived in local storage.`);
  };

  const deleteFromLibrary = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = library.filter(p => p.id !== id);
    saveToLocalStorage(updated);
  };

  const loadFromLibrary = (saved: SavedPlaylist) => {
    setResult(saved.data);
    setShowLibrary(false);
    setIsManualMode(false);
    setPlayingIndex(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    showToast(`Loaded "${saved.name}" from archives.`);
  };

  const clearCurrentCuration = () => {
    setResult(null);
    setIsManualMode(false);
    setShowLibrary(false);
    setPlayingIndex(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNext = () => {
    if (result && playingIndex !== null && playingIndex < result.items.length - 1) {
      setPlayingIndex(playingIndex + 1);
    }
  };

  const handlePrev = () => {
    if (result && playingIndex !== null && playingIndex > 0) {
      setPlayingIndex(playingIndex - 1);
    }
  };

  const connectSpotify = () => {
    if (!spotifyClientId) {
      showToast("Configuration Required: Client ID missing.");
      setIsSettingsOpen(true);
      return;
    }
    const REDIRECT_URI = window.location.origin + window.location.pathname;
    const SCOPES = 'playlist-modify-public user-read-private';
    const authUrl = `https://accounts.spotify.com/authorize?client_id=${spotifyClientId}&response_type=token&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&scope=${encodeURIComponent(SCOPES)}`;
    window.location.href = authUrl;
  };

  return (
    <div className={`min-h-screen flex flex-col selection:bg-cyan-500 selection:text-white pb-24 transition-colors duration-500`}>
      {toast && (
        <div className="fixed top-8 left-1/2 -translate-x-1/2 z-[120] animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="bg-black dark:bg-white text-white dark:text-black px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-2xl flex items-center gap-3 border border-white/10">
            <i className="fa-solid fa-check-circle text-cyan-500"></i>
            {toast}
          </div>
        </div>
      )}

      <SettingsModal 
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        spotifyClientId={spotifyClientId}
        onSpotifyClientIdChange={setSpotifyClientId}
      />

      <header className="pt-8 md:pt-16 pb-12 text-center px-4 relative">
        <div className="flex justify-between items-center max-w-7xl mx-auto mb-12 px-4">
          <div className="flex gap-4">
            <button 
              onClick={toggleTheme}
              className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center glass rounded-full hover:scale-110 active:scale-95 transition-all text-sm md:text-base shadow-xl group"
              title="Toggle Appearance"
            >
              {theme === 'dark' ? (
                <i className="fa-solid fa-sun text-amber-400 group-hover:rotate-45 transition-transform duration-500"></i>
              ) : (
                <i className="fa-solid fa-moon text-indigo-600 group-hover:-rotate-12 transition-transform duration-500"></i>
              )}
            </button>
            <button 
              onClick={() => setIsSettingsOpen(true)}
              className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center glass rounded-full hover:scale-110 transition-all text-sm md:text-base shadow-xl"
              title="Bureau of Settings"
            >
              <i className="fa-solid fa-sliders text-zinc-400"></i>
            </button>
          </div>
          
          <button 
            onClick={() => setShowLibrary(!showLibrary)}
            className={`flex items-center gap-3 px-4 md:px-6 py-2 md:py-3 glass rounded-full text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all group shadow-xl ${showLibrary ? 'bg-cyan-500 text-white border-cyan-400' : 'hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black'}`}
          >
            <i className="fa-solid fa-book-bookmark group-hover:scale-110 transition-transform"></i>
            Library ({library.length})
          </button>
        </div>

        <div className="flex flex-col items-center">
          <div className="mb-10 relative group">
            <div className="absolute inset-0 bg-cyan-500/20 blur-3xl group-hover:bg-cyan-500/40 transition-all duration-1000"></div>
            <div 
              className="relative w-28 h-28 md:w-40 md:h-40 p-1.5 rounded-[2.5rem] bg-gradient-to-br from-cyan-400 to-blue-600 glass flex items-center justify-center overflow-hidden shadow-[0_0_60px_-15px_rgba(6,182,212,0.5)] animate-in zoom-in-75 duration-700 cursor-pointer"
              onClick={clearCurrentCuration}
            >
               <img src="https://image.pollinations.ai/prompt/a%20sleek%20modern%20circular%20logo%20dark%20blue%20background%20magnifying%20glass%20over%20a%20globe%20revealing%20connected%20musical%20notes%20and%20nodes%20clean%20white%20lines%20minimalist%20luxury%20design?width=400&height=400&nologo=true" alt="The Honest Curator Logo" className="w-full h-full object-cover rounded-[2rem]" />
            </div>
          </div>

          <div className="inline-block px-5 py-2 bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-full text-[9px] md:text-[10px] font-black tracking-[0.4em] uppercase mb-8 text-zinc-500 dark:text-zinc-400 backdrop-blur-sm">
            High Fidelity Digital Curation
          </div>
          
          <h1 className="serif text-4xl md:text-8xl mb-6 font-bold tracking-tighter cursor-pointer group" onClick={clearCurrentCuration}>
            The <span className="italic font-normal opacity-80 group-hover:opacity-100 transition-opacity">Honest</span> Curator
          </h1>
          
          <p className="max-w-xl mx-auto text-zinc-500 dark:text-zinc-400 text-base md:text-xl font-light leading-relaxed italic px-4">
            "Taste is not a democracy. It is a standard."
          </p>
        </div>
      </header>

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 md:px-6">
        {error && (
          <div className="mb-8 p-6 bg-red-500/10 border border-red-500/20 rounded-3xl text-red-500 text-center animate-in fade-in">
             <i className="fa-solid fa-circle-exclamation mb-2 text-2xl block"></i>
             {error}
          </div>
        )}

        {showLibrary ? (
          <LibraryView 
            items={library} 
            onLoad={loadFromLibrary} 
            onDelete={deleteFromLibrary} 
            onClose={() => setShowLibrary(false)}
          />
        ) : (
          <>
            <SearchInput 
              onSearch={handleSearch} 
              onToggleManual={() => { setIsManualMode(!isManualMode); setResult(null); }}
              isManualMode={isManualMode}
              isLoading={loading} 
            />

            {isManualMode && !result && (
              <ManualEntry 
                onAnalyze={handleManualAnalyze} 
                isLoading={loading} 
                spotifyToken={spotifyToken}
                onConnectSpotify={connectSpotify}
              />
            )}

            {!result && !loading && !isManualMode && library.length > 0 && (
              <div className="mt-24 md:mt-32 pb-20">
                <LibraryView 
                  items={library} 
                  onLoad={loadFromLibrary} 
                  onDelete={deleteFromLibrary} 
                  isCompact={true}
                />
              </div>
            )}
          </>
        )}

        {loading && (
          <div className="flex flex-col items-center justify-center py-40 space-y-10 animate-in fade-in">
            <div className="relative">
               <div className="w-20 h-20 border-[6px] border-black/5 dark:border-white/5 border-t-cyan-500 rounded-full animate-spin"></div>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold mb-3 serif italic">Analyzing the Vibe...</p>
              <p className="text-zinc-400 text-[10px] uppercase tracking-[0.4em] font-black">Applying Heuristic Filters & Grounding Data</p>
            </div>
          </div>
        )}

        {result && !showLibrary && (
          <div className="animate-in fade-in slide-in-from-bottom-12 duration-1000 ease-out">
            <div className="flex justify-center mb-12">
               <button 
                onClick={clearCurrentCuration}
                className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400 hover:text-cyan-500 transition-colors flex items-center gap-3"
               >
                 <i className="fa-solid fa-rotate-left"></i>
                 Return to Search
               </button>
            </div>

            <EditorReview 
              commentary={result.editorCommentary} 
              vibeScore={result.vibeScore} 
              sources={result.sources}
            />

            <TransferStation 
              result={result} 
              onToast={showToast} 
              spotifyToken={spotifyToken}
              setSpotifyToken={setSpotifyToken}
              spotifyClientId={spotifyClientId}
              onMissingId={() => setIsSettingsOpen(true)}
              onConnectSpotify={connectSpotify}
            />

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 mb-12">
               <div>
                  <h2 className="serif text-4xl mb-2 italic">Curated Units</h2>
                  <p className="text-zinc-500 text-[10px] uppercase font-black tracking-widest">A refined list of {result.items.length} recommendations</p>
               </div>
               <button 
                  onClick={handleSavePlaylist}
                  className="px-8 py-4 glass bg-cyan-500/5 hover:bg-cyan-500 hover:text-white rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all shadow-xl hover:shadow-cyan-500/20 flex items-center gap-3 group"
               >
                  <i className="fa-solid fa-bookmark group-hover:scale-125 transition-transform"></i>
                  Save Playlist
               </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 md:gap-10">
              {result.items.map((item, idx) => (
                <PlaylistCard 
                  key={item.id} 
                  item={item} 
                  mode={result.profile.platformMode as any} 
                  index={idx}
                  isCurrentlyPlaying={playingIndex === idx}
                  onPlay={() => setPlayingIndex(idx)}
                  onPause={() => setPlayingIndex(null)}
                  onNext={handleNext}
                  onPrev={handlePrev}
                  hasNext={idx < result.items.length - 1}
                  hasPrev={idx > 0}
                />
              ))}
            </div>
          </div>
        )}
      </main>

      <footer className="py-24 px-6 border-t border-black/5 dark:border-white/5 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-12">
          <div className="flex items-center gap-6">
             <div className="w-12 h-12 bg-black text-white dark:bg-white dark:text-black rounded-2xl flex items-center justify-center font-black shadow-2xl text-xl">HC</div>
             <div className="flex flex-col">
                <span className="text-sm font-black tracking-[0.4em] uppercase">The Honest Curator</span>
                <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-[0.2em]">Bureau of Global Standards</span>
             </div>
          </div>

          <div className="flex-1 max-w-lg space-y-4">
            <p className="text-[10px] text-zinc-500 font-medium leading-relaxed">
              <strong>AI Disclosure:</strong> All editorial commentary and vibe-alignment scores are synthesized by the Gemini 3 Pro reasoning model. While we strive for peak fidelity, curators are encouraged to verify asset metadata independently.
            </p>
            <div className="flex flex-wrap gap-6 text-[9px] text-zinc-500 font-black uppercase tracking-widest">
              <a href="#" className="hover:text-cyan-500 transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-cyan-500 transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-cyan-500 transition-colors">Cookie Manifesto</a>
              <span className="opacity-30">&copy; 2025 Bureau of Global Standards</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
