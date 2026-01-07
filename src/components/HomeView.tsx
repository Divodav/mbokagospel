"use client";

import { Play, Sparkles, Star, Mic2 } from "lucide-react";
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
    <div className="space-y-12 py-6">
      {/* Featured Banner - Plus artistique */}
      <section className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-primary to-indigo-600 rounded-3xl blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
        <div className="relative h-[280px] md:h-[350px] rounded-3xl overflow-hidden glass-panel border-none">
          <img 
            src="https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=1200&q=80" 
            className="absolute inset-0 w-full h-full object-cover opacity-60 scale-105 group-hover:scale-100 transition-transform duration-1000" 
            alt="Hero" 
          />
          <div className="absolute inset-0 bg-gradient-to-tr from-black via-black/40 to-transparent" />
          <div className="absolute inset-0 p-8 md:p-12 flex flex-col justify-end max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/20 text-primary rounded-full text-[10px] font-black uppercase tracking-widest mb-4 w-fit border border-primary/30">
              <Star size={12} fill="currentColor" />
              <span>Incontournable</span>
            </div>
            <h2 className="text-4xl md:text-6xl font-black mb-4 tracking-tighter leading-none text-white">Le Ciel sur Terre</h2>
            <p className="text-gray-300 text-sm md:text-lg mb-6 font-medium max-w-md line-clamp-2">Plongez dans l'adoration pure avec les voix qui marquent notre génération.</p>
            <Button onClick={() => onPlayPlaylist(playlists[0])} className="w-fit bg-primary hover:bg-primary/90 text-white font-black rounded-2xl h-12 px-8 gap-3 shadow-xl glow-primary">
              <Play fill="white" size={20} /> COMMENCER L'ÉCOUTE
            </Button>
          </div>
        </div>
      </section>

      {/* Playlists avec style Glassmorphism */}
      <section>
        <h3 className="text-2xl font-black mb-6 flex items-center gap-3">
          <Sparkles className="text-primary" size={20} />
          Pour votre édification
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          {playlists.map(p => (
            <div 
              key={p.id} 
              onClick={() => onPlayPlaylist(p)}
              className="group glass-card rounded-2xl overflow-hidden p-3 cursor-pointer"
            >
              <div className="relative aspect-square rounded-xl overflow-hidden mb-3">
                <img src={p.cover} alt="" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                <Button size="icon" className="absolute bottom-3 right-3 rounded-2xl bg-white text-black opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 shadow-2xl">
                  <Play fill="black" size={18} />
                </Button>
              </div>
              <h4 className="font-bold text-sm md:text-base truncate">{p.name}</h4>
              <p className="text-xs text-gray-500 font-medium">{p.songCount} titres inspirés</p>
            </div>
          ))}
        </div>
      </section>

      {/* Titres Populaires - Liste plus élégante */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-black flex items-center gap-3">
            <Mic2 className="text-primary" size={20} />
            Les plus écoutés
          </h3>
          <button className="text-xs font-bold text-primary hover:underline">VOIR TOUT</button>
        </div>
        <div className="grid gap-2">
          {songs.map((song, i) => (
            <div 
              key={song.id} 
              onClick={() => onPlaySong(song)}
              className={cn(
                "group flex items-center p-3 rounded-2xl transition-all cursor-pointer border border-transparent",
                currentSongId === song.id ? "bg-primary/10 border-primary/20" : "hover:bg-white/[0.03]"
              )}
            >
              <span className={cn("w-6 text-xs font-black mr-4 text-center", currentSongId === song.id ? "text-primary" : "text-gray-600")}>{i + 1}</span>
              <img src={song.cover} alt="" className="w-12 h-12 rounded-xl object-cover mr-4 shadow-lg" />
              <div className="flex-1 min-w-0">
                <p className={cn("font-bold text-sm truncate", currentSongId === song.id ? "text-primary" : "text-white")}>{song.title}</p>
                <p className="text-xs text-gray-500 font-medium">{song.artist}</p>
              </div>
              <div className="hidden md:block text-xs text-gray-600 font-bold ml-4">{song.duration}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};