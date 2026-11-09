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
- **How it gets onto the home screen (found 2026-11-08):** a site on a Kids profile's allowed list shows up as an icon in the kid's **My Stuff** folder on the home screen, and it opens fullscreen with no address bar. That icon is the Arcade's install. Nothing is installed from Silk.

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
- Suite rule changes reach each Game as tickets filed in its own repo (see Game lifecycle). The handoff notes written 2026-11-08 are retired; see [ADR 0002](docs/adr/0002-rules-from-first-commit-tickets-not-handoffs.md).

## Game lifecycle
A Game is an Arcade Game **from its first commit**. Joining the Arcade is one line in the Games list, after a Ready check.

```
idea-board pitch
   │
1. START     copy the Arcade's starter into Projects\<slug>\ (NEW-GAME.md);
   │         Dad runs `gh repo create`. Suite rules already met.
2. GRILL     DESIGN.md / GLOSSARY / spec + tickets, as now
3. BUILD     every push deploys to /<slug>/ (no Tile, so the kids can't reach it)
4. TABLET    temporary Test Tile for play-test sessions
5. READY     Arcade session runs the Ready check → pass → Dad's call → "ready"
   │         in the Games list.  fail → tickets filed in the Game's repo
6. LIVE      later changes just push; the Tile already points there
```

- **The Arcade never fixes a Game.** Ready check failures become tickets in the Game's own `.scratch/arcade/issues/`. A failed check keeps the Game off Ready until those tickets are done.
- **Housekeeping is Dad's.** Unmerged branches, leftover worktrees and stray files go on Dad's "for you" list. The Arcade reports them and never does them.
- **No handoff notes.** When `SUITE-RULES.md` changes, the Arcade session files a ticket straight into each Game's repo.
- **Sweeps:** the Ready check runs across every Game when Dad asks, and whenever `SUITE-RULES.md` changes.
- **Coming-soon Tiles are Dad's call per Game.** The default is no Tile until Ready.
- Doodle Monsters and Secret Script Studio keep their Tiles. The first run of the check files their catch-up tickets.

## Tablet checklist (run first, at whichever Game's tablet session comes first)
- [x] Approving `trevordobrinska.github.io` in the Parent Dashboard also lets the Games' sub-addresses open
- [x] The Arcade gets onto a Kids profile's home screen: not through Silk's install, but as the allowed site's icon in **My Stuff**, which opens fullscreen (2026-11-08)
- [x] Tapping a Tile opens the Game inside the fullscreen Arcade window (not a browser tab)
- [x] Back (system Back and the house button) returns to the Arcade: system Back passed 2026-11-08
- [x] Repeat on the son's tablet: done 2026-11-08; the Arcade is on both tablets' home screens
