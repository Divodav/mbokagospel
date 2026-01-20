-- ==============================================================================
-- MBOKA GOSPEL - CONFIGURATION COMPLÈTE DE LA BASE DE DONNÉES (SUPABASE)
-- Version: 2.0 - Mise à jour pour le nouveau projet
-- ==============================================================================
-- Ce script est idempotent : il peut être exécuté plusieurs fois sans perdre de données.
-- Exécutez ce script dans l'éditeur SQL de Supabase après avoir nettoyé le projet
-- ==============================================================================

-- 1. EXTENSIONS
-- ==============================================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- Pour la recherche full-text

-- 2. TABLES PUBLIQUES
-- ==============================================================================

-- PROFILES (Profils utilisateurs et artistes)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    name TEXT,
    email TEXT,
    avatar_url TEXT,
    bio TEXT,
    location TEXT,
    role TEXT DEFAULT 'user' CHECK (role IN ('user', 'artist', 'admin')),
    is_premium BOOLEAN DEFAULT false,
    premium_expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- SONGS (Titres)
CREATE TABLE IF NOT EXISTS public.songs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    artist_name TEXT NOT NULL,
    artist_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    album_id UUID, -- Référence album ajoutée plus bas après création de la table albums
    audio_url TEXT NOT NULL,
    audio_url_high TEXT, -- Pour la qualité Haute Fidélité (Premium)
    cover_url TEXT,
    genre TEXT,
    lyrics TEXT,
    duration TEXT, -- Format "MM:SS"
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    plays_count BIGINT DEFAULT 0,
    likes_count BIGINT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- ALBUMS
CREATE TABLE IF NOT EXISTS public.albums (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    artist_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    artist_name TEXT,
    cover_url TEXT,
    year INTEGER,
    genre TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Ajout de la contrainte FK sur songs.album_id si elle n'existe pas
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'songs_album_id_fkey') THEN
    ALTER TABLE public.songs ADD CONSTRAINT songs_album_id_fkey FOREIGN KEY (album_id) REFERENCES public.albums(id) ON DELETE SET NULL;
  END IF;
END $$;

-- PLAYLISTS
CREATE TABLE IF NOT EXISTS public.playlists (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    cover_url TEXT,
    is_public BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- PLAYLIST SONGS (Liaison Many-to-Many)
CREATE TABLE IF NOT EXISTS public.playlist_songs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    playlist_id UUID REFERENCES public.playlists(id) ON DELETE CASCADE NOT NULL,
    song_id UUID REFERENCES public.songs(id) ON DELETE CASCADE NOT NULL,
    position INTEGER DEFAULT 0,
    added_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(playlist_id, song_id)
);

-- SONG LIKES
CREATE TABLE IF NOT EXISTS public.song_likes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    song_id UUID REFERENCES public.songs(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, song_id)
);

