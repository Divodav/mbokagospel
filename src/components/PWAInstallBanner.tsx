"use client";

import { Download, X, Sparkles, Share, PlusSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

interface PWAInstallBannerProps {
  onInstall: () => void;
  show: boolean;
  isIOS: boolean;
}

export const PWAInstallBanner = ({ onInstall, show, isIOS }: PWAInstallBannerProps) => {
  const [isVisible, setIsVisible] = useState(true);

  if (!show || !isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -20, opacity: 0 }}
        className="mb-6"
      >
        <div className="glass-main rounded-2xl p-4 border border-primary/20 bg-primary/5 relative overflow-hidden group">
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/10 blur-[40px] rounded-full pointer-events-none" />
          
          <div className="flex items-center gap-4 relative z-10">
            <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20 shrink-0">
              <Download size={24} className="text-white" />
            </div>
            
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-black flex items-center gap-2">
                Mboka Gospel sur ton mobile <Sparkles size={14} className="text-primary" />
              </h3>
              
              {isIOS ? (
                <p className="text-[10px] text-gray-400 font-medium leading-tight flex items-center gap-1.5 flex-wrap">
                  Appuie sur <Share size={12} className="text-primary" /> puis sur <PlusSquare size={12} className="text-primary" /> <span className="font-bold text-white">"Sur l'écran d'accueil"</span>
                </p>
              ) : (
                <p className="text-[11px] text-gray-400 font-medium leading-tight">
                  Installe l'application pour une expérience fluide et sans limites.
                </p>
              )}
            </div>

            <div className="flex items-center gap-2">
              {!isIOS && (
                <Button 
                  onClick={onInstall}
                  size="sm" 
                  className="bg-primary hover:bg-primary/90 text-white font-black text-[10px] rounded-full h-8 px-4"
                >
                  INSTALLER
                </Button>
              )}
              <button 
                onClick={() => setIsVisible(false)}
                className="p-2 text-gray-500 hover:text-white transition-colors"
              >
                <X size={16} />
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};