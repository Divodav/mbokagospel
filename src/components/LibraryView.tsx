"use client";

import { Heart, Disc, Users, Music, Plus, History, Download, Play } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface LibraryViewProps {
  onPlaySong: (song: any) => void;
}

export const LibraryView = ({ onPlaySong }: LibraryViewProps) => {
  const sections = [
    { id: 'liked', title: 'Titres aimés', icon: <Heart size={20} className="text-primary fill-primary" />, color: 'bg-gradient-to-br from-indigo-600 to-primary', count: '12 titres' },
    { id: 'recent', title: 'Écoutés récemment', icon: <History size={20} className="text-blue-400" />, color: 'bg-white/5', count: '48h d\'écoute' },
    { id: 'downloads', title: 'Téléchargements', icon: <Download size={20} className="text-green-400" />, color: 'bg-white/5', count: 'Disponible hors-ligne' },
  ];

  return (
    <div className="py-6 space-y-10 animate-in fade-in duration-500 pb-20">
      {/* Header simple */}
      <div className="flex items-center justify-between border-b border-white/[0.05] pb-6">
        <div>
          <h2 className="text-3xl font-black tracking-tighter">Ma Bibliothèque</h2>
          <p className="text-gray-500 text-sm font-medium">Retrouvez vos favoris et vos playlists.</p>
        </div>
        <Button className="rounded-full bg-primary hover:bg-primary/90 gap-2 h-10 px-6 font-black text-xs">
          <Plus size={16} /> CRÉER UNE PLAYLIST
        </Button>
      </div>

      {/* Grille d'accès rapide */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {sections.map((section) => (
          <motion.div 
            key={section.id}
            whileHover={{ scale: 1.02, y: -2 }}
            className={cn(
              "group relative p-6 rounded-[2rem] cursor-pointer overflow-hidden border border-white/[0.05] transition-all",
              section.color
            )}
          >
            <div className="relative z-10 flex flex-col h-full justify-between gap-8">
              <div className="p-3 bg-black/20 rounded-2xl w-fit backdrop-blur-md">
                {section.icon}
              </div>
              <div>
                <h4 className="font-black text-lg mb-1">{section.title}</h4>
                <p className="text-xs font-bold opacity-60 uppercase tracking-widest">{section.count}</p>
              </div>
            </div>
            {/* Bouton Play flottant au hover */}
            <div className="absolute right-6 bottom-6 w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-2xl opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all">
              <Play size={20} fill="black" className="text-black ml-1" />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Vos Listes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Playlists */}
        <div className="space-y-6">
          <h3 className="text-xl font-black flex items-center gap-3">
            <Disc className="text-primary" size={20} /> Vos Playlists
          </h3>
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="glass-card-pro p-3 flex items-center gap-4 group cursor-pointer">
                <div className="w-14 h-14 bg-white/5 rounded-xl flex items-center justify-center shrink-0 border border-white/5 overflow-hidden">
                  <div className="grid grid-cols-2 w-full h-full opacity-40 group-hover:opacity-100 transition-opacity">
                    <div className="bg-primary/20" /><div className="bg-blue-500/20" />
                    <div className="bg-purple-500/20" /><div className="bg-indigo-500/20" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm truncate">Ma Playlist #{i}</p>
                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-tighter">Par vous • 12 titres</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Artistes suivis */}
        <div className="space-y-6">
          <h3 className="text-xl font-black flex items-center gap-3">
            <Users className="text-primary" size={20} /> Artistes suivis
          </h3>
          <div className="grid grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="glass-card-pro p-4 flex flex-col items-center text-center gap-3 cursor-pointer group">
                <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden group-hover:scale-105 transition-transform shadow-xl">
                  <Users size={24} className="text-gray-600" />
                </div>
                <div className="space-y-1">
                  <p className="font-bold text-xs truncate">Artiste #{i}</p>
                  <p className="text-[9px] text-primary font-black uppercase tracking-widest">Suivi</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};