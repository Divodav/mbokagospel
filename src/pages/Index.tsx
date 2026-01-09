"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, LogIn, Crown, LogOut, User as UserIcon } from "lucide-react";
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
import { HomeSkeleton, SearchSkeleton } from "@/components/ViewSkeletons";
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
  const [isLoading, setIsLoading] = useState(true);

  const [isShuffle, setIsShuffle] = useState(false);
  const [repeatMode, setRepeatMode] = useState<'none' | 'one' | 'all'>('none');
  const [queue, setQueue] = useState<any[]>([]);

  const togglePlay = useCallback(() => setIsPlaying(prev => !prev), []);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [songsRes, albumsRes] = await Promise.all([
        supabase.from('songs').select('*').eq('status', 'approved').order('created_at', { ascending: false }),
        supabase.from('albums').select('*').order('created_at', { ascending: false })
      ]);
      
      if (songsRes.data) {
        setAllSongs(songsRes.data);
        setQueue(songsRes.data);
        if (!currentSong) {
          const lastId = localStorage.getItem('last_song_id');
          const lastSong = lastId ? songsRes.data.find(s => s.id === lastId) : null;
          setCurrentSong(lastSong || songsRes.data[0]);
        }
      }
      if (albumsRes.data) setAlbums(albumsRes.data);
    } catch (e) {
      console.error("[Index] Fetch error:", e);
    } finally {
      setIsLoading(false);
    }
  }, [currentSong]);

  useEffect(() => {
    fetchData();
  }, []);

  const playSong = useCallback((song: any) => {
    if (song?.id === currentSong?.id) {
      togglePlay();
    } else {
      setCurrentSong(song);
      setIsPlaying(true);
      setProgress(0);
      localStorage.setItem('last_song_id', song.id);
    }
  }, [currentSong, togglePlay]);

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setActiveTab('accueil');
      showSuccess("Déconnexion réussie");
    } catch (err: any) {
      showError("Erreur lors de la déconnexion");
    }
  };

  const handleSkipNext = useCallback(() => {
    if (queue.length === 0) return;
    const currentIdx = queue.findIndex(s => s.id === currentSong?.id);
    let nextIdx = (currentIdx + 1) % queue.length;
    if (isShuffle) nextIdx = Math.floor(Math.random() * queue.length);
    playSong(queue[nextIdx]);
  }, [queue, currentSong, playSong, isShuffle]);

  const handleSkipBack = useCallback(() => {
    if (queue.length === 0) return;
    const currentIdx = queue.findIndex(s => s.id === currentSong?.id);
    const prevIdx = (currentIdx - 1 + queue.length) % queue.length;
    playSong(queue[prevIdx]);
  }, [queue, currentSong, playSong]);

  const content = useMemo(() => {
    if (isLoading && (activeTab === 'accueil' || activeTab === 'recherche')) {
      return activeTab === 'accueil' ? <HomeSkeleton /> : <SearchSkeleton />;
    }

    const pageTransition = {
      initial: { opacity: 0, scale: 0.98 },
      animate: { opacity: 1, scale: 1 },
      exit: { opacity: 0, scale: 1.02 },
      transition: { duration: 0.25, ease: "easeOut" as const }
    };

    let View;
    switch (activeTab) {
      case 'recherche': View = <SearchView currentSongId={currentSong?.id} onPlaySong={playSong} />; break;
      case 'lyrics': View = currentSong ? <LyricsView song={currentSong} /> : <div className="py-20 text-center text-gray-500">Sélectionnez un titre</div>; break;
      case 'queue': View = <QueueView songs={queue} currentSongId={currentSong?.id} onPlaySong={playSong} />; break;
      case 'premium': View = <SubscriptionView onSubscribe={(p) => showSuccess(`Plan ${p} bientôt disponible`)} />; break;
      case 'profil': View = session ? (
        <ProfileView 
          publishedSongs={allSongs.filter(s => s.artist_id === user?.id)} 
          albums={albums.filter(a => a.artist_id === user?.id)}
          onPublish={fetchData} 
          onAddAlbum={fetchData}
        />
      ) : (
        <div className="flex flex-col items-center justify-center h-[60vh] text-center p-8 space-y-4">
          <h2 className="text-xl font-bold">Espace Artiste</h2>
          <p className="text-gray-400 text-sm max-w-xs">Connectez-vous pour publier vos chants et gérer votre discographie.</p>
          <Button onClick={() => navigate('/login')} className="bg-primary rounded-full px-8">Se connecter</Button>
        </div>
      ); break;
      default: View = (
        <HomeView 
          songs={allSongs} 
          playlists={[]} 
          currentSongId={currentSong?.id} 
          onPlaySong={playSong} 
          onPlayPlaylist={() => {}} 
        />
      );
    }

    return (
      <motion.div key={activeTab} {...pageTransition} className="h-full">
        {View}
      </motion.div>
    );
  }, [activeTab, isLoading, allSongs, albums, currentSong, queue, session, user, navigate, playSong, fetchData]);

  return (
    <div className="flex flex-col h-full bg-[#080405] text-white overflow-hidden relative mesh-gradient font-sans">
      <div className="flex flex-1 overflow-hidden p-0 md:p-3 gap-0 md:gap-3 relative z-10 h-full">
        <Sidebar activeTab={activeTab} onTabChange={setActiveTab} likedCount={0} />
        
        <main className="flex-1 glass-main md:rounded-3xl overflow-hidden flex flex-col relative border-none md:border border-white/5">
          <header className="flex items-center justify-between px-4 py-3 md:px-8 md:py-6 bg-black/20 backdrop-blur-3xl z-50">
            <div className="flex items-center gap-3 cursor-pointer group" onClick={() => setActiveTab('accueil')}>
              <div className="w-8 h-8 bg-primary rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(214,78,139,0.4)] group-hover:scale-110 transition-transform">
                <Sparkles size={16} className="text-white" />
              </div>
              <h1 className="text-lg font-black tracking-tighter">Mboka<span className="text-primary ml-0.5">Gospel</span></h1>
            </div>

            <div className="flex items-center gap-3">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setActiveTab('premium')} 
                className={cn(
                  "h-8 text-[10px] font-black gap-2 rounded-full px-4 border transition-all",
                  activeTab === 'premium' ? "bg-primary border-primary" : "bg-white/5 border-white/10 hover:bg-white/10"
                )}
              >
                <Crown size={12} fill="currentColor" /> PREMIUM
              </Button>
              
              {session ? (
                <div className="flex items-center gap-2">
                  <button onClick={() => setActiveTab('profil')} className="w-8 h-8 rounded-full bg-white/10 border border-white/20 flex items-center justify-center hover:bg-white/20 transition-all">
                    <div className="text-[10px] font-black text-primary">{user?.email?.[0].toUpperCase()}</div>
                  </button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={handleLogout} 
                    className="h-8 w-8 rounded-full text-gray-500 hover:text-red-400 hover:bg-red-400/10"
                  >
                    <LogOut size={14} />
                  </Button>
                </div>
              ) : (
                <Button 
                  onClick={() => navigate('/login')} 
                  variant="ghost" 
                  size="sm" 
                  className="h-8 text-[10px] font-black gap-2 rounded-full px-4 border border-white/10 bg-white/5 hover:bg-white/10"
                >
                  <LogIn size={14} /> CONNEXION
                </Button>
              )}
            </div>
          </header>

          <div className="flex-1 overflow-y-auto custom-scrollbar px-4 md:px-10 pb-32 md:pb-40">
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