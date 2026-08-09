<script lang="ts">
  import { catalog } from '../lib/catalog';
  import { navigate } from '../lib/router';

  const GAME_TAGLINES: Record<string, string> = {
    sc2: 'Terran · Zerg · Protoss',
    ra2: 'Allied · Soviet · Yuri'
  };
</script>

<div class="container">
  <h1>Pick a game</h1>
  <div class="cardlist">
    {#each $catalog?.games ?? [] as g (g.id)}
      <button class="navcard" style="--card-accent: {g.factions[0]?.color ?? 'var(--accent)'}" on:click={() => navigate(`/${g.id}`)}>
        <span>
          <span class="title">{g.name}</span>
          <span class="sub" style="display:block">{GAME_TAGLINES[g.id] ?? ''}</span>
        </span>
        <span class="chev">›</span>
      </button>
    {/each}
  </div>
  <p class="foot">
    A fan-made soundboard. Not affiliated with Blizzard Entertainment or Electronic Arts.
    <a href="/about" on:click|preventDefault={() => navigate('/about')}>About</a>
  </p>
</div>

<style>
  h1 {
    font-size: 1.2rem;
    margin-top: 22px;
  }
  .foot {
    margin-top: 34px;
    color: var(--text-dim);
    font-size: 0.8rem;
    text-align: center;
  }
</style>
