#!/usr/bin/env node
/**
 * Generates PWA icons procedurally (no image deps): dark rounded square with a
 * two-tone play triangle — blue (SC2) top, red (RA2) bottom.
 */
import { deflateSync } from 'node:zlib';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const OUT = path.join(ROOT, 'public', 'icons');
fs.mkdirSync(OUT, { recursive: true });

function crc32(buf) {
  let c;
  const table = [];
  for (let n = 0; n < 256; n++) {
    c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c;
  }
  let crc = 0xffffffff;
  for (const b of buf) crc = table[(crc ^ b) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const typeBuf = Buffer.from(type, 'ascii');
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])));
  return Buffer.concat([len, typeBuf, data, crc]);
}

function png(width, height, pixelFn) {
  const raw = Buffer.alloc(height * (1 + width * 4));
  for (let y = 0; y < height; y++) {
    const row = y * (1 + width * 4);
    raw[row] = 0; // filter: none
    for (let x = 0; x < width; x++) {
      const [r, g, b, a] = pixelFn(x, y);
      const o = row + 1 + x * 4;
      raw[o] = r;
      raw[o + 1] = g;
      raw[o + 2] = b;
      raw[o + 3] = a;
    }
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // RGBA
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0))
  ]);
}

const BG = [11, 15, 20];
const BLUE = [77, 163, 255];
const RED = [255, 92, 92];

function drawIcon(size) {
  const r = size * 0.18; // corner radius
  // Play triangle: left edge at 36%, tip at 74%, vertically centered, 44% tall
  const x0 = size * 0.36;
  const x1 = size * 0.74;
  const halfH = size * 0.22;
  const cy = size / 2;

  return png(size, size, (x, y) => {
    // rounded-corner mask
    const dx = Math.max(r - x, x - (size - 1 - r), 0);
    const dy = Math.max(r - y, y - (size - 1 - r), 0);
    if (dx * dx + dy * dy > r * r) return [0, 0, 0, 0];

    // triangle test
    const t = (x - x0) / (x1 - x0);
    if (t >= 0 && t <= 1) {
      const maxDy = halfH * (1 - t);
      if (Math.abs(y - cy) <= maxDy) {
        return y < cy ? [...BLUE, 255] : [...RED, 255];
      }
    }
    return [...BG, 255];
  });
}

for (const size of [192, 512]) {
  fs.writeFileSync(path.join(OUT, `icon-${size}.png`), drawIcon(size));
  console.log(`icons/icon-${size}.png`);
}
