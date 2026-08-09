import { writable } from 'svelte/store';

/**
 * Playback via Web Audio: low latency, unlimited overlap, works reliably on
 * iOS Safari where multiple <audio> elements are flaky. Decoded buffers are
 * kept in a small LRU cache; the network layer is cached by the service worker.
 */

let ctx: AudioContext | null = null;

const MAX_DECODED = 60;
const decoded = new Map<string, AudioBuffer>(); // insertion order = LRU
const inflight = new Map<string, Promise<AudioBuffer>>();

/** ids currently audible — lets buttons show a playing state. */
export const playing = writable<Set<string>>(new Set());

function getCtx(): AudioContext {
  if (!ctx) {
    const Ctor = window.AudioContext ?? (window as any).webkitAudioContext;
    ctx = new Ctor();
  }
  if (ctx.state === 'suspended') void ctx.resume();
  return ctx;
}

async function getBuffer(file: string): Promise<AudioBuffer> {
  const hit = decoded.get(file);
  if (hit) {
    // refresh LRU position
    decoded.delete(file);
    decoded.set(file, hit);
    return hit;
  }
  const pending = inflight.get(file);
  if (pending) return pending;

  const p = (async () => {
    const res = await fetch(file);
    if (!res.ok) throw new Error(`audio fetch failed: HTTP ${res.status}`);
    const buf = await getCtx().decodeAudioData(await res.arrayBuffer());
    decoded.set(file, buf);
    while (decoded.size > MAX_DECODED) {
      const oldest = decoded.keys().next().value as string;
      decoded.delete(oldest);
    }
    return buf;
  })();
  inflight.set(file, p);
  try {
    return await p;
  } finally {
    inflight.delete(file);
  }
}

/** Play a clip. Overlaps freely with anything already playing. */
export async function play(id: string, file: string): Promise<void> {
  const c = getCtx(); // create/resume synchronously within the user gesture
  const buffer = await getBuffer(file);
  const src = c.createBufferSource();
  src.buffer = buffer;
  src.connect(c.destination);

  playing.update((set) => {
    const next = new Set(set);
    next.add(id);
    return next;
  });
  src.onended = () => {
    playing.update((set) => {
      const next = new Set(set);
      next.delete(id);
      return next;
    });
  };
  src.start();
}

/** Warm the cache without playing (e.g. on button touchstart). */
export function preload(file: string): void {
  void getBuffer(file).catch(() => {});
}
