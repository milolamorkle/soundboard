<script lang="ts">
  import { catalog, soundsById, factionOf, gameById } from '../lib/catalog';
  import { play } from '../lib/audio';
  import { navigate } from '../lib/router';

  export let soundId: string;

  $: sound = $soundsById.get(soundId);
  $: faction = sound && $catalog ? factionOf(sound.game, sound.faction) : undefined;
  $: game = sound && $catalog ? gameById(sound.game) : undefined;

  let error = false;

  async function tapPlay() {
    if (!sound) return;
    error = false;
    try {
      await play(sound.id, sound.file);
    } catch {
      error = true;
    }
  }
</script>

<div class="container share">
  {#if sound && faction && game}
    <p class="from" style="color: {faction.color}">{game.name} · {faction.name} · {sound.unitName}</p>
    <h1>“{sound.text}”</h1>
    <button class="big" style="--sb-accent: {faction.color}" on:click={tapPlay} aria-label="Play sound">▶</button>
    {#if error}<p class="err">Couldn’t play that — try again.</p>{/if}
    <p class="links">
      <a
        href="/{sound.game}/{sound.faction}/{sound.unit}"
        on:click|preventDefault={() => sound && navigate(`/${sound.game}/${sound.faction}/${sound.unit}`)}
      >
        More {sound.unitName} lines ›
      </a>
    </p>
  {:else if $catalog}
    <h1>Sound not found</h1>
    <p class="links"><a href="/" on:click|preventDefault={() => navigate('/')}>Browse the soundboard ›</a></p>
  {/if}
</div>

<style>
  .share {
    text-align: center;
    padding-top: 8vh;
  }
  .from {
    font-size: 0.9rem;
  }
  h1 {
    font-size: 1.4rem;
    margin: 10px 0 30px;
  }
  .big {
    width: 96px;
    height: 96px;
    border-radius: 50%;
    background: color-mix(in srgb, var(--sb-accent, var(--accent)) 25%, transparent);
    border: 2px solid var(--sb-accent, var(--accent));
    color: var(--sb-accent, var(--accent));
    font-size: 2rem;
  }
  .big:active {
    transform: scale(0.96);
  }
  .err {
    color: var(--danger);
    font-size: 0.85rem;
  }
  .links {
    margin-top: 34px;
  }
</style>
