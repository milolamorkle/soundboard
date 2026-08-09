<script lang="ts">
  import { catalog, soundsById, factionOf } from '../lib/catalog';
  import { favorites } from '../lib/favorites';
  import type { Sound } from '../lib/types';
  import SoundButton from './SoundButton.svelte';

  $: favSounds = [...$favorites].map((id) => $soundsById.get(id)).filter((s): s is Sound => !!s);

  function accentFor(s: Sound): string {
    return $catalog ? (factionOf(s.game, s.faction)?.color ?? 'var(--accent)') : 'var(--accent)';
  }
</script>

<div class="container">
  <h1>★ Favorites</h1>
  {#if favSounds.length === 0}
    <p class="hint">No favorites yet — tap the ☆ on any sound to keep it here.</p>
  {:else}
    <div class="soundgrid">
      {#each favSounds as s (s.id)}
        <SoundButton sound={s} accent={accentFor(s)} showUnit />
      {/each}
    </div>
  {/if}
</div>

<style>
  h1 {
    font-size: 1.2rem;
    margin-top: 22px;
  }
  .hint {
    color: var(--text-dim);
    text-align: center;
    margin-top: 30px;
  }
</style>
