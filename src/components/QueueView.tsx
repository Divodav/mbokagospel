"use client";

import { Play, GripVertical, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface QueueViewProps {
  songs: any[];
  currentSongId: number;
  onPlaySong: (song: any) => void;
}

export const QueueView = ({ songs, currentSongId, onPlaySong }: QueueViewProps) => {
  const currentIndex = songs.findIndex(s => s.id === currentSongId);
  const nextSongs = songs.slice(currentIndex + 1);

  if (currentIndex === -1 || songs.length === 0) return null;

  return (
    <div className="py-6 space-y-8 animate-in fade-in duration-300">
      <section>
        <h2 className="text-xl font-bold mb-4">En cours de lecture</h2>
        <div className="bg-white/10 p-3 rounded-lg flex items-center gap-4">
          <img src={songs[currentIndex].cover_url} alt="" className="w-12 h-12 rounded object-cover" />
          <div className="flex-1">
            <p className="text-sm font-bold text-green-500">{songs[currentIndex].title}</p>
            <p className="text-xs text-gray-400">{songs[currentIndex].artist_name || songs[currentIndex].artist}</p>
          </div>
          <Play size={16} className="text-green-500 fill-green-500" />
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">À suivre</h2>
          <button className="text-xs font-bold text-gray-400 hover:text-white">Tout effacer</button>
        </div>
        
        <div className="space-y-1">
          {nextSongs.length > 0 ? (
            nextSongs.map((song) => (
              <div 
                key={song.id} 
                className="group flex items-center p-2 rounded-md hover:bg-white/5 transition-colors cursor-pointer"
                onClick={() => onPlaySong(song)}
              >
                <GripVertical size={16} className="text-gray-600 mr-2 opacity-0 group-hover:opacity-100" />
                <img src={song.cover_url} alt="" className="w-10 h-10 rounded mr-3 object-cover" />
                <div className="flex-1">
                  <p className="text-sm font-medium truncate">{song.title}</p>
                  <p className="text-xs text-gray-400 truncate">{song.artist_name || song.artist}</p>
                </div>
                <button className="p-2 opacity-0 group-hover:opacity-100 text-gray-400 hover:text-white transition-all">
                  <Trash2 size={16} />
                </button>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-sm italic">La file d'attente est vide.</p>
          )}
        </div>
      </section>
    </div>
  );
};