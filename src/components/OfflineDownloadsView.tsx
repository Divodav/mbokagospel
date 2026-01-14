/**
 * Vue des téléchargements hors ligne
 * Accessible uniquement sur mobile pour les utilisateurs premium
 */

import { Download, Trash2, HardDrive, Crown, Wifi, WifiOff, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useOfflineDownloads } from '@/hooks/useOfflineDownloads';
import { usePremium } from '@/hooks/usePremium';
import { useAuth } from '@/components/AuthProvider';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface OfflineDownloadsViewProps {
    onPlaySong: (song: any) => void;
    onNavigateToPremium?: () => void;
    currentSongId?: string;
}

export const OfflineDownloadsView = ({
    onPlaySong,
    onNavigateToPremium,
    currentSongId
}: OfflineDownloadsViewProps) => {
    const { user } = useAuth();
    const { isPremium, features } = usePremium();
    const {
        downloadedSongs,
        storageUsed,
        isAvailable,
        clearAllSongs,
        removeSong
    } = useOfflineDownloads();

    // Message pour navigateur web
    if (!isAvailable) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-center px-6">
                <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-6 border border-white/10">
                    <Wifi size={32} className="text-gray-500" />
                </div>
                <h3 className="text-xl font-black mb-2">Mode hors ligne</h3>
                <p className="text-gray-500 text-sm max-w-sm mb-6">
                    Le téléchargement hors ligne est disponible uniquement sur l'application mobile MbokaGospel.
                </p>
                <p className="text-gray-600 text-xs">
                    Téléchargez l'app sur iOS ou Android
                </p>
            </div>
        );
    }

    // Message pour utilisateurs non premium
    if (!isPremium) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-center px-6">
                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-6 border border-primary/20">
                    <Crown size={32} className="text-primary" />
                </div>
                <h3 className="text-xl font-black mb-2">Fonctionnalité Premium</h3>
                <p className="text-gray-500 text-sm max-w-sm mb-6">
                    Téléchargez vos titres préférés pour les écouter hors connexion avec un abonnement Premium.
                </p>
                <Button
                    onClick={onNavigateToPremium}
                    className="bg-primary hover:bg-primary/90 rounded-full px-8 h-12 font-bold gap-2"
                >
                    <Crown size={16} />
                    Passer à Premium
                </Button>
            </div>
        );
    }

    // Vue des téléchargements
    return (
        <div className="space-y-6 py-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                        <WifiOff size={20} className="text-primary" />
                    </div>
                    <div>
                        <h3 className="font-bold">Téléchargements</h3>
                        <p className="text-xs text-gray-500">{downloadedSongs.length} titres • {storageUsed}</p>
                    </div>
                </div>

                {downloadedSongs.length > 0 && (
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="text-gray-500 hover:text-red-500 h-8 px-3 text-xs font-bold rounded-full"
                            >
                                <Trash2 size={14} className="mr-1" />
                                Tout supprimer
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="bg-[#1e1e1e] border-white/10 text-white">
                            <AlertDialogHeader>
                                <AlertDialogTitle>Supprimer tous les téléchargements ?</AlertDialogTitle>
                                <AlertDialogDescription className="text-gray-400">
                                    Tous vos titres téléchargés seront supprimés. Cette action est irréversible.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel className="bg-white/10 border-white/10 hover:bg-white/20">
                                    Annuler
                                </AlertDialogCancel>
                                <AlertDialogAction
                                    onClick={() => clearAllSongs()}
                                    className="bg-red-500 hover:bg-red-600"
                                >
                                    Supprimer tout
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                )}
            </div>

            {/* Storage info */}
            {features.maxDownloads !== -1 && (
                <div className="flex items-center gap-2 text-xs text-gray-500 bg-white/5 rounded-lg p-3">
                    <HardDrive size={14} />
                    <span>
                        {downloadedSongs.length} / {features.maxDownloads} téléchargements utilisés
                    </span>
                </div>
            )}

            {/* Downloads list */}
            {downloadedSongs.length > 0 ? (
                <div className="space-y-1">
                    {downloadedSongs.map((song, i) => (
                        <motion.div
                            key={song.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05 }}
                            className={cn(
                                "group flex items-center p-3 rounded-xl hover:bg-white/5 transition-all cursor-pointer",
                                currentSongId === song.song_id && "bg-white/5"
                            )}
                            onClick={() => onPlaySong({
                                id: song.song_id,
                                title: song.title,
                                artist_name: song.artist_name,
                                cover_url: song.cover_url,
                                audio_url: song.local_audio_path, // Utiliser le chemin local
                                duration: song.duration,
                            })}
                        >
                            <div className="relative w-12 h-12 rounded-lg overflow-hidden mr-4 shrink-0 bg-white/5">
                                <img
                                    src={song.cover_url}
                                    alt={song.title}
                                    className="w-full h-full object-cover"
                                />
                                <div className={cn(
                                    "absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity",
                                    currentSongId === song.song_id && "opacity-100"
                                )}>
                                    <Play size={16} fill="white" className="text-white" />
                                </div>
                            </div>

                            <div className="flex-1 min-w-0">
                                <p className={cn(
                                    "font-bold text-sm truncate",
                                    currentSongId === song.song_id ? "text-primary" : "text-white"
                                )}>
                                    {song.title}
                                </p>
                                <p className="text-xs text-gray-500 truncate">{song.artist_name}</p>
                            </div>

                            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-gray-500 hover:text-red-500"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        removeSong(song.song_id);
                                    }}
                                >
                                    <Trash2 size={14} />
                                </Button>
                            </div>

                            <div className="text-[10px] text-gray-600 font-bold ml-2">
                                <Download size={10} className="inline mr-1" />
                                Hors ligne
                            </div>
                        </motion.div>
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4 border border-white/10">
                        <Download size={24} className="text-gray-500" />
                    </div>
                    <h4 className="font-bold mb-1">Aucun téléchargement</h4>
                    <p className="text-gray-500 text-sm max-w-xs">
                        Téléchargez des titres pour les écouter sans connexion Internet.
                    </p>
                </div>
            )}
        </div>
    );
};
