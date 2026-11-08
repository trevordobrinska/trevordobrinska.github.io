# 01: Scaffold the Arcade repo and show the menu from the Games list

**What to build:** Opening the Arcade page locally in desktop Chromium shows "Dobrinska Arcade" and a scrolling grid of big Tiles drawn from the hand-edited Games list. At launch that's Doodle Monsters and Secret Script Studio, both as greyed-out Coming-soon Tiles that do nothing when tapped. The Menu module (a pure function from Games list to ordered Tiles, with validation) is the one tested seam. This ticket also sets the folder up as a repo that later sessions can find their way around. See `../spec.md` (Implementation Decisions: Games list, Menu module, Page).

**Blocked by:** None (can start immediately)

**Status:** resolved

- [x] `Projects\arcade\` is a git repo (local only, no remote yet) with a CLAUDE.md and `docs/agents/` copied from the Games' conventions: local-markdown tracker in `.scratch/`, five triage labels, single-context GLOSSARY.md + `docs/adr/`
- [x] The Games list holds entries with `slug`, `name`, `state` (`ready` / `coming-soon` / `test`) and, for Test entries only, `path`; list order is the Tile order
- [x] The Menu module orders Tiles as Ready, then Test, then Coming-soon, keeping list order within each group
- [x] Ready links to `/<slug>/`, Test links to `/<slug>/<path>`, Coming-soon has no link; every icon is `/<slug>/icon-512.png`
- [x] Validation rejects duplicate slugs among Ready/Coming-soon entries, an empty name, an unknown state, and a Test entry without `path`; a Test entry may share a slug with a Ready/Coming-soon entry
- [x] `node --test` covers all of the above plus "the real launch Games list is valid", with no package dependencies and no build step
- [x] The page renders big Tiles that fit a 1280×800 tablet in both orientations and scroll vertically; Coming-soon Tiles are greyed out and inert; Test Tiles show a TEST badge
- [x] A Tile whose icon fails to load still shows the Game's name on a plain background (true for both launch Games locally)
- [x] Plain HTML/CSS/ES modules only; no framework, bundler or runtime dependency

## Comments

- 2026-11-08 (agent): Done. `games.js` is the Games list, `menu.js` the Menu module (throws an Error naming the bad entry), `main.js`/`index.html`/`style.css` the page, with 11 tests in `test/menu.test.js`. A `package.json` exists only to set `"type": "module"` and a `test` script; it has no dependencies. If the Games list is invalid, the page shows the error instead of Tiles. Checked in headless Edge at 1280×800 and 800×1280 (5 and 3 Tiles across, name-only fallback for both launch Games), plus a temporary longer list to see the TEST badge and vertical scrolling. To view locally, run `python -m http.server` at the repo root, because module scripts don't load from `file://`. Found no disagreement between the spec and DESIGN.md.
