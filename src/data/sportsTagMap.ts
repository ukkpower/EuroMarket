import generatedData from './sportsTagMap.generated.json';

export const SPORTS_ROOT_TAG_ID = '1';

type SportsTagMapData = {
  map?: Record<string, string>;
};

const sportsTagMapData = generatedData as SportsTagMapData;

export const SPORTS_EXACT_TAG_BY_MENU_ID: Record<string, string> =
  sportsTagMapData.map ?? {};

export function resolveSportsTagId(menuId: string | null | undefined): string {
  if (!menuId || menuId === 'all') {
    return SPORTS_ROOT_TAG_ID;
  }

  return SPORTS_EXACT_TAG_BY_MENU_ID[menuId] ?? SPORTS_ROOT_TAG_ID;
}
