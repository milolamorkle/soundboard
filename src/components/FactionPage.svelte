<script lang="ts">
  import { catalog, gameById, factionOf, unitsOf } from '../lib/catalog';
  import { navigate } from '../lib/router';

  export let gameId: string;
  export let factionId: string;

  $: game = $catalog ? gameById(gameId) : undefined;
  $: faction = $catalog ? factionOf(gameId, factionId) : undefined;
  $: units = $catalog ? unitsOf(gameId, factionId) : [];
</script>

<div class="container">
  {#if game && faction}
    <nav class="crumb">
      <a href="/" on:click|preventDefault={() => navigate('/')}>Games</a> ›
      <a href="/{gameId}" on:click|preventDefault={() => navigate(`/${gameId}`)}>{game.name}</a> ›
      <span>{faction.name}</span>
    </nav>
    <h1 style="color: {faction.color}">{faction.name}</h1>
    <div class="cardlist">
      {#each units as u (u.unit)}
        <button class="navcard" style="--card-accent: {faction.color}" on:click={() => navigate(`/${gameId}/${factionId}/${u.unit}`)}>
          <span>
            <span class="title">{u.unitName}</span>
            <span class="sub" style="display:block">{u.count} lines</span>
          </span>
          <span class="chev">›</span>
        </button>
      {/each}
    </div>
  {:else}
    <p class="crumb">Unknown faction.</p>
  {/if}
</div>

<style>
  h1 {
    font-size: 1.2rem;
    margin-top: 4px;
  }
</style>
