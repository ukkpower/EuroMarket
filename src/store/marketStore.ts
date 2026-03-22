import { create } from 'zustand';
import type { Category, AdvancedFilters, MarketStore } from '@/types/market';

const initialAdvancedFilters: AdvancedFilters = {
  minLiquidity: false,
  closingSoon: false,
  highVolatility: false,
};

export const useMarketStore = create<MarketStore>((set) => ({
  activeCategory: 'trending',
  activeSubFilterId: null,
  activeSportsTopFilter: null,
  advancedFilters: initialAdvancedFilters,
  sortOption: 'volume24hr',
  statusFilter: 'active',

  setActiveCategory: (category: Category) =>
    set({
      activeCategory: category,
      activeSubFilterId: null,
      activeSportsTopFilter: null,
    }),

  setActiveSubFilterId: (id: string | null) => set({ activeSubFilterId: id }),

  setActiveSportsTopFilter: (filter) => set({ activeSportsTopFilter: filter }),

  setAdvancedFilter: (key: keyof AdvancedFilters, value: boolean) =>
    set((state) => ({
      advancedFilters: { ...state.advancedFilters, [key]: value },
    })),

  setSortOption: (option) => set({ sortOption: option }),

  setStatusFilter: (filter) => set({ statusFilter: filter }),

  resetFilters: () =>
    set({
      activeCategory: 'trending',
      activeSubFilterId: null,
      activeSportsTopFilter: null,
      advancedFilters: initialAdvancedFilters,
      sortOption: 'volume24hr',
      statusFilter: 'active',
    }),
}));
