"use client";

import { Home, Search, Library, Plus, Heart, ListMusic } from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  likedCount: number;
}

export const Sidebar = ({ activeTab, onTabChange, likedCount }: SidebarProps) => {
  return (
    <aside className="hidden md:flex flex-col w-[260px] gap-2 h-full">
      <div className="bg-[#121212] rounded-xl p-4 space-y-4">
        <div className="flex items-center gap-2 px-2 mb-6">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <ListMusic className="text-black" size={20} />
          </div>
          <h1 className="text-xl font-bold tracking-tighter">Mboka Gospel</h1>
        </div>
        
        <nav className="space-y-1">
          <SidebarItem 
            icon={<Home size={24} />} 
            label="Accueil" 
            active={activeTab === 'accueil'} 
            onClick={() => onTabChange('accueil')} 
          />
          <SidebarItem 
            icon={<Search size={24} />} 
            label="Rechercher" 
            active={activeTab === 'recherche'} 
            onClick={() => onTabChange('recherche')} 
          />
        </nav>
      </div>

      <div className="flex-1 bg-[#121212] rounded-xl overflow-hidden flex flex-col">
        <div className="p-4 flex items-center justify-between text-gray-400">
          <button 
            onClick={() => onTabChange('biblio')} 
            className="flex items-center gap-3 hover:text-white transition-colors font-bold text-sm"
          >
            <Library size={24} />
            <span>Votre bibliothèque</span>
          </button>
          <button className="p-1 hover:bg-white/5 rounded-full transition-colors">
            <Plus size={20} />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto px-2">
          <div 
            onClick={() => onTabChange('biblio')}
            className={cn(
              "group p-4 bg-gradient-to-br from-indigo-600/20 to-indigo-900/40 rounded-lg mb-4 cursor-pointer border border-white/5 hover:border-white/10 transition-all",
              activeTab === 'biblio' && "ring-1 ring-white/20"
            )}
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded flex items-center justify-center shadow-lg">
                <Heart size={16} fill="white" />
              </div>
              <span className="font-bold text-sm">Titres likés</span>
            </div>
            <p className="text-xs text-indigo-200/60 font-medium">{likedCount} titres dans votre collection</p>
          </div>
          
          <div className="space-y-1 mt-4">
            <p className="text-[10px] uppercase tracking-widest text-gray-500 font-bold px-3 mb-2">Playlists récentes</p>
            {["Favoris 2024", "Adoration Matinale", "Louange RDC"].map((name, i) => (
              <button key={i} className="w-full text-left px-3 py-2 text-sm text-gray-400 hover:text-white truncate transition-colors">
                {name}
              </button>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
};

const SidebarItem = ({ icon, label, active, onClick }: { icon: React.ReactNode, label: string, active: boolean, onClick: () => void }) => (
  <button 
    onClick={onClick}
    className={cn(
      "w-full flex items-center gap-4 px-3 py-2.5 rounded-lg transition-all font-bold text-sm group",
      active ? "text-white bg-white/5" : "text-gray-400 hover:text-white hover:bg-white/[0.02]"
    )}
  >
    <span className={cn("transition-transform group-hover:scale-110", active && "text-primary")}>{icon}</span>
    <span>{label}</span>
  </button>
);