"use client";

import { useState, useRef } from "react";
import { Music, ImageIcon, User as UserIcon, UploadCloud, FileAudio, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { showSuccess, showError } from "@/utils/toast";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";

interface PublishSongFormProps {
  onPublish: () => void;
  onClose: () => void;
}

export const PublishSongForm = ({ onPublish, onClose }: PublishSongFormProps) => {
  const { user } = useAuth();
  const [title, setTitle] = useState("");
  const [artistName, setArtistName] = useState("");
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState("");
  
  const [isDraggingAudio, setIsDraggingAudio] = useState(false);
  const [isDraggingCover, setIsDraggingCover] = useState(false);

  const audioInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent, type: 'audio' | 'cover') => {
    e.preventDefault();
    if (type === 'audio') setIsDraggingAudio(true);
    else setIsDraggingCover(true);
  };

  const handleDragLeave = (e: React.DragEvent, type: 'audio' | 'cover') => {
    e.preventDefault();
    if (type === 'audio') setIsDraggingAudio(false);
    else setIsDraggingCover(false);
  };

  const handleDrop = (e: React.DragEvent, type: 'audio' | 'cover') => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    if (type === 'audio') {
      setIsDraggingAudio(false);
      if (file.type.startsWith('audio/') || file.name.endsWith('.mp3')) setAudioFile(file);
      else showError("Veuillez déposer un fichier audio valide");
    } else {
      setIsDraggingCover(false);
      if (file.type.startsWith('image/')) setCoverFile(file);
      else showError("Veuillez déposer une image valide");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      showError("Vous devez être connecté pour publier.");
      return;
    }

    if (!title || !artistName || !audioFile || !coverFile) {
      showError("Veuillez remplir tous les champs obligatoires.");
      return;
    }

    try {
      setIsUploading(true);
      
      // 1. Upload Audio
      setUploadProgress("Envoi de l'audio...");
      const audioExt = audioFile.name.split('.').pop();
      const audioPath = `${user.id}/${Date.now()}.${audioExt}`;
      const { error: audioError } = await supabase.storage
        .from('songs')
        .upload(audioPath, audioFile);
      if (audioError) throw audioError;

      // 2. Upload Cover
      setUploadProgress("Envoi de la pochette...");
      const coverExt = coverFile.name.split('.').pop();
      const coverPath = `${user.id}/${Date.now()}.${coverExt}`;
      const { error: coverError } = await supabase.storage
        .from('covers')
        .upload(coverPath, coverFile);
      if (coverError) throw coverError;

      // 3. Récupérer les URLs publiques
      const { data: { publicUrl: audioUrl } } = supabase.storage.from('songs').getPublicUrl(audioPath);
      const { data: { publicUrl: coverUrl } } = supabase.storage.from('covers').getPublicUrl(coverPath);

      // 4. Insérer en BDD
      setUploadProgress("Finalisation...");
      const { error: dbError } = await supabase.from('songs').insert({
        title,
        artist_name: artistName,
        artist_id: user.id,
        audio_url: audioUrl,
        cover_url: coverUrl,
        duration: "0:00" // Idéalement calculé côté client avant upload
      });

      if (dbError) throw dbError;

      showSuccess("Louange publiée avec succès !");
      onPublish();
      onClose();
    } catch (error: any) {
      console.error("[PublishSongForm] Error:", error);
      showError(error.message || "Une erreur est survenue lors de la publication.");
    } finally {
      setIsUploading(false);
      setUploadProgress("");
    }
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
              disabled={isUploading}
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
              value={artistName}
              onChange={(e) => setArtistName(e.target.value)}
              disabled={isUploading}
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="grid gap-2 min-w-0">
            <Label className="text-gray-400">Audio *</Label>
            <div
              onDragOver={(e) => handleDragOver(e, 'audio')}
              onDragLeave={(e) => handleDragLeave(e, 'audio')}
              onDrop={(e) => handleDrop(e, 'audio')}
              className="min-w-0"
            >
              <Button 
                type="button" 
                variant="outline" 
                disabled={isUploading}
                className={cn(
                  "w-full h-24 border-dashed border-white/10 bg-white/5 flex-col gap-1 hover:bg-white/10 hover:border-primary/50 transition-all overflow-hidden px-2",
                  (audioFile || isDraggingAudio) && "border-primary/50 text-primary bg-primary/5",
                )}
                onClick={() => audioInputRef.current?.click()}
              >
                <FileAudio size={24} className={cn("shrink-0", isDraggingAudio && "animate-bounce")} />
                <span className="text-[10px] w-full truncate text-center block px-1">
                  {audioFile ? audioFile.name : "Cliquez ou glissez MP3"}
                </span>
              </Button>
            </div>
            <input 
              type="file" ref={audioInputRef} className="hidden" 
              accept="audio/*,.mp3"
              onChange={(e) => setAudioFile(e.target.files?.[0] || null)}
            />
          </div>

          <div className="grid gap-2 min-w-0">
            <Label className="text-gray-400">Pochette *</Label>
            <div
              onDragOver={(e) => handleDragOver(e, 'cover')}
              onDragLeave={(e) => handleDragLeave(e, 'cover')}
              onDrop={(e) => handleDrop(e, 'cover')}
              className="min-w-0"
            >
              <Button 
                type="button" 
                variant="outline" 
                disabled={isUploading}
                className={cn(
                  "w-full h-24 border-dashed border-white/10 bg-white/5 flex-col gap-1 hover:bg-white/10 hover:border-primary/50 transition-all overflow-hidden px-2",
                  (coverFile || isDraggingCover) && "border-primary/50 text-primary bg-primary/5",
                )}
                onClick={() => coverInputRef.current?.click()}
              >
                <ImageIcon size={24} className={cn("shrink-0", isDraggingCover && "animate-bounce")} />
                <span className="text-[10px] w-full truncate text-center block px-1">
                  {coverFile ? coverFile.name : "Cliquez ou glissez Image"}
                </span>
              </Button>
            </div>
            <input 
              type="file" ref={coverInputRef} className="hidden" 
              accept="image/*"
              onChange={(e) => setCoverFile(e.target.files?.[0] || null)}
            />
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3 pt-4">
        {isUploading && (
          <div className="flex items-center justify-center gap-2 text-primary animate-pulse py-2">
            <Loader2 size={16} className="animate-spin" />
            <span className="text-xs font-bold uppercase tracking-wider">{uploadProgress}</span>
          </div>
        )}
        <div className="flex gap-3">
          <Button type="button" variant="ghost" onClick={onClose} disabled={isUploading} className="flex-1 rounded-full border border-white/10">
            Annuler
          </Button>
          <Button 
            type="submit" 
            disabled={isUploading}
            className="flex-1 bg-primary hover:bg-primary/90 text-white font-bold rounded-full gap-2 shadow-lg shadow-primary/20"
          >
            {isUploading ? "Publication..." : <><UploadCloud size={18} /> Publier</>}
          </Button>
        </div>
      </div>
    </form>
  );
};