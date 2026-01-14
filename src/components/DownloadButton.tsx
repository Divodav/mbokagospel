/**
 * Bouton de téléchargement pour le mode hors ligne
 * Visible uniquement sur mobile, fonctionnel uniquement pour les utilisateurs premium
 */

import { useState } from 'react';
import { Download, Check, Loader2, Crown, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useOfflineDownloads } from '@/hooks/useOfflineDownloads';
import { usePremium } from '@/hooks/usePremium';
import { cn } from '@/lib/utils';
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

interface DownloadButtonProps {
    song: {
        id: string;
        title: string;
        artist_name: string;
        cover_url: string;
        audio_url: string;
        duration?: number;
    };
    variant?: 'default' | 'icon' | 'compact';
    className?: string;
    onPremiumRequired?: () => void;
}

export const DownloadButton = ({
    song,
    variant = 'default',
    className,
    onPremiumRequired
}: DownloadButtonProps) => {
    const { isPremium } = usePremium();
    const {
        isAvailable,
        isDownloaded,
        isDownloading,
        downloadSong,
        removeSong,
        downloadProgress
    } = useOfflineDownloads();

    // Ne pas afficher si pas disponible (navigateur web)
    if (!isAvailable) {
        return null;
    }

    const downloaded = isDownloaded(song.id);
    const downloading = isDownloading(song.id);
    const progress = downloadProgress.get(song.id);

    const handleDownload = async (e: React.MouseEvent) => {
        e.stopPropagation();

        if (!isPremium) {
            onPremiumRequired?.();
            return;
        }

        await downloadSong(song);
    };

    const handleRemove = async (e: React.MouseEvent) => {
        e.stopPropagation();
        await removeSong(song.id);
    };

    // Bouton icône simple
    if (variant === 'icon') {
        if (downloaded) {
            return (
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button
                            variant="ghost"
                            size="icon"
                            className={cn(
                                "h-8 w-8 rounded-full text-green-500 hover:text-green-400 hover:bg-green-500/10",
                                className
                            )}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <Check size={16} />
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="bg-[#1e1e1e] border-white/10 text-white">
                        <AlertDialogHeader>
                            <AlertDialogTitle>Supprimer le téléchargement ?</AlertDialogTitle>
                            <AlertDialogDescription className="text-gray-400">
                                "{song.title}" sera supprimé de vos téléchargements hors ligne.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel className="bg-white/10 border-white/10 hover:bg-white/20">
                                Annuler
                            </AlertDialogCancel>
                            <AlertDialogAction
                                onClick={handleRemove}
                                className="bg-red-500 hover:bg-red-600"
                            >
                                Supprimer
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            );
        }

        if (downloading) {
            return (
                <Button
                    variant="ghost"
                    size="icon"
                    disabled
                    className={cn("h-8 w-8 rounded-full", className)}
                >
                    <Loader2 size={16} className="animate-spin text-primary" />
                </Button>
            );
        }

        return (
            <Button
                variant="ghost"
                size="icon"
                onClick={handleDownload}
                className={cn(
                    "h-8 w-8 rounded-full transition-colors",
                    isPremium
                        ? "text-gray-500 hover:text-primary hover:bg-primary/10"
                        : "text-gray-600 hover:text-yellow-500 hover:bg-yellow-500/10",
                    className
                )}
            >
                {isPremium ? <Download size={16} /> : <Crown size={16} />}
            </Button>
        );
    }

    // Bouton compact
    if (variant === 'compact') {
        if (downloaded) {
            return (
                <div className={cn("flex items-center gap-1 text-green-500 text-xs font-bold", className)}>
                    <Check size={12} />
                    <span>Téléchargé</span>
                </div>
            );
        }

        if (downloading) {
            return (
                <div className={cn("flex items-center gap-1 text-primary text-xs font-bold", className)}>
                    <Loader2 size={12} className="animate-spin" />
                    <span>{progress?.progress || 0}%</span>
                </div>
            );
        }

        return (
            <Button
                variant="ghost"
                size="sm"
                onClick={handleDownload}
                className={cn(
                    "h-7 px-2 text-xs font-bold gap-1",
                    isPremium
                        ? "text-gray-500 hover:text-primary"
                        : "text-yellow-500",
                    className
                )}
            >
                {isPremium ? <Download size={12} /> : <Crown size={12} />}
                {isPremium ? 'Télécharger' : 'Premium'}
            </Button>
        );
    }

    // Bouton par défaut (complet)
    if (downloaded) {
        return (
            <AlertDialog>
                <AlertDialogTrigger asChild>
                    <Button
                        variant="outline"
                        className={cn(
                            "rounded-full border-green-500/30 bg-green-500/10 text-green-500 hover:bg-green-500/20 gap-2",
                            className
                        )}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <Check size={16} />
                        Téléchargé
                    </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="bg-[#1e1e1e] border-white/10 text-white">
                    <AlertDialogHeader>
                        <AlertDialogTitle>Supprimer le téléchargement ?</AlertDialogTitle>
                        <AlertDialogDescription className="text-gray-400">
                            "{song.title}" sera supprimé de vos téléchargements hors ligne.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel className="bg-white/10 border-white/10 hover:bg-white/20">
                            Annuler
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleRemove}
                            className="bg-red-500 hover:bg-red-600"
                        >
                            Supprimer
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        );
    }

    if (downloading) {
        return (
            <Button
                variant="outline"
                disabled
                className={cn(
                    "rounded-full border-primary/30 bg-primary/10 text-primary gap-2",
                    className
                )}
            >
                <Loader2 size={16} className="animate-spin" />
                {progress?.progress || 0}%
            </Button>
        );
    }

    return (
        <Button
            variant="outline"
            onClick={handleDownload}
            className={cn(
                "rounded-full gap-2",
                isPremium
                    ? "border-white/10 hover:bg-white/5 hover:border-primary/30"
                    : "border-yellow-500/30 bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20",
                className
            )}
        >
            {isPremium ? (
                <>
                    <Download size={16} />
                    Télécharger
                </>
            ) : (
                <>
                    <Crown size={16} />
                    Premium requis
                </>
            )}
        </Button>
    );
};
