'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { SubFilterBar } from '@/components/SubFilterBar';
import { MarketGrid } from '@/components/MarketGrid';
import { useMarketStore } from '@/store/marketStore';
import type { Category } from '@/types/market';

const VALID_CATEGORIES: Category[] = [
  'trending', 'new', 'ireland', 'europe', 'sports', 'politics',
  'crypto', 'finance', 'geopolitics', 'tech', 'culture', 'science', 'mentions',
];

function isValidCategory(value: string | undefined): value is Category {
  return !!value && VALID_CATEGORIES.includes(value as Category);
}

export default function MarketsCategoryPage() {
  const params = useParams();
  const router = useRouter();
  const category = params?.category as string | undefined;
  const activeCategory = useMarketStore((s) => s.activeCategory);
  const setActiveCategory = useMarketStore((s) => s.setActiveCategory);

  useEffect(() => {
    if (!category) return;
    if (!isValidCategory(category)) {
      router.replace('/markets/trending');
      return;
    }
    if (activeCategory !== category) {
      setActiveCategory(category);
    }
  }, [activeCategory, category, router, setActiveCategory]);

  if (category && !isValidCategory(category)) {
    return null;
  }

  return (
    <div className="flex-1 flex flex-col">
      <SubFilterBar />
      <div className="flex-1 p-4 lg:p-6">
        <MarketGrid />
      </div>
    </div>
  );
}
