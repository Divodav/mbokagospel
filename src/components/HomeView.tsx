"use client";

import { Play, Sparkles, Star, TrendingUp, Heart } from "lucide-react";
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
      {/* Featured Banner Hero */}
      <motion.section variants={itemVariants}>
        <div className="relative w-full rounded-2xl overflow-hidden group bg-white shadow-2xl border border-white/10">
          {/* Image Hero responsive */}
          <div className="aspect-[16/9] md:aspect-[21/9] w-full relative">
            <img 
              src="/608893056_122108622897171777_2959806911562824986_n.jpg" 
              className="absolute inset-0 w-full h-full object-cover md:object-contain bg-[#F3F3F3]" 
              alt="Mboka Gospel - Praise & Worship" 
            />
            {/* Overlay subtil pour le bouton sur mobile */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent md:hidden" />
          </div>

          {/* Contrôles sur la bannière */}
          <div className="absolute bottom-4 left-4 md:bottom-8 md:left-8 flex flex-col gap-2">
            <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-primary/90 backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-wider text-white shadow-lg">
              <Star size={12} fill="white" />
              <span>Application Officielle</span>
            </div>
            <Button 
              onClick={() => songs.length > 0 && onPlaySong(songs[0])} 
              className="bg-primary hover:bg-primary/90 text-white font-black rounded-xl h-10 md:h-12 px-6 md:px-10 text-xs md:text-sm transition-all shadow-2xl hover:scale-105 active:scale-95 flex gap-2"
            >
              <Play fill="white" size={16} /> ÉCOUTER MAINTENANT
            </Button>
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
                <img src={p.cover_url || p.cover} alt="" className="w-full h-full object-cover" />
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

      {/* Titres Populaires */}
      <motion.section variants={itemVariants}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-black flex items-center gap-2">
            <TrendingUp className="text-primary" size={18} />
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
              <img src={song.cover_url} alt="" className="w-10 h-10 rounded-md object-cover mr-3" />
              <div className="flex-1 min-w-0">
                <p className={cn("font-bold text-[13px] truncate", currentSongId === song.id ? "text-primary" : "text-white")}>{song.title}</p>
                <p className="text-[11px] text-gray-500 truncate">{song.artist_name || song.artist}</p>
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