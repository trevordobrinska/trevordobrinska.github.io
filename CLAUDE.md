# Dobrinska Arcade

The design decisions are in `DESIGN.md` and the vocabulary is in `GLOSSARY.md`. Those two files are the source of truth. `SUITE-RULES.md` lists what every Game must do to live in the Arcade.

## Code

Plain HTML, CSS and ES modules, published as is by GitHub Pages. No framework, bundler, build step or package dependencies.

- `games.js`: the hand-edited Games list, the only file to edit to change the menu
- `menu.js`: the Menu module, a pure function from Games list to ordered Tiles, with validation (tested; one of the two pure tested modules, with the Ready check module)
- `main.js`, `index.html`, `style.css`: draw the Tiles (not unit-tested)
- `manifest.webmanifest`, `sw.js`, `icons/`: make the Arcade installable and fullscreen. `sw.js` is a copy of Secret Script Studio's pass-through worker and must keep saving nothing. The icons are made by `node tools/make-icons.js` (Node built-ins only) and committed
- `tools/ready-check.js`: the Ready check. `node tools/ready-check.js <slug>` checks one Game; with no slug it sweeps every Game in the Games list. It checks the live page and Tile icon on GitHub Pages and the Game's source in its local repo at `Projects\<slug>\` (storage prefixed, link home, service worker scope), then prints a pass/fail grid, a ticket draft per failure, a "for you" list of git housekeeping (never a failure) and the manual tablet list. Read-only for Game repos. The judging is `tools/ready-check/check.js`, the Ready check module: a pure function from facts to verdict (tested, like the Menu module). `gather.js` (fetches facts and reads git, Node built-ins only), `gather-source.js` (text scan of the source) and `report.js` (prints) are thin and not unit-tested. `exceptions.json` lists accepted rule 2 exceptions. Local-only mode (`gatherFacts(slug, { folder, localOnly: true })`, used for the starter) fetches nothing and reads no git, so "live page" is not judged. Add a check as one entry in `CHECKS` in `check.js`
- `starter/` and `NEW-GAME.md`: the starter every new Game is copied from (Vite + TypeScript, its own `package.json`, kept inside `starter/`; the Arcade itself stays dependency-free) and the checklist for copying it. The slug placeholder is `game-slug`. Its placeholder icon is made by `node tools/make-starter-icon.js` and committed; the Ready check fails any Game still publishing it. `test/ready-check.test.js` checks the starter against the suite rules through the Ready check (local-only fact gathering). Don't commit `starter/node_modules` or `starter/dist`
- Tests: `node --test` (Node's built-in runner, files in `test/`)
- To view locally, serve the folder at the site root, e.g. `python -m http.server`, then open `http://localhost:8000/`. Opening `index.html` as a file won't load the modules.

Keep JavaScript to features Chromium has supported for several years (the tablets run Silk on a 2020 Fire HD 8).

## Agent skills

### Issue tracker

Issues and specs live as local markdown files under `.scratch/<feature>/`. See `docs/agents/issue-tracker.md`.

### Triage labels

Default five-role vocabulary (needs-triage, needs-info, ready-for-agent, ready-for-human, wontfix). See `docs/agents/triage-labels.md`.

### Domain docs

Single-context: `GLOSSARY.md` and `docs/adr/` at the repo root. See `docs/agents/domain.md`.
