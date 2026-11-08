# Suite rules: what every Game must do to live in the Dobrinska Arcade

Every Game is published under `https://trevordobrinska.github.io/<game-slug>/`. They all share **one browser origin**, so they share storage and service-worker space. Follow these rules.

1. **Own path, relative URLs.** The Game's repo name is its slug. Build with relative paths (Vite `base: "./"`) so it works under `/<game-slug>/`.
2. **Prefix all saved data with the slug.** IndexedDB database names, localStorage keys, and cache names all start with `<game-slug>` (e.g. database `doodle-monsters`, key `doodle-monsters:hard-mode`). Never read or clear another Game's data unless a design decision says so.
3. **Stay inside your own path.** If the Game registers a service worker, its scope must be its own path, never `/`. Never claim the site root.
4. **Publish a Tile icon** at `/<game-slug>/icon-512.png`: square, 512×512 PNG. The Arcade loads it from there.
5. **A way home.** The Game's home screen has a small house button linking to the Arcade (`/`).
6. **Don't ask to be installed.** Only the Arcade goes on the home screen. A Game may keep its own manifest, but nothing should prompt the kids to install it.
7. **Getting a Tile.** A Game appears in the Arcade only when Dad calls it Ready (or as a Coming-soon or temporary Test Tile). That's a change to the Arcade repo, not the Game's.