-- SONG PLAYS (Historique / Compteur)
CREATE TABLE IF NOT EXISTS public.song_plays (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- Peut être NULL pour les écoutes anonymes
    song_id UUID REFERENCES public.songs(id) ON DELETE CASCADE NOT NULL,
    played_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- FOLLOWS (Abonnements aux artistes)
CREATE TABLE IF NOT EXISTS public.follows (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    follower_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    following_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(follower_id, following_id),
    CHECK (follower_id != following_id) -- Un utilisateur ne peut pas se suivre lui-même
);

-- COMMENTS (Commentaires sur les titres)
CREATE TABLE IF NOT EXISTS public.song_comments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    song_id UUID NOT NULL REFERENCES public.songs(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL CHECK (char_length(content) >= 1 AND char_length(content) <= 500),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. INDEX DE PERFORMANCE
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_songs_artist_id ON public.songs(artist_id);
CREATE INDEX IF NOT EXISTS idx_songs_album_id ON public.songs(album_id);
CREATE INDEX IF NOT EXISTS idx_songs_status ON public.songs(status);
CREATE INDEX IF NOT EXISTS idx_songs_genre ON public.songs(genre);
CREATE INDEX IF NOT EXISTS idx_songs_created_at ON public.songs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_songs_plays_count ON public.songs(plays_count DESC);
CREATE INDEX IF NOT EXISTS idx_songs_likes_count ON public.songs(likes_count DESC);

CREATE INDEX IF NOT EXISTS idx_albums_artist_id ON public.albums(artist_id);
CREATE INDEX IF NOT EXISTS idx_playlists_user_id ON public.playlists(user_id);
CREATE INDEX IF NOT EXISTS idx_playlist_songs_playlist_id ON public.playlist_songs(playlist_id);
CREATE INDEX IF NOT EXISTS idx_playlist_songs_song_id ON public.playlist_songs(song_id);

CREATE INDEX IF NOT EXISTS idx_song_likes_user_id ON public.song_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_song_likes_song_id ON public.song_likes(song_id);
CREATE INDEX IF NOT EXISTS idx_song_plays_song_id ON public.song_plays(song_id);
CREATE INDEX IF NOT EXISTS idx_song_plays_user_id ON public.song_plays(user_id);
CREATE INDEX IF NOT EXISTS idx_song_plays_played_at ON public.song_plays(played_at DESC);

CREATE INDEX IF NOT EXISTS idx_song_comments_song_id ON public.song_comments(song_id);
CREATE INDEX IF NOT EXISTS idx_song_comments_user_id ON public.song_comments(user_id);

CREATE INDEX IF NOT EXISTS idx_follows_follower_id ON public.follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_follows_following_id ON public.follows(following_id);

-- Index pour la recherche full-text
CREATE INDEX IF NOT EXISTS idx_songs_title_trgm ON public.songs USING gin (title gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_songs_artist_name_trgm ON public.songs USING gin (artist_name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_albums_title_trgm ON public.albums USING gin (title gin_trgm_ops);

-- 4. ROW LEVEL SECURITY (RLS)
-- ==============================================================================

-- Activation RLS sur toutes les tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.songs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.albums ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.playlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.playlist_songs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.song_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.song_plays ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.song_comments ENABLE ROW LEVEL SECURITY;

-- POLITIQUES PROFILES
-- Lecture publique des profils
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);

-- Insertion automatique via trigger
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Mise à jour uniquement par l'utilisateur lui-même
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- POLITIQUES SONGS
-- Lecture : Tout le monde peut voir les chansons approuvées (ou ses propres chansons si artiste)
DROP POLICY IF EXISTS "Public songs are viewable by everyone" ON public.songs;
CREATE POLICY "Public songs are viewable by everyone" ON public.songs FOR SELECT USING (
    status = 'approved' OR auth.uid() = artist_id
);

-- Insertion : Utilisateurs authentifiés seulement
DROP POLICY IF EXISTS "Authenticated users can insert songs" ON public.songs;
CREATE POLICY "Authenticated users can insert songs" ON public.songs FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Mise à jour : Artiste seulement pour ses propres titres
DROP POLICY IF EXISTS "Artists can update own songs" ON public.songs;
CREATE POLICY "Artists can update own songs" ON public.songs FOR UPDATE USING (auth.uid() = artist_id);

-- Suppression : Artiste seulement pour ses propres titres
DROP POLICY IF EXISTS "Artists can delete own songs" ON public.songs;
CREATE POLICY "Artists can delete own songs" ON public.songs FOR DELETE USING (auth.uid() = artist_id);

-- POLITIQUES ALBUMS
DROP POLICY IF EXISTS "Public albums viewable by everyone" ON public.albums;
CREATE POLICY "Public albums viewable by everyone" ON public.albums FOR SELECT USING (true);

DROP POLICY IF EXISTS "Artists can create albums" ON public.albums;
CREATE POLICY "Artists can create albums" ON public.albums FOR INSERT WITH CHECK (auth.uid() = artist_id);

DROP POLICY IF EXISTS "Artists can update own albums" ON public.albums;
CREATE POLICY "Artists can update own albums" ON public.albums FOR UPDATE USING (auth.uid() = artist_id);

DROP POLICY IF EXISTS "Artists can delete own albums" ON public.albums;
CREATE POLICY "Artists can delete own albums" ON public.albums FOR DELETE USING (auth.uid() = artist_id);

-- POLITIQUES PLAYLISTS
DROP POLICY IF EXISTS "Users can create their own playlists" ON public.playlists;
CREATE POLICY "Users can create their own playlists" ON public.playlists FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view their own or public playlists" ON public.playlists;
CREATE POLICY "Users can view their own or public playlists" ON public.playlists FOR SELECT USING (auth.uid() = user_id OR is_public = true);

DROP POLICY IF EXISTS "Users can update own playlists" ON public.playlists;
CREATE POLICY "Users can update own playlists" ON public.playlists FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own playlists" ON public.playlists;
CREATE POLICY "Users can delete own playlists" ON public.playlists FOR DELETE USING (auth.uid() = user_id);

-- POLITIQUES PLAYLIST_SONGS
DROP POLICY IF EXISTS "Users can view playlist songs" ON public.playlist_songs;
CREATE POLICY "Users can view playlist songs" ON public.playlist_songs FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.playlists 
        WHERE playlists.id = playlist_songs.playlist_id 
        AND (playlists.user_id = auth.uid() OR playlists.is_public = true)
    )
);

DROP POLICY IF EXISTS "Users can add songs to own playlists" ON public.playlist_songs;
CREATE POLICY "Users can add songs to own playlists" ON public.playlist_songs FOR INSERT WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.playlists 
        WHERE playlists.id = playlist_songs.playlist_id 
        AND playlists.user_id = auth.uid()
    )
);

