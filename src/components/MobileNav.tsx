"use client";

import { Home, Search, Library } from "lucide-react";
import { cn } from "@/lib/utils";

interface MobileNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const MobileNav = ({ activeTab, onTabChange }: MobileNavProps) => {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-black/90 backdrop-blur-lg border-t border-white/10 flex justify-around items-center h-16 z-50 px-6">
      <button 
        onClick={() => onTabChange('accueil')}
        className={cn(
          "flex flex-col items-center gap-1 transition-colors",
          activeTab === 'accueil' ? "text-white" : "text-gray-400"
        )}
      >
        <Home size={24} />
        <span className="text-[10px] font-medium">Accueil</span>
      </button>
      
      <button 
        onClick={() => onTabChange('recherche')}
        className={cn(
          "flex flex-col items-center gap-1 transition-colors",
          activeTab === 'recherche' ? "text-white" : "text-gray-400"
        )}
      >
        <Search size={24} />
        <span className="text-[10px] font-medium">Rechercher</span>
      </button>
      
      <button 
        onClick={() => onTabChange('biblio')}
        className={cn(
          "flex flex-col items-center gap-1 transition-colors",
          activeTab === 'biblio' ? "text-white" : "text-gray-400"
        )}
      >
        <Library size={24} />
        <span className="text-[10px] font-medium">Bibliothèque</span>
      </button>
    </nav>
  );
};