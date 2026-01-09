"use client";

import { useState, useEffect, useCallback } from "react";
import { Check, X, Clock, Music, User, ExternalLink, Loader2, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { showSuccess, showError } from "@/utils/toast";
import { motion, AnimatePresence } from "framer-motion";

export const AdminDashboard = () => {
  const [pendingSongs, setPendingSongs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [rejectionSong, setRejectionSong] = useState<any | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");

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
      showError("Erreur lors du chargement des soumissions.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPending();
  }, [fetchPending]);

  const handleModeration = async (songId: string, newStatus: 'approved' | 'rejected', reason?: string) => {
    try {
      setProcessingId(songId);
      const { error } = await supabase
        .from('songs')
        .update({ 
          status: newStatus,
          rejection_reason: reason || null
        })
        .eq('id', songId);

      if (error) throw error;

      showSuccess(newStatus === 'approved' ? "Titre validé !" : "Titre rejeté avec succès.");
      setPendingSongs(prev => prev.filter(s => s.id !== songId));
      setRejectionSong(null);
      setRejectionReason("");
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
        <p className="text-xs font-bold uppercase text-gray-500">Chargement...</p>
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
            {pendingSongs.length} titre(s) en attente
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchPending} className="h-8 rounded-full text-[10px] border-white/10"> Actualiser </Button>
      </div>

      <div className="grid gap-3">
        <AnimatePresence mode="popLayout">
          {pendingSongs.map((song) => (
            <motion.div 
              key={song.id}
              layout
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass-card-pro p-4 flex items-center gap-4"
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
                <p className="text-[11px] text-gray-400 font-bold flex items-center gap-1.5">
                  <User size={12} className="text-primary" /> {song.artist_name}
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  disabled={processingId === song.id}
                  onClick={() => setRejectionSong(song)}
                  className="h-10 w-10 rounded-full text-gray-500 hover:text-red-400 hover:bg-red-400/10"
                >
                  <X size={20} />
                </Button>
                <Button 
                  size="sm" 
                  disabled={processingId === song.id}
                  onClick={() => handleModeration(song.id, 'approved')}
                  className="h-10 w-10 rounded-full bg-green-500/20 text-green-500 hover:bg-green-500 hover:text-white transition-all"
                >
                  {processingId === song.id ? <Loader2 size={18} className="animate-spin" /> : <Check size={20} />}
                </Button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Modal de Rejet */}
      <Dialog open={!!rejectionSong} onOpenChange={() => setRejectionSong(null)}>
        <DialogContent className="bg-[#0C0607] border-white/10 text-white">
          <DialogHeader>
            <DialogTitle>Rejeter : {rejectionSong?.title}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-[11px] font-bold uppercase text-gray-500">Motif du rejet</label>
              <Input 
                placeholder="Ex: Qualité audio insuffisante..." 
                className="bg-white/5 border-white/10 h-12"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setRejectionSong(null)}>Annuler</Button>
            <Button 
              className="bg-red-500 hover:bg-red-600 text-white rounded-full px-6"
              onClick={() => handleModeration(rejectionSong.id, 'rejected', rejectionReason)}
              disabled={!rejectionReason || processingId === rejectionSong?.id}
            >
              Confirmer le rejet
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};