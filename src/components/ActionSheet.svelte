<script lang="ts">
  import { sheetSound, closeSheet } from '../lib/sheet';
  import { play } from '../lib/audio';
  import { favorites, toggleFavorite } from '../lib/favorites';
  import { navigate, soundUrl } from '../lib/router';

  let copied = false;

  $: entry = $sheetSound;
  $: isFav = entry ? $favorites.has(entry.sound.id) : false;

  function close() {
    copied = false;
    closeSheet();
  }

  async function doShare() {
    if (!entry) return;
    const url = soundUrl(entry.sound.id);
    if (navigator.share) {
      try {
        await navigator.share({ title: entry.sound.text, url });
      } catch {
        /* user cancelled */
      }
      close();
      return;
    }
    await navigator.clipboard.writeText(url);
    copied = true;
    setTimeout(close, 900);
  }

  function goToUnit() {
    if (!entry) return;
    const s = entry.sound;
    close();
    navigate(`/${s.game}/${s.faction}/${s.unit}`);
  }

  function onKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape') close();
  }
</script>

<svelte:window on:keydown={onKeydown} />

{#if entry}
  <!-- svelte-ignore a11y-no-noninteractive-element-interactions — backdrop click-to-dismiss; keyboard users have Escape and the Cancel button -->
  <div class="backdrop" on:click={close} role="presentation">
    <div
      class="sheet"
      style="--sb-accent: {entry.accent}"
      role="dialog"
      aria-modal="true"
      aria-label="Sound actions"
      on:click|stopPropagation
      on:keydown
    >
      <p class="quote">“{entry.sound.text}”</p>
      <p class="meta">{entry.sound.unitName}</p>
      <button on:click={() => entry && play(entry.sound.id, entry.sound.file)}>▶ Play</button>
      <button on:click={() => entry && toggleFavorite(entry.sound.id)}>
        {isFav ? '★ Remove favorite' : '☆ Add favorite'}
      </button>
      <button on:click={doShare}>{copied ? '✓ Link copied' : '⤴ Share link'}</button>
      <button on:click={goToUnit}>› All {entry.sound.unitName} lines</button>
      <button class="cancel" on:click={close}>Cancel</button>
    </div>
  </div>
{/if}

<style>
  .backdrop {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.55);
    z-index: 50;
    display: flex;
    align-items: flex-end;
    justify-content: center;
  }
  .sheet {
    width: 100%;
    max-width: 480px;
    background: var(--surface-3);
    border-radius: var(--radius) var(--radius) 0 0;
    border-top: 3px solid var(--sb-accent);
    padding: var(--sp-4) var(--sp-4) calc(var(--sp-4) + env(safe-area-inset-bottom));
    animation: rise 0.18s ease-out;
  }
  @keyframes rise {
    from {
      transform: translateY(30px);
      opacity: 0.5;
    }
  }
  .quote {
    margin: 0 0 2px;
    font-weight: 600;
  }
  .meta {
    margin: 0 0 var(--sp-3);
    color: var(--text-dim);
    font-size: 0.85rem;
  }
  .sheet button {
    display: block;
    width: 100%;
    text-align: left;
    padding: 13px var(--sp-3);
    border-radius: var(--radius-sm);
    font-size: 0.95rem;
  }
  .sheet button:hover,
  .sheet button:active {
    background: var(--surface-2);
  }
  .cancel {
    color: var(--text-dim);
    margin-top: var(--sp-1);
  }
</style>