DROP POLICY IF EXISTS "Users can remove songs from own playlists" ON public.playlist_songs;
CREATE POLICY "Users can remove songs from own playlists" ON public.playlist_songs FOR DELETE USING (
    EXISTS (
        SELECT 1 FROM public.playlists 
        WHERE playlists.id = playlist_songs.playlist_id 
        AND playlists.user_id = auth.uid()
    )
);

-- POLITIQUES LIKES
DROP POLICY IF EXISTS "Users can view all likes" ON public.song_likes;
CREATE POLICY "Users can view all likes" ON public.song_likes FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can create likes" ON public.song_likes;
CREATE POLICY "Users can create likes" ON public.song_likes FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own likes" ON public.song_likes;
CREATE POLICY "Users can delete own likes" ON public.song_likes FOR DELETE USING (auth.uid() = user_id);

-- POLITIQUES PLAYS
DROP POLICY IF EXISTS "Anyone can view plays" ON public.song_plays;
CREATE POLICY "Anyone can view plays" ON public.song_plays FOR SELECT USING (true);

DROP POLICY IF EXISTS "Anyone can insert plays" ON public.song_plays;
CREATE POLICY "Anyone can insert plays" ON public.song_plays FOR INSERT WITH CHECK (true);

-- POLITIQUES FOLLOWS
DROP POLICY IF EXISTS "Anyone can view follows" ON public.follows;
CREATE POLICY "Anyone can view follows" ON public.follows FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can follow others" ON public.follows;
CREATE POLICY "Users can follow others" ON public.follows FOR INSERT WITH CHECK (auth.uid() = follower_id);

DROP POLICY IF EXISTS "Users can unfollow" ON public.follows;
CREATE POLICY "Users can unfollow" ON public.follows FOR DELETE USING (auth.uid() = follower_id);

-- POLITIQUES COMMENTS
DROP POLICY IF EXISTS "Comments are viewable by everyone" ON public.song_comments;
CREATE POLICY "Comments are viewable by everyone" ON public.song_comments FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can create comments" ON public.song_comments;
CREATE POLICY "Authenticated users can create comments" ON public.song_comments FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own comments" ON public.song_comments;
CREATE POLICY "Users can update own comments" ON public.song_comments FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own comments" ON public.song_comments;
CREATE POLICY "Users can delete own comments" ON public.song_comments FOR DELETE USING (auth.uid() = user_id);

-- 5. TRIGGERS ET FONCTIONS
-- ==============================================================================

-- Trigger pour créer automatiquement un profil à l'inscription
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, avatar_url)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'name', new.raw_user_meta_data->>'avatar_url');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Trigger pour mettre à jour automatiquement les updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

DROP TRIGGER IF EXISTS update_songs_updated_at ON public.songs;
CREATE TRIGGER update_songs_updated_at BEFORE UPDATE ON public.songs FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

DROP TRIGGER IF EXISTS update_playlists_updated_at ON public.playlists;
CREATE TRIGGER update_playlists_updated_at BEFORE UPDATE ON public.playlists FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

