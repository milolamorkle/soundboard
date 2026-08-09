<script lang="ts">
  import { navigate } from '../lib/router';
</script>

<div class="container">
  <h1>About</h1>
  <p>
    A fan-made soundboard for the unit voice lines of <strong>StarCraft II</strong> and
    <strong>Command &amp; Conquer: Red Alert 2</strong>. Tap a line to play it; sounds are only
    downloaded when you play them, so the site stays fast and light on mobile data.
  </p>
  <h2>Copyright</h2>
  <p>
    All audio is the property of its respective owners: StarCraft II sounds ©
    Blizzard Entertainment, Inc.; Red Alert 2 sounds © Electronic Arts Inc. This is a
    non-commercial fan project, not affiliated with or endorsed by either company. If you are a
    rights holder and want content removed, it will be taken down promptly on request.
  </p>
  <h2>Privacy</h2>
  <p>
    No accounts, no tracking, no analytics. Favorites are stored only on your device.
  </p>
  <p class="back"><a href="/" on:click|preventDefault={() => navigate('/')}>‹ Back to the soundboard</a></p>
</div>

<style>
  h1 {
    font-size: 1.2rem;
    margin-top: 22px;
  }
  h2 {
    font-size: 1rem;
    margin-top: 24px;
  }
  p {
    color: var(--text-dim);
    line-height: 1.55;
  }
  .back {
    margin-top: 30px;
  }
</style>
