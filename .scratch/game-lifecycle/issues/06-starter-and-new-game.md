# 06: Starter, NEW-GAME.md, and the placeholder-icon check

**What to build:** A new Game starts already meeting the suite rules: a session follows `NEW-GAME.md` to copy the Arcade's starter into `Projects\<slug>\`, and the Ready check refuses to pass a Game whose Tile icon is still the starter's placeholder. See `../spec.md` (Starter, NEW-GAME.md, Starter publishing, Testing Decisions → Starter). Can wait until Glyph Mines starts.

**Blocked by:** 03

**Status:** resolved

- [x] Starter: Vite + TypeScript with relative base; a home screen with a house button linking to `/`; a placeholder `icon-512.png` (512×512, obviously a placeholder); a small storage helper that prefixes every name with the slug; a GitHub Pages deploy workflow via Actions (as Secret Script Studio does); a `CLAUDE.md` pointing at `SUITE-RULES.md`; no manifest, no service worker, no test page; a slug placeholder to replace on copy
- [x] The starter's files don't clash with anything the Arcade publishes at the site root; being reachable at an unlinked path is fine
- [x] `NEW-GAME.md`: copy the starter, replace the slug, ask Dad to run `gh repo create` (agents can't create public repos in auto mode), push, confirm the deploy at `/<slug>/`, then go to grilling; step 5 points at the Ready check
- [x] New check "icon not placeholder": fails when the Game's icon bytes match the starter placeholder (by hash), even though it's a valid 512×512 PNG
- [x] Fact gathering has a local-only mode (no network, no git)
- [x] `node --test`: gathering facts from the starter in local-only mode and running the Ready check passes every source check and fails "icon not placeholder"
- [x] The starter builds locally with no errors
- [x] `CLAUDE.md`'s Code list mentions the starter and `NEW-GAME.md`
