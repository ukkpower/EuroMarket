'use client';

import { motion } from 'framer-motion';
import { TrendingUp, ClipboardList, History } from 'lucide-react';
import type { PortfolioTab } from '@/types/trading';
import { cn } from '@/lib/utils';

const TABS: { id: PortfolioTab; label: string; icon: typeof TrendingUp }[] = [
  { id: 'positions', label: 'Positions', icon: TrendingUp },
  { id: 'orders', label: 'Open Orders', icon: ClipboardList },
  { id: 'history', label: 'Trade History', icon: History },
];

interface PortfolioTabsProps {
  activeTab: PortfolioTab;
  onTabChange: (tab: PortfolioTab) => void;
  orderCount?: number;
}

export default function PortfolioTabs({
  activeTab,
  onTabChange,
  orderCount,
}: PortfolioTabsProps) {
  return (
    <div className="flex items-center gap-1 p-1 bg-secondary/50 rounded-xl">
      {TABS.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={cn(
              'relative flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg transition-colors',
              isActive
                ? 'text-foreground'
                : 'text-muted-foreground hover:text-foreground/70'
            )}
          >
            {isActive && (
              <motion.div
                layoutId="portfolio-tab-bg"
                className="absolute inset-0 bg-card rounded-lg shadow-sm border border-border/50"
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              />
            )}
            <span className="relative flex items-center gap-1.5">
              <Icon className="h-4 w-4" />
              <span className="hidden sm:inline">{tab.label}</span>
              {tab.id === 'orders' && orderCount !== undefined && orderCount > 0 && (
                <span className="ml-0.5 px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-primary text-primary-foreground leading-none">
                  {orderCount}
                </span>
              )}
            </span>
          </button>
        );
      })}
    </div>
  );
}
