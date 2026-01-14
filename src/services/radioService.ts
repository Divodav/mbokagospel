/**
 * Service de génération de radios automatiques
 * Utilise des règles SQL pour prioriser les titres populaires et récents
 */

import { supabase } from '@/integrations/supabase/client';
import {
    RadioConfig,
    RadioSong,
    RadioGenerationOptions,
    DEFAULT_RADIO_OPTIONS
} from '@/types/radio';

/**
 * Génère une radio basée sur un artiste
 * Priorise: titres de l'artiste, puis artistes similaires (même genre)
 */
export const generateArtistRadio = async (
    artistId: string,
    options: RadioGenerationOptions = {}
): Promise<RadioSong[]> => {
    const opts = { ...DEFAULT_RADIO_OPTIONS, ...options };
    const songs: RadioSong[] = [];
    const addedIds = new Set<string>(opts.excludeSongIds || []);

    try {
        // 1. Récupérer les infos de l'artiste et ses genres principaux
        const { data: artistSongs } = await supabase
            .from('songs')
            .select('genre')
            .eq('artist_id', artistId)
            .eq('status', 'approved')
            .limit(10);

        const artistGenres = [...new Set(artistSongs?.map(s => s.genre).filter(Boolean) || [])];

        // 2. Récupérer les titres de l'artiste avec statistiques de lecture
        const { data: mainSongs, error: mainError } = await supabase
            .from('songs')
            .select(`
        id,
        title,
        artist_name,
        artist_id,
        cover_url,
        audio_url,
        genre,
        duration,
        created_at
      `)
            .eq('artist_id', artistId)
            .eq('status', 'approved')
            .order('created_at', { ascending: false })
            .limit(Math.ceil(opts.limit! * 0.6)); // 60% de l'artiste principal

        if (mainError) throw mainError;

        // Récupérer les compteurs de lecture pour ces titres
        const mainSongsWithPlayCount = await addPlayCounts(mainSongs || []);

        // Ajouter les titres de l'artiste
        for (const song of mainSongsWithPlayCount) {
            if (!addedIds.has(song.id)) {
                songs.push(song);
                addedIds.add(song.id);
            }
        }

        // 3. Compléter avec des titres d'artistes similaires (même genre)
        if (artistGenres.length > 0 && songs.length < opts.limit!) {
            const remaining = opts.limit! - songs.length;

            const { data: similarSongs, error: similarError } = await supabase
                .from('songs')
                .select(`
          id,
          title,
          artist_name,
          artist_id,
          cover_url,
          audio_url,
          genre,
          duration,
          created_at
        `)
                .in('genre', artistGenres)
                .neq('artist_id', artistId)
                .eq('status', 'approved')
                .order('created_at', { ascending: false })
                .limit(remaining * 2); // Récupérer plus pour filtrer

            if (!similarError && similarSongs) {
                const similarWithPlayCount = await addPlayCounts(similarSongs);

                // Trier par popularité puis par date
                similarWithPlayCount.sort((a, b) => {
                    if (opts.prioritizePopular) {
                        const popDiff = b.play_count - a.play_count;
                        if (popDiff !== 0) return popDiff;
                    }
                    if (opts.prioritizeRecent) {
                        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
                    }
                    return 0;
                });

                for (const song of similarWithPlayCount) {
                    if (!addedIds.has(song.id) && songs.length < opts.limit!) {
                        songs.push(song);
                        addedIds.add(song.id);
                    }
                }
            }
        }

        // 4. Si encore pas assez, ajouter des titres populaires généraux
        if (songs.length < opts.limit!) {
            const remaining = opts.limit! - songs.length;
            const generalSongs = await getPopularSongs(remaining * 2, Array.from(addedIds));

            for (const song of generalSongs) {
                if (!addedIds.has(song.id) && songs.length < opts.limit!) {
                    songs.push(song);
                    addedIds.add(song.id);
                }
            }
        }

        // 5. Mélanger si demandé (en gardant les premiers titres de l'artiste en tête)
        if (opts.shuffle) {
            const artistCount = mainSongsWithPlayCount.filter(s => addedIds.has(s.id)).length;
            const artistSongsInList = songs.slice(0, Math.min(3, artistCount)); // Garder les 3 premiers
            const restSongs = songs.slice(Math.min(3, artistCount));

            // Shuffle Fisher-Yates
            for (let i = restSongs.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [restSongs[i], restSongs[j]] = [restSongs[j], restSongs[i]];
            }

            return [...artistSongsInList, ...restSongs];
        }

        return songs;

    } catch (error) {
        console.error('[RadioService] Artist radio error:', error);
        return [];
    }
};