DROP TRIGGER IF EXISTS update_song_comments_updated_at ON public.song_comments;
CREATE TRIGGER update_song_comments_updated_at BEFORE UPDATE ON public.song_comments FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- Fonction pour mettre à jour le compteur de likes
CREATE OR REPLACE FUNCTION update_song_likes_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE public.songs SET likes_count = likes_count + 1 WHERE id = NEW.song_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE public.songs SET likes_count = GREATEST(likes_count - 1, 0) WHERE id = OLD.song_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_likes_count_on_insert ON public.song_likes;
CREATE TRIGGER update_likes_count_on_insert
    AFTER INSERT ON public.song_likes
    FOR EACH ROW EXECUTE PROCEDURE update_song_likes_count();

DROP TRIGGER IF EXISTS update_likes_count_on_delete ON public.song_likes;
CREATE TRIGGER update_likes_count_on_delete
    AFTER DELETE ON public.song_likes
    FOR EACH ROW EXECUTE PROCEDURE update_song_likes_count();

-- Fonction pour mettre à jour le compteur de plays
CREATE OR REPLACE FUNCTION update_song_plays_count()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.songs SET plays_count = plays_count + 1 WHERE id = NEW.song_id;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_plays_count_on_insert ON public.song_plays;
CREATE TRIGGER update_plays_count_on_insert
    AFTER INSERT ON public.song_plays
    FOR EACH ROW EXECUTE PROCEDURE update_song_plays_count();

-- 6. STORAGE (BUCKETS & POLICIES)
-- ==============================================================================
-- Note: Les buckets doivent être créés manuellement via l'interface Supabase
-- Ensuite, exécutez ces commandes pour créer les policies

-- Policies pour le bucket 'songs'
DROP POLICY IF EXISTS "Public Access Songs" ON storage.objects;
CREATE POLICY "Public Access Songs" ON storage.objects FOR SELECT USING (bucket_id = 'songs');

DROP POLICY IF EXISTS "Auth Upload Songs" ON storage.objects;
CREATE POLICY "Auth Upload Songs" ON storage.objects FOR INSERT WITH CHECK (
    bucket_id = 'songs' AND auth.role() = 'authenticated'
);

DROP POLICY IF EXISTS "Auth Delete Own Songs" ON storage.objects;
CREATE POLICY "Auth Delete Own Songs" ON storage.objects FOR DELETE USING (
    bucket_id = 'songs' AND auth.uid() = owner
);

-- Policies pour le bucket 'covers'
DROP POLICY IF EXISTS "Public Access Covers" ON storage.objects;
CREATE POLICY "Public Access Covers" ON storage.objects FOR SELECT USING (bucket_id = 'covers');

DROP POLICY IF EXISTS "Auth Upload Covers" ON storage.objects;
CREATE POLICY "Auth Upload Covers" ON storage.objects FOR INSERT WITH CHECK (
    bucket_id = 'covers' AND auth.role() = 'authenticated'
);

DROP POLICY IF EXISTS "Auth Delete Own Covers" ON storage.objects;
CREATE POLICY "Auth Delete Own Covers" ON storage.objects FOR DELETE USING (
    bucket_id = 'covers' AND auth.uid() = owner
);

-- Policies pour le bucket 'avatars'
DROP POLICY IF EXISTS "Public Access Avatars" ON storage.objects;
CREATE POLICY "Public Access Avatars" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');

DROP POLICY IF EXISTS "Auth Upload Avatars" ON storage.objects;
CREATE POLICY "Auth Upload Avatars" ON storage.objects FOR INSERT WITH CHECK (
    bucket_id = 'avatars' AND auth.uid() = owner
);

DROP POLICY IF EXISTS "Auth Update Own Avatars" ON storage.objects;
CREATE POLICY "Auth Update Own Avatars" ON storage.objects FOR UPDATE USING (
    bucket_id = 'avatars' AND auth.uid() = owner
);

DROP POLICY IF EXISTS "Auth Delete Own Avatars" ON storage.objects;
CREATE POLICY "Auth Delete Own Avatars" ON storage.objects FOR DELETE USING (
    bucket_id = 'avatars' AND auth.uid() = owner
);

-- ==============================================================================
-- FIN DE LA CONFIGURATION
-- ==============================================================================
-- Votre base de données est maintenant prête à l'emploi!
-- N'oubliez pas de créer les buckets de storage manuellement:
-- - songs (public)
-- - covers (public)
-- - avatars (public)
-- ==============================================================================
