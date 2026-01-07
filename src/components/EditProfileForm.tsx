"use client";

import { useState } from "react";
import { User, MapPin, AlignLeft, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { showSuccess } from "@/utils/toast";

interface EditProfileFormProps {
  profile: any;
  onUpdate: (profile: any) => void;
  onClose: () => void;
}

export const EditProfileForm = ({ profile, onUpdate, onClose }: EditProfileFormProps) => {
  const [name, setName] = useState(profile.name);
  const [location, setLocation] = useState(profile.location);
  const [bio, setBio] = useState(profile.bio);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate({ name, location, bio });
    showSuccess("Profil mis à jour !");
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 py-2">
      <div className="grid gap-3">
        <div className="space-y-1.5">
          <Label className="text-[11px] text-gray-500 uppercase font-bold">Nom d'artiste</Label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={14} />
            <Input 
              className="bg-white/5 border-white/10 pl-9 h-9 text-sm"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label className="text-[11px] text-gray-500 uppercase font-bold">Localisation</Label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={14} />
            <Input 
              className="bg-white/5 border-white/10 pl-9 h-9 text-sm"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label className="text-[11px] text-gray-500 uppercase font-bold">Biographie</Label>
          <div className="relative">
            <AlignLeft className="absolute left-3 top-3 text-gray-500" size={14} />
            <Textarea 
              className="bg-white/5 border-white/10 pl-9 min-h-[80px] text-sm resize-none"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="flex gap-2 pt-2">
        <Button type="button" variant="ghost" onClick={onClose} className="flex-1 h-9 text-xs">Annuler</Button>
        <Button type="submit" className="flex-1 h-9 text-xs bg-primary hover:bg-primary/90 gap-2">
          <Save size={14} /> Enregistrer
        </Button>
      </div>
    </form>
  );
};