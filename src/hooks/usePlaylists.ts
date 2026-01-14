import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Playlist } from "@/types/playlist";
import { useAuth } from "@/components/AuthProvider";

export const usePlaylists = () => {
    const { user } = useAuth();
    const queryClient = useQueryClient();

    const { data: playlists = [], isLoading } = useQuery({
        queryKey: ['playlists', user?.id],
        queryFn: async () => {
            if (!user) return [];
            const { data, error } = await supabase
                .from('playlists')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data as Playlist[];
        },
        enabled: !!user
    });

    const createPlaylist = useMutation({
        mutationFn: async (name: string) => {
            if (!user) throw new Error("Not authenticated");
            const { data, error } = await supabase.from('playlists').insert({ name, user_id: user.id }).select().single();
            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['playlists'] });
        }
    });

    const addToPlaylist = useMutation({
        mutationFn: async ({ playlistId, songId }: { playlistId: string, songId: string }) => {
            const { error } = await supabase.from('playlist_songs').insert({ playlist_id: playlistId, song_id: songId });
            if (error) {
                // Ignore duplicate key error safely
                if (error.code === '23505') return;
                throw error;
            }
        }
    });

    return { playlists, isLoading, createPlaylist, addToPlaylist };
};
