"use client";

import { useState, useRef } from "react";
import { User, MapPin, AlignLeft, Save, ImageIcon, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { showSuccess, showError } from "@/utils/toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";

interface EditProfileFormProps {
  profile: any;
  onUpdate: () => void;
  onClose: () => void;
}

export const EditProfileForm = ({ profile, onUpdate, onClose }: EditProfileFormProps) => {
  const { user } = useAuth();
  const [name, setName] = useState(profile?.name || "");
  const [location, setLocation] = useState(profile?.location || "");
  const [bio, setBio] = useState(profile?.bio || "");
  const [image, setImage] = useState<File | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      setIsSaving(true);
      let avatarUrl = profile?.avatar_url;

      // 1. Upload de la nouvelle photo si présente
      if (image) {
        const fileExt = image.name.split('.').pop();
        const filePath = `${user.id}/${Date.now()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(filePath, image);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('avatars')
          .getPublicUrl(filePath);
          
        avatarUrl = publicUrl;
      }

      // 2. Mise à jour de la table profiles
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          name,
          location,
          bio,
          avatar_url: avatarUrl,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (updateError) throw updateError;

      showSuccess("Profil mis à jour avec succès !");
      onUpdate();
      onClose();
    } catch (error: any) {
      console.error("[EditProfileForm] Error:", error);
      showError(error.message || "Impossible de mettre à jour le profil.");
    } finally {
      setIsSaving(false);
    }
  };

  const previewUrl = image ? URL.createObjectURL(image) : profile?.avatar_url;

  return (
    <form onSubmit={handleSubmit} className="space-y-4 py-2">
      <div className="grid gap-3">
        <div className="space-y-1.5 flex flex-col items-center">
          <Label className="text-[11px] text-gray-500 uppercase font-bold self-start">Photo de profil</Label>
          <div 
            className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-dashed border-white/20 hover:border-primary/50 cursor-pointer group transition-all bg-white/5"
            onClick={() => fileInputRef.current?.click()}
          >
            {previewUrl ? (
              <img src={previewUrl} className="w-full h-full object-cover" alt="Avatar" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <User size={32} className="text-gray-600" />
              </div>
            )}
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <ImageIcon size={20} />
            </div>
          </div>
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            accept="image/*"
            onChange={(e) => setImage(e.target.files?.[0] || null)}
          />
        </div>

        <div className="space-y-1.5">
          <Label className="text-[11px] text-gray-500 uppercase font-bold">Nom d'artiste</Label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={14} />
            <Input 
              className="bg-white/5 border-white/10 pl-9 h-10 text-sm"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Votre nom d'artiste"
              disabled={isSaving}
              required
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label className="text-[11px] text-gray-500 uppercase font-bold">Localisation</Label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={14} />
            <Input 
              className="bg-white/5 border-white/10 pl-9 h-10 text-sm"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Ex: Kinshasa, RDC"
              disabled={isSaving}
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label className="text-[11px] text-gray-500 uppercase font-bold">Biographie</Label>
          <div className="relative">
            <AlignLeft className="absolute left-3 top-3 text-gray-500" size={14} />
            <Textarea 
              className="bg-white/5 border-white/10 pl-9 min-h-[100px] text-sm resize-none"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Parlez-nous de votre ministère..."
              disabled={isSaving}
            />
          </div>
        </div>
      </div>

      <div className="flex gap-2 pt-4">
        <Button type="button" variant="ghost" onClick={onClose} disabled={isSaving} className="flex-1 rounded-full">
          Annuler
        </Button>
        <Button type="submit" disabled={isSaving} className="flex-1 bg-primary hover:bg-primary/90 rounded-full gap-2">
          {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          Enregistrer
        </Button>
      </div>
    </form>
  );
};