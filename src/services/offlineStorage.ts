/**
 * Service de stockage hors ligne pour les titres téléchargés
 * Utilise Capacitor Filesystem pour le stockage mobile sécurisé
 * Ne fonctionne que sur mobile (Capacitor native)
 */

import { Capacitor } from '@capacitor/core';
import { DownloadedSong, DownloadProgress } from '@/types/subscription';

// Constants
const STORAGE_KEY = 'mboka_offline_songs';
const MANIFEST_KEY = 'mboka_offline_manifest';

interface OfflineManifest {
    version: number;
    user_id: string;
    songs: DownloadedSong[];
    last_updated: string;
}

/**
 * Vérifie si l'application s'exécute sur une plateforme native (mobile)
 */
export const isNativePlatform = (): boolean => {
    return Capacitor.isNativePlatform();
};

/**
 * Vérifie si le mode hors ligne est disponible
 * (uniquement sur mobile, pas sur navigateur web)
 */
export const isOfflineAvailable = (): boolean => {
    return isNativePlatform();
};

/**
 * Génère un checksum simple pour la protection des fichiers
 */
const generateChecksum = (userId: string, songId: string, timestamp: string): string => {
    const data = `${userId}-${songId}-${timestamp}-mboka-secret`;
    // Simple hash - en production, utiliser une vraie fonction de hash
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
        const char = data.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return Math.abs(hash).toString(36);
};

/**
 * Vérifie l'intégrité d'un fichier téléchargé
 */
export const verifyFileIntegrity = (song: DownloadedSong): boolean => {
    const expectedChecksum = generateChecksum(
        song.user_id,
        song.song_id,
        song.downloaded_at
    );
    return song.checksum === expectedChecksum;
};

/**
 * Récupère le manifeste des fichiers hors ligne
 */
export const getOfflineManifest = (userId: string): OfflineManifest | null => {
    if (!isNativePlatform()) return null;

    try {
        const stored = localStorage.getItem(`${MANIFEST_KEY}_${userId}`);
        if (!stored) return null;

        const manifest: OfflineManifest = JSON.parse(stored);

        // Vérifier que le manifeste appartient à cet utilisateur
        if (manifest.user_id !== userId) {
            console.warn('[OfflineStorage] Manifest user mismatch');
            return null;
        }

        return manifest;
    } catch (error) {
        console.error('[OfflineStorage] Error reading manifest:', error);
        return null;
    }
};

/**
 * Sauvegarde le manifeste des fichiers hors ligne
 */
const saveOfflineManifest = (userId: string, manifest: OfflineManifest): void => {
    try {
        localStorage.setItem(`${MANIFEST_KEY}_${userId}`, JSON.stringify(manifest));
    } catch (error) {
        console.error('[OfflineStorage] Error saving manifest:', error);
    }
};

/**
 * Récupère la liste des chansons téléchargées
 */
export const getDownloadedSongs = (userId: string): DownloadedSong[] => {
    if (!isNativePlatform()) return [];

    const manifest = getOfflineManifest(userId);
    if (!manifest) return [];

    // Filtrer les chansons avec checksum invalide (protection basique)
    return manifest.songs.filter(song => {
        if (!verifyFileIntegrity(song)) {
            console.warn(`[OfflineStorage] Invalid checksum for song ${song.song_id}`);
            return false;
        }
        return true;
    });
};

/**
 * Vérifie si une chanson est téléchargée
 */
export const isSongDownloaded = (userId: string, songId: string): boolean => {
    const songs = getDownloadedSongs(userId);
    return songs.some(s => s.song_id === songId);
};

/**
 * Ajoute une chanson au manifeste après téléchargement
 */
export const addDownloadedSong = (
    userId: string,
    song: Omit<DownloadedSong, 'checksum'>
): DownloadedSong => {
    const manifest = getOfflineManifest(userId) || {
        version: 1,
        user_id: userId,
        songs: [],
        last_updated: new Date().toISOString(),
    };

    // Générer le checksum
    const checksum = generateChecksum(userId, song.song_id, song.downloaded_at);
    const downloadedSong: DownloadedSong = { ...song, checksum };

    // Vérifier si déjà téléchargé
    const existingIndex = manifest.songs.findIndex(s => s.song_id === song.song_id);
    if (existingIndex >= 0) {
        manifest.songs[existingIndex] = downloadedSong;
    } else {
        manifest.songs.push(downloadedSong);
    }

    manifest.last_updated = new Date().toISOString();
    saveOfflineManifest(userId, manifest);

    // Mettre à jour le compteur de téléchargements
    const count = parseInt(localStorage.getItem(`download_count_${userId}`) || '0', 10);
    localStorage.setItem(`download_count_${userId}`, (count + 1).toString());

    return downloadedSong;
};

/**
 * Supprime une chanson téléchargée
 */
export const removeDownloadedSong = async (
    userId: string,
    songId: string
): Promise<boolean> => {
    if (!isNativePlatform()) return false;

    try {
        const manifest = getOfflineManifest(userId);
        if (!manifest) return false;

        const songIndex = manifest.songs.findIndex(s => s.song_id === songId);
        if (songIndex === -1) return false;

        const song = manifest.songs[songIndex];

        // Supprimer les fichiers locaux via Capacitor Filesystem
        // Cette partie sera implémentée quand Capacitor Filesystem sera ajouté
        // Pour l'instant, on supprime juste du manifeste

        manifest.songs.splice(songIndex, 1);
        manifest.last_updated = new Date().toISOString();
        saveOfflineManifest(userId, manifest);

        return true;
    } catch (error) {
        console.error('[OfflineStorage] Error removing song:', error);
        return false;
    }
};

/**
 * Supprime toutes les chansons téléchargées
 */
export const clearAllDownloads = async (userId: string): Promise<boolean> => {
    if (!isNativePlatform()) return false;

    try {
        localStorage.removeItem(`${MANIFEST_KEY}_${userId}`);
        localStorage.setItem(`download_count_${userId}`, '0');
        return true;
    } catch (error) {
        console.error('[OfflineStorage] Error clearing downloads:', error);
        return false;
    }
};

/**
 * Calcule l'espace utilisé par les téléchargements
 */
export const getStorageUsed = (userId: string): number => {
    const songs = getDownloadedSongs(userId);
    return songs.reduce((total, song) => total + song.file_size, 0);
};

/**
 * Formate la taille en bytes vers une chaîne lisible
 */
export const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};
