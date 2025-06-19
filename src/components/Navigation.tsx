'use client';

import { Home, Search, Plus, Heart, User, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

const tabs = [
  { id: 'feed', icon: Home, label: 'Feed' },
  { id: 'search', icon: Search, label: 'Căutare' },
  { id: 'post', icon: Plus, label: 'Adaugă' },
  { id: 'liked', icon: Heart, label: 'Favorite' },
  { id: 'profile', icon: User, label: 'Profil' },
  { id: 'settings', icon: Settings, label: 'Setări' },
];

interface NavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function Navigation({ activeTab, onTabChange }: NavigationProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-[#111] border-t-2 border-orange-500 z-50">
      <div className="flex justify-around items-center h-[90px] px-4">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={cn(
                "flex flex-col items-center justify-center py-2 px-3 rounded-lg transition-all duration-200",
                isActive 
                  ? "text-orange-500" 
                  : "text-gray-400 hover:text-gray-300"
              )}
            >
              <Icon 
                size={24} 
                className={cn(
                  "mb-1 transition-all duration-200",
                  isActive && "scale-110"
                )}
              />
              <span className="text-xs font-medium">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
} 