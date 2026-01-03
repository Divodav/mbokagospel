"use client";

import { useState, useEffect } from "react";
import { Play, Pause, SkipBack, SkipForward, Volume2, Heart, MoreHorizontal, Search, Home, Library, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MadeWithDyad } from "@/components/made-with-dyad";

// Mock data for gospel songs
const mockSongs = [
  { id: 1, title: "Grâce Extraordinaire", artist: "Mahalia Jackson", album: "Chants Sacrés", duration: "3:20", cover: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=100&h=100&fit=crop" },
  { id: 2, title: "Comme Tu Es Grand", artist: "The Clark Sisters", album: "En Direct de Détroit", duration: "4:15", cover: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=100&h=100&fit=crop" },
  { id: 3, title: "Seigneur Précieux", artist: "Kirk Franklin", album: "La Promesse", duration: "3:45", cover: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=100&h=100&fit=crop" },
  { id: 4, title: "Je Peux Seulement Imaginer", artist: "MercyMe", album: "Presque Là", duration: "4:02", cover: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=100&h=100&fit=crop" },
  { id: 5, title: "Chant de Révélation", artist: "Kari Jobe", album: "La Bénédiction", duration: "5:10", cover: "https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=100&h=100&fit=crop" },
  { id: 6, title: "Quel Beau Nom", artist: "Hillsong Worship", album: "Que La Lumière Soit", duration: "4:35", cover: "https://images.unsplash.com/photo-1494232410401-ad00d5433cfa?w=100&h=100&fit=crop" },
];

// Mock data for playlists
const mockPlaylists = [
  { id: 1, name: "Adoration du Dimanche", songCount: 24, cover: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=200&h=200&fit=crop" },
  { id: 2, name: "Classiques du Gospel", songCount: 42, cover: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=200&h=200&fit=crop" },
  { id: 3, name: "Louanges Contemporaines", songCount: 36, cover: "https://images.unsplash.com/photo-1507838153414-b4b713384a76?w=200&h=200&fit=crop" },
  { id: 4, name: "Dévotion du Matin", songCount: 18, cover: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=200&h=200&fit=crop" },
];

const Index = () => {
  const [currentSong, setCurrentSong] = useState(mockSongs[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(30);

  // Simulate progress when playing
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      interval = setInterval(() => {
        setProgress(prev => (prev >= 100 ? 0 : prev + 0.5));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const playSong = (song: any) => {
    setCurrentSong(song);
    setIsPlaying(true);
    setProgress(0);
  };

  return (
    <div className="flex flex-col min-h-screen bg-black text-white">
      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="hidden md:flex flex-col w-64 bg-black p-6">
          <div className="mb-8">
            <h1 className="text-2xl font-bold">Mboka Gospel</h1>
          </div>
          
          <nav className="space-y-4 mb-8">
            <a href="#" className="flex items-center space-x-3 text-white font-semibold">
              <Home size={24} />
              <span>Accueil</span>
            </a>
            <a href="#" className="flex items-center space-x-3 text-gray-400 hover:text-white">
              <Search size={24} />
              <span>Rechercher</span>
            </a>
            <a href="#" className="flex items-center space-x-3 text-gray-400 hover:text-white">
              <Library size={24} />
              <span>Votre Bibliothèque</span>
            </a>
          </nav>
          
          <div className="mt-auto">
            <div className="bg-gray-900 rounded-lg p-4">
              <p className="text-sm font-semibold">Créez votre première playlist</p>
              <p className="text-xs text-gray-400 mt-1">C'est facile, nous vous aidons</p>
              <Button className="mt-3 bg-white text-black hover:bg-gray-200 text-xs h-8">
                Créer une playlist
              </Button>
            </div>
          </div>
        </div>
        
        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto bg-gradient-to-b from-gray-900 to-black">
          <div className="p-6">
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
              <div className="flex items-center space-x-4">
                <Button variant="ghost" size="icon" className="rounded-full bg-black bg-opacity-30 hover:bg-opacity-50">
                  <SkipBack className="text-white" />
                </Button>
                <Button variant="ghost" size="icon" className="rounded-full bg-black bg-opacity-30 hover:bg-opacity-50">
                  <SkipForward className="text-white" />
                </Button>
              </div>
              <div className="flex items-center space-x-4">
                <Button variant="ghost" size="icon" className="rounded-full hover:bg-gray-800">
                  <User className="text-white" />
                </Button>
              </div>
            </div>
            
            {/* Recently Played */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold mb-6">Écouté Récemment</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {mockPlaylists.map(playlist => (
                  <Card key={playlist.id} className="bg-gray-800 bg-opacity-50 hover:bg-opacity-70 transition-all cursor-pointer">
                    <CardContent className="p-4">
                      <div className="relative mb-4">
                        <img 
                          src={playlist.cover} 
                          alt={playlist.name} 
                          className="w-full aspect-square object-cover rounded-md"
                        />
                      </div>
                      <h3 className="font-semibold truncate">{playlist.name}</h3>
                      <p className="text-sm text-gray-400">{playlist.songCount} titres</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
            
            {/* Popular Gospel Songs */}
            <section className="mb-12">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Titres Gospel Populaires</h2>
                <a href="#" className="text-gray-400 hover:text-white text-sm">Tout voir</a>
              </div>
              <div className="space-y-2">
                {mockSongs.map((song, index) => (
                  <div 
                    key={song.id} 
                    className="flex items-center p-2 rounded-lg hover:bg-gray-800 hover:bg-opacity-50 cursor-pointer group"
                    onClick={() => playSong(song)}
                  >
                    <div className="w-8 text-center mr-4">
                      <span className="text-gray-400 group-hover:hidden">{index + 1}</span>
                      <Play className="hidden group-hover:block text-white mx-auto" size={16} />
                    </div>
                    <img 
                      src={song.cover} 
                      alt={song.title} 
                      className="w-10 h-10 rounded mr-4"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium truncate">{song.title}</h3>
                      <p className="text-sm text-gray-400 truncate">{song.artist}</p>
                    </div>
                    <div className="hidden md:block w-32 text-sm text-gray-400 truncate">{song.album}</div>
                    <div className="w-12 text-sm text-gray-400 text-right">{song.duration}</div>
                    <Button variant="ghost" size="icon" className="ml-4 opacity-0 group-hover:opacity-100">
                      <Heart className="text-gray-400 hover:text-white" size={16} />
                    </Button>
                    <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100">
                      <MoreHorizontal className="text-gray-400 hover:text-white" size={16} />
                    </Button>
                  </div>
                ))}
              </div>
            </section>
            
            {/* Made with Dyad */}
            <MadeWithDyad />
          </div>
        </div>
      </div>
      
      {/* Player Bar */}
      <div className="h-20 bg-gray-900 border-t border-gray-800 flex items-center px-4">
        <div className="flex items-center w-full max-w-7xl mx-auto">
          {/* Current Song */}
          <div className="flex items-center w-1/4">
            <img 
              src={currentSong.cover} 
              alt={currentSong.title} 
              className="w-14 h-14 rounded mr-4"
            />
            <div className="min-w-0">
              <h3 className="font-medium truncate">{currentSong.title}</h3>
              <p className="text-sm text-gray-400 truncate">{currentSong.artist}</p>
            </div>
            <Button variant="ghost" size="icon" className="ml-4">
              <Heart className="text-gray-400 hover:text-white" size={16} />
            </Button>
          </div>
          
          {/* Player Controls */}
          <div className="flex flex-col items-center w-2/4">
            <div className="flex items-center space-x-6 mb-2">
              <Button variant="ghost" size="icon">
                <SkipBack className="text-gray-400 hover:text-white" />
              </Button>
              <Button 
                onClick={togglePlay}
                className="rounded-full bg-white hover:bg-gray-200 w-8 h-8"
                size="icon"
              >
                {isPlaying ? <Pause className="text-black" size={16} /> : <Play className="text-black" size={16} />}
              </Button>
              <Button variant="ghost" size="icon">
                <SkipForward className="text-gray-400 hover:text-white" />
              </Button>
            </div>
            <div className="w-full flex items-center space-x-2">
              <span className="text-xs text-gray-400">1:20</span>
              <div className="flex-1 h-1 bg-gray-700 rounded-full">
                <div 
                  className="h-full bg-white rounded-full" 
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <span className="text-xs text-gray-400">{currentSong.duration}</span>
            </div>
          </div>
          
          {/* Volume Control */}
          <div className="flex items-center justify-end w-1/4 space-x-2">
            <Volume2 className="text-gray-400" size={16} />
            <div className="w-24 h-1 bg-gray-700 rounded-full">
              <div className="h-full bg-white rounded-full w-3/4"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;