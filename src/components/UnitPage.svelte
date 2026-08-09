<script lang="ts">
  import { catalog, gameById, factionOf, soundsOfUnit, groupByType, TYPE_LABELS } from '../lib/catalog';
  import { navigate } from '../lib/router';
  import SoundButton from './SoundButton.svelte';

  export let gameId: string;
  export let factionId: string;
  export let unitId: string;

  $: game = $catalog ? gameById(gameId) : undefined;
  $: faction = $catalog ? factionOf(gameId, factionId) : undefined;
  $: sounds = $catalog ? soundsOfUnit(gameId, factionId, unitId) : [];
  $: groups = groupByType(sounds);
  $: unitName = sounds[0]?.unitName ?? unitId;
</script>

<div class="container">
  {#if game && faction && sounds.length > 0}
    <nav class="crumb">
      <a href="/" on:click|preventDefault={() => navigate('/')}>Games</a> ›
      <a href="/{gameId}" on:click|preventDefault={() => navigate(`/${gameId}`)}>{game.name}</a> ›
      <a href="/{gameId}/{factionId}" on:click|preventDefault={() => navigate(`/${gameId}/${factionId}`)}>{faction.name}</a> ›
      <span>{unitName}</span>
    </nav>
    <h1 style="color: {faction.color}">{unitName}</h1>
    {#each groups as [type, groupSounds] (type)}
      <section>
        <h2>{TYPE_LABELS[type] ?? type} <span class="n">{groupSounds.length}</span></h2>
        <div class="soundgrid">
          {#each groupSounds as s (s.id)}
            <SoundButton sound={s} accent={faction.color} />
          {/each}
        </div>
      </section>
    {/each}
  {:else}
    <p class="crumb">Unknown unit.</p>
  {/if}
</div>

<style>
  h1 {
    font-size: 1.2rem;
    margin-top: 4px;
  }
  h2 {
    font-size: 0.85rem;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: var(--text-dim);
    margin: var(--sp-5) 0 var(--sp-2);
  }
  .n {
    color: var(--text-faint);
    font-weight: 400;
  }
</style>
