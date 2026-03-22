#!/usr/bin/env node

import fs from 'node:fs/promises';
import path from 'node:path';

const GAMMA_API_BASE = 'https://gamma-api.polymarket.com';
const SPORTS_ROOT_TAG_ID = '1';

const SIDEBAR_CONFIG_PATH = path.join(process.cwd(), 'src/data/sidebarConfig.ts');
const OUTPUT_PATH = path.join(process.cwd(), 'src/data/sportsTagMap.generated.json');

const MENU_ID_ALIASES = {
  'formula-1': ['formula1'],
  'football': ['soccer'],
  'rugby': ['rugby-union', 'rugby'],
  'american-football': ['nfl'],
  'ice-hockey': ['hockey'],
  'combat-sports': ['ufc'],
  'uefa-europa-conference-league': ['europa-conference-league'],
  'europe-wc-qualifiers': ['uef'],
  'asia-wc-qualifiers': ['afc'],
  'africa-wc-qualifiers': ['caf'],
  'north-america-wc-qualifiers': ['con'],
  'south-america-wc-qualifiers': ['sea'],
  'oceania-wc-qualifiers': ['ofc'],
  'coppa-italia': ['itc'],
  'fifa-world-cup': ['fifa', 'fif'],
  'fifa-friendlies': ['fifa', 'fif'],
  'russian-premier-league': ['rus'],
  'a-league-soccer': ['australian-a-league'],
  'premiership-rugby': ['rugby-premiership'],
  'top-14': ['rugby-top-14'],
  'the-rugby-championship': ['rugby-championship'],
  'european-rugby-champions-cup': ['european-rugby-champions-cup'],
  'american-hockey-league': ['ahl'],
  'kontinental-hockey-league': ['khl'],
  'deutsche-eishockey-liga': ['dehl'],
  'czech-extraliga': ['cehl'],
  'swedish-hockey-league': ['shl'],
  'swiss-national-league': ['snhl'],
  'lol': ['league-of-legends'],
  'cs2': ['counter-strike-2'],
  'starcraft-ii': ['starcraft-2'],
  'starcraft-brood-war': ['starcraft-brood-war'],
};

function labelToId(label) {
  return label
    .toLowerCase()
    .replace(/[&]/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function labelToIdAscii(label) {
  return label
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[&]/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function parseSportsMenuItems(source) {
  const marker = 'export const SPORTS_SECTION';
  const nextMarker = '\n// ---------------------------------------------------------------------------\n// Crypto';
  const start = source.indexOf(marker);
  const end = source.indexOf(nextMarker, start);

  if (start === -1 || end === -1) {
    throw new Error('Unable to locate SPORTS_SECTION block in sidebarConfig.ts');
  }

  const sportsBlock = source.slice(start, end);
  const items = [];

  for (const match of sportsBlock.matchAll(/flat\('([^']+)'\)/g)) {
    const label = match[1];
    items.push({ label, id: labelToId(label) });
  }

  for (const dropMatch of sportsBlock.matchAll(/dropdown\('\s*([^']+)\s*',\s*\[((?:.|\n)*?)\]\)/g)) {
    const childrenBlock = dropMatch[2];
    for (const childMatch of childrenBlock.matchAll(/'([^']+)'/g)) {
      const label = childMatch[1];
      items.push({ label, id: labelToId(label) });
    }
  }

  const dedup = new Map();
  for (const item of items) {
    dedup.set(item.id, item);
  }

  return [...dedup.values()].filter((item) => item.id !== 'all');
}

async function fetchTagBySlug(slug, cache) {
  if (cache.has(slug)) {
    return cache.get(slug);
  }

  const url = `${GAMMA_API_BASE}/tags/slug/${encodeURIComponent(slug)}`;
  const response = await fetch(url, { headers: { Accept: 'application/json' } });
  if (!response.ok) {
    cache.set(slug, null);
    return null;
  }

  const payload = await response.json();
  const tag = payload && payload.id ? { id: String(payload.id), slug: String(payload.slug || slug) } : null;
  cache.set(slug, tag);
  return tag;
}

async function buildMap() {
  const source = await fs.readFile(SIDEBAR_CONFIG_PATH, 'utf8');
  const menuItems = parseSportsMenuItems(source);
  const cache = new Map();

  const map = {};
  const unresolved = [];
  const resolvedByCandidate = [];

  for (const item of menuItems) {
    const candidates = Array.from(
      new Set([
        item.id,
        labelToIdAscii(item.label),
        ...(MENU_ID_ALIASES[item.id] || []),
      ].filter(Boolean))
    );

    let resolved = null;
    for (const candidate of candidates) {
      const tag = await fetchTagBySlug(candidate, cache);
      if (tag?.id) {
        resolved = { id: tag.id, candidate };
        break;
      }
    }

    if (resolved) {
      map[item.id] = resolved.id;
      resolvedByCandidate.push({
        menuId: item.id,
        label: item.label,
        tagId: resolved.id,
        candidate: resolved.candidate,
      });
    } else {
      unresolved.push(item);
    }
  }

  return { map, unresolved, resolvedByCandidate, totalMenuItems: menuItems.length };
}

function renderOutput(map) {
  return JSON.stringify(
    {
      _meta: {
        generatedAt: new Date().toISOString(),
        source: 'scripts/buildSportsTagMap.mjs',
        fallbackTagId: SPORTS_ROOT_TAG_ID,
      },
      map,
    },
    null,
    2
  );
}

async function main() {
  const shouldWrite = process.argv.includes('--write');
  const { map, unresolved, resolvedByCandidate, totalMenuItems } = await buildMap();

  console.log(`sports menu items: ${totalMenuItems}`);
  console.log(`exact tag mappings: ${Object.keys(map).length}`);
  console.log(`fallback to sports root (${SPORTS_ROOT_TAG_ID}): ${unresolved.length}`);

  if (resolvedByCandidate.length > 0) {
    console.log('\nresolved sample:');
    for (const entry of resolvedByCandidate.slice(0, 30)) {
      console.log(`- ${entry.label} (${entry.menuId}) -> ${entry.tagId} via slug "${entry.candidate}"`);
    }
  }

  if (unresolved.length > 0) {
    console.log('\nunresolved menu items (fallback to sports root):');
    for (const item of unresolved) {
      console.log(`- ${item.label} (${item.id})`);
    }
  }

  if (!shouldWrite) {
    console.log('\nRun with --write to update src/data/sportsTagMap.generated.json');
    return;
  }

  await fs.writeFile(OUTPUT_PATH, `${renderOutput(map)}\n`, 'utf8');
  console.log(`\nWrote ${OUTPUT_PATH}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
