import { describe, it, expect } from 'vitest';
import { findDestinations, extractFilterTokens } from './suggest';
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

const catalog: Catalog = {
  version: 1,
  games: [
    {
      id: 'sc2',
      name: 'StarCraft II',
      short: 'SC2',
      factions: [
        { id: 'terran', name: 'Terran', color: '#4da3ff' },
        { id: 'zerg', name: 'Zerg', color: '#b06ef3' }
      ]
    },
    {
      id: 'ra2',
      name: 'Red Alert 2',
      short: 'RA2',
      factions: [{ id: 'soviet', name: 'Soviet', color: '#ff5c5c' }]
    }
  ],
  sounds: [
    sound({ id: 'a', unit: 'marine', unitName: 'Marine' }),
    sound({ id: 'b', unit: 'marine', unitName: 'Marine' }),
    sound({ id: 'c', game: 'ra2', faction: 'soviet', unit: 'kirov', unitName: 'Kirov Airship' })
  ]
};

describe('findDestinations', () => {
  it('matches factions by prefix', () => {
    const d = findDestinations('terr', catalog);
    expect(d[0]).toMatchObject({ kind: 'faction', label: 'Terran', path: '/sc2/terran' });
  });

  it('matches games by name or short code', () => {
    expect(findDestinations('starcraft', catalog)[0]).toMatchObject({ kind: 'game', path: '/sc2' });
    expect(findDestinations('ra2', catalog)[0]).toMatchObject({ kind: 'game', path: '/ra2' });
  });

  it('matches units without duplicates', () => {
    const d = findDestinations('marine', catalog);
    expect(d.filter((x) => x.kind === 'unit')).toHaveLength(1);
    expect(d[0]).toMatchObject({ kind: 'unit', path: '/sc2/terran/marine', sub: 'Terran · StarCraft II' });
  });

  it('ranks exact matches first', () => {
    const d = findDestinations('zerg', catalog);
    expect(d[0].label).toBe('Zerg');
  });

  it('returns nothing for short or unmatched queries', () => {
    expect(findDestinations('t', catalog)).toEqual([]);
    expect(findDestinations('xyzzy', catalog)).toEqual([]);
  });
});

describe('extractFilterTokens', () => {
  it('detects a faction word and returns the remainder', () => {
    expect(extractFilterTokens('terran attack', catalog)).toMatchObject({
      game: 'sc2',
      faction: 'terran',
      label: 'Terran',
      remainder: 'attack'
    });
  });

  it('detects a game word anywhere in the query', () => {
    expect(extractFilterTokens('nuclear sc2', catalog)).toMatchObject({
      game: 'sc2',
      remainder: 'nuclear'
    });
  });

  it('is case-insensitive', () => {
    expect(extractFilterTokens('SOVIET reporting', catalog)).toMatchObject({ faction: 'soviet' });
  });

  it('returns null for single words or no facet match', () => {
    expect(extractFilterTokens('terran', catalog)).toBeNull();
    expect(extractFilterTokens('rock and roll', catalog)).toBeNull();
  });
});
