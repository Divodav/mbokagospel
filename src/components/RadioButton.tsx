/**
 * Bouton pour démarrer une radio automatique
 * Peut être utilisé pour un artiste ou un genre
 */

import { useState } from 'react';
import { Radio, Loader2, User, Music } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRadio } from '@/hooks/useRadio';
import { cn } from '@/lib/utils';

interface RadioButtonProps {
    type: 'artist' | 'genre';
    value: string; // ID artiste ou nom du genre
    displayName: string;
    coverUrl?: string;
    onRadioStart?: (songs: any[]) => void;
    variant?: 'default' | 'icon' | 'compact';
    className?: string;
}

export const RadioButton = ({
    type,
    value,
    displayName,
    coverUrl,
    onRadioStart,
    variant = 'default',
    className
}: RadioButtonProps) => {
    const { startArtistRadio, startGenreRadio, isLoading } = useRadio();
    const [isStarting, setIsStarting] = useState(false);

    const handleStart = async (e: React.MouseEvent) => {
        e.stopPropagation();

        if (isStarting) return;

        setIsStarting(true);

        try {
            let songs: any[] = [];

            if (type === 'artist') {
                songs = await startArtistRadio(value, displayName, coverUrl);
            } else {
                songs = await startGenreRadio(value);
            }

            if (songs.length > 0 && onRadioStart) {
                onRadioStart(songs);
            }
        } finally {
            setIsStarting(false);
        }
    };

    const loading = isLoading || isStarting;

    // Variante icône
    if (variant === 'icon') {
        return (
            <Button
                variant="ghost"
                size="icon"
                onClick={handleStart}
                disabled={loading}
                className={cn(
                    "h-9 w-9 rounded-full text-gray-500 hover:text-primary hover:bg-primary/10 transition-colors",
                    className
                )}
                title={`Démarrer Radio ${displayName}`}
            >
                {loading ? (
                    <Loader2 size={16} className="animate-spin" />
                ) : (
                    <Radio size={16} />
                )}
            </Button>
        );
    }

    // Variante compacte
    if (variant === 'compact') {
        return (
            <Button
                variant="ghost"
                size="sm"
                onClick={handleStart}
                disabled={loading}
                className={cn(
                    "h-8 px-3 text-xs font-bold gap-1.5 rounded-full text-gray-500 hover:text-primary hover:bg-primary/10",
                    className
                )}
            >
                {loading ? (
                    <Loader2 size={12} className="animate-spin" />
                ) : (
                    <Radio size={12} />
                )}
                Radio
            </Button>
        );
    }

    // Variante par défaut
    return (
        <Button
            variant="outline"
            onClick={handleStart}
            disabled={loading}
            className={cn(
                "rounded-full border-white/10 hover:bg-primary/10 hover:border-primary/30 gap-2 font-bold",
                className
            )}
        >
            {loading ? (
                <Loader2 size={16} className="animate-spin" />
            ) : (
                <Radio size={16} />
            )}
            Radio {type === 'artist' ? displayName : `${displayName}`}
        </Button>
    );
};

/**
 * Menu de sélection de radios disponibles
 */
interface RadioMenuProps {
    onRadioStart: (songs: any[]) => void;
    className?: string;
}

export const GenreRadioList = ({ onRadioStart, className }: RadioMenuProps) => {
    const { availableGenres, startGenreRadio, isLoading, refreshGenres } = useRadio();
    const [loadingGenre, setLoadingGenre] = useState<string | null>(null);

    // Charger les genres au premier rendu
    useState(() => {
        refreshGenres();
    });

    const handleStartRadio = async (genre: string) => {
        setLoadingGenre(genre);
        try {
            const songs = await startGenreRadio(genre);
            if (songs.length > 0) {
                onRadioStart(songs);
            }
        } finally {
            setLoadingGenre(null);
        }
    };

    // Genres prédéfinis si aucun n'est disponible
    const genres = availableGenres.length > 0
        ? availableGenres
        : [
            { genre: 'Adoration', count: 0 },
            { genre: 'Louange', count: 0 },
            { genre: 'Chorale', count: 0 },
            { genre: 'Afro-Gospel', count: 0 },
            { genre: 'Urbain', count: 0 },
            { genre: 'Classique', count: 0 },
        ];

    return (
        <div className={cn("space-y-2", className)}>
            {genres.slice(0, 6).map((g) => (
                <button
                    key={g.genre}
                    onClick={() => handleStartRadio(g.genre)}
                    disabled={isLoading || loadingGenre !== null}
                    className={cn(
                        "w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-all group text-left",
                        loadingGenre === g.genre && "bg-primary/10"
                    )}
                >
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center shrink-0">
                        {loadingGenre === g.genre ? (
                            <Loader2 size={16} className="text-primary animate-spin" />
                        ) : (
                            <Radio size={16} className="text-primary" />
                        )}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="font-bold text-sm text-white truncate">Radio {g.genre}</p>
                        <p className="text-[10px] text-gray-500 font-medium">
                            {g.count > 0 ? `${g.count} titres` : 'Mix automatique'}
                        </p>
                    </div>
                </button>
            ))}
        </div>
    );
};

export const ArtistRadioList = ({ onRadioStart, className }: RadioMenuProps) => {
    const { availableArtists, startArtistRadio, isLoading, refreshArtists } = useRadio();
    const [loadingArtist, setLoadingArtist] = useState<string | null>(null);

    // Charger les artistes au premier rendu
    useState(() => {
        refreshArtists();
    });

    const handleStartRadio = async (artist: { id: string; name: string; avatar_url?: string }) => {
        setLoadingArtist(artist.id);
        try {
            const songs = await startArtistRadio(artist.id, artist.name, artist.avatar_url);
            if (songs.length > 0) {
                onRadioStart(songs);
            }
        } finally {
            setLoadingArtist(null);
        }
    };

    if (availableArtists.length === 0) {
        return (
            <div className={cn("text-center py-8 text-gray-500 text-sm", className)}>
                Aucun artiste disponible
            </div>
        );
    }

    return (
        <div className={cn("space-y-2", className)}>
            {availableArtists.slice(0, 6).map((artist) => (
                <button
                    key={artist.id}
                    onClick={() => handleStartRadio(artist)}
                    disabled={isLoading || loadingArtist !== null}
                    className={cn(
                        "w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-all group text-left",
                        loadingArtist === artist.id && "bg-primary/10"
                    )}
                >
                    <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center shrink-0 overflow-hidden">
                        {artist.avatar_url ? (
                            <img src={artist.avatar_url} alt="" className="w-full h-full object-cover" />
                        ) : loadingArtist === artist.id ? (
                            <Loader2 size={16} className="text-primary animate-spin" />
                        ) : (
                            <User size={16} className="text-gray-500" />
                        )}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="font-bold text-sm text-white truncate">Radio {artist.name}</p>
                        <p className="text-[10px] text-gray-500 font-medium">
                            {artist.count} titres
                        </p>
                    </div>
                    <Radio size={14} className="text-gray-600 group-hover:text-primary transition-colors" />
                </button>
            ))}
        </div>
    );
};
