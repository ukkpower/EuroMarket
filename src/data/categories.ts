import type { Category, SubFilter } from '@/types/market';

// Static vs dynamic category sources for sidebar subfilters
export const STATIC_CATEGORIES = [
  'ireland',
  'europe',
  'sports',
  'crypto',
  'finance',
] as const satisfies readonly Category[];

export const DYNAMIC_CATEGORIES = [
  'politics',
  'geopolitics',
  'tech',
  'culture',
  'science',
] as const satisfies readonly Category[];
/** Polymarket API slug for related-tags endpoint (culture/science differ from category id) */
export const DYNAMIC_CATEGORY_TO_SLUG: Record<(typeof DYNAMIC_CATEGORIES)[number], string> = {
  politics: 'politics',
  geopolitics: 'geopolitics',
  tech: 'tech',
  culture: 'pop-culture',
  science: 'climate-science',
};

export function isDynamicCategory(cat: Category): cat is (typeof DYNAMIC_CATEGORIES)[number] {
  return (DYNAMIC_CATEGORIES as readonly Category[]).includes(cat);
}

// Helper function to convert label to id (slug format)
const labelToId = (label: string): string => {
  return label
    .toLowerCase()
    .replace(/[&]/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

// Navigation structure for sub-categories
export const NAV_STRUCTURE = {
  ireland: [
    "Politics", 
    "Sports", 
    "Business", 
    "Housing", 
    "Society", 
    "Lifestyle", 
    "Entertainment"
  ],
  europe: [
    "Albania", "Andorra", "Armenia", "Austria", "Azerbaijan", "Belarus", "Belgium", 
    "Bosnia and Herzegovina", "Bulgaria", "Croatia", "Cyprus", "Czech Republic", 
    "Denmark", "Estonia", "Finland", "France", "Georgia", "Germany", "Greece", 
    "Hungary", "Iceland", "Ireland", "Italy", "Kazakhstan", "Kosovo", "Latvia", 
    "Liechtenstein", "Lithuania", "Luxembourg", "Malta", "Moldova", "Monaco", 
    "Montenegro", "Netherlands", "North Macedonia", "Norway", "Poland", "Portugal", 
    "Romania", "Russia", "San Marino", "Serbia", "Slovakia", "Slovenia", "Spain", 
    "Sweden", "Switzerland", "Türkiye", "Ukraine", "United Kingdom", "Vatican City"
  ],
  sports: [
    "Football", "Rugby", "Formula 1", "Tennis", "Basketball", "Cycling", 
    "Golf", "Boxing", "Cricket", "Horse Racing", "Darts", "Snooker", 
    "Ice Hockey", "Handball", "Athletics", "Combat Sports", 
    "Motorsports", "American Football", "NBA"
  ],
  politics: [
    "EU Parliament", "National Elections", "Leadership Changes", 
    "NATO & Security", "Trade Policy & Tariffs", "Defence Spending", 
    "EU Enlargement", "Digital & AI Regulation", "EU Budget", 
    "Migration Policy", "Transatlantic Relations"
  ],
  crypto: [
    "Bitcoin", "Ethereum", "XRP", "Solana", "Dogecoin"
  ],
  finance: [
    "Stocks", "Earnings", "Indices", "Economic Indicators",
    "DAX 40", "S&P 500", "FTSE 100", "NASDAQ", "Dow Jones",
    "Russell 2000", "Hang Seng", "KOSPI",
    "Commodities", "Forex", "Collectibles", "Acquisitions",
    "Earnings Calls", "IPOs", "Rates Decisions", "Prediction Markets",
    "Treasuries"
  ],
  geopolitics: [
    "Energy Security", "EU-China Relations", "G7 & G20 Summits", 
    "Middle East Impact", "Arctic Sovereignty", "Global Shipping", 
    "Sanctions Policy", "United Nations Decisions", "Space Sovereignty"
  ],
  tech: [
    "EU AI Act Compliance", "Semiconductor Independence", "Quantum Computing", 
    "Cybersecurity Threats", "Big Tech Antitrust", "6G Rollout", 
    "European Space Agency", "Green Tech & Hydrogen", "Data Sovereignty"
  ],
  culture: [
    "Eurovision Song Contest", "Royal Family", "Cannes Film Festival", 
    "Nobel Prize", "Michelin Guide Announcements", "Luxury Fashion Weeks", 
    "Glastonbury & Summer Festivals", "Art Market", "European Heritage Awards"
  ],
  science: [
    "Climate Science", "Space Exploration", "Medical Breakthroughs", 
    "AI Research", "Quantum Physics", "Biotechnology", 
    "Renewable Energy", "Particle Physics", "Neuroscience"
  ]
};

// Optional Polymarket tag_id per sub-filter (populate from GET /tags or /sports when known)
// When absent, fetch uses category-level CATEGORY_TO_TAG_ID.
export const SUB_FILTER_TAG_IDS: Record<string, string> = {
  bitcoin: '235',
  ethereum: '39',
  xrp: '101267',
  solana: '818',
  dogecoin: '100178',
  earnings: '1013',
  'economic-indicators': '102000',
  indices: '102682',
  dax: '102688',
  'dax-40': '102688',
  spx: '102683',
  'sandp-500': '102683',
  ftse: '102689',
  'ftse-100': '102689',
  nasdaq: '102685',
  dow: '102690',
  'dow-jones': '102690',
  russell: '102686',
  'russell-2000': '102686',
  'hang-seng': '102687',
  kospi: '103270',
  forex: '101705',
  acquisitions: '102691',
  'earnings-calls': '1013',
  ipos: '600',
  'rates-decisions': '100196',
  'prediction-markets': '93',
  treasuries: '102028',
  stocks: '604',
  commodities: '101031',
  collectibles: '102932',
  collectables: '102932',
};

function subFilterWithTagId(
  label: string,
  category: Category
): SubFilter {
  const id = labelToId(label);
  return {
    id,
    label,
    category,
    tagId: SUB_FILTER_TAG_IDS[id] ?? undefined,
  };
}

// Sub-filters for each category (dynamic categories get subfilters from API via useRelatedTags)
export const subFilters: Record<Category, SubFilter[]> = {
  trending: [],
  new: [],
  ireland: NAV_STRUCTURE.ireland.map((label) =>
    subFilterWithTagId(label, 'ireland')
  ),
  europe: NAV_STRUCTURE.europe.map((label) =>
    subFilterWithTagId(label, 'europe')
  ),
  sports: NAV_STRUCTURE.sports.map((label) =>
    subFilterWithTagId(label, 'sports')
  ),
  politics: [],
  crypto: NAV_STRUCTURE.crypto.map((label) =>
    subFilterWithTagId(label, 'crypto')
  ),
  finance: NAV_STRUCTURE.finance.map((label) =>
    subFilterWithTagId(label, 'finance')
  ),
  geopolitics: [],
  tech: [],
  culture: [],
  science: [],
  mentions: [],
};

// Category display labels
export const categoryLabels: Record<Category, string> = {
  trending: 'Trending Markets',
  new: 'New Markets',
  ireland: 'Ireland',
  europe: 'Europe',
  sports: 'Sports',
  politics: 'Politics',
  crypto: 'Crypto',
  finance: 'Finance',
  geopolitics: 'Geopolitics',
  tech: 'Tech',
  culture: 'Culture',
  science: 'Science',
  mentions: 'Mentions',
};
