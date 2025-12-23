
import React, { useState, useEffect } from 'react';
import { ManualItem } from '../types';

interface ManualEntryProps {
  onAnalyze: (items: ManualItem[]) => void;
  isLoading: boolean;
  spotifyToken: string | null;
  onConnectSpotify: () => void;
}

interface SpotifyTrack {
  id: string;
  name: string;
  artists: { name: string }[];
  album: { images: { url: string }[] };
}

const ManualEntry: React.FC<ManualEntryProps> = ({ onAnalyze, isLoading, spotifyToken, onConnectSpotify }) => {
  const [items, setItems] = useState<ManualItem[]>([
    { id: '1', title: '', creator: '' }
  ]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SpotifyTrack[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const addItem = () => {
    setItems([...items, { id: Math.random().toString(36).substr(2, 9), title: '', creator: '' }]);
  };

  const removeItem = (id: string) => {
    if (items.length > 1) {
      setItems(items.filter(item => item.id !== id));
    }
  };

  const updateItem = (id: string, field: keyof ManualItem, value: string) => {
    setItems(items.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const handleAnalyze = () => {
    const validItems = items.filter(i => i.title.trim() && i.creator.trim());
    if (validItems.length > 0) {
      onAnalyze(validItems);
    }
  };

  const searchSpotify = async () => {
    if (!searchQuery.trim() || !spotifyToken) return;
    setIsSearching(true);
    try {
      const res = await fetch(`https://api.spotify.com/v1/search?q=${encodeURIComponent(searchQuery)}&type=track&limit=6`, {
        headers: { 'Authorization': `Bearer ${spotifyToken}` }
      });
      const data = await res.json();
      setSearchResults(data.tracks?.items || []);
    } catch (e) {
      console.error("Spotify Search Error", e);
    } finally {
      setIsSearching(false);
    }
  };

  const inductTrack = (track: SpotifyTrack) => {
    const newItem: ManualItem = {
      id: Math.random().toString(36).substr(2, 9),
      title: track.name,
      creator: track.artists.map(a => a.name).join(', '),
      platformId: track.id // Preserving verified ID
    };
    
    // Replace first empty slot or append
    const emptyIdx = items.findIndex(i => !i.title.trim() && !i.creator.trim());
    if (emptyIdx !== -1) {
      const newItems = [...items];
      newItems[emptyIdx] = newItem;
      setItems(newItems);
    } else {
      setItems([...items, newItem]);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto animate-in fade-in duration-700 space-y-8">
      
      {/* Spotify Direct Archive Search */}
      <div className="glass rounded-[2rem] p-8 border-cyan-500/10 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-[0.05] pointer-events-none">
          <i className="fa-brands fa-spotify text-9xl"></i>
        </div>
        
        <div className="relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
            <div>
              <h2 className="serif text-3xl font-bold italic mb-1">Archive Query</h2>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-cyan-600">Spotify Global Database Access</p>
            </div>
            {!spotifyToken && (
              <button 
                onClick={onConnectSpotify}
                className="px-6 py-2.5 bg-green-600 text-white rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-green-500 transition-all flex items-center gap-3 shadow-lg"
              >
                <i className="fa-brands fa-spotify"></i>
                Connect Spotify to Search
              </button>
            )}
          </div>

          {spotifyToken && (
            <div className="space-y-6">
              <div className="flex gap-3">
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && searchSpotify()}
                  placeholder="Query artist, track, or album..."
                  className="flex-1 bg-black/20 dark:bg-zinc-900 border border-white/10 rounded-xl px-5 py-4 text-sm outline-none focus:border-cyan-500/50 transition-all"
                />
                <button 
                  onClick={searchSpotify}
                  disabled={isSearching}
                  className="bg-white text-black px-8 rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-cyan-500 hover:text-white transition-all disabled:opacity-50"
                >
                  {isSearching ? <i className="fa-solid fa-spinner animate-spin"></i> : 'Query'}
                </button>
              </div>

              {searchResults.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 animate-in slide-in-from-top-4 duration-500">
                  {searchResults.map(track => (
                    <div key={track.id} className="p-3 bg-white/5 border border-white/5 rounded-2xl flex items-center gap-4 group/item hover:border-cyan-500/30 transition-all">
                      <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0 shadow-lg">
                        <img src={track.album.images[0]?.url} alt={track.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-bold truncate group-hover/item:text-cyan-400 transition-colors">{track.name}</h4>
                        <p className="text-[9px] text-zinc-500 uppercase font-black tracking-tighter truncate">{track.artists[0].name}</p>
                      </div>
                      <button 
                        onClick={() => inductTrack(track)}
                        className="w-8 h-8 rounded-full bg-cyan-500/10 text-cyan-500 flex items-center justify-center hover:bg-cyan-500 hover:text-white transition-all"
                        title="Add to Collection"
                      >
                        <i className="fa-solid fa-plus text-[10px]"></i>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Manual Collection Staging */}
      <div className="glass rounded-[2rem] p-8 border-white/10 shadow-2xl">
        <div className="flex justify-between items-center mb-8 border-b border-white/5 pb-6">
          <div>
            <h2 className="serif text-3xl italic mb-1">Collection Staging</h2>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500">Draft your curated sequence</p>
          </div>
          <button 
            onClick={addItem}
            className="bg-zinc-800 hover:bg-zinc-700 text-white px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border border-white/5 shadow-xl"
          >
            New Slot <i className="fa-solid fa-plus ml-2"></i>
          </button>
        </div>

        <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
          {items.map((item, index) => (
            <div key={item.id} className={`flex gap-4 items-center animate-in slide-in-from-left-4 duration-300 p-4 rounded-2xl border transition-all ${item.platformId ? 'bg-cyan-500/5 border-cyan-500/20' : 'bg-zinc-900/30 border-white/5'}`}>
              <span className="text-zinc-600 font-mono text-[10px] w-6 shrink-0">{index + 1}.</span>
              <div className="flex-1 flex flex-col md:flex-row gap-4">
                <div className="flex-[2] relative">
                  <input 
                    placeholder="Title (e.g., Paranoid Android)"
                    value={item.title}
                    onChange={(e) => updateItem(item.id, 'title', e.target.value)}
                    className="w-full bg-transparent border-b border-zinc-800 focus:border-cyan-500/50 px-2 py-2 text-sm text-white outline-none transition-all"
                  />
                </div>
                <div className="flex-1 relative">
                  <input 
                    placeholder="Artist/Channel (e.g., Radiohead)"
                    value={item.creator}
                    onChange={(e) => updateItem(item.id, 'creator', e.target.value)}
                    className="w-full bg-transparent border-b border-zinc-800 focus:border-cyan-500/50 px-2 py-2 text-sm text-white outline-none transition-all"
                  />
                </div>
              </div>
              <div className="flex items-center gap-3">
                {item.platformId && (
                  <div className="w-6 h-6 rounded-full bg-cyan-500 flex items-center justify-center text-[10px] text-white" title="Verified ID Connected">
                    <i className="fa-solid fa-link"></i>
                  </div>
                )}
                <button 
                  onClick={() => removeItem(item.id)}
                  className="text-zinc-600 hover:text-red-400 p-2 transition-colors"
                >
                  <i className="fa-solid fa-trash-can"></i>
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 flex justify-center">
          <button
            onClick={handleAnalyze}
            disabled={isLoading || items.every(i => !i.title.trim())}
            className="bg-white text-black px-16 py-5 rounded-2xl font-black uppercase tracking-[0.3em] hover:bg-cyan-500 hover:text-white transition-all active:scale-95 disabled:opacity-50 shadow-2xl flex items-center justify-center min-w-[320px]"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <i className="fa-solid fa-gavel mr-4 opacity-50"></i>
                Final Editorial Review
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ManualEntry;
