"use client";

import { Play, Sparkles, Star, Mic2, TrendingUp, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface HomeViewProps {
  songs: any[];
  playlists: any[];
  currentSongId: number;
  onPlaySong: (song: any) => void;
  onPlayPlaylist: (playlist: any) => void;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05 }
  }
};

const itemVariants = {
  hidden: { y: 10, opacity: 0 },
  visible: { y: 0, opacity: 1 }
};

export const HomeView = ({ songs, playlists, currentSongId, onPlaySong, onPlayPlaylist }: HomeViewProps) => {
  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-10 py-4"
    >
      {/* Featured Banner Compact */}
      <motion.section variants={itemVariants}>
        <div className="relative h-[220px] md:h-[280px] rounded-2xl overflow-hidden group">
          <img 
            src="https://images.unsplash.com/photo-1520156557489-3176210375da?w=1200&q=80" 
            className="absolute inset-0 w-full h-full object-cover" 
            alt="Hero" 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          <div className="absolute bottom-0 left-0 p-6 md:p-8 w-full md:w-2/3">
            <div className="inline-flex items-center gap-2 px-2 py-0.5 bg-primary/20 backdrop-blur-md rounded-md text-[9px] font-bold uppercase tracking-wider mb-2 border border-primary/30">
              <TrendingUp size={10} />
              <span>Nouveauté</span>
            </div>
            <h2 className="text-2xl md:text-4xl font-black mb-2 tracking-tight">Vibrez Au Rythme Gospel</h2>
            <div className="flex gap-3">
              <Button onClick={() => onPlayPlaylist(playlists[0])} className="bg-primary hover:bg-primary/90 text-white font-bold rounded-lg h-9 px-6 text-xs transition-all">
                Écouter
              </Button>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Playlists Compactes */}
      <motion.section variants={itemVariants}>
        <h3 className="text-lg font-black mb-4 flex items-center gap-2">
          <Sparkles className="text-primary" size={18} />
          Inspirations
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {playlists.map(p => (
            <motion.div 
              key={p.id} 
              variants={itemVariants}
              whileHover={{ scale: 1.02 }}
              onClick={() => onPlayPlaylist(p)}
              className="group glass-card-pro p-3 cursor-pointer"
            >
              <div className="relative aspect-square rounded-lg overflow-hidden mb-2">
                <img src={p.cover} alt="" className="w-full h-full object-cover" />
                <Button size="icon" className="absolute bottom-2 right-2 rounded-full w-8 h-8 bg-primary text-white opacity-0 group-hover:opacity-100 transition-all shadow-lg">
                  <Play fill="white" size={14} className="translate-x-[1px]" />
                </Button>
              </div>
              <h4 className="font-bold text-[12px] truncate">{p.name}</h4>
              <p className="text-[10px] text-gray-500 font-medium">{p.songCount} titres</p>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Titres Populaires Condensés */}
      <motion.section variants={itemVariants}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-black flex items-center gap-2">
            <Star className="text-primary" size={18} />
            Top Titres
          </h3>
          <button className="text-[10px] font-bold text-gray-500 hover:text-primary tracking-widest uppercase">Voir plus</button>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
          {songs.map((song, i) => (
            <motion.div 
              key={song.id} 
              variants={itemVariants}
              onClick={() => onPlaySong(song)}
              className={cn(
                "group flex items-center p-2 rounded-lg transition-all cursor-pointer border border-transparent",
                currentSongId === song.id ? "bg-primary/10 border-primary/20" : "hover:bg-white/5"
              )}
            >
              <span className={cn("w-6 text-[11px] font-bold mr-2 text-center", currentSongId === song.id ? "text-primary" : "text-gray-500")}>{i + 1}</span>
              <img src={song.cover} alt="" className="w-10 h-10 rounded-md object-cover mr-3" />
              <div className="flex-1 min-w-0">
                <p className={cn("font-bold text-[13px] truncate", currentSongId === song.id ? "text-primary" : "text-white")}>{song.title}</p>
                <p className="text-[11px] text-gray-500 truncate">{song.artist}</p>
              </div>
              <div className="flex items-center gap-4 px-2">
                <Heart size={14} className="text-gray-600 hover:text-primary transition-colors" />
                <span className="text-[10px] text-gray-600 font-medium tabular-nums">{song.duration}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.section>
    </motion.div>
  );
};