#!/usr/bin/env node
/**
 * Ingest pipeline: raw audio + mapping -> compressed clips + catalog.json
 *
 * Inputs (in sounds-src/):
 *   games.json    — [{id, name, short, factions:[{id, name, color}]}]
 *   mapping.json  — [{file, game, faction, unit, unitName, type, text}]
 *                   `file` is relative to sounds-src/
 *
 * Output:
 *   public/audio/<contenthash>.m4a   (AAC ~48kbps mono, loudness-normalized*)
 *   public/catalog.json
 *
 * Uses ffmpeg when available (with EBU R128 loudness normalization); falls
 * back to macOS afconvert (no normalization) so the pipeline runs anywhere.
 */
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const SRC = path.join(ROOT, 'sounds-src');
const OUT_AUDIO = path.join(ROOT, 'public', 'audio');
const OUT_CATALOG = path.join(ROOT, 'public', 'catalog.json');

function has(cmd) {
  try {
    execFileSync('which', [cmd], { stdio: 'pipe' });
    return true;
  } catch {
    return false;
  }
}

const useFfmpeg = has('ffmpeg');
const useAfconvert = !useFfmpeg && has('afconvert');
if (!useFfmpeg && !useAfconvert) {
  console.error('Need ffmpeg (preferred) or afconvert on PATH.');
  process.exit(1);
}

const games = JSON.parse(fs.readFileSync(path.join(SRC, 'games.json'), 'utf8'));
const mapping = JSON.parse(fs.readFileSync(path.join(SRC, 'mapping.json'), 'utf8'));

fs.mkdirSync(OUT_AUDIO, { recursive: true });

function encode(srcFile, outFile) {
  if (useFfmpeg) {
    execFileSync(
      'ffmpeg',
      ['-y', '-loglevel', 'error', '-i', srcFile,
       '-af', 'loudnorm=I=-16:TP=-1.5:LRA=11,silenceremove=start_periods=1:start_threshold=-50dB',
       '-ac', '1', '-c:a', 'aac', '-b:a', '48k', '-movflags', '+faststart', outFile],
      { stdio: 'pipe' }
    );
  } else {
    execFileSync('afconvert', ['-f', 'm4af', '-d', 'aac', '-b', '49152', '-c', '1', srcFile, outFile], {
      stdio: 'pipe'
    });
  }
}

function duration(file) {
  if (has('ffprobe')) {
    const out = execFileSync(
      'ffprobe',
      ['-v', 'error', '-show_entries', 'format=duration', '-of', 'default=nw=1:nk=1', file],
      { encoding: 'utf8' }
    );
    return Math.round(parseFloat(out) * 10) / 10;
  }
  const out = execFileSync('afinfo', [file], { encoding: 'utf8' });
  const m = out.match(/estimated duration:\s*([\d.]+)/);
  return m ? Math.round(parseFloat(m[1]) * 10) / 10 : 0;
}

const sounds = [];
const seenIds = new Set();
let processed = 0;

for (const entry of mapping) {
  const src = path.join(SRC, entry.file);
  if (!fs.existsSync(src)) {
    console.warn(`SKIP (missing file): ${entry.file}`);
    continue;
  }
  const tmp = path.join(os.tmpdir(), `ingest-${process.pid}-${processed}.m4a`);
  encode(src, tmp);

  const hash = createHash('sha1').update(fs.readFileSync(tmp)).digest('hex').slice(0, 12);
  const outName = `${hash}.m4a`;
  fs.renameSync(tmp, path.join(OUT_AUDIO, outName));

  let id = `${entry.game}-${entry.unit}-${entry.type}`;
  let n = 1;
  while (seenIds.has(`${id}-${n}`)) n++;
  id = `${id}-${n}`;
  seenIds.add(id);

  sounds.push({
    id,
    game: entry.game,
    faction: entry.faction,
    unit: entry.unit,
    unitName: entry.unitName,
    type: entry.type,
    text: entry.text,
    file: `/audio/${outName}`,
    dur: duration(path.join(OUT_AUDIO, outName))
  });
  processed++;
}

const catalog = { version: 1, games, sounds };
fs.writeFileSync(OUT_CATALOG, JSON.stringify(catalog));

const totalKB = sounds.reduce((acc, s) => acc + fs.statSync(path.join(ROOT, 'public', s.file)).size, 0) / 1024;
console.log(`Ingested ${processed} clips (${totalKB.toFixed(0)} KB audio total).`);
console.log(`Catalog: ${(fs.statSync(OUT_CATALOG).size / 1024).toFixed(1)} KB -> public/catalog.json`);
