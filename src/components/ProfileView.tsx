"use client";

import { useState } from "react";
import { User, Music, MapPin, Plus, Settings, Disc, ListMusic } from "lucide-react";
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
import { motion } from "framer-motion";

interface ProfileViewProps {
  publishedSongs: any[];
  albums: any[];
  onPublish: (song: any) => void;
  onAddAlbum: (album: any) => void;
}

export const ProfileView = ({ publishedSongs, albums, onPublish, onAddAlbum }: ProfileViewProps) => {
  const [profile, setProfile] = useState({
    name: "Davin Kangombe",
    location: "Kinshasa, RDC",
    bio: "Chanteur et compositeur Gospel passionné par la louange."
  });

  return (
    <div className="py-4 space-y-6 animate-in fade-in duration-500">
      {/* Mini Profile Header */}
      <div className="glass-card-pro p-4 flex flex-col md:flex-row items-center gap-6">
        <div className="w-20 h-20 rounded-full border-2 border-primary/30 overflow-hidden shrink-0 shadow-lg">
          <img 
            src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200" 
            alt="" 
            className="w-full h-full object-cover"
          />
        </div>
        
        <div className="flex-1 text-center md:text-left">
          <h2 className="text-xl font-black mb-1">{profile.name}</h2>
          <div className="flex flex-wrap justify-center md:justify-start gap-3 text-[11px] text-gray-500 font-bold mb-2">
            <span className="flex items-center gap-1"><MapPin size={12} className="text-primary" /> {profile.location}</span>
            <span className="flex items-center gap-1"><Music size={12} className="text-primary" /> {publishedSongs.length} Titres</span>
            <span className="flex items-center gap-1"><Disc size={12} className="text-primary" /> {albums.length} Albums</span>
          </div>
          <p className="text-xs text-gray-400 italic line-clamp-2 max-w-xl">{profile.bio}</p>
        </div>

        <div className="flex gap-2 shrink-0">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 text-[11px] rounded-full gap-2 border-white/10 hover:bg-white/5">
                <Settings size={14} /> Modifier Profil
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-[#0C0607] border-white/10 text-white max-w-sm">
              <DialogHeader><DialogTitle className="text-lg font-bold">Gérer mon Profil Artiste</DialogTitle></DialogHeader>
              <EditProfileForm profile={profile} onUpdate={setProfile} onClose={() => {}} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Artist Dashboard Tabs */}
      <Tabs defaultValue="songs" className="w-full">
        <TabsList className="bg-white/5 border border-white/10 p-1 h-9 rounded-full mb-6">
          <TabsTrigger value="songs" className="rounded-full text-[11px] font-bold h-7 data-[state=active]:bg-primary">Mes Titres</TabsTrigger>
          <TabsTrigger value="albums" className="rounded-full text-[11px] font-bold h-7 data-[state=active]:bg-primary">Mes Albums</TabsTrigger>
          <TabsTrigger value="stats" className="rounded-full text-[11px] font-bold h-7 data-[state=active]:bg-primary">Statistiques</TabsTrigger>
        </TabsList>

        <TabsContent value="songs" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold flex items-center gap-2"><ListMusic size={16} className="text-primary" /> Mes derniers titres</h3>
            <Dialog>
              <DialogTrigger asChild>
                <Button size="sm" className="h-8 rounded-full text-[11px] bg-primary gap-1.5"><Plus size={14} /> Publier un titre</Button>
              </DialogTrigger>
              <DialogContent className="bg-[#0C0607] border-white/10 text-white max-w-md">
                <DialogHeader><DialogTitle className="text-lg font-bold">Nouveau Titre</DialogTitle></DialogHeader>
                <PublishSongForm onPublish={onPublish} onClose={() => {}} />
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
            {publishedSongs.map((song) => (
              <motion.div key={song.id} whileHover={{ y: -4 }} className="glass-card-pro p-2 group cursor-pointer">
                <img src={song.cover} className="aspect-square object-cover rounded-lg mb-2" alt="" />
                <p className="text-[11px] font-bold truncate">{song.title}</p>
                <p className="text-[9px] text-gray-500 font-bold uppercase">{song.duration}</p>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="albums" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold flex items-center gap-2"><Disc size={16} className="text-primary" /> Ma Discographie</h3>
            <Dialog>
              <DialogTrigger asChild>
                <Button size="sm" variant="outline" className="h-8 rounded-full text-[11px] border-primary text-primary hover:bg-primary/5 gap-1.5"><Plus size={14} /> Créer un Album</Button>
              </DialogTrigger>
              <DialogContent className="bg-[#0C0607] border-white/10 text-white max-w-sm">
                <DialogHeader><DialogTitle className="text-lg font-bold">Nouvel Album</DialogTitle></DialogHeader>
                <CreateAlbumForm onCreated={onAddAlbum} onClose={() => {}} />
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-2">
            {albums.length > 0 ? albums.map((album) => (
              <div key={album.id} className="glass-card-pro p-2 flex items-center gap-4 hover:bg-white/5">
                <img src={album.cover} className="w-12 h-12 rounded-lg object-cover" alt="" />
                <div className="flex-1">
                  <p className="text-[13px] font-bold">{album.name}</p>
                  <p className="text-[10px] text-gray-500">{album.year} • {album.songCount} titres</p>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400"><Settings size={14} /></Button>
              </div>
            )) : (
              <div className="py-12 text-center text-gray-500 text-xs italic">Aucun album créé pour le moment.</div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="stats">
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Auditeurs", val: "12.4k" },
              { label: "Streams", val: "458k" },
              { label: "Abonnés", val: "3.2k" }
            ].map((s, i) => (
              <div key={i} className="glass-card-pro p-4 text-center">
                <p className="text-[10px] text-gray-500 font-bold uppercase mb-1">{s.label}</p>
                <p className="text-xl font-black text-primary">{s.val}</p>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};