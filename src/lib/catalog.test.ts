import { describe, it, expect, beforeEach } from 'vitest';
import { catalog, unitsOf, soundsOfUnit, groupByType, factionOf, gameById } from './catalog';
import type { Catalog, Sound } from './types';

function sound(overrides: Partial<Sound>): Sound {
  return {
    id: 'x',
    game: 'sc2',
    faction: 'terran',
    unit: 'marine',
    unitName: 'Marine',
    type: 'select',
    text: 'Commander?',
    file: '/audio/x.m4a',
    dur: 1,
    ...overrides
  };
}

const fixture: Catalog = {
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
    }
  ],
  sounds: [
    sound({ id: 'a', unit: 'marine', type: 'select' }),
    sound({ id: 'b', unit: 'marine', type: 'ready' }),
    sound({ id: 'c', unit: 'marine', type: 'gagline' }),
    sound({ id: 'd', unit: 'scv', unitName: 'SCV', type: 'move' }),
    sound({ id: 'e', faction: 'zerg', unit: 'queen', unitName: 'Queen', type: 'attack' })
  ]
};

beforeEach(() => catalog.set(fixture));

describe('lookups', () => {
  it('finds games and factions', () => {
    expect(gameById('sc2')?.name).toBe('StarCraft II');
    expect(factionOf('sc2', 'zerg')?.color).toBe('#b06ef3');
    expect(factionOf('sc2', 'nope')).toBeUndefined();
  });
});

describe('unitsOf', () => {
  it('groups sounds into units with counts, scoped to the faction', () => {
    expect(unitsOf('sc2', 'terran')).toEqual([
      { unit: 'marine', unitName: 'Marine', count: 3 },
      { unit: 'scv', unitName: 'SCV', count: 1 }
    ]);
    expect(unitsOf('sc2', 'zerg')).toEqual([{ unit: 'queen', unitName: 'Queen', count: 1 }]);
  });

  it('returns empty for unknown factions', () => {
    expect(unitsOf('sc2', 'protoss')).toEqual([]);
  });
});

describe('soundsOfUnit', () => {
  it('returns only that unit’s sounds', () => {
    expect(soundsOfUnit('sc2', 'terran', 'marine').map((s) => s.id)).toEqual(['a', 'b', 'c']);
  });
});

describe('groupByType', () => {
  it('orders known types canonically and unknown types last', () => {
    const groups = groupByType(soundsOfUnit('sc2', 'terran', 'marine'));
    expect(groups.map(([type]) => type)).toEqual(['ready', 'select', 'gagline']);
  });
});
