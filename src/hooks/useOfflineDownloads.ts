/**
 * Hook pour gérer les téléchargements hors ligne
 * Réservé aux utilisateurs premium sur mobile uniquement
 */

import { useState, useEffect, useCallback } from 'react';
import { Capacitor } from '@capacitor/core';
import { useAuth } from '@/components/AuthProvider';
import { usePremium } from './usePremium';
import { DownloadedSong, DownloadProgress } from '@/types/subscription';
import {
    isNativePlatform,
    isOfflineAvailable,
    getDownloadedSongs,
    isSongDownloaded,
    addDownloadedSong,
    removeDownloadedSong,
    clearAllDownloads,
    getStorageUsed,
    formatFileSize,
} from '@/services/offlineStorage';
import { showSuccess, showError } from '@/utils/toast';

interface Song {
    id: string;
    title: string;
    artist_name: string;
    cover_url: string;
    audio_url: string;
    duration?: number;
}

interface UseOfflineDownloadsReturn {
    // State
    downloadedSongs: DownloadedSong[];
    downloadProgress: Map<string, DownloadProgress>;
    isAvailable: boolean;
    isPremiumRequired: boolean;
    storageUsed: string;

    // Actions
    downloadSong: (song: Song) => Promise<boolean>;
    removeSong: (songId: string) => Promise<boolean>;
    clearAllSongs: () => Promise<boolean>;
    isDownloaded: (songId: string) => boolean;
    isDownloading: (songId: string) => boolean;
    getLocalAudioUrl: (songId: string) => string | null;
    refreshDownloads: () => void;
}

export const useOfflineDownloads = (): UseOfflineDownloadsReturn => {
    const { user } = useAuth();
    const { isPremium, canDownloadOffline, features } = usePremium();

    const [downloadedSongs, setDownloadedSongs] = useState<DownloadedSong[]>([]);
    const [downloadProgress, setDownloadProgress] = useState<Map<string, DownloadProgress>>(new Map());
    const [storageUsed, setStorageUsed] = useState<string>('0 B');

    const isAvailable = isOfflineAvailable();
    const isPremiumRequired = !isPremium;

    // Charger les téléchargements existants
    const refreshDownloads = useCallback(() => {
        if (!user || !isAvailable) return;

        const songs = getDownloadedSongs(user.id);
        setDownloadedSongs(songs);
        setStorageUsed(formatFileSize(getStorageUsed(user.id)));
    }, [user, isAvailable]);

    useEffect(() => {
        refreshDownloads();
    }, [refreshDownloads]);

    // Vérifier si une chanson est téléchargée
    const isDownloaded = useCallback((songId: string): boolean => {
        if (!user) return false;
        return isSongDownloaded(user.id, songId);
    }, [user]);

    // Vérifier si une chanson est en cours de téléchargement
    const isDownloading = useCallback((songId: string): boolean => {
        const progress = downloadProgress.get(songId);
        return progress?.status === 'downloading' || progress?.status === 'pending';
    }, [downloadProgress]);

    // Télécharger une chanson
    const downloadSong = useCallback(async (song: Song): Promise<boolean> => {
        // Vérifications préalables
        if (!user) {
            showError('Connectez-vous pour télécharger');
            return false;
        }

        if (!isAvailable) {
            showError('Le mode hors ligne est disponible uniquement sur mobile');
            return false;
        }

        if (!isPremium) {
            showError('Abonnez-vous à Premium pour télécharger');
            return false;
        }

        if (!canDownloadOffline) {
            showError('Limite de téléchargements atteinte');
            return false;
        }

        if (isDownloaded(song.id)) {
            showError('Ce titre est déjà téléchargé');
            return false;
        }

        try {
            // Définir le statut de téléchargement
            setDownloadProgress(prev => {
                const next = new Map(prev);
                next.set(song.id, { song_id: song.id, progress: 0, status: 'pending' });
                return next;
            });

            // Dans une implémentation complète, on utiliserait Capacitor Filesystem
            // Pour télécharger les fichiers audio et image
            // Ici on simule le téléchargement

            // Mise à jour du progrès (simulation)
            for (let progress = 0; progress <= 100; progress += 20) {
                await new Promise(resolve => setTimeout(resolve, 200));
                setDownloadProgress(prev => {
                    const next = new Map(prev);
                    next.set(song.id, {
                        song_id: song.id,
                        progress,
                        status: progress < 100 ? 'downloading' : 'completed'
                    });
                    return next;
                });
            }

            // En production, les chemins seraient les vrais chemins locaux
            const downloadedSong = addDownloadedSong(user.id, {
                id: `dl_${song.id}_${Date.now()}`,
                song_id: song.id,
                title: song.title,
                artist_name: song.artist_name,
                cover_url: song.cover_url,
                local_audio_path: `file://mboka/audio/${song.id}.mp3`,
                local_cover_path: `file://mboka/covers/${song.id}.jpg`,
                downloaded_at: new Date().toISOString(),
                file_size: 5 * 1024 * 1024, // Estimation 5MB
                duration: song.duration,
                user_id: user.id,
            });

            // Rafraîchir la liste
            refreshDownloads();

            showSuccess(`"${song.title}" téléchargé avec succès`);
            return true;

        } catch (error) {
            console.error('[useOfflineDownloads] Download error:', error);

            setDownloadProgress(prev => {
                const next = new Map(prev);
                next.set(song.id, {
                    song_id: song.id,
                    progress: 0,
                    status: 'failed',
                    error: 'Erreur de téléchargement'
                });
                return next;
            });

            showError('Erreur lors du téléchargement');
            return false;
        }
    }, [user, isAvailable, isPremium, canDownloadOffline, isDownloaded, refreshDownloads]);

    // Supprimer une chanson
    const removeSong = useCallback(async (songId: string): Promise<boolean> => {
        if (!user) return false;

        try {
            const success = await removeDownloadedSong(user.id, songId);
            if (success) {
                refreshDownloads();
                showSuccess('Titre supprimé des téléchargements');
            }
            return success;
        } catch (error) {
            console.error('[useOfflineDownloads] Remove error:', error);
            showError('Erreur lors de la suppression');
            return false;
        }
    }, [user, refreshDownloads]);

    // Supprimer tous les téléchargements
    const clearAllSongs = useCallback(async (): Promise<boolean> => {
        if (!user) return false;

        try {
            const success = await clearAllDownloads(user.id);
            if (success) {
                setDownloadedSongs([]);
                setStorageUsed('0 B');
                showSuccess('Tous les téléchargements ont été supprimés');
            }
            return success;
        } catch (error) {
            console.error('[useOfflineDownloads] Clear error:', error);
            showError('Erreur lors de la suppression');
            return false;
        }
    }, [user]);

    // Obtenir l'URL audio locale
    const getLocalAudioUrl = useCallback((songId: string): string | null => {
        const song = downloadedSongs.find(s => s.song_id === songId);
        return song?.local_audio_path || null;
    }, [downloadedSongs]);

    return {
        downloadedSongs,
        downloadProgress,
        isAvailable,
        isPremiumRequired,
        storageUsed,
        downloadSong,
        removeSong,
        clearAllSongs,
        isDownloaded,
        isDownloading,
        getLocalAudioUrl,
        refreshDownloads,
    };
};
