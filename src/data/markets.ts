import type { Market, SubFilter, Category } from '@/types/market';

// Sub-filters for each category
export const subFilters: Record<Category, SubFilter[]> = {
  trending: [],
  new: [],
  politics: [
    { id: 'eu-parliament', label: 'EU Parliament', category: 'politics' },
    { id: 'national-elections', label: 'National Elections', category: 'politics' },
    { id: 'brexit', label: 'Brexit', category: 'politics' },
    { id: 'nato', label: 'NATO', category: 'politics' },
  ],
  football: [
    { id: 'champions-league', label: 'Champions League', category: 'football' },
    { id: 'premier-league', label: 'Premier League', category: 'football' },
    { id: 'euro-2028', label: 'Euro 2028', category: 'football' },
    { id: 'transfer-window', label: 'Transfer Window', category: 'football' },
    { id: 'sack-race', label: 'Sack Race', category: 'football' },
  ],
  culture: [
    { id: 'eurovision', label: 'Eurovision', category: 'culture' },
    { id: 'oscars', label: 'Oscars', category: 'culture' },
    { id: 'netflix', label: 'Netflix', category: 'culture' },
    { id: 'royal-family', label: 'Royal Family', category: 'culture' },
    { id: 'glastonbury', label: 'Glastonbury', category: 'culture' },
  ],
  finance: [
    { id: 'ecb-rates', label: 'ECB Rates', category: 'finance' },
    { id: 'inflation', label: 'Inflation', category: 'finance' },
    { id: 'euro-tech', label: 'Euro-Tech', category: 'finance' },
    { id: 'crypto', label: 'Crypto', category: 'finance' },
  ],
  climate: [
    { id: 'green-energy', label: 'Green Energy', category: 'climate' },
    { id: 'eu-weather', label: 'European Weather', category: 'climate' },
    { id: 'emissions', label: 'Emissions', category: 'climate' },
  ],
  tech: [
    { id: 'ai-act', label: 'AI Act', category: 'tech' },
    { id: 'eu-regulations', label: 'EU Regulations', category: 'tech' },
    { id: 'startups', label: 'Startups', category: 'tech' },
    { id: 'big-tech', label: 'Big Tech', category: 'tech' },
  ],
};

// Generate random sparkline data
const generateSparkline = (): number[] => {
  const points = [];
  let value = 0.4 + Math.random() * 0.2;
  for (let i = 0; i < 24; i++) {
    value += (Math.random() - 0.5) * 0.08;
    value = Math.max(0.1, Math.min(0.9, value));
    points.push(value);
  }
  return points;
};

