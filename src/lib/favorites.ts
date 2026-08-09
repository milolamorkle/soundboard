import { writable } from 'svelte/store';

const KEY = 'soundboard.favorites.v1';

function load(): Set<string> {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return new Set(JSON.parse(raw) as string[]);
  } catch {
    // corrupted or unavailable storage — start fresh
  }
  return new Set();
}

export const favorites = writable<Set<string>>(load());

favorites.subscribe((set) => {
  try {
    localStorage.setItem(KEY, JSON.stringify([...set]));
  } catch {
    // storage full/unavailable — favorites just won't persist
  }
});

export function toggleFavorite(id: string): void {
  favorites.update((set) => {
    const next = new Set(set);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    return next;
  });
}
