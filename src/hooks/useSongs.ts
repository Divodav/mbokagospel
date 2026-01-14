/**
 * Hook pour gérer la pagination des titres (Infinite Scroll)
 */

import { useState, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { showSuccess, showError } from '@/utils/toast';

interface UseSongsReturn {
    songs: any[];
    isLoading: boolean;
    hasMore: boolean;
    loadMore: () => Promise<void>;
    refresh: () => Promise<void>;
    totalCount: number;
}

const PAGE_SIZE = 20;

export const useSongs = (): UseSongsReturn => {
    const [songs, setSongs] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [totalCount, setTotalCount] = useState(0);
    const pageRef = useRef(0);

    // Cache pour éviter les appels multiples
    const loadingRef = useRef(false);

    const fetchSongs = useCallback(async (page: number, refresh = false) => {
        if (loadingRef.current) return;

        try {
            loadingRef.current = true;
            setIsLoading(true);

            const from = page * PAGE_SIZE;
            const to = from + PAGE_SIZE - 1;

            // Récupérer le nombre total (si première page)
            if (page === 0) {
                const { count } = await supabase
                    .from('songs')
                    .select('*', { count: 'exact', head: true })
                    .eq('status', 'approved');

                if (count !== null) setTotalCount(count);
            }

            // Récupérer les données
            const { data, error } = await supabase
                .from('songs')
                .select('*')
                .eq('status', 'approved')
                .order('created_at', { ascending: false })
                .range(from, to);

            if (error) throw error;

            if (data) {
                if (refresh) {
                    setSongs(data);
                } else {
                    setSongs(prev => [...prev, ...data]);
                }

                setHasMore(data.length === PAGE_SIZE);
                pageRef.current = page;
            }
        } catch (error) {
            console.error('[useSongs] Error:', error);
            showError('Erreur lors du chargement des titres');
        } finally {
            setIsLoading(false);
            loadingRef.current = false;
        }
    }, []);

    const loadMore = useCallback(async () => {
        if (!hasMore || loadingRef.current) return;
        await fetchSongs(pageRef.current + 1);
    }, [hasMore, fetchSongs]);

    const refresh = useCallback(async () => {
        pageRef.current = 0;
        setHasMore(true);
        await fetchSongs(0, true);
    }, [fetchSongs]);

    return {
        songs,
        isLoading,
        hasMore,
        loadMore,
        refresh,
        totalCount
    };
};
