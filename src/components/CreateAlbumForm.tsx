"use client";

import { useState, useRef } from "react";
import { FolderPlus, ImageIcon, Type, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { showSuccess } from "@/utils/toast";

interface CreateAlbumFormProps {
  onCreated: (album: any) => void;
  onClose: () => void;
}

export const CreateAlbumForm = ({ onCreated, onClose }: CreateAlbumFormProps) => {
  const [name, setName] = useState("");
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [cover, setCover] = useState<File | null>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !cover) return;

    const newAlbum = {
      id: Date.now(),
      name,
      year,
      cover: URL.createObjectURL(cover),
      songCount: 0
    };

    onCreated(newAlbum);
    showSuccess("Album créé avec succès !");
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 py-2">
      <div className="grid gap-3">
        <div className="space-y-1.5">
          <Label className="text-[11px] text-gray-500 uppercase font-bold">Nom de l'album</Label>
          <div className="relative">
            <Type className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={14} />
            <Input 
              placeholder="Ex: Hosanna 2024" 
              className="bg-white/5 border-white/10 pl-9 h-9 text-sm"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label className="text-[11px] text-gray-500 uppercase font-bold">Année de sortie</Label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={14} />
            <Input 
              type="number"
              className="bg-white/5 border-white/10 pl-9 h-9 text-sm"
              value={year}
              onChange={(e) => setYear(e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label className="text-[11px] text-gray-500 uppercase font-bold">Pochette</Label>
          <Button 
            type="button" 
            variant="outline" 
            className="w-full h-20 border-dashed border-white/10 bg-white/5 flex-col gap-1 text-xs text-gray-400 hover:text-white"
            onClick={() => coverInputRef.current?.click()}
          >
            {cover ? (
              <span className="text-primary font-bold">{cover.name}</span>
            ) : (
              <>
                <ImageIcon size={20} />
                <span>Sélectionner une image</span>
              </>
            )}
          </Button>
          <input 
            type="file" 
            ref={coverInputRef} 
            className="hidden" 
            accept="image/*"
            onChange={(e) => setCover(e.target.files?.[0] || null)}
          />
        </div>
      </div>

      <div className="flex gap-2 pt-2">
        <Button type="button" variant="ghost" onClick={onClose} className="flex-1 h-9 text-xs">Annuler</Button>
        <Button type="submit" className="flex-1 h-9 text-xs bg-primary hover:bg-primary/90 gap-2">
          <FolderPlus size={14} /> Créer l'album
        </Button>
      </div>
    </form>
  );
};