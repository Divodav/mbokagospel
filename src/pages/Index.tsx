"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, LogIn, Crown, LogOut, Heart, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MobileNav } from "@/components/MobileNav";
import { HomeView } from "@/components/HomeView";
import { SearchView } from "@/components/SearchView";
import { LyricsView } from "@/components/LyricsView";
import { QueueView } from "@/components/QueueView";
import { ProfileView } from "@/components/ProfileView";
import { SubscriptionView } from "@/components/SubscriptionView";
import { LibraryView } from "@/components/LibraryView";
import { Sidebar } from "@/components/Sidebar";
import { Player } from "@/components/Player";
import { HomeSkeleton, SearchSkeleton } from "@/components/ViewSkeletons";
import { PWAInstallBanner } from "@/components/PWAInstallBanner";
import { useAuth } from "@/components/AuthProvider";
import { usePWA } from "@/hooks/usePWA";
import { useIsMobile } from "@/hooks/use-mobile";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate, useSearchParams } from "react-router-dom";
import { showError, showSuccess } from "@/utils/toast";
import { cn } from "@/lib/utils";
import { PlaylistView } from "@/components/PlaylistView";
import { AlbumView } from "@/components/AlbumView";
import { AddToPlaylistMenu } from "@/components/AddToPlaylistMenu";
import { Playlist } from "@/types/playlist";
import { usePlaylists } from "@/hooks/usePlaylists";
import { useSongs } from "@/hooks/useSongs";

