// App Categories
export type Category = 
  | 'trending'
  | 'new'
  | 'ireland'
  | 'europe'
  | 'sports'
  | 'politics'
  | 'crypto'
  | 'finance'
  | 'geopolitics'
  | 'tech'
  | 'culture'
  | 'science'
  | 'mentions';

export type SportsTopFilter = 'live' | 'futures';

export type MarketSortOption =
  | 'volume24hr'
  | 'createdAt'
  | 'volume'
  | 'liquidity'
  | 'endingSoon';

export type MarketStatusFilter = 'active' | 'resolved';

export type SubFilter = {
  id: string;
  label: string;
  category: Category;
  tagId?: string | null;
};

// Category to Polymarket tag ID mapping
// null means no mapping yet (will show all markets)
export const CATEGORY_TO_TAG_ID: Record<Category, string | null> = {
  trending: null,      // No mapping yet
  new: null,           // No mapping yet
  ireland: null,       // No mapping yet
  europe: null,        // No mapping yet
  sports: null,        // No mapping yet - Polymarket has individual sport tags
  politics: '2',       // Politics tag
  crypto: '21',        // Crypto tag
  finance: '120',      // Finance tag
  geopolitics: '100265', // Geopolitics tag
  tech: '1401',        // Tech tag
  culture: '596',      // Culture tag (pop-culture)
  science: '74',       // Science tag
  mentions: '100343',  // Mentions tag
};

// Polymarket API Types
export type PolymarketTag = {
  id: string;
  slug: string;
  label: string;
  forceShow?: boolean;
};

export type PolymarketMarket = {
  id: string;
  question: string;
  conditionId: string;
  slug: string;
  endDate: string;
  endDateIso?: string;
  description: string;
  createdAt?: string;
  updatedAt?: string;
  outcomes: string; // JSON string like '["Yes", "No"]'
  outcomePrices: string; // JSON string like '[0.19, 0.81]'
  volume: string;
  liquidity: string;
  active: boolean;
  closed: boolean;
  acceptingOrders?: boolean;
  ended?: boolean | null;
  marketType: string;
  groupItemTitle?: string; // For multi-market events, this is the option label
  groupItemThreshold?: string;
  questionID?: string;
  negRisk?: boolean;
  negRiskRequestID?: string;
  resolvedBy?: string;
  umaResolutionStatuses?: string;
  // Keep these optional because Gamma can add/remove fields over time.
  resolutionStatus?: string;
  finalReviewEnd?: string;
  finalReviewEndsAt?: string;
  reviewEnd?: string;
  livenessEndsAt?: string;
};

export type ResolutionStepKind =
  | 'outcome_proposed'
  | 'disputed'
  | 'final_review'
  | 'resolved'
  | 'other';

export type MarketResolutionStep = {
  kind: ResolutionStepKind;
  label: string;
  occurredAt?: string;
  endsAt?: string;
  isCurrent?: boolean;
};

export type PolymarketEvent = {
  id: string;
  ticker?: string;
  slug: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  image: string;
  icon: string;
  active: boolean;
  closed: boolean;
  ended?: boolean | null;
  archived: boolean;
  new: boolean;
  featured: boolean;
  restricted: boolean;
  volume: string;
  liquidity: string;
  markets: PolymarketMarket[];
  tags: PolymarketTag[];
  commentCount: number;
};

// Parsed/transformed types for component use
export type ParsedMarket = {
  id: string;
  question: string;
  slug: string;
  endDate: string;
  endDateIso?: string;
  conditionId: string;
  outcomes: string[];
  outcomePrices: number[];
  volume: number;
  liquidity: number;
  active: boolean;
  closed: boolean;
  acceptingOrders?: boolean;
  isEnded: boolean;
  groupItemTitle?: string;
  resolvedBy?: string;
  resolutionRequestId?: string;
  isInResolution?: boolean;
  resolutionSteps?: MarketResolutionStep[];
  yesPrice: number;
  noPrice: number;
  probability: number; // 0-100
};

export type ParsedEvent = {
  id: string;
  ticker?: string;
  slug: string;
  title: string;
  description: string;
  image: string;
  icon: string;
  active: boolean;
  closed: boolean;
  volume: number;
  liquidity: number;
  markets: ParsedMarket[];
  tags: PolymarketTag[];
  isSingleMarket: boolean;
  topMarket: ParsedMarket | null;
};

// Order book types
export type OrderBookLevel = {
  price: number;
  size: number;
};

export type OrderBook = {
  bids: OrderBookLevel[];
  asks: OrderBookLevel[];
  spread: number;
  midPrice: number;
};

// Trade types
export type TradeOutcome = 'yes' | 'no';
export type TradeSide = 'buy' | 'sell';
export type OrderType = 'market' | 'limit';

export type TradeOrder = {
  outcome: TradeOutcome;
  type: OrderType;
  limitPrice?: number;
  shares: number;
  estimatedCost: number;
  estimatedPayout: number;
};

// Event page store types
export type EventPageStore = {
  selectedMarketId: string | null;
  tradeSide: TradeSide;
  selectedOutcome: TradeOutcome;
  orderType: OrderType;
  limitPrice: number | null;
  amount: string;
  setSelectedMarket: (id: string | null) => void;
  setTradeSide: (side: TradeSide) => void;
  setSelectedOutcome: (outcome: TradeOutcome) => void;
  setOrderType: (type: OrderType) => void;
  setLimitPrice: (price: number | null) => void;
  setAmount: (amount: string) => void;
  resetTradeForm: () => void;
};

// Store types
export type AdvancedFilters = {
  minLiquidity: boolean;
  closingSoon: boolean;
  highVolatility: boolean;
};

export type MarketStore = {
  activeCategory: Category;
  activeSubFilterId: string | null;
  activeSportsTopFilter: SportsTopFilter | null;
  advancedFilters: AdvancedFilters;
  sortOption: MarketSortOption;
  statusFilter: MarketStatusFilter;
  setActiveCategory: (category: Category) => void;
  setActiveSubFilterId: (id: string | null) => void;
  setActiveSportsTopFilter: (filter: SportsTopFilter | null) => void;
  setAdvancedFilter: (key: keyof AdvancedFilters, value: boolean) => void;
  setSortOption: (option: MarketSortOption) => void;
  setStatusFilter: (filter: MarketStatusFilter) => void;
  resetFilters: () => void;
};
