import { describe, it, expect, beforeEach, vi } from 'vitest';
import { get } from 'svelte/store';

const KEY = 'soundboard.favorites.v1';

// favorites.ts reads localStorage at import time, so import a fresh copy per test
async function freshModule() {
  vi.resetModules();
  return import('./favorites');
}

beforeEach(() => localStorage.clear());

describe('favorites', () => {
  it('starts empty', async () => {
    const { favorites } = await freshModule();
    expect(get(favorites).size).toBe(0);
  });

  it('toggles on and off', async () => {
    const { favorites, toggleFavorite } = await freshModule();
    toggleFavorite('a');
    toggleFavorite('b');
    expect([...get(favorites)].sort()).toEqual(['a', 'b']);
    toggleFavorite('a');
    expect([...get(favorites)]).toEqual(['b']);
  });

  it('persists to localStorage and loads back', async () => {
    const first = await freshModule();
    first.toggleFavorite('sc2-marine-move-1');
    expect(JSON.parse(localStorage.getItem(KEY)!)).toEqual(['sc2-marine-move-1']);

    const second = await freshModule();
    expect(get(second.favorites).has('sc2-marine-move-1')).toBe(true);
  });

  it('survives corrupted stored data', async () => {
    localStorage.setItem(KEY, '{not json');
    const { favorites } = await freshModule();
    expect(get(favorites).size).toBe(0);
  });
});
