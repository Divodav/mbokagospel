import { useState, useEffect } from "react";
import { ArrowLeft, Play, MoreVertical, Clock, Share2, Trash2, Edit2, Lock, Unlock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Playlist } from "@/types/playlist";
import { showSuccess, showError } from "@/utils/toast";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

interface PlaylistViewProps {
    playlist: Playlist;
    onPlaySong: (song: any) => void;
    onPlayCollection: (songs: any[]) => void;
    onBack: () => void;
    currentSongId?: string;
}

export const PlaylistView = ({ playlist: initialPlaylist, onPlaySong, onPlayCollection, onBack, currentSongId }: PlaylistViewProps) => {
    const [playlist, setPlaylist] = useState(initialPlaylist);
    const [songs, setSongs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isRenameOpen, setIsRenameOpen] = useState(false);
    const [newName, setNewName] = useState(playlist.name);
    const [isPublic, setIsPublic] = useState(playlist.is_public);

    const fetchSongs = async () => {
        try {
            const { data, error } = await supabase
                .from('playlist_songs')
                .select(`
          added_at,
          song:songs (*)
        `)
                .eq('playlist_id', playlist.id)
                .order('added_at', { ascending: true });

            if (error) throw error;
            // Extract song objects
            const mappedSongs = data.map((item: any) => ({
                ...item.song,
                added_at: item.added_at
            })).filter(s => s); // filter nulls if any

            setSongs(mappedSongs);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSongs();
    }, [playlist.id]);

    const handleRename = async () => {
        if (!newName.trim()) return;
        try {
            const { error } = await supabase
                .from('playlists')
                .update({ name: newName })
                .eq('id', playlist.id);

            if (error) throw error;
            setPlaylist(prev => ({ ...prev, name: newName }));
            setIsRenameOpen(false);
            showSuccess("Renommé avec succès");
        } catch (error) {
            showError("Erreur lors du renommage");
        }
    };

    const handleTogglePublic = async (checked: boolean) => {
        try {
            const { error } = await supabase
                .from('playlists')
                .update({ is_public: checked })
                .eq('id', playlist.id);

            if (error) throw error;
            setIsPublic(checked);
            setPlaylist(prev => ({ ...prev, is_public: checked }));
            showSuccess(checked ? "Playlist visible par tous via lien" : "Playlist privée");
        } catch (error) {
            showError("Erreur de modification");
            setIsPublic(!checked); // revert
        }
    };

    const handleRemoveSong = async (songId: string) => {
        try {
            const { error } = await supabase
                .from('playlist_songs')
                .delete()
                .eq('playlist_id', playlist.id)
                .eq('song_id', songId);

            if (error) throw error;
            setSongs(prev => prev.filter(s => s.id !== songId));
            showSuccess("Titre retiré de la playlist");
        } catch (error) {
            showError("Erreur lors de la suppression");
        }
    };

    const handleShare = () => {
        const url = `${window.location.origin}/share/playlist/${playlist.id}`;
        navigator.clipboard.writeText(url);
        showSuccess("Lien copié dans le presse-papier");
    };

    return (
        <div className="flex flex-col h-full animate-in fade-in duration-300">
            {/* Header */}
            <div className="flex items-center gap-4 p-4 md:p-8 bg-gradient-to-b from-white/10 to-transparent">
                <Button variant="ghost" size="icon" onClick={onBack} className="rounded-full hover:bg-white/10">
                    <ArrowLeft size={24} />
                </Button>
                <div className="w-40 h-40 bg-white/5 rounded-3xl shadow-2xl overflow-hidden flex items-center justify-center border border-white/10">
                    {songs.length > 0 ? (
                        <img src={songs[0].cover_url} className="w-full h-full object-cover" alt="" />
                    ) : (
                        <Share2 size={40} className="text-gray-500" />
                    )}
                </div>
                <div className="flex flex-col gap-2 flex-1">
                    <p className="text-xs font-bold uppercase tracking-widest text-primary flex items-center gap-2">
                        Playlist {isPublic ? <Unlock size={12} /> : <Lock size={12} />}
                    </p>
                    <h1 className="text-4xl md:text-6xl font-black tracking-tighter" onClick={() => setIsRenameOpen(true)}>
                        {playlist.name}
                        <Edit2 size={16} className="inline ml-4 text-gray-500 cursor-pointer hover:text-white" onClick={() => setIsRenameOpen(true)} />
                    </h1>
                    <div className="flex items-center gap-2 text-sm text-gray-400 font-medium">
                        <span>{songs.length} titres</span>
                        <Switch checked={isPublic} onCheckedChange={handleTogglePublic} />
                        <span className="text-xs">{isPublic ? "Publique" : "Privée"}</span>
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div className="px-4 md:px-8 py-4 flex items-center gap-4">
                <Button
                    onClick={() => onPlayCollection(songs)}
                    className="w-14 h-14 rounded-full bg-primary hover:scale-105 transition-transform flex items-center justify-center shadow-xl shadow-primary/20"
                >
                    <Play fill="white" size={24} className="text-white ml-1" />
                </Button>
                <Button variant="outline" onClick={handleShare} className="rounded-full border-white/10 hover:bg-white/5 gap-2">
                    <Share2 size={16} /> Partager
                </Button>
            </div>

            {/* Songs List */}
            <div className="flex-1 overflow-y-auto px-4 md:px-8 pb-32">
                {songs.map((song, i) => (
                    <div key={song.id} className="group flex items-center p-2 rounded-xl hover:bg-white/5 transition-all">
                        <span className="w-8 text-center text-xs font-bold text-gray-600 group-hover:text-white">{i + 1}</span>
                        <div
                            className="flex-1 flex items-center gap-4 cursor-pointer"
                            onClick={() => onPlaySong(song)}
                        >
                            <img src={song.cover_url} className="w-10 h-10 rounded-lg object-cover bg-white/5" alt="" />
                            <div>
                                <p className={cn("font-bold text-sm", currentSongId === song.id ? "text-primary" : "text-white")}>{song.title}</p>
                                <p className="text-xs text-gray-500">{song.artist_name}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button variant="ghost" size="icon" onClick={() => handleRemoveSong(song.id)} className="h-8 w-8 text-gray-500 hover:text-red-500">
                                <Trash2 size={16} />
                            </Button>
                        </div>
                    </div>
                ))}
                {songs.length === 0 && (
                    <div className="text-center py-20 text-gray-500">
                        Ajoutez des titres à cette playlist pour commencer.
                    </div>
                )}
            </div>

            {/* Rename Dialog */}
            <Dialog open={isRenameOpen} onOpenChange={setIsRenameOpen}>
                <DialogContent className="bg-[#1e1e1e] border-white/10 text-white">
                    <DialogHeader>
                        <DialogTitle>Renommer la playlist</DialogTitle>
                    </DialogHeader>
                    <Input
                        value={newName}
                        onChange={e => setNewName(e.target.value)}
                        className="bg-white/5 border-white/10 text-white"
                    />
                    <DialogFooter>
                        <Button onClick={handleRename} className="bg-primary font-bold">Enregistrer</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};
