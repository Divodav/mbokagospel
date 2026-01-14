/**
 * Hook pour gérer les commentaires d'un titre
 */

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/AuthProvider';
import { Comment, CommentWithUser, CreateCommentInput } from '@/types/comment';
import { showSuccess, showError } from '@/utils/toast';

interface UseCommentsReturn {
    comments: CommentWithUser[];
    isLoading: boolean;
    error: string | null;
    totalCount: number;
    addComment: (content: string) => Promise<boolean>;
    deleteComment: (commentId: string) => Promise<boolean>;
    refreshComments: () => Promise<void>;
    canDelete: (comment: CommentWithUser) => boolean;
}

export const useComments = (songId: string | null): UseCommentsReturn => {
    const { user } = useAuth();
    const [comments, setComments] = useState<CommentWithUser[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [totalCount, setTotalCount] = useState(0);

    // Email admin pour vérification
    const ADMIN_EMAIL = 'kangombedavin16@gmail.com';
    const isAdmin = user?.email === ADMIN_EMAIL;

    // Récupérer les commentaires
    const fetchComments = useCallback(async () => {
        if (!songId) {
            setComments([]);
            return;
        }

        try {
            setIsLoading(true);
            setError(null);

            // Récupérer les commentaires avec les infos utilisateur
            const { data, error: fetchError } = await supabase
                .from('song_comments')
                .select(`
          id,
          song_id,
          user_id,
          content,
          created_at,
          updated_at
        `)
                .eq('song_id', songId)
                .order('created_at', { ascending: false });

            if (fetchError) throw fetchError;

            // Récupérer les profils des utilisateurs
            const userIds = [...new Set(data?.map(c => c.user_id) || [])];
            const { data: profiles } = await supabase
                .from('profiles')
                .select('id, display_name, name, avatar_url, email')
                .in('id', userIds);

            // Mapper les commentaires avec les profils
            const commentsWithUsers: CommentWithUser[] = (data || []).map(comment => {
                const profile = profiles?.find(p => p.id === comment.user_id);
                return {
                    ...comment,
                    user: {
                        id: comment.user_id,
                        display_name: profile?.display_name || profile?.name,
                        name: profile?.name,
                        avatar_url: profile?.avatar_url,
                        email: profile?.email,
                    }
                };
            });

            setComments(commentsWithUsers);
            setTotalCount(commentsWithUsers.length);

        } catch (err) {
            console.error('[useComments] Fetch error:', err);
            setError('Erreur lors du chargement des commentaires');
        } finally {
            setIsLoading(false);
        }
    }, [songId]);

    // Charger les commentaires au montage et quand le songId change
    useEffect(() => {
        fetchComments();
    }, [fetchComments]);

    // Ajouter un commentaire
    const addComment = useCallback(async (content: string): Promise<boolean> => {
        if (!user) {
            showError('Connectez-vous pour commenter');
            return false;
        }

        if (!songId) {
            showError('Aucun titre sélectionné');
            return false;
        }

        const trimmedContent = content.trim();
        if (!trimmedContent) {
            showError('Le commentaire ne peut pas être vide');
            return false;
        }

        if (trimmedContent.length > 500) {
            showError('Le commentaire est trop long (max 500 caractères)');
            return false;
        }

        try {
            const { data, error: insertError } = await supabase
                .from('song_comments')
                .insert({
                    song_id: songId,
                    user_id: user.id,
                    content: trimmedContent,
                })
                .select()
                .single();

            if (insertError) throw insertError;

            // Ajouter le commentaire avec les infos utilisateur
            const { data: profile } = await supabase
                .from('profiles')
                .select('id, display_name, name, avatar_url, email')
                .eq('id', user.id)
                .single();

            const newComment: CommentWithUser = {
                ...data,
                user: {
                    id: user.id,
                    display_name: profile?.display_name || profile?.name,
                    name: profile?.name,
                    avatar_url: profile?.avatar_url,
                    email: profile?.email || user.email,
                }
            };

            setComments(prev => [newComment, ...prev]);
            setTotalCount(prev => prev + 1);
            showSuccess('Commentaire ajouté');
            return true;

        } catch (err) {
            console.error('[useComments] Add error:', err);
            showError('Erreur lors de l\'ajout du commentaire');
            return false;
        }
    }, [user, songId]);

    // Supprimer un commentaire
    const deleteComment = useCallback(async (commentId: string): Promise<boolean> => {
        if (!user) {
            showError('Vous devez être connecté');
            return false;
        }

        try {
            const { error: deleteError } = await supabase
                .from('song_comments')
                .delete()
                .eq('id', commentId);

            if (deleteError) throw deleteError;

            setComments(prev => prev.filter(c => c.id !== commentId));
            setTotalCount(prev => prev - 1);
            showSuccess('Commentaire supprimé');
            return true;

        } catch (err) {
            console.error('[useComments] Delete error:', err);
            showError('Erreur lors de la suppression');
            return false;
        }
    }, [user]);

    // Vérifier si l'utilisateur peut supprimer un commentaire
    const canDelete = useCallback((comment: CommentWithUser): boolean => {
        if (!user) return false;
        return comment.user_id === user.id || isAdmin;
    }, [user, isAdmin]);

    return {
        comments,
        isLoading,
        error,
        totalCount,
        addComment,
        deleteComment,
        refreshComments: fetchComments,
        canDelete,
    };
};
