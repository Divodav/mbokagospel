"use client";

import { useState, useRef } from "react";
import { Music, ImageIcon, User as UserIcon, UploadCloud, FileAudio, Loader2, AlignLeft, CheckCircle2, AlertCircle, ArrowRight, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { showSuccess, showError } from "@/utils/toast";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";
import { motion, AnimatePresence } from "framer-motion";

interface PublishSongFormProps {
  onPublish: () => void;
  onClose: () => void;
}

const GENRES = ["Adoration", "Louange", "Chorale", "Afro-Gospel", "Urbain", "Classique", "Autre"];

export const PublishSongForm = ({ onPublish, onClose }: PublishSongFormProps) => {
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const totalSteps = 4;

  // Form Data
  const [title, setTitle] = useState("");
  const [artistName, setArtistName] = useState("");
  const [genre, setGenre] = useState("");
  const [lyrics, setLyrics] = useState("");
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [duration, setDuration] = useState("0:00");

  // Upload State
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState("");

  const audioInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAudioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAudioFile(file);
      const audio = new Audio();
      audio.src = URL.createObjectURL(file);
      audio.onloadedmetadata = () => {
        setDuration(formatDuration(audio.duration));
        URL.revokeObjectURL(audio.src);
      };
    }
  };

  const validateImage = (file: File): Promise<boolean> => {
    return new Promise((resolve) => {
      const MAX_SIZE = 2 * 1024 * 1024; // 2Mo
      if (file.size > MAX_SIZE) {
        showError("L'image est trop lourde (max 2 Mo).");
        resolve(false);
        return;
      }
      const img = new Image();
      img.src = URL.createObjectURL(file);
      img.onload = () => {
        URL.revokeObjectURL(img.src);
        if (img.width !== img.height) {
          showError("L'image doit être carrée SVP.");
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

  const handleSubmit = async () => {
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
        duration,
        status: 'pending' // Explicitement en attente
      });

      if (dbError) throw dbError;

      showSuccess("Louange soumise pour validation !");
      onPublish();
      onClose();
    } catch (error: any) {
      showError(error.message || "Erreur lors de la publication.");
    } finally {
      setIsUploading(false);
      setUploadProgress("");
    }
  };

  const nextStep = () => {
    if (step === 2 && (!title || !artistName || !genre)) {
      showError("Merci de compléter les informations.");
      return;
    }
    if (step === 3 && (!audioFile || !coverFile)) {
      showError("L'audio et la pochette sont requis.");
      return;
    }
    setStep(prev => Math.min(prev + 1, totalSteps));
  };

  const prevStep = () => setStep(prev => Math.max(prev - 1, 1));

  return (
    <div className="py-2 h-[500px] flex flex-col">
      {/* Progress Bar */}
      <div className="flex items-center justify-between mb-6 px-1">
        {[1, 2, 3, 4].map((s) => (
          <div key={s} className="flex items-center">
            <div className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border transition-colors",
              step >= s ? "bg-primary border-primary text-white" : "bg-white/5 border-white/10 text-gray-500"
            )}>
              {step > s ? <CheckCircle2 size={16} /> : s}
            </div>
            {s < 4 && <div className={cn("w-8 h-0.5 mx-1 transition-colors", step > s ? "bg-primary" : "bg-white/10")} />}
          </div>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar px-1">
        <AnimatePresence mode="wait">

          {/* ETAPE 1 : Bienvenue */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
              className="space-y-6 text-center py-4"
            >
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto text-primary mb-4">
                <UploadCloud size={40} />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">Publiez votre louange</h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  Partagez votre créativité avec la communauté MbokaGospel.
                  Chaque titre est écouté par notre équipe avant d'être visible par tous.
                </p>
              </div>

              <div className="bg-white/5 rounded-xl p-4 text-left space-y-3 text-sm border border-white/5">
                <div className="flex gap-3">
                  <CheckCircle2 className="text-green-500 shrink-0" size={18} />
                  <span className="text-gray-300">Fichiers MP3 uniquement</span>
                </div>
                <div className="flex gap-3">
                  <CheckCircle2 className="text-green-500 shrink-0" size={18} />
                  <span className="text-gray-300">Pochette carrée obligatoire (Image)</span>
                </div>
                <div className="flex gap-3">
                  <AlertCircle className="text-orange-500 shrink-0" size={18} />
                  <span className="text-gray-300">Respect des droits d'auteur</span>
                </div>
              </div>
            </motion.div>
          )}

          {/* ETAPE 2 : Infos */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <h3 className="text-lg font-bold mb-4">Informations principales</h3>

              <div className="space-y-2">
                <Label>Titre du morceau</Label>
                <Input
                  placeholder="Ex: Jésus Sauve"
                  className="bg-white/5 border-white/10"
                  value={title} onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Nom d'artiste</Label>
                <Input
                  placeholder="Votre nom de scène"
                  className="bg-white/5 border-white/10"
                  value={artistName} onChange={(e) => setArtistName(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Style musical</Label>
                <Select onValueChange={setGenre} value={genre}>
                  <SelectTrigger className="bg-white/5 border-white/10">
                    <SelectValue placeholder="Choisir un style" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#0C0607] border-white/10 text-white">
                    {GENRES.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </motion.div>
          )}

          {/* ETAPE 3 : Médias */}
          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <h3 className="text-lg font-bold mb-4">Fichiers audio & visuel</h3>

              <div className="space-y-2">
                <Label className="flex justify-between">
                  <span>Fichier Audio (MP3)</span>
                  {duration !== "0:00" && <span className="text-primary font-bold">{duration}</span>}
                </Label>
                <div
                  onClick={() => audioInputRef.current?.click()}
                  className={cn(
                    "border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all hover:bg-white/5",
                    audioFile ? "border-primary bg-primary/5" : "border-white/10"
                  )}
                >
                  <FileAudio className={cn("mx-auto mb-2", audioFile ? "text-primary" : "text-gray-500")} size={32} />
                  <p className="text-sm font-medium truncate px-4">
                    {audioFile ? audioFile.name : "Cliquez pour ajouter le fichier MP3"}
                  </p>
                </div>
                <input type="file" ref={audioInputRef} className="hidden" accept="audio/mpeg" onChange={handleAudioChange} />
              </div>

              <div className="space-y-2">
                <Label>Pochette (Format Carré)</Label>
                <div
                  onClick={() => coverInputRef.current?.click()}
                  className={cn(
                    "border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all hover:bg-white/5",
                    coverFile ? "border-primary bg-primary/5" : "border-white/10"
                  )}
                >
                  <ImageIcon className={cn("mx-auto mb-2", coverFile ? "text-primary" : "text-gray-500")} size={32} />
                  <p className="text-sm font-medium truncate px-4">
                    {coverFile ? coverFile.name : "Cliquez pour ajouter une image"}
                  </p>
                </div>
                <input type="file" ref={coverInputRef} className="hidden" accept="image/*" onChange={handleCoverChange} />
              </div>
            </motion.div>
          )}

          {/* ETAPE 4 : Validation */}
          {step === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <h3 className="text-lg font-bold mb-4">Derniers détails</h3>

              <div className="space-y-2">
                <Label>Paroles (Optionnel)</Label>
                <Textarea
                  placeholder="Collez les paroles ici pour qu'elles s'affichent lors de l'écoute..."
                  className="bg-white/5 border-white/10 min-h-[150px] resize-none"
                  value={lyrics} onChange={(e) => setLyrics(e.target.value)}
                />
              </div>

              <div className="bg-white/5 p-4 rounded-xl border border-white/10 space-y-1">
                <p className="text-xs text-gray-500 uppercase font-black tracking-widest">RÉCAPITULATIF</p>
                <p className="font-bold text-lg">{title || "Sans titre"}</p>
                <p className="text-gray-400 text-sm">{artistName || "Artiste inconnu"} • {genre}</p>
                <div className="flex items-center gap-2 mt-2 pt-2 border-t border-white/5 text-xs text-yellow-500 font-medium">
                  <CheckCircle2 size={12} />
                  Statut : En attente de validation
                </div>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      {/* Footer Actions */}
      <div className="pt-4 mt-auto border-t border-white/5">
        {isUploading ? (
          <div className="flex flex-col items-center justify-center gap-2 py-2">
            <Loader2 size={24} className="animate-spin text-primary" />
            <p className="text-xs font-bold uppercase tracking-widest text-primary animate-pulse">{uploadProgress}</p>
          </div>
        ) : (
          <div className="flex justify-between gap-4">
            {step > 1 ? (
              <Button variant="outline" onClick={prevStep} className="rounded-full border-white/10 hover:bg-white/5">
                <ArrowLeft size={16} className="mr-2" /> Retour
              </Button>
            ) : (
              <Button variant="ghost" onClick={onClose} className="rounded-full text-gray-500 hover:text-white">
                Annuler
              </Button>
            )}

            {step < totalSteps ? (
              <Button onClick={nextStep} className="bg-white text-black hover:bg-gray-200 rounded-full font-bold px-6">
                Suivant <ArrowRight size={16} className="ml-2" />
              </Button>
            ) : (
              <Button onClick={handleSubmit} className="bg-primary hover:bg-primary/90 rounded-full font-bold px-8 shadow-lg shadow-primary/20">
                <UploadCloud size={16} className="mr-2" /> Publier
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};