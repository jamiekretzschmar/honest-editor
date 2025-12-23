
import React, { useState, useEffect } from 'react';
import { GeneratorResult } from '../types';

interface TransferStationProps {
  result: GeneratorResult;
  onToast: (msg: string) => void;
  spotifyToken: string | null;
  setSpotifyToken: (token: string | null) => void;
  spotifyClientId: string;
  onMissingId: () => void;
  onConnectSpotify: () => void;
}

const TransferStation: React.FC<TransferStationProps> = ({ 
  result, 
  onToast, 
  spotifyToken, 
  setSpotifyToken, 
  spotifyClientId, 
  onMissingId,
  onConnectSpotify 
}) => {
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<string[]>([]);
  const [createdPlaylistUrl, setCreatedPlaylistUrl] = useState<string | null>(null);

  const addLog = (msg: string) => setSyncStatus(prev => [...prev.slice(-8), msg]);

  const youtubeIds = result.items
    .map(i => i.platformId)
    .filter(id => id && id.length === 11);

  const spotifyManifest = result.items
    .map(i => `${i.title} - ${i.creator}`)
    .join('\n');

  const handleYouTubeExport = () => {
    if (youtubeIds.length === 0) {
      onToast("No validated Video IDs found for export.");
      addLog("Deployment Aborted: Missing Visual Assets.");
      return;
    }
    
    addLog(`Compiling ${youtubeIds.length} Validated Units...`);
    const url = `https://www.youtube.com/watch_videos?video_ids=${youtubeIds.join(',')}`;
    
    setTimeout(() => {
      window.open(url, '_blank');
      onToast("Dynamic YouTube Session Exported.");
      addLog("Session Launched Successfully.");
    }, 800);
  };

  const handleSpotifyTransfer = () => {
    navigator.clipboard.writeText(spotifyManifest);
    onToast("Manifest Copied. Use 'Import from Text' in Spotify/Soundiiz.");
  };

  const directExportToSpotify = async () => {
    if (!spotifyToken) return;
    setIsSyncing(true);
    setSyncStatus([]);
    setCreatedPlaylistUrl(null);
    
    try {
      addLog("Initializing Secure Bridge...");
      
      const meRes = await fetch('https://api.spotify.com/v1/me', {
        headers: { 'Authorization': `Bearer ${spotifyToken}` }
      });
      const userData = await meRes.json();
      
      if (userData.error) {
        if (userData.error.status === 401) {
          setSpotifyToken(null);
          throw new Error("Session expired. Please reconnect.");
        }
        throw new Error(userData.error.message);
      }

      addLog(`User Identified: ${userData.display_name || 'Curator'}`);
      addLog("Provisioning Playlist Container...");
      
      const createRes = await fetch(`https://api.spotify.com/v1/users/${userData.id}/playlists`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${spotifyToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: `HC // ${result.profile.keywords || 'Curation'}`,
          description: `Direct export from The Honest Curator. Vibe Score: ${result.vibeScore}%.`,
          public: true
        })
      });
      const playlistData = await createRes.json();
      if (playlistData.error) throw new Error(playlistData.error.message);
      
      addLog("Container Active. Mapping Assets...");

      const trackUris: string[] = [];
      
      for (const item of result.items) {
        if (item.platformId && item.platformId.length > 5 && !item.url?.includes('youtube.com')) {
          trackUris.push(`spotify:track:${item.platformId}`);
        } else {
          // Heuristic Search Fallback
          addLog(`Resolving ID for: ${item.title.substring(0, 15)}...`);
          const searchRes = await fetch(`https://api.spotify.com/v1/search?q=${encodeURIComponent(item.title + ' ' + item.creator)}&type=track&limit=1`, {
            headers: { 'Authorization': `Bearer ${spotifyToken}` }
          });
          const searchData = await searchRes.json();
          const foundTrack = searchData.tracks?.items?.[0];
          if (foundTrack) {
            trackUris.push(foundTrack.uri);
          }
        }
      }

      if (trackUris.length > 0) {
        addLog(`Injecting ${trackUris.length} validated units...`);
        const addTracksRes = await fetch(`https://api.spotify.com/v1/playlists/${playlistData.id}/tracks`, {
          method: 'POST',
          headers: { 
            'Authorization': `Bearer ${spotifyToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ uris: trackUris })
        });
        const addTracksData = await addTracksRes.json();
        if (addTracksData.error) throw new Error(addTracksData.error.message);

        setCreatedPlaylistUrl(playlistData.external_urls.spotify);
        addLog("Sync Finalized. Deployment Successful.");
        onToast("Spotify Playlist Created.");
      } else {
        addLog("No direct matches found. Integrity requires manual intervention.");
        onToast("Playlist Created (No tracks found).");
      }
    } catch (err: any) {
      console.error(err);
      addLog(`CRITICAL: ${err.message || 'Stream Interrupted.'}`);
      onToast(err.message || "Direct Export Failed.");
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="glass rounded-[2.5rem] p-8 md:p-12 mb-16 border-cyan-500/10 shadow-2xl relative overflow-hidden group transition-all duration-700">
      <div className="absolute -right-20 -top-20 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl group-hover:bg-cyan-500/10 transition-all duration-1000"></div>
      
      <div className="relative z-10 flex flex-col lg:flex-row items-center gap-12">
        <div className="flex-1 text-center lg:text-left">
          <div className="inline-flex items-center gap-3 px-4 py-1.5 bg-cyan-500/10 rounded-full mb-6">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
            </span>
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-cyan-600 dark:text-cyan-400">Transfer Station Active</span>
          </div>
          <h2 className="serif text-4xl md:text-5xl font-bold mb-4 tracking-tight">Deploy This Collection</h2>
          <p className="text-zinc-500 dark:text-zinc-400 text-sm md:text-base italic max-w-lg mx-auto lg:mx-0 leading-relaxed">
            "Taste is meant to be shared. Bridge the gap from curation to your active listening libraries."
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full lg:w-auto">
          <button 
            onClick={handleYouTubeExport}
            className="flex flex-col items-center justify-center gap-4 p-8 glass-dark bg-black/90 text-white rounded-[2rem] hover:bg-red-600 transition-all group/btn min-w-[220px] border border-white/5 shadow-2xl"
          >
            <div className="relative">
              <i className="fa-brands fa-youtube text-4xl group-hover/btn:scale-110 transition-transform"></i>
              {youtubeIds.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-white text-black text-[8px] font-black px-1.5 py-0.5 rounded-md shadow-lg border border-red-600/50">
                  {youtubeIds.length}
                </span>
              )}
            </div>
            <div className="text-center">
              <span className="block text-[10px] font-black uppercase tracking-widest mb-1">Export to YouTube</span>
              <span className="text-[8px] opacity-60 uppercase tracking-tighter">Launch Video Session</span>
            </div>
          </button>

          <div className="flex flex-col gap-2">
            {!spotifyToken ? (
              <button 
                onClick={onConnectSpotify}
                className="flex flex-col items-center justify-center gap-4 p-8 glass-dark bg-black/90 text-white rounded-[2rem] hover:bg-green-600 transition-all group/btn min-w-[220px] border border-white/5 shadow-2xl"
              >
                <i className="fa-brands fa-spotify text-4xl group-hover/btn:scale-110 transition-transform"></i>
                <div className="text-center">
                  <span className="block text-[10px] font-black uppercase tracking-widest mb-1">Connect Spotify</span>
                  <span className="text-[8px] opacity-60 uppercase tracking-tighter">Authorize Deployment</span>
                </div>
              </button>
            ) : (
              <button 
                disabled={isSyncing}
                onClick={directExportToSpotify}
                className={`flex flex-col items-center justify-center gap-4 p-8 glass-dark bg-black/90 text-white rounded-[2rem] hover:bg-cyan-600 transition-all group/btn min-w-[220px] border border-white/5 relative overflow-hidden shadow-2xl ${isSyncing ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {isSyncing ? (
                  <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <i className="fa-solid fa-cloud-arrow-up text-4xl group-hover/btn:scale-110 transition-transform"></i>
                )}
                <div className="text-center">
                  <span className="block text-[10px] font-black uppercase tracking-widest mb-1">Create Playlist</span>
                  <span className="text-[8px] opacity-60 uppercase tracking-tighter">Direct Sync</span>
                </div>
              </button>
            )}
            
            <button 
              onClick={handleSpotifyTransfer}
              className="text-zinc-500 hover:text-cyan-500 text-[8px] uppercase font-black tracking-widest py-2 transition-colors"
            >
              Or Copy Manual Manifest
            </button>
          </div>
        </div>
      </div>
      
      {createdPlaylistUrl && (
        <div className="mt-8 p-6 bg-cyan-500/10 border border-cyan-500/20 rounded-[2rem] animate-in slide-in-from-bottom-4 duration-500 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-cyan-500 flex items-center justify-center text-white text-xl">
              <i className="fa-solid fa-play"></i>
            </div>
            <div>
              <p className="text-sm font-bold">Playlist Deployment Successful</p>
              <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-black">Ready for immediate consumption</p>
            </div>
          </div>
          <a 
            href={createdPlaylistUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="px-8 py-3 bg-white text-black rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-cyan-500 hover:text-white transition-all shadow-lg"
          >
            Open in Spotify <i className="fa-solid fa-external-link ml-2"></i>
          </a>
        </div>
      )}

      {(syncStatus.length > 0 || isSyncing) && (
        <div className="mt-10 pt-8 border-t border-black/5 dark:border-white/5 animate-in slide-in-from-top-4 duration-700">
          <div className="bg-black/5 dark:bg-black/40 rounded-2xl p-6 font-mono text-[10px] leading-relaxed shadow-inner border border-white/5">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-cyan-500 font-bold">STATION_LOG:</span>
              {isSyncing && <span className="text-zinc-500 animate-pulse italic">Awaiting API confirmation...</span>}
            </div>
            <div className="space-y-1.5 custom-scrollbar max-h-40 overflow-y-auto">
              {syncStatus.map((log, i) => (
                <div key={i} className="flex gap-4">
                  <span className="opacity-20 select-none">[{new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', second: '2-digit'})}]</span>
                  <span className={i === syncStatus.length - 1 ? 'text-white' : 'text-zinc-500'}>
                    {i === syncStatus.length - 1 && <span className="text-cyan-500 mr-2">&gt;</span>}
                    {log}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransferStation;
