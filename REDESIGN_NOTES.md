# Redesign notes — Championship Archive

## Critique of the prior live site

- Framed as a **live event dashboard** (green pulse, “View Live Leaderboard”, “Today’s Schedule”, course-of-the-day weather) after the championship was already complete.
- Hero led with brand wordmark rather than the champion; gold shimmer/particles competed with hierarchy.
- Empty table shells before `data.json` loaded; leaderboard was horizontal-scroll only on phones.
- Muted text contrast and focus rings were weak; OG/Twitter meta was missing.
- Leaderboard avatars never rendered (`p.avatar` on leaderboard rows instead of `player.avatar`).

## What changed

1. **Archive framing** — Champion-first hero (Jeff photo, 126 pts), archive badge, “Final Standings” CTA; removed live pulse / live CTAs / today-course weather.
2. **Scottish links luxury** — Same heather / thistle / whisky palette, quieter motion, `prefers-reduced-motion` respected; particles and shimmer removed.
3. **Typography & spacing** — Cinzel + Inter retained; clearer section rhythm and contrast on muted text.
4. **Skeletons** — Placeholder rows/cards until JS fills from `data.json`.
5. **Mobile standings** — Card-style leaderboard under 768px; table on desktop.
6. **A11y** — Skip link, visible `:focus-visible`, better muted contrast, `aria` labels, semantic headers.
7. **SEO/share** — Title, description, canonical, Open Graph + Twitter cards → `https://lorangb.github.io/scotland2026/` with `images/jeff.jpg`.
8. **Structure** — Split to `styles.css` + `app.js` for maintainability; GitHub Pages root paths unchanged.
9. **Personality kept** — Pro Shop bet, Ken Rule, Old Course solos, Criterion, Molly Malones, trophies.
10. **`data.json` untouched** — Scores and schema preserved; builders still consume the same fields.

## Verify

```bash
python3 -m http.server 8080
# Check hero → standings → mobile cards → images load from images/
sha256sum data.json  # must match pre-redesign hash
```
