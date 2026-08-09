import { describe, it, expect } from 'vitest';
import { parsePath } from './routes';

describe('parsePath', () => {
  it('parses home', () => {
    expect(parsePath('/')).toEqual({ name: 'home' });
    expect(parsePath('')).toEqual({ name: 'home' });
  });

  it('parses static pages', () => {
    expect(parsePath('/favorites')).toEqual({ name: 'favorites' });
    expect(parsePath('/about')).toEqual({ name: 'about' });
  });

  it('parses share links', () => {
    expect(parsePath('/s/sc2-marine-move-1')).toEqual({ name: 'share', soundId: 'sc2-marine-move-1' });
  });

  it('treats /s with no id as a game page, not a share page', () => {
    expect(parsePath('/s').name).toBe('game');
  });

  it('parses the drill-down hierarchy', () => {
    expect(parsePath('/sc2')).toEqual({ name: 'game', game: 'sc2' });
    expect(parsePath('/sc2/terran')).toEqual({ name: 'faction', game: 'sc2', faction: 'terran' });
    expect(parsePath('/sc2/terran/marine')).toEqual({
      name: 'unit',
      game: 'sc2',
      faction: 'terran',
      unit: 'marine'
    });
  });

  it('ignores trailing slashes', () => {
    expect(parsePath('/sc2/')).toEqual({ name: 'game', game: 'sc2' });
    expect(parsePath('/sc2/terran///')).toEqual({ name: 'faction', game: 'sc2', faction: 'terran' });
  });

  it('decodes URL-encoded segments', () => {
    expect(parsePath('/ra2/allied/g%2Ei')).toEqual({ name: 'unit', game: 'ra2', faction: 'allied', unit: 'g.i' });
  });
});
