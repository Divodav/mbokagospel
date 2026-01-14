import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Play, Pause, ListMusic, Share2, ArrowLeft, Music, Lock, ExternalLink, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { showSuccess, showError } from "@/utils/toast";
import { cn } from "@/lib/utils";

interface Playlist {
    id: string;
    name: string;
    is_public: boolean;
    user_id: string;
    created_at: string;
}

interface Song {
    id: string;
    title: string;
    artist_name: string;
    cover_url: string;
    audio_url: string;
    duration?: number;
}

const SharePlaylist = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [playlist, setPlaylist] = useState<Playlist | null>(null);
    const [songs, setSongs] = useState<Song[]>([]);
    const [loading, setLoading] = useState(true);
    const [isPrivate, setIsPrivate] = useState(false);
    const [currentSong, setCurrentSong] = useState<Song | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [ownerName, setOwnerName] = useState<string>("");
    const audioRef = useRef<HTMLAudioElement>(null);

    useEffect(() => {
        const fetchPlaylist = async () => {
            if (!id) return;

            try {
                const { data: playlistData, error: playlistError } = await supabase
                    .from('playlists')
                    .select('*')
                    .eq('id', id)
                    .single();

                if (playlistError || !playlistData) {
                    showError("Playlist introuvable");
                    return;
                }

                // Check if playlist is public
                if (!playlistData.is_public) {
                    setIsPrivate(true);
                    setLoading(false);
                    return;
                }

                setPlaylist(playlistData);

                // Fetch owner profile
                const { data: profileData } = await supabase
                    .from('profiles')
                    .select('display_name, email')
                    .eq('id', playlistData.user_id)
                    .single();

                if (profileData) {
                    setOwnerName(profileData.display_name || profileData.email?.split('@')[0] || 'Utilisateur');
                }

                // Fetch playlist songs
                const { data: playlistSongs, error: songsError } = await supabase
                    .from('playlist_songs')
                    .select(`
            added_at,
            song:songs (*)
          `)
                    .eq('playlist_id', id)
                    .order('added_at', { ascending: true });

                if (!songsError && playlistSongs) {
                    const mappedSongs = playlistSongs
                        .map((item: any) => item.song)
                        .filter((s: any) => s && s.status === 'approved');
                    setSongs(mappedSongs);
                }

                // Update document metadata for SEO
                document.title = `${playlistData.name} | MbokaGospel`;

                // Update meta tags
                updateMetaTag('og:title', `${playlistData.name} - Playlist`);
                updateMetaTag('og:description', `Découvrez la playlist "${playlistData.name}" sur MbokaGospel`);
                updateMetaTag('og:url', window.location.href);
                updateMetaTag('og:type', 'music.playlist');

            } catch (error) {
                console.error(error);
                showError("Erreur lors du chargement");
            } finally {
                setLoading(false);
            }
        };

        fetchPlaylist();
    }, [id]);

    const updateMetaTag = (property: string, content: string) => {
        let meta = document.querySelector(`meta[property="${property}"]`);
        if (!meta) {
            meta = document.createElement('meta');
            meta.setAttribute('property', property);
            document.head.appendChild(meta);
        }
        meta.setAttribute('content', content);
    };

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        audio.addEventListener('ended', () => {
            const currentIdx = songs.findIndex(s => s.id === currentSong?.id);
            if (currentIdx < songs.length - 1) {
                setCurrentSong(songs[currentIdx + 1]);
            } else {
                setIsPlaying(false);
            }
        });

        return () => {
            audio.removeEventListener('ended', () => { });
        };
    }, [currentSong, songs]);

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio || !currentSong) return;

        audio.src = currentSong.audio_url;
        if (isPlaying) {
            audio.play();
        }
    }, [currentSong]);

    const playSong = (song: Song) => {
        if (currentSong?.id === song.id) {
            togglePlay();
        } else {
            setCurrentSong(song);
            setIsPlaying(true);
        }
    };

    const togglePlay = () => {
        const audio = audioRef.current;
        if (!audio) return;

        if (isPlaying) {
            audio.pause();
        } else {
            audio.play();
        }
        setIsPlaying(!isPlaying);
    };

    const playAll = () => {
        if (songs.length > 0) {
            setCurrentSong(songs[0]);
            setIsPlaying(true);
        }
    };

    const handleShare = () => {
        const url = window.location.href;
        navigator.clipboard.writeText(url);
        showSuccess("Lien copié dans le presse-papier !");
    };

    const openInApp = () => {
        navigate(`/?playlist=${id}`);
    };

    const formatDuration = (seconds?: number) => {
        if (!seconds) return "--:--";
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#080405] text-white flex items-center justify-center">
                <div className="animate-pulse flex flex-col items-center gap-4">
                    <div className="w-48 h-48 bg-white/10 rounded-3xl" />
                    <div className="w-48 h-6 bg-white/10 rounded" />
                    <div className="w-32 h-4 bg-white/10 rounded" />
                </div>
            </div>
        );
    }

    if (isPrivate) {
        return (
            <div className="min-h-screen bg-[#080405] text-white flex flex-col items-center justify-center p-8">
                <Lock size={64} className="text-gray-600 mb-4" />
                <h1 className="text-2xl font-bold mb-2">Playlist privée</h1>
                <p className="text-gray-500 mb-8 text-center">Cette playlist est privée et ne peut pas être partagée.</p>
                <Button onClick={() => navigate('/')} className="bg-primary rounded-full px-8">
                    Retour à l'accueil
                </Button>
            </div>
        );
    }

    if (!playlist) {
        return (
            <div className="min-h-screen bg-[#080405] text-white flex flex-col items-center justify-center p-8">
                <ListMusic size={64} className="text-gray-600 mb-4" />
                <h1 className="text-2xl font-bold mb-2">Playlist introuvable</h1>
                <p className="text-gray-500 mb-8">Cette playlist n'existe pas ou n'est plus disponible.</p>
                <Button onClick={() => navigate('/')} className="bg-primary rounded-full px-8">
                    Retour à l'accueil
                </Button>
            </div>
        );
    }

    const coverImage = songs.length > 0 ? songs[0].cover_url : null;

    return (
        <div className="min-h-screen bg-[#080405] text-white">
            {/* Hidden audio element */}
            <audio ref={audioRef} preload="metadata" />

            {/* Background gradient */}
            <div
                className="fixed inset-0 opacity-30 pointer-events-none"
                style={{
                    background: `radial-gradient(ellipse at center, rgba(214, 78, 139, 0.3) 0%, transparent 70%)`
                }}
            />

            <div className="relative z-10 max-w-3xl mx-auto px-4 py-8 md:py-16">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => navigate('/')}
                        className="rounded-full hover:bg-white/10"
                    >
                        <ArrowLeft size={24} />
                    </Button>
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-primary rounded-xl flex items-center justify-center">
                            <Music size={16} className="text-white" />
                        </div>
                        <span className="font-black text-lg">Mboka<span className="text-primary">Gospel</span></span>
                    </div>
                </div>

                {/* Playlist Card */}
                <div className="bg-white/5 backdrop-blur-xl rounded-[2rem] border border-white/10 p-6 md:p-10 shadow-2xl">
                    {/* Playlist Header */}
                    <div className="flex flex-col md:flex-row items-center gap-6 mb-8">
                        <div className="w-48 h-48 rounded-2xl overflow-hidden shadow-2xl shrink-0">
                            {coverImage ? (
                                <img
                                    src={coverImage}
                                    alt={playlist.name}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full bg-gradient-to-br from-indigo-600 to-primary flex items-center justify-center">
                                    <ListMusic size={60} className="text-white" />
                                </div>
                            )}
                        </div>

                        <div className="text-center md:text-left flex-1">
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary mb-2">PLAYLIST</p>
                            <h1 className="text-3xl md:text-4xl font-black tracking-tight mb-2">{playlist.name}</h1>
                            <div className="flex items-center justify-center md:justify-start gap-2 text-gray-400 mb-4">
                                <User size={14} />
                                <span className="font-medium">{ownerName}</span>
                                <span>•</span>
                                <span>{songs.length} titres</span>
                            </div>

                            {/* Actions */}
                            <div className="flex flex-col sm:flex-row items-center gap-3">
                                <Button
                                    onClick={playAll}
                                    disabled={songs.length === 0}
                                    className="w-full sm:w-auto rounded-full bg-primary hover:bg-primary/90 gap-2 px-6 h-12 font-bold"
                                >
                                    <Play size={18} fill="white" />
                                    Tout lire
                                </Button>
                                <Button
                                    onClick={handleShare}
                                    variant="outline"
                                    className="w-full sm:w-auto rounded-full border-white/20 hover:bg-white/10 gap-2 px-6 h-12 font-bold"
                                >
                                    <Share2 size={18} />
                                    Partager
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Songs List */}
                    <div className="border-t border-white/10 pt-6">
                        <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-4">Titres</h3>
                        {songs.length > 0 ? (
                            <div className="space-y-1">
                                {songs.map((song, i) => (
                                    <div
                                        key={song.id}
                                        onClick={() => playSong(song)}
                                        className={cn(
                                            "group flex items-center p-3 rounded-xl hover:bg-white/5 transition-all cursor-pointer",
                                            currentSong?.id === song.id && "bg-white/5"
                                        )}
                                    >
                                        <span className="w-8 text-center text-xs font-bold text-gray-600 group-hover:text-primary">
                                            {currentSong?.id === song.id && isPlaying ? (
                                                <Pause size={14} className="text-primary mx-auto" />
                                            ) : (
                                                i + 1
                                            )}
                                        </span>
                                        <img
                                            src={song.cover_url}
                                            alt={song.title}
                                            className="w-10 h-10 rounded-lg object-cover bg-white/5 mx-4"
                                        />
                                        <div className="flex-1 min-w-0">
                                            <p className={cn(
                                                "font-bold text-sm truncate",
                                                currentSong?.id === song.id ? "text-primary" : "text-white"
                                            )}>
                                                {song.title}
                                            </p>
                                            <p className="text-xs text-gray-500 font-medium">{song.artist_name}</p>
                                        </div>
                                        <span className="text-xs text-gray-500 font-bold">
                                            {formatDuration(song.duration)}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12 text-gray-500 italic">
                                Cette playlist est vide pour le moment.
                            </div>
                        )}
                    </div>

                    {/* Open in App */}
                    <div className="mt-8 pt-6 border-t border-white/10">
                        <Button
                            onClick={openInApp}
                            variant="outline"
                            className="w-full rounded-full border-white/20 hover:bg-white/10 gap-2 h-12 font-bold"
                        >
                            <ExternalLink size={18} />
                            Ouvrir dans l'application
                        </Button>
                    </div>
                </div>

                {/* Footer */}
                <div className="text-center mt-8 text-gray-500 text-sm">
                    <p>Partagé via <span className="text-primary font-bold">MbokaGospel</span></p>
                    <p className="text-xs mt-1">La plateforme de musique gospel africaine</p>
                </div>
            </div>
        </div>
    );
};

export default SharePlaylist;
