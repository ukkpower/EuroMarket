import type { Category } from '@/types/market';
import type { LucideIcon } from 'lucide-react';
import {
  LayoutGrid,
  Calendar,
  CalendarDays,
  CalendarRange,
  CalendarCheck,
  Timer,
  TimerReset,
  Clock,
  Clock4,
  LineChart,
  BarChart3,
  Radio,
  TrendingUp,
} from 'lucide-react';

export type SidebarLayoutType = 'general' | 'sports' | 'crypto' | 'finance';

export type SidebarFlatItem = {
  type: 'item';
  label: string;
  id: string;
};

export type SidebarDropdownItem = {
  type: 'dropdown';
  label: string;
  id: string;
  children: { label: string; id: string }[];
};

export type SidebarMenuItem = SidebarFlatItem | SidebarDropdownItem;

export type SidebarSection = {
  title?: string;
  items: SidebarMenuItem[];
};

export type SidebarIconFilter = {
  id: string;
  label: string;
  icon: LucideIcon;
  tagId?: string;
};

const labelToId = (label: string): string =>
  label
    .toLowerCase()
    .replace(/[&]/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

function flat(label: string): SidebarFlatItem {
  return { type: 'item', label, id: labelToId(label) };
}

function dropdown(
  label: string,
  children: Array<string | { label: string; id: string }>
): SidebarDropdownItem {
  return {
    type: 'dropdown',
    label,
    id: labelToId(label),
    children: children.map((child) =>
      typeof child === 'string'
        ? { label: child, id: labelToId(child) }
        : child
    ),
  };
}

export function getSidebarLayout(category: Category): SidebarLayoutType {
  if (category === 'sports') return 'sports';
  if (category === 'crypto') return 'crypto';
  if (category === 'finance') return 'finance';
  return 'general';
}

// ---------------------------------------------------------------------------
// Sports
// ---------------------------------------------------------------------------

export const SPORTS_TOP_FILTERS: SidebarIconFilter[] = [
  { id: 'live', label: 'Live', icon: Radio },
  { id: 'futures', label: 'Futures', icon: TrendingUp },
];

export const SPORTS_SECTION: SidebarSection = {
  title: 'All Sports',
  items: [
    flat('All'),
    dropdown('Football', [
      'UCL', 'EPL', 'La Liga', 'Bundesliga', 'Serie A', 'Ligue 1',
      'UEL', 'UEFA Europa Conference League', 'Europe WC Qualifiers',
      'FA Cup', 'Copa del Rey', 'DFB-Pokal', 'Coupe de France', 'Coppa Italia',
      'EFL Championship', 'Scottish Premiership', 'Primeira Liga', 'Eredivisie',
      'Süper Lig', 'Denmark Superliga', 'Romania SuperLiga', 'Russian Premier League',
      'Serie B', 'Ligue 2', '2. Bundesliga', 'La Liga 2', 'EFL CUP',
      'FIFA World Cup', 'FIFA Friendlies', 'Africa Cup of Nations',
      'Concacaf Nations League', 'Asia WC Qualifiers', 'Africa WC Qualifiers',
      'North America WC Qualifiers', 'South America WC Qualifiers', 'Oceania WC Qualifiers',
      'MLS', 'Saudi Professional League', 'Copa Libertadores', 'Copa Sudamericana',
      'Liga MX', 'Brazil Série A', 'Brazil Série B', 'Primera División Argentina',
      'Colombia Primera A', 'Chile Primera', 'Peru Liga 1', 'Bolivia LFPB',
      'K-League', 'Japan J. League', 'J2 League', 'Chinese Super League',
      'A League Soccer', 'Czechia Fortuna Liga', 'Indian Super League',
      'Egypt Premier League', 'Morocco Botola Pro',
    ]),
    dropdown('Rugby', [
      'Six Nations', 'Super Rugby Pacific', 'Premiership Rugby',
      'Top 14', 'United Rugby Championship', 'European Rugby Champions Cup',
      'The Rugby Championship',
    ]),
    dropdown('Tennis', ['ATP', 'WTA']),
    dropdown('Basketball', [
      'NBA', 'NCAAB', 'LNB', 'Pro A', 'Euroleague Basketball',
      'Champions League', 'Liga Endesa', 'Serie A', 'NBL', 'CBA', 'KBL',
    ]),
    dropdown('Ice Hockey', [
      'NHL', 'American Hockey League', 'Kontinental Hockey League',
      'Deutsche Eishockey Liga', 'Czech Extraliga', 'Swedish Hockey League',
      'Swiss National League',
    ]),
    dropdown('Baseball', ['MLB', 'KBO']),
    dropdown('Combat Sports', ['UFC', 'Zuffa']),
    dropdown('Esports', [
      'LoL', 'CS2', 'Dota 2', 'Valorant', 'Call of Duty', 'Rocket League',
      'Mobile Legends: Bang Bang', 'Overwatch', 'Rainbow Six Siege',
      'Honor of Kings', 'StarCraft II', 'StarCraft: Brood War',
    ]),
    flat('Formula 1'),
    flat('Cycling'),
    flat('Golf'),
    flat('Boxing'),
    flat('Cricket'),
    flat('Horse Racing'),
    flat('Darts'),
    flat('Snooker'),
    flat('Handball'),
    flat('Athletics'),
    flat('Motorsports'),
    flat('American Football'),
    flat('NBA'),
  ],
};

// ---------------------------------------------------------------------------
// Crypto
// ---------------------------------------------------------------------------

export const CRYPTO_TIME_FILTERS: SidebarIconFilter[] = [
  { id: 'all', label: 'All', icon: LayoutGrid },
  { id: '5-min', label: '5 Min', icon: Timer, tagId: '102892' },
  { id: '15-min', label: '15 Min', icon: TimerReset, tagId: '102467' },
  { id: 'hourly', label: '1 Hour', icon: Clock, tagId: '102175' },
  { id: '4-hour', label: '4 Hour', icon: Clock4, tagId: '102531' },
  { id: 'daily', label: 'Daily', icon: Calendar, tagId: '102281' },
  { id: 'weekly', label: 'Weekly', icon: CalendarDays, tagId: '102264' },
  { id: 'monthly', label: 'Monthly', icon: CalendarRange, tagId: '102144' },
  { id: 'yearly', label: 'Yearly', icon: CalendarCheck, tagId: '102536' },
  { id: 'pre-market', label: 'Pre-Market', icon: LineChart, tagId: '102368' },
  { id: 'etf', label: 'ETF', icon: BarChart3, tagId: '833' },
];

// ---------------------------------------------------------------------------
// Finance
// ---------------------------------------------------------------------------

export const FINANCE_TIME_FILTERS: SidebarIconFilter[] = [
  { id: 'all', label: 'All', icon: LayoutGrid },
  { id: 'daily', label: 'Daily', icon: Calendar, tagId: '102281' },
  { id: 'weekly', label: 'Weekly', icon: CalendarDays, tagId: '102264' },
  { id: 'monthly', label: 'Monthly', icon: CalendarRange, tagId: '102144' },
];

export const FINANCE_SECTION: SidebarSection = {
  items: [
    flat('Stocks'),
    flat('Earnings'),
    dropdown('Indices', [
      { label: 'All', id: 'indices' },
      'EURO STOXX 50', 'DAX 40', 'CAC 40', 'FTSE 100',
      'S&P 500', 'NASDAQ', 'Dow Jones', 'Russell 2000',
      'Hang Seng', 'KOSPI',
    ]),
    flat('Economic Indicators'),
    flat('Commodities'),
    flat('Forex'),
    flat('Collectibles'),
    flat('Acquisitions'),
    flat('Earnings Calls'),
    flat('IPOs'),
    flat('Rates Decisions'),
    flat('Prediction Markets'),
    flat('Treasuries'),
  ],
};
