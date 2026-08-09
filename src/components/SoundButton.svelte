<script lang="ts">
  import type { Sound } from '../lib/types';
  import { play, playing, preload } from '../lib/audio';
  import { favorites, toggleFavorite } from '../lib/favorites';
  import { soundUrl } from '../lib/router';

  export let sound: Sound;
  export let accent: string = 'var(--accent)';
  export let showUnit = false;

  let shareState: 'idle' | 'copied' = 'idle';
  let error = false;

  $: isPlaying = $playing.has(sound.id);
  $: isFav = $favorites.has(sound.id);

  async function onPlay() {
    error = false;
    try {
      await play(sound.id, sound.file);
    } catch {
      error = true;
    }
  }

  async function onShare() {
    const url = soundUrl(sound.id);
    if (navigator.share) {
      try {
        await navigator.share({ title: sound.text, url });
        return;
      } catch {
        return; // user cancelled the share sheet
      }
    }
    await navigator.clipboard.writeText(url);
    shareState = 'copied';
    setTimeout(() => (shareState = 'idle'), 1500);
  }
</script>

<div class="sound" style="--sb-accent: {accent}" class:playing={isPlaying}>
  <button
    class="playarea"
    on:click={onPlay}
    on:pointerdown={() => preload(sound.file)}
    aria-label="Play: {sound.text}"
  >
    <span class="icon" aria-hidden="true">
      {#if error}⚠{:else if isPlaying}▮▮{:else}▶{/if}
    </span>
    <span class="text">
      <span class="line">“{sound.text}”</span>
      {#if showUnit}<span class="meta">{sound.unitName}</span>{/if}
    </span>
  </button>
  <button class="aux" class:fav={isFav} on:click={() => toggleFavorite(sound.id)} aria-label={isFav ? 'Remove favorite' : 'Add favorite'}>
    {isFav ? '★' : '☆'}
  </button>
  <button class="aux" on:click={onShare} aria-label="Share link to this sound">
    {shareState === 'copied' ? '✓' : '⤴'}
  </button>
</div>

<style>
  .sound {
    display: flex;
    align-items: stretch;
    background: var(--bg-raised);
    border: 1px solid var(--border);
    border-left: 4px solid var(--sb-accent);
    border-radius: var(--radius);
    overflow: hidden;
    transition: background 0.12s;
  }
  .sound.playing {
    background: var(--bg-hover);
  }
  .playarea {
    flex: 1;
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 8px 12px 12px;
    text-align: left;
    min-height: 52px;
  }
  .playarea:active {
    background: var(--bg-hover);
  }
  .icon {
    flex: none;
    width: 30px;
    height: 30px;
    display: grid;
    place-items: center;
    border-radius: 50%;
    background: color-mix(in srgb, var(--sb-accent) 22%, transparent);
    color: var(--sb-accent);
    font-size: 0.75rem;
  }
  .text {
    display: flex;
    flex-direction: column;
    gap: 2px;
    min-width: 0;
  }
  .line {
    font-size: 0.95rem;
  }
  .meta {
    color: var(--text-dim);
    font-size: 0.78rem;
  }
  .aux {
    flex: none;
    width: 44px;
    display: grid;
    place-items: center;
    color: var(--text-dim);
    font-size: 1.1rem;
  }
  .aux:active,
  .aux:hover {
    color: var(--text);
  }
  .aux.fav {
    color: var(--star);
  }
</style>
