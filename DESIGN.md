# Dobrinska Arcade: design

Grilled 2026-11-07 and 2026-11-08. Terms are defined in [GLOSSARY.md](GLOSSARY.md); the rules every Game must follow are in [SUITE-RULES.md](SUITE-RULES.md).

## What it is
One home page where both kids find every Game Dad builds. Each kid opens it on their own tablet and plays whatever they like. There is **one shared menu**, with no per-kid setup.

## Where it lives
- Project folder `Projects\arcade\` → GitHub repo **`trevordobrinska.github.io`**, which GitHub Pages publishes at the site root: `https://trevordobrinska.github.io/`.
- **Each Game keeps its own repo and folder** and publishes at its own path (`/doodle-monsters/`, `/secret-script-studio/`). That puts every Game inside the Arcade's site with no merging. See [ADR 0001](docs/adr/0001-separate-repos-one-origin.md).
- Adding a Game to the Arcade = adding one entry to the Games list. Nothing else changes in either repo.

## Build
- Plain HTML and CSS with **one hand-edited Games list**. No build step; Pages publishes the repo as is.
- Installable: a manifest (`display: fullscreen`, scope covering the whole site) plus a **pass-through service worker** copied from Secret Script Studio's `public/sw.js`. It caches nothing, so there's no offline play. Games without their own service worker run under the Arcade's, which is harmless.

## Installing
- **Only the Arcade goes on each tablet's home screen.** Games open inside the Arcade's fullscreen window. Games may keep their own manifests, but nobody installs them.
- Approve `trevordobrinska.github.io` once in the Amazon Kids Parent Dashboard.

## The menu
- One screen of big **Tiles**, scrolling vertically as Games are added. Each Tile shows the Game's icon and name.
- A Tile's picture is loaded from the Game's own path: `/<game-slug>/icon-512.png`.
- **Fixed order set by hand.** New Ready Games are added at the end of the playable Tiles. **Coming-soon Tiles** (greyed out, can't be opened) come last.
- A Game gets a playable Tile only when Dad calls it **Ready**. Until then it has a Coming-soon Tile or none.
- **Test Tiles:** for a tablet test session, add a temporary Tile pointing at a Game's throwaway test page (e.g. `/doodle-monsters/night1/`). Remove it after the session. Test Tiles are never Ready.

## Getting back
Every Game's home screen has a small house button linking to the Arcade (`/`). The tablet's own Back is the backup.

## Timing
- **Go live before the next tablet session**, even if the only Tiles are Coming-soon and Test Tiles, so the very first install on each tablet is the Arcade.
- The Games learn about all this through handoff notes in their `.scratch/` folders (written 2026-11-08). Each Game's own session turns its note into tickets and updates its own DESIGN.md.

## Tablet checklist (run first, at whichever Game's tablet session comes first)
- [x] Approving `trevordobrinska.github.io` in the Parent Dashboard also lets the Games' sub-addresses open
- [ ] Silk in a Kids profile can install the Arcade to the home screen: **failed 2026-11-08**, the Kids profile has no option for it (see `.scratch/arcade-v1/issues/05-kids-profile-no-home-screen.md`)
- [ ] Tapping a Tile opens the Game inside the fullscreen Arcade window (not a browser tab): the Tile opens the page, but there's no Arcade window without the install (see 05)
- [x] Back (system Back and the house button) returns to the Arcade: system Back passed 2026-11-08; the house button can't be checked until a Game has one
- [ ] Repeat on the son's tablet (model still unknown)
