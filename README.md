# RTS Soundboard

Mobile-first PWA soundboard for StarCraft II and Red Alert 2 unit voice lines.
Fully static — no backend. See [PLAN.md](PLAN.md) for the full design.

## Develop

```bash
npm install
npm run samples   # generate placeholder TTS clips (macOS) + catalog
npm run dev
```

## Real audio import

Put raw audio in `sounds-src/raw/`, describe it in `sounds-src/mapping.json`
(one entry per clip: `file, game, faction, unit, unitName, type, text`) and the
game/faction metadata in `sounds-src/games.json`, then:

```bash
npm run ingest
```

Clips are loudness-normalized (needs `ffmpeg`; falls back to `afconvert`
without normalization), encoded to ~48kbps mono AAC with content-hashed
filenames, and written to `public/audio/` + `public/catalog.json`.

## Deploy (Cloudflare Pages)

1. Push this repo to GitHub.
2. Cloudflare dashboard → Workers & Pages → Create → Pages → connect the repo.
3. Build command: `npm run build` — output directory: `dist`.

`public/_headers` ships the CSP/security headers and immutable caching rules.

## Copyright

Fan project. StarCraft II audio © Blizzard Entertainment; Red Alert 2 audio ©
Electronic Arts. Not affiliated with or endorsed by either company. Content
will be removed promptly on request from a rights holder.
