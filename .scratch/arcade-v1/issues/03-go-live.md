# 03: Go live at trevordobrinska.github.io

**What to build:** The Arcade is live at `https://trevordobrinska.github.io/`, so it's ready before the first tablet session. This creates a **public** GitHub repo, so Dad gives the go-ahead (or does it himself). See `../spec.md` (Further Notes) and ADR 0001.

**Blocked by:** 02

**Status:** ready-for-human

- [ ] Dad approves creating the public repo `trevordobrinska/trevordobrinska.github.io`
- [ ] The repo is created, the local repo pushed, and Pages serves the default branch at the site root
- [ ] On the live site in desktop Chromium: the menu renders, the service worker registers, the manifest is valid and the Arcade is installable
- [ ] Temporarily switching Secret Script Studio to Ready (locally, not pushed) shows its Tile opens the live `/secret-script-studio/` and its icon loads; the change is reverted
- [ ] The existing Game addresses (`/doodle-monsters/`, `/secret-script-studio/`) still work after the Arcade goes live
