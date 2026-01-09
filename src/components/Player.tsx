"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { 
  Play, Pause, SkipBack, SkipForward, Volume2, Heart, 
  ListMusic, Mic2, Shuffle, Repeat, Repeat1, Share2
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
  const { user } = useAuth();
  const audioRef = useRef<HTMLAudioElement>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(() => {
    const savedVolume = localStorage.getItem('player_volume');
    return savedVolume ? parseFloat(savedVolume) : 0.7;
  });
  const [hasTrackedPlay, setHasTrackedPlay] = useState(false);

  // Charger la position précédente si c'est le même morceau
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const savedPos = localStorage.getItem(`pos_${currentSong.id}`);
    if (savedPos) {
      audio.currentTime = parseFloat(savedPos);
    } else {
      audio.currentTime = 0;
    }
    
    setHasTrackedPlay(false);
    audio.load();
    if (isPlaying) audio.play().catch(() => {});
  }, [currentSong.id]);

  // Gérer la lecture/pause
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) audio.play().catch(() => {});
    else audio.pause();
  }, [isPlaying]);

  // Gérer le volume
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
      localStorage.setItem('player_volume', volume.toString());
    }
  }, [volume]);

  // Sauvegarder la position toutes les 5 secondes
  useEffect(() => {
    const interval = setInterval(() => {
      if (audioRef.current && isPlaying) {
        localStorage.setItem(`pos_${currentSong.id}`, audioRef.current.currentTime.toString());
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [currentSong.id, isPlaying]);

  // Logique de tracking
  useEffect(() => {
    if (currentTime >= 10 && !hasTrackedPlay && currentSong.id) {
      setHasTrackedPlay(true);
      supabase.from('song_plays').insert({
        song_id: currentSong.id,
        user_id: user?.id || null
      }).then(({ error }) => {
        if (error) console.error("[Player] Error tracking play:", error);
      });
    }
  }, [currentTime, hasTrackedPlay, currentSong.id, user]);

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
    <footer className="fixed bottom-[68px] md:bottom-4 left-0 right-0 h-16 md:h-24 z-50 px-2 md:px-4 pointer-events-none">
      <audio 
        ref={audioRef} 
        src={currentSong.audio_url || currentSong.url} 
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={onNext}
        onError={() => showError("Impossible de lire ce titre.")}
      />

      <motion.div 
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", damping: 20, stiffness: 100 }}
        className="max-w-7xl mx-auto h-full glass-main rounded-2xl md:rounded-[2rem] border-white/10 flex flex-col justify-center px-3 md:px-6 pointer-events-auto shadow-2xl"
      >
        <div className="flex items-center justify-between gap-3 md:gap-8">
          
          {/* Infos Titre */}
          <div className="flex items-center md:w-[25%] min-w-0 gap-2 md:gap-4">
            <div className="relative w-10 h-10 md:w-14 md:h-14 rounded-lg md:rounded-2xl overflow-hidden shadow-xl shrink-0 group">
              <img src={currentSong.cover_url || currentSong.cover} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
            </div>
            <div className="min-w-0">
              <h4 className="text-[11px] md:text-[14px] font-black text-white truncate tracking-tight">{currentSong.title}</h4>
              <p className="text-[9px] md:text-[12px] text-gray-500 font-bold truncate tracking-wide">{currentSong.artist_name || currentSong.artist}</p>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={onToggleLike} className={cn("shrink-0 transition-all hidden xs:block", isLiked ? "text-primary" : "text-gray-600 hover:text-white")}>
                <Heart size={16} fill={isLiked ? "currentColor" : "none"} className="md:w-[18px] md:h-[18px]" />
              </button>
              <button onClick={() => shareSong(currentSong)} className="shrink-0 transition-all text-gray-600 hover:text-white hidden sm:block">
                <Share2 size={16} className="md:w-[18px] md:h-[18px]" />
              </button>
            </div>
          </div>

          {/* Contrôles Centraux */}
          <div className="flex flex-col items-center flex-1 max-w-[55%] md:max-w-[45%] gap-1">
            <div className="flex items-center gap-4 md:gap-6">
              <button 
                onClick={onToggleShuffle} 
                className={cn("transition-colors hidden sm:block", isShuffle ? "text-primary" : "text-gray-500 hover:text-white")}
              >
                <Shuffle size={16} />
              </button>
              
              <button onClick={onBack} className="text-gray-400 hover:text-white transition-all active:scale-90">
                <SkipBack size={16} fill="currentColor" className="md:w-[20px] md:h-[20px]" />
              </button>
              
              <button 
                onClick={onTogglePlay} 
                className="w-9 h-9 md:w-12 md:h-12 rounded-full bg-white flex items-center justify-center hover:scale-110 active:scale-95 transition-all shadow-lg"
              >
                {isPlaying ? <Pause size={18} className="text-black fill-black md:w-[22px] md:h-[22px]" /> : <Play size={18} className="text-black fill-black translate-x-[1px] md:w-[22px] md:h-[22px]" />}
              </button>
              
              <button onClick={onNext} className="text-gray-400 hover:text-white transition-all active:scale-90">
                <SkipForward size={16} fill="currentColor" className="md:w-[20px] md:h-[20px]" />
              </button>

              <button 
                onClick={onToggleRepeat} 
                className={cn("transition-colors hidden sm:block", repeatMode !== 'none' ? "text-primary" : "text-gray-500 hover:text-white")}
              >
                {repeatMode === 'one' ? <Repeat1 size={16} /> : <Repeat size={16} />}
              </button>
            </div>
            
            {/* Barre de progression */}
            <div className="w-full hidden md:flex items-center gap-4">
              <span className="text-[10px] font-black text-gray-500 tabular-nums w-10 text-right">{formatTime(currentTime)}</span>
              <div 
                className="flex-1 h-1 bg-white/5 rounded-full overflow-hidden cursor-pointer relative group"
                onClick={handleProgressClick}
              >
                <motion.div 
                  className="h-full bg-primary relative z-10" 
                  style={{ width: `${progress}%` }} 
                />
              </div>
              <span className="text-[10px] font-black text-gray-500 tabular-nums w-10">{formatTime(duration)}</span>
            </div>
          </div>

          {/* Options de droite & Volume */}
          <div className="hidden md:flex items-center justify-end md:w-[25%] gap-6">
            <button onClick={() => onViewChange('lyrics')} className={cn("transition-all hover:scale-110", activeView === 'lyrics' ? "text-primary" : "text-gray-500 hover:text-white")}>
              <Mic2 size={18} />
            </button>
            <button onClick={() => onViewChange('queue')} className={cn("transition-all hover:scale-110", activeView === 'queue' ? "text-primary" : "text-gray-500 hover:text-white")}>
              <ListMusic size={18} />
            </button>
            
            <div className="flex items-center gap-3 w-32 group">
              <Volume2 size={18} className="text-gray-500 group-hover:text-white transition-colors" />
              <Slider 
                value={[volume * 100]} 
                max={100} 
                step={1} 
                onValueChange={(val) => setVolume(val[0] / 100)}
                className="w-full"
              />
            </div>
          </div>

        </div>
        
        {/* Barre de progression Mobile */}
        <div 
          className="md:hidden absolute bottom-0 left-4 right-4 h-0.5 bg-white/5 overflow-hidden"
          onClick={handleProgressClick}
        >
          <div className="h-full bg-primary" style={{ width: `${progress}%` }} />
        </div>
      </motion.div>
    </footer>
  );
};