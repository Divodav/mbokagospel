"use client";

import { useState, useEffect } from "react";
import { 
  Play, Pause, SkipBack, SkipForward, Volume2, Heart, 
  MoreHorizontal, Search, Home, Library, User, 
  ChevronLeft, ChevronRight, ListMusic, PlusCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { MadeWithDyad } from "@/components/made-with-dyad";
import { MobileNav } from "@/components/MobileNav";
import { HomeView } from "@/components/HomeView";
import { SearchView } from "@/components/SearchView";
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
  { id: 4, name: "Gospel Urbain 2024", songCount: 50, cover: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop" },
];

const Index = () => {
  const [currentSong, setCurrentSong] = useState(mockSongs[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(30);
  const [activeTab, setActiveTab] = useState('accueil');
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
    if (isMobile) {
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

  const handleSubscribe = () => {
    showSuccess("Demande d'abonnement envoyée !");
  };

  const handlePlaylistClick = (playlist: any) => {
    showSuccess(`Ouverture de la playlist : ${playlist.name}`);
    // Simuler le lancement du premier titre
    playSong(mockSongs[0]);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'recherche':
        return <SearchView songs={mockSongs} currentSongId={currentSong.id} onPlaySong={playSong} />;
      case 'biblio':
        return (
          <div className="py-8 text-center text-gray-400">
            <Library size={48} className="mx-auto mb-4 opacity-20" />
            <h3 className="text-xl font-bold text-white mb-2">Votre bibliothèque est vide</h3>
            <p className="text-sm">Commencez à suivre des artistes ou des playlists.</p>
          </div>
        );
      default:
        return <HomeView songs={mockSongs} playlists={mockPlaylists} currentSongId={currentSong.id} onPlaySong={playSong} onPlayPlaylist={handlePlaylistClick} />;
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
              <button onClick={() => showSuccess("Création d'une nouvelle playlist")} className="hover:text-white transition-colors">
                <PlusCircle size={20} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto px-2 pb-4">
              <div className="space-y-1">
                {mockPlaylists.map(p => (
                  <button 
                    key={p.id} 
                    onClick={() => handlePlaylistClick(p)}
                    className="w-full flex items-center gap-3 p-2 rounded-md hover:bg-white/5 transition-colors group text-left"
                  >
                    <img src={p.cover} alt="" className="w-12 h-12 rounded-md object-cover shadow-lg" />
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-white truncate">{p.name}</p>
                      <p className="text-xs text-gray-400">Playlist • {p.songCount} titres</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* Zone de Contenu */}
        <main className="flex-1 bg-gradient-to-b from-[#1e1e1e] to-[#121212] md:rounded-lg overflow-y-auto relative scroll-smooth">
          <header className="sticky top-0 z-10 flex items-center justify-between p-4 bg-[#1e1e1e]/50 backdrop-blur-md">
            <div className="flex gap-2">
              <h1 className="md:hidden text-lg font-bold tracking-tight">Mboka Gospel</h1>
              <div className="hidden md:flex gap-2">
                <Button size="icon" variant="ghost" className="rounded-full bg-black/40 h-8 w-8">
                  <ChevronLeft size={20} />
                </Button>
                <Button size="icon" variant="ghost" className="rounded-full bg-black/40 h-8 w-8">
                  <ChevronRight size={20} />
                </Button>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button onClick={handleSubscribe} size="sm" className="rounded-full bg-white text-black font-bold h-8 px-4 text-xs hover:scale-105 transition-transform">
                S'abonner
              </Button>
              <Button onClick={() => showSuccess("Profil utilisateur")} size="icon" variant="ghost" className="rounded-full bg-black/40 h-8 w-8">
                <User size={18} />
              </Button>
            </div>
          </header>

          <div className="px-4 md:px-6 pb-40 md:pb-24">
            {renderContent()}
            <MadeWithDyad />
          </div>
        </main>
      </div>

      {/* Footer Player Adaptatif */}
      <footer className="fixed bottom-16 md:bottom-0 left-0 right-0 h-20 md:h-24 bg-black border-t border-white/5 flex flex-col justify-center px-4 z-40">
        <div className="flex items-center justify-between max-w-[1800px] mx-auto w-full">
          {/* Infos Morceau */}
          <div className="flex items-center md:w-[30%] min-w-0 flex-1">
            <img src={currentSong.cover} alt="" className="w-12 h-12 md:w-14 md:h-14 rounded-md shadow-lg mr-3 md:mr-4 object-cover" />
            <div className="min-w-0">
              <h4 className="text-sm font-semibold text-white truncate">{currentSong.title}</h4>
              <p className="text-xs text-gray-400 truncate">{currentSong.artist}</p>
            </div>
            <button onClick={() => showSuccess("Ajouté aux favoris")} className="ml-4 text-gray-400 hover:text-white hidden sm:block">
              <Heart size={18} />
            </button>
          </div>

          {/* Contrôles Lecture */}
          <div className="flex flex-col items-center flex-1 md:max-w-[45%] w-full gap-2 px-4">
            <div className="flex items-center gap-4 md:gap-6">
              <button onClick={handleSkipBack} className="text-gray-400 hover:text-white hidden md:block transition-colors">
                <SkipBack size={20} fill="currentColor" />
              </button>
              <button 
                onClick={togglePlay}
                className="w-10 h-10 md:w-8 md:h-8 rounded-full bg-white flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-lg"
              >
                {isPlaying ? <Pause size={18} fill="black" className="text-black" /> : <Play size={18} fill="black" className="text-black translate-x-[1px]" />}
              </button>
              <button onClick={handleSkipNext} className="text-gray-400 hover:text-white transition-colors">
                <SkipForward size={20} fill="currentColor" />
              </button>
            </div>
            
            <div className="w-full hidden md:flex items-center gap-2 max-w-[600px]">
              <span className="text-[10px] text-gray-400 font-medium">1:24</span>
              <div className="flex-1 h-1 bg-white/10 rounded-full group cursor-pointer relative overflow-hidden">
                <div className="h-full bg-white group-hover:bg-green-500 rounded-full" style={{ width: `${progress}%` }}></div>
              </div>
              <span className="text-[10px] text-gray-400 font-medium">{currentSong.duration}</span>
            </div>
          </div>

          {/* Contrôles Volume Desktop */}
          <div className="hidden md:flex items-center justify-end w-[30%] gap-4 text-gray-400">
            <button onClick={() => showSuccess("File d'attente")} className="hover:text-white transition-colors"><ListMusic size={18} /></button>
            <div className="flex items-center gap-2 w-24">
              <Volume2 size={18} />
              <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-white w-[70%]"></div>
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