const Index = () => {
  const { user, session } = useAuth();
  const { isInstallable, isIOS, handleInstall } = usePWA();
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { playlists: userPlaylists } = usePlaylists();

  // Optimisation: Utilisation de useSongs pour la pagination
  const { songs: paginatedSongs, isLoading: isLoadingSongs, hasMore, loadMore, refresh } = useSongs();

  // Data States
  const [albums, setAlbums] = useState<any[]>([]);
  const [likedSongIds, setLikedSongIds] = useState<Set<string>>(new Set());

  // Player States
  const [currentSong, setCurrentSong] = useState<any>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [activeTab, setActiveTab] = useState('accueil');
  const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(null);
  const [selectedAlbum, setSelectedAlbum] = useState<any | null>(null);

  // Advanced Playback States
  const [isShuffle, setIsShuffle] = useState(false);
  const [repeatMode, setRepeatMode] = useState<'none' | 'one' | 'all'>('none');
  const [queue, setQueue] = useState<any[]>([]);
  const [originalQueue, setOriginalQueue] = useState<any[]>([]);

  const togglePlay = useCallback(() => setIsPlaying(prev => !prev), []);

  // Initialisation et rafraîchissement des chansons
  useEffect(() => {
    refresh();
  }, [refresh]);

  // Synchronisation de la queue initiale
  useEffect(() => {
    // Si la queue est vide et qu'on a chargé des chansons, on initialise
    if (paginatedSongs.length > 0 && queue.length === 0) {
      setQueue(paginatedSongs);
      setOriginalQueue(paginatedSongs);

      if (!currentSong) {
        const lastId = localStorage.getItem('last_song_id');
        const lastSong = lastId ? paginatedSongs.find(s => s.id === lastId) : null;
        setCurrentSong(lastSong || paginatedSongs[0]);
      }
    }
    // Si on a chargé plus de chansons (infinite scroll), on met à jour la queue sans perturber la lecture
    else if (paginatedSongs.length > queue.length && !isShuffle) {
      // Pour une vraie app de prod, il faudrait une gestion plus fine pour ne pas
      // recréer toute la queue, mais ici on simplifie
      setQueue(paginatedSongs);
      setOriginalQueue(paginatedSongs);
    }
  }, [paginatedSongs]); // Attention: ceci s'exécutera à chaque chargement de page (20, 40, 60...)

  const fetchData = useCallback(async () => {
    try {
      const { data: albumsData } = await supabase.from('albums').select('*').order('created_at', { ascending: false });
      if (albumsData) setAlbums(albumsData);

      if (user) {
        const { data: likes } = await supabase
          .from('song_likes')
          .select('song_id')
          .eq('user_id', user.id);
        if (likes) setLikedSongIds(new Set(likes.map(l => l.song_id)));
      }
    } catch (e) {
      console.error("[Index] Fetch error:", e);
    }
  }, [user]);

  useEffect(() => {
    fetchData();
  }, [user]);

  // Handle Shared Links (Playlist, Album, Song)
  useEffect(() => {
    const playlistId = searchParams.get('playlist');
    const albumId = searchParams.get('album');
    const songId = searchParams.get('song');

    if (playlistId) {
      const fetchSharedPlaylist = async () => {
        const { data, error } = await supabase.from('playlists').select('*').eq('id', playlistId).single();
        if (data && !error) {
          setSelectedPlaylist(data);
          setActiveTab('playlist');
        } else {
          showError("Playlist introuvable ou privée");
        }
      };
      fetchSharedPlaylist();
    } else if (albumId) {
      const fetchSharedAlbum = async () => {
        const { data, error } = await supabase.from('albums').select('*').eq('id', albumId).single();
        if (data && !error) {
          setSelectedAlbum(data);
          setActiveTab('album');
        } else {
          showError("Album introuvable");
        }
      };
      fetchSharedAlbum();
    } else if (songId) {
      const fetchSharedSong = async () => {
        const { data, error } = await supabase.from('songs').select('*').eq('id', songId).single();
        if (data && !error) {
          setCurrentSong(data);
          setIsPlaying(true);
          showSuccess(`Lecture de : ${data.title}`);
        } else {
          showError("Titre introuvable");
        }
      };
      fetchSharedSong();
    }
  }, [searchParams]);

  const toggleShuffle = () => {
    setIsShuffle(prev => {
      const next = !prev;
      if (next) {
        const shuffled = [...queue].sort(() => Math.random() - 0.5);
        if (currentSong) {
          const filtered = shuffled.filter(s => s.id !== currentSong.id);
          setQueue([currentSong, ...filtered]);
        } else {
          setQueue(shuffled);
        }
      } else {
        setQueue(originalQueue);
      }
      return next;
    });
  };

  const playSong = useCallback((song: any, newQueue?: any[]) => {
    if (newQueue) {
      setQueue(newQueue);
      setOriginalQueue(newQueue);
    }
    if (song?.id === currentSong?.id) {
      togglePlay();
    } else {
      setCurrentSong(song);
      setIsPlaying(true);
      setProgress(0);
      localStorage.setItem('last_song_id', song.id);

      if (user) {
        supabase.from('song_plays').insert({ song_id: song.id, user_id: user.id }).then();
      } else {
        supabase.from('song_plays').insert({ song_id: song.id }).then();
      }
    }
  }, [currentSong, togglePlay, user]);

  const playCollection = (collection: any[]) => {
    if (collection.length > 0) {
      playSong(collection[0], collection);
    }
  };

  const toggleLike = async () => {
    if (!user) {
      showError("Connectez-vous pour aimer ce titre");
      navigate('/login');
      return;
    }

    const isLiked = likedSongIds.has(currentSong.id);
    try {
      if (isLiked) {
        await supabase.from('song_likes').delete().eq('user_id', user.id).eq('song_id', currentSong.id);
        setLikedSongIds(prev => {
          const next = new Set(prev);
          next.delete(currentSong.id);
          return next;
        });
      } else {
        await supabase.from('song_likes').insert({ user_id: user.id, song_id: currentSong.id });
        setLikedSongIds(prev => new Set(prev).add(currentSong.id));
        showSuccess("Ajouté aux coups de cœur");
      }
    } catch (err) {
      showError("Une erreur est survenue");
    }
  };

  // Logique simplifiée pour le bouton Suivant manuel
  const handleSkipNext = useCallback(() => {
    if (queue.length === 0) return;

    const currentIdx = queue.findIndex(s => s.id === currentSong?.id);
    let nextIdx = currentIdx + 1;

    if (nextIdx >= queue.length) {
      if (repeatMode === 'all') {
        nextIdx = 0;
      } else {
        setIsPlaying(false);
        return;
      }
    }

    playSong(queue[nextIdx]);
  }, [queue, currentSong, playSong, repeatMode]);

  const handleSkipBack = useCallback(() => {
    if (queue.length === 0) return;
    const currentIdx = queue.findIndex(s => s.id === currentSong?.id);
    let prevIdx = currentIdx - 1;
    if (prevIdx < 0) prevIdx = repeatMode === 'all' ? queue.length - 1 : 0;
    playSong(queue[prevIdx]);
  }, [queue, currentSong, playSong, repeatMode]);

  // Nous utilisons paginatedSongs pour la recherche locale des likes si nécessaire,
  // ou on pourrait charger les likes séparément. Ici on garde la logique existante mais sur paginatedSongs.
  // Note: cela signifie qu'on ne voit que les likes des chansons déjà chargées dans la liste principale si on se base sur paginatedSongs.
  // Pour une vraie vue "Likes", il faudrait une requête dédiée (ce que fait LibraryView).
  const likedSongsList = useMemo(() => paginatedSongs.filter(s => likedSongIds.has(s.id)), [paginatedSongs, likedSongIds]);

  const content = useMemo(() => {
    if (isLoadingSongs && paginatedSongs.length === 0 && (activeTab === 'accueil')) {
      return <HomeSkeleton />;
    }

    const pageTransition = {
      initial: { opacity: 0, scale: 0.98 },
      animate: { opacity: 1, scale: 1 },
      exit: { opacity: 0, scale: 1.02 },
      transition: { duration: 0.25, ease: "easeOut" as const }
    };

    let View;
    switch (activeTab) {
      case 'recherche': View = <SearchView currentSongId={currentSong?.id} onPlaySong={playSong} />; break;
      case 'biblio': View = (
        <LibraryView
          onPlaySong={playSong}
          likedCount={likedSongIds.size}
          onPlayLiked={() => playCollection(likedSongsList)}
          onOpenPlaylist={(p) => { setSelectedPlaylist(p); setActiveTab('playlist'); }}
          onPlayCollection={playCollection}
        />
      ); break;
      case 'playlist': View = selectedPlaylist ? (
        <PlaylistView
          playlist={selectedPlaylist}
          onPlaySong={(s) => playSong(s)}
          onPlayCollection={playCollection}
          onBack={() => setActiveTab('biblio')}
          currentSongId={currentSong?.id}
        />
      ) : <div>Playlist introuvable</div>; break;
      case 'album': View = selectedAlbum ? (
        <AlbumView
          album={selectedAlbum}
          onPlaySong={(s) => playSong(s)}
          onPlayCollection={playCollection}
          onBack={() => setActiveTab('accueil')}
          currentSongId={currentSong?.id}
        />
      ) : <div>Album introuvable</div>; break;
      case 'liked': View = (
        <div className="py-6 space-y-8 animate-in fade-in duration-500">
          <div className="flex flex-col md:flex-row items-end gap-6 mb-8">
            <div className="w-48 h-48 rounded-[2rem] bg-gradient-to-br from-indigo-600 to-primary flex items-center justify-center shadow-2xl">
              <Heart size={80} fill="white" className="text-white" />
            </div>
            <div className="space-y-2">
              <p className="text-[10px] font-black uppercase tracking-widest text-primary">PLAYLIST</p>
              <h2 className="text-5xl md:text-7xl font-black tracking-tighter">Coups de cœur</h2>
              <div className="flex items-center gap-2 text-sm font-bold text-gray-500">
                <span>{user?.email?.split('@')[0]}</span> • <span>{likedSongsList.length} titres</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4 mb-8">
            <Button onClick={() => playCollection(likedSongsList)} className="w-14 h-14 rounded-full bg-primary hover:scale-105 transition-transform flex items-center justify-center shadow-xl shadow-primary/20">
              <Play fill="white" size={24} className="text-white ml-1" />
            </Button>
          </div>
          <div className="space-y-1">
            {likedSongsList.length > 0 ? likedSongsList.map((song, i) => (
              <AddToPlaylistMenu key={song.id} songId={song.id}>
                <div onClick={() => playSong(song, likedSongsList)} className="group flex items-center p-3 rounded-xl hover:bg-white/5 transition-all cursor-pointer">
                  <span className="w-8 text-xs font-bold text-gray-600 group-hover:text-primary">{i + 1}</span>
                  <img src={song.cover_url} className="w-10 h-10 rounded-lg mr-4 object-cover" alt="" />
                  <div className="flex-1 min-w-0">
                    <p className={cn("font-bold text-sm truncate", currentSong?.id === song.id ? "text-primary" : "text-white")}>{song.title}</p>
                    <p className="text-xs text-gray-500 font-medium truncate">{song.artist_name}</p>
                  </div>
                  <Heart size={16} fill="currentColor" className="text-primary ml-4" />
                </div>
              </AddToPlaylistMenu>
            )) : (
              <div className="py-20 text-center text-gray-500 italic">Aucun coup de cœur pour le moment.</div>
            )}
          </div>
        </div>
      ); break;
      case 'lyrics': View = currentSong ? <LyricsView song={currentSong} /> : <div className="py-20 text-center text-gray-500">Aucun titre en lecture</div>; break;
      case 'queue': View = <QueueView songs={queue} currentSongId={currentSong?.id} onPlaySong={playSong} />; break;
      case 'premium': View = <SubscriptionView onSubscribe={(p) => showSuccess(`Plan ${p} bientôt disponible`)} />; break;
      case 'profil': View = session ? (
        <ProfileView
          publishedSongs={paginatedSongs.filter(s => s.artist_id === user?.id)}
          albums={albums.filter(a => a.artist_id === user?.id)}
          onPublish={refresh} // Refresh songs on publish
          onAddAlbum={fetchData}
        />
      ) : (
        <div className="flex flex-col items-center justify-center h-[60vh] text-center p-8 space-y-4">
          <h2 className="text-xl font-black">Espace Artiste</h2>
          <Button onClick={() => navigate('/login')} className="bg-primary rounded-full px-10 font-black h-12">Se connecter</Button>
        </div>
      ); break;
      default: View = (
        <HomeView
          songs={paginatedSongs}
          playlists={userPlaylists}
          currentSongId={currentSong?.id || ''}
          onPlaySong={playSong}
          onPlayPlaylist={(p) => navigate(`/?playlist=${p.id}`)}
          onOpenAlbum={(a) => navigate(`/?album=${a.id}`)}
          onPlayCollection={playCollection}
          hasMore={hasMore}
          isLoadingMore={isLoadingSongs}
          onLoadMore={loadMore}
        />
      );
    }

    return (
      <motion.div key={activeTab} {...pageTransition} className="h-full">
        {View}
      </motion.div>
    );
  }, [activeTab, isLoadingSongs, paginatedSongs, albums, currentSong, queue, session, user, navigate, playSong, fetchData, likedSongIds, likedSongsList, selectedPlaylist, selectedAlbum, searchParams, userPlaylists, hasMore, loadMore, refresh]);

  return (
    <div className="flex flex-col h-full bg-[#080405] text-white overflow-hidden relative mesh-gradient font-sans">
      <div className="flex flex-1 overflow-hidden p-0 md:p-3 gap-0 md:gap-3 relative z-10 h-full">
        <Sidebar activeTab={activeTab} onTabChange={setActiveTab} likedCount={likedSongIds.size} />

        <main className="flex-1 glass-main md:rounded-3xl overflow-hidden flex flex-col relative border-none md:border border-white/5">
          <header className="flex items-center justify-between px-4 py-3 md:px-8 md:py-6 bg-black/20 backdrop-blur-3xl z-50">
            <div className="flex items-center gap-3 cursor-pointer group" onClick={() => setActiveTab('accueil')}>
              <div className="w-8 h-8 bg-primary rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(214,78,139,0.4)] group-hover:scale-110 transition-transform">
                <Sparkles size={16} className="text-white" />
              </div>
              <h1 className="text-lg font-black tracking-tighter">Mboka<span className="text-primary ml-0.5">Gospel</span></h1>
            </div>

            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" onClick={() => setActiveTab('premium')} className={cn("h-8 text-[10px] font-black gap-2 rounded-full px-4 border transition-all", activeTab === 'premium' ? "bg-primary border-primary text-white" : "bg-white/5 border-white/10 text-gray-400 hover:bg-white/10")}>
                <Crown size={12} fill="currentColor" /> PREMIUM
              </Button>
              {session ? (
                <div className="flex items-center gap-2">
                  <button onClick={() => setActiveTab('profil')} className="w-8 h-8 rounded-full bg-white/10 border border-white/20 flex items-center justify-center hover:bg-white/20 transition-all overflow-hidden">
                    <div className="text-[10px] font-black text-primary">{user?.email?.[0].toUpperCase()}</div>
                  </button>
                  <Button variant="ghost" size="icon" onClick={() => supabase.auth.signOut()} className="h-8 w-8 rounded-full text-gray-500 hover:text-red-400 hover:bg-red-400/10"><LogOut size={14} /></Button>
                </div>
              ) : (
                <Button onClick={() => navigate('/login')} variant="ghost" size="sm" className="h-8 text-[10px] font-black gap-2 rounded-full px-4 border border-white/10 bg-white/5 text-gray-400 hover:bg-white/10"><LogIn size={14} /> CONNEXION</Button>
              )}
            </div>
          </header>

          <div className="flex-1 overflow-y-auto custom-scrollbar px-4 md:px-10 pb-32 md:pb-40">
            <PWAInstallBanner show={isInstallable && isMobile} isIOS={isIOS} onInstall={handleInstall} />
            <AnimatePresence mode="wait">{content}</AnimatePresence>
          </div>
        </main>
      </div>

      {currentSong && (
        <Player
          currentSong={{ ...currentSong, url: currentSong.audio_url, cover: currentSong.cover_url, artist: currentSong.artist_name }}
          isPlaying={isPlaying} progress={progress} isLiked={likedSongIds.has(currentSong.id)}
          isShuffle={isShuffle} repeatMode={repeatMode} onToggleShuffle={toggleShuffle}
          onToggleRepeat={() => setRepeatMode(curr => curr === 'none' ? 'all' : curr === 'all' ? 'one' : 'none')}
          onTogglePlay={togglePlay} onNext={handleSkipNext} onBack={handleSkipBack}
          onToggleLike={toggleLike} onViewChange={setActiveTab} activeView={activeTab}
          onProgressUpdate={setProgress}
        />
      )}
      <MobileNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};

export default Index;