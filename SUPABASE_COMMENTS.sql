-- =====================================================
-- TABLE: song_comments
-- Système de commentaires pour les titres
-- =====================================================

-- Création de la table song_comments
CREATE TABLE IF NOT EXISTS public.song_comments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    song_id UUID NOT NULL REFERENCES public.songs(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL CHECK (char_length(content) >= 1 AND char_length(content) <= 500),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Index pour améliorer les performances des requêtes
CREATE INDEX IF NOT EXISTS idx_song_comments_song_id ON public.song_comments(song_id);
CREATE INDEX IF NOT EXISTS idx_song_comments_user_id ON public.song_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_song_comments_created_at ON public.song_comments(created_at DESC);

-- =====================================================
-- RLS (Row Level Security) - Politiques strictes
-- =====================================================

-- Activer RLS sur la table
ALTER TABLE public.song_comments ENABLE ROW LEVEL SECURITY;

-- Politique: Tout le monde peut lire les commentaires
CREATE POLICY "song_comments_select_policy" ON public.song_comments
    FOR SELECT
    USING (true);

-- Politique: Seuls les utilisateurs authentifiés peuvent créer des commentaires
CREATE POLICY "song_comments_insert_policy" ON public.song_comments
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Politique: Seul l'auteur peut modifier son commentaire
CREATE POLICY "song_comments_update_policy" ON public.song_comments
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Politique: L'auteur ou l'administrateur peut supprimer
-- (L'admin est identifié par son email: kangombedavin16@gmail.com)
CREATE POLICY "song_comments_delete_policy" ON public.song_comments
    FOR DELETE
    USING (
        auth.uid() = user_id 
        OR 
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND auth.users.email = 'kangombedavin16@gmail.com'
        )
    );

-- =====================================================
-- Fonction pour mettre à jour updated_at automatiquement
-- =====================================================

CREATE OR REPLACE FUNCTION update_song_comments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour mettre à jour updated_at
DROP TRIGGER IF EXISTS trigger_update_song_comments_updated_at ON public.song_comments;
CREATE TRIGGER trigger_update_song_comments_updated_at
    BEFORE UPDATE ON public.song_comments
    FOR EACH ROW
    EXECUTE FUNCTION update_song_comments_updated_at();

-- =====================================================
-- Commentaire de documentation
-- =====================================================

COMMENT ON TABLE public.song_comments IS 'Commentaires des utilisateurs sur les titres';
COMMENT ON COLUMN public.song_comments.id IS 'Identifiant unique du commentaire';
COMMENT ON COLUMN public.song_comments.song_id IS 'Référence au titre commenté';
COMMENT ON COLUMN public.song_comments.user_id IS 'Auteur du commentaire';
COMMENT ON COLUMN public.song_comments.content IS 'Contenu du commentaire (1-500 caractères)';
COMMENT ON COLUMN public.song_comments.created_at IS 'Date de création';
COMMENT ON COLUMN public.song_comments.updated_at IS 'Date de dernière modification';
