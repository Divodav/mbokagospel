"use client";

import { useRef, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { 
  Play, Pause, SkipBack, SkipForward, Volume2, Heart, 
  ListMusic, Mic2, Shuffle, Repeat 
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

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.load();
    if (isPlaying) audio.play().catch(() => {});
  }, [currentSong.url]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) audio.play().catch(() => {});
    else audio.pause();
  }, [isPlaying]);

  const handleTimeUpdate = () => {
    if (audioRef.current && onProgressUpdate) {
      const current = audioRef.current.currentTime;
      const duration = audioRef.current.duration;
      setCurrentTime(current);
      if (duration) onProgressUpdate((current / duration) * 100);
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <footer className="fixed bottom-20 md:bottom-0 left-0 right-0 h-20 md:h-20 z-50 px-2 md:px-4 pointer-events-none">
      <audio 
        ref={audioRef} 
        src={currentSong.url} 
        onTimeUpdate={handleTimeUpdate}
        onEnded={onNext}
        onError={() => showError("Audio introuvable.")}
      />

      <motion.div 
        initial={{ y: 50 }}
        animate={{ y: 0 }}
        className="max-w-6xl mx-auto h-full glass-main rounded-2xl border-white/10 flex items-center px-4 pointer-events-auto shadow-2xl"
      >
        <div className="flex items-center justify-between w-full gap-4">
          
          {/* Infos */}
          <div className="flex items-center md:w-[25%] min-w-0">
            <div className="relative w-11 h-11 rounded-lg overflow-hidden mr-3 shrink-0">
              <img src={currentSong.cover} alt="" className="w-full h-full object-cover" />
            </div>
            <div className="min-w-0">
              <h4 className="text-[13px] font-bold text-white truncate">{currentSong.title}</h4>
              <p className="text-[11px] text-gray-500 truncate">{currentSong.artist}</p>
            </div>
            <button onClick={onToggleLike} className={cn("ml-3 shrink-0", isLiked ? "text-primary" : "text-gray-600 hover:text-white")}>
              <Heart size={16} fill={isLiked ? "currentColor" : "none"} />
            </button>
          </div>

          {/* Contrôles */}
          <div className="flex flex-col items-center flex-1 max-w-[50%]">
            <div className="flex items-center gap-4 mb-1">
              <button className="text-gray-600 hover:text-white hidden md:block"><Shuffle size={14} /></button>
              <button onClick={onBack} className="text-gray-400 hover:text-white"><SkipBack size={18} fill="currentColor" /></button>
              <button onClick={onTogglePlay} className="w-8 h-8 rounded-full bg-white flex items-center justify-center hover:scale-105 transition-transform">
                {isPlaying ? <Pause size={16} className="text-black" fill="black" /> : <Play size={16} className="text-black fill-black translate-x-[1px]" />}
              </button>
              <button onClick={onNext} className="text-gray-400 hover:text-white"><SkipForward size={18} fill="currentColor" /></button>
              <button className="text-gray-600 hover:text-white hidden md:block"><Repeat size={14} /></button>
            </div>
            
            <div className="w-full hidden md:flex items-center gap-3">
              <span className="text-[9px] text-gray-500 tabular-nums">{formatTime(currentTime)}</span>
              <div className="flex-1 h-1 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-primary" style={{ width: `${progress}%` }} />
              </div>
              <span className="text-[9px] text-gray-500 tabular-nums">{currentSong.duration}</span>
            </div>
          </div>

          {/* Outils */}
          <div className="hidden md:flex items-center justify-end md:w-[25%] gap-4">
            <button onClick={() => onViewChange('lyrics')} className={cn(activeView === 'lyrics' ? "text-primary" : "text-gray-500 hover:text-white")}>
              <Mic2 size={16} />
            </button>
            <button onClick={() => onViewChange('queue')} className={cn(activeView === 'queue' ? "text-primary" : "text-gray-500 hover:text-white")}>
              <ListMusic size={16} />
            </button>
            <div className="flex items-center gap-2 w-24">
              <Volume2 size={16} className="text-gray-500" />
              <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-gray-500 w-[70%]" />
              </div>
            </div>
          </div>

        </div>
      </motion.div>
    </footer>
  );
};