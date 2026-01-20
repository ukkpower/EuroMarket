import { create } from 'zustand';
import type { Category, AdvancedFilters, MarketStore } from '@/types/market';

const initialAdvancedFilters: AdvancedFilters = {
  minLiquidity: false,
  closingSoon: false,
  highVolatility: false,
};

export const useMarketStore = create<MarketStore>((set) => ({
  activeCategory: 'trending',
  subFilters: [],
  searchQuery: '',
  advancedFilters: initialAdvancedFilters,
  
  setActiveCategory: (category: Category) => 
    set({ activeCategory: category, subFilters: [] }),
  
  toggleSubFilter: (filterId: string) =>
    set((state) => ({
      subFilters: state.subFilters.includes(filterId)
        ? state.subFilters.filter((id) => id !== filterId)
        : [...state.subFilters, filterId],
    })),
  
  setSearchQuery: (query: string) => set({ searchQuery: query }),
  
  setAdvancedFilter: (key: keyof AdvancedFilters, value: boolean) =>
    set((state) => ({
      advancedFilters: { ...state.advancedFilters, [key]: value },
    })),
  
  resetFilters: () =>
    set({
      activeCategory: 'trending',
      subFilters: [],
      advancedFilters: initialAdvancedFilters,
      searchQuery: '',
    }),
}));
