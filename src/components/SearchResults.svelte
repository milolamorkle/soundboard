<script lang="ts">
  import { catalog, factionOf } from '../lib/catalog';
  import { search } from '../lib/search';
  import type { Sound } from '../lib/types';
  import SoundButton from './SoundButton.svelte';

  export let query: string;

  let gameFilter: string | undefined;
  let factionFilter: string | undefined;

  $: results = $catalog ? search(query, { game: gameFilter, faction: factionFilter }) : [];
  $: factionChoices = gameFilter ? ($catalog?.games.find((g) => g.id === gameFilter)?.factions ?? []) : [];

  function pickGame(id: string | undefined) {
    gameFilter = gameFilter === id ? undefined : id;
    factionFilter = undefined;
  }

  function accentFor(s: Sound): string {
    return factionOf(s.game, s.faction)?.color ?? 'var(--accent)';
  }
</script>

<div class="container">
  <div class="filters">
    {#each $catalog?.games ?? [] as g (g.id)}
      <button class="chip" class:on={gameFilter === g.id} on:click={() => pickGame(g.id)}>{g.short}</button>
    {/each}
    {#each factionChoices as f (f.id)}
      <button
        class="chip"
        class:on={factionFilter === f.id}
        style="--chip-accent: {f.color}"
        on:click={() => (factionFilter = factionFilter === f.id ? undefined : f.id)}>{f.name}</button
      >
    {/each}
  </div>

  {#if query.trim().length < 2}
    <p class="hint">Type at least 2 characters…</p>
  {:else if results.length === 0}
    <p class="hint">No lines match “{query}”.</p>
  {:else}
    <div class="results">
      {#each results as s (s.id)}
        <SoundButton sound={s} accent={accentFor(s)} showUnit />
      {/each}
    </div>
  {/if}
</div>

<style>
  .filters {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
    margin: 14px 0;
  }
  .chip {
    border: 1px solid var(--border);
    border-radius: 999px;
    padding: 6px 12px;
    font-size: 0.85rem;
    color: var(--text-dim);
    background: var(--bg-raised);
  }
  .chip.on {
    color: var(--text);
    border-color: var(--chip-accent, var(--accent));
    background: color-mix(in srgb, var(--chip-accent, var(--accent)) 18%, var(--bg-raised));
  }
  .hint {
    color: var(--text-dim);
    text-align: center;
    margin-top: 30px;
  }
  .results {
    display: grid;
    gap: 8px;
  }
</style>
