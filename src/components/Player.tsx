"use client";

import { useRef, useEffect, useState } from "react";
import { 
  Play, Pause, SkipBack, SkipForward, Volume2, Heart, 
  ListMusic, Mic2, Share2, Repeat, Shuffle 
} from "lucide-react";
import { cn } from "@/lib/utils";
import { showError } from "@/utils/toast";

interface PlayerProps {
  currentSong: any;
  isPlaying: boolean;
  progress: number;
  isLiked: boolean;
  onTogglePlay: () => void;
  onNext: () => void;
  onBack: () => void;
  onToggleLike: () => void;
  onViewChange: (view: string) => void;
  activeView: string;
  onProgressUpdate?: (progress: number) => void;
}

export const Player = ({ 
  currentSong, isPlaying, progress, isLiked, 
  onTogglePlay, onNext, onBack, onToggleLike,
  onViewChange, activeView, onProgressUpdate
}: PlayerProps) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [currentTime, setCurrentTime] = useState(0);

  // Gestion du changement de morceau
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    // On force le rechargement quand l'URL change
    audio.load();
    
    if (isPlaying) {
      audio.play().catch(err => {
        console.warn("Lecture bloquée par le navigateur. Cliquez sur Play pour démarrer.", err);
      });
    }
  }, [currentSong.url]);

  // Gestion de l'état Lecture/Pause
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.play().catch(() => {});
    } else {
      audio.pause();
    }
  }, [isPlaying]);

  const handleTimeUpdate = () => {
    if (audioRef.current && onProgressUpdate) {
      const current = audioRef.current.currentTime;
      const duration = audioRef.current.duration;
      setCurrentTime(current);
      if (duration) {
        onProgressUpdate((current / duration) * 100);
      }
    }
  };

  const handleAudioError = (e: any) => {
    console.error("Audio Error:", e);
    // On n'affiche l'erreur que si une source est réellement définie
    if (currentSong.url) {
      showError("Impossible de lire ce fichier. Vérifiez qu'il est bien présent dans le dossier public.");
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <footer className="fixed bottom-16 md:bottom-0 left-0 right-0 h-20 md:h-24 bg-black/95 backdrop-blur-2xl border-t border-white/5 flex items-center px-4 z-50">
      <audio 
        ref={audioRef} 
        src={currentSong.url} 
        onTimeUpdate={handleTimeUpdate}
        onEnded={onNext}
        onError={handleAudioError}
        preload="auto"
      />

      <div className="flex items-center justify-between max-w-[1800px] mx-auto w-full">
        
        {/* Infos Titre */}
        <div className="flex items-center md:w-[30%] min-w-0">
          <div className="relative group cursor-pointer overflow-hidden rounded-md mr-4 shadow-2xl" onClick={() => onViewChange('lyrics')}>
            <img src={currentSong.cover} alt="" className="w-12 h-12 md:w-14 md:h-14 object-cover group-hover:scale-110 transition-transform duration-500" />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
              <Mic2 size={16} className="text-white" />
            </div>
          </div>
          <div className="min-w-0">
            <h4 className="text-sm font-bold text-white truncate hover:underline cursor-pointer">{currentSong.title}</h4>
            <p className="text-xs text-gray-400 truncate hover:text-white cursor-pointer">{currentSong.artist}</p>
          </div>
          <button 
            onClick={onToggleLike}
            className={cn("ml-4 transition-all hover:scale-110", isLiked ? "text-primary" : "text-gray-500 hover:text-white")}
          >
            <Heart size={18} fill={isLiked ? "currentColor" : "none"} />
          </button>
        </div>

        {/* Contrôles Principaux */}
        <div className="flex flex-col items-center flex-1 md:max-w-[40%] px-4">
          <div className="flex items-center gap-4 md:gap-8 mb-2">
            <button className="text-gray-500 hover:text-primary transition-colors hidden md:block"><Shuffle size={16} /></button>
            <button onClick={onBack} className="text-gray-300 hover:text-white transition-all active:scale-90"><SkipBack size={20} fill="currentColor" /></button>
            <button 
              onClick={onTogglePlay}
              className="w-10 h-10 rounded-full bg-white flex items-center justify-center hover:scale-110 active:scale-95 transition-all shadow-xl"
            >
              {isPlaying ? <Pause size={20} className="text-black" fill="black" /> : <Play size={20} className="text-black fill-black translate-x-[1px]" />}
            </button>
            <button onClick={onNext} className="text-gray-300 hover:text-white transition-all active:scale-90"><SkipForward size={20} fill="currentColor" /></button>
            <button className="text-gray-500 hover:text-primary transition-colors hidden md:block"><Repeat size={16} /></button>
          </div>
          
          <div className="w-full hidden md:flex items-center gap-3">
            <span className="text-[10px] text-gray-500 font-bold tabular-nums">
              {formatTime(currentTime)}
            </span>
            <div className="flex-1 h-1 bg-white/10 rounded-full group cursor-pointer relative overflow-hidden">
              <div 
                className="h-full bg-white group-hover:bg-primary rounded-full transition-all duration-150" 
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <span className="text-[10px] text-gray-500 font-bold tabular-nums">{currentSong.duration}</span>
          </div>
        </div>

        {/* Outils & Volume */}
        <div className="hidden md:flex items-center justify-end md:w-[30%] gap-4 text-gray-400">
          <button 
            onClick={() => onViewChange('lyrics')} 
            className={cn("hover:text-white transition-colors", activeView === 'lyrics' && "text-primary")}
          >
            <Mic2 size={18} />
          </button>
          <button 
            onClick={() => onViewChange('queue')} 
            className={cn("hover:text-white transition-colors", activeView === 'queue' && "text-primary")}
          >
            <ListMusic size={18} />
          </button>
          <div className="flex items-center gap-2 group w-28">
            <Volume2 size={18} className="group-hover:text-white transition-colors" />
            <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden cursor-pointer">
              <div 
                className="h-full bg-white/60 group-hover:bg-primary transition-colors"
                style={{ width: '70%' }}
              ></div>
            </div>
          </div>
          <button className="hover:text-white transition-colors"><Share2 size={18} /></button>
        </div>
      </div>
    </footer>
  );
};