<script lang="ts">
  import { catalog } from '../lib/catalog';
  import { navigate } from '../lib/router';

  export let gameId: string;

  $: game = $catalog?.games.find((g) => g.id === gameId);
  $: counts = countByFaction($catalog?.sounds ?? []);

  function countByFaction(sounds: { game: string; faction: string }[]): Map<string, number> {
    const m = new Map<string, number>();
    for (const s of sounds) {
      if (s.game !== gameId) continue;
      m.set(s.faction, (m.get(s.faction) ?? 0) + 1);
    }
    return m;
  }
</script>

<div class="container">
  {#if game}
    <nav class="crumb">
      <a href="/" on:click|preventDefault={() => navigate('/')}>Games</a> ›
      <span>{game.name}</span>
    </nav>
    <h1>{game.name}</h1>
    <div class="cardlist">
      {#each game.factions as f (f.id)}
        <button class="navcard" style="--card-accent: {f.color}" on:click={() => navigate(`/${gameId}/${f.id}`)}>
          <span>
            <span class="title">{f.name}</span>
            <span class="sub" style="display:block">{counts.get(f.id) ?? 0} sounds</span>
          </span>
          <span class="chev">›</span>
        </button>
      {/each}
    </div>
  {:else}
    <p class="crumb">Unknown game.</p>
  {/if}
</div>

<style>
  h1 {
    font-size: 1.2rem;
    margin-top: 4px;
  }
</style>
