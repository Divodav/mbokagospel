/**
 * Hook pour utiliser les radios automatiques
 */

import { useState, useCallback } from 'react';
import { RadioConfig, RadioSong, RadioGenerationOptions } from '@/types/radio';
import {
    generateArtistRadio,
    generateGenreRadio,
    getAvailableGenres,
    getAvailableArtists
} from '@/services/radioService';
import { showSuccess, showError } from '@/utils/toast';

interface UseRadioReturn {
    // State
    isLoading: boolean;
    currentRadio: RadioConfig | null;
    radioQueue: RadioSong[];
    availableGenres: { genre: string; count: number }[];
    availableArtists: { id: string; name: string; count: number; avatar_url?: string }[];

    // Actions
    startArtistRadio: (artistId: string, artistName: string, coverUrl?: string) => Promise<RadioSong[]>;
    startGenreRadio: (genre: string) => Promise<RadioSong[]>;
    loadMoreSongs: () => Promise<RadioSong[]>;
    stopRadio: () => void;
    refreshGenres: () => Promise<void>;
    refreshArtists: () => Promise<void>;
}

export const useRadio = (): UseRadioReturn => {
    const [isLoading, setIsLoading] = useState(false);
    const [currentRadio, setCurrentRadio] = useState<RadioConfig | null>(null);
    const [radioQueue, setRadioQueue] = useState<RadioSong[]>([]);
    const [availableGenres, setAvailableGenres] = useState<{ genre: string; count: number }[]>([]);
    const [availableArtists, setAvailableArtists] = useState<{ id: string; name: string; count: number; avatar_url?: string }[]>([]);

    // Démarrer une radio artiste
    const startArtistRadio = useCallback(async (
        artistId: string,
        artistName: string,
        coverUrl?: string
    ): Promise<RadioSong[]> => {
        try {
            setIsLoading(true);

            const config: RadioConfig = {
                type: 'artist',
                value: artistId,
                displayName: artistName,
                coverUrl,
            };

            const songs = await generateArtistRadio(artistId, {
                limit: 50,
                prioritizePopular: true,
                prioritizeRecent: true,
                shuffle: true,
            });

            if (songs.length === 0) {
                showError('Aucun titre trouvé pour cette radio');
                return [];
            }

            setCurrentRadio(config);
            setRadioQueue(songs);
            showSuccess(`Radio ${artistName} lancée • ${songs.length} titres`);

            return songs;

        } catch (error) {
            console.error('[useRadio] Start artist radio error:', error);
            showError('Erreur lors du démarrage de la radio');
            return [];
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Démarrer une radio genre
    const startGenreRadio = useCallback(async (genre: string): Promise<RadioSong[]> => {
        try {
            setIsLoading(true);

            const config: RadioConfig = {
                type: 'genre',
                value: genre,
                displayName: genre,
            };

            const songs = await generateGenreRadio(genre, {
                limit: 50,
                prioritizePopular: true,
                prioritizeRecent: true,
                shuffle: true,
            });

            if (songs.length === 0) {
                showError('Aucun titre trouvé pour ce genre');
                return [];
            }

            setCurrentRadio(config);
            setRadioQueue(songs);
            showSuccess(`Radio ${genre} lancée • ${songs.length} titres`);

            return songs;

        } catch (error) {
            console.error('[useRadio] Start genre radio error:', error);
            showError('Erreur lors du démarrage de la radio');
            return [];
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Charger plus de titres
    const loadMoreSongs = useCallback(async (): Promise<RadioSong[]> => {
        if (!currentRadio) return [];

        try {
            setIsLoading(true);

            const existingIds = radioQueue.map(s => s.id);

            let newSongs: RadioSong[] = [];

            if (currentRadio.type === 'artist') {
                newSongs = await generateArtistRadio(currentRadio.value, {
                    limit: 20,
                    excludeSongIds: existingIds,
                    prioritizePopular: true,
                    prioritizeRecent: true,
                    shuffle: true,
                });
            } else {
                newSongs = await generateGenreRadio(currentRadio.value, {
                    limit: 20,
                    excludeSongIds: existingIds,
                    prioritizePopular: true,
                    prioritizeRecent: true,
                    shuffle: true,
                });
            }

            if (newSongs.length > 0) {
                setRadioQueue(prev => [...prev, ...newSongs]);
            }

            return newSongs;

        } catch (error) {
            console.error('[useRadio] Load more error:', error);
            return [];
        } finally {
            setIsLoading(false);
        }
    }, [currentRadio, radioQueue]);

    // Arrêter la radio
    const stopRadio = useCallback(() => {
        setCurrentRadio(null);
        setRadioQueue([]);
    }, []);

    // Charger les genres disponibles
    const refreshGenres = useCallback(async () => {
        try {
            const genres = await getAvailableGenres();
            setAvailableGenres(genres);
        } catch (error) {
            console.error('[useRadio] Refresh genres error:', error);
        }
    }, []);

    // Charger les artistes disponibles
    const refreshArtists = useCallback(async () => {
        try {
            const artists = await getAvailableArtists();
            setAvailableArtists(artists);
        } catch (error) {
            console.error('[useRadio] Refresh artists error:', error);
        }
    }, []);

    return {
        isLoading,
        currentRadio,
        radioQueue,
        availableGenres,
        availableArtists,
        startArtistRadio,
        startGenreRadio,
        loadMoreSongs,
        stopRadio,
        refreshGenres,
        refreshArtists,
    };
};
