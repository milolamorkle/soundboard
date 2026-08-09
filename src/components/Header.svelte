<script lang="ts">
  import { navigate, route } from '../lib/router';
  import { favorites } from '../lib/favorites';

  export let query: string;

  function go(e: MouseEvent, path: string) {
    e.preventDefault();
    query = '';
    navigate(path);
  }
</script>

<header>
  <div class="bar container">
    <a href="/" class="logo" on:click={(e) => go(e, '/')} aria-label="Home">
      <span class="logo-mark" aria-hidden="true">▶</span>
      <span class="logo-text">RTS&nbsp;Soundboard</span>
    </a>
    <input
      type="search"
      placeholder="Search voice lines…"
      bind:value={query}
      autocomplete="off"
      autocapitalize="off"
      aria-label="Search voice lines"
    />
    <a
      href="/favorites"
      class="favlink"
      class:active={$route.name === 'favorites'}
      on:click={(e) => go(e, '/favorites')}
      aria-label="Favorites"
    >
      ★{#if $favorites.size > 0}<span class="count">{$favorites.size}</span>{/if}
    </a>
  </div>
</header>

<style>
  header {
    position: sticky;
    top: 0;
    z-index: 10;
    background: color-mix(in srgb, var(--bg) 88%, transparent);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    border-bottom: 1px solid var(--border);
    padding-top: env(safe-area-inset-top);
  }
  .bar {
    display: flex;
    align-items: center;
    gap: 10px;
    padding-top: 10px;
    padding-bottom: 10px;
  }
  .logo {
    display: flex;
    align-items: center;
    gap: 7px;
    color: var(--text);
    font-weight: 700;
    flex: none;
  }
  .logo-mark {
    color: var(--accent);
  }
  input {
    flex: 1;
    min-width: 0;
    background: var(--bg-raised);
    border: 1px solid var(--border);
    border-radius: 999px;
    color: var(--text);
    padding: 9px 14px;
    font-size: 16px; /* prevents iOS zoom-on-focus */
    outline: none;
  }
  input:focus {
    border-color: var(--accent);
  }
  .favlink {
    flex: none;
    color: var(--text-dim);
    font-size: 1.2rem;
    display: flex;
    align-items: center;
    gap: 3px;
    padding: 4px;
  }
  .favlink.active,
  .favlink:hover {
    color: var(--star);
  }
  .count {
    font-size: 0.75rem;
    color: var(--text-dim);
  }
  @media (max-width: 480px) {
    .logo-text {
      display: none;
    }
  }
</style>
