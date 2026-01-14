import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Play, Pause, Music, Share2, ArrowLeft, User, Disc, Clock, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { showSuccess, showError } from "@/utils/toast";
import { SongComments } from "@/components/SongComments";

interface Song {
    id: string;
    title: string;
    artist_name: string;
    cover_url: string;
    audio_url: string;
    duration?: number;
    album_id?: string;
}

const ShareSong = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [song, setSong] = useState<Song | null>(null);
    const [loading, setLoading] = useState(true);
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const audioRef = useRef<HTMLAudioElement>(null);

    useEffect(() => {
        const fetchSong = async () => {
            if (!id) return;

            try {
                const { data, error } = await supabase
                    .from('songs')
                    .select('*')
                    .eq('id', id)
                    .eq('status', 'approved')
                    .single();

                if (error || !data) {
                    showError("Titre introuvable ou non publié");
                    return;
                }

                setSong(data);

                // Update document metadata for SEO
                document.title = `${data.title} - ${data.artist_name} | MbokaGospel`;

                // Update meta tags
                const metaDesc = document.querySelector('meta[name="description"]');
                if (metaDesc) {
                    metaDesc.setAttribute('content', `Écoutez "${data.title}" par ${data.artist_name} sur MbokaGospel`);
                }

                // Update Open Graph tags
                updateMetaTag('og:title', `${data.title} - ${data.artist_name}`);
                updateMetaTag('og:description', `Écoutez "${data.title}" par ${data.artist_name} sur MbokaGospel`);
                updateMetaTag('og:image', data.cover_url);
                updateMetaTag('og:url', window.location.href);
                updateMetaTag('og:type', 'music.song');

            } catch (error) {
                console.error(error);
                showError("Erreur lors du chargement");
            } finally {
                setLoading(false);
            }
        };

        fetchSong();
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

        const updateProgress = () => {
            if (audio.duration) {
                setProgress((audio.currentTime / audio.duration) * 100);
            }
        };

        audio.addEventListener('timeupdate', updateProgress);
        audio.addEventListener('ended', () => setIsPlaying(false));

        return () => {
            audio.removeEventListener('timeupdate', updateProgress);
            audio.removeEventListener('ended', () => setIsPlaying(false));
        };
    }, [song]);

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

    const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
        const audio = audioRef.current;
        if (!audio) return;

        const rect = e.currentTarget.getBoundingClientRect();
        const percent = (e.clientX - rect.left) / rect.width;
        audio.currentTime = percent * audio.duration;
    };

    const handleShare = () => {
        const url = window.location.href;
        navigator.clipboard.writeText(url);
        showSuccess("Lien copié dans le presse-papier !");
    };

    const openInApp = () => {
        navigate(`/?song=${id}`);
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
                    <div className="w-64 h-64 bg-white/10 rounded-3xl" />
                    <div className="w-48 h-6 bg-white/10 rounded" />
                    <div className="w-32 h-4 bg-white/10 rounded" />
                </div>
            </div>
        );
    }

    if (!song) {
        return (
            <div className="min-h-screen bg-[#080405] text-white flex flex-col items-center justify-center p-8">
                <Music size={64} className="text-gray-600 mb-4" />
                <h1 className="text-2xl font-bold mb-2">Titre introuvable</h1>
                <p className="text-gray-500 mb-8">Ce titre n'existe pas ou n'est plus disponible.</p>
                <Button onClick={() => navigate('/')} className="bg-primary rounded-full px-8">
                    Retour à l'accueil
                </Button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#080405] text-white">
            {/* Hidden audio element */}
            <audio ref={audioRef} src={song.audio_url} preload="metadata" />

            {/* Background gradient */}
            <div
                className="fixed inset-0 opacity-30 pointer-events-none"
                style={{
                    background: `radial-gradient(ellipse at center, rgba(214, 78, 139, 0.3) 0%, transparent 70%)`
                }}
            />

            <div className="relative z-10 max-w-2xl mx-auto px-4 py-8 md:py-16">
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

                {/* Song Card */}
                <div className="bg-white/5 backdrop-blur-xl rounded-[2rem] border border-white/10 p-6 md:p-10 shadow-2xl">
                    {/* Cover */}
                    <div className="relative w-full aspect-square max-w-sm mx-auto mb-8 rounded-2xl overflow-hidden shadow-2xl">
                        {song.cover_url ? (
                            <img
                                src={song.cover_url}
                                alt={song.title}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="w-full h-full bg-white/10 flex items-center justify-center">
                                <Disc size={80} className="text-gray-600" />
                            </div>
                        )}

                        {/* Play overlay */}
                        <button
                            onClick={togglePlay}
                            className="absolute inset-0 flex items-center justify-center bg-black/20 hover:bg-black/40 transition-all group"
                        >
                            <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center shadow-2xl transform group-hover:scale-110 transition-transform">
                                {isPlaying ? (
                                    <Pause size={32} className="text-white" />
                                ) : (
                                    <Play size={32} className="text-white ml-1" fill="white" />
                                )}
                            </div>
                        </button>
                    </div>

                    {/* Song Info */}
                    <div className="text-center mb-6">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary mb-2">TITRE</p>
                        <h1 className="text-3xl md:text-4xl font-black tracking-tight mb-2">{song.title}</h1>
                        <div className="flex items-center justify-center gap-2 text-gray-400">
                            <User size={14} />
                            <span className="font-medium">{song.artist_name}</span>
                        </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-8">
                        <div
                            className="h-2 bg-white/10 rounded-full cursor-pointer overflow-hidden"
                            onClick={handleSeek}
                        >
                            <div
                                className="h-full bg-primary rounded-full transition-all"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                        <div className="flex justify-between mt-2 text-xs text-gray-500 font-medium">
                            <span>{formatDuration((progress / 100) * (song.duration || 0))}</span>
                            <span>{formatDuration(song.duration)}</span>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Button
                            onClick={handleShare}
                            variant="outline"
                            className="w-full sm:w-auto rounded-full border-white/20 hover:bg-white/10 gap-2 px-8 h-12 font-bold"
                        >
                            <Share2 size={18} />
                            Partager
                        </Button>
                        <Button
                            onClick={openInApp}
                            className="w-full sm:w-auto rounded-full bg-primary hover:bg-primary/90 gap-2 px-8 h-12 font-bold"
                        >
                            <ExternalLink size={18} />
                            Ouvrir dans l'app
                        </Button>
                    </div>

                    {/* Comments Section */}
                    <div className="mt-8">
                        <SongComments
                            songId={song.id}
                            songTitle={song.title}
                            onLoginRequired={() => navigate('/login')}
                        />
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

export default ShareSong;

