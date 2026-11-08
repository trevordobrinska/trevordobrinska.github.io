# 02: Make the Arcade installable and fullscreen

**What to build:** Desktop Chromium offers to install the Dobrinska Arcade, and the installed app opens fullscreen on the menu. The pieces are a manifest, the Arcade's own simple icons, and a pass-through service worker that saves nothing. See `../spec.md` (Implementation Decisions: Title, Manifest, Service worker).

**Blocked by:** 01

**Status:** ready-for-agent

- [ ] Manifest: name and short_name "Dobrinska Arcade", `display: fullscreen`, scope and start URL `/`, the Arcade's own colours
- [ ] The Arcade has its own simple icons (192, 512 and a maskable 512), made without adding build tooling
- [ ] The service worker is a copy of Secret Script Studio's pass-through worker (skip waiting, claim clients, every fetch goes to the network), registered at the site root, saving nothing; it isn't registered when running from a local dev server if that gets in the way
- [ ] Served locally from the folder root, Chromium's installability check passes and the installed window opens fullscreen
- [ ] `node --test` still passes
