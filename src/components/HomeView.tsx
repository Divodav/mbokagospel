"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Play, Sparkles, Star, TrendingUp, Heart, Share2, Music, Disc, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { motion, Variants } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { AddToPlaylistMenu } from "@/components/AddToPlaylistMenu";
import { showSuccess } from "@/utils/toast";
import { RadioButton } from "./RadioButton";

interface HomeViewProps {
  songs: any[];
  playlists: any[];
  currentSongId: string;
  onPlaySong: (song: any) => void;
  onPlayPlaylist: (playlist: any) => void;
  onOpenAlbum?: (album: any) => void;
  onPlayCollection?: (songs: any[]) => void;
  hasMore?: boolean;
  isLoadingMore?: boolean;
  onLoadMore?: () => void;
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

export const HomeView = ({
  songs,
  playlists,
  currentSongId,
  onPlaySong,
  onPlayPlaylist,
  onOpenAlbum,
  onPlayCollection,
  hasMore,
  isLoadingMore,
  onLoadMore
}: HomeViewProps) => {
  const heroImage = "https://images.unsplash.com/photo-1510915361894-db8b60106cb1?auto=format&fit=crop&q=80&w=2070";
  const [streamCounts, setStreamCounts] = useState<Record<string, number>>({});
  const [trendingAlbums, setTrendingAlbums] = useState<any[]>([]);

  // Observer pour l'infinite scroll
  const observer = useRef<IntersectionObserver | null>(null);
  const lastSongElementRef = useCallback((node: HTMLDivElement | null) => {
    if (isLoadingMore) return;
    if (observer.current) observer.current.disconnect();

    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore && onLoadMore) {
        onLoadMore();
      }
    });

