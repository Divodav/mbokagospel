"use client";

import { useState, useRef } from "react";
import { Music, ImageIcon, User as UserIcon, UploadCloud, FileAudio } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { showSuccess, showError } from "@/utils/toast";
import { cn } from "@/lib/utils";

interface PublishSongFormProps {
  onPublish: (song: any) => void;
  onClose: () => void;
}

export const PublishSongForm = ({ onPublish, onClose }: PublishSongFormProps) => {
  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("");
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const audioInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title || !artist || !audioFile || !coverFile) {
      showError("Veuillez remplir tous les champs et sélectionner les fichiers.");
      return;
    }

    setIsUploading(true);

    // Simulation d'upload et création d'URLs locales pour la lecture immédiate
    const audioUrl = URL.createObjectURL(audioFile);
    const coverUrl = URL.createObjectURL(coverFile);

    const newSong = {
      id: Date.now(),
      title,
      artist,
      album: "Single",
      duration: "3:45", // En réalité, on pourrait extraire la durée du fichier audio
      cover: coverUrl,
      url: audioUrl,
      isLocal: true
    };

    setTimeout(() => {
      onPublish(newSong);
      showSuccess("Votre titre a été publié avec succès !");
      setIsUploading(false);
      onClose();
    }, 1500);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 py-2">
      <div className="space-y-4">
        <div className="grid gap-2">
          <Label htmlFor="title" className="text-gray-400">Titre de la chanson *</Label>
          <div className="relative">
            <Music className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
            <Input 
              id="title"
              placeholder="Ex: Hosanna au plus haut des cieux" 
              className="bg-white/5 border-white/10 pl-10 h-11"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="artist" className="text-gray-400">Artiste *</Label>
          <div className="relative">
            <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
            <Input 
              id="artist"
              placeholder="Votre nom de scène" 
              className="bg-white/5 border-white/10 pl-10 h-11"
              value={artist}
              onChange={(e) => setArtist(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label className="text-gray-400">Fichier Audio *</Label>
            <Button 
              type="button" 
              variant="outline" 
              className={cn(
                "h-20 border-dashed border-white/10 bg-white/5 flex-col gap-1 hover:bg-white/10 hover:border-primary/50",
                audioFile && "border-primary/50 text-primary"
              )}
              onClick={() => audioInputRef.current?.click()}
            >
              <FileAudio size={20} />
              <span className="text-[10px] truncate max-w-full px-2">
                {audioFile ? audioFile.name : "MP3, WAV, M4A..."}
              </span>
            </Button>
            <input 
              type="file" 
              ref={audioInputRef} 
              className="hidden" 
              accept=".mp3,.wav,.mp4,.m4a,audio/*"
              onChange={(e) => setAudioFile(e.target.files?.[0] || null)}
            />
          </div>

          <div className="grid gap-2">
            <Label className="text-gray-400">Pochette *</Label>
            <Button 
              type="button" 
              variant="outline" 
              className={cn(
                "h-20 border-dashed border-white/10 bg-white/5 flex-col gap-1 hover:bg-white/10 hover:border-primary/50",
                coverFile && "border-primary/50 text-primary"
              )}
              onClick={() => coverInputRef.current?.click()}
            >
              <ImageIcon size={20} />
              <span className="text-[10px] truncate max-w-full px-2">
                {coverFile ? coverFile.name : "Choisir Image"}
              </span>
            </Button>
            <input 
              type="file" 
              ref={coverInputRef} 
              className="hidden" 
              accept="image/*"
              onChange={(e) => setCoverFile(e.target.files?.[0] || null)}
            />
          </div>
        </div>
      </div>

      <div className="flex gap-3 pt-4">
        <Button type="button" variant="ghost" onClick={onClose} className="flex-1 rounded-full border border-white/10">
          Annuler
        </Button>
        <Button 
          type="submit" 
          disabled={isUploading}
          className="flex-1 bg-primary hover:bg-primary/90 text-black font-bold rounded-full gap-2 shadow-lg shadow-primary/20"
        >
          {isUploading ? "Publication..." : <><UploadCloud size={18} /> Publier</>}
        </Button>
      </div>
    </form>
  );
};