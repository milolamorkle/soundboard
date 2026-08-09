<script lang="ts">
  import { route } from './lib/router';
  import { catalog, loadError } from './lib/catalog';
  import { loadCatalog } from './lib/catalog';
  import Header from './components/Header.svelte';
  import SearchResults from './components/SearchResults.svelte';
  import ActionSheet from './components/ActionSheet.svelte';
  import Home from './components/Home.svelte';
  import GamePage from './components/GamePage.svelte';
  import FactionPage from './components/FactionPage.svelte';
  import UnitPage from './components/UnitPage.svelte';
  import FavoritesPage from './components/FavoritesPage.svelte';
  import SharePage from './components/SharePage.svelte';
  import AboutPage from './components/AboutPage.svelte';

  let query = '';
  $: searching = query.trim().length > 0;
</script>

<Header bind:query />

<ActionSheet />

{#if searching}
  <SearchResults bind:query />
{:else if $loadError}
  <div class="container state">
    <p>Couldn’t load the sound catalog ({$loadError}).</p>
    <button
      class="retry"
      on:click={() => {
        loadError.set(null);
        void loadCatalog();
      }}>Retry</button
    >
  </div>
{:else if !$catalog}
  <div class="container state"><p>Loading…</p></div>
{:else if $route.name === 'home'}
  <Home />
{:else if $route.name === 'game' && $route.game}
  <GamePage gameId={$route.game} />
{:else if $route.name === 'faction' && $route.game && $route.faction}
  <FactionPage gameId={$route.game} factionId={$route.faction} />
{:else if $route.name === 'unit' && $route.game && $route.faction && $route.unit}
  <UnitPage gameId={$route.game} factionId={$route.faction} unitId={$route.unit} />
{:else if $route.name === 'favorites'}
  <FavoritesPage />
{:else if $route.name === 'share' && $route.soundId}
  <SharePage soundId={$route.soundId} />
{:else if $route.name === 'about'}
  <AboutPage />
{/if}

<style>
  .state {
    text-align: center;
    color: var(--text-dim);
    margin-top: 40px;
  }
  .retry {
    margin-top: 10px;
    border: 1px solid var(--border);
    border-radius: 999px;
    padding: 8px 18px;
    background: var(--surface-1);
    color: var(--text);
  }
</style>
