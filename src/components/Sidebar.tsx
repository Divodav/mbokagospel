"use client";

import { Home, Search, Library, Plus, Heart, Music2, Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  likedCount: number;
}

export const Sidebar = ({ activeTab, onTabChange, likedCount }: SidebarProps) => {
  return (
    <aside className="hidden md:flex flex-col w-[280px] gap-4 h-full">
      <div className="glass-panel rounded-[2rem] p-6 space-y-8 flex flex-col h-full">
        {/* Navigation */}
        <nav className="space-y-2">
          <SidebarItem 
            icon={<Home size={22} />} 
            label="Découvrir" 
            active={activeTab === 'accueil'} 
            onClick={() => onTabChange('accueil')} 
          />
          <SidebarItem 
            icon={<Search size={22} />} 
            label="Explorer" 
            active={activeTab === 'recherche'} 
            onClick={() => onTabChange('recherche')} 
          />
        </nav>

        {/* Ma Musique */}
        <div className="flex-1 space-y-6">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 mb-4 px-3">Ma Bibliothèque</p>
            <div className="space-y-1">
              <SidebarItem 
                icon={<Library size={22} />} 
                label="Ma Collection" 
                active={activeTab === 'biblio'} 
                onClick={() => onTabChange('biblio')} 
              />
              <SidebarItem 
                icon={<Heart size={22} />} 
                label="Titres Favoris" 
                active={false} 
                onClick={() => onTabChange('biblio')} 
                badge={likedCount > 0 ? likedCount.toString() : undefined}
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-4 px-3">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Playlists</p>
              <button className="text-primary hover:scale-110 transition-transform"><Plus size={16} /></button>
            </div>
            <div className="space-y-1 overflow-y-auto max-h-[200px] custom-scrollbar">
              {["Adoration Matinale", "Louange RDC", "Classiques Gospel"].map((name, i) => (
                <button key={i} className="w-full text-left px-4 py-2 text-xs font-bold text-gray-400 hover:text-white hover:bg-white/5 rounded-xl transition-all truncate">
                  {name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* VIP / PROMO */}
        <div className="p-4 bg-gradient-to-br from-primary/20 to-indigo-600/20 rounded-2xl border border-white/5 relative overflow-hidden group">
          <Star className="absolute -right-2 -top-2 text-primary/20 scale-150 group-hover:rotate-12 transition-transform" size={48} />
          <p className="text-xs font-black mb-1 relative z-10">Premium</p>
          <p className="text-[10px] text-gray-400 mb-3 relative z-10">Écoute illimitée sans pub.</p>
          <button className="w-full py-2 bg-primary text-white text-[10px] font-black rounded-xl hover:shadow-lg glow-primary transition-all relative z-10">PROFITER</button>
        </div>
      </div>
    </aside>
  );
};

const SidebarItem = ({ icon, label, active, onClick, badge }: { icon: React.ReactNode, label: string, active: boolean, onClick: () => void, badge?: string }) => (
  <button 
    onClick={onClick}
    className={cn(
      "w-full flex items-center justify-between px-4 py-3 rounded-2xl transition-all font-bold text-sm",
      active ? "bg-primary text-white shadow-xl glow-primary" : "text-gray-400 hover:text-white hover:bg-white/5"
    )}
  >
    <div className="flex items-center gap-4">
      <span className={cn("transition-transform", active ? "scale-110" : "group-hover:scale-110")}>{icon}</span>
      <span>{label}</span>
    </div>
    {badge && <span className="bg-primary-foreground text-primary text-[10px] px-2 py-0.5 rounded-full">{badge}</span>}
  </button>
);