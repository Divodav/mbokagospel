"use client";

import { useState, useRef } from "react";
import { Music, ImageIcon, User as UserIcon, UploadCloud, FileAudio, Loader2, AlignLeft, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { showSuccess, showError } from "@/utils/toast";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";

interface PublishSongFormProps {
  onPublish: () => void;
  onClose: () => void;
}

const GENRES = ["Adoration", "Louange", "Chorale", "Afro-Gospel", "Urbain", "Classique", "Autre"];

export const PublishSongForm = ({ onPublish, onClose }: PublishSongFormProps) => {
  const { user } = useAuth();
  const [title, setTitle] = useState("");
  const [artistName, setArtistName] = useState("");
  const [genre, setGenre] = useState("");
  const [lyrics, setLyrics] = useState("");
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState("");
  
  const audioInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const validateImage = (file: File): Promise<boolean> => {
    return new Promise((resolve) => {
      const MAX_SIZE = 1 * 1024 * 1024;
      if (file.size > MAX_SIZE) {
        showError("L'image est trop lourde (max 1 Mo).");
        resolve(false);
        return;
      }
      const img = new Image();
      img.src = URL.createObjectURL(file);
      img.onload = () => {
        URL.revokeObjectURL(img.src);
        if (img.width !== img.height) {
          showError("L'image doit être parfaitement carrée (1:1).");
          resolve(false);
        } else {
          resolve(true);
        }
      };
      img.onerror = () => {
        showError("Impossible de lire l'image.");
        resolve(false);
      };
    });
  };

  const handleCoverChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const isValid = await validateImage(file);
      if (isValid) setCoverFile(file);
      else e.target.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!title || !artistName || !audioFile || !coverFile || !genre) {
      showError("Veuillez remplir tous les champs obligatoires.");
      return;
    }

    try {
      setIsUploading(true);
      
      setUploadProgress("Envoi de l'audio...");
      const audioExt = audioFile.name.split('.').pop();
      const audioPath = `${user.id}/${Date.now()}.${audioExt}`;
      const { error: audioError } = await supabase.storage.from('songs').upload(audioPath, audioFile);
      if (audioError) throw audioError;

      setUploadProgress("Envoi de la pochette...");
      const coverExt = coverFile.name.split('.').pop();
      const coverPath = `${user.id}/${Date.now()}.${coverExt}`;
      const { error: coverError } = await supabase.storage.from('covers').upload(coverPath, coverFile);
      if (coverError) throw coverError;

      const { data: { publicUrl: audioUrl } } = supabase.storage.from('songs').getPublicUrl(audioPath);
      const { data: { publicUrl: coverUrl } } = supabase.storage.from('covers').getPublicUrl(coverPath);

      setUploadProgress("Finalisation...");
      const { error: dbError } = await supabase.from('songs').insert({
        title,
        artist_name: artistName,
        artist_id: user.id,
        audio_url: audioUrl,
        cover_url: coverUrl,
        genre,
        lyrics,
        duration: "0:00"
      });

      if (dbError) throw dbError;

      showSuccess("Louange publiée avec succès !");
      onPublish();
      onClose();
    } catch (error: any) {
      showError(error.message || "Erreur lors de la publication.");
    } finally {
      setIsUploading(false);
      setUploadProgress("");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 py-2 max-h-[70vh] overflow-y-auto px-1 custom-scrollbar">
      <div className="grid gap-4">
        <div className="grid gap-2">
          <Label className="text-gray-400">Titre *</Label>
          <div className="relative">
            <Music className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
            <Input 
              placeholder="Nom du chant" 
              className="bg-white/5 border-white/10 pl-10 h-10"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={isUploading}
              required
            />
          </div>
        </div>

        <div className="grid gap-2">
          <Label className="text-gray-400">Artiste *</Label>
          <div className="relative">
            <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
            <Input 
              placeholder="Votre nom" 
              className="bg-white/5 border-white/10 pl-10 h-10"
              value={artistName}
              onChange={(e) => setArtistName(e.target.value)}
              disabled={isUploading}
              required
            />
          </div>
        </div>

        <div className="grid gap-2">
          <Label className="text-gray-400">Genre *</Label>
          <Select onValueChange={setGenre} disabled={isUploading}>
            <SelectTrigger className="bg-white/5 border-white/10 h-10">
              <SelectValue placeholder="Sélectionnez un genre" />
            </SelectTrigger>
            <SelectContent className="bg-[#0C0607] border-white/10 text-white">
              {GENRES.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label className="text-gray-400">Audio *</Label>
            <Button 
              type="button" variant="outline" disabled={isUploading}
              className={cn("w-full h-20 border-dashed border-white/10 bg-white/5 flex-col gap-1 text-[10px]", audioFile && "border-primary/50 text-primary")}
              onClick={() => audioInputRef.current?.click()}
            >
              <FileAudio size={20} />
              <span className="truncate w-full px-2">{audioFile ? audioFile.name : "MP3 uniquement"}</span>
            </Button>
            <input type="file" ref={audioInputRef} className="hidden" accept="audio/mpeg" onChange={(e) => setAudioFile(e.target.files?.[0] || null)} />
          </div>

          <div className="grid gap-2">
            <Label className="text-gray-400">Pochette (1:1) *</Label>
            <Button 
              type="button" variant="outline" disabled={isUploading}
              className={cn("w-full h-20 border-dashed border-white/10 bg-white/5 flex-col gap-1 text-[10px]", coverFile && "border-primary/50 text-primary")}
              onClick={() => coverInputRef.current?.click()}
            >
              <ImageIcon size={20} />
              <span className="truncate w-full px-2">{coverFile ? coverFile.name : "Max 1Mo"}</span>
            </Button>
            <input type="file" ref={coverInputRef} className="hidden" accept="image/*" onChange={handleCoverChange} />
          </div>
        </div>

        <div className="grid gap-2">
          <Label className="text-gray-400">Paroles (Optionnel)</Label>
          <div className="relative">
            <AlignLeft className="absolute left-3 top-3 text-gray-500" size={16} />
            <Textarea 
              placeholder="Saisissez les paroles du chant..." 
              className="bg-white/5 border-white/10 pl-10 min-h-[120px] text-xs resize-none"
              value={lyrics}
              onChange={(e) => setLyrics(e.target.value)}
              disabled={isUploading}
            />
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3 pt-4">
        {isUploading && (
          <div className="flex items-center justify-center gap-2 text-primary py-2">
            <Loader2 size={16} className="animate-spin" />
            <span className="text-[10px] font-bold uppercase tracking-widest">{uploadProgress}</span>
          </div>
        )}
        <div className="flex gap-3">
          <Button type="button" variant="ghost" onClick={onClose} disabled={isUploading} className="flex-1 rounded-full border border-white/10">Annuler</Button>
          <Button type="submit" disabled={isUploading} className="flex-1 bg-primary hover:bg-primary/90 text-white font-bold rounded-full gap-2">
            {isUploading ? "..." : <><UploadCloud size={16} /> Publier</>}
          </Button>
        </div>
      </div>
    </form>
  );
};