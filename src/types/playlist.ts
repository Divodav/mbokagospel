export interface Playlist {
  id: string;
  user_id: string;
  name: string;
  is_public: boolean;
  created_at: string;
}

export interface PlaylistSong {
  id: string;
  playlist_id: string;
  song_id: string;
  added_at: string;
  song?: any; // To hold the joined song data
}
