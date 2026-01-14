"use client";

import { useRef, useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Play, Pause, SkipBack, SkipForward, Volume2, Heart,
  Mic2, Shuffle, Repeat, Repeat1, ListMusic, Maximize2, Settings
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Slider } from "@/components/ui/slider";
import { useAudioQuality } from "@/hooks/useAudioQuality";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
  const { quality, changeQuality } = useAudioQuality();

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    // Logique adaptative : choisir l'URL en fonction de la qualité
    const highQualityUrl = currentSong.audio_url_high;
    const standardQualityUrl = currentSong.audio_url || currentSong.url;
    const src = (quality === 'high' && highQualityUrl) ? highQualityUrl : standardQualityUrl;

    if (audio.src !== src) {
      const wasPlaying = !audio.paused;
      const currentTime = audio.currentTime;
      audio.src = src;
      audio.load();
      if (currentTime > 0) audio.currentTime = currentTime;
      if (wasPlaying) audio.play().catch(() => { });
    }
  }, [currentSong.id, quality, currentSong]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    isPlaying ? audio.play().catch(() => { }) : audio.pause();
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

  const handleEnded = () => {
    if (repeatMode === 'one' && audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => { });
    } else {
      onNext();
    }
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <footer className="fixed bottom-[3.5rem] md:bottom-6 left-0 right-0 h-16 md:h-24 z-[70] px-0 md:px-6 pointer-events-none">
      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
        onEnded={handleEnded}
      />

      <motion.div
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        className="max-w-7xl mx-auto h-full glass-main md:rounded-[2rem] flex flex-col justify-center px-3 md:px-8 pointer-events-auto border-t md:border border-white/10 relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-white/5 md:hidden">
          <div className="h-full bg-primary transition-all duration-300" style={{ width: `${progress}%` }} />
        </div>

        <div className="flex items-center justify-between w-full gap-4 md:gap-6">

          <div className="flex items-center w-2/5 md:w-1/4 min-w-0 gap-3">
            <div className="relative w-10 h-10 md:w-14 md:h-14 rounded-lg overflow-hidden shadow-lg shrink-0 group cursor-pointer" onClick={() => onViewChange('lyrics')}>
              <img src={currentSong.cover_url || currentSong.cover} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                <Maximize2 size={16} />
              </div>
            </div>
            <div className="min-w-0">
              <h4 className="text-[13px] md:text-[15px] font-black text-white truncate leading-tight mb-0.5">{currentSong.title}</h4>
              <p className="text-[10px] md:text-[12px] text-gray-400 font-bold truncate hover:text-primary transition-colors cursor-pointer">
                {currentSong.artist_name || currentSong.artist}
              </p>
            </div>
            <button onClick={onToggleLike} className={cn("hidden md:block shrink-0 transition-all active:scale-125 ml-1", isLiked ? "text-primary" : "text-gray-600 hover:text-white")}>
              <Heart size={18} fill={isLiked ? "currentColor" : "none"} />
            </button>
          </div>

          <div className="flex flex-col items-center flex-1 max-w-xl gap-2">
            <div className="flex items-center gap-6">
              <button onClick={onToggleShuffle} className={cn("hidden md:block transition-colors relative", isShuffle ? "text-primary" : "text-gray-500 hover:text-white")}>
                <Shuffle size={16} />
                {isShuffle && <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-1 h-1 bg-primary rounded-full" />}
              </button>
              <button onClick={onBack} className="text-gray-400 hover:text-white transition-all active:scale-90"><SkipBack size={20} fill="currentColor" /></button>
              <button
                onClick={onTogglePlay}
                className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-white flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-xl shadow-white/10"
              >
                {isPlaying ? <Pause size={22} className="text-black fill-black" /> : <Play size={22} className="text-black fill-black translate-x-0.5" />}
              </button>
              <button onClick={onNext} className="text-gray-400 hover:text-white transition-all active:scale-90"><SkipForward size={20} fill="currentColor" /></button>
              <button onClick={onToggleRepeat} className={cn("hidden md:block transition-colors relative", repeatMode !== 'none' ? "text-primary" : "text-gray-500 hover:text-white")}>
                {repeatMode === 'one' ? <Repeat1 size={16} /> : <Repeat size={16} />}
                {repeatMode !== 'none' && <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-1 h-1 bg-primary rounded-full" />}
              </button>
            </div>

            <div className="w-full hidden md:flex items-center gap-3">
              <span className="text-[10px] font-black text-gray-500 tabular-nums w-8 text-right">{formatTime(currentTime)}</span>
              <div className="flex-1 group relative py-2 cursor-pointer" onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const x = e.clientX - rect.left;
                if (audioRef.current) audioRef.current.currentTime = (x / rect.width) * audioRef.current.duration;
              }}>
                <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
                  <motion.div className="h-full bg-primary relative" style={{ width: `${progress}%` }}>
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity" />
                  </motion.div>
                </div>
              </div>
              <span className="text-[10px] font-black text-gray-500 tabular-nums w-8">{formatTime(duration)}</span>
            </div>
          </div>

          <div className="hidden md:flex items-center justify-end w-1/4 gap-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className={cn("text-[9px] font-black border border-white/10 rounded px-1.5 py-0.5 transition-colors", quality === 'high' ? "text-primary border-primary" : "text-gray-500 hover:text-white")}>
                  {quality === 'high' ? 'HQ' : 'SQ'}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-[#0C0607] border-white/10 text-white min-w-[100px]" align="end" sideOffset={10}>
                <DropdownMenuItem className="text-xs font-bold cursor-pointer hover:bg-white/10 focus:bg-white/10" onClick={() => changeQuality('standard')}>
                  Standard (SQ)
                </DropdownMenuItem>
                <DropdownMenuItem className="text-xs font-bold cursor-pointer hover:bg-white/10 focus:bg-white/10" onClick={() => changeQuality('high')}>
                  Haute (HQ)
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <button onClick={() => onViewChange('lyrics')} className={cn("transition-all hover:scale-110", activeView === 'lyrics' ? "text-primary" : "text-gray-500 hover:text-white")}>
              <Mic2 size={18} />
            </button>
            <button onClick={() => onViewChange('queue')} className={cn("transition-all hover:scale-110", activeView === 'queue' ? "text-primary" : "text-gray-500 hover:text-white")}>
              <ListMusic size={18} />
            </button>
            <div className="flex items-center gap-2 w-20 group">
              <Volume2 size={16} className="text-gray-500 group-hover:text-white transition-colors" />
              <Slider value={[volume * 100]} max={100} onValueChange={(val) => setVolume(val[0] / 100)} className="h-1.5" />
            </div>
          </div>

          <button onClick={() => onViewChange('queue')} className={cn("md:hidden p-2 transition-colors", activeView === 'queue' ? "text-primary" : "text-gray-400 hover:text-white")}>
            <ListMusic size={22} />
          </button>

        </div>
      </motion.div>
    </footer>

  );
};