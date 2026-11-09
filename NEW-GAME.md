# Starting a new Game

The checklist a session follows to start a Game (step 1, START, of the Game lifecycle in `DESIGN.md`). A Game copied from the starter meets the suite rules (`SUITE-RULES.md`) from its first commit.

Pick the **slug** first: lowercase words joined by dashes (e.g. `glyph-mines`). It is the repo name, the folder name and the path the Game is published at, `/<slug>/`.

1. **Copy the starter.** Copy everything in this repo's `starter/` folder, dot files included (`.gitignore`, `.github/`), into `Projects\<slug>\`. Leave out `node_modules\` and `dist\` if they're there.
2. **Replace the slug.** The starter's slug placeholder is `game-slug`. Replace every `game-slug` in the copy with the slug: `package.json`, `package-lock.json`, `index.html`, `src/storage.ts`, `src/main.ts`, `vite.config.ts`, `CLAUDE.md`, `.github/workflows/deploy.yml`. Afterwards a search for `game-slug` in the copy finds nothing.
3. **Check it builds.** In `Projects\<slug>\`: `npm install`, then `npm run build`. Then `git init`, and commit everything (`node_modules` and `dist` are ignored).
4. **Ask Dad to create the repo.** Auto mode blocks agents from creating public repos, so Dad runs, in `Projects\<slug>\`:
   `gh repo create trevordobrinska/<slug> --public --source . --push`
   then sets repo Settings > Pages > Source to "GitHub Actions".
5. **Push and confirm the deploy.** Push to `main` (if Dad's command didn't already). When the Actions run finishes, `https://trevordobrinska.github.io/<slug>/` shows the starter's home screen with the house button. The Game has no Tile yet, so the kids can't reach it.
6. **Go to grilling** (lifecycle step 2): `DESIGN.md`, `GLOSSARY.md`, spec and tickets, in the Game's repo.

Along the way, keep the suite rules met: save data only through `src/storage.ts`, keep the house button, add no manifest or service worker, and replace the placeholder `public/icon-512.png` with real 512×512 Tile art.

When the Game is ready for the kids (lifecycle step 5, READY), an Arcade session runs the Ready check: `node tools/ready-check.js <slug>`. It fails "icon not placeholder" until the starter's icon is replaced. Failures become tickets in the Game's own `.scratch/arcade/issues/`.
