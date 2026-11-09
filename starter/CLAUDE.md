# game-slug

A Game in the Dobrinska Arcade, published at `https://trevordobrinska.github.io/game-slug/`.

**Follow the suite rules:** https://github.com/trevordobrinska/trevordobrinska.github.io/blob/main/SUITE-RULES.md (locally `..\arcade\SUITE-RULES.md`). The Game shares one browser origin with the Arcade and every other Game. This starter already meets them; keep it that way:

- Relative URLs only (Vite `base: "./"`, `./` paths in `index.html`).
- Save data only through `src/storage.ts`, which starts every name with `game-slug`.
- Keep the house button in `index.html` linking to `/`.
- No manifest, no service worker, nothing that asks to be installed.
- Replace the placeholder `public/icon-512.png` with real 512×512 Tile art before asking for a Ready check.

## Code

Vite + TypeScript. `npm install`, then `npm run dev` to view locally, `npm run build` to check it builds. Every push to `main` deploys to GitHub Pages (`.github/workflows/deploy.yml`).