/**
 * Génère une radio basée sur un genre
 * Priorise les titres populaires et récents du genre
 */
export const generateGenreRadio = async (
    genre: string,
    options: RadioGenerationOptions = {}
): Promise<RadioSong[]> => {
    const opts = { ...DEFAULT_RADIO_OPTIONS, ...options };
    const songs: RadioSong[] = [];
    const addedIds = new Set<string>(opts.excludeSongIds || []);

    try {
        // 1. Récupérer les titres du genre
        const { data: genreSongs, error: genreError } = await supabase
            .from('songs')
            .select(`
        id,
        title,
        artist_name,
        artist_id,
        cover_url,
        audio_url,
        genre,
        duration,
        created_at
      `)
            .eq('genre', genre)
            .eq('status', 'approved')
            .order('created_at', { ascending: false })
            .limit(opts.limit! * 2); // Récupérer plus pour trier

        if (genreError) throw genreError;

        // Ajouter les compteurs de lecture
        const songsWithPlayCount = await addPlayCounts(genreSongs || []);

        // 2. Trier par popularité puis par date
        songsWithPlayCount.sort((a, b) => {
            // Score combiné: popularité + récence
            const popScoreA = opts.prioritizePopular ? a.play_count : 0;
            const popScoreB = opts.prioritizePopular ? b.play_count : 0;

            const recencyScoreA = opts.prioritizeRecent
                ? (Date.now() - new Date(a.created_at).getTime()) / (1000 * 60 * 60 * 24)
                : 0;
            const recencyScoreB = opts.prioritizeRecent
                ? (Date.now() - new Date(b.created_at).getTime()) / (1000 * 60 * 60 * 24)
                : 0;

            // Plus de plays = mieux, moins de jours = mieux
            const scoreA = popScoreA * 10 - recencyScoreA;
            const scoreB = popScoreB * 10 - recencyScoreB;

            return scoreB - scoreA;
        });

        // 3. Ajouter les titres sans doublons
        for (const song of songsWithPlayCount) {
            if (!addedIds.has(song.id) && songs.length < opts.limit!) {
                songs.push(song);
                addedIds.add(song.id);
            }
        }

        // 4. Si pas assez de titres, compléter avec des genres similaires ou populaires
        if (songs.length < opts.limit!) {
            const remaining = opts.limit! - songs.length;
            const generalSongs = await getPopularSongs(remaining * 2, Array.from(addedIds));

            for (const song of generalSongs) {
                if (!addedIds.has(song.id) && songs.length < opts.limit!) {
                    songs.push(song);
                    addedIds.add(song.id);
                }
            }
        }

        // 5. Mélanger si demandé
        if (opts.shuffle) {
            // Garder les 5 premiers (les plus populaires/récents)
            const topSongs = songs.slice(0, 5);
            const restSongs = songs.slice(5);

            // Shuffle Fisher-Yates
            for (let i = restSongs.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [restSongs[i], restSongs[j]] = [restSongs[j], restSongs[i]];
            }

            return [...topSongs, ...restSongs];
        }

        return songs;

    } catch (error) {
        console.error('[RadioService] Genre radio error:', error);
        return [];
    }
};

/**
 * Récupère les titres les plus populaires
 */
