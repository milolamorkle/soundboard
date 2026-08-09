# RTS Soundboard

Mobile-first static PWA soundboard for StarCraft II and Red Alert 2 unit voice
lines. Public, free-hosted, no backend. Full design rationale: [PLAN.md](PLAN.md).

## Commands

- `npm run dev` — dev server (port 5173; use the `.claude/launch.json` config `soundboard-dev`)
- `npm test` — Vitest unit tests (happy-dom env)
- `npm run check` — svelte-check type checking
- `npm run build` — production build to `dist/`
- `npm run samples` — regenerate placeholder TTS clips (macOS `say`) + catalog
- `npm run ingest` — process `sounds-src/` raw audio + mapping into `public/audio/` + `public/catalog.json`
- `npm run icons` — regenerate PWA icons procedurally

## Architecture

- **Fully static.** Vite + Svelte 4 + TypeScript. No server, no accounts; favorites
  live in localStorage. Deployed on Cloudflare Pages (build `npm run build`, output `dist`).
- **Data:** `public/catalog.json` holds ALL metadata incl. per-clip transcripts
  (`Sound` type in `src/lib/types.ts`). Loaded once at startup (~KBs). Audio clips
  are content-hashed `.m4a` files fetched only on tap (~15–25KB each).
- **Playback:** Web Audio API (`src/lib/audio.ts`) — decode + LRU cache, unlimited
  overlap. Never use `<audio>` elements (flaky on iOS with overlap).
- **Search:** MiniSearch over transcripts (`src/lib/search.ts`), min 2 chars,
  prefix + fuzzy. Facet suggestions (browse/filter) in `src/lib/suggest.ts`.
- **Routing:** hand-rolled history router. Pure path parsing in `src/lib/routes.ts`
  (unit-tested), DOM wiring in `src/lib/router.ts`. Paths: `/:game/:faction/:unit`,
  `/s/:id` (share landing), `/favorites`, `/about`.
- **Ingest pipeline:** `scripts/ingest.mjs` — mapping-driven (see README), prefers
  ffmpeg (loudness-normalize) with afconvert fallback. Sample generator
  `scripts/make-samples.mjs` produces spoken TTS placeholders until real game audio arrives.

## Conventions

- Keep first-load payload small: app shell + catalog < ~400KB. No new runtime
  deps without weighing bundle size.
- Security: static-only, strict CSP in `public/_headers` — no third-party
  scripts, no analytics, no inline `<script>` in index.html.
- Dark theme design tokens in `src/app.css` (`--surface-*` elevation scale,
  `--text*` emphasis tiers). Faction accent colors come from `catalog.json`,
  applied via `style="--sb-accent: ..."` / `--card-accent`.
- Pure logic goes in `src/lib/*.ts` with a `*.test.ts` beside it; Svelte
  components stay thin.
- Copyright: fan project — keep the Blizzard/EA disclaimer in About and README.

## Gotchas

- This machine's default `git@github.com` SSH key is a deploy key for another
  repo; the remote uses the `github-infinifractals` host alias which is the real
  `milolamorkle` account key. Don't "fix" the remote URL to plain github.com.
- There is a stray git repo at the user's home directory; always run git from
  the project root.
- No ffmpeg installed locally — ingest falls back to `afconvert` (macOS).
- Node 18: pin test deps accordingly (vitest 2.x, happy-dom 14.x, vite 5).
