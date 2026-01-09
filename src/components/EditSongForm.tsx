"use client";

import { useState, useRef } from "react";
import { Music, ImageIcon, User as UserIcon, Save, FileAudio, Loader2, AlignLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { showSuccess, showError } from "@/utils/toast";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";

interface EditSongFormProps {
  song: any;
  onUpdate: () => void;
  onClose: () => void;
}

const GENRES = ["Adoration", "Louange", "Chorale", "Afro-Gospel", "Urbain", "Classique", "Autre"];

export const EditSongForm = ({ song, onUpdate, onClose }: EditSongFormProps) => {
  const { user } = useAuth();
  const [title, setTitle] = useState(song.title);
  const [artistName, setArtistName] = useState(song.artist_name || "");
  const [genre, setGenre] = useState(song.genre || "");
  const [lyrics, setLyrics] = useState(song.lyrics || "");
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [status, setStatus] = useState("");

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
          showError("L'image doit être parfaitement carrée.");
          resolve(false);
        } else {
          resolve(true);
        }
      };
      img.onerror = () => {
        showError("Erreur image.");
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

    try {
      setIsUpdating(true);
      let audioUrl = song.audio_url;
      let coverUrl = song.cover_url;

      if (audioFile) {
        setStatus("Mise à jour audio...");
        const audioExt = audioFile.name.split('.').pop();
        const audioPath = `${user.id}/upd-${Date.now()}.${audioExt}`;
        const { error } = await supabase.storage.from('songs').upload(audioPath, audioFile);
        if (error) throw error;
        const { data } = supabase.storage.from('songs').getPublicUrl(audioPath);
        audioUrl = data.publicUrl;
      }

      if (coverFile) {
        setStatus("Mise à jour pochette...");
        const coverExt = coverFile.name.split('.').pop();
        const coverPath = `${user.id}/upd-${Date.now()}.${coverExt}`;
        const { error } = await supabase.storage.from('covers').upload(coverPath, coverFile);
        if (error) throw error;
        const { data } = supabase.storage.from('covers').getPublicUrl(coverPath);
        coverUrl = data.publicUrl;
      }

      setStatus("Enregistrement...");
      const { error } = await supabase
        .from('songs')
        .update({
          title,
          artist_name: artistName,
          genre,
          lyrics,
          audio_url: audioUrl,
          cover_url: coverUrl,
        })
        .eq('id', song.id);

      if (error) throw error;

      showSuccess("Titre mis à jour !");
      onUpdate();
      onClose();
    } catch (error: any) {
      showError(error.message);
    } finally {
      setIsUpdating(false);
      setStatus("");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 py-2 max-h-[70vh] overflow-y-auto px-1 custom-scrollbar">
      <div className="space-y-3">
        <div className="grid gap-1.5">
          <Label className="text-[11px] text-gray-500 uppercase font-bold">Titre</Label>
          <div className="relative">
            <Music className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={14} />
            <Input className="bg-white/5 border-white/10 pl-9 h-10 text-sm" value={title} onChange={(e) => setTitle(e.target.value)} required />
          </div>
        </div>

        <div className="grid gap-1.5">
          <Label className="text-[11px] text-gray-500 uppercase font-bold">Artiste</Label>
          <div className="relative">
            <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={14} />
            <Input className="bg-white/5 border-white/10 pl-9 h-10 text-sm" value={artistName} onChange={(e) => setArtistName(e.target.value)} required />
          </div>
        </div>

        <div className="grid gap-1.5">
          <Label className="text-[11px] text-gray-500 uppercase font-bold">Genre</Label>
          <Select onValueChange={setGenre} value={genre}>
            <SelectTrigger className="bg-white/5 border-white/10 h-10 text-sm">
              <SelectValue placeholder="Choisir un genre" />
            </SelectTrigger>
            <SelectContent className="bg-[#0C0607] border-white/10 text-white">
              {GENRES.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Button 
            type="button" variant="outline" size="sm" 
            className={cn("h-16 border-dashed border-white/10 bg-white/5 flex-col gap-1 text-[10px]", audioFile && "border-primary text-primary")}
            onClick={() => audioInputRef.current?.click()}
          >
            <FileAudio size={16} />
            <span className="truncate w-full px-1">{audioFile ? audioFile.name : "Remplacer Audio"}</span>
          </Button>
          <input type="file" ref={audioInputRef} className="hidden" accept="audio/*" onChange={(e) => setAudioFile(e.target.files?.[0] || null)} />

          <Button 
            type="button" variant="outline" size="sm" 
            className={cn("h-16 border-dashed border-white/10 bg-white/5 flex-col gap-1 text-[10px]", coverFile && "border-primary text-primary")}
            onClick={() => coverInputRef.current?.click()}
          >
            <ImageIcon size={16} />
            <span className="truncate w-full px-1">{coverFile ? coverFile.name : "Remplacer Pochette"}</span>
          </Button>
          <input type="file" ref={coverInputRef} className="hidden" accept="image/*" onChange={handleCoverChange} />
        </div>

        <div className="grid gap-1.5">
          <Label className="text-[11px] text-gray-500 uppercase font-bold">Paroles</Label>
          <div className="relative">
            <AlignLeft className="absolute left-3 top-3 text-gray-500" size={14} />
            <Textarea 
              className="bg-white/5 border-white/10 pl-9 min-h-[100px] text-xs resize-none"
              value={lyrics}
              onChange={(e) => setLyrics(e.target.value)}
              placeholder="Paroles du chant..."
            />
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-2 pt-4">
        {isUpdating && <p className="text-[10px] text-primary font-bold text-center animate-pulse uppercase">{status}</p>}
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