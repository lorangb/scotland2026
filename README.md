# LIST Golf Scotland 2026 Championship Archive

Official **results archive** for the LIST Golf Scotland 2026 Championship.

**July 26 — August 1, 2026** · St Andrews & The Kingdom of Fife, Scotland

**Champion:** Jeff Karges — **126** pts  
**Runner-up:** Graham Johnson — **121** pts (Pro Shop bet)

## Live site

**https://lorangb.github.io/scotland2026/**

> Repo homepage field: set to the Pages URL above via GitHub Settings → General → Homepage (or API).

## What's here

- **Final Standings** — Champion-first hero, full leaderboard (desktop table + mobile cards)
- **Player Profiles** — 11 contenders with handicaps, GHINs, and bios
- **Course Profiles** — All 6 Fife courses with descriptions and links
- **Week Schedule & Pairings** — Round-by-round timeline and groups
- **Scoring Breakdown** — Skins and bonus points per round
- **LIST Golf Rules** — Formats, skins, presses, and the Ken Rule
- **Pub Guide** — Criterion darts, Molly Malones karaoke, and the rest
- **Logistics** — Airbnbs, packing list, St Andrews climate widget

## Tech

- Static HTML/CSS/JS (GitHub Pages, no build step)
- Dark Scottish links palette (heather purple, thistle green, whisky gold)
- Data from `data.json` (do not invent scores)
- Google Fonts (Cinzel + Inter) · Font Awesome · Open-Meteo climate API
- Relative image paths (`images/…`) as in this repo

## Local preview

```bash
cd scotland2026
python3 -m http.server 8080
# open http://localhost:8080
```

## Updating results

Edit `data.json` only when correcting archive data. Scores and player results must stay exact.
