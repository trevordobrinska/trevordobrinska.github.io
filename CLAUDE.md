# Dobrinska Arcade

The design decisions are in `DESIGN.md` and the vocabulary is in `GLOSSARY.md`. Those two files are the source of truth. `SUITE-RULES.md` lists what every Game must do to live in the Arcade.

## Code

Plain HTML, CSS and ES modules, published as is by GitHub Pages. No framework, bundler, build step or package dependencies.

- `games.js`: the hand-edited Games list, the only file to edit to change the menu
- `menu.js`: the Menu module, a pure function from Games list to ordered Tiles, with validation (the one tested seam)
- `main.js`, `index.html`, `style.css`: draw the Tiles (not unit-tested)
- `manifest.webmanifest`, `sw.js`, `icons/`: make the Arcade installable and fullscreen. `sw.js` is a copy of Secret Script Studio's pass-through worker and must keep saving nothing. The icons are made by `node tools/make-icons.js` (Node built-ins only) and committed
- `tools/ready-check.js`: the Ready check. `node tools/ready-check.js <slug>` checks a Game's live page and Tile icon on GitHub Pages and prints a pass/fail grid, then a ticket draft per failure. Read-only for Game repos. The judging is `tools/ready-check/check.js`, a pure function from facts to verdict (tested, like the Menu module); `gather.js` (fetches facts, Node built-ins only) and `report.js` (prints) are thin and not unit-tested. Add a check as one entry in `CHECKS` in `check.js`
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
