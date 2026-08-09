import MiniSearch from 'minisearch';
import { derived } from 'svelte/store';
import { catalog } from './catalog';
import type { Sound } from './types';

export interface SearchFilters {
  game?: string;
  faction?: string;
}

const index = derived(catalog, ($c) => {
  if (!$c) return null;
  const ms = new MiniSearch<Sound>({
    fields: ['text', 'unitName', 'type'],
    storeFields: ['id'],
    searchOptions: {
      boost: { text: 2 },
      prefix: true,
      fuzzy: 0.15
    }
  });
  ms.addAll($c.sounds);
  return ms;
});

let currentIndex: MiniSearch<Sound> | null = null;
let soundMap = new Map<string, Sound>();
index.subscribe((v) => (currentIndex = v));
catalog.subscribe(($c) => {
  soundMap = new Map();
  if ($c) for (const s of $c.sounds) soundMap.set(s.id, s);
});

export function search(query: string, filters: SearchFilters = {}, limit = 50): Sound[] {
  if (!currentIndex || query.trim().length < 2) return [];
  const results = currentIndex.search(query);
  const out: Sound[] = [];
  for (const r of results) {
    const s = soundMap.get(r.id as string);
    if (!s) continue;
    if (filters.game && s.game !== filters.game) continue;
    if (filters.faction && s.faction !== filters.faction) continue;
    out.push(s);
    if (out.length >= limit) break;
  }
  return out;
}
