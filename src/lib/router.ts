import { writable } from 'svelte/store';

/**
 * Minimal history-API router. Routes:
 *   /                      home (game pick)
 *   /favorites             favorites
 *   /about                 about + disclaimer
 *   /s/:id                 share landing for one sound
 *   /:game                 faction pick
 *   /:game/:faction        unit list
 *   /:game/:faction/:unit  unit sounds
 */
export interface Route {
  name: 'home' | 'favorites' | 'about' | 'share' | 'game' | 'faction' | 'unit';
  game?: string;
  faction?: string;
  unit?: string;
  soundId?: string;
}

function parse(path: string): Route {
  const parts = path.replace(/\/+$/, '').split('/').filter(Boolean).map(decodeURIComponent);
  if (parts.length === 0) return { name: 'home' };
  if (parts[0] === 'favorites') return { name: 'favorites' };
  if (parts[0] === 'about') return { name: 'about' };
  if (parts[0] === 's' && parts[1]) return { name: 'share', soundId: parts[1] };
  const [game, faction, unit] = parts;
  if (unit) return { name: 'unit', game, faction, unit };
  if (faction) return { name: 'faction', game, faction };
  return { name: 'game', game };
}

export const route = writable<Route>(parse(location.pathname));

export function navigate(path: string): void {
  history.pushState(null, '', path);
  route.set(parse(path));
  window.scrollTo(0, 0);
}

window.addEventListener('popstate', () => route.set(parse(location.pathname)));

export function soundUrl(id: string): string {
  return `${location.origin}/s/${encodeURIComponent(id)}`;
}
