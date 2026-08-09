#!/usr/bin/env node
/**
 * Generates placeholder sample clips with macOS `say` (spoken TTS versions of
 * well-known lines) so the whole pipeline + UI is testable end-to-end before
 * the real game audio arrives. Writes sounds-src/{games.json,mapping.json,raw/}
 * then runs the normal ingest.
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const SRC = path.join(ROOT, 'sounds-src');
const RAW = path.join(SRC, 'raw');
fs.mkdirSync(RAW, { recursive: true });

const games = [
  {
    id: 'sc2',
    name: 'StarCraft II',
    short: 'SC2',
    factions: [
      { id: 'terran', name: 'Terran', color: '#4da3ff' },
      { id: 'zerg', name: 'Zerg', color: '#b06ef3' },
      { id: 'protoss', name: 'Protoss', color: '#f3c96e' }
    ]
  },
  {
    id: 'ra2',
    name: 'Red Alert 2',
    short: 'RA2',
    factions: [
      { id: 'allied', name: 'Allied', color: '#5ad1ff' },
      { id: 'soviet', name: 'Soviet', color: '#ff5c5c' },
      { id: 'yuri', name: 'Yuri', color: '#9d7bff' }
    ]
  }
];

// [game, faction, unit, unitName, type, text]
const LINES = [
  ['sc2', 'terran', 'marine', 'Marine', 'ready', 'You want a piece of me, boy?'],
  ['sc2', 'terran', 'marine', 'Marine', 'select', 'Commander?'],
  ['sc2', 'terran', 'marine', 'Marine', 'move', 'Go go go!'],
  ['sc2', 'terran', 'marine', 'Marine', 'attack', 'Let’s rock and roll!'],
  ['sc2', 'terran', 'marine', 'Marine', 'annoyed', 'How do I get out of this chicken outfit?'],
  ['sc2', 'terran', 'scv', 'SCV', 'ready', 'SCV, good to go, sir.'],
  ['sc2', 'terran', 'scv', 'SCV', 'select', 'Yo?'],
  ['sc2', 'terran', 'scv', 'SCV', 'move', 'I’m going!'],
  ['sc2', 'terran', 'battlecruiser', 'Battlecruiser', 'ready', 'Battlecruiser operational.'],
  ['sc2', 'terran', 'battlecruiser', 'Battlecruiser', 'move', 'Make it happen.'],
  ['sc2', 'zerg', 'queen', 'Queen', 'ready', 'The Queen has emerged.'],
  ['sc2', 'zerg', 'queen', 'Queen', 'select', 'I serve the Swarm.'],
  ['sc2', 'zerg', 'queen', 'Queen', 'attack', 'For the Swarm!'],
  ['sc2', 'protoss', 'zealot', 'Zealot', 'ready', 'My life for Aiur!'],
  ['sc2', 'protoss', 'zealot', 'Zealot', 'select', 'En taro Tassadar.'],
  ['sc2', 'protoss', 'zealot', 'Zealot', 'move', 'It shall be done.'],
  ['sc2', 'protoss', 'immortal', 'Immortal', 'ready', 'I return to serve.'],
  ['ra2', 'allied', 'gi', 'G.I.', 'ready', 'Ready and waiting.'],
  ['ra2', 'allied', 'gi', 'G.I.', 'move', 'You got it!'],
  ['ra2', 'allied', 'gi', 'G.I.', 'attack', 'Attacking!'],
  ['ra2', 'allied', 'tanya', 'Tanya', 'select', 'What’s up?'],
  ['ra2', 'allied', 'tanya', 'Tanya', 'attack', 'Cha-ching!'],
  ['ra2', 'allied', 'rocketeer', 'Rocketeer', 'select', 'I can go anywhere!'],
  ['ra2', 'allied', 'eva', 'EVA (announcer)', 'ready', 'Construction complete.'],
  ['ra2', 'allied', 'eva', 'EVA (announcer)', 'ready', 'Unit ready.'],
  ['ra2', 'allied', 'eva', 'EVA (announcer)', 'ready', 'New construction options.'],
  ['ra2', 'soviet', 'conscript', 'Conscript', 'select', 'Reporting.'],
  ['ra2', 'soviet', 'conscript', 'Conscript', 'attack', 'For home country!'],
  ['ra2', 'soviet', 'conscript', 'Conscript', 'move', 'Moving out.'],
  ['ra2', 'soviet', 'kirov', 'Kirov Airship', 'ready', 'Kirov reporting.'],
  ['ra2', 'soviet', 'kirov', 'Kirov Airship', 'select', 'Helium mix optimal.'],
  ['ra2', 'soviet', 'apocalypse', 'Apocalypse Tank', 'ready', 'Instrument of doom.'],
  ['ra2', 'yuri', 'initiate', 'Initiate', 'select', 'I feel a presence.'],
  ['ra2', 'yuri', 'brute', 'Brute', 'attack', 'Crush, kill, destroy!']
];

// Pick distinct installed voices per unit so samples don't all sound identical.
function installedVoices() {
  try {
    const out = execFileSync('say', ['-v', '?'], { encoding: 'utf8' });
    return new Set(out.split('\n').map((l) => l.split(/\s{2,}| [a-z]{2}_/)[0].trim()).filter(Boolean));
  } catch {
    return new Set();
  }
}
const available = installedVoices();
const preferred = ['Daniel', 'Samantha', 'Fred', 'Karen', 'Moira', 'Rishi', 'Tessa', 'Alex', 'Victoria'];
const voices = preferred.filter((v) => available.has(v));

const unitVoice = new Map();
let vi = 0;
function voiceFor(unit) {
  if (!unitVoice.has(unit)) {
    unitVoice.set(unit, voices.length ? voices[vi++ % voices.length] : null);
  }
  return unitVoice.get(unit);
}

const mapping = [];
LINES.forEach(([game, faction, unit, unitName, type, text], i) => {
  const rawName = `raw/${game}-${unit}-${type}-${i}.aiff`;
  const dest = path.join(SRC, rawName);
  const voice = voiceFor(`${game}/${unit}`);
  const args = voice ? ['-v', voice] : [];
  execFileSync('say', [...args, '-o', dest, text], { stdio: 'pipe' });
  mapping.push({ file: rawName, game, faction, unit, unitName, type, text });
});

fs.writeFileSync(path.join(SRC, 'games.json'), JSON.stringify(games, null, 2));
fs.writeFileSync(path.join(SRC, 'mapping.json'), JSON.stringify(mapping, null, 2));
console.log(`Generated ${mapping.length} sample clips with voices: ${[...new Set(unitVoice.values())].join(', ') || 'default'}`);

execFileSync('node', [path.join(ROOT, 'scripts', 'ingest.mjs')], { stdio: 'inherit' });
