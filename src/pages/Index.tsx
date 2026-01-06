"use client";

import React, { useState, useCallback } from "react";
import { ChevronLeft, ChevronRight, Bell, PlusCircle, Heart } from "lucide-react";
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
import { useIsMobile } from "@/hooks/use-mobile";
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
    // Utilisation du nouveau fichier MP3 fourni par l'utilisateur
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
  const isMobile = useIsMobile();

  const togglePlay = useCallback(() => {
    setIsPlaying(prev => !prev);
  }, []);

  const playSong = useCallback((song: any) => {
    setCurrentSong(song);
    setIsPlaying(true);
    setProgress(0);
  }, []);

  const handleSkipNext = useCallback(() => {
    const currentIndex = allSongs.findIndex(s => s.id === currentSong.id);
    const nextSong = allSongs[(currentIndex + 1) % allSongs.length];
    playSong(nextSong);
  }, [allSongs, currentSong.id, playSong]);

  const handleSkipBack = useCallback(() => {
    const currentIndex = allSongs.findIndex(s => s.id === currentSong.id);
    const prevSong = allSongs[(currentIndex - 1 + allSongs.length) % allSongs.length];
    playSong(prevSong);
  }, [allSongs, currentSong.id, playSong]);

  const toggleLike = useCallback((id: number) => {
    setLikedSongs(prev => {
      if (prev.includes(id)) {
        showSuccess("Retiré de vos favoris");
        return prev.filter(sId => sId !== id);
      } else {
        showSuccess("Ajouté à vos favoris");
        return [...prev, id];
      }
    });
  }, []);

  const publishSong = (newSong: any) => {
    setAllSongs(prev => [newSong, ...prev]);
    playSong(newSong);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'recherche':
        return <SearchView songs={allSongs} currentSongId={currentSong.id} onPlaySong={playSong} />;
      case 'lyrics':
        return <LyricsView song={currentSong} />;
      case 'queue':
        return <QueueView songs={allSongs} currentSongId={currentSong.id} onPlaySong={playSong} />;
      case 'profil':
        const mySongs = allSongs.filter(s => s.artist === "Davin Kangombe" && s.id !== 100);
        return <ProfileView publishedSongs={mySongs} onPublish={publishSong} />;
      case 'biblio':
        const favoriteSongs = allSongs.filter(s => likedSongs.includes(s.id));
        return (
          <div className="py-6 space-y-8 animate-in slide-in-from-right-4 duration-500">
            <header className="flex items-center justify-between">
              <h2 className="text-4xl font-black tracking-tighter">Votre bibliothèque</h2>
              <Button size="icon" variant="ghost" className="rounded-full bg-white/5"><PlusCircle /></Button>
            </header>
            <section>
              <h3 className="text-xl font-bold mb-6 text-gray-300">Titres likés</h3>
              {favoriteSongs.length > 0 ? (
                <div className="space-y-1">
                  {favoriteSongs.map((song) => (
                    <div 
                      key={song.id} 
                      className="group flex items-center p-3 rounded-xl hover:bg-white/5 cursor-pointer transition-all"
                      onClick={() => playSong(song)}
                    >
                      <img src={song.cover} alt="" className="w-14 h-14 rounded-lg mr-4 object-cover shadow-lg" />
                      <div className="flex-1">
                        <p className="text-base font-bold">{song.title}</p>
                        <p className="text-sm text-gray-400 font-medium">{song.artist}</p>
                      </div>
                      <div className="flex items-center gap-6">
                        <Heart size={18} fill="#22c55e" className="text-[#22c55e]" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-20 bg-white/[0.02] rounded-3xl border border-dashed border-white/10">
                  <Heart size={48} className="mx-auto mb-4 opacity-10" />
                  <p className="text-gray-500 font-medium">Aucun favori pour le moment.</p>
                </div>
              )}
            </section>
          </div>
        );
      default:
        return (
          <HomeView 
            songs={allSongs} 
            playlists={mockPlaylists} 
            currentSongId={currentSong.id} 
            onPlaySong={playSong} 
            onPlayPlaylist={(p) => { showSuccess(`Ouverture : ${p.name}`); playSong(allSongs[0]); }} 
          />
        );
    }
  };

  return (
    <div className="flex flex-col h-screen bg-black text-white font-sans overflow-hidden">
      <div className="flex flex-1 overflow-hidden md:p-3 gap-3">
        <Sidebar activeTab={activeTab} onTabChange={setActiveTab} likedCount={likedSongs.length} />
        <main className="flex-1 bg-gradient-to-b from-[#1a1a1a] to-[#000000] md:rounded-2xl overflow-y-auto relative border border-white/5">
          <header className="sticky top-0 z-30 flex items-center justify-between p-4 md:p-6 bg-black/40 backdrop-blur-xl border-b border-white/5">
            <div className="flex items-center gap-4">
              <h1 className="md:hidden text-lg font-black tracking-tighter" onClick={() => setActiveTab('accueil')}>MBOKA</h1>
              <div className="hidden md:flex gap-3">
                <Button onClick={() => setActiveTab('accueil')} size="icon" variant="ghost" className="rounded-full bg-black/40 h-9 w-9 border border-white/5 hover:bg-white/10"><ChevronLeft size={22} /></Button>
                <Button size="icon" variant="ghost" className="rounded-full bg-black/40 h-9 w-9 border border-white/5 opacity-50"><ChevronRight size={22} /></Button>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Button size="sm" className="rounded-full bg-white text-black font-bold h-9 px-6 hover:scale-105 transition-all shadow-lg">S'ABONNER</Button>
              <div className="flex items-center gap-2">
                <Button size="icon" variant="ghost" className="rounded-full bg-black/40 h-9 w-9 border border-white/5"><Bell size={18} /></Button>
                <Button onClick={() => setActiveTab('profil')} size="icon" variant="ghost" className={cn("rounded-full bg-black/40 h-9 w-9 border border-white/5 overflow-hidden", activeTab === 'profil' && "ring-2 ring-primary")}>
                  <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop" alt="" className="w-full h-full object-cover" />
                </Button>
              </div>
            </div>
          </header>
          <div className="px-4 md:px-10 pb-40 md:pb-24 max-w-7xl mx-auto">
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