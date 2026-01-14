"use client";

import { useState, useEffect } from "react";
import { Heart, Disc, Users, Music, Plus, History, Download, Play, Trash2, WifiOff, Crown, Radio } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";
import { CreatePlaylistDialog } from "./CreatePlaylistDialog";
import { Playlist } from "@/types/playlist";
import { showSuccess, showError } from "@/utils/toast";
import { useOfflineDownloads } from "@/hooks/useOfflineDownloads";
import { usePremium } from "@/hooks/usePremium";
import { GenreRadioList, ArtistRadioList } from "@/components/RadioButton";

interface LibraryViewProps {
  onPlaySong: (song: any) => void;
  likedCount: number;
  onPlayLiked: () => void;
  onOpenPlaylist?: (playlist: Playlist) => void;
  onNavigateToDownloads?: () => void;
  onNavigateToPremium?: () => void;
  onPlayCollection?: (songs: any[]) => void;
}

export const LibraryView = ({
  onPlaySong,
  likedCount,
  onPlayLiked,
  onOpenPlaylist,
  onNavigateToDownloads,
  onNavigateToPremium,
  onPlayCollection
}: LibraryViewProps) => {
  const { user } = useAuth();
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [loading, setLoading] = useState(true);
  const { downloadedSongs, isAvailable } = useOfflineDownloads();
  const { isPremium } = usePremium();

  const fetchPlaylists = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('playlists')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPlaylists(data || []);
    } catch (error) {
      console.error("Error fetching playlists:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlaylists();
  }, [user]);

  const handleDeletePlaylist = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!confirm("Voulez-vous vraiment supprimer cette playlist ?")) return;

    try {
      const { error } = await supabase.from('playlists').delete().eq('id', id);
      if (error) throw error;
      setPlaylists(prev => prev.filter(p => p.id !== id));
      showSuccess("Playlist supprimée");
    } catch (error) {
      showError("Erreur lors de la suppression");
    }
  };

  // Configuration dynamique de la section téléchargements
  const getDownloadsInfo = () => {
    if (!isAvailable) {
      return {
        count: 'Mobile uniquement',
        icon: <WifiOff size={20} className="text-gray-500" />,
        color: 'bg-white/5 opacity-50'
      };
    }
    if (!isPremium) {
      return {
        count: 'Premium requis',
        icon: <Crown size={20} className="text-yellow-500" />,
        color: 'bg-gradient-to-br from-yellow-900/20 to-yellow-600/10'
      };
    }
    return {
      count: `${downloadedSongs.length} titres`,
      icon: <Download size={20} className="text-green-400" />,
      color: downloadedSongs.length > 0 ? 'bg-gradient-to-br from-green-900/30 to-green-600/10' : 'bg-white/5'
    };
  };

  const downloadsInfo = getDownloadsInfo();

  const sections = [
    { id: 'liked', title: 'Titres aimés', icon: <Heart size={20} className="text-primary fill-primary" />, color: 'bg-gradient-to-br from-indigo-600 to-primary', count: `${likedCount} titres`, action: onPlayLiked },
    { id: 'recent', title: 'Écoutés récemment', icon: <History size={20} className="text-blue-400" />, color: 'bg-white/5', count: 'Historique local', action: () => { } },
    {
      id: 'downloads',
      title: 'Téléchargements',
      icon: downloadsInfo.icon,
      color: downloadsInfo.color,
      count: downloadsInfo.count,
      action: () => {
        if (!isAvailable) {
          showError('Disponible uniquement sur mobile');
        } else if (!isPremium) {
          onNavigateToPremium?.();
        } else {
          onNavigateToDownloads?.();
        }
      }
    },
  ];

  return (
    <div className="py-6 space-y-10 animate-in fade-in duration-500 pb-20">
      <div className="flex items-center justify-between border-b border-white/[0.05] pb-6">
        <div>
          <h2 className="text-3xl font-black tracking-tighter">Ma Bibliothèque</h2>
          <p className="text-gray-500 text-sm font-medium">Retrouvez vos favoris et vos sélections.</p>
        </div>
        <CreatePlaylistDialog onPlaylistCreated={fetchPlaylists} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {sections.map((section) => (
          <motion.div
            key={section.id}
            onClick={section.action}
            whileHover={{ scale: 1.02, y: -2 }}
            className={cn(
              "group relative p-6 rounded-[2rem] cursor-pointer overflow-hidden border border-white/[0.05] transition-all",
              section.color
            )}
          >
            <div className="relative z-10 flex flex-col h-full justify-between gap-8">
              <div className="p-3 bg-black/20 rounded-2xl w-fit backdrop-blur-md">
                {section.icon}
              </div>
              <div>
                <h4 className="font-black text-lg mb-1">{section.title}</h4>
                <p className="text-xs font-bold opacity-60 uppercase tracking-widest">{section.count}</p>
              </div>
            </div>
            <div className="absolute right-6 bottom-6 w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-2xl opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all">
              <Play size={20} fill="black" className="text-black ml-1" />
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div className="space-y-6">
          <h3 className="text-xl font-black flex items-center gap-3">
            <Disc className="text-primary" size={20} /> Vos Playlists
          </h3>
          <div className="space-y-2">
            {loading ? (
              <div className="text-gray-500 text-xs">Chargement...</div>
            ) : playlists.length > 0 ? playlists.map((playlist) => (
              <div
                key={playlist.id}
                className="glass-card-pro p-3 flex items-center gap-4 group cursor-pointer hover:bg-white/5 transition-colors"
                onClick={() => onOpenPlaylist?.(playlist)}
              >
                <div className="w-14 h-14 bg-white/5 rounded-xl flex items-center justify-center shrink-0 border border-white/5 overflow-hidden">
                  <Music className="text-gray-700" size={24} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm truncate">{playlist.name}</p>
                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-tighter">
                    {playlist.is_public ? "Public" : "Privé"}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="bg-transparent hover:bg-red-500/10 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                  onClick={(e) => handleDeletePlaylist(e, playlist.id)}
                >
                  <Trash2 size={16} />
                </Button>
              </div>
            )) : (
              <div className="text-gray-500 text-sm text-center py-4">Aucune playlist créée.</div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <h3 className="text-xl font-black flex items-center gap-3">
            <Radio className="text-primary" size={20} /> Radios Automatiques
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h4 className="text-sm font-bold text-gray-500 uppercase tracking-widest pl-1">Genres</h4>
              <GenreRadioList onRadioStart={onPlayCollection || (() => { })} />
            </div>
            <div className="space-y-3">
              <h4 className="text-sm font-bold text-gray-500 uppercase tracking-widest pl-1">Artistes</h4>
              <ArtistRadioList onRadioStart={onPlayCollection || (() => { })} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};