    if (node) observer.current.observe(node);
  }, [isLoadingMore, hasMore, onLoadMore]);

  useEffect(() => {
    const fetchData = async () => {
      // Fetch Stream Counts
      // Optimisation: ne récupérer que pour les chansons visibles si possible, 
      // mais ici on garde simple pour l'instant
      const { data: plays } = await supabase.from('song_plays').select('song_id');
      if (plays) {
        const counts = plays.reduce((acc: Record<string, number>, curr) => {
          acc[curr.song_id] = (acc[curr.song_id] || 0) + 1;
          return acc;
        }, {});
        setStreamCounts(counts);
      }

      // Fetch some albums
      const { data: albumsData } = await supabase.from('albums').select('*').limit(4);
      if (albumsData) {
        setTrendingAlbums(albumsData);
      }
    };
    fetchData();
  }, []); // Exécuter une seule fois au montage

  const handleShareSong = (e: React.MouseEvent, song: any) => {
    e.stopPropagation();
    const url = `${window.location.origin}/share/song/${song.id}`;
    navigator.clipboard.writeText(url);
    showSuccess("Lien du titre copié !");
  };

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
      {/* Hero Banner */}
      <motion.section variants={itemVariants} className="relative group">
        <div className="relative w-full rounded-[1.5rem] overflow-hidden bg-[#121212] border border-white/5 md:h-[180px] h-[150px] shadow-2xl">
          <img
            src={heroImage}
            className="absolute inset-0 w-full h-full object-cover opacity-40 group-hover:scale-105 transition-transform duration-1000"
            alt="Mboka Gospel"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/60 to-transparent" />
          <div className="absolute inset-0 flex flex-col justify-center px-6 md:px-10 space-y-2">
            <div className="flex items-center gap-2 px-2 py-0.5 bg-primary/20 backdrop-blur-md rounded-full w-fit border border-primary/20">
              <Sparkles size={8} className="text-primary fill-primary" />
              <span className="text-[8px] font-black uppercase tracking-[0.15em] text-primary">SÉLECTION</span>
            </div>
            <div className="space-y-0.5">
              <h2 className="text-xl md:text-2xl font-black tracking-tighter leading-tight">L'excellence de la louange</h2>
              <p className="text-gray-400 text-[11px] md:text-xs font-medium max-w-sm line-clamp-1">Découvrez les pépites de notre communauté.</p>
            </div>
            <div className="pt-1.5">
              <Button
                onClick={() => songs.length > 0 && onPlaySong(songs[0])}
                className="bg-primary hover:bg-primary/90 text-white font-black rounded-full h-7 px-5 text-[10px] shadow-lg shadow-primary/20 transition-all flex gap-1.5"
              >
                <Play fill="white" size={10} /> ÉCOUTER
              </Button>
            </div>
          </div>
        </div>
      </motion.section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-black flex items-center gap-2">
              <TrendingUp className="text-primary" size={16} />
              Tendances
            </h3>
          </div>
          <div className="grid gap-0.5">
            {songs.map((song, i) => {
              const isLastElement = songs.length === i + 1;
              return (
                <div ref={isLastElement ? lastSongElementRef : null} key={song.id}>
                  <AddToPlaylistMenu songId={song.id}>
                    <motion.div
                      variants={itemVariants}
                      onClick={() => onPlaySong(song)}
                      className={cn(
                        "group flex items-center p-1.5 rounded-lg transition-all duration-300 cursor-pointer border border-transparent",
                        currentSongId === song.id ? "bg-white/5 border-white/5" : "hover:bg-white/[0.02]"
                      )}
                    >
                      <span className={cn("w-6 text-[10px] font-black mr-2 text-center", currentSongId === song.id ? "text-primary" : "text-gray-700")}>
                        {i + 1}
                      </span>
                      <div className="relative aspect-square w-10 h-10 rounded-lg overflow-hidden mr-3 shadow-lg shrink-0 bg-white/5">
                        <img src={song.cover_url} alt="" className="w-full h-full object-cover" />
                        <div className={cn("absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity", currentSongId === song.id && "opacity-100")}>
                          <Play fill="white" size={12} className="text-white" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0 mr-3">
                        <p className={cn("font-bold text-[13px] truncate leading-tight", currentSongId === song.id ? "text-primary" : "text-white")}>{song.title}</p>
                        <p className="text-[10px] text-gray-500 font-bold truncate uppercase tracking-tighter">{song.artist_name}</p>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="hidden md:flex flex-col items-end mr-2">
                          <div className="flex items-center gap-1 text-gray-500 font-bold text-[9px]">
                            <Music size={8} />
                            <span>{formatStreams(streamCounts[song.id] || 0)}</span>
                          </div>
                        </div>
                        <RadioButton
                          type="artist"
                          value={song.artist_id}
                          displayName={song.artist_name}
                          onRadioStart={onPlayCollection}
                          variant="icon"
                          className="h-7 w-7 text-gray-500 hover:text-primary transition-colors"
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-gray-500 hover:text-primary transition-colors"
                          onClick={(e) => handleShareSong(e, song)}
                        >
                          <Share2 size={12} />
                        </Button>
                        <button className="text-gray-600 hover:text-primary transition-colors p-1.5"><Heart size={14} /></button>
                      </div>
                    </motion.div>
                  </AddToPlaylistMenu>
                </div>
              );
            })}

            {/* Loader de fin de liste */}
            {isLoadingMore && (
              <div className="py-2 flex justify-center w-full">
                <Loader2 className="animate-spin text-primary" size={20} />
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-4 space-y-8">
          {/* Playlists Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-black flex items-center gap-2">
              <Star className="text-primary" size={16} />
              Playlists
            </h3>
            <div className="grid gap-2">
              {playlists.length > 0 ? playlists.slice(0, 3).map(p => (
                <motion.div
                  key={p.id}
                  variants={itemVariants}
                  onClick={() => onPlayPlaylist(p)}
                  className="group glass-card-pro p-2 cursor-pointer flex items-center gap-3"
                >
                  <div className="relative aspect-square w-10 h-10 rounded-lg overflow-hidden shadow-lg shrink-0 bg-white/5 flex items-center justify-center">
                    {p.cover_url || p.cover ? (
                      <img src={p.cover_url || p.cover} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <Music className="text-gray-500" size={16} />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-[13px] truncate">{p.name}</h4>
                    <p className="text-[8px] text-gray-500 font-black uppercase tracking-wider">{p.songCount || '0'} titres</p>
                  </div>
                </motion.div>
              )) : (
                <div className="p-4 rounded-xl border border-dashed border-white/5 text-center bg-white/[0.01]">
                  <p className="text-[9px] text-gray-600 font-bold uppercase">Aucune playlist</p>
                </div>
              )}
            </div>
          </div>

          {/* Albums Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-black flex items-center gap-2">
              <Disc className="text-primary" size={16} />
              Albums
            </h3>
            <div className="grid gap-2">
              {trendingAlbums.map(album => (
                <motion.div
                  key={album.id}
                  variants={itemVariants}
                  onClick={() => onOpenAlbum?.(album)}
                  className="group glass-card-pro p-2 cursor-pointer flex items-center gap-3"
                >
                  <div className="relative aspect-square w-10 h-10 rounded-lg overflow-hidden shadow-lg shrink-0 bg-white/5 flex items-center justify-center">
                    {album.cover_url || album.cover ? (
                      <img src={album.cover_url || album.cover} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <Disc className="text-gray-500" size={16} />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-[13px] truncate">{album.title || album.name}</h4>
                    <p className="text-[8px] text-gray-500 font-black uppercase tracking-wider line-clamp-1">{album.artist_name}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>

    </motion.div>
  );
};