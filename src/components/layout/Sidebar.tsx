'use client';

import { 
  Flame, 
  Clock, 
  Landmark, 
  Trophy, 
  Music, 
  TrendingUp, 
  Cpu,
  HelpCircle,
  Globe,
  Coins,
  Map,
  Flag,
  FlaskConical,
  type LucideIcon
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useRouter, usePathname } from 'next/navigation';
import { useMarketStore } from '@/store/marketStore';
import type { Category } from '@/types/market';
import { cn } from '@/lib/utils';

type CategoryItem = {
  id: Category;
  label: string;
  icon: LucideIcon;
  section: 'global' | 'euro';
};

const categories: CategoryItem[] = [
  // Global Filters
  { id: 'trending', label: 'Trending', icon: Flame, section: 'global' },
  { id: 'new', label: 'New', icon: Clock, section: 'global' },
  // Euro-Centric Categories
  { id: 'ireland', label: 'Ireland', icon: Flag, section: 'euro' },
  { id: 'europe', label: 'Europe', icon: Globe, section: 'euro' },
  { id: 'sports', label: 'Sports', icon: Trophy, section: 'euro' },
  { id: 'politics', label: 'Politics', icon: Landmark, section: 'euro' },
  { id: 'crypto', label: 'Crypto', icon: Coins, section: 'euro' },
  { id: 'finance', label: 'Finance', icon: TrendingUp, section: 'euro' },
  { id: 'geopolitics', label: 'Geopolitics', icon: Map, section: 'euro' },
  { id: 'tech', label: 'Tech', icon: Cpu, section: 'euro' },
  { id: 'culture', label: 'Culture', icon: Music, section: 'euro' },
  { id: 'science', label: 'Science', icon: FlaskConical, section: 'euro' },
];

type SidebarProps = {
  isMobile?: boolean;
};

export function Sidebar({ isMobile = false }: SidebarProps) {
  const { activeCategory, setActiveCategory } = useMarketStore();
  const router = useRouter();
  const pathname = usePathname();

  const globalCategories = categories.filter((c) => c.section === 'global');
  const euroCategories = categories.filter((c) => c.section === 'euro');

  const CategoryButton = ({ item }: { item: CategoryItem }) => {
    const isActive = activeCategory === item.id;
    const Icon = item.icon;

    const handleCategoryClick = () => {
      setActiveCategory(item.id);
      // Navigate to markets page if we're on an event page
      if (pathname?.startsWith('/event/')) {
        router.push('/markets');
      }
    };

    return (
      <motion.button
        whileHover={{ x: 4 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleCategoryClick}
        className={cn(
          'relative w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors',
          isActive
            ? 'text-primary bg-accent'
            : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
        )}
      >
        {isActive && (
          <motion.div
            layoutId="sidebar-indicator"
            className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-r-full"
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          />
        )}
        <Icon className={cn('h-5 w-5', isActive && 'text-primary')} />
        <span>{item.label}</span>
        {item.id === 'trending' && (
          <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">
            12
          </span>
        )}
      </motion.button>
    );
  };

  return (
    <aside
      className={cn(
        'flex flex-col h-full',
        isMobile 
          ? 'w-full bg-background pt-6' 
          : 'w-64 glass border-r border-border/50'
      )}
    >
      {/* Logo for mobile */}
      {isMobile && (
        <div className="px-4 pb-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">€</span>
            </div>
            <span className="font-bold text-xl">
              Euro<span className="text-primary">Bourse</span>
            </span>
          </div>
        </div>
      )}

      <div className="flex-1 px-3 py-4 space-y-6 overflow-y-auto scrollbar-hide">
        {/* Global Filters */}
        <div className="space-y-1">
          <p className="px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            Discover
          </p>
          {globalCategories.map((item) => (
            <CategoryButton key={item.id} item={item} />
          ))}
        </div>

        {/* Euro-Centric Categories */}
        <div className="space-y-1">
          <p className="px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            Markets
          </p>
          {euroCategories.map((item) => (
            <CategoryButton key={item.id} item={item} />
          ))}
        </div>
      </div>

      {/* Footer Links */}
      <div className="px-3 py-4 border-t border-border/50 space-y-1">
        <motion.button
          whileHover={{ x: 4 }}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors"
        >
          <HelpCircle className="h-5 w-5" />
          <span>Help & Support</span>
        </motion.button>
      </div>
    </aside>
  );
}
