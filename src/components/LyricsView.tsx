"use client";

import { Music, FileText } from "lucide-react";
import { SongComments } from "./SongComments";
import { useNavigate } from "react-router-dom";

interface LyricsViewProps {
  song: any;
}

export const LyricsView = ({ song }: LyricsViewProps) => {
  const navigate = useNavigate();
  const lyricsLines = song.lyrics ? song.lyrics.split('\n') : [];

  return (
    <div className="py-8 md:py-12 flex flex-col items-center animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row items-center gap-8 mb-12 w-full max-w-4xl">
        <img
          src={song.cover_url || song.cover}
          alt=""
          className="w-48 h-48 md:w-64 md:h-64 rounded-lg shadow-2xl object-cover border border-white/10"
        />
        <div className="text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
            <span className="px-2 py-0.5 bg-primary/20 text-primary text-[10px] font-black rounded-full uppercase tracking-widest border border-primary/20">
              {song.genre || "Gospel"}
            </span>
          </div>
          <h2 className="text-3xl md:text-5xl font-black mb-2 tracking-tighter leading-tight">{song.title}</h2>
          <p className="text-xl text-gray-400 font-bold uppercase tracking-tight">{song.artist_name || song.artist}</p>
        </div>
      </div>

      <div className="w-full max-w-3xl space-y-6 text-center md:text-left">
        {lyricsLines.length > 0 ? (
          lyricsLines.map((line, i) => (
            <p
              key={i}
              className="text-2xl md:text-4xl font-bold text-white/40 hover:text-white transition-all duration-300 cursor-default"
            >
              {line || <br />}
            </p>
          ))
        ) : (
          <div className="py-20 flex flex-col items-center text-gray-500 space-y-4">
            <FileText size={48} className="opacity-20" />
            <p className="text-lg font-bold">Aucune parole disponible pour ce titre.</p>
          </div>
        )}
      </div>

      {/* Section Commentaires */}
      <div className="w-full max-w-3xl mt-12">
        <SongComments
          songId={song.id}
          songTitle={song.title}
          onLoginRequired={() => navigate('/login')}
        />
      </div>

      <div className="mt-20 flex items-center gap-2 text-gray-600 text-[10px] font-black uppercase tracking-[0.2em] border-t border-white/5 pt-8 w-full justify-center">
        <Music size={14} className="text-primary" />
        <span>Propriété spirituelle de l'artiste • Mboka Gospel</span>
      </div>
    </div>
  );
};
