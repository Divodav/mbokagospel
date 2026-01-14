/**
 * Types pour le système de radios automatiques
 */

export type RadioType = 'artist' | 'genre';

export interface RadioConfig {
    type: RadioType;
    value: string; // ID de l'artiste ou nom du genre
    displayName: string; // Nom affiché (nom artiste ou genre)
    coverUrl?: string; // Image de couverture pour la radio
}

export interface RadioStation {
    id: string;
    config: RadioConfig;
    songs: RadioSong[];
    currentIndex: number;
    createdAt: string;
}

export interface RadioSong {
    id: string;
    title: string;
    artist_name: string;
    artist_id?: string;
    cover_url: string;
    audio_url: string;
    genre?: string;
    duration?: number;
    play_count: number;
    created_at: string;
}

export interface RadioGenerationOptions {
    limit?: number; // Nombre de titres à générer (défaut: 50)
    excludeSongIds?: string[]; // IDs à exclure
    prioritizeRecent?: boolean; // Prioriser les titres récents
    prioritizePopular?: boolean; // Prioriser les titres populaires
    shuffle?: boolean; // Mélanger après génération
}

export const DEFAULT_RADIO_OPTIONS: RadioGenerationOptions = {
    limit: 50,
    excludeSongIds: [],
    prioritizeRecent: true,
    prioritizePopular: true,
    shuffle: true,
};
