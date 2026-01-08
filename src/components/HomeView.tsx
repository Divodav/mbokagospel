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
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants: Variants = {
  hidden: { y: 20, opacity: 0 },
  visible: { 
    y: 0, 
    opacity: 1, 
    transition: { duration: 0.5, ease: "easeOut" } 
  }
};

export const HomeView = ({ songs, playlists, currentSongId, onPlaySong, onPlayPlaylist }: HomeViewProps) => {
  const heroImage = "/608893056_122108622897171777_2959806911562824986_n.jpg";

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-12 py-6"
    >
      {/* Hero Banner Section */}
      <motion.section variants={itemVariants} className="relative">
        <div className="relative w-full rounded-[2rem] overflow-hidden group bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] shadow-3xl border border-white/10 aspect-[16/9] md:aspect-[21/7]">
          <img 
            src={heroImage} 
            className="absolute inset-0 w-full h-full object-contain md:object-cover opacity-80 group-hover:scale-105 transition-transform duration-1000" 
            alt="Mboka Gospel" 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
          
          <div className="absolute bottom-6 left-6 md:bottom-12 md:left-12 max-w-xl space-y-4">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-white/10 backdrop-blur-md rounded-full w-fit border border-white/10">
              <Star size={14} className="text-primary fill-primary" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/90">Sélection de la semaine</span>
            </div>
            <h2 className="text-3xl md:text-5 font-black tracking-tighter leading-none">L'excellence de la louange</h2>
            <p className="text-gray-400 text-sm md:text-base font-medium max-w-md line-clamp-2">Découvrez les derniers titres qui font vibrer la communauté Mboka Gospel.</p>
            <div className="flex gap-3 pt-2">
              <Button 
                onClick={() => songs.length > 0 && onPlaySong(songs[0])} 
                className="bg-primary hover:bg-primary/90 text-white font-black rounded-full h-12 px-8 shadow-xl shadow-primary/20 hover:scale-105 transition-all flex gap-2"
              >
                <Play fill="white" size={18} /> ÉCOUTER
              </Button>
              <Button variant="outline" className="rounded-full h-12 px-8 border-white/10 bg-white/5 backdrop-blur-md hover:bg-white/10 transition-all">
                DÉCOUVRIR
              </Button>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Grid Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Left Column: Top Songs */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-black flex items-center gap-2">
              <TrendingUp className="text-primary" size={20} />
              En tendance
            </h3>
            <button className="text-[11px] font-bold text-gray-500 hover:text-white tracking-widest uppercase transition-colors">Tout voir</button>
          </div>
          
          <div className="grid gap-2">
            {songs.slice(0, 5).map((song, i) => (
              <motion.div 
                key={song.id} 
                variants={itemVariants}
                onClick={() => onPlaySong(song)}
                className={cn(
                  "group flex items-center p-3 rounded-2xl transition-all cursor-pointer border border-transparent",
                  currentSongId === song.id ? "bg-white/10 border-white/10" : "hover:bg-white/5"
                )}
              >
                <span className={cn("w-8 text-[12px] font-black mr-2 text-center", currentSongId === song.id ? "text-primary" : "text-gray-600")}>{i + 1}</span>
                <div className="relative w-12 h-12 rounded-xl overflow-hidden mr-4 shadow-lg">
                  <img src={song.cover_url} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  <div className={cn("absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity", currentSongId === song.id && "opacity-100")}>
                    <Play fill="white" size={16} className="text-white" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className={cn("font-bold text-[14px] truncate", currentSongId === song.id ? "text-primary" : "text-white")}>{song.title}</p>
                  <p className="text-[12px] text-gray-500 font-medium truncate">{song.artist_name || song.artist}</p>
                </div>
                <div className="flex items-center gap-6 px-4">
                  <button className="text-gray-600 hover:text-primary transition-colors"><Heart size={16} /></button>
                  <span className="text-[11px] text-gray-500 font-bold tabular-nums w-10 text-right">{song.duration}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Right Column: Mini Playlists / Featured */}
        <div className="space-y-6">
          <h3 className="text-xl font-black flex items-center gap-2">
            <Sparkles className="text-primary" size={20} />
            Playlists
          </h3>
          <div className="grid gap-4">
            {playlists.length > 0 ? playlists.slice(0, 3).map(p => (
              <motion.div 
                key={p.id} 
                variants={itemVariants}
                onClick={() => onPlayPlaylist(p)}
                className="group glass-card-pro p-4 cursor-pointer flex items-center gap-4"
              >
                <div className="relative w-16 h-16 rounded-xl overflow-hidden shadow-2xl shrink-0">
                  <img src={p.cover_url || p.cover} alt="" className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-[14px] truncate mb-1">{p.name}</h4>
                  <p className="text-[11px] text-gray-500 font-black uppercase tracking-wider">{p.songCount} titres</p>
                </div>
                <Button size="icon" variant="ghost" className="rounded-full text-gray-500 group-hover:text-primary transition-colors">
                  <Plus size={20} />
                </Button>
              </motion.div>
            )) : (
              <div className="p-8 rounded-3xl border border-dashed border-white/5 flex flex-col items-center justify-center text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center">
                  <Plus size={24} className="text-gray-600" />
                </div>
                <p className="text-[12px] text-gray-500 font-bold uppercase tracking-widest">Bientôt disponible</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};