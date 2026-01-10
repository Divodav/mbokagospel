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
      className="space-y-12 pb-10"
    >
      {/* Hero Banner Section */}
      <motion.section variants={itemVariants} className="relative group">
        <div className="relative w-full rounded-[2.5rem] overflow-hidden bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] shadow-3xl border border-white/[0.08] aspect-[2/1] md:aspect-[21/6]">
          <img 
            src={heroImage} 
            className="absolute inset-0 w-full h-full object-cover opacity-50 group-hover:scale-105 transition-transform duration-1000" 
            alt="Mboka Gospel" 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
          
          <div className="absolute bottom-6 left-6 md:bottom-12 md:left-12 max-w-2xl space-y-4">
            <div className="flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-xl rounded-full w-fit border border-white/10">
              <Sparkles size={12} className="text-primary fill-primary" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white">À la une</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-black tracking-tighter leading-tight">L'excellence de la louange</h2>
            <p className="text-gray-300 text-sm md:text-lg font-medium max-w-md line-clamp-2 opacity-80">Rejoignez notre communauté et célébrez avec les meilleurs talents gospel.</p>
            <div className="flex gap-4 pt-2">
              <Button 
                onClick={() => songs.length > 0 && onPlaySong(songs[0])} 
                className="bg-primary hover:bg-primary/90 text-white font-black rounded-full h-12 px-8 text-sm shadow-2xl shadow-primary/30 hover:scale-105 transition-all flex gap-3"
              >
                <Play fill="white" size={18} /> ÉCOUTER MAINTENANT
              </Button>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Grid Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-8 space-y-8">
          <div className="flex items-center justify-between border-b border-white/[0.05] pb-4">
            <h3 className="text-2xl font-black flex items-center gap-3">
              <TrendingUp className="text-primary" size={24} />
              Tendances du moment
            </h3>
            <button className="group flex items-center gap-2 text-[12px] font-black text-gray-500 hover:text-white tracking-widest uppercase transition-colors">
              Tout voir <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
          
          <div className="grid gap-2">
            {songs.slice(0, 8).map((song, i) => (
              <motion.div 
                key={song.id} 
                variants={itemVariants}
                onClick={() => onPlaySong(song)}
                className={cn(
                  "group flex items-center p-3 rounded-2xl transition-all duration-300 cursor-pointer border border-transparent",
                  currentSongId === song.id ? "bg-white/[0.08] border-white/10" : "hover:bg-white/[0.03]"
                )}
              >
                <span className={cn("w-10 text-[14px] font-black mr-2 text-center", currentSongId === song.id ? "text-primary" : "text-gray-700")}>
                  {i + 1}
                </span>
                <div className="relative aspect-square w-14 h-14 rounded-xl overflow-hidden mr-5 shadow-2xl shrink-0 bg-white/5">
                  <img src={song.cover_url} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  <div className={cn("absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity", currentSongId === song.id && "opacity-100")}>
                    <Play fill="white" size={20} className="text-white" />
                  </div>
                </div>
                <div className="flex-1 min-w-0 mr-6">
                  <p className={cn("font-bold text-[16px] truncate mb-0.5", currentSongId === song.id ? "text-primary" : "text-white")}>{song.title}</p>
                  <p className="text-[13px] text-gray-500 font-bold truncate">{song.artist_name}</p>
                </div>
                <div className="flex items-center gap-6">
                  <div className="hidden md:flex flex-col items-end">
                    <span className="text-[10px] font-black uppercase text-gray-600 tracking-wider mb-1">Streams</span>
                    <div className="flex items-center gap-1.5 text-gray-400 font-bold text-[12px]">
                      <Music size={12} className="text-primary/50" />
                      <span>{formatStreams(streamCounts[song.id] || 0)}</span>
                    </div>
                  </div>
                  <FollowButton artistId={song.artist_id} className="hidden sm:flex" />
                  <button className="text-gray-600 hover:text-primary transition-colors p-2"><Heart size={18} /></button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Sidebar Droite - Playlists */}
        <div className="lg:col-span-4 space-y-8">
          <div className="flex items-center justify-between border-b border-white/[0.05] pb-4">
            <h3 className="text-2xl font-black flex items-center gap-3">
              <Star className="text-primary" size={24} />
              Playlists
            </h3>
          </div>
          <div className="grid gap-4">
            {playlists.length > 0 ? playlists.slice(0, 4).map(p => (
              <motion.div 
                key={p.id} 
                variants={itemVariants}
                onClick={() => onPlayPlaylist(p)}
                className="group glass-card-pro p-4 cursor-pointer flex items-center gap-5"
              >
                <div className="relative aspect-square w-20 h-20 rounded-2xl overflow-hidden shadow-2xl shrink-0 bg-white/5">
                  <img src={p.cover_url || p.cover} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-[16px] truncate mb-1">{p.name}</h4>
                  <p className="text-[11px] text-gray-500 font-black uppercase tracking-[0.1em]">{p.songCount} titres enregistrés</p>
                </div>
                <Button size="icon" variant="ghost" className="h-10 w-10 rounded-full text-gray-500 group-hover:text-primary transition-colors">
                  <Plus size={20} />
                </Button>
              </motion.div>
            )) : (
              <div className="p-10 rounded-[2rem] border-2 border-dashed border-white/[0.05] flex flex-col items-center justify-center text-center space-y-6 bg-white/[0.01]">
                <div className="w-16 h-16 rounded-full bg-white/[0.03] flex items-center justify-center">
                  <Plus size={24} className="text-gray-600" />
                </div>
                <div className="space-y-2">
                  <p className="text-[14px] text-white font-bold uppercase tracking-widest">Ma Collection</p>
                  <p className="text-[12px] text-gray-500 max-w-[200px] mx-auto leading-relaxed">Créez vos playlists personnalisées pour vos moments d'adoration.</p>
                </div>
                <Button variant="outline" className="rounded-full text-[11px] font-black border-white/10 hover:bg-primary hover:border-primary px-8">CRÉER UNE PLAYLIST</Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};