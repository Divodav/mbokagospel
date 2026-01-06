"use client";

import { useState } from "react";
import { Music, ImageIcon, User as UserIcon, UploadCloud } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { showSuccess } from "@/utils/toast";

interface PublishSongFormProps {
  onPublish: (song: any) => void;
  onClose: () => void;
}

export const PublishSongForm = ({ onPublish, onClose }: PublishSongFormProps) => {
  const [formData, setFormData] = useState({
    title: "",
    artist: "",
    cover: "https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=400&h=400&fit=crop",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.artist) return;

    const newSong = {
      id: Date.now(),
      title: formData.title,
      artist: formData.artist,
      album: "Single",
      duration: "3:45",
      cover: formData.cover,
    };

    onPublish(newSong);
    showSuccess("Votre chanson a été publiée avec succès !");
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 py-4">
      <div className="space-y-4">
        <div className="grid gap-2">
          <Label htmlFor="title" className="text-gray-400">Titre de la chanson</Label>
          <div className="relative">
            <Music className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
            <Input 
              id="title"
              placeholder="Ex: Hosanna au plus haut des cieux" 
              className="bg-white/5 border-white/10 pl-10 h-12"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="artist" className="text-gray-400">Nom de l'artiste</Label>
          <div className="relative">
            <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
            <Input 
              id="artist"
              placeholder="Votre nom de scène" 
              className="bg-white/5 border-white/10 pl-10 h-12"
              value={formData.artist}
              onChange={(e) => setFormData({ ...formData, artist: e.target.value })}
              required
            />
          </div>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="cover" className="text-gray-400">URL de la pochette (Image)</Label>
          <div className="relative">
            <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
            <Input 
              id="cover"
              placeholder="https://images.unsplash.com/..." 
              className="bg-white/5 border-white/10 pl-10 h-12"
              value={formData.cover}
              onChange={(e) => setFormData({ ...formData, cover: e.target.value })}
            />
          </div>
        </div>
      </div>

      <div className="flex gap-3 pt-4">
        <Button type="button" variant="ghost" onClick={onClose} className="flex-1 rounded-full border border-white/10">
          Annuler
        </Button>
        <Button type="submit" className="flex-1 bg-primary hover:bg-primary/90 text-black font-bold rounded-full gap-2">
          <UploadCloud size={18} /> Publier
        </Button>
      </div>
    </form>
  );
};