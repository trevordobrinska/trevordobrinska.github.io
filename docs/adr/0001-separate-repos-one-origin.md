# 1. Each Game keeps its own repo; the Arcade is a separate repo at the site root

Date: 2026-11-08

## Status
Accepted

## Context
Dad builds several kids' Games in parallel, often with multiple Claude sessions at once. The kids should reach all of them from one place (the Dobrinska Arcade). We considered moving every Game into one Arcade repo (a monorepo) versus keeping them separate.

## Decision
Keep each Game in its own repo. The Arcade lives in its own repo, `trevordobrinska.github.io`, which GitHub Pages serves at the site root. Every other repo is automatically served beneath it (`/doodle-monsters/`, `/secret-script-studio/`), so the Games are already "inside" the Arcade with no merge step. A Game is added to the Arcade by adding one entry to the Arcade's Games list.

## Consequences
- Parallel sessions work in separate repos with their own CLAUDE.md and glossary, and don't collide.
- A broken build in one Game can't block publishing the others or the Arcade.
- The existing per-repo deploy workflows keep working unchanged.
- All Games share one browser origin, so shared storage and service-worker scope have to be handled by convention: see SUITE-RULES.md.
- The small pieces of shared code (the pass-through service worker, the house button) are duplicated. Revisit with a shared package if Games start sharing real logic (e.g. Glyph Mines reading Secret Script Studio's My Scripts).
