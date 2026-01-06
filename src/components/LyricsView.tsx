"use client";

import { Music } from "lucide-react";

interface LyricsViewProps {
  song: any;
}

export const LyricsView = ({ song }: LyricsViewProps) => {
  // Paroles fictives pour la démo
  const lyrics = [
    "Oh Seigneur, nous élevons ton nom",
    "Dans Mboka Gospel, nous te louons",
    "Ta grâce est infinie, ton amour est grand",
    "Nous chantons ta gloire à chaque instant",
    "Alléluia, Alléluia !",
    "Tu es le Roi des rois, le Dieu puissant",
    "Rien n'est impossible à celui qui croit",
    "Nous marchons par la foi, guidés par ta voix"
  ];

  return (
    <div className="py-8 md:py-12 flex flex-col items-center animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row items-center gap-8 mb-12 w-full max-w-4xl">
        <img src={song.cover} alt="" className="w-48 h-48 md:w-64 md:h-64 rounded-lg shadow-2xl object-cover" />
        <div className="text-center md:text-left">
          <h2 className="text-3xl md:text-5xl font-bold mb-2 tracking-tight">{song.title}</h2>
          <p className="text-xl text-gray-400 font-medium">{song.artist}</p>
        </div>
      </div>
      
      <div className="w-full max-w-3xl space-y-6 text-center md:text-left">
        {lyrics.map((line, i) => (
          <p 
            key={i} 
            className={`text-2xl md:text-4xl font-bold transition-all duration-300 ${
              i === 1 ? "text-white scale-105" : "text-white/30 hover:text-white/60"
            }`}
          >
            {line}
          </p>
        ))}
      </div>

      <div className="mt-16 flex items-center gap-2 text-gray-500 text-sm">
        <Music size={16} />
        <span>Paroles fournies par Mboka Lyrics</span>
      </div>
    </div>
  );
};