"use client";

import { Play, Sparkles, Star, Mic2, TrendingUp } from "lucide-react";
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
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1 }
};

export const HomeView = ({ songs, playlists, currentSongId, onPlaySong, onPlayPlaylist }: HomeViewProps) => {
  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-16 py-8"
    >
      {/* Featured Banner Pro */}
      <motion.section variants={itemVariants} className="relative group">
        <div className="relative h-[400px] md:h-[500px] rounded-[3.5rem] overflow-hidden shadow-2xl">
          <motion.img 
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 1.5 }}
            src="https://images.unsplash.com/photo-1520156557489-3176210375da?w=1200&q=80" 
            className="absolute inset-0 w-full h-full object-cover" 
            alt="Hero" 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0C0607] via-transparent to-black/30" />
          <div className="absolute inset-0 p-10 md:p-20 flex flex-col items-center justify-center text-center">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary rounded-full text-[10px] font-black uppercase tracking-widest mb-6 shadow-lg shadow-primary/40"
            >
              <TrendingUp size={14} />
              <span>Nouveauté de la semaine</span>
            </motion.div>
            <h2 className="text-5xl md:text-7xl font-black mb-6 tracking-tighter text-white leading-none">Vibrez Au Rythme <br/> De L'Afrique</h2>
            <p className="text-white/70 text-sm md:text-xl mb-10 max-w-2xl font-medium leading-relaxed">Le meilleur du Gospel Congolais réuni sur une seule plateforme d'exception.</p>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button onClick={() => onPlayPlaylist(playlists[0])} className="bg-primary hover:bg-primary/90 text-white font-black rounded-full h-16 px-14 text-xl shadow-2xl glow-primary transition-all">
                Écouter maintenant
              </Button>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Playlists avec animation au survol */}
      <motion.section variants={itemVariants}>
        <h3 className="text-3xl font-black mb-10 flex items-center gap-4">
          <Sparkles className="text-primary animate-pulse" size={28} />
          Inspirations Divines
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6 md:gap-10">
          {playlists.map(p => (
            <motion.div 
              key={p.id} 
              variants={itemVariants}
              whileHover={{ y: -10 }}
              onClick={() => onPlayPlaylist(p)}
              className="group glass-card-pro p-4 cursor-pointer"
            >
              <div className="relative aspect-square rounded-3xl overflow-hidden mb-5">
                <img src={p.cover} alt="" className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
                <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                <Button size="icon" className="absolute inset-0 m-auto rounded-full w-16 h-16 bg-white text-black opacity-0 scale-50 group-hover:opacity-100 group-hover:scale-100 transition-all duration-500 shadow-2xl">
                  <Play fill="black" size={28} className="translate-x-[2px]" />
                </Button>
              </div>
              <h4 className="font-black text-lg md:text-xl mb-1 truncate">{p.name}</h4>
              <p className="text-sm text-white/40 font-bold uppercase tracking-tighter">{p.songCount} Titres</p>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Titres Populaires - Ultra Pro */}
      <motion.section variants={itemVariants}>
        <div className="flex items-center justify-between mb-10">
          <h3 className="text-3xl font-black flex items-center gap-4">
            <Star className="text-primary" size={28} />
            Top Mboka Gospel
          </h3>
          <button className="text-sm font-black text-primary hover:text-white transition-colors tracking-widest uppercase">Voir le classement</button>
        </div>
        <div className="grid gap-4">
          {songs.map((song, i) => (
            <motion.div 
              key={song.id} 
              variants={itemVariants}
              whileHover={{ x: 10, backgroundColor: "rgba(255,255,255,0.05)" }}
              onClick={() => onPlaySong(song)}
              className={cn(
                "group flex items-center p-4 md:p-5 rounded-[2rem] transition-all cursor-pointer border border-transparent",
                currentSongId === song.id ? "bg-primary/10 border-primary/20" : "bg-white/[0.02]"
              )}
            >
              <span className={cn("w-10 text-lg font-black mr-6 text-center", currentSongId === song.id ? "text-primary" : "text-white/20")}>{i + 1}</span>
              <img src={song.cover} alt="" className="w-16 h-16 rounded-2xl object-cover mr-6 shadow-2xl" />
              <div className="flex-1 min-w-0">
                <p className={cn("font-black text-lg truncate", currentSongId === song.id ? "text-primary" : "text-white")}>{song.title}</p>
                <p className="text-sm text-white/50 font-medium">{song.artist}</p>
              </div>
              <div className="hidden md:flex items-center gap-6">
                <span className="text-xs text-white/20 font-black tracking-widest">{song.duration}</span>
                <Heart size={20} className="text-white/10 hover:text-primary transition-colors" />
              </div>
            </motion.div>
          ))}
        </div>
      </motion.section>
    </motion.div>
  );
};