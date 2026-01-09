"use client";

import { useState, useEffect, useCallback } from "react";
import { Check, X, Clock, Music, User, ExternalLink, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { showSuccess, showError } from "@/utils/toast";
import { motion, AnimatePresence } from "framer-motion";

export const AdminDashboard = () => {
  const [pendingSongs, setPendingSongs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const fetchPending = useCallback(async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('songs')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPendingSongs(data || []);
    } catch (error: any) {
      showError("Erreur lors du chargement des titres en attente.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPending();
  }, [fetchPending]);

  const handleModeration = async (songId: string, newStatus: 'approved' | 'rejected') => {
    try {
      setProcessingId(songId);
      const { error } = await supabase
        .from('songs')
        .update({ status: newStatus })
        .eq('id', songId);

      if (error) throw error;

      showSuccess(newStatus === 'approved' ? "Titre validé et publié !" : "Titre rejeté.");
      setPendingSongs(prev => prev.filter(s => s.id !== songId));
    } catch (error: any) {
      showError("Erreur lors de la modération.");
    } finally {
      setProcessingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <Loader2 className="animate-spin text-primary" size={32} />
        <p className="text-xs font-bold uppercase tracking-widest text-gray-500">Chargement des soumissions...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black flex items-center gap-2">
            <Clock className="text-primary" size={20} /> File de Modération
          </h2>
          <p className="text-[11px] text-gray-500 font-bold uppercase tracking-widest">
            {pendingSongs.length} titre(s) en attente de validation
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchPending} className="h-8 rounded-full text-[10px] border-white/10"> Actualiser </Button>
      </div>

      <div className="grid gap-3">
        <AnimatePresence mode="popLayout">
          {pendingSongs.length > 0 ? (
            pendingSongs.map((song) => (
              <motion.div 
                key={song.id}
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="glass-card-pro p-4 flex items-center gap-4 group"
              >
                <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 bg-white/5 border border-white/10">
                  <img src={song.cover_url} className="w-full h-full object-cover" alt="" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-sm truncate">{song.title}</h3>
                    <a href={song.audio_url} target="_blank" rel="noreferrer" className="text-gray-500 hover:text-white transition-colors">
                      <ExternalLink size={14} />
                    </a>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <p className="text-[11px] text-gray-400 font-bold flex items-center gap-1.5">
                      <User size={12} className="text-primary" /> {song.artist_name}
                    </p>
                    <p className="text-[10px] text-gray-500 font-medium">Posté le {new Date(song.created_at).toLocaleDateString()}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    disabled={processingId === song.id}
                    onClick={() => handleModeration(song.id, 'rejected')}
                    className="h-10 w-10 rounded-full text-gray-500 hover:text-red-400 hover:bg-red-400/10"
                  >
                    <X size={20} />
                  </Button>
                  <Button 
                    size="sm" 
                    disabled={processingId === song.id}
                    onClick={() => handleModeration(song.id, 'approved')}
                    className="h-10 w-10 rounded-full bg-green-500/20 text-green-500 hover:bg-green-500 hover:text-white shadow-lg shadow-green-500/20 transition-all"
                  >
                    {processingId === song.id ? <Loader2 size={18} className="animate-spin" /> : <Check size={20} />}
                  </Button>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="py-20 text-center border border-dashed border-white/5 rounded-[2rem] bg-white/[0.01]">
              <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Music size={24} className="text-gray-600" />
              </div>
              <p className="text-sm text-gray-500 font-bold uppercase tracking-widest">Aucun titre à modérer</p>
              <p className="text-[11px] text-gray-600 mt-1">Le ministère avance, tout est à jour !</p>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};