// Mock market data
export const markets: Market[] = [
  // Trending
  {
    id: '1',
    title: 'Will the ECB cut interest rates in March 2026?',
    category: 'finance',
    subCategory: 'ecb-rates',
    icon: '🏦',
    yesPrice: 0.45,
    noPrice: 0.55,
    volume: 1250000,
    probability: 45,
    priceHistory: generateSparkline(),
    endDate: '2026-03-15',
    isHot: true,
  },
  {
    id: '2',
    title: 'Will France win Euro 2028?',
    category: 'football',
    subCategory: 'euro-2028',
    icon: '⚽',
    yesPrice: 0.22,
    noPrice: 0.78,
    volume: 3400000,
    probability: 22,
    priceHistory: generateSparkline(),
    endDate: '2028-07-14',
    isHot: true,
  },
  {
    id: '3',
    title: 'Will Ukraine join the EU by 2030?',
    category: 'politics',
    subCategory: 'eu-parliament',
    icon: '🇪🇺',
    yesPrice: 0.31,
    noPrice: 0.69,
    volume: 890000,
    probability: 31,
    priceHistory: generateSparkline(),
    endDate: '2030-01-01',
    isHot: true,
  },
  {
    id: '4',
    title: 'Will Sweden win Eurovision 2026?',
    category: 'culture',
    subCategory: 'eurovision',
    icon: '🎤',
    yesPrice: 0.18,
    noPrice: 0.82,
    volume: 450000,
    probability: 18,
    priceHistory: generateSparkline(),
    endDate: '2026-05-20',
    isNew: true,
  },
  {
    id: '5',
    title: 'Will EU inflation fall below 2% by Q2 2026?',
    category: 'finance',
    subCategory: 'inflation',
    icon: '📊',
    yesPrice: 0.62,
    noPrice: 0.38,
    volume: 720000,
    probability: 62,
    priceHistory: generateSparkline(),
    endDate: '2026-06-30',
  },
  {
    id: '6',
    title: 'Will Manchester City win the Premier League?',
    category: 'football',
    subCategory: 'premier-league',
    icon: '🏆',
    yesPrice: 0.35,
    noPrice: 0.65,
    volume: 2100000,
    probability: 35,
    priceHistory: generateSparkline(),
    endDate: '2026-05-25',
  },
  {
    id: '7',
    title: 'Will the EU AI Act enforcement begin on time?',
    category: 'tech',
    subCategory: 'ai-act',
    icon: '🤖',
    yesPrice: 0.73,
    noPrice: 0.27,
    volume: 340000,
    probability: 73,
    priceHistory: generateSparkline(),
    endDate: '2026-08-01',
    isNew: true,
  },
  {
    id: '8',
    title: 'Will Germany reach 80% renewable energy by 2030?',
    category: 'climate',
    subCategory: 'green-energy',
    icon: '🌱',
    yesPrice: 0.41,
    noPrice: 0.59,
    volume: 560000,
    probability: 41,
    priceHistory: generateSparkline(),
    endDate: '2030-01-01',
  },
  {
    id: '9',
    title: 'Will Real Madrid win Champions League 2026?',
    category: 'football',
    subCategory: 'champions-league',
    icon: '⭐',
    yesPrice: 0.28,
    noPrice: 0.72,
    volume: 1800000,
    probability: 28,
    priceHistory: generateSparkline(),
    endDate: '2026-06-01',
    isHot: true,
  },
  {
    id: '10',
    title: 'Will there be a new UK general election in 2026?',
    category: 'politics',
    subCategory: 'national-elections',
    icon: '🗳️',
    yesPrice: 0.15,
    noPrice: 0.85,
    volume: 290000,
    probability: 15,
    priceHistory: generateSparkline(),
    endDate: '2026-12-31',
  },
  {
    id: '11',
    title: 'Will Apple be fined by the EU again in 2026?',
    category: 'tech',
    subCategory: 'big-tech',
    icon: '🍎',
    yesPrice: 0.55,
    noPrice: 0.45,
    volume: 410000,
    probability: 55,
    priceHistory: generateSparkline(),
    endDate: '2026-12-31',
  },
  {
    id: '12',
    title: 'Will the next James Bond film release in 2026?',
    category: 'culture',
    subCategory: 'netflix',
    icon: '🎬',
    yesPrice: 0.25,
    noPrice: 0.75,
    volume: 180000,
    probability: 25,
    priceHistory: generateSparkline(),
    endDate: '2026-12-31',
    isNew: true,
  },
];

// Helper function to filter markets
export const filterMarkets = (
  category: Category,
  subFilters: string[],
  searchQuery: string
): Market[] => {
  let filtered = [...markets];
  
  // Filter by category
  if (category === 'trending') {
    filtered = filtered.filter((m) => m.isHot);
  } else if (category === 'new') {
    filtered = filtered.filter((m) => m.isNew);
  } else {
    filtered = filtered.filter((m) => m.category === category);
  }
  
  // Filter by sub-filters
  if (subFilters.length > 0) {
    filtered = filtered.filter((m) => 
      m.subCategory && subFilters.includes(m.subCategory)
    );
  }
  
  // Filter by search query
  if (searchQuery.trim()) {
    const query = searchQuery.toLowerCase();
    filtered = filtered.filter((m) =>
      m.title.toLowerCase().includes(query)
    );
  }
  
  return filtered;
};

// Format Euro currency
export const formatEuro = (amount: number): string => {
  if (amount >= 1000000) {
    return `€${(amount / 1000000).toFixed(1)}M`;
  }
  if (amount >= 1000) {
    return `€${(amount / 1000).toFixed(0)}K`;
  }
  return `€${amount.toFixed(2)}`;
};

// Format price for buttons
export const formatPrice = (price: number): string => {
  return `€${price.toFixed(2)}`;
};

