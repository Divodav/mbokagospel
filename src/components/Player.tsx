"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Play, Pause, SkipBack, SkipForward, Volume2, Heart, 
  Mic2, Shuffle, Repeat, Share2, Zap, ListMusic, Maximize2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Slider } from "@/components/ui/slider";

interface PlayerProps {
  currentSong: any;
  isPlaying: boolean;
  progress: number;
  isLiked: boolean;
  isShuffle: boolean;
  repeatMode: 'none' | 'one' | 'all';
  onTogglePlay: () => void;
  onNext: () => void;
  onBack: () => void;
  onToggleLike: () => void;
  onToggleShuffle: () => void;
  onToggleRepeat: () => void;
  onViewChange: (view: string) => void;
  activeView: string;
  onProgressUpdate?: (progress: number) => void;
}

export const Player = ({ 
  currentSong, isPlaying, progress, isLiked, isShuffle, repeatMode,
  onTogglePlay, onNext, onBack, onToggleLike, onToggleShuffle, onToggleRepeat,
  onViewChange, activeView, onProgressUpdate
}: PlayerProps) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(() => parseFloat(localStorage.getItem('player_volume') || '0.7'));

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.src = currentSong.audio_url || currentSong.url;
    audio.load();
    if (isPlaying) audio.play().catch(() => {});
  }, [currentSong.id]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    isPlaying ? audio.play().catch(() => {}) : audio.pause();
  }, [isPlaying]);

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume;
    localStorage.setItem('player_volume', volume.toString());
  }, [volume]);

  const handleTimeUpdate = () => {
    const audio = audioRef.current;
    if (audio) {
      setCurrentTime(audio.currentTime);
      if (audio.duration && onProgressUpdate) {
        onProgressUpdate((audio.currentTime / audio.duration) * 100);
      }
    }
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <footer className="fixed bottom-0 md:bottom-6 left-0 right-0 h-24 md:h-28 z-[70] px-0 md:px-6 pointer-events-none">
      <audio 
        ref={audioRef} 
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
        onEnded={onNext}
      />

      <motion.div 
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        className="max-w-7xl mx-auto h-full glass-main md:rounded-[2.5rem] flex flex-col justify-center px-4 md:px-10 pointer-events-auto border-t md:border border-white/10 relative overflow-hidden"
      >
        {/* Barre de progression subtile tout en haut sur mobile */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-white/5 md:hidden">
          <div className="h-full bg-primary" style={{ width: `${progress}%` }} />
        </div>

        <div className="flex items-center justify-between w-full gap-6">
          
          {/* Info Morceau */}
          <div className="flex items-center w-2/5 md:w-1/4 min-w-0 gap-4">
            <div className="relative w-12 h-12 md:w-16 md:h-16 rounded-xl overflow-hidden shadow-2xl shrink-0 group cursor-pointer" onClick={() => onViewChange('lyrics')}>
              <img src={currentSong.cover_url || currentSong.cover} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                <Maximize2 size={18} />
              </div>
            </div>
            <div className="min-w-0">
              <h4 className="text-[14px] md:text-[16px] font-black text-white truncate leading-tight mb-1">{currentSong.title}</h4>
              <p className="text-[11px] md:text-[13px] text-gray-400 font-bold truncate hover:text-primary transition-colors cursor-pointer">
                {currentSong.artist_name || currentSong.artist}
              </p>
            </div>
            <button onClick={onToggleLike} className={cn("shrink-0 transition-colors ml-2", isLiked ? "text-primary" : "text-gray-600 hover:text-white")}>
              <Heart size={20} fill={isLiked ? "currentColor" : "none"} />
            </button>
          </div>

          {/* Contrôles Centraux */}
          <div className="flex flex-col items-center flex-1 max-w-xl gap-3">
            <div className="flex items-center gap-8">
              <button onClick={onToggleShuffle} className={cn("hidden md:block transition-colors", isShuffle ? "text-primary" : "text-gray-500 hover:text-white")}>
                <Shuffle size={18} />
              </button>
              <button onClick={onBack} className="text-gray-400 hover:text-white transition-all active:scale-90"><SkipBack size={24} fill="currentColor" /></button>
              <button 
                onClick={onTogglePlay} 
                className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-white flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-xl shadow-white/10"
              >
                {isPlaying ? <Pause size={28} className="text-black fill-black" /> : <Play size={28} className="text-black fill-black translate-x-0.5" />}
              </button>
              <button onClick={onNext} className="text-gray-400 hover:text-white transition-all active:scale-90"><SkipForward size={24} fill="currentColor" /></button>
              <button onClick={onToggleRepeat} className={cn("hidden md:block transition-colors", repeatMode !== 'none' ? "text-primary" : "text-gray-500 hover:text-white")}>
                <Repeat size={18} />
              </button>
            </div>
            
            <div className="w-full hidden md:flex items-center gap-4">
              <span className="text-[11px] font-black text-gray-500 tabular-nums w-10 text-right">{formatTime(currentTime)}</span>
              <div className="flex-1 group relative py-2 cursor-pointer" onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const x = e.clientX - rect.left;
                if (audioRef.current) audioRef.current.currentTime = (x / rect.width) * audioRef.current.duration;
              }}>
                <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                  <motion.div className="h-full bg-primary relative" style={{ width: `${progress}%` }}>
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity" />
                  </motion.div>
                </div>
              </div>
              <span className="text-[11px] font-black text-gray-500 tabular-nums w-10">{formatTime(duration)}</span>
            </div>
          </div>

          {/* Options de droite */}
          <div className="hidden md:flex items-center justify-end w-1/4 gap-6">
            <button onClick={() => onViewChange('lyrics')} className={cn("transition-all hover:scale-110", activeView === 'lyrics' ? "text-primary" : "text-gray-500 hover:text-white")}>
              <Mic2 size={20} />
            </button>
            <button onClick={() => onViewChange('queue')} className={cn("transition-all hover:scale-110", activeView === 'queue' ? "text-primary" : "text-gray-500 hover:text-white")}>
              <ListMusic size={20} />
            </button>
            <div className="flex items-center gap-3 w-28 group">
              <Volume2 size={18} className="text-gray-500 group-hover:text-white transition-colors" />
              <Slider value={[volume * 100]} max={100} onValueChange={(val) => setVolume(val[0] / 100)} />
            </div>
          </div>

          {/* Mobile Queue Icon */}
          <button onClick={() => onViewChange('queue')} className="md:hidden text-gray-400 hover:text-white p-2">
            <ListMusic size={24} />
          </button>

        </div>
      </motion.div>
    </footer>
  );
};