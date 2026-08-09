<script lang="ts">
  import { catalog, factionOf } from '../lib/catalog';
  import { search } from '../lib/search';
  import { findDestinations, extractFilterTokens } from '../lib/suggest';
  import { navigate } from '../lib/router';
  import type { Sound } from '../lib/types';
  import SoundButton from './SoundButton.svelte';

  export let query: string;

  let gameFilter: string | undefined;
  let factionFilter: string | undefined;

  $: destinations = $catalog ? findDestinations(query, $catalog) : [];
  $: token = $catalog && !gameFilter && !factionFilter ? extractFilterTokens(query, $catalog) : null;
  $: results = $catalog ? search(query, { game: gameFilter, faction: factionFilter }) : [];

  $: activeGame = $catalog?.games.find((g) => g.id === gameFilter);
  $: activeFaction = activeGame?.factions.find((f) => f.id === factionFilter);
  $: factionChoices = activeGame && !factionFilter ? activeGame.factions : [];

  function applyToken() {
    if (!token) return;
    gameFilter = token.game ?? gameFilter;
    factionFilter = token.faction;
    query = token.remainder;
  }

  function browse(path: string) {
    query = '';
    gameFilter = factionFilter = undefined;
    navigate(path);
  }

  function clearFilters() {
    gameFilter = factionFilter = undefined;
  }

  function accentFor(s: Sound): string {
    return factionOf(s.game, s.faction)?.color ?? 'var(--accent)';
  }
</script>

<div class="container">
  <div class="filters">
    {#if !gameFilter}
      {#each $catalog?.games ?? [] as g (g.id)}
        <button class="chip" on:click={() => (gameFilter = g.id)}>{g.short}</button>
      {/each}
    {:else}
      <button class="chip on" on:click={() => ((gameFilter = undefined), (factionFilter = undefined))}>
        {activeGame?.short}<span class="x">✕</span>
      </button>
    {/if}
    {#each factionChoices as f (f.id)}
      <button class="chip" style="--chip-accent: {f.color}" on:click={() => (factionFilter = f.id)}>{f.name}</button>
    {/each}
    {#if activeFaction}
      <button class="chip on" style="--chip-accent: {activeFaction.color}" on:click={() => (factionFilter = undefined)}>
        {activeFaction.name}<span class="x">✕</span>
      </button>
    {/if}
    {#if gameFilter || factionFilter}
      <button class="chip clear" on:click={clearFilters}>Clear all</button>
    {/if}
  </div>

  {#if token && token.remainder}
    <button class="suggest token" style="--chip-accent: {token.color ?? 'var(--accent)'}" on:click={applyToken}>
      Search “{token.remainder}” in <strong>{token.label}</strong>
    </button>
  {/if}

  {#if destinations.length > 0}
    <div class="destinations">
      {#each destinations as d (d.path)}
        <button class="suggest" style="--chip-accent: {d.color ?? 'var(--accent)'}" on:click={() => browse(d.path)}>
          <span class="d-label">{d.label}</span>
          <span class="d-sub">{d.sub}</span>
          <span class="d-go">Browse ›</span>
        </button>
      {/each}
    </div>
  {/if}

  {#if query.trim().length < 2}
    <p class="hint">Type at least 2 characters…</p>
  {:else if results.length === 0 && destinations.length === 0}
    <p class="hint">No lines match “{query}”.</p>
  {:else if results.length > 0}
    <div class="soundgrid">
      {#each results as s (s.id)}
        <SoundButton sound={s} accent={accentFor(s)} showUnit />
      {/each}
    </div>
  {/if}
</div>

<style>
  .filters {
    display: flex;
    gap: var(--sp-2);
    flex-wrap: wrap;
    margin: var(--sp-4) 0;
  }
  .chip.clear {
    color: var(--text-faint);
    border-style: dashed;
  }
  .destinations {
    display: grid;
    gap: var(--sp-2);
    margin-bottom: var(--sp-4);
  }
  .suggest {
    display: flex;
    align-items: baseline;
    gap: var(--sp-2);
    width: 100%;
    text-align: left;
    background: var(--surface-1);
    border: 1px solid var(--border);
    border-left: 4px solid var(--chip-accent, var(--accent));
    border-radius: var(--radius-sm);
    padding: var(--sp-3);
    font-size: 0.9rem;
    transition: background 0.12s;
  }
  .suggest:hover,
  .suggest:active {
    background: var(--surface-2);
  }
  .suggest.token {
    margin-bottom: var(--sp-2);
    color: var(--text-dim);
  }
  .suggest.token strong {
    color: var(--text);
  }
  .d-label {
    font-weight: 600;
  }
  .d-sub {
    color: var(--text-dim);
    font-size: 0.8rem;
    flex: 1;
  }
  .d-go {
    color: var(--text-faint);
    font-size: 0.8rem;
  }
  .hint {
    color: var(--text-dim);
    text-align: center;
    margin-top: var(--sp-6);
  }
</style>
