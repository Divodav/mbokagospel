"use client";

import { useRef, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
    <footer className="fixed bottom-24 md:bottom-0 left-0 right-0 h-24 md:h-28 z-50 px-4 md:px-8 pointer-events-none">
      <audio 
        ref={audioRef} 
        src={currentSong.url} 
        onTimeUpdate={handleTimeUpdate}
        onEnded={onNext}
        onError={() => showError("Fichier audio introuvable.")}
      />

      <motion.div 
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        className="max-w-7xl mx-auto h-full glass-main rounded-[2.5rem] border-white/10 flex items-center px-6 md:px-10 pointer-events-auto shadow-2xl"
      >
        <div className="flex items-center justify-between w-full gap-4 md:gap-10">
          
          {/* Infos Musique */}
          <div className="flex items-center md:w-[30%] min-w-0">
            <motion.div 
              whileHover={{ scale: 1.1, rotate: 5 }}
              onClick={() => onViewChange('lyrics')}
              className="relative w-14 h-14 md:w-16 md:h-16 rounded-2xl overflow-hidden shadow-xl cursor-pointer mr-4 shrink-0"
            >
              <img src={currentSong.cover} alt="" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                <Mic2 size={20} className="text-white" />
              </div>
            </motion.div>
            <div className="min-w-0">
              <h4 className="text-sm md:text-base font-black text-white truncate hover:text-primary transition-colors cursor-pointer">{currentSong.title}</h4>
              <p className="text-xs text-white/40 truncate font-bold uppercase tracking-tighter">{currentSong.artist}</p>
            </div>
            <motion.button 
              whileTap={{ scale: 1.5 }}
              onClick={onToggleLike}
              className={cn("ml-4 transition-colors", isLiked ? "text-primary" : "text-white/20 hover:text-white")}
            >
              <Heart size={20} fill={isLiked ? "currentColor" : "none"} />
            </motion.button>
          </div>

          {/* Contrôles Centraux */}
          <div className="flex flex-col items-center flex-1 max-w-[40%]">
            <div className="flex items-center gap-6 md:gap-10 mb-3">
              <button className="text-white/20 hover:text-primary hidden md:block transition-colors"><Shuffle size={18} /></button>
              <button onClick={onBack} className="text-white/60 hover:text-white transition-all"><SkipBack size={24} fill="currentColor" /></button>
              <motion.button 
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={onTogglePlay}
                className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-white flex items-center justify-center shadow-xl shadow-white/10"
              >
                {isPlaying ? <Pause size={24} className="text-black" fill="black" /> : <Play size={24} className="text-black fill-black translate-x-[2px]" />}
              </motion.button>
              <button onClick={onNext} className="text-white/60 hover:text-white transition-all"><SkipForward size={24} fill="currentColor" /></button>
              <button className="text-white/20 hover:text-primary hidden md:block transition-colors"><Repeat size={18} /></button>
            </div>
            
            <div className="w-full hidden md:flex items-center gap-4">
              <span className="text-[10px] font-black text-white/30 tabular-nums">{formatTime(currentTime)}</span>
              <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden relative group cursor-pointer">
                <motion.div 
                  className="absolute left-0 top-0 h-full bg-primary"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span className="text-[10px] font-black text-white/30 tabular-nums">{currentSong.duration}</span>
            </div>
          </div>

          {/* Outils & Volume Pro */}
          <div className="hidden md:flex items-center justify-end md:w-[30%] gap-6">
            <button 
              onClick={() => onViewChange('lyrics')} 
              className={cn("transition-colors", activeView === 'lyrics' ? "text-primary" : "text-white/30 hover:text-white")}
            >
              <Mic2 size={20} />
            </button>
            <button 
              onClick={() => onViewChange('queue')} 
              className={cn("transition-colors", activeView === 'queue' ? "text-primary" : "text-white/30 hover:text-white")}
            >
              <ListMusic size={20} />
            </button>
            <div className="flex items-center gap-3 w-32 group">
              <Volume2 size={20} className="text-white/30 group-hover:text-primary" />
              <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-white/40 group-hover:bg-primary transition-colors w-[70%]" />
              </div>
            </div>
            <button className="text-white/30 hover:text-white"><Share2 size={20} /></button>
          </div>

        </div>
      </motion.div>
    </footer>
  );
};