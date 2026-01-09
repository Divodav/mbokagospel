"use client";

import { Play, Sparkles, Star, TrendingUp, Heart, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { motion, Variants } from "framer-motion";

interface HomeViewProps {
  songs: any[];
  playlists: any[];
  currentSongId: number;
  onPlaySong: (song: any) => void;
  onPlayPlaylist: (playlist: any) => void;
}

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05 }
  }
};

const itemVariants: Variants = {
  hidden: { y: 10, opacity: 0 },
  visible: { 
    y: 0, 
    opacity: 1, 
    transition: { duration: 0.3, ease: "easeOut" } 
  }
};

export const HomeView = ({ songs, playlists, currentSongId, onPlaySong, onPlayPlaylist }: HomeViewProps) => {
  const heroImage = "https://images.unsplash.com/photo-1510915361894-db8b60106cb1?auto=format&fit=crop&q=80&w=2070";

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6 md:space-y-12 py-3 md:py-6"
    >
      {/* Hero Banner Section */}
      <motion.section variants={itemVariants} className="relative">
        <div className="relative w-full rounded-2xl md:rounded-[2rem] overflow-hidden group bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] shadow-3xl border border-white/10 aspect-[2/1] md:aspect-[21/7]">
          <img 
            src={heroImage} 
            className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-1000" 
            alt="Mboka Gospel" 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
          
          <div className="absolute bottom-3 left-3 md:bottom-12 md:left-12 max-w-xl space-y-1.5 md:space-y-4">
            <div className="flex items-center gap-1.5 px-2 py-1 bg-white/10 backdrop-blur-md rounded-full w-fit border border-white/10">
              <Star size={10} className="text-primary fill-primary md:w-[14px] md:h-[14px]" />
              <span className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.15em] text-white/90">Sélection</span>
            </div>
            <h2 className="text-xl md:text-5xl font-black tracking-tighter leading-tight md:leading-none">L'excellence de la louange</h2>
            <p className="text-gray-400 text-[10px] md:text-base font-medium max-w-md line-clamp-1 md:line-clamp-2">Les meilleurs titres de la communauté Mboka.</p>
            <div className="flex gap-2 pt-1 md:pt-2">
              <Button 
                onClick={() => songs.length > 0 && onPlaySong(songs[0])} 
                className="bg-primary hover:bg-primary/90 text-white font-black rounded-full h-8 md:h-12 px-4 md:px-8 text-[10px] md:text-sm shadow-xl shadow-primary/20 hover:scale-105 transition-all flex gap-1.5"
              >
                <Play fill="white" size={14} className="md:w-[18px] md:h-[18px]" /> ÉCOUTER
              </Button>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Grid Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-10">
        <div className="lg:col-span-2 space-y-4 md:space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-base md:text-xl font-black flex items-center gap-2">
              <TrendingUp className="text-primary" size={16} />
              En tendance
            </h3>
            <button className="text-[9px] md:text-[11px] font-bold text-gray-500 hover:text-white tracking-widest uppercase transition-colors">Tout voir</button>
          </div>
          
          <div className="grid gap-1 md:gap-2">
            {songs.slice(0, 5).map((song, i) => (
              <motion.div 
                key={song.id} 
                variants={itemVariants}
                onClick={() => onPlaySong(song)}
                className={cn(
                  "group flex items-center p-2 md:p-3 rounded-xl md:rounded-2xl transition-all cursor-pointer border border-transparent",
                  currentSongId === song.id ? "bg-white/10 border-white/10" : "hover:bg-white/5"
                )}
              >
                <span className={cn("w-6 md:w-8 text-[11px] md:text-[12px] font-black mr-1 md:mr-2 text-center", currentSongId === song.id ? "text-primary" : "text-gray-600")}>{i + 1}</span>
                <div className="relative aspect-square w-10 h-10 md:w-12 md:h-12 rounded-lg md:rounded-xl overflow-hidden mr-3 md:mr-4 shadow-lg shrink-0 bg-white/5">
                  <img src={song.cover_url} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  <div className={cn("absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity", currentSongId === song.id && "opacity-100")}>
                    <Play fill="white" size={14} className="text-white md:w-[16px] md:h-[16px]" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className={cn("font-bold text-[12px] md:text-[14px] truncate", currentSongId === song.id ? "text-primary" : "text-white")}>{song.title}</p>
                  <p className="text-[10px] md:text-[12px] text-gray-500 font-medium truncate">{song.artist_name || song.artist}</p>
                </div>
                <div className="flex items-center gap-3 md:gap-6 px-2 md:px-4">
                  <button className="text-gray-600 hover:text-primary transition-colors"><Heart size={14} className="md:w-[16px] md:h-[16px]" /></button>
                  <span className="text-[10px] md:text-[11px] text-gray-500 font-bold tabular-nums w-8 md:w-10 text-right">{song.duration}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="space-y-4 md:space-y-6">
          <h3 className="text-base md:text-xl font-black flex items-center gap-2">
            <Sparkles className="text-primary" size={16} />
            Playlists
          </h3>
          <div className="grid gap-2 md:gap-4">
            {playlists.length > 0 ? playlists.slice(0, 3).map(p => (
              <motion.div 
                key={p.id} 
                variants={itemVariants}
                onClick={() => onPlayPlaylist(p)}
                className="group glass-card-pro p-2 md:p-4 cursor-pointer flex items-center gap-3 md:gap-4"
              >
                <div className="relative aspect-square w-12 h-12 md:w-16 md:h-16 rounded-lg md:rounded-xl overflow-hidden shadow-2xl shrink-0 bg-white/5">
                  <img src={p.cover_url || p.cover} alt="" className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-[12px] md:text-[14px] truncate mb-0.5 md:mb-1">{p.name}</h4>
                  <p className="text-[9px] md:text-[11px] text-gray-500 font-black uppercase tracking-wider">{p.songCount} titres</p>
                </div>
                <Button size="icon" variant="ghost" className="h-8 w-8 rounded-full text-gray-500 group-hover:text-primary transition-colors">
                  <Plus size={16} className="md:w-[20px] md:h-[20px]" />
                </Button>
              </motion.div>
            )) : (
              <div className="p-6 md:p-8 rounded-2xl border border-dashed border-white/5 flex flex-col items-center justify-center text-center space-y-2">
                <Plus size={20} className="text-gray-600" />
                <p className="text-[9px] md:text-[12px] text-gray-500 font-bold uppercase tracking-widest">Bientôt disponible</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};