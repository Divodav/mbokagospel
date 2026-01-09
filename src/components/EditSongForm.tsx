"use client";

import { useState, useRef } from "react";
import { Music, ImageIcon, User as UserIcon, Save, FileAudio, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { showSuccess, showError } from "@/utils/toast";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";

interface EditSongFormProps {
  song: any;
  onUpdate: () => void;
  onClose: () => void;
}

export const EditSongForm = ({ song, onUpdate, onClose }: EditSongFormProps) => {
  const { user } = useAuth();
  const [title, setTitle] = useState(song.title);
  const [artistName, setArtistName] = useState(song.artist_name || "");
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [status, setStatus] = useState("");

  const audioInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      setIsUpdating(true);
      let audioUrl = song.audio_url;
      let coverUrl = song.cover_url;

      // 1. Upload new audio if selected
      if (audioFile) {
        setStatus("Mise à jour de l'audio...");
        const audioExt = audioFile.name.split('.').pop();
        const audioPath = `${user.id}/updated-${Date.now()}.${audioExt}`;
        const { error: audioError } = await supabase.storage
          .from('songs')
          .upload(audioPath, audioFile);
        if (audioError) throw audioError;
        const { data: { publicUrl } } = supabase.storage.from('songs').getPublicUrl(audioPath);
        audioUrl = publicUrl;
      }

      // 2. Upload new cover if selected
      if (coverFile) {
        setStatus("Mise à jour de la pochette...");
        const coverExt = coverFile.name.split('.').pop();
        const coverPath = `${user.id}/updated-${Date.now()}.${coverExt}`;
        const { error: coverError } = await supabase.storage
          .from('covers')
          .upload(coverPath, coverFile);
        if (coverError) throw coverError;
        const { data: { publicUrl } } = supabase.storage.from('covers').getPublicUrl(coverPath);
        coverUrl = publicUrl;
      }

      // 3. Update database
      setStatus("Enregistrement...");
      const { error: dbError } = await supabase
        .from('songs')
        .update({
          title,
          artist_name: artistName,
          audio_url: audioUrl,
          cover_url: coverUrl,
        })
        .eq('id', song.id);

      if (dbError) throw dbError;

      showSuccess("Titre mis à jour avec succès !");
      onUpdate();
      onClose();
    } catch (error: any) {
      console.error("[EditSongForm] Error:", error);
      showError(error.message || "Erreur lors de la mise à jour.");
    } finally {
      setIsUpdating(false);
      setStatus("");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 py-2">
      <div className="space-y-3">
        <div className="grid gap-1.5">
          <Label className="text-[11px] text-gray-500 uppercase font-bold">Titre</Label>
          <div className="relative">
            <Music className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={14} />
            <Input 
              className="bg-white/5 border-white/10 pl-9 h-10 text-sm"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="grid gap-1.5">
          <Label className="text-[11px] text-gray-500 uppercase font-bold">Artiste</Label>
          <div className="relative">
            <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={14} />
            <Input 
              className="bg-white/5 border-white/10 pl-9 h-10 text-sm"
              value={artistName}
              onChange={(e) => setArtistName(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="grid gap-1.5">
            <Label className="text-[11px] text-gray-500 uppercase font-bold">Remplacer Audio</Label>
            <Button 
              type="button" variant="outline" size="sm" 
              className={cn("h-16 border-dashed border-white/10 bg-white/5 flex-col gap-1 text-[10px]", audioFile && "border-primary text-primary")}
              onClick={() => audioInputRef.current?.click()}
            >
              <FileAudio size={16} />
              <span className="truncate w-full px-1 text-center">{audioFile ? audioFile.name : "Optionnel"}</span>
            </Button>
            <input type="file" ref={audioInputRef} className="hidden" accept="audio/*,.mp3" onChange={(e) => setAudioFile(e.target.files?.[0] || null)} />
          </div>

          <div className="grid gap-1.5">
            <Label className="text-[11px] text-gray-500 uppercase font-bold">Remplacer Image</Label>
            <Button 
              type="button" variant="outline" size="sm" 
              className={cn("h-16 border-dashed border-white/10 bg-white/5 flex-col gap-1 text-[10px]", coverFile && "border-primary text-primary")}
              onClick={() => coverInputRef.current?.click()}
            >
              <ImageIcon size={16} />
              <span className="truncate w-full px-1 text-center">{coverFile ? coverFile.name : "Optionnel"}</span>
            </Button>
            <input type="file" ref={coverInputRef} className="hidden" accept="image/*" onChange={(e) => setCoverFile(e.target.files?.[0] || null)} />
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-2 pt-4">
        {isUpdating && <p className="text-[10px] text-primary font-bold text-center animate-pulse uppercase tracking-widest">{status}</p>}
        <div className="flex gap-2">
          <Button type="button" variant="ghost" onClick={onClose} disabled={isUpdating} className="flex-1 rounded-full h-10 text-xs">Annuler</Button>
          <Button type="submit" disabled={isUpdating} className="flex-1 bg-primary hover:bg-primary/90 rounded-full h-10 text-xs gap-2">
            {isUpdating ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} Enregistrer
          </Button>
        </div>
      </div>
    </form>
  );
};