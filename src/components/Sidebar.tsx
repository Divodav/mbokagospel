"use client";

import { Home, Search, Library, Plus, Heart, Music2, Star, Crown } from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  likedCount: number;
}

export const Sidebar = ({ activeTab, onTabChange, likedCount }: SidebarProps) => {
  return (
    <aside className="hidden md:flex flex-col w-[220px] gap-2 h-full">
      <div className="glass-panel rounded-2xl p-4 space-y-6 flex flex-col h-full bg-white/[0.02] border border-white/5 backdrop-blur-xl">
        {/* Navigation */}
        <nav className="space-y-1">
          <SidebarItem 
            icon={<Home size={18} />} 
            label="Découvrir" 
            active={activeTab === 'accueil'} 
            onClick={() => onTabChange('accueil')} 
          />
          <SidebarItem 
            icon={<Search size={18} />} 
            label="Explorer" 
            active={activeTab === 'recherche'} 
            onClick={() => onTabChange('recherche')} 
          />
        </nav>

        {/* Ma Musique */}
        <div className="flex-1 space-y-4">
          <div>
            <p className="text-[9px] font-black uppercase tracking-widest text-gray-500 mb-2 px-3">Bibliothèque</p>
            <div className="space-y-1">
              <SidebarItem 
                icon={<Library size={18} />} 
                label="Ma Collection" 
                active={activeTab === 'biblio'} 
                onClick={() => onTabChange('biblio')} 
              />
              <SidebarItem 
                icon={<Heart size={18} />} 
                label="Favoris" 
                active={false} 
                onClick={() => onTabChange('biblio')} 
                badge={likedCount > 0 ? likedCount.toString() : undefined}
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2 px-3">
              <p className="text-[9px] font-black uppercase tracking-widest text-gray-500">Playlists</p>
              <button className="text-primary hover:scale-110 transition-transform"><Plus size={14} /></button>
            </div>
            <div className="space-y-0.5 overflow-y-auto max-h-[150px] custom-scrollbar">
              {["Adoration Matinale", "Louange RDC", "Classiques Gospel"].map((name, i) => (
                <button key={i} className="w-full text-left px-3 py-1.5 text-[11px] font-medium text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-all truncate">
                  {name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Premium Compact */}
        <div className={cn(
          "p-3 rounded-xl border transition-all group cursor-pointer",
          activeTab === 'premium' 
            ? "bg-primary border-primary" 
            : "bg-gradient-to-br from-primary/10 to-indigo-600/10 border-white/5"
        )} onClick={() => onTabChange('premium')}>
          <div className="flex items-center gap-2 mb-1.5">
            <Crown size={14} className={activeTab === 'premium' ? "text-white" : "text-primary"} fill="currentColor" />
            <p className={cn("text-[10px] font-bold", activeTab === 'premium' ? "text-white" : "text-white")}>Premium</p>
          </div>
          <button className={cn(
            "w-full py-1.5 text-[9px] font-black rounded-lg transition-all",
            activeTab === 'premium'
              ? "bg-white text-primary"
              : "bg-primary text-white hover:shadow-lg"
          )}>
            {activeTab === 'premium' ? 'OFFRES ACTIVES' : 'S\'ABONNER'}
          </button>
        </div>
      </div>
    </aside>
  );
};

const SidebarItem = ({ icon, label, active, onClick, badge }: { icon: React.ReactNode, label: string, active: boolean, onClick: () => void, badge?: string }) => (
  <button 
    onClick={onClick}
    className={cn(
      "w-full flex items-center justify-between px-3 py-2 rounded-xl transition-all font-bold text-[13px]",
      active ? "bg-white/10 text-primary" : "text-gray-400 hover:text-white hover:bg-white/5"
    )}
  >
    <div className="flex items-center gap-3">
      {icon}
      <span>{label}</span>
    </div>
    {badge && <span className="bg-primary text-white text-[9px] px-1.5 py-0.5 rounded-full">{badge}</span>}
  </button>
);