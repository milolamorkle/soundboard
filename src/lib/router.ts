import { writable } from 'svelte/store';
import { parsePath, type Route } from './routes';

export type { Route };

export const route = writable<Route>(parsePath(location.pathname));

export function navigate(path: string): void {
  history.pushState(null, '', path);
  route.set(parsePath(path));
  window.scrollTo(0, 0);
}

window.addEventListener('popstate', () => route.set(parsePath(location.pathname)));

export function soundUrl(id: string): string {
  return `${location.origin}/s/${encodeURIComponent(id)}`;
}
