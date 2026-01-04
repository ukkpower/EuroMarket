export type Category = 
  | 'trending'
  | 'new'
  | 'politics'
  | 'football'
  | 'culture'
  | 'finance'
  | 'climate'
  | 'tech';

export type SubFilter = {
  id: string;
  label: string;
  category: Category;
};

export type Market = {
  id: string;
  title: string;
  category: Category;
  subCategory?: string;
  icon: string;
  yesPrice: number; // Price in Euro (0-1)
  noPrice: number;  // Price in Euro (0-1)
  volume: number;   // Total volume in Euro
  probability: number; // Percentage 0-100
  priceHistory: number[]; // 24h price history for sparkline
  endDate: string;
  isHot?: boolean;
  isNew?: boolean;
};

export type AdvancedFilters = {
  minLiquidity: boolean;
  closingSoon: boolean;
  highVolatility: boolean;
};

export type MarketStore = {
  activeCategory: Category;
  subFilters: string[];
  advancedFilters: AdvancedFilters;
  searchQuery: string;
  setActiveCategory: (category: Category) => void;
  toggleSubFilter: (filterId: string) => void;
  setAdvancedFilter: (key: keyof AdvancedFilters, value: boolean) => void;
  setSearchQuery: (query: string) => void;
  resetFilters: () => void;
};

