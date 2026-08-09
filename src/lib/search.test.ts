import { describe, it, expect, beforeEach } from 'vitest';
import { catalog } from './catalog';
import { search } from './search';
import type { Catalog, Sound } from './types';

function sound(overrides: Partial<Sound>): Sound {
  return {
    id: 'x',
    game: 'sc2',
    faction: 'terran',
    unit: 'marine',
    unitName: 'Marine',
    type: 'select',
    text: '',
    file: '/audio/x.m4a',
    dur: 1,
    ...overrides
  };
}

const fixture: Catalog = {
  version: 1,
  games: [],
  sounds: [
    sound({ id: 'kirov', game: 'ra2', faction: 'soviet', unit: 'kirov', unitName: 'Kirov Airship', text: 'Kirov reporting.' }),
    sound({ id: 'conscript', game: 'ra2', faction: 'soviet', unit: 'conscript', unitName: 'Conscript', text: 'For home country!' }),
    sound({ id: 'marine', game: 'sc2', faction: 'terran', unit: 'marine', unitName: 'Marine', text: 'You want a piece of me, boy?' })
  ]
};

beforeEach(() => catalog.set(fixture));

describe('search', () => {
  it('matches on transcript text', () => {
    expect(search('home country').map((s) => s.id)).toEqual(['conscript']);
  });

  it('matches on unit name', () => {
    expect(search('kirov').map((s) => s.id)).toContain('kirov');
  });

  it('supports prefix matching while typing', () => {
    expect(search('repor').map((s) => s.id)).toContain('kirov');
  });

  it('tolerates small typos (fuzzy)', () => {
    expect(search('countrey').map((s) => s.id)).toContain('conscript');
  });

  it('requires at least 2 characters', () => {
    expect(search('k')).toEqual([]);
    expect(search(' ')).toEqual([]);
  });

  it('applies game and faction filters', () => {
    expect(search('o', { game: 'ra2' })).toEqual([]); // still under min length
    expect(search('reporting', { game: 'sc2' })).toEqual([]);
    expect(search('reporting', { game: 'ra2', faction: 'soviet' }).map((s) => s.id)).toEqual(['kirov']);
  });
});
