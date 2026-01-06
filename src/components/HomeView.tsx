"use client";

import { Play, TrendingUp, Sparkles, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface HomeViewProps {
  songs: any[];
  playlists: any[];
  currentSongId: number;
  onPlaySong: (song: any) => void;
  onPlayPlaylist: (playlist: any) => void;
}

export const HomeView = ({ songs, playlists, currentSongId, onPlaySong, onPlayPlaylist }: HomeViewProps) => {
  return (
    <div className="space-y-12 py-4 animate-in fade-in duration-700">
      {/* Hero Section */}
      <section className="relative h-[240px] md:h-[300px] rounded-2xl overflow-hidden group">
        <img 
          src="https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=1200&h=400&fit=crop" 
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
          alt="Featured" 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
        <div className="absolute bottom-6 left-6 md:left-10 space-y-2 md:space-y-4 max-w-2xl">
          <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-widest">
            <Sparkles size={14} />
            <span>À la une</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-black tracking-tighter text-white">L'Excellence du Gospel</h2>
          <p className="text-sm md:text-base text-gray-200 line-clamp-2 opacity-80">Découvrez les nouveaux talents de la scène chrétienne francophone dans cette playlist exclusive.</p>
          <Button className="bg-primary hover:bg-primary/90 text-black font-bold rounded-full px-8 gap-2 shadow-xl hover:scale-105 transition-transform">
            <Play fill="black" size={18} /> Écouter maintenant
          </Button>
        </div>
      </section>

      {/* Quick Picks */}
      <section>
        <div className="flex items-center gap-2 mb-6 text-gray-200">
          <TrendingUp size={20} className="text-primary" />
          <h2 className="text-xl md:text-2xl font-bold tracking-tight">Bonjour</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {playlists.slice(0, 6).map(p => (
            <div 
              key={p.id} 
              onClick={() => onPlayPlaylist(p)}
              className="group flex items-center glass-card rounded-md overflow-hidden cursor-pointer relative"
            >
              <img src={p.cover} alt="" className="w-16 h-16 md:w-20 md:h-20 object-cover shadow-2xl" />
              <div className="flex-1 px-4 min-w-0">
                <span className="font-bold truncate block group-hover:text-primary transition-colors text-sm md:text-base">{p.name}</span>
                <span className="text-xs text-gray-500 font-medium">{p.songCount} titres</span>
              </div>
              <Button 
                size="icon" 
                className="mr-4 bg-primary hover:bg-primary/90 text-black shadow-2xl opacity-0 scale-90 group-hover:opacity-100 group-hover:scale-100 transition-all rounded-full h-10 w-10 shrink-0 hidden md:flex"
              >
                <Play fill="black" size={20} />
              </Button>
            </div>
          ))}
        </div>
      </section>

      {/* Recommandations */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2 text-gray-200">
            <Clock size={20} className="text-primary" />
            <h2 className="text-xl md:text-2xl font-bold tracking-tight">Sélection pour vous</h2>
          </div>
          <button className="text-xs font-bold text-gray-500 hover:text-white transition-colors">TOUT AFFICHER</button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-1">
          {songs.map((song, i) => (
            <div 
              key={song.id} 
              className={cn(
                "group flex items-center p-3 rounded-lg transition-all cursor-pointer border border-transparent",
                currentSongId === song.id ? "bg-white/5 border-white/10" : "hover:bg-white/[0.03]"
              )}
              onClick={() => onPlaySong(song)}
            >
              <div className="w-6 text-center mr-4 shrink-0">
                <span className={cn("text-sm font-bold", currentSongId === song.id ? "text-primary" : "text-gray-600")}>
                  {i + 1}
                </span>
              </div>
              <img src={song.cover} alt="" className="w-12 h-12 rounded shadow-lg object-cover mr-4" />
              <div className="flex-1 min-w-0">
                <p className={cn("text-sm font-bold truncate", currentSongId === song.id ? "text-primary" : "text-white")}>{song.title}</p>
                <p className="text-xs text-gray-500 truncate font-medium">{song.artist}</p>
              </div>
              <span className="text-xs text-gray-600 font-bold tabular-nums ml-4 opacity-0 group-hover:opacity-100 transition-opacity">
                {song.duration}
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};