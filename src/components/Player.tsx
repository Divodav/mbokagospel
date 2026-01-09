"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { 
  Play, Pause, SkipBack, SkipForward, Volume2, Heart, 
  Mic2, Shuffle, Repeat, Repeat1, Share2, Zap, ListMusic
} from "lucide-react";
import { cn } from "@/lib/utils";
import { showError } from "@/utils/toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";
import { Slider } from "@/components/ui/slider";
import { shareSong } from "@/utils/share";

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
  const { user, profile } = useAuth();
  const audioRef = useRef<HTMLAudioElement>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(() => parseFloat(localStorage.getItem('player_volume') || '0.7'));

  const isPremium = profile?.is_premium;

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    
    // Charger le morceau
    audio.src = currentSong.audio_url || currentSong.url;
    audio.load();
    
    if (isPlaying) {
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => { /* Gérer l'autostart bloqué */ });
      }
    }
  }, [currentSong.id]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) audio.play().catch(() => {});
    else audio.pause();
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

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current;
    if (!audio || !audio.duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    audio.currentTime = (x / rect.width) * audio.duration;
  };

  return (
    <footer className="fixed bottom-[74px] md:bottom-6 left-0 right-0 h-20 md:h-24 z-[70] px-4 pointer-events-none">
      <audio 
        ref={audioRef} 
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
        onEnded={onNext}
      />

      <motion.div 
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="max-w-6xl mx-auto h-full glass-main rounded-3xl md:rounded-[2.5rem] flex items-center px-4 md:px-8 pointer-events-auto border border-white/10"
      >
        <div className="flex items-center justify-between w-full gap-4">
          
          {/* Section Artiste */}
          <div className="flex items-center w-1/3 md:w-1/4 min-w-0 gap-3">
            <div className="relative w-12 h-12 rounded-xl overflow-hidden shadow-2xl shrink-0 group">
              <img src={currentSong.cover_url || currentSong.cover} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
            </div>
            <div className="min-w-0">
              <h4 className="text-[13px] font-black text-white truncate leading-tight mb-0.5">{currentSong.title}</h4>
              <p className="text-[11px] text-gray-500 font-bold truncate">{currentSong.artist_name || currentSong.artist}</p>
            </div>
          </div>

          {/* Section Contrôles */}
          <div className="flex flex-col items-center flex-1 max-w-md gap-2">
            <div className="flex items-center gap-6">
              <button onClick={onBack} className="text-gray-400 hover:text-white transition-colors"><SkipBack size={20} fill="currentColor" /></button>
              <button 
                onClick={onTogglePlay} 
                className="w-11 h-11 rounded-full bg-white flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-xl"
              >
                {isPlaying ? <Pause size={22} className="text-black fill-black" /> : <Play size={22} className="text-black fill-black translate-x-0.5" />}
              </button>
              <button onClick={onNext} className="text-gray-400 hover:text-white transition-colors"><SkipForward size={20} fill="currentColor" /></button>
            </div>
            
            <div className="w-full hidden md:flex items-center gap-3">
              <span className="text-[10px] font-black text-gray-500 tabular-nums w-8 text-right">{formatTime(currentTime)}</span>
              <div 
                className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden cursor-pointer relative group"
                onClick={handleProgressClick}
              >
                <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                <motion.div className="h-full bg-primary relative z-10" style={{ width: `${progress}%` }} />
              </div>
              <span className="text-[10px] font-black text-gray-500 tabular-nums w-8">{formatTime(duration)}</span>
            </div>
          </div>

          {/* Section Volume/Options */}
          <div className="hidden md:flex items-center justify-end w-1/4 gap-5">
            <button onClick={() => onViewChange('lyrics')} className={cn("transition-all hover:scale-110", activeView === 'lyrics' ? "text-primary" : "text-gray-500 hover:text-white")}>
              <Mic2 size={18} />
            </button>
            <button onClick={() => onViewChange('queue')} className={cn("transition-all hover:scale-110", activeView === 'queue' ? "text-primary" : "text-gray-500 hover:text-white")}>
              <ListMusic size={18} />
            </button>
            <div className="flex items-center gap-3 w-24">
              <Volume2 size={16} className="text-gray-500" />
              <Slider value={[volume * 100]} max={100} onValueChange={(val) => setVolume(val[0] / 100)} />
            </div>
          </div>

        </div>
      </motion.div>
    </footer>
  );
};