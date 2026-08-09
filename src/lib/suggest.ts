import type { Catalog } from './types';

/**
 * Faceted-search helpers (pure, unit-tested):
 *  - findDestinations: "scope suggestions" — entities (game/faction/unit) whose
 *    name matches the query, offered as browse shortcuts.
 *  - extractFilterTokens: detects facet words inside a longer query
 *    ("terran attack" -> filter Terran + search "attack").
 */

export interface Destination {
  kind: 'game' | 'faction' | 'unit';
  label: string;
  sub: string;
  path: string;
  game: string;
  faction?: string;
  color?: string;
}

export interface TokenFilter {
  game?: string;
  faction?: string;
  label: string;
  color?: string;
  /** query with the facet word removed */
  remainder: string;
}

const norm = (s: string) => s.toLowerCase().normalize('NFKD').replace(/[^\p{L}\p{N} ]/gu, '');

export function findDestinations(query: string, catalog: Catalog, limit = 4): Destination[] {
  const q = norm(query.trim());
  if (q.length < 2) return [];
  const out: Destination[] = [];

  for (const g of catalog.games) {
    if (norm(g.name).includes(q) || norm(g.short) === q) {
      out.push({ kind: 'game', label: g.name, sub: 'Game', path: `/${g.id}`, game: g.id });
    }
    for (const f of g.factions) {
      if (norm(f.name).startsWith(q)) {
        out.push({
          kind: 'faction',
          label: f.name,
          sub: g.name,
          path: `/${g.id}/${f.id}`,
          game: g.id,
          faction: f.id,
          color: f.color
        });
      }
    }
  }

  const seenUnits = new Set<string>();
  for (const s of catalog.sounds) {
    const key = `${s.game}/${s.faction}/${s.unit}`;
    if (seenUnits.has(key)) continue;
    if (norm(s.unitName).includes(q)) {
      seenUnits.add(key);
      const g = catalog.games.find((x) => x.id === s.game);
      const f = g?.factions.find((x) => x.id === s.faction);
      out.push({
        kind: 'unit',
        label: s.unitName,
        sub: `${f?.name ?? s.faction} · ${g?.name ?? s.game}`,
        path: `/${s.game}/${s.faction}/${s.unit}`,
        game: s.game,
        faction: s.faction,
        color: f?.color
      });
    }
  }

  // Exact-name matches first, then shorter labels (closer matches) first.
  out.sort((a, b) => {
    const ax = norm(a.label) === q ? 0 : 1;
    const bx = norm(b.label) === q ? 0 : 1;
    return ax - bx || a.label.length - b.label.length;
  });
  return out.slice(0, limit);
}

export function extractFilterTokens(query: string, catalog: Catalog): TokenFilter | null {
  const words = query.trim().split(/\s+/);
  if (words.length < 2) return null; // single word is handled by findDestinations

  for (let i = 0; i < words.length; i++) {
    const w = norm(words[i]);
    if (!w) continue;
    for (const g of catalog.games) {
      // faction word ("terran attack") — most specific, check first
      for (const f of g.factions) {
        if (norm(f.name) === w) {
          const remainder = words.filter((_, j) => j !== i).join(' ');
          return { game: g.id, faction: f.id, label: f.name, color: f.color, remainder };
        }
      }
      // game word ("sc2 nuclear")
      if (norm(g.short) === w || norm(g.name) === w) {
        const remainder = words.filter((_, j) => j !== i).join(' ');
        return { game: g.id, label: g.short, remainder };
      }
    }
  }
  return null;
}
