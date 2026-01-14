"use client";

import { useState, useEffect } from "react";
import { Search, Music, Mic2, Disc, Loader2, Sparkles, Share2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import { showSuccess } from "@/utils/toast";

interface SearchViewProps {
  currentSongId: string;
  onPlaySong: (song: any) => void;
}

const GENRES = ["Adoration", "Louange", "Chorale", "Afro-Gospel", "Urbain", "Classique"];

export const SearchView = ({ currentSongId, onPlaySong }: SearchViewProps) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeGenre, setActiveGenre] = useState<string | null>(null);

  useEffect(() => {
    const searchSongs = async () => {
      if (!query && !activeGenre) {
        setResults([]);
        return;
      }

      setIsLoading(true);
      try {
        let q = supabase
          .from('songs')
          .select('*')
          .eq('status', 'approved');

        if (query) {
          q = q.or(`title.ilike.%${query}%,artist_name.ilike.%${query}%`);
        }

        if (activeGenre) {
          q = q.eq('genre', activeGenre);
        }

        const { data, error } = await q.limit(20);
        if (error) throw error;
        setResults(data || []);
      } catch (error) {
        console.error("[Search] Error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    const timer = setTimeout(searchSongs, 300);
    return () => clearTimeout(timer);
  }, [query, activeGenre]);

  const handleShareSong = (e: React.MouseEvent, song: any) => {
    e.stopPropagation();
    const url = `${window.location.origin}/share/song/${song.id}`;
    navigator.clipboard.writeText(url);
    showSuccess("Lien du titre copié !");
  };

  return (
    <div className="space-y-8 pt-4 pb-20">
      {/* Barre de Recherche */}
      <div className="relative max-w-2xl mx-auto group">
        <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full opacity-0 group-focus-within:opacity-100 transition-opacity" />
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors" size={20} />
        <Input
          className="pl-12 bg-white/5 border-white/10 focus-visible:ring-1 focus-visible:ring-primary/50 text-white placeholder:text-gray-500 rounded-2xl h-14 text-base shadow-2xl relative z-10"
          placeholder="Artistes, titres ou genres..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            if (activeGenre) setActiveGenre(null);
          }}
        />
        {isLoading && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2 z-10">
            <Loader2 className="animate-spin text-primary" size={20} />
          </div>
        )}
      </div>

      {/* Exploration par Genres */}
      <div className="space-y-4">
        <h3 className="text-sm font-black uppercase tracking-[0.2em] text-gray-500 px-1 flex items-center gap-2">
          <Sparkles size={14} className="text-primary" /> Parcourir tout
        </h3>
        <div className="flex flex-wrap gap-2">
          {GENRES.map((genre) => (
            <button
              key={genre}
              onClick={() => {
                setActiveGenre(activeGenre === genre ? null : genre);
                setQuery("");
              }}
              className={cn(
                "px-6 py-2.5 rounded-full text-[12px] font-bold border transition-all duration-300",
                activeGenre === genre
                  ? "bg-primary border-primary text-white shadow-lg shadow-primary/20 scale-105"
                  : "bg-white/5 border-white/10 text-gray-400 hover:border-white/20 hover:text-white"
              )}
            >
              {genre}
            </button>
          ))}
        </div>
      </div>

      {/* Résultats */}
      <section className="space-y-4">
        <AnimatePresence mode="wait">
          {results.length > 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3"
            >
              {results.map((song) => (
                <div
                  key={song.id}
                  className={cn(
                    "group glass-card-pro p-3 flex items-center gap-4 cursor-pointer",
                    currentSongId === song.id && "bg-primary/10 border-primary/20"
                  )}
                  onClick={() => onPlaySong(song)}
                >
                  <div className="relative w-12 h-12 rounded-xl overflow-hidden shrink-0 shadow-lg">
                    <img src={song.cover_url} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={cn("text-sm font-bold truncate", currentSongId === song.id ? "text-primary" : "text-white")}>{song.title}</p>
                    <p className="text-xs text-gray-500 font-medium truncate">{song.artist_name}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-gray-500 hover:text-primary transition-colors opacity-0 group-hover:opacity-100"
                      onClick={(e) => handleShareSong(e, song)}
                    >
                      <Share2 size={12} />
                    </Button>
                    <div className="px-2 py-0.5 bg-white/5 rounded-full text-[9px] font-black uppercase text-gray-500 shrink-0">
                      {song.genre}
                    </div>
                  </div>
                </div>
              ))}
            </motion.div>
          ) : query || activeGenre ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="py-20 text-center space-y-3"
            >
              <Search size={40} className="mx-auto text-gray-700" />
              <p className="text-gray-500 font-medium italic">Aucun résultat trouvé pour cette recherche.</p>
            </motion.div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 opacity-40">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="aspect-square bg-white/5 rounded-2xl animate-pulse" />
              ))}
            </div>
          )}
        </AnimatePresence>
      </section>
    </div>
  );
};