"use client";

import { useState, useEffect } from "react";
import { 
  Play, Pause, SkipBack, SkipForward, Volume2, Heart, 
  Search, Home, Library, User, 
  ChevronLeft, ChevronRight, ListMusic, PlusCircle,
  Mic2, Share2, MessageSquare
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { MadeWithDyad } from "@/components/made-with-dyad";
import { MobileNav } from "@/components/MobileNav";
import { HomeView } from "@/components/HomeView";
import { SearchView } from "@/components/SearchView";
import { LyricsView } from "@/components/LyricsView";
import { QueueView } from "@/components/QueueView";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { showSuccess } from "@/utils/toast";

const mockSongs = [
  { id: 1, title: "Ebibi", artist: "Moise Mbiye", album: "Héros", duration: "5:12", cover: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300&h=300&fit=crop" },
  { id: 2, title: "Saint Esprit", artist: "Dena Mwana", album: "Célébration", duration: "6:45", cover: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop" },
  { id: 3, title: "Ma Consolation", artist: "Mike Kalambay", album: "Mon Avocat", duration: "4:30", cover: "https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=300&h=300&fit=crop" },
  { id: 4, title: "We Testify", artist: "Deborah Lukalu", album: "Call Me Favourite", duration: "7:10", cover: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&h=300&fit=crop" },
  { id: 5, title: "Emmanuel", artist: "Lord Lombo", album: "Atmosphère", duration: "5:50", cover: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=300&h=300&fit=crop" },
  { id: 6, title: "Je T'adore", artist: "Gael Music", album: "Sublime", duration: "8:20", cover: "https://images.unsplash.com/photo-1459749411177-042180ce673c?w=300&h=300&fit=crop" },
];

const mockPlaylists = [
  { id: 1, name: "Adoration & Prière", songCount: 45, cover: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&h=400&fit=crop" },
  { id: 2, name: "Louange de Feu", songCount: 32, cover: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&h=400&fit=crop" },
  { id: 3, name: "Best of Rumba Gospel", songCount: 28, cover: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=400&h=400&fit=crop" },
];

const Index = () => {
  const [currentSong, setCurrentSong] = useState(mockSongs[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(30);
  const [activeTab, setActiveTab] = useState('accueil');
  const [likedSongs, setLikedSongs] = useState<number[]>([]);
  const isMobile = useIsMobile();

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      interval = setInterval(() => {
        setProgress(prev => (prev >= 100 ? 0 : prev + 0.1));
      }, 100);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  const togglePlay = () => setIsPlaying(!isPlaying);

  const playSong = (song: any) => {
    setCurrentSong(song);
    setIsPlaying(true);
    setProgress(0);
    if (activeTab === 'lyrics' || activeTab === 'queue') {
      // Garder la vue actuelle lors du changement de chanson
    } else if (isMobile) {
      showSuccess(`Lecture : ${song.title}`);
    }
  };

  const handleSkipNext = () => {
    const currentIndex = mockSongs.findIndex(s => s.id === currentSong.id);
    const nextSong = mockSongs[(currentIndex + 1) % mockSongs.length];
    playSong(nextSong);
  };

  const handleSkipBack = () => {
    const currentIndex = mockSongs.findIndex(s => s.id === currentSong.id);
    const prevSong = mockSongs[(currentIndex - 1 + mockSongs.length) % mockSongs.length];
    playSong(prevSong);
  };

  const toggleLike = (id: number) => {
    if (likedSongs.includes(id)) {
      setLikedSongs(likedSongs.filter(sId => sId !== id));
      showSuccess("Retiré de vos favoris");
    } else {
      setLikedSongs([...likedSongs, id]);
      showSuccess("Ajouté à vos favoris");
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'recherche':
        return <SearchView songs={mockSongs} currentSongId={currentSong.id} onPlaySong={playSong} />;
      case 'lyrics':
        return <LyricsView song={currentSong} />;
      case 'queue':
        return <QueueView songs={mockSongs} currentSongId={currentSong.id} onPlaySong={playSong} />;
      case 'biblio':
        const favoriteSongs = mockSongs.filter(s => likedSongs.includes(s.id));
        return (
          <div className="py-6 space-y-8 animate-in fade-in duration-300">
            <header className="flex items-center justify-between">
              <h2 className="text-3xl font-bold tracking-tight">Votre bibliothèque</h2>
              <Button size="icon" variant="ghost" className="rounded-full"><PlusCircle /></Button>
            </header>
            
            <section>
              <h3 className="text-xl font-bold mb-4">Titres likés ({favoriteSongs.length})</h3>
              {favoriteSongs.length > 0 ? (
                <div className="space-y-1">
                  {favoriteSongs.map((song) => (
                    <div 
                      key={song.id} 
                      className="group flex items-center p-2 rounded-md hover:bg-white/5 cursor-pointer"
                      onClick={() => playSong(song)}
                    >
                      <img src={song.cover} alt="" className="w-12 h-12 rounded mr-3 object-cover" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">{song.title}</p>
                        <p className="text-xs text-gray-400">{song.artist}</p>
                      </div>
                      <Heart size={16} fill="#22c55e" className="text-[#22c55e]" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-white/5 rounded-xl border border-dashed border-white/10">
                  <Heart size={40} className="mx-auto mb-4 opacity-20" />
                  <p className="text-sm text-gray-400">Vos titres favoris s'afficheront ici.</p>
                </div>
              )}
            </section>
          </div>
        );
      default:
        return <HomeView songs={mockSongs} playlists={mockPlaylists} currentSongId={currentSong.id} onPlaySong={playSong} onPlayPlaylist={(p) => showSuccess(`Ouverture : ${p.name}`)} />;
    }
  };

  return (
    <div className="flex flex-col h-screen bg-black text-white font-sans overflow-hidden">
      <div className="flex flex-1 overflow-hidden md:p-2 gap-2">
        {/* Sidebar Desktop */}
        <aside className="hidden md:flex flex-col w-[280px] gap-2">
          <div className="bg-[#121212] rounded-lg p-4 space-y-4">
            <h1 className="text-xl font-black px-2 mb-4 tracking-tighter text-white">Mboka Gospel</h1>
            <nav className="space-y-1">
              <NavItem icon={<Home size={24} />} label="Accueil" active={activeTab === 'accueil'} onClick={() => setActiveTab('accueil')} />
              <NavItem icon={<Search size={24} />} label="Rechercher" active={activeTab === 'recherche'} onClick={() => setActiveTab('recherche')} />
            </nav>
          </div>

          <div className="flex-1 bg-[#121212] rounded-lg overflow-hidden flex flex-col">
            <div className="p-4 flex items-center justify-between text-gray-400">
              <button onClick={() => setActiveTab('biblio')} className="flex items-center gap-3 hover:text-white transition-colors font-bold text-sm">
                <Library size={24} />
                <span>Votre bibliothèque</span>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-2">
              <div 
                className="p-4 bg-gradient-to-br from-indigo-700 to-indigo-900 rounded-lg mb-4 cursor-pointer hover:scale-[1.02] transition-transform shadow-lg"
                onClick={() => setActiveTab('biblio')}
              >
                <p className="text-sm font-bold mb-1">Titres likés</p>
                <p className="text-xs text-indigo-200">{likedSongs.length} titres</p>
              </div>
            </div>
          </div>
        </aside>

        {/* Zone de Contenu */}
        <main className="flex-1 bg-gradient-to-b from-[#1e1e1e] to-[#121212] md:rounded-lg overflow-y-auto relative">
          <header className="sticky top-0 z-10 flex items-center justify-between p-4 bg-[#1e1e1e]/80 backdrop-blur-md">
            <div className="flex gap-2">
              <h1 className="md:hidden text-lg font-bold tracking-tight">Mboka Gospel</h1>
              <div className="hidden md:flex gap-2">
                <Button onClick={() => setActiveTab('accueil')} size="icon" variant="ghost" className="rounded-full bg-black/40 h-8 w-8"><ChevronLeft size={20} /></Button>
                <Button size="icon" variant="ghost" className="rounded-full bg-black/40 h-8 w-8 opacity-50"><ChevronRight size={20} /></Button>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button size="sm" className="rounded-full bg-white text-black font-bold h-8 px-4 text-xs hover:scale-105 transition-transform">S'abonner</Button>
              <Button onClick={() => showSuccess("Profil")} size="icon" variant="ghost" className="rounded-full bg-black/40 h-8 w-8"><User size={18} /></Button>
            </div>
          </header>

          <div className="px-4 md:px-6 pb-40 md:pb-24 max-w-6xl mx-auto">
            {renderContent()}
            <MadeWithDyad />
          </div>
        </main>
      </div>

      {/* Footer Player */}
      <footer className="fixed bottom-16 md:bottom-0 left-0 right-0 h-20 md:h-24 bg-black border-t border-white/5 flex flex-col justify-center px-4 z-40">
        <div className="flex items-center justify-between max-w-[1800px] mx-auto w-full">
          {/* Infos Morceau */}
          <div className="flex items-center md:w-[30%] min-w-0 flex-1">
            <img 
              onClick={() => setActiveTab('lyrics')}
              src={currentSong.cover} 
              alt="" 
              className="w-12 h-12 md:w-14 md:h-14 rounded-md shadow-lg mr-3 md:mr-4 object-cover cursor-pointer hover:opacity-80 transition-opacity" 
            />
            <div className="min-w-0">
              <h4 className="text-sm font-semibold text-white truncate hover:underline cursor-pointer">{currentSong.title}</h4>
              <p className="text-xs text-gray-400 truncate hover:text-white cursor-pointer">{currentSong.artist}</p>
            </div>
            <button 
              onClick={() => toggleLike(currentSong.id)} 
              className={cn("ml-4 transition-colors", likedSongs.includes(currentSong.id) ? "text-green-500" : "text-gray-400 hover:text-white")}
            >
              <Heart size={18} fill={likedSongs.includes(currentSong.id) ? "currentColor" : "none"} />
            </button>
          </div>

          {/* Contrôles Lecture */}
          <div className="flex flex-col items-center flex-1 md:max-w-[45%] w-full gap-2 px-4">
            <div className="flex items-center gap-4 md:gap-6">
              <button onClick={handleSkipBack} className="text-gray-400 hover:text-white transition-colors"><SkipBack size={20} fill="currentColor" /></button>
              <button 
                onClick={togglePlay}
                className="w-10 h-10 md:w-10 md:h-10 rounded-full bg-white flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-lg"
              >
                {isPlaying ? <Pause size={20} fill="black" className="text-black" /> : <Play size={20} fill="black" className="text-black translate-x-[1px]" />}
              </button>
              <button onClick={handleSkipNext} className="text-gray-400 hover:text-white transition-colors"><SkipForward size={20} fill="currentColor" /></button>
            </div>
            
            <div className="w-full hidden md:flex items-center gap-2 max-w-[600px]">
              <span className="text-[10px] text-gray-400 font-medium">1:24</span>
              <div className="flex-1 h-1 bg-white/10 rounded-full group cursor-pointer relative overflow-hidden">
                <div className="h-full bg-white group-hover:bg-green-500 rounded-full transition-colors" style={{ width: `${progress}%` }}></div>
              </div>
              <span className="text-[10px] text-gray-400 font-medium">{currentSong.duration}</span>
            </div>
          </div>

          {/* Contrôles Additionnels Desktop */}
          <div className="hidden md:flex items-center justify-end md:w-[30%] gap-4 text-gray-400">
            <button onClick={() => setActiveTab('lyrics')} className={cn("hover:text-white transition-colors", activeTab === 'lyrics' && "text-green-500")} title="Paroles"><Mic2 size={18} /></button>
            <button onClick={() => setActiveTab('queue')} className={cn("hover:text-white transition-colors", activeTab === 'queue' && "text-green-500")} title="File d'attente"><ListMusic size={18} /></button>
            <button onClick={() => showSuccess("Option de partage")} title="Partager"><Share2 size={18} /></button>
            <div className="flex items-center gap-2 w-24">
              <Volume2 size={18} />
              <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-white w-[70%] group-hover:bg-green-500"></div>
              </div>
            </div>
          </div>
        </div>
      </footer>

      <MobileNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};

const NavItem = ({ icon, label, active = false, onClick }: { icon: React.ReactNode, label: string, active?: boolean, onClick: () => void }) => (
  <button 
    onClick={onClick}
    className={cn(
      "w-full flex items-center gap-4 px-3 py-2.5 rounded-md transition-all font-bold text-sm",
      active ? "text-white bg-white/5" : "text-gray-400 hover:text-white"
    )}
  >
    {icon}
    <span>{label}</span>
  </button>
);

export default Index;