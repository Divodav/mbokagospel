/**
 * Types pour le système de commentaires
 */

export interface Comment {
    id: string;
    song_id: string;
    user_id: string;
    content: string;
    created_at: string;
    updated_at: string;
    // Données jointes du profil utilisateur
    user?: {
        id: string;
        display_name?: string;
        name?: string;
        avatar_url?: string;
        email?: string;
    };
}

export interface CommentWithUser extends Comment {
    user: {
        id: string;
        display_name?: string;
        name?: string;
        avatar_url?: string;
        email?: string;
    };
}

export interface CreateCommentInput {
    song_id: string;
    content: string;
}

export interface UpdateCommentInput {
    id: string;
    content: string;
}
