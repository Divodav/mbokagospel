"use client";

import { useState, useEffect } from "react";
import { Play, Sparkles, Star, TrendingUp, Heart, Plus, Music, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { motion, Variants } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { FollowButton } from "./FollowButton";

interface HomeViewProps {
  songs: any[];
  playlists: any[];
  currentSongId: string;
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
  hidden: { y: 15, opacity: 0 },
  visible: { 
    y: 0, 
    opacity: 1, 
    transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } 
  }
};

export const HomeView = ({ songs, playlists, currentSongId, onPlaySong, onPlayPlaylist }: HomeViewProps) => {
  const heroImage = "https://images.unsplash.com/photo-1510915361894-db8b60106cb1?auto=format&fit=crop&q=80&w=2070";
  const [streamCounts, setStreamCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    const fetchStreamCounts = async () => {
      const { data } = await supabase.from('song_plays').select('song_id');
      if (data) {
        const counts = data.reduce((acc: Record<string, number>, curr) => {
          acc[curr.song_id] = (acc[curr.song_id] || 0) + 1;
          return acc;
        }, {});
        setStreamCounts(counts);
      }
    };
    fetchStreamCounts();
  }, [songs]);

  const formatStreams = (count: number) => {
    if (!count) return "0";
    if (count >= 1000000) return (count / 1000000).toFixed(1) + 'M';
    if (count >= 1000) return (count / 1000).toFixed(1) + 'k';
    return count.toString();
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-10 pb-10"
    >
      {/* Hero Banner Section - Version Compacte */}
      <motion.section variants={itemVariants} className="relative group">
        <div className="relative w-full rounded-[2rem] overflow-hidden bg-[#121212] border border-white/5 md:h-[220px] h-[180px] shadow-2xl">
          <img 
            src={heroImage} 
            className="absolute inset-0 w-full h-full object-cover opacity-40 group-hover:scale-105 transition-transform duration-1000" 
            alt="Mboka Gospel" 
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/60 to-transparent" />
          
          <div className="absolute inset-0 flex flex-col justify-center px-6 md:px-12 space-y-3">
            <div className="flex items-center gap-2 px-2.5 py-0.5 bg-primary/20 backdrop-blur-md rounded-full w-fit border border-primary/20">
              <Sparkles size={10} className="text-primary fill-primary" />
              <span className="text-[9px] font-black uppercase tracking-[0.15em] text-primary">SÉLECTION</span>
            </div>
            <div className="space-y-1">
              <h2 className="text-2xl md:text-3xl font-black tracking-tighter leading-tight">L'excellence de la louange</h2>
              <p className="text-gray-400 text-[12px] md:text-sm font-medium max-w-sm line-clamp-1">Découvrez les pépites de notre communauté.</p>
            </div>
            <div className="pt-2">
              <Button 
                onClick={() => songs.length > 0 && onPlaySong(songs[0])} 
                className="bg-primary hover:bg-primary/90 text-white font-black rounded-full h-9 px-6 text-[11px] shadow-lg shadow-primary/20 transition-all flex gap-2"
              >
                <Play fill="white" size={14} /> ÉCOUTER
              </Button>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Grid Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-8 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-black flex items-center gap-3">
              <TrendingUp className="text-primary" size={20} />
              Tendances
            </h3>
            <button className="text-[10px] font-black text-gray-500 hover:text-white tracking-widest uppercase transition-colors">Tout voir</button>
          </div>
          
          <div className="grid gap-1">
            {songs.slice(0, 8).map((song, i) => (
              <motion.div 
                key={song.id} 
                variants={itemVariants}
                onClick={() => onPlaySong(song)}
                className={cn(
                  "group flex items-center p-2 rounded-xl transition-all duration-300 cursor-pointer border border-transparent",
                  currentSongId === song.id ? "bg-white/5 border-white/5" : "hover:bg-white/[0.02]"
                )}
              >
                <span className={cn("w-8 text-[12px] font-black mr-2 text-center", currentSongId === song.id ? "text-primary" : "text-gray-700")}>
                  {i + 1}
                </span>
                <div className="relative aspect-square w-12 h-12 rounded-lg overflow-hidden mr-4 shadow-lg shrink-0 bg-white/5">
                  <img src={song.cover_url} alt="" className="w-full h-full object-cover" />
                  <div className={cn("absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity", currentSongId === song.id && "opacity-100")}>
                    <Play fill="white" size={16} className="text-white" />
                  </div>
                </div>
                <div className="flex-1 min-w-0 mr-4">
                  <p className={cn("font-bold text-[14px] truncate", currentSongId === song.id ? "text-primary" : "text-white")}>{song.title}</p>
                  <p className="text-[11px] text-gray-500 font-bold truncate uppercase tracking-tighter">{song.artist_name}</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="hidden md:flex flex-col items-end">
                    <div className="flex items-center gap-1 text-gray-500 font-bold text-[10px]">
                      <Music size={10} />
                      <span>{formatStreams(streamCounts[song.id] || 0)}</span>
                    </div>
                  </div>
                  <FollowButton artistId={song.artist_id} className="hidden sm:flex h-7 px-3 text-[9px]" />
                  <button className="text-gray-600 hover:text-primary transition-colors p-2"><Heart size={16} /></button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Playlists Section */}
        <div className="lg:col-span-4 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-black flex items-center gap-3">
              <Star className="text-primary" size={20} />
              Playlists
            </h3>
          </div>
          <div className="grid gap-3">
            {playlists.length > 0 ? playlists.slice(0, 4).map(p => (
              <motion.div 
                key={p.id} 
                variants={itemVariants}
                onClick={() => onPlayPlaylist(p)}
                className="group glass-card-pro p-3 cursor-pointer flex items-center gap-4"
              >
                <div className="relative aspect-square w-14 h-14 rounded-xl overflow-hidden shadow-lg shrink-0 bg-white/5">
                  <img src={p.cover_url || p.cover} alt="" className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-[14px] truncate">{p.name}</h4>
                  <p className="text-[9px] text-gray-500 font-black uppercase tracking-wider">{p.songCount} titres</p>
                </div>
              </motion.div>
            )) : (
              <div className="p-8 rounded-3xl border border-dashed border-white/5 flex flex-col items-center justify-center text-center space-y-4 bg-white/[0.01]">
                <p className="text-[11px] text-gray-500 font-bold uppercase tracking-widest">Ma Collection</p>
                <Button variant="outline" className="h-8 rounded-full text-[9px] font-black border-white/10 px-6">CRÉER</Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};