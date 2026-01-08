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
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    setCurrentTime(0);
    if (onProgressUpdate) onProgressUpdate(0);
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
    const audio = audioRef.current;
    if (audio) {
      setCurrentTime(audio.currentTime);
      if (audio.duration && onProgressUpdate) {
        onProgressUpdate((audio.currentTime / audio.duration) * 100);
      }
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) setDuration(audioRef.current.duration);
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current;
    if (!audio || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    audio.currentTime = (x / rect.width) * duration;
  };

  return (
    <footer className="fixed bottom-20 md:bottom-4 left-0 right-0 h-24 z-50 px-4 pointer-events-none">
      <audio 
        ref={audioRef} 
        src={currentSong.url} 
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={onNext}
        onError={() => showError("Impossible de lire ce titre.")}
      />

      <motion.div 
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", damping: 20, stiffness: 100 }}
        className="max-w-7xl mx-auto h-full glass-main rounded-[2rem] border-white/10 flex flex-col justify-center px-6 pointer-events-auto shadow-[0_32px_64px_-12px_rgba(0,0,0,0.8)]"
      >
        <div className="flex items-center justify-between gap-8">
          
          {/* Track Info */}
          <div className="flex items-center md:w-[25%] min-w-0 gap-4">
            <div className="relative w-14 h-14 rounded-2xl overflow-hidden shadow-2xl shrink-0 group">
              <img src={currentSong.cover} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
              <div className="absolute inset-0 bg-black/20" />
            </div>
            <div className="min-w-0">
              <h4 className="text-[14px] font-black text-white truncate tracking-tight">{currentSong.title}</h4>
              <p className="text-[12px] text-gray-500 font-bold truncate tracking-wide">{currentSong.artist}</p>
            </div>
            <button onClick={onToggleLike} className={cn("shrink-0 transition-all hover:scale-110", isLiked ? "text-primary" : "text-gray-600 hover:text-white")}>
              <Heart size={18} fill={isLiked ? "currentColor" : "none"} />
            </button>
          </div>

          {/* Player Controls */}
          <div className="flex flex-col items-center flex-1 max-w-[45%] gap-2">
            <div className="flex items-center gap-6">
              <button className="text-gray-600 hover:text-white transition-colors hidden md:block"><Shuffle size={16} /></button>
              <button onClick={onBack} className="text-gray-400 hover:text-white transition-all active:scale-90"><SkipBack size={20} fill="currentColor" /></button>
              <button 
                onClick={onTogglePlay} 
                className="w-12 h-12 rounded-full bg-white flex items-center justify-center hover:scale-110 active:scale-95 transition-all shadow-[0_0_20px_rgba(255,255,255,0.2)]"
              >
                {isPlaying ? <Pause size={22} className="text-black fill-black" /> : <Play size={22} className="text-black fill-black translate-x-[1px]" />}
              </button>
              <button onClick={onNext} className="text-gray-400 hover:text-white transition-all active:scale-90"><SkipForward size={20} fill="currentColor" /></button>
              <button className="text-gray-600 hover:text-white transition-colors hidden md:block"><Repeat size={16} /></button>
            </div>
            
            <div className="w-full hidden md:flex items-center gap-4">
              <span className="text-[10px] font-black text-gray-500 tabular-nums w-10 text-right">{formatTime(currentTime)}</span>
              <div 
                className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden cursor-pointer relative group"
                onClick={handleProgressClick}
              >
                <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                <motion.div 
                  className="h-full bg-primary relative z-10 shadow-[0_0_10px_rgba(214,78,139,0.5)]" 
                  style={{ width: `${progress}%` }} 
                />
              </div>
              <span className="text-[10px] font-black text-gray-500 tabular-nums w-10">{formatTime(duration)}</span>
            </div>
          </div>

          {/* Tools */}
          <div className="hidden md:flex items-center justify-end md:w-[25%] gap-6">
            <button onClick={() => onViewChange('lyrics')} className={cn("transition-all hover:scale-110", activeView === 'lyrics' ? "text-primary" : "text-gray-500 hover:text-white")}>
              <Mic2 size={18} />
            </button>
            <button onClick={() => onViewChange('queue')} className={cn("transition-all hover:scale-110", activeView === 'queue' ? "text-primary" : "text-gray-500 hover:text-white")}>
              <ListMusic size={18} />
            </button>
            <div className="flex items-center gap-3 w-32 group">
              <Volume2 size={18} className="text-gray-500 group-hover:text-white transition-colors" />
              <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-gray-400 group-hover:bg-primary transition-colors w-[70%]" />
              </div>
            </div>
          </div>

        </div>
      </motion.div>
    </footer>
  );
};