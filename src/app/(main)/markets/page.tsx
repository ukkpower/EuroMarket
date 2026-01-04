'use client';

import { SubFilterBar } from '@/components/SubFilterBar';
import { MarketGrid } from '@/components/MarketGrid';

export default function MarketsPage() {
  return (
    <div className="flex-1 flex flex-col">
      <SubFilterBar />
      
      <div className="flex-1 p-4 lg:p-6">
        <MarketGrid />
      </div>
    </div>
  );
}

