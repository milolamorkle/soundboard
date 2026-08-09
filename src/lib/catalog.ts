import { writable, derived, get } from 'svelte/store';
import type { Catalog, Game, Faction, Sound } from './types';

export const catalog = writable<Catalog | null>(null);
export const loadError = writable<string | null>(null);

export async function loadCatalog(): Promise<void> {
  try {
    const res = await fetch('/catalog.json');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    catalog.set(await res.json());
  } catch (e) {
    loadError.set(e instanceof Error ? e.message : String(e));
  }
}

export const soundsById = derived(catalog, ($c) => {
  const map = new Map<string, Sound>();
  if ($c) for (const s of $c.sounds) map.set(s.id, s);
  return map;
});

export function gameById(id: string): Game | undefined {
  return get(catalog)?.games.find((g) => g.id === id);
}

export function factionOf(gameId: string, factionId: string): Faction | undefined {
  return gameById(gameId)?.factions.find((f) => f.id === factionId);
}

/** Units of a faction, in catalog order, with sound counts. */
export function unitsOf(gameId: string, factionId: string): { unit: string; unitName: string; count: number }[] {
  const c = get(catalog);
  if (!c) return [];
  const seen = new Map<string, { unit: string; unitName: string; count: number }>();
  for (const s of c.sounds) {
    if (s.game !== gameId || s.faction !== factionId) continue;
    const entry = seen.get(s.unit);
    if (entry) entry.count++;
    else seen.set(s.unit, { unit: s.unit, unitName: s.unitName, count: 1 });
  }
  return [...seen.values()];
}

export function soundsOfUnit(gameId: string, factionId: string, unit: string): Sound[] {
  const c = get(catalog);
  if (!c) return [];
  return c.sounds.filter((s) => s.game === gameId && s.faction === factionId && s.unit === unit);
}

/** Display order and labels for line-type groups. Unknown types sort last, alphabetically. */
const TYPE_ORDER = ['ready', 'select', 'move', 'attack', 'annoyed', 'death', 'other'];
export const TYPE_LABELS: Record<string, string> = {
  ready: 'Ready / trained',
  select: 'Selected',
  move: 'Move order',
  attack: 'Attack order',
  annoyed: 'Repeatedly clicked',
  death: 'Death',
  other: 'Other'
};

export function groupByType(sounds: Sound[]): [string, Sound[]][] {
  const groups = new Map<string, Sound[]>();
  for (const s of sounds) {
    const arr = groups.get(s.type) ?? [];
    arr.push(s);
    groups.set(s.type, arr);
  }
  return [...groups.entries()].sort((a, b) => {
    const ia = TYPE_ORDER.indexOf(a[0]);
    const ib = TYPE_ORDER.indexOf(b[0]);
    if (ia === -1 && ib === -1) return a[0].localeCompare(b[0]);
    if (ia === -1) return 1;
    if (ib === -1) return -1;
    return ia - ib;
  });
}
