"use client";

import { useState, useEffect } from "react";
import { UserPlus, UserMinus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";
import { showError } from "@/utils/toast";
import { cn } from "@/lib/utils";

interface FollowButtonProps {
  artistId: string;
  className?: string;
  onToggle?: () => void;
}

export const FollowButton = ({ artistId, className, onToggle }: FollowButtonProps) => {
  const { user } = useAuth();
  const [isFollowing, setIsFollowing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const checkFollow = async () => {
      if (!user || !artistId) {
        setIsLoading(false);
        return;
      }
      
      const { data, error } = await supabase
        .from('follows')
        .select('id')
        .eq('follower_id', user.id)
        .eq('following_id', artistId)
        .maybeSingle();

      if (!error) setIsFollowing(!!data);
      setIsLoading(false);
    };

    checkFollow();
  }, [user, artistId]);

  const handleToggle = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      showError("Veuillez vous connecter pour suivre un artiste.");
      return;
    }

    try {
      setIsProcessing(true);
      if (isFollowing) {
        await supabase
          .from('follows')
          .delete()
          .eq('follower_id', user.id)
          .eq('following_id', artistId);
        setIsFollowing(false);
      } else {
        await supabase
          .from('follows')
          .insert({
            follower_id: user.id,
            following_id: artistId
          });
        setIsFollowing(true);
      }
      if (onToggle) onToggle();
    } catch (error) {
      showError("Erreur lors de l'opération.");
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading || !user || user.id === artistId) return null;

  return (
    <Button
      variant={isFollowing ? "outline" : "default"}
      size="sm"
      disabled={isProcessing}
      onClick={handleToggle}
      className={cn(
        "rounded-full h-8 text-[11px] font-black gap-2 transition-all",
        isFollowing 
          ? "border-white/10 text-gray-400 hover:text-red-400 hover:border-red-400/30" 
          : "bg-white text-black hover:bg-white/90 shadow-lg",
        className
      )}
    >
      {isProcessing ? (
        <Loader2 size={14} className="animate-spin" />
      ) : isFollowing ? (
        <><UserMinus size={14} /> NE PLUS SUIVRE</>
      ) : (
        <><UserPlus size={14} /> SUIVRE</>
      )}
    </Button>
  );
};