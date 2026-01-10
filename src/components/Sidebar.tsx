"use client";

import { Home, Search, Library, Plus, Heart, Compass, Music2, Star, Crown } from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  likedCount: number;
}

export const Sidebar = ({ activeTab, onTabChange, likedCount }: SidebarProps) => {
  return (
    <aside className="hidden md:flex flex-col w-[240px] gap-4 h-full py-4 pl-4">
      <div className="flex flex-col h-full bg-white/[0.01] rounded-[2rem] border border-white/[0.05] p-5 space-y-8">
        
        {/* Navigation Principale */}
        <nav className="space-y-1.5">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-600 mb-3 px-3">Menu</p>
          <SidebarItem 
            icon={<Compass size={20} />} 
            label="Découvrir" 
            active={activeTab === 'accueil'} 
            onClick={() => onTabChange('accueil')} 
          />
          <SidebarItem 
            icon={<Search size={20} />} 
            label="Rechercher" 
            active={activeTab === 'recherche'} 
            onClick={() => onTabChange('recherche')} 
          />
        </nav>

        {/* Bibliothèque */}
        <div className="flex-1 space-y-6">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-600 mb-3 px-3">Bibliothèque</p>
            <div className="space-y-1.5">
              <SidebarItem 
                icon={<Library size={20} />} 
                label="Ma Collection" 
                active={activeTab === 'biblio'} 
                onClick={() => onTabChange('biblio')} 
              />
              <SidebarItem 
                icon={<Heart size={20} />} 
                label="Coups de cœur" 
                active={false} 
                onClick={() => onTabChange('biblio')} 
                badge={likedCount > 0 ? likedCount.toString() : undefined}
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-3 px-3">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-600">Playlists</p>
              <button className="text-primary hover:scale-125 transition-transform"><Plus size={16} /></button>
            </div>
            <div className="space-y-1 overflow-y-auto max-h-[180px] custom-scrollbar px-1">
              {["Adoration Matinale", "Louange RDC", "Classiques Gospel"].map((name, i) => (
                <button key={i} className="w-full text-left px-3 py-2 text-[12px] font-semibold text-gray-500 hover:text-white hover:bg-white/5 rounded-xl transition-all truncate">
                  {name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Premium Banner */}
        <div 
          onClick={() => onTabChange('premium')}
          className={cn(
            "p-4 rounded-2xl cursor-pointer transition-all relative overflow-hidden group",
            activeTab === 'premium' 
              ? "bg-primary text-white shadow-xl shadow-primary/20" 
              : "bg-gradient-to-br from-primary/10 to-transparent border border-white/[0.05] hover:border-primary/30"
          )}
        >
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <Crown size={14} className={activeTab === 'premium' ? "text-white" : "text-primary"} fill="currentColor" />
              <span className="text-[11px] font-black uppercase tracking-wider">Premium</span>
            </div>
            <p className={cn("text-[10px] font-bold leading-tight", activeTab === 'premium' ? "text-white/80" : "text-gray-400")}>
              Accès illimité et qualité Hi-Fi
            </p>
          </div>
          <div className="absolute -right-4 -bottom-4 w-16 h-16 bg-primary/20 blur-2xl group-hover:scale-150 transition-transform" />
        </div>
      </div>
    </aside>
  );
};

const SidebarItem = ({ icon, label, active, onClick, badge }: { icon: React.ReactNode, label: string, active: boolean, onClick: () => void, badge?: string }) => (
  <button 
    onClick={onClick}
    className={cn(
      "w-full flex items-center justify-between px-4 py-2.5 rounded-2xl transition-all duration-300 font-bold text-[14px]",
      active 
        ? "bg-white/10 text-primary shadow-sm" 
        : "text-gray-500 hover:text-white hover:bg-white/[0.03]"
    )}
  >
    <div className="flex items-center gap-4">
      <span className={cn("transition-transform duration-300", active && "scale-110")}>{icon}</span>
      <span>{label}</span>
    </div>
    {badge && <span className="bg-primary text-white text-[10px] px-2 py-0.5 rounded-full font-black">{badge}</span>}
  </button>
);