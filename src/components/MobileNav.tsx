"use client";

import { Home, Search, Library, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface MobileNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const MobileNav = ({ activeTab, onTabChange }: MobileNavProps) => {
  const tabs = [
    { id: 'accueil', icon: Home, label: 'Accueil' },
    { id: 'recherche', icon: Search, label: 'Explorer' },
    { id: 'biblio', icon: Library, label: 'Biblio' },
    { id: 'profil', icon: User, label: 'Profil' },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-[60] safe-bottom p-2">
      <div className="glass-main rounded-xl h-14 flex items-center justify-around px-2 border-white/5">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className="relative flex flex-col items-center justify-center flex-1 h-full transition-all"
            >
              <Icon 
                size={18} 
                className={cn(
                  "transition-all duration-300",
                  isActive ? "text-primary" : "text-gray-500"
                )} 
              />
              <span className={cn(
                "text-[9px] font-bold mt-0.5 transition-colors",
                isActive ? "text-white" : "text-gray-500"
              )}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};