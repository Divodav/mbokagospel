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
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

const mockSongs = [
  { id: 1, title: "Grâce Extraordinaire", artist: "Mahalia Jackson", album: "Chants Sacrés", duration: "3:20", cover: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=100&h=100&fit=crop" },
  { id: 2, title: "Comme Tu Es Grand", artist: "The Clark Sisters", album: "En Direct de Détroit", duration: "4:15", cover: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=100&h=100&fit=crop" },
  { id: 3, title: "Seigneur Précieux", artist: "Kirk Franklin", album: "La Promesse", duration: "3:45", cover: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=100&h=100&fit=crop" },
  { id: 4, title: "Je Peux Seulement Imaginer", artist: "MercyMe", album: "Presque Là", duration: "4:02", cover: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=100&h=100&fit=crop" },
  { id: 5, title: "Chant de Révélation", artist: "Kari Jobe", album: "La Bénédiction", duration: "5:10", cover: "https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=100&h=100&fit=crop" },
  { id: 6, title: "Quel Beau Nom", artist: "Hillsong Worship", album: "Que La Lumière Soit", duration: "4:35", cover: "https://images.unsplash.com/photo-1494232410401-ad00d5433cfa?w=100&h=100&fit=crop" },
];

const mockPlaylists = [
  { id: 1, name: "Adoration du Dimanche", songCount: 24, cover: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&h=400&fit=crop" },
  { id: 2, name: "Classiques du Gospel", songCount: 42, cover: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&h=400&fit=crop" },
  { id: 3, name: "Louanges Contemporaines", songCount: 36, cover: "https://images.unsplash.com/photo-1507838153414-b4b713384a76?w=400&h=400&fit=crop" },
  { id: 4, name: "Dévotion du Matin", songCount: 18, cover: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop" },
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
  };

  return (
    <div className="flex flex-col h-screen bg-black text-white font-sans overflow-hidden">
      {/* Container Principal */}
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
              <button className="flex items-center gap-3 hover:text-white transition-colors font-bold text-sm">
                <Library size={24} />
                <span>Votre bibliothèque</span>
              </button>
              <button className="hover:text-white transition-colors">
                <PlusCircle size={20} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto px-2 pb-4">
              <div className="space-y-1">
                {mockPlaylists.map(p => (
                  <button key={p.id} className="w-full flex items-center gap-3 p-2 rounded-md hover:bg-white/5 transition-colors group">
                    <img src={p.cover} alt="" className="w-12 h-12 rounded-md object-cover" />
                    <div className="text-left">
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
          <header className="sticky top-0 z-10 flex items-center justify-between p-4 bg-transparent backdrop-blur-md">
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
              <Button size="sm" className="rounded-full bg-white text-black font-bold h-8 px-4 text-xs">
                S'abonner
              </Button>
              <Button size="icon" variant="ghost" className="rounded-full bg-black/40 h-8 w-8">
                <User size={18} />
              </Button>
            </div>
          </header>

          <div className="px-4 md:px-6 pb-40 md:pb-24">
            <section className="mt-4 mb-8">
              <h2 className="text-2xl font-bold mb-4 tracking-tight">Bonjour</h2>
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                {mockPlaylists.slice(0, 6).map(p => (
                  <div key={p.id} className="group flex items-center bg-white/5 hover:bg-white/10 rounded overflow-hidden transition-all cursor-pointer relative">
                    <img src={p.cover} alt="" className="w-14 h-14 md:w-20 md:h-20 shadow-2xl" />
                    <span className="font-bold px-3 md:px-4 truncate text-sm md:text-base">{p.name}</span>
                    <Button 
                      size="icon" 
                      className="absolute right-4 bg-green-500 hover:bg-green-400 text-black shadow-xl opacity-0 md:group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all rounded-full hidden md:flex"
                    >
                      <Play fill="black" size={20} />
                    </Button>
                  </div>
                ))}
              </div>
            </section>

            <section className="mb-10">
              <div className="flex items-end justify-between mb-4">
                <h2 className="text-xl md:text-2xl font-bold tracking-tight">Pour vous</h2>
                <button className="text-xs font-bold text-gray-400 hover:underline">Tout afficher</button>
              </div>
              <div className="space-y-1">
                {mockSongs.map((song, i) => (
                  <div 
                    key={song.id} 
                    className={cn(
                      "group flex items-center p-2 rounded-md transition-colors cursor-pointer active:bg-white/10",
                      currentSong.id === song.id ? "bg-white/5" : "hover:bg-white/5"
                    )}
                    onClick={() => playSong(song)}
                  >
                    <div className="w-6 text-center mr-3 hidden md:block">
                      <span className={cn("text-sm", currentSong.id === song.id ? "text-green-500" : "text-gray-400")}>{i + 1}</span>
                    </div>
                    
                    <img src={song.cover} alt="" className="w-12 h-12 rounded mr-3 shadow-lg" />
                    
                    <div className="flex-1 min-w-0">
                      <p className={cn("text-sm font-medium truncate", currentSong.id === song.id ? "text-green-500" : "text-white")}>{song.title}</p>
                      <p className="text-xs text-gray-400 truncate">{song.artist}</p>
                    </div>

                    <div className="flex items-center gap-4 ml-auto">
                      <Heart size={16} className={cn("text-gray-400", currentSong.id === song.id && "text-green-500")} />
                      <span className="text-xs text-gray-400 hidden md:block w-10 text-right">{song.duration}</span>
                      <MoreHorizontal size={16} className="text-gray-400 md:opacity-0 md:group-hover:opacity-100" />
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <MadeWithDyad />
          </div>
        </main>
      </div>

      {/* Footer Player Adaptatif */}
      <footer className="fixed bottom-16 md:bottom-0 left-0 right-0 h-20 md:h-24 bg-black border-t border-white/5 flex flex-col justify-center px-4 z-40">
        <div className="flex items-center justify-between max-w-[1800px] mx-auto w-full">
          {/* Infos Morceau */}
          <div className="flex items-center md:w-[30%] min-w-0 flex-1">
            <img src={currentSong.cover} alt="" className="w-12 h-12 md:w-14 md:h-14 rounded-md shadow-lg mr-3 md:mr-4" />
            <div className="min-w-0">
              <h4 className="text-sm font-semibold text-white truncate">{currentSong.title}</h4>
              <p className="text-xs text-gray-400 truncate">{currentSong.artist}</p>
            </div>
            <button className="ml-4 text-gray-400 hover:text-white hidden sm:block">
              <Heart size={18} />
            </button>
          </div>

          {/* Contrôles Lecture - Desktop et Mobile */}
          <div className="flex flex-col items-center flex-1 md:max-w-[45%] w-full gap-2 px-4">
            <div className="flex items-center gap-4 md:gap-6">
              <button className="text-gray-400 hover:text-white hidden md:block">
                <SkipBack size={20} fill="currentColor" />
              </button>
              <button 
                onClick={togglePlay}
                className="w-10 h-10 md:w-8 md:h-8 rounded-full bg-white flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-lg"
              >
                {isPlaying ? <Pause size={18} fill="black" className="text-black" /> : <Play size={18} fill="black" className="text-black translate-x-[1px]" />}
              </button>
              <button className="text-gray-400 hover:text-white">
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

          {/* Contrôles Volume/Options Desktop */}
          <div className="hidden md:flex items-center justify-end w-[30%] gap-4 text-gray-400">
            <button className="hover:text-white transition-colors"><ListMusic size={18} /></button>
            <div className="flex items-center gap-2 w-24">
              <Volume2 size={18} />
              <div className="flex-1 h-1 bg-white/10 rounded-full">
                <div className="h-full bg-white w-[70%]"></div>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Navigation Basse Mobile */}
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