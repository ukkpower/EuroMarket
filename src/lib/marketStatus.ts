type MarketStatusInput = {
  active?: boolean;
  closed?: boolean;
  ended?: boolean | null;
  endDate?: string | null;
  endDateIso?: string | null;
};

const ET_TIMEZONE = 'America/New_York';
const DATE_ONLY_REGEX = /^\d{4}-\d{2}-\d{2}$/;

function isValidDate(date: Date): boolean {
  return !Number.isNaN(date.getTime());
}

function parseDateOnly(value?: string | null): {
  year: number;
  month: number;
  day: number;
} | null {
  if (!value || !DATE_ONLY_REGEX.test(value)) return null;
  const [year, month, day] = value.split('-').map(Number);
  return { year, month, day };
}

function getTimeZoneOffsetMinutes(date: Date, timeZone: string): number {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    timeZoneName: 'shortOffset',
    hour: '2-digit',
  }).formatToParts(date);

  const offsetToken = parts.find((part) => part.type === 'timeZoneName')?.value ?? '';
  const match = offsetToken.match(/^GMT([+-])(\d{1,2})(?::(\d{2}))?$/);

  if (!match) return 0;

  const sign = match[1] === '+' ? 1 : -1;
  const hours = Number(match[2]);
  const minutes = Number(match[3] ?? '0');
  return sign * (hours * 60 + minutes);
}

function getEndOfDayInEasternTime(dateIso: string | null): Date | null {
  const parsed = parseDateOnly(dateIso);
  if (!parsed) return null;

  const { year, month, day } = parsed;
  const probeAtNoonUtc = new Date(Date.UTC(year, month - 1, day, 12, 0, 0, 0));
  const offsetMinutes = getTimeZoneOffsetMinutes(probeAtNoonUtc, ET_TIMEZONE);
  const endOfDayAsUtc = Date.UTC(year, month - 1, day, 23, 59, 59, 999);

  return new Date(endOfDayAsUtc - offsetMinutes * 60 * 1000);
}

function isMidnightUtc(isoString: string): boolean {
  const parsed = new Date(isoString);
  if (!isValidDate(parsed)) return false;
  return parsed.toISOString().endsWith('T00:00:00.000Z');
}

export function getEffectiveMarketEndDate(market: MarketStatusInput): Date | null {
  const parsedDateOnly = parseDateOnly(market.endDateIso);
  const hasDateOnly = Boolean(parsedDateOnly);
  const dateOnlyValue = parsedDateOnly ? market.endDateIso ?? null : null;

  if (market.endDate && hasDateOnly && isMidnightUtc(market.endDate)) {
    return getEndOfDayInEasternTime(dateOnlyValue);
  }

  if (market.endDate) {
    const parsed = new Date(market.endDate);
    if (isValidDate(parsed)) return parsed;
  }

  if (hasDateOnly) {
    return getEndOfDayInEasternTime(dateOnlyValue);
  }

  return null;
}

export function isMarketEnded(market: MarketStatusInput, now = new Date()): boolean {
  if (typeof market.ended === 'boolean') return market.ended;
  if (market.closed) return true;
  if (market.active) return false;

  const effectiveEnd = getEffectiveMarketEndDate(market);
  return Boolean(effectiveEnd && effectiveEnd.getTime() <= now.getTime());
}

export function formatMarketTimeRemaining(market: MarketStatusInput, now = new Date()): string {
  if (isMarketEnded(market, now)) return 'Ended';

  const end = getEffectiveMarketEndDate(market);
  if (!end) return 'Active';

  const diff = end.getTime() - now.getTime();
  if (diff <= 0) {
    // If market is still active after end timestamp, defer to status flags from API.
    return 'Active';
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

  if (days > 30) {
    const months = Math.floor(days / 30);
    return `${months}mo remaining`;
  }

  if (days > 0) {
    return `${days}d ${hours}h remaining`;
  }

  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  return `${hours}h ${minutes}m remaining`;
}
