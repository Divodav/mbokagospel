import { useState, useEffect } from "react";
import { ArrowLeft, Play, Share2, Clock, Disc } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { showSuccess, showError } from "@/utils/toast";
import { cn } from "@/lib/utils";

interface AlbumViewProps {
    album: any;
    onPlaySong: (song: any) => void;
    onPlayCollection: (songs: any[]) => void;
    onBack: () => void;
    currentSongId?: string;
}

export const AlbumView = ({ album, onPlaySong, onPlayCollection, onBack, currentSongId }: AlbumViewProps) => {
    const [songs, setSongs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAlbumSongs = async () => {
            try {
                const { data, error } = await supabase
                    .from('songs')
                    .select('*')
                    .eq('album_id', album.id)
                    .eq('status', 'approved')
                    .order('created_at', { ascending: true });

                if (error) throw error;
                setSongs(data || []);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        if (album?.id) {
            fetchAlbumSongs();
        }
    }, [album?.id]);

    const handleShare = () => {
        const url = `${window.location.origin}/share/album/${album.id}`;
        navigator.clipboard.writeText(url);
        showSuccess("Lien de l'album copié !");
    };

    const albumTitle = album.title || album.name;

    return (
        <div className="flex flex-col h-full animate-in fade-in duration-300">
            {/* Header */}
            <div className="flex flex-col md:flex-row items-end gap-6 p-6 md:p-8 bg-gradient-to-b from-white/10 to-transparent">
                <div className="flex items-center gap-4 w-full md:w-auto self-start md:self-auto mb-4 md:mb-0">
                    <Button variant="ghost" size="icon" onClick={onBack} className="rounded-full hover:bg-white/10 shrink-0">
                        <ArrowLeft size={24} />
                    </Button>
                </div>

                <div className="w-48 h-48 bg-white/5 rounded-3xl shadow-2xl overflow-hidden flex items-center justify-center border border-white/10 shrink-0 mx-auto md:mx-0">
                    {album.cover_url || album.cover ? (
                        <img src={album.cover_url || album.cover} className="w-full h-full object-cover" alt={albumTitle} />
                    ) : (
                        <Disc size={60} className="text-gray-500" />
                    )}
                </div>

                <div className="flex flex-col gap-2 flex-1 text-center md:text-left">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">ALBUM</p>
                    <h1 className="text-4xl md:text-6xl font-black tracking-tighter line-clamp-2">
                        {albumTitle}
                    </h1>
                    <div className="flex items-center justify-center md:justify-start gap-2 text-sm text-gray-400 font-bold">
                        <span className="text-white">{album.artist_name || 'Artiste'}</span>
                        <span>•</span>
                        <span>{songs.length} titres</span>
                        {(album.release_year || album.year) && (
                            <>
                                <span>•</span>
                                <span>{album.release_year || album.year}</span>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div className="px-6 md:px-8 py-4 flex items-center gap-4 border-b border-white/5">
                <Button
                    onClick={() => onPlayCollection(songs)}
                    disabled={songs.length === 0}
                    className="w-14 h-14 rounded-full bg-primary hover:scale-105 transition-transform flex items-center justify-center shadow-xl shadow-primary/20"
                >
                    <Play fill="white" size={24} className="text-white ml-1" />
                </Button>
                <Button
                    variant="outline"
                    onClick={handleShare}
                    className="rounded-full border-white/10 hover:bg-white/5 gap-2 px-6 h-12 font-bold"
                >
                    <Share2 size={18} /> Partager
                </Button>
            </div>

            {/* Songs List */}
            <div className="flex-1 overflow-y-auto px-4 md:px-8 pb-32">
                {loading ? (
                    <div className="py-20 text-center text-gray-500">Chargement des titres...</div>
                ) : songs.length > 0 ? (
                    <div className="py-4 space-y-1">
                        {songs.map((song, i) => (
                            <div
                                key={song.id}
                                className="group flex items-center p-3 rounded-xl hover:bg-white/5 transition-all cursor-pointer"
                                onClick={() => onPlaySong(song)}
                            >
                                <span className="w-8 text-center text-xs font-bold text-gray-600 group-hover:text-primary">{i + 1}</span>
                                <div className="flex-1 min-w-0 mx-4">
                                    <p className={cn("font-bold text-sm truncate", currentSongId === song.id ? "text-primary" : "text-white")}>
                                        {song.title}
                                    </p>
                                    <p className="text-xs text-gray-500 font-medium">{song.artist_name}</p>
                                </div>
                                <div className="flex items-center gap-4">
                                    <span className="text-xs text-gray-500 font-bold hidden md:block">
                                        {song.duration ? Math.floor(song.duration / 60) + ":" + (song.duration % 60).toString().padStart(2, '0') : "--:--"}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 text-gray-500 font-medium italic">
                        Aucun titre dans cet album pour le moment.
                    </div>
                )}
            </div>
        </div>
    );
};
