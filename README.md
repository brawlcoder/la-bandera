# La Bandera de San Fernando

Daily Real Betis player guessing game. Bilingual (ES/EN). Built with Vite + React + Tailwind.

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:5173

## Deploy

Push to GitHub, connect to Vercel, done. Vercel auto-detects Vite.

## Project structure

```
src/
├── App.jsx                # entry — just renders <Game/>
├── main.jsx               # React mounting
├── data/
│   ├── club.json          # club identity: name, colours, copy
│   └── players.json       # the player roster (~75 players)
├── core/                  # club-agnostic engine
│   ├── compare.js         # guess-vs-target comparison logic
│   ├── daily.js           # daily target picker, clue generator
│   ├── constants.js       # positions, eras, flags, country names
│   ├── i18n.js            # all UI strings ES + EN
│   ├── theme.js           # colour palette derived from club.json
│   └── share.js           # shareable result text
└── components/
    └── Game.jsx           # the main UI component
```

## Forking for another club

To create a Real Madrid version:

1. Fork this repo to `los-papeles` (or similar)
2. Edit `src/data/club.json` — change name, colours, ritual story
3. Replace `src/data/players.json` with the new roster
4. Push, deploy to a new Vercel project, point at a new domain

The engine (`src/core/`) and components (`src/components/`) shouldn't need changes.

## Player data shape

Each entry in `players.json`:

```json
{
  "name": "Joaquín",
  "country": "ESP",
  "pos": "WG",
  "era": ["2000s","2010s","modern"],
  "yearJoined": 2000,
  "mainSpell": "2000-06, 2015-23",
  "apps": 421,
  "goals": 35,
  "trophy": ["Copa del Rey 2005", "Copa del Rey 2022"],
  "difficulty": "easy",
  "clue": { "es": "...", "en": "..." }
}
```

`clue` is only required for `difficulty: "easy"` — medium and hard players get an algorithmically-generated attribute clue.
