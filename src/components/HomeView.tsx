"use client";

import { Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface HomeViewProps {
  songs: any[];
  playlists: any[];
  currentSongId: number;
  onPlaySong: (song: any) => void;
  onPlayPlaylist: (playlist: any) => void;
}

export const HomeView = ({ songs, playlists, currentSongId, onPlaySong, onPlayPlaylist }: HomeViewProps) => {
  return (
    <div className="space-y-8">
      <section className="mt-4">
        <h2 className="text-2xl font-bold mb-4 tracking-tight">Bonjour</h2>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
          {playlists.slice(0, 6).map(p => (
            <div 
              key={p.id} 
              onClick={() => onPlayPlaylist(p)}
              className="group flex items-center bg-white/5 hover:bg-white/10 rounded overflow-hidden transition-all cursor-pointer relative"
            >
              <img src={p.cover} alt="" className="w-14 h-14 md:w-20 md:h-20 shadow-2xl object-cover" />
              <span className="font-bold px-3 md:px-4 truncate text-sm md:text-base">{p.name}</span>
              <Button 
                size="icon" 
                className="absolute right-4 bg-green-500 hover:bg-green-400 text-black shadow-xl opacity-0 md:group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all rounded-full hidden md:flex"
              >
                <Play fill="black" size={20} />
              </Button>
            </div>
          ))}
        </div>
      </section>

      <section>
        <div className="flex items-end justify-between mb-4">
          <h2 className="text-xl md:text-2xl font-bold tracking-tight">Sélection pour vous</h2>
        </div>
        <div className="space-y-1">
          {songs.map((song, i) => (
            <div 
              key={song.id} 
              className={cn(
                "group flex items-center p-2 rounded-md transition-colors cursor-pointer active:bg-white/10",
                currentSongId === song.id ? "bg-white/5" : "hover:bg-white/5"
              )}
              onClick={() => onPlaySong(song)}
            >
              <div className="w-6 text-center mr-3 hidden md:block">
                <span className={cn("text-sm", currentSongId === song.id ? "text-green-500" : "text-gray-400")}>{i + 1}</span>
              </div>
              <img src={song.cover} alt="" className="w-12 h-12 rounded mr-3 shadow-lg object-cover" />
              <div className="flex-1 min-w-0">
                <p className={cn("text-sm font-medium truncate", currentSongId === song.id ? "text-green-500" : "text-white")}>{song.title}</p>
                <p className="text-xs text-gray-400 truncate">{song.artist}</p>
              </div>
              <span className="text-xs text-gray-400 hidden md:block w-10 text-right">{song.duration}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};