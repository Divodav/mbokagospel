-- Create playlists table
CREATE TABLE IF NOT EXISTS public.playlists (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create playlist_songs table
CREATE TABLE IF NOT EXISTS public.playlist_songs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  playlist_id UUID REFERENCES public.playlists(id) ON DELETE CASCADE NOT NULL,
  song_id UUID REFERENCES public.songs(id) ON DELETE CASCADE NOT NULL,
  added_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(playlist_id, song_id)
);

-- Enable RLS
ALTER TABLE public.playlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.playlist_songs ENABLE ROW LEVEL SECURITY;

-- Policies for playlists
CREATE POLICY "Users can create their own playlists" 
ON public.playlists FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own playlists" 
ON public.playlists FOR DELETE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own playlists" 
ON public.playlists FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own playlists or public ones" 
ON public.playlists FOR SELECT 
USING (auth.uid() = user_id OR is_public = true);

-- Policies for playlist_songs
CREATE POLICY "Users can add songs to their playlists" 
ON public.playlist_songs FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.playlists 
    WHERE id = playlist_id AND user_id = auth.uid()
  )
);

CREATE POLICY "Users can remove songs from their playlists" 
ON public.playlist_songs FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM public.playlists 
    WHERE id = playlist_id AND user_id = auth.uid()
  )
);

CREATE POLICY "Users can view songs in playlists they can see" 
ON public.playlist_songs FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.playlists 
    WHERE id = playlist_id AND (user_id = auth.uid() OR is_public = true)
  )
);
