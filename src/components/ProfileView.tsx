"use client";

import { useState, useEffect, useCallback } from "react";
import { Music, MapPin, Plus, Settings, Disc, ListMusic, User as UserIcon, Loader2, LogOut, Edit2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { PublishSongForm } from "./PublishSongForm";
import { CreateAlbumForm } from "./CreateAlbumForm";
import { EditProfileForm } from "./EditProfileForm";
import { EditSongForm } from "./EditSongForm";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";
import { showSuccess } from "@/utils/toast";

interface ProfileViewProps {
  publishedSongs: any[];
  albums: any[];
  onPublish: () => void;
  onAddAlbum: () => void;
}

export const ProfileView = ({ publishedSongs, albums, onPublish, onAddAlbum }: ProfileViewProps) => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProfileDialogOpen, setIsProfileDialogOpen] = useState(false);
  const [editingSong, setEditingSong] = useState<any>(null);

  const fetchProfile = useCallback(async () => {
    if (!user) return;
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error("[ProfileView] Error fetching profile:", error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    showSuccess("Déconnexion réussie");
  };

  if (isLoading) {
    return (
      <div className="h-[60vh] flex items-center justify-center">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  return (
    <div className="py-4 space-y-6 animate-in fade-in duration-500">
      {/* Profile Header */}
      <div className="glass-card-pro p-6 flex flex-col md:flex-row items-center gap-6">
        <div className="w-24 h-24 rounded-full border-2 border-primary/30 overflow-hidden shrink-0 shadow-lg bg-white/5">
          {profile?.avatar_url ? (
            <img 
              src={profile.avatar_url} 
              alt={profile.name} 
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <UserIcon size={40} className="text-gray-600" />
            </div>
          )}
        </div>
        
        <div className="flex-1 text-center md:text-left">
          <h2 className="text-2xl font-black mb-1">{profile?.name || "Artiste Gospel"}</h2>
          <div className="flex flex-wrap justify-center md:justify-start gap-4 text-[12px] text-gray-500 font-bold mb-3">
            <span className="flex items-center gap-1.5"><MapPin size={14} className="text-primary" /> {profile?.location || "Localisation non définie"}</span>
            <span className="flex items-center gap-1.5"><Music size={14} className="text-primary" /> {publishedSongs.length} Titres</span>
            <span className="flex items-center gap-1.5"><Disc size={14} className="text-primary" /> {albums.length} Albums</span>
          </div>
          <p className="text-sm text-gray-400 italic max-w-2xl leading-relaxed">
            {profile?.bio || "Aucune biographie rédigée pour le moment."}
          </p>
        </div>

        <div className="flex flex-col gap-2 shrink-0">
          <Dialog open={isProfileDialogOpen} onOpenChange={setIsProfileDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="h-9 text-[11px] rounded-full gap-2 border-white/10 hover:bg-white/5">
                <Settings size={16} /> Modifier Profil
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-[#0C0607] border-white/10 text-white max-w-sm">
              <DialogHeader><DialogTitle className="text-lg font-bold">Mon Profil Artiste</DialogTitle></DialogHeader>
              <EditProfileForm 
                profile={profile} 
                onUpdate={() => {
                  fetchProfile();
                  setIsProfileDialogOpen(false);
                }} 
                onClose={() => setIsProfileDialogOpen(false)} 
              />
            </DialogContent>
          </Dialog>

          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleLogout}
            className="h-9 text-[11px] rounded-full gap-2 text-gray-500 hover:text-red-400 hover:bg-red-400/10 transition-colors"
          >
            <LogOut size={16} /> Déconnexion
          </Button>
        </div>
      </div>

      {/* Artist Dashboard Tabs */}
      <Tabs defaultValue="songs" className="w-full">
        <TabsList className="bg-white/5 border border-white/10 p-1 h-10 rounded-full mb-8">
          <TabsTrigger value="songs" className="rounded-full text-[12px] font-bold h-8 px-6 data-[state=active]:bg-primary">Mes Titres</TabsTrigger>
          <TabsTrigger value="albums" className="rounded-full text-[12px] font-bold h-8 px-6 data-[state=active]:bg-primary">Mes Albums</TabsTrigger>
          <TabsTrigger value="stats" className="rounded-full text-[12px] font-bold h-8 px-6 data-[state=active]:bg-primary">Statistiques</TabsTrigger>
        </TabsList>

        <TabsContent value="songs" className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold flex items-center gap-2"><ListMusic size={20} className="text-primary" /> Mes derniers titres</h3>
            <Dialog>
              <DialogTrigger asChild>
                <Button size="sm" className="h-9 rounded-full text-[11px] bg-primary gap-1.5 px-5"><Plus size={16} /> Publier un titre</Button>
              </DialogTrigger>
              <DialogContent className="bg-[#0C0607] border-white/10 text-white max-w-md">
                <DialogHeader><DialogTitle className="text-lg font-bold">Nouveau Titre</DialogTitle></DialogHeader>
                <PublishSongForm onPublish={onPublish} onClose={() => {}} />
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
            {publishedSongs.map((song) => (
              <motion.div key={song.id} whileHover={{ y: -4 }} className="glass-card-pro p-3 group relative">
                <img src={song.cover_url} className="aspect-square object-cover rounded-xl mb-3" alt="" />
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Dialog open={editingSong?.id === song.id} onOpenChange={(open) => !open && setEditingSong(null)}>
                    <DialogTrigger asChild>
                      <Button size="icon" className="h-7 w-7 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-white hover:bg-primary" onClick={() => setEditingSong(song)}>
                        <Edit2 size={12} />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-[#0C0607] border-white/10 text-white max-w-sm">
                      <DialogHeader><DialogTitle className="text-lg font-bold">Modifier le titre</DialogTitle></DialogHeader>
                      <EditSongForm song={song} onUpdate={onPublish} onClose={() => setEditingSong(null)} />
                    </DialogContent>
                  </Dialog>
                </div>
                <p className="text-[12px] font-bold truncate">{song.title}</p>
                <p className="text-[10px] text-gray-500 font-bold uppercase">{song.duration}</p>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="albums" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold flex items-center gap-2"><Disc size={20} className="text-primary" /> Ma Discographie</h3>
            <Dialog>
              <DialogTrigger asChild>
                <Button size="sm" variant="outline" className="h-9 rounded-full text-[11px] border-primary text-primary hover:bg-primary/5 gap-1.5 px-5"><Plus size={16} /> Créer un Album</Button>
              </DialogTrigger>
              <DialogContent className="bg-[#0C0607] border-white/10 text-white max-w-sm">
                <DialogHeader><DialogTitle className="text-lg font-bold">Nouvel Album</DialogTitle></DialogHeader>
                <CreateAlbumForm onCreated={onAddAlbum} onClose={() => {}} />
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-3">
            {albums.length > 0 ? albums.map((album) => (
              <div key={album.id} className="glass-card-pro p-3 flex items-center gap-5 hover:bg-white/5">
                <img src={album.cover_url || album.cover} className="w-14 h-14 rounded-xl object-cover" alt="" />
                <div className="flex-1">
                  <p className="text-[14px] font-bold">{album.name}</p>
                  <p className="text-[11px] text-gray-500 font-medium">{album.year} • {album.songCount || 0} titres</p>
                </div>
                <Button variant="ghost" size="icon" className="h-9 w-9 text-gray-400"><Settings size={16} /></Button>
              </div>
            )) : (
              <div className="py-16 text-center text-gray-500 text-sm italic border border-dashed border-white/5 rounded-2xl">
                Aucun album créé pour le moment.
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="stats">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { label: "Auditeurs", val: "12.4k" },
              { label: "Streams", val: "458k" },
              { label: "Abonnés", val: "3.2k" }
            ].map((s, i) => (
              <div key={i} className="glass-card-pro p-6 text-center">
                <p className="text-[11px] text-gray-500 font-bold uppercase mb-2 tracking-widest">{s.label}</p>
                <p className="text-3xl font-black text-primary">{s.val}</p>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};