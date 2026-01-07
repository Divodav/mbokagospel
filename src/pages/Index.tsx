"use client";

import React, { useState, useCallback } from "react";
import { Sparkles, Heart } from "lucide-react";
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

  const renderContent = () => {
    switch (activeTab) {
      case 'recherche': return <SearchView songs={allSongs} currentSongId={currentSong.id} onPlaySong={playSong} />;
      case 'lyrics': return <LyricsView song={currentSong} />;
      case 'queue': return <QueueView songs={allSongs} currentSongId={currentSong.id} onPlaySong={playSong} />;
      case 'profil': return <ProfileView publishedSongs={allSongs.filter(s => s.artist === "Davin Kangombe" && s.id !== 100)} onPublish={(s) => { setAllSongs(p => [s, ...p]); playSong(s); }} />;
      case 'biblio':
        const favs = allSongs.filter(s => likedSongs.includes(s.id));
        return (
          <div className="py-6 space-y-8">
            <h2 className="text-4xl font-black text-gradient">Ma Collection</h2>
            <div className="grid gap-2">
              {favs.length ? favs.map(s => (
                <div key={s.id} onClick={() => playSong(s)} className="glass-card p-4 rounded-3xl flex items-center gap-4 cursor-pointer">
                  <img src={s.cover} className="w-12 h-12 rounded-2xl object-cover" alt="" />
                  <div className="flex-1"><p className="font-bold">{s.title}</p><p className="text-xs text-gray-400">{s.artist}</p></div>
                  <Heart fill="#D64E8B" className="text-primary" size={18} />
                </div>
              )) : <div className="text-center py-20 opacity-30 italic">Votre collection est vide...</div>}
            </div>
          </div>
        );
      default: return <HomeView songs={allSongs} playlists={mockPlaylists} currentSongId={currentSong.id} onPlaySong={playSong} onPlayPlaylist={() => playSong(allSongs[0])} />;
    }
  };

  return (
    <div className="flex flex-col h-screen bg-[#0C0607] text-white overflow-hidden relative">
      {/* Lueurs d'ambiance Marron/Magenta */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-primary/10 blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[10%] right-[-10%] w-[40%] h-[40%] bg-orange-900/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="flex flex-1 overflow-hidden p-3 md:p-5 gap-5 relative z-10">
        <Sidebar activeTab={activeTab} onTabChange={setActiveTab} likedCount={likedSongs.length} />
        
        <main className="flex-1 glass-panel rounded-[2.5rem] overflow-y-auto relative custom-scrollbar">
          <header className="sticky top-0 z-40 flex items-center justify-between p-8 bg-[#150B0D]/40 backdrop-blur-xl border-b border-white/5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center shadow-lg shadow-primary/20">
                <div className="w-6 h-4 border-2 border-white rounded-full flex items-center justify-center">
                  <div className="w-full h-[2px] bg-white rotate-45" />
                </div>
              </div>
              <h1 className="text-2xl tracking-tighter">
                <span className="font-black text-white">Mboka</span>
                <span className="font-light text-white/70 ml-1">Gospel</span>
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <Button onClick={() => setActiveTab('profil')} variant="ghost" className="rounded-full h-11 w-11 p-0 overflow-hidden border border-white/10 ring-primary/20 hover:ring-4 transition-all">
                <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100" className="object-cover h-full w-full" alt="Profile" />
              </Button>
            </div>
          </header>

          <div className="px-6 md:px-12 pb-32 max-w-6xl mx-auto">
            {renderContent()}
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