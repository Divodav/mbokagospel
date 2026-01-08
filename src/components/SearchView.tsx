"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface SearchViewProps {
  songs: any[];
  currentSongId: number;
  onPlaySong: (song: any) => void;
}

export const SearchView = ({ songs, currentSongId, onPlaySong }: SearchViewProps) => {
  const [query, setQuery] = useState("");
  
  const filteredSongs = songs.filter(s => 
    s.title.toLowerCase().includes(query.toLowerCase()) || 
    (s.artist_name || s.artist || "").toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="space-y-6 pt-4">
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
        <Input 
          className="pl-10 bg-white/10 border-none focus-visible:ring-1 focus-visible:ring-white/20 text-white placeholder:text-gray-500 rounded-full h-12"
          placeholder="Que souhaitez-vous écouter ?"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      <section>
        <h2 className="text-xl font-bold mb-4">Résultats</h2>
        <div className="space-y-1">
          {filteredSongs.length > 0 ? (
            filteredSongs.map((song) => (
              <div 
                key={song.id} 
                className={cn(
                  "group flex items-center p-2 rounded-md transition-colors cursor-pointer",
                  currentSongId === song.id ? "bg-white/10" : "hover:bg-white/5"
                )}
                onClick={() => onPlaySong(song)}
              >
                <img src={song.cover_url} alt="" className="w-12 h-12 rounded mr-3 object-cover" />
                <div className="flex-1 min-w-0">
                  <p className={cn("text-sm font-medium truncate", currentSongId === song.id ? "text-green-500" : "text-white")}>{song.title}</p>
                  <p className="text-xs text-gray-400 truncate">{song.artist_name || song.artist}</p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-sm">Aucun résultat trouvé pour "{query}"</p>
          )}
        </div>
      </section>
    </div>
  );
};