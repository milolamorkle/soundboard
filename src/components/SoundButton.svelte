<script lang="ts">
  import type { Sound } from '../lib/types';
  import { play, playing, preload } from '../lib/audio';
  import { favorites, toggleFavorite } from '../lib/favorites';
  import { openSheet } from '../lib/sheet';

  export let sound: Sound;
  export let accent: string = 'var(--accent)';
  export let showUnit = false;

  let error = false;
  let pressTimer: ReturnType<typeof setTimeout> | null = null;
  let longPressed = false;

  $: isPlaying = $playing.has(sound.id);
  $: isFav = $favorites.has(sound.id);

  function startPress(e: PointerEvent) {
    preload(sound.file);
    longPressed = false;
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    pressTimer = setTimeout(() => {
      longPressed = true;
      openSheet(sound, accent);
    }, 450);
  }

  function cancelPress() {
    if (pressTimer) clearTimeout(pressTimer);
    pressTimer = null;
  }

  async function onClick() {
    if (longPressed) {
      longPressed = false;
      return; // this click is the tail of a long-press; the sheet is open
    }
    error = false;
    try {
      await play(sound.id, sound.file);
    } catch {
      error = true;
    }
  }

  function onContextMenu(e: MouseEvent) {
    e.preventDefault();
    cancelPress();
    openSheet(sound, accent);
  }
</script>

<div class="tile" style="--sb-accent: {accent}" class:playing={isPlaying}>
  <button
    class="playarea"
    on:click={onClick}
    on:pointerdown={startPress}
    on:pointerup={cancelPress}
    on:pointerleave={cancelPress}
    on:pointercancel={cancelPress}
    on:contextmenu={onContextMenu}
    aria-label="Play: {sound.text}"
  >
    <span class="line">{#if error}⚠ {/if}“{sound.text}”</span>
    {#if showUnit}<span class="meta">{sound.unitName}</span>{/if}
  </button>
  <span class="corner">
    {#if isPlaying}<span class="eq" aria-hidden="true"><i /><i /><i /></span>{/if}
    <button class="star" class:on={isFav} on:click|stopPropagation={() => toggleFavorite(sound.id)} aria-label={isFav ? 'Remove favorite' : 'Add favorite'}>
      {isFav ? '★' : '☆'}
    </button>
  </span>
</div>

<style>
  .tile {
    position: relative;
    display: flex;
    background: var(--surface-1);
    border: 1px solid var(--border);
    border-top: 3px solid var(--sb-accent);
    border-radius: var(--radius-sm);
    overflow: hidden;
    transition: background 0.12s, transform 0.08s, box-shadow 0.15s;
  }
  .tile:hover {
    background: var(--surface-2);
  }
  .tile:active {
    transform: scale(0.97);
  }
  .tile.playing {
    background: var(--surface-2);
    box-shadow: 0 0 0 1px var(--sb-accent);
  }
  .playarea {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 3px;
    align-items: flex-start;
    text-align: left;
    padding: var(--sp-3) 30px var(--sp-3) var(--sp-3);
    min-height: 64px;
    -webkit-user-select: none;
    user-select: none;
    touch-action: manipulation;
  }
  .line {
    font-size: 0.88rem;
    line-height: 1.35;
    display: -webkit-box;
    -webkit-line-clamp: 3;
    line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  .meta {
    color: var(--text-dim);
    font-size: 0.75rem;
  }
  .corner {
    position: absolute;
    top: 3px;
    right: 2px;
    display: flex;
    align-items: center;
    gap: 2px;
  }
  .star {
    width: 30px;
    height: 30px;
    display: grid;
    place-items: center;
    color: var(--text-faint);
    font-size: 0.95rem;
    border-radius: 50%;
  }
  .star:hover {
    color: var(--text);
  }
  .star.on {
    color: var(--star);
  }
  /* tiny equalizer instead of color-only playing state */
  .eq {
    display: flex;
    gap: 2px;
    align-items: flex-end;
    height: 12px;
  }
  .eq i {
    width: 3px;
    background: var(--sb-accent);
    animation: bounce 0.6s ease-in-out infinite alternate;
  }
  .eq i:nth-child(1) {
    height: 6px;
  }
  .eq i:nth-child(2) {
    height: 11px;
    animation-delay: 0.15s;
  }
  .eq i:nth-child(3) {
    height: 8px;
    animation-delay: 0.3s;
  }
  @keyframes bounce {
    from {
      transform: scaleY(0.5);
    }
    to {
      transform: scaleY(1);
    }
  }
</style>
