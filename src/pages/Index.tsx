"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, LogIn, Crown, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MobileNav } from "@/components/MobileNav";
import { HomeView } from "@/components/HomeView";
import { SearchView } from "@/components/SearchView";
import { LyricsView } from "@/components/LyricsView";
import { QueueView } from "@/components/QueueView";
import { ProfileView } from "@/components/ProfileView";
import { SubscriptionView } from "@/components/SubscriptionView";
import { Sidebar } from "@/components/Sidebar";
import { Player } from "@/components/Player";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { showError, showSuccess } from "@/utils/toast";
import { cn } from "@/lib/utils";

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

  // Nouveaux états pour le lecteur
  const [isShuffle, setIsShuffle] = useState(false);
  const [repeatMode, setRepeatMode] = useState<'none' | 'one' | 'all'>('none');
  const [queue, setQueue] = useState<any[]>([]);

  const fetchData = useCallback(async () => {
    const { data: songsData } = await supabase.from('songs').select('*').order('created_at', { ascending: false });
    const { data: albumsData } = await supabase.from('albums').select('*').order('created_at', { ascending: false });
    
    if (songsData) {
      setAllSongs(songsData);
      setQueue(songsData); // Initialiser la file d'attente par défaut
      
      // Persistance : Charger le dernier titre écouté
      const lastSongId = localStorage.getItem('last_song_id');
      if (lastSongId) {
        const lastSong = songsData.find(s => s.id === lastSongId);
        if (lastSong) setCurrentSong(lastSong);
      } else if (songsData.length > 0 && !currentSong) {
        setCurrentSong(songsData[0]);
      }
    }
    if (albumsData) setAlbums(albumsData);
  }, [currentSong]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Sauvegarder l'ID du titre actuel
  useEffect(() => {
    if (currentSong?.id) {
      localStorage.setItem('last_song_id', currentSong.id);
    }
  }, [currentSong]);

  const playSong = useCallback((song: any) => {
    setCurrentSong(song);
    setIsPlaying(true);
    setProgress(0);
  }, []);

  const togglePlay = useCallback(() => setIsPlaying(prev => !prev), []);
  
  const handleSkipNext = useCallback(() => {
    if (queue.length === 0) return;
    
    if (repeatMode === 'one') {
      setProgress(0);
      setIsPlaying(true);
      return;
    }

    let nextIdx;
    if (isShuffle) {
      nextIdx = Math.floor(Math.random() * queue.length);
    } else {
      const currentIdx = queue.findIndex(s => s.id === currentSong?.id);
      nextIdx = (currentIdx + 1) % queue.length;
      
      // Si on arrive à la fin et que repeat est à none
      if (nextIdx === 0 && repeatMode === 'none') {
        setIsPlaying(false);
        return;
      }
    }
    
    playSong(queue[nextIdx]);
  }, [queue, currentSong, playSong, isShuffle, repeatMode]);

  const handleSkipBack = useCallback(() => {
    if (queue.length === 0) return;
    const currentIdx = queue.findIndex(s => s.id === currentSong?.id);
    const prevIdx = (currentIdx - 1 + queue.length) % queue.length;
    playSong(queue[prevIdx]);
  }, [queue, currentSong, playSong]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setActiveTab('accueil');
    showSuccess("Déconnexion réussie");
  };

  const handleSubscription = (plan: 'monthly' | 'yearly') => {
    if (!session) {
      showError("Veuillez vous connecter pour vous abonner.");
      navigate('/login');
      return;
    }
    showSuccess(`Initialisation de l'abonnement ${plan}...`);
  };

  const content = useMemo(() => {
    if (activeTab === 'profil' && !session) {
      return (
        <div className="flex flex-col items-center justify-center h-[60vh] text-center p-8">
          <Sparkles size={48} className="text-primary mb-4 opacity-20" />
          <h2 className="text-lg font-bold mb-2">Espace Artiste</h2>
          <p className="text-gray-400 mb-6 text-xs">Connectez-vous pour gérer votre profil.</p>
          <Button onClick={() => navigate('/login')} className="bg-primary gap-2 rounded-full px-6 h-9 text-xs text-white">
            <LogIn size={16} /> Se connecter
          </Button>
        </div>
      );
    }

    switch (activeTab) {
      case 'recherche': return <SearchView songs={allSongs} currentSongId={currentSong?.id} onPlaySong={playSong} />;
      case 'lyrics': return currentSong && <LyricsView song={currentSong} />;
      case 'queue': return <QueueView songs={queue} currentSongId={currentSong?.id} onPlaySong={playSong} />;
      case 'premium': return <SubscriptionView onSubscribe={handleSubscription} />;
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
  }, [activeTab, allSongs, albums, currentSong, queue, session, user, navigate, playSong, fetchData]);

  return (
    <div className="flex flex-col h-full bg-[#080405] text-white overflow-hidden relative mesh-gradient">
      <div className="flex flex-1 overflow-hidden p-1 md:p-3 gap-2 md:gap-3 relative z-10 h-full">
        <Sidebar activeTab={activeTab} onTabChange={setActiveTab} likedCount={likedSongs.length} />
        
        <main className="flex-1 glass-main rounded-xl md:rounded-2xl overflow-hidden flex flex-col relative">
          <header className="flex items-center justify-between px-3 py-2 md:px-6 md:py-4 bg-black/40 backdrop-blur-xl border-b border-white/5 z-50">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => setActiveTab('accueil')}>
              <div className="w-7 h-7 bg-primary rounded-lg flex items-center justify-center shadow-lg"><Sparkles size={14} className="text-white" /></div>
              <h1 className="text-base font-black tracking-tighter">Mboka<span className="font-light text-white/60 ml-0.5">Gospel</span></h1>
            </div>

            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setActiveTab('premium')} 
                className={cn("h-7 text-[9px] font-black gap-1.5 rounded-full px-3 border border-primary/20 bg-primary/10 text-primary", activeTab === 'premium' && "bg-primary text-white")}
              >
                <Crown size={12} fill="currentColor" /> PREMIUM
              </Button>
              {session ? (
                <div className="flex items-center gap-2">
                  <motion.button onClick={() => setActiveTab('profil')} className="flex items-center gap-2 bg-white/5 p-1 pr-2.5 rounded-full border border-white/10 hover:bg-white/10 transition-colors">
                    <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center text-[9px] font-bold">
                      {user?.email?.[0].toUpperCase()}
                    </div>
                    <span className="text-[10px] font-bold hidden md:block">Profil</span>
                  </motion.button>
                  <Button variant="ghost" size="icon" onClick={handleLogout} className="h-7 w-7 rounded-full text-gray-500 hover:text-red-400">
                    <LogOut size={14} />
                  </Button>
                </div>
              ) : (
                <Button variant="ghost" size="sm" onClick={() => navigate('/login')} className="h-7 text-[10px] font-bold gap-1.5 rounded-full border border-white/10 px-3">
                  <LogIn size={12} /> Connexion
                </Button>
              )}
            </div>
          </header>

          <div className="flex-1 overflow-y-auto custom-scrollbar px-3 md:px-8 pb-28 md:pb-32">
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
          isShuffle={isShuffle} repeatMode={repeatMode}
          onToggleShuffle={() => setIsShuffle(!isShuffle)}
          onToggleRepeat={() => setRepeatMode(curr => curr === 'none' ? 'all' : curr === 'all' ? 'one' : 'none')}
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