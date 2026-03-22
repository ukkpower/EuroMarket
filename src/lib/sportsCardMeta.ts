import type { ParsedEvent, ParsedMarket } from '@/types/market';

const TEAM_CODES_REGEX = /([a-z0-9]{2,6})-([a-z0-9]{2,6})-\d{4}-\d{2}-\d{2}(?:-|$)/i;
const DRAW_REGEX = /\bdraw\b/i;
const VS_REGEX = /\bvs\.?\b/i;
const GENERIC_TWO_WAY_OUTCOMES = new Set(['yes', 'no', 'over', 'under']);

function normalizeCode(input: string): string {
  return input.replace(/[^a-z0-9]/gi, '').toUpperCase().slice(0, 3);
}

function extractTeamCodesFromValue(value?: string | null): [string, string] | null {
  if (!value) return null;
  const match = value.match(TEAM_CODES_REGEX);
  if (!match) return null;

  const left = normalizeCode(match[1] ?? '');
  const right = normalizeCode(match[2] ?? '');
  if (!left || !right) return null;

  return [left, right];
}

function isDrawMarket(market: ParsedMarket): boolean {
  return DRAW_REGEX.test(market.groupItemTitle ?? '') || DRAW_REGEX.test(market.question);
}

export function extractTeamCodes(event: ParsedEvent): [string, string] | null {
  return extractTeamCodesFromValue(event.ticker) ?? extractTeamCodesFromValue(event.slug);
}

export function isDrawMatchEvent(event: ParsedEvent): boolean {
  if (event.markets.length < 3) return false;

  const drawMarkets = event.markets.filter(isDrawMarket);
  if (drawMarkets.length === 0) return false;

  const competitorMarkets = event.markets.filter((market) => !isDrawMarket(market));
  return competitorMarkets.length >= 2;
}

export function shouldUseSingleStyleCard(event: ParsedEvent): boolean {
  return event.isSingleMarket || isDrawMatchEvent(event);
}

export function getDrawCardButtonLabels(event: ParsedEvent): [string, string, string] {
  const teamCodes = extractTeamCodes(event);
  if (teamCodes) {
    return [teamCodes[0], 'Draw', teamCodes[1]];
  }
  return ['Yes', 'Draw', 'No'];
}

function toPercent(value: number): number {
  return Math.round(Math.max(0, Math.min(1, value)) * 100);
}

function getTeamNamesFromTitle(title: string): [string, string] | null {
  const parts = title.split(/\s+vs\.?\s+/i);
  if (parts.length !== 2) return null;

  const left = parts[0]?.trim().toLowerCase();
  const right = parts[1]?.trim().toLowerCase();
  if (!left || !right) return null;

  return [left, right];
}

function getMarketSearchText(market: ParsedMarket): string {
  return `${market.groupItemTitle ?? ''} ${market.question}`.toLowerCase();
}

export function getDrawCardOutcomePercentages(event: ParsedEvent): [number, number, number] {
  const drawMarket = event.markets.find(isDrawMarket);
  const competitorMarkets = event.markets.filter((market) => !isDrawMarket(market));

  const teams = getTeamNamesFromTitle(event.title);
  let leftMarket = competitorMarkets[0];
  let rightMarket = competitorMarkets[1];

  if (teams && competitorMarkets.length >= 2) {
    const [leftTeam, rightTeam] = teams;
    const matchedLeft = competitorMarkets.find((market) =>
      getMarketSearchText(market).includes(leftTeam)
    );
    const matchedRight = competitorMarkets.find((market) =>
      getMarketSearchText(market).includes(rightTeam)
    );
    if (matchedLeft) leftMarket = matchedLeft;
    if (matchedRight) rightMarket = matchedRight;
  }

  const left = toPercent(leftMarket?.yesPrice ?? 0.5);
  const draw = toPercent(drawMarket?.yesPrice ?? 0.5);
  const right = toPercent(rightMarket?.yesPrice ?? 0.5);

  return [left, draw, right];
}

export function getTwoWayCardLabels(
  event: ParsedEvent,
  market: ParsedMarket
): [string, string] | null {
  const outcomes = market.outcomes.map((outcome) => outcome.trim().toLowerCase());
  if (outcomes.length !== 2) return null;

  const teamCodes = extractTeamCodes(event);
  if (!teamCodes) return null;

  const isHeadToHeadEvent = VS_REGEX.test(event.title);
  if (!isHeadToHeadEvent) return null;

  const isYesNo = outcomes.includes('yes') && outcomes.includes('no');
  const hasGenericOutcomes = outcomes.some((outcome) => GENERIC_TWO_WAY_OUTCOMES.has(outcome));
  const isWinQuestion = /\bwin\b/i.test(market.question);

  if (hasGenericOutcomes && !(isYesNo && isWinQuestion)) {
    return null;
  }

  return [teamCodes[0], teamCodes[1]];
}
