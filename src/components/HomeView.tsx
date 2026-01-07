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
    <div className="space-y-16 py-8">
      {/* Featured Banner inspiré de l'image */}
      <section className="relative group">
        <div className="relative h-[350px] md:h-[450px] rounded-[3rem] overflow-hidden shadow-2xl">
          <img 
            src="https://images.unsplash.com/photo-1520156557489-3176210375da?w=1200&q=80" 
            className="absolute inset-0 w-full h-full object-cover scale-105 group-hover:scale-100 transition-transform duration-1000" 
            alt="Hero" 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#150B0D] via-[#150B0D]/30 to-transparent" />
          <div className="absolute inset-0 p-10 md:p-16 flex flex-col items-center justify-center text-center">
            <h2 className="text-4xl md:text-6xl font-black mb-4 tracking-tighter text-white">Vibrez Au Rythme De L'Afrique</h2>
            <p className="text-white/80 text-sm md:text-lg mb-8 max-w-xl font-medium">Découvrez des sons authentiques, des classiques intemporels et les talents émergents d'un continent vibrant.</p>
            <Button onClick={() => onPlayPlaylist(playlists[0])} className="bg-primary hover:bg-primary/90 text-white font-black rounded-full h-14 px-12 text-lg shadow-xl glow-primary transition-transform hover:scale-105">
              Démarrer
            </Button>
          </div>
        </div>
      </section>

      {/* Playlists avec style Glassmorphism aux tons chauds */}
      <section>
        <h3 className="text-2xl font-black mb-8 flex items-center gap-3">
          <Sparkles className="text-primary" size={24} />
          Pour votre édification
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
          {playlists.map(p => (
            <div 
              key={p.id} 
              onClick={() => onPlayPlaylist(p)}
              className="group glass-card rounded-[2rem] overflow-hidden p-4 cursor-pointer"
            >
              <div className="relative aspect-square rounded-[1.5rem] overflow-hidden mb-4">
                <img src={p.cover} alt="" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                <Button size="icon" className="absolute inset-0 m-auto rounded-full w-14 h-14 bg-white text-black opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-2xl scale-50 group-hover:scale-100">
                  <Play fill="black" size={24} className="translate-x-[2px]" />
                </Button>
              </div>
              <h4 className="font-bold text-base truncate">{p.name}</h4>
              <p className="text-xs text-white/50 font-medium">{p.songCount} titres inspirés</p>
            </div>
          ))}
        </div>
      </section>

      {/* Titres Populaires */}
      <section>
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-2xl font-black flex items-center gap-3">
            <Mic2 className="text-primary" size={24} />
            Les plus écoutés
          </h3>
          <button className="text-sm font-bold text-primary hover:underline">VOIR TOUT</button>
        </div>
        <div className="grid gap-3">
          {songs.map((song, i) => (
            <div 
              key={song.id} 
              onClick={() => onPlaySong(song)}
              className={cn(
                "group flex items-center p-4 rounded-3xl transition-all cursor-pointer border border-transparent",
                currentSongId === song.id ? "bg-primary/10 border-primary/20" : "hover:bg-white/[0.04]"
              )}
            >
              <span className={cn("w-8 text-sm font-black mr-4 text-center", currentSongId === song.id ? "text-primary" : "text-white/30")}>{i + 1}</span>
              <img src={song.cover} alt="" className="w-14 h-14 rounded-2xl object-cover mr-5 shadow-xl" />
              <div className="flex-1 min-w-0">
                <p className={cn("font-bold text-base truncate", currentSongId === song.id ? "text-primary" : "text-white")}>{song.title}</p>
                <p className="text-sm text-white/50 font-medium">{song.artist}</p>
              </div>
              <div className="hidden md:block text-xs text-white/30 font-bold ml-4">{song.duration}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};