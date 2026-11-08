# 02: Make the Arcade installable and fullscreen

**What to build:** Desktop Chromium offers to install the Dobrinska Arcade, and the installed app opens fullscreen on the menu. The pieces are a manifest, the Arcade's own simple icons, and a pass-through service worker that saves nothing. See `../spec.md` (Implementation Decisions: Title, Manifest, Service worker).

**Blocked by:** 01

**Status:** resolved

- [x] Manifest: name and short_name "Dobrinska Arcade", `display: fullscreen`, scope and start URL `/`, the Arcade's own colours
- [x] The Arcade has its own simple icons (192, 512 and a maskable 512), made without adding build tooling
- [x] The service worker is a copy of Secret Script Studio's pass-through worker (skip waiting, claim clients, every fetch goes to the network), registered at the site root, saving nothing; it isn't registered when running from a local dev server if that gets in the way
- [ ] Served locally from the folder root, Chromium's installability check passes and the installed window opens fullscreen
- [x] `node --test` still passes

## Comments

- 2026-11-08 (agent): Checked in headless Edge over the DevTools protocol, served by `python -m http.server` from the folder root: `Page.getInstallabilityErrors` returned none, `Page.getAppManifest` loaded `/manifest.webmanifest` with no errors (served as `application/manifest+json`), all three icons returned 200 `image/png`, and `/sw.js` registered at scope `/`, activated and controlled the page after a reload. `test/manifest.test.js` checks the manifest fields and that each icon is a PNG of the size it claims.
- **Not verified:** that the installed window opens fullscreen. Headless Edge has no `PWA.install`/`PWA.launch` protocol methods, so nobody has installed it yet. That's why the installability checkbox stays unticked. Check it by hand: in desktop Chrome or Edge, open `http://localhost:8000/`, install it, and confirm the window opens fullscreen on the menu. The Silk check is in the DESIGN.md tablet checklist.
- The service worker is registered on the local dev server too. It passes requests through and there's no hot reload to interfere with, so it doesn't get in the way.
- Added a manifest `id` of `/` so the app's identity stays the same if `start_url` ever changes.
