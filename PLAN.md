# RTS Soundboard — Project Plan

A public, mobile-first soundboard web app for all StarCraft 2 and Red Alert 2 (+ Yuri's Revenge)
unit voice lines and building-completion announcements.

## Decisions made

| Topic | Decision |
|---|---|
| Scope | All unit voice lines + standard building-completion lines (~2,000–4,000 clips). No generic SFX/UI clicks. |
| Audio source | User will supply the files (format/naming TBD — pipeline must be flexible). |
| Hosting | Free static hosting: **Cloudflare Pages** (global CDN, $0, no server to secure). |
| Features | Tap-to-play, search + filters, favorites (local), share links. No download button. |
| Search | Must search the **spoken text** of every line — transcripts stored per clip and searchable client-side. |
| Browsing | Drill-down: Game → Faction → Unit → lines grouped by type (select / move / attack / annoyed / etc.), with search and filters always available. |
| Playback | Overlap freely — every tap plays immediately on top of whatever is playing. |
| Stack | Vite + Svelte + TypeScript, builds to pure static files. |
| Look | Game-themed dark UI; faction colors (Terran/Protoss/Zerg, Allied/Soviet/Yuri) as section accents. |
| PWA | Yes — installable, app shell cached offline, audio streamed on demand. |
| Copyright | Public with a clear fan-project disclaimer crediting Blizzard and EA; comply with any takedown request. |

## Architecture

**Fully static site.** No backend, no database, no accounts. This satisfies "secure" almost for free:
there is nothing to hack server-side, no user data stored remotely, HTTPS + CSP headers via Cloudflare.

```
[build time]                              [runtime]
raw audio + metadata                      Cloudflare Pages CDN
      │                                        │
      ▼                                        ▼
scripts/ingest  ──►  public/audio/*.m4a   app shell (~50KB) ─ loads instantly
      │              (compressed clips)   catalog.json (~300KB gz) ─ all metadata + transcripts
      └──────────►  catalog.json          audio clips ─ fetched ONLY when tapped (~15–25KB each)
```

### Data budget (the "no shitloads of data" plan)
- **First visit:** app shell + catalog ≈ **under 400KB** total. That's the whole browsable/searchable site.
- **Per sound tap:** one ~15–25KB fetch, then cached (memory + Cache Storage) so replays are free.
- **Full library** (~40–100MB) only ever exists on the CDN; no visitor downloads it all.

### Audio pipeline (`scripts/ingest`)
Node script using ffmpeg. Because the source format/naming is TBD, the pipeline is import-mapping-driven:

1. **Input:** a directory of raw files + a mapping file (CSV/JSON: file → game, faction, unit, line type, transcript).
2. If the supplied list lacks transcripts: scrape the [StarCraft II unit quotations wiki](https://starcraft.fandom.com/wiki/StarCraft_II_unit_quotations) and the RA2/YR quote lists to match lines; fall back to speech-to-text (Whisper) for anything unmatched; flag leftovers for manual review.
3. **Processing per clip:** loudness-normalize (EBU R128), trim silence, encode **AAC .m4a @ ~48kbps** (plays natively on every browser incl. iOS Safari), content-hash the filename for immutable caching.
4. **Output:** `public/audio/<hash>.m4a` + `catalog.json` (id, game, faction, unit, lineType, transcript, duration, file, size).

### Frontend
- **Routing:** hash-free URLs — `/sc2/terran/marine`, `/ra2/soviet/conscript` — each sound has a shareable
  URL (`/s/<id>`) that opens the app scrolled to that sound with a big play button (mobile browsers
  require a tap before audio can play, so deep links show "tap to play").
- **Playback:** Web Audio API (`AudioContext` + `decodeAudioData`) — low latency, unlimited overlap,
  reliable on iOS where multiple `<audio>` elements are flaky. Decoded buffers cached in memory (LRU).
- **Search:** MiniSearch (tiny client-side full-text engine) indexing transcript + unit + faction +
  line type, with prefix and fuzzy matching. Search bar pinned in the header on every screen;
  results show instantly as you type. Faceted-search layer (`src/lib/suggest.ts`): browse
  ("scope") suggestions jump to matching game/faction/unit pages; facet words inside a longer
  query ("terran attack") offer a one-tap removable filter chip; active filters show as chips
  with ✕ and Clear all.
- **Sound tiles:** dense responsive grid (auto-fill minmax(150px, 1fr)) — tap plays, corner ☆
  favorites, long-press/right-click opens a bottom action sheet (share, go to unit). Scales to
  hundreds of lines per unit where full-width rows would not.
- **Favorites:** star any sound → saved in `localStorage`; a Favorites tab lists them. No accounts.
- **Virtualized lists** for any long view so mobile scrolling stays smooth.

### PWA
- `vite-plugin-pwa` (Workbox): precache app shell + catalog; runtime cache-first for audio with a
  size-capped cache; web manifest + icons for Add to Home Screen; update prompt on new deploys.

### Security
- Static site: no server code, no forms, no stored user input (favorites never leave the device).
- Cloudflare Pages `_headers`: strict CSP (self-only, no inline script), `X-Content-Type-Options`,
  `Referrer-Policy`, HSTS. All assets same-origin — no third-party scripts, no analytics by default.
- Immutable, content-hashed asset URLs.

### Copyright
Footer + About page: fan project disclaimer — sounds © Blizzard Entertainment and Electronic Arts,
no affiliation, will comply with removal requests; contact link.

## Build phases

1. **Scaffold** — Vite + Svelte + TS project, Cloudflare Pages deploy pipeline, dark theme shell,
   working with ~20 placeholder/sample clips end-to-end.
2. **Ingest pipeline** — ffmpeg processing, catalog generation, transcript matching tooling
   (finalized once the real files arrive and we see their format).
3. **Core UI** — drill-down navigation, sound buttons with overlap playback, faction theming.
4. **Search & filters** — transcript full-text search, filter chips, search-anywhere header.
5. **Favorites & share links** — localStorage favorites, per-sound URLs with tap-to-play landing.
6. **PWA & polish** — service worker, install prompt, icons, performance pass (Lighthouse mobile ≥95).
7. **Real data import & launch** — run the full library through the pipeline, QA spot-checks, deploy.

## Waiting on / open items
- **The sound files + list** (format unknown — phase 2 adapts to whatever arrives).
- Site name + optional custom domain (works fine on `*.pages.dev` meanwhile).
