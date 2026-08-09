import { writable } from 'svelte/store';
import type { Sound } from './types';

/** Singleton bottom action sheet — opened via long-press/right-click on a tile. */
export const sheetSound = writable<{ sound: Sound; accent: string } | null>(null);

export function openSheet(sound: Sound, accent: string): void {
  sheetSound.set({ sound, accent });
}

export function closeSheet(): void {
  sheetSound.set(null);
}
