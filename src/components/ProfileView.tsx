"use client";

import { User, Music, MapPin, Calendar, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { PublishSongForm } from "./PublishSongForm";
import { useState } from "react";

interface ProfileViewProps {
  publishedSongs: any[];
  onPublish: (song: any) => void;
}

export const ProfileView = ({ publishedSongs, onPublish }: ProfileViewProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="py-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header Profil */}
      <div className="flex flex-col md:flex-row items-center gap-8 mb-12">
        <div className="w-32 h-32 md:w-48 md:h-48 rounded-full bg-gradient-to-br from-primary to-green-900 flex items-center justify-center border-4 border-white/5 shadow-2xl overflow-hidden">
          <User size={64} className="text-black/50" />
        </div>
        <div className="text-center md:text-left flex-1">
          <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
            <h2 className="text-4xl md:text-5xl font-black tracking-tighter">Artiste Gospel</h2>
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
              <DialogTrigger asChild>
                <Button className="bg-white text-black font-bold rounded-full hover:scale-105 transition-transform gap-2">
                  <Plus size={18} /> Publier un titre
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-[#121212] border-white/10 text-white max-w-md">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-bold">Publier sur Mboka Gospel</DialogTitle>
                </DialogHeader>
                <PublishSongForm onPublish={onPublish} onClose={() => setIsOpen(false)} />
              </DialogContent>
            </Dialog>
          </div>
          <div className="flex flex-wrap justify-center md:justify-start gap-4 text-gray-400 text-sm font-medium">
            <span className="flex items-center gap-1"><MapPin size={16} /> Kinshasa, RDC</span>
            <span className="flex items-center gap-1"><Calendar size={16} /> Membre depuis 2024</span>
            <span className="flex items-center gap-1 text-white"><Music size={16} /> {publishedSongs.length} Titres publiés</span>
          </div>
        </div>
      </div>

      {/* Mes Publications */}
      <section>
        <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
          <Music size={20} className="text-primary" />
          Mes dernières publications
        </h3>
        
        {publishedSongs.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {publishedSongs.map((song) => (
              <div key={song.id} className="group glass-card p-3 rounded-xl cursor-pointer">
                <img src={song.cover} alt="" className="w-full aspect-square object-cover rounded-lg mb-3 shadow-lg group-hover:scale-105 transition-transform" />
                <p className="font-bold text-sm truncate">{song.title}</p>
                <p className="text-xs text-gray-500">{song.artist}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white/[0.02] rounded-3xl border border-dashed border-white/10">
            <Music size={48} className="mx-auto mb-4 opacity-10" />
            <p className="text-gray-500 font-medium">Vous n'avez pas encore publié de chanson.</p>
            <p className="text-xs text-gray-600 mt-1">Partagez votre message au monde dès maintenant.</p>
          </div>
        )}
      </section>
    </div>
  );
};