const getPopularSongs = async (
    limit: number,
    excludeIds: string[] = []
): Promise<RadioSong[]> => {
    try {
        // Récupérer les titres avec le plus de lectures
        const { data: plays } = await supabase
            .from('song_plays')
            .select('song_id');

        // Compter les lectures par titre
        const playCounts: Record<string, number> = {};
        plays?.forEach(p => {
            playCounts[p.song_id] = (playCounts[p.song_id] || 0) + 1;
        });

        // Trier par nombre de lectures
        const sortedSongIds = Object.entries(playCounts)
            .sort(([, a], [, b]) => b - a)
            .filter(([id]) => !excludeIds.includes(id))
            .slice(0, limit)
            .map(([id]) => id);

        if (sortedSongIds.length === 0) {
            // Fallback: titres récents
            const { data } = await supabase
                .from('songs')
                .select(`
          id,
          title,
          artist_name,
          artist_id,
          cover_url,
          audio_url,
          genre,
          duration,
          created_at
        `)
                .eq('status', 'approved')
                .order('created_at', { ascending: false })
                .limit(limit);

            return (data || []).map(s => ({ ...s, play_count: 0 }));
        }

        // Récupérer les infos des titres
        const { data: songs } = await supabase
            .from('songs')
            .select(`
        id,
        title,
        artist_name,
        artist_id,
        cover_url,
        audio_url,
        genre,
        duration,
        created_at
      `)
            .in('id', sortedSongIds)
            .eq('status', 'approved');

        // Mapper avec les compteurs
        return (songs || []).map(s => ({
            ...s,
            play_count: playCounts[s.id] || 0
        })).sort((a, b) => b.play_count - a.play_count);

    } catch (error) {
        console.error('[RadioService] Get popular songs error:', error);
        return [];
    }
};

/**
 * Ajoute les compteurs de lecture aux titres
 */
const addPlayCounts = async (songs: any[]): Promise<RadioSong[]> => {
    if (songs.length === 0) return [];

    try {
        const songIds = songs.map(s => s.id);

        const { data: plays } = await supabase
            .from('song_plays')
            .select('song_id')
            .in('song_id', songIds);

        const playCounts: Record<string, number> = {};
        plays?.forEach(p => {
            playCounts[p.song_id] = (playCounts[p.song_id] || 0) + 1;
        });

        return songs.map(s => ({
            ...s,
            play_count: playCounts[s.id] || 0
        }));

    } catch (error) {
        console.error('[RadioService] Add play counts error:', error);
        return songs.map(s => ({ ...s, play_count: 0 }));
    }
};

/**
 * Récupère les genres disponibles avec leur nombre de titres
 */
export const getAvailableGenres = async (): Promise<{ genre: string; count: number }[]> => {
    try {
        const { data, error } = await supabase
            .from('songs')
            .select('genre')
            .eq('status', 'approved')
            .not('genre', 'is', null);

        if (error) throw error;

        const genreCounts: Record<string, number> = {};
        data?.forEach(s => {
            if (s.genre) {
                genreCounts[s.genre] = (genreCounts[s.genre] || 0) + 1;
            }
        });

        return Object.entries(genreCounts)
            .map(([genre, count]) => ({ genre, count }))
            .sort((a, b) => b.count - a.count);

    } catch (error) {
        console.error('[RadioService] Get genres error:', error);
        return [];
    }
};

/**
 * Récupère les artistes disponibles avec leur nombre de titres
 */
export const getAvailableArtists = async (): Promise<{
    id: string;
    name: string;
    count: number;
    avatar_url?: string;
}[]> => {
    try {
        const { data: songs, error } = await supabase
            .from('songs')
            .select('artist_id, artist_name')
            .eq('status', 'approved')
            .not('artist_id', 'is', null);

        if (error) throw error;

        const artistData: Record<string, { name: string; count: number }> = {};
        songs?.forEach(s => {
            if (s.artist_id) {
                if (!artistData[s.artist_id]) {
                    artistData[s.artist_id] = { name: s.artist_name, count: 0 };
                }
                artistData[s.artist_id].count++;
            }
        });

        // Récupérer les avatars des artistes
        const artistIds = Object.keys(artistData);
        const { data: profiles } = await supabase
            .from('profiles')
            .select('id, avatar_url')
            .in('id', artistIds);

        const avatarMap: Record<string, string> = {};
        profiles?.forEach(p => {
            if (p.avatar_url) avatarMap[p.id] = p.avatar_url;
        });

        return Object.entries(artistData)
            .map(([id, data]) => ({
                id,
                name: data.name,
                count: data.count,
                avatar_url: avatarMap[id]
            }))
            .sort((a, b) => b.count - a.count);

    } catch (error) {
        console.error('[RadioService] Get artists error:', error);
        return [];
    }
};
