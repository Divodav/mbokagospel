"use client";

import React, { useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Heart, Bell, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MadeWithDyad } from "@/components/made-with-dyad";
import { MobileNav } from "@/components/MobileNav";
import { HomeView } from "@/components/HomeView";
import { SearchView } from "@/components/SearchView";
import { LyricsView } from "@/components/LyricsView";
import { QueueView } from "@/components/QueueView";
import { ProfileView } from "@/components/ProfileView";
import { Sidebar } from "@/components/Sidebar";
import { Player } from "@/components/Player";
import { showSuccess } from "@/utils/toast";

const initialSongs = [
  { 
    id: 100, 
    title: "Encore une fois", 
    artist: "Davin Kangombe", 
    album: "Single", 
    duration: "4:32", 
    cover: "https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=300&h=300&fit=crop",
    url: "/Davin_Kangombe_-_Encore_une_fois__ft._Olivier_Balola_(256k).mp3"
  },
  { id: 1, title: "Ebibi", artist: "Moise Mbiye", album: "Héros", duration: "5:12", cover: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300&h=300&fit=crop" },
  { id: 2, title: "Saint Esprit", artist: "Dena Mwana", album: "Célébration", duration: "6:45", cover: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop" },
  { id: 3, title: "Ma Consolation", artist: "Mike Kalambay", album: "Mon Avocat", duration: "4:30", cover: "https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=300&h=300&fit=crop" },
  { id: 4, title: "We Testify", artist: "Deborah Lukalu", album: "Call Me Favourite", duration: "7:10", cover: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&h=300&fit=crop" },
];

const mockPlaylists = [
  { id: 1, name: "Sélection Davin Kangombe", songCount: 12, cover: "https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=400&h=400&fit=crop" },
  { id: 2, name: "Adoration & Prière", songCount: 45, cover: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&h=400&fit=crop" },
  { id: 3, name: "Louange de Feu", songCount: 32, cover: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&h=400&fit=crop" },
];

const Index = () => {
  const [allSongs, setAllSongs] = useState(initialSongs);
  const [currentSong, setCurrentSong] = useState(initialSongs[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [activeTab, setActiveTab] = useState('accueil');
  const [likedSongs, setLikedSongs] = useState<number[]>([]);

  const playSong = useCallback((song: any) => {
    setCurrentSong(song);
    setIsPlaying(true);
    setProgress(0);
  }, []);

  const togglePlay = useCallback(() => setIsPlaying(prev => !prev), []);
  const handleSkipNext = useCallback(() => {
    const idx = allSongs.findIndex(s => s.id === currentSong.id);
    playSong(allSongs[(idx + 1) % allSongs.length]);
  }, [allSongs, currentSong.id, playSong]);

  const handleSkipBack = useCallback(() => {
    const idx = allSongs.findIndex(s => s.id === currentSong.id);
    playSong(allSongs[(idx - 1 + allSongs.length) % allSongs.length]);
  }, [allSongs, currentSong.id, playSong]);

  const toggleLike = useCallback((id: number) => {
    setLikedSongs(prev => {
      const exists = prev.includes(id);
      showSuccess(exists ? "Retiré des favoris" : "Ajouté aux favoris");
      return exists ? prev.filter(sId => sId !== id) : [...prev, id];
    });
  }, []);

  const content = useMemo(() => {
    const viewProps = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -20 }, transition: { duration: 0.4, ease: "easeOut" } };
    
    switch (activeTab) {
      case 'recherche': return <motion.div {...viewProps}><SearchView songs={allSongs} currentSongId={currentSong.id} onPlaySong={playSong} /></motion.div>;
      case 'lyrics': return <motion.div {...viewProps}><LyricsView song={currentSong} /></motion.div>;
      case 'queue': return <motion.div {...viewProps}><QueueView songs={allSongs} currentSongId={currentSong.id} onPlaySong={playSong} /></motion.div>;
      case 'profil': return <motion.div {...viewProps}><ProfileView publishedSongs={allSongs.filter(s => s.artist === "Davin Kangombe" && s.id !== 100)} onPublish={(s) => { setAllSongs(p => [s, ...p]); playSong(s); }} /></motion.div>;
      case 'biblio':
        const favs = allSongs.filter(s => likedSongs.includes(s.id));
        return (
          <motion.div {...viewProps} className="py-6 space-y-8">
            <h2 className="text-5xl font-black text-gradient">Ma Collection</h2>
            <div className="grid gap-3">
              {favs.length ? favs.map(s => (
                <div key={s.id} onClick={() => playSong(s)} className="glass-card-pro p-4 flex items-center gap-5 cursor-pointer">
                  <img src={s.cover} className="w-14 h-14 rounded-2xl object-cover shadow-lg" alt="" />
                  <div className="flex-1"><p className="font-bold text-lg">{s.title}</p><p className="text-sm text-gray-400">{s.artist}</p></div>
                  <motion.div whileTap={{ scale: 1.5 }}><Heart fill="#D64E8B" className="text-primary" size={24} /></motion.div>
                </div>
              )) : <div className="text-center py-32 opacity-20 italic text-xl">Votre sanctuaire musical est vide...</div>}
            </div>
          </motion.div>
        );
      default: return <motion.div {...viewProps}><HomeView songs={allSongs} playlists={mockPlaylists} currentSongId={currentSong.id} onPlaySong={playSong} onPlayPlaylist={() => playSong(allSongs[0])} /></motion.div>;
    }
  }, [activeTab, allSongs, currentSong, likedSongs, playSong]);

  return (
    <div className="flex flex-col h-full bg-[#080405] text-white overflow-hidden relative mesh-gradient">
      
      {/* Structure Main */}
      <div className="flex flex-1 overflow-hidden p-2 md:p-6 gap-6 relative z-10 h-full">
        <Sidebar activeTab={activeTab} onTabChange={setActiveTab} likedCount={likedSongs.length} />
        
        <main className="flex-1 glass-main rounded-[2.5rem] overflow-hidden flex flex-col relative">
          {/* Header App Look */}
          <header className="flex items-center justify-between px-6 py-5 md:px-10 md:py-8 bg-black/10 backdrop-blur-md border-b border-white/5 z-50">
            <div className="flex items-center gap-4 group cursor-pointer" onClick={() => setActiveTab('accueil')}>
              <motion.div 
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ repeat: Infinity, duration: 5 }}
                className="w-10 h-10 bg-primary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/30"
              >
                <Sparkles size={20} className="text-white" />
              </motion.div>
              <div>
                <h1 className="text-xl md:text-2xl font-black tracking-tighter leading-none">Mboka<span className="font-light text-white/60 ml-1">Gospel</span></h1>
                <p className="text-[10px] text-primary font-bold tracking-widest uppercase">Premium Experience</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" className="rounded-full text-gray-400 hover:text-white hidden md:flex">
                <Bell size={20} />
              </Button>
              <div className="h-8 w-[1px] bg-white/10 hidden md:block" />
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveTab('profil')} 
                className="flex items-center gap-3 bg-white/5 hover:bg-white/10 p-1 pr-4 rounded-full border border-white/10 transition-all"
              >
                <div className="w-8 h-8 rounded-full overflow-hidden border border-primary/50">
                  <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100" className="object-cover h-full w-full" alt="Profile" />
                </div>
                <span className="text-xs font-bold hidden md:block">Davin K.</span>
              </motion.button>
            </div>
          </header>

          {/* Contenu Scrollable */}
          <div className="flex-1 overflow-y-auto custom-scrollbar px-6 md:px-12 pb-40 md:pb-32">
            <AnimatePresence mode="wait">
              {content}
            </AnimatePresence>
            <MadeWithDyad />
          </div>
        </main>
      </div>

      {/* Player & Nav - Fixed bottom pour le look mobile app */}
      <Player 
        currentSong={currentSong} isPlaying={isPlaying} progress={progress} isLiked={likedSongs.includes(currentSong.id)}
        onTogglePlay={togglePlay} onNext={handleSkipNext} onBack={handleSkipBack}
        onToggleLike={() => toggleLike(currentSong.id)} onViewChange={setActiveTab} activeView={activeTab}
        onProgressUpdate={setProgress}
      />
      
      <MobileNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};

export default Index;