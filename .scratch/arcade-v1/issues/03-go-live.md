# 03: Go live at trevordobrinska.github.io

**What to build:** The Arcade is live at `https://trevordobrinska.github.io/`, so it's ready before the first tablet session. This creates a **public** GitHub repo, so Dad gives the go-ahead (or does it himself). See `../spec.md` (Further Notes) and ADR 0001.

**Blocked by:** 02

**Status:** resolved

- [x] Dad approves creating the public repo `trevordobrinska/trevordobrinska.github.io`
- [x] The repo is created, the local repo pushed, and Pages serves the default branch at the site root
- [x] On the live site in desktop Chromium: the menu renders, the service worker registers, the manifest is valid and the Arcade is installable
- [x] Temporarily switching Secret Script Studio to Ready (locally, not pushed) shows its Tile opens the live `/secret-script-studio/` and its icon loads; the change is reverted
- [x] The existing Game addresses (`/doodle-monsters/`, `/secret-script-studio/`) still work after the Arcade goes live

## Comments

**2026-11-08:** Live. Dad approved and ran `gh repo create … --public --source . --remote origin --push` himself (the agent's attempt was blocked by Claude Code's permission check). Pages switched on automatically: `main`, path `/`, legacy build, HTTPS enforced. Checked in headless Edge over the DevTools protocol (a one-off script, not committed):
- Menu: title "Dobrinska Arcade", two greyed-out Coming-soon Tiles with no link.
- Service worker registered at `https://trevordobrinska.github.io/` and `activated`.
- `Page.getAppManifest`: no errors, `display: fullscreen`. `Page.getInstallabilityErrors`: none.
- Secret Script Studio Ready: `games.js` swapped in the browser only, never edited or pushed. Its Tile links to `/secret-script-studio/`, its 512×512 icon loads, and tapping it opens the live Game.
- `/doodle-monsters/` and `/secret-script-studio/` still return 200. `/doodle-monsters/icon-512.png` is 404, as the spec expects for now.

Still not done by hand: installing the app on desktop and watching it open fullscreen (ticket 02's open box). The tablet checks are ticket 04.
