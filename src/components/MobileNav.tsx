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
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-[60] safe-bottom">
      <div className="mx-4 mb-4 glass-main rounded-3xl h-20 flex items-center justify-around px-4 shadow-2xl border-white/10">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className="relative flex flex-col items-center justify-center w-16 h-16 transition-all"
            >
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-primary/10 rounded-2xl"
                  transition={{ type: "spring", duration: 0.6 }}
                />
              )}
              <Icon 
                size={24} 
                className={cn(
                  "transition-all duration-300 z-10",
                  isActive ? "text-primary scale-110" : "text-gray-500"
                )} 
              />
              <span className={cn(
                "text-[10px] font-bold mt-1 z-10 transition-colors",
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