'use client';

import { useRef, useState, useEffect, type ComponentType } from 'react';
import { 
  Flame, Clock, Flag, Bookmark,
  ChevronLeft, ChevronRight,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useRouter, usePathname } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { EuropeGlobeIcon } from '@/components/icons/EuropeGlobeIcon';
import { useMarketStore } from '@/store/marketStore';
import type { Category } from '@/types/market';
import { cn } from '@/lib/utils';
import { useWallet } from '@/providers/WalletContext';

type CategoryItem = {
  id: Category;
  icon?: ComponentType<{ className?: string }>;
};

const categories: CategoryItem[] = [
  { id: 'trending', icon: Flame },
  { id: 'new', icon: Clock },
  { id: 'ireland', icon: Flag },
  { id: 'europe', icon: EuropeGlobeIcon },
  { id: 'sports' },
  { id: 'politics' },
  { id: 'crypto' },
  { id: 'finance' },
  { id: 'geopolitics' },
  { id: 'tech' },
  { id: 'culture' },
  { id: 'science' },
  { id: 'mentions' },
];

const VALID_CATEGORIES: Category[] = [
  'trending', 'new', 'ireland', 'europe', 'sports', 'politics',
  'crypto', 'finance', 'geopolitics', 'tech', 'culture', 'science', 'mentions',
];

function categoryFromPathname(pathname: string): Category | null {
  const match = pathname.match(/^\/markets\/([^/]+)/);
  const segment = match?.[1];
  return segment && VALID_CATEGORIES.includes(segment as Category)
    ? (segment as Category)
    : null;
}

export function CategoryBar() {
  const { t } = useTranslation();
  const scrollRef = useRef<HTMLDivElement>(null);
  const { activeCategory, setActiveCategory } = useMarketStore();
  const { isConnected, connect } = useWallet();
  const router = useRouter();
  const pathname = usePathname();
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);
  const categoryFromUrl = categoryFromPathname(pathname);
  const isBookmarksPage = pathname === '/bookmarks';
  const isEventPage = pathname.startsWith('/event/');
  const effectiveCategory = (isBookmarksPage || isEventPage)
    ? null
    : (categoryFromUrl ?? activeCategory);

  const checkScrollPosition = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setShowLeftArrow(scrollLeft > 0);
    setShowRightArrow(scrollLeft + clientWidth < scrollWidth - 1);
  };

  useEffect(() => {
    checkScrollPosition();
    const ref = scrollRef.current;
    ref?.addEventListener('scroll', checkScrollPosition);
    window.addEventListener('resize', checkScrollPosition);
    return () => {
      ref?.removeEventListener('scroll', checkScrollPosition);
      window.removeEventListener('resize', checkScrollPosition);
    };
  }, []);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -200 : 200,
        behavior: 'smooth',
      });
    }
  };

  const handleCategoryClick = (categoryId: Category) => {
    const targetPath = `/markets/${categoryId}`;
    if (!pathname.startsWith(targetPath)) {
      router.push(targetPath);
    }
    setActiveCategory(categoryId);
  };

  const handleBookmarksClick = async () => {
    if (isConnected) {
      router.push('/bookmarks');
      return;
    }

    const connectedAddress = await connect();
    if (connectedAddress) {
      router.push('/bookmarks');
    }
  };

  return (
    <div className="sticky top-16 z-40 w-full bg-background/95 backdrop-blur-sm border-b border-border/50">
      <div className="relative container mx-auto">
        {showLeftArrow && (
          <button
            onClick={() => scroll('left')}
            className="absolute left-0 top-0 bottom-0 z-10 w-10 flex items-center justify-center bg-gradient-to-r from-background to-transparent"
          >
            <ChevronLeft className="h-4 w-4 text-muted-foreground" />
          </button>
        )}

        <div
          ref={scrollRef}
          className="flex items-center gap-1 overflow-x-auto scrollbar-hide px-4 py-2"
        >
          {categories.map((cat) => {
            const isActive = effectiveCategory === cat.id;
            const Icon = cat.icon;
            return (
              <motion.button
                key={cat.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleCategoryClick(cat.id)}
                className={cn(
                  'relative flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium whitespace-nowrap transition-colors',
                  isActive
                    ? 'text-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="category-bar-indicator"
                    className="absolute inset-0 bg-secondary rounded-md"
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                )}
                {Icon && <Icon className="h-4 w-4 relative z-10" />}
                <span className="relative z-10">
                  {t(`categories.short.${cat.id}`)}
                </span>
              </motion.button>
            );
          })}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleBookmarksClick}
            aria-label={t('bookmarks.menuAria')}
            title={t('bookmarks.menuLabel')}
            className={cn(
              'relative flex items-center justify-center px-3 py-1.5 rounded-md transition-colors',
              isBookmarksPage
                ? 'text-primary'
                : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
            )}
          >
            {isBookmarksPage && (
              <motion.div
                layoutId="category-bar-indicator"
                className="absolute inset-0 bg-secondary rounded-md"
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              />
            )}
            <Bookmark className={cn('h-4 w-4 relative z-10', isBookmarksPage && 'fill-current')} />
          </motion.button>
        </div>

        {showRightArrow && (
          <button
            onClick={() => scroll('right')}
            className="absolute right-0 top-0 bottom-0 z-10 w-10 flex items-center justify-center bg-gradient-to-l from-background to-transparent"
          >
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </button>
        )}
      </div>
    </div>
  );
}
