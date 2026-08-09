export interface Sound {
  id: string;
  game: string; // 'sc2' | 'ra2'
  faction: string;
  unit: string; // unit slug
  unitName: string;
  type: string; // 'select' | 'move' | 'attack' | 'annoyed' | 'ready' | ...
  text: string; // transcript of the spoken line
  file: string; // path under /audio/
  dur: number; // seconds
}

export interface Faction {
  id: string;
  name: string;
  color: string;
}

export interface Game {
  id: string;
  name: string;
  short: string;
  factions: Faction[];
}

export interface Catalog {
  version: number;
  games: Game[];
  sounds: Sound[];
}
