"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Heart, Bell, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MobileNav } from "@/components/MobileNav";
import { HomeView } from "@/components/HomeView";
import { SearchView } from "@/components/SearchView";
import { LyricsView } from "@/components/LyricsView";
import { QueueView } from "@/components/QueueView";
import { ProfileView } from "@/components/ProfileView";
import { Sidebar } from "@/components/Sidebar";
import { Player } from "@/components/Player";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { showError } from "@/utils/toast";

const Index = () => {
  const { user, session } = useAuth();
  const navigate = useNavigate();
  const [allSongs, setAllSongs] = useState<any[]>([]);
  const [albums, setAlbums] = useState<any[]>([]);
  const [currentSong, setCurrentSong] = useState<any>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [activeTab, setActiveTab] = useState('accueil');
  const [likedSongs, setLikedSongs] = useState<string[]>([]);

  const fetchData = useCallback(async () => {
    const { data: songsData } = await supabase.from('songs').select('*').order('created_at', { ascending: false });
    const { data: albumsData } = await supabase.from('albums').select('*').order('created_at', { ascending: false });
    
    if (songsData) {
      setAllSongs(songsData);
      // Ne changer le titre en cours que s'il n'y en a pas déjà un
      if (songsData.length > 0 && !currentSong) setCurrentSong(songsData[0]);
    }
    if (albumsData) setAlbums(albumsData);
  }, [currentSong]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const playSong = useCallback((song: any) => {
    setCurrentSong(song);
    setIsPlaying(true);
    setProgress(0);
  }, []);

  const togglePlay = useCallback(() => setIsPlaying(prev => !prev), []);
  
  const handleSkipNext = useCallback(() => {
    if (allSongs.length === 0) return;
    const idx = allSongs.findIndex(s => s.id === currentSong?.id);
    playSong(allSongs[(idx + 1) % allSongs.length]);
  }, [allSongs, currentSong, playSong]);

  const handleSkipBack = useCallback(() => {
    if (allSongs.length === 0) return;
    const idx = allSongs.findIndex(s => s.id === currentSong?.id);
    playSong(allSongs[(idx - 1 + allSongs.length) % allSongs.length]);
  }, [allSongs, currentSong, playSong]);

  const content = useMemo(() => {
    if (activeTab === 'profil' && !session) {
      return (
        <div className="flex flex-col items-center justify-center h-[60vh] text-center p-8">
          <Sparkles size={48} className="text-primary mb-4 opacity-20" />
          <h2 className="text-xl font-bold mb-2">Espace Artiste</h2>
          <p className="text-gray-400 mb-6 text-sm">Connectez-vous pour publier vos titres et gérer votre profil.</p>
          <Button onClick={() => navigate('/login')} className="bg-primary gap-2 rounded-full px-8 text-white">
            <LogIn size={18} /> Se connecter
          </Button>
        </div>
      );
    }

    switch (activeTab) {
      case 'recherche': return <SearchView songs={allSongs} currentSongId={currentSong?.id} onPlaySong={playSong} />;
      case 'lyrics': return currentSong && <LyricsView song={currentSong} />;
      case 'queue': return <QueueView songs={allSongs} currentSongId={currentSong?.id} onPlaySong={playSong} />;
      case 'profil': return (
        <ProfileView 
          publishedSongs={allSongs.filter(s => s.artist_id === user?.id)} 
          albums={albums.filter(a => a.artist_id === user?.id)}
          onPublish={fetchData} 
          onAddAlbum={fetchData}
        />
      );
      default: return (
        <HomeView 
          songs={allSongs} 
          playlists={[]} 
          currentSongId={currentSong?.id} 
          onPlaySong={playSong} 
          onPlayPlaylist={() => {}} 
        />
      );
    }
  }, [activeTab, allSongs, albums, currentSong, session, user, navigate, playSong, fetchData]);

  return (
    <div className="flex flex-col h-full bg-[#080405] text-white overflow-hidden relative mesh-gradient">
      <div className="flex flex-1 overflow-hidden p-1.5 md:p-3 gap-3 relative z-10 h-full">
        <Sidebar activeTab={activeTab} onTabChange={setActiveTab} likedCount={likedSongs.length} />
        
        <main className="flex-1 glass-main rounded-2xl overflow-hidden flex flex-col relative">
          <header className="flex items-center justify-between px-4 py-3 md:px-6 md:py-4 bg-black/20 backdrop-blur-md border-b border-white/5 z-50">
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('accueil')}>
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shadow-lg"><Sparkles size={16} className="text-white" /></div>
              <h1 className="text-lg font-black tracking-tighter">Mboka<span className="font-light text-white/60 ml-0.5">Gospel</span></h1>
            </div>

            <div className="flex items-center gap-3">
              {session ? (
                <motion.button onClick={() => setActiveTab('profil')} className="flex items-center gap-2 bg-white/5 p-1 pr-3 rounded-full border border-white/10">
                  <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-[10px] font-bold">
                    {user?.email?.[0].toUpperCase()}
                  </div>
                  <span className="text-[11px] font-bold hidden md:block">Mon Profil</span>
                </motion.button>
              ) : (
                <Button variant="ghost" size="sm" onClick={() => navigate('/login')} className="text-xs font-bold gap-2 rounded-full border border-white/10">
                  <LogIn size={14} /> Connexion
                </Button>
              )}
            </div>
          </header>

          <div className="flex-1 overflow-y-auto custom-scrollbar px-4 md:px-8 pb-32">
            <AnimatePresence mode="wait">{content}</AnimatePresence>
          </div>
        </main>
      </div>

      {currentSong && (
        <Player 
          currentSong={{
            ...currentSong,
            url: currentSong.audio_url,
            cover: currentSong.cover_url,
            artist: currentSong.artist_name
          }} 
          isPlaying={isPlaying} progress={progress} isLiked={false}
          onTogglePlay={togglePlay} onNext={handleSkipNext} onBack={handleSkipBack}
          onToggleLike={() => {}} onViewChange={setActiveTab} activeView={activeTab}
          onProgressUpdate={setProgress}
        />
      )}
      <MobileNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};

export default Index;