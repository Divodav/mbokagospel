"use client";

import React, { useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Heart, Bell } from "lucide-react";
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
import { cn } from "@/lib/utils";

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
  const [albums, setAlbums] = useState<any[]>([
    { id: 1, name: "Hosanna", year: "2023", cover: "https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=300", songCount: 8 }
  ]);
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
    const viewProps = { 
      initial: { opacity: 0, y: 10 }, 
      animate: { opacity: 1, y: 0 }, 
      exit: { opacity: 0, y: -10 }, 
      transition: { duration: 0.3, ease: "easeOut" as const } 
    };
    
    switch (activeTab) {
      case 'recherche': return <motion.div {...viewProps}><SearchView songs={allSongs} currentSongId={currentSong.id} onPlaySong={playSong} /></motion.div>;
      case 'lyrics': return <motion.div {...viewProps}><LyricsView song={currentSong} /></motion.div>;
      case 'queue': return <motion.div {...viewProps}><QueueView songs={allSongs} currentSongId={currentSong.id} onPlaySong={playSong} /></motion.div>;
      case 'profil': return (
        <motion.div {...viewProps}>
          <ProfileView 
            publishedSongs={allSongs.filter(s => s.artist === "Davin Kangombe")} 
            albums={albums}
            onPublish={(s) => { setAllSongs(p => [s, ...p]); playSong(s); }} 
            onAddAlbum={(a) => setAlbums(p => [a, ...p])}
          />
        </motion.div>
      );
      case 'biblio':
        const favs = allSongs.filter(s => likedSongs.includes(s.id));
        return (
          <motion.div {...viewProps} className="py-4 space-y-6">
            <h2 className="text-3xl font-black text-gradient">Ma Collection</h2>
            <div className="grid gap-2">
              {favs.length ? favs.map(s => (
                <div key={s.id} onClick={() => playSong(s)} className="glass-card-pro p-3 flex items-center gap-4 cursor-pointer">
                  <img src={s.cover} className="w-10 h-10 rounded-lg object-cover" alt="" />
                  <div className="flex-1"><p className="font-bold">{s.title}</p><p className="text-[11px] text-gray-400">{s.artist}</p></div>
                  <Heart fill="#D64E8B" className="text-primary" size={16} />
                </div>
              )) : <div className="text-center py-20 opacity-20 italic">Vide...</div>}
            </div>
          </motion.div>
        );
      default: return <motion.div {...viewProps}><HomeView songs={allSongs} playlists={mockPlaylists} currentSongId={currentSong.id} onPlaySong={playSong} onPlayPlaylist={() => playSong(allSongs[0])} /></motion.div>;
    }
  }, [activeTab, allSongs, albums, currentSong, likedSongs, playSong]);

  return (
    <div className="flex flex-col h-full bg-[#080405] text-white overflow-hidden relative mesh-gradient">
      
      <div className="flex flex-1 overflow-hidden p-1.5 md:p-3 gap-3 relative z-10 h-full">
        <Sidebar activeTab={activeTab} onTabChange={setActiveTab} likedCount={likedSongs.length} />
        
        <main className="flex-1 glass-main rounded-2xl overflow-hidden flex flex-col relative">
          <header className="flex items-center justify-between px-4 py-3 md:px-6 md:py-4 bg-black/20 backdrop-blur-md border-b border-white/5 z-50">
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('accueil')}>
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shadow-lg">
                <Sparkles size={16} className="text-white" />
              </div>
              <div>
                <h1 className="text-lg font-black tracking-tighter leading-none">Mboka<span className="font-light text-white/60 ml-0.5">Gospel</span></h1>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" className="rounded-full w-8 h-8 text-gray-400 hover:text-white hidden md:flex">
                <Bell size={18} />
              </Button>
              <motion.button 
                whileHover={{ scale: 1.05 }}
                onClick={() => setActiveTab('profil')} 
                className="flex items-center gap-2 bg-white/5 p-1 pr-3 rounded-full border border-white/10 transition-all"
              >
                <div className="w-6 h-6 rounded-full overflow-hidden border border-primary/50">
                  <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100" className="object-cover h-full w-full" alt="Profile" />
                </div>
                <span className="text-[11px] font-bold hidden md:block">Davin K.</span>
              </motion.button>
            </div>
          </header>

          <div className="flex-1 overflow-y-auto custom-scrollbar px-4 md:px-8 pb-32">
            <AnimatePresence mode="wait">
              {content}
            </AnimatePresence>
            <MadeWithDyad />
          </div>
        </main>
      </div>

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