import type { Category, SubFilter } from '@/types/market';

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
    "Bitcoin", "Ethereum", "XRP", "Binance Coin", 
    "Solana", "TRON", "Lido Staked Ether", 
    "Dogecoin", "Cardano", "Chainlink"
  ],
  finance: [
    "EURO STOXX 50", "DAX 40", "CAC 40", "FTSE 100", 
    "ECB Rate Decision", "Euro Area Inflation", "ASML", 
    "Novo Nordisk", "LVMH", "SAP", 
    "10Y German Bund Yield", "EUR/USD Exchange Rate", "EUR/GBP Exchange Rate"
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

// Sub-filters for each category
export const subFilters: Record<Category, SubFilter[]> = {
  trending: [],
  new: [],
  ireland: NAV_STRUCTURE.ireland.map(label => ({
    id: labelToId(label),
    label,
    category: 'ireland' as Category,
  })),
  europe: NAV_STRUCTURE.europe.map(label => ({
    id: labelToId(label),
    label,
    category: 'europe' as Category,
  })),
  sports: NAV_STRUCTURE.sports.map(label => ({
    id: labelToId(label),
    label,
    category: 'sports' as Category,
  })),
  politics: NAV_STRUCTURE.politics.map(label => ({
    id: labelToId(label),
    label,
    category: 'politics' as Category,
  })),
  crypto: NAV_STRUCTURE.crypto.map(label => ({
    id: labelToId(label),
    label,
    category: 'crypto' as Category,
  })),
  finance: NAV_STRUCTURE.finance.map(label => ({
    id: labelToId(label),
    label,
    category: 'finance' as Category,
  })),
  geopolitics: NAV_STRUCTURE.geopolitics.map(label => ({
    id: labelToId(label),
    label,
    category: 'geopolitics' as Category,
  })),
  tech: NAV_STRUCTURE.tech.map(label => ({
    id: labelToId(label),
    label,
    category: 'tech' as Category,
  })),
  culture: NAV_STRUCTURE.culture.map(label => ({
    id: labelToId(label),
    label,
    category: 'culture' as Category,
  })),
  science: NAV_STRUCTURE.science.map(label => ({
    id: labelToId(label),
    label,
    category: 'science' as Category,
  })),
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
};
