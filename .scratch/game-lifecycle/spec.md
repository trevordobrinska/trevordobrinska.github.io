# Spec: Game lifecycle (how a new Game joins the Arcade, and the Ready check)

Status: ready-for-agent (tickets 01–06 in `issues/`)

Sources: grilling session 2026-11-08 (after the first three-repo audit), `DESIGN.md`, `GLOSSARY.md` (Game, Tile, Coming-soon Tile, Ready, Test Tile, Games list, Menu module), `SUITE-RULES.md`, and ADR 0001 (separate repos, one origin). Where this spec and DESIGN.md disagree, DESIGN.md wins: flag it, don't silently pick.

## Problem Statement

Dad has two Games live in the Arcade (Doodle Monsters and Secret Script Studio) and more coming from the idea board (Glyph Mines next, then Fold Lab). The suite rules were written after both Games were mostly built, and reached them as **handoff notes** for each Game's own session to turn into tickets. The first audit across all three repos (2026-11-08) found what that approach lets slip:

- Neither Game has a house button back to the Arcade (suite rule 5).
- Doodle Monsters has no Tile icon: `/doodle-monsters/icon-512.png` is a 404, so its Tile shows a name only (rule 4).
- Doodle Monsters' handoff note was never committed or turned into tickets, and nothing flagged it.
- Both Games were made Ready without anyone checking them against the suite rules first.

There is no defined path for starting a new Game, no defined check before a Game is called Ready, and no way to tell whether the Arcade and its Games still agree. Each audit is improvised, and each new Game would repeat the same retrofit.

## Solution

A Game is an Arcade Game **from its first commit**, and joining the Arcade is one line in the Games list after a check.

```
idea-board pitch
   │
1. START     copy the Arcade's starter into Projects\<slug>\ (NEW-GAME.md);
   │         Dad runs `gh repo create`. Suite rules already met.
2. GRILL     DESIGN.md / GLOSSARY / spec + tickets, as now
3. BUILD     every push deploys to /<slug>/ (no Tile, so the kids can't reach it)
4. TABLET    temporary Test Tile for play-test sessions
5. READY     Arcade session runs the Ready check → pass → Dad's call → "ready"
   │         in the Games list.  fail → tickets filed in the Game's repo
6. LIVE      later changes just push; the Tile already points there
```

- **The starter** lives in the Arcade repo next to `SUITE-RULES.md`, with a short `NEW-GAME.md` checklist that a session follows. It becomes a skill later, after it's been used twice.
- **The Ready check** is a script in the Arcade repo plus a short manual tablet list. It prints a pass/fail grid, ticket drafts for each failure, and a "for you" list of housekeeping for Dad.
- **The Arcade never fixes a Game.** Failures become tickets in the Game's own `.scratch/arcade/issues/`. Housekeeping (merging branches, removing merged worktrees, committing stray files) is reported to Dad, never done.
- **Handoff notes are retired.** When the suite rules change, the Arcade session files a ticket straight into each Game's repo.
- **Sweeps:** the check runs across every Game when Dad asks, and whenever `SUITE-RULES.md` changes.
- **Coming-soon Tiles** are Dad's call per Game; the default is no Tile until Ready.
- **The two live Games keep their Tiles.** The first run of the check files their catch-up tickets.

## User Stories

1. As Dad, I want every new Game to start out already following the suite rules, so that I never retrofit house buttons, icons or storage prefixes at the end.
2. As Dad, I want one written checklist for starting a Game, so that any session I open starts a Game the same way.
3. As Dad, I want the starter to live next to the suite rules in the Arcade repo, so that a change to the rules and a change to the starter happen together.
4. As Dad, I want the starter to use the same stack as my current Games (Vite + TypeScript, relative base), so that what I've learned carries over.
5. As Dad, I want the starter to deploy to `/<slug>/` on every push, so that I can test on the tablet from day one.
6. As Dad, I want a new Game to have no Tile until I call it Ready, so that the kids don't see half-built things by default.
7. As Dad, I want to optionally give a Game a Coming-soon Tile, so that I can build excitement when the wait will be short.
8. As Dad, I want to know which step needs me (creating the public repo), so that a session doesn't stall waiting on something it can't do.
9. As one of the kids, I want every Game to have a house button back to the Arcade, so that I can get to another Game without knowing about the tablet's Back.
10. As one of the kids, I want every Tile to have a picture, so that I can find my Game without reading.
11. As one of the kids, I want my saved stuff in one Game never to be wiped by another Game, so that my monsters and scripts are safe.
12. As Dad, I want a starter that has no manifest and no service worker, so that no Game can ever prompt the kids to install it separately.
13. As Dad, I want the starter's storage helper to put the slug in front of every name, so that rule 2 is met without anyone remembering it.
14. As Dad, I want the starter's `CLAUDE.md` to point at `SUITE-RULES.md`, so that every session working on the Game knows the rules.
15. As Dad, I want to run one command that checks a Game against the suite rules, so that "is it ready?" doesn't depend on a session's memory.
16. As Dad, I want the check to confirm the live page and the Tile icon actually load from GitHub Pages, so that I find 404s before the kids do.
17. As Dad, I want the check to confirm the icon is a real 512×512 PNG, so that the Tile looks right.
18. As Dad, I want the check to fail while the starter's placeholder icon is still live, so that every Game gets real Tile art before it's Ready.
19. As Dad, I want the check to find storage names that don't start with the slug, so that one Game can't clobber another's data.
20. As Dad, I want the check to find a link back to `/`, so that rule 5 is checked mechanically.
21. As Dad, I want the check to fail if a Game's service worker could claim the site root, so that the Arcade's own worker is never displaced.
22. As Dad, I want the check to report unmerged branches, unpushed commits, untracked files and leftover worktrees, so that nothing gets stranded.
23. As Dad, I want a short manual tablet list for what a script can't see (house button and Back both return to the Arcade), so that the check still covers the real device.
24. As Dad, I want the report to start with a grid of Games × checks, so that I see the state at a glance.
25. As Dad, I want the report to include a ready-to-file ticket draft for each failure, so that the session files tickets instead of improvising them.
26. As Dad, I want housekeeping listed separately as "for you", so that I know what's mine to do and that nothing was done behind my back.
27. As Dad, I want the check never to write into a Game's repo, so that the Arcade/Game boundary from ADR 0001 holds even when something fails.
28. As Dad, I want an Arcade session to file the drafted tickets into the Game's `.scratch/arcade/issues/`, so that the Game's own session picks them up in its normal flow.
29. As Dad, I want a failed check to keep a Game off Ready until its tickets are done, so that "Ready" means something.
30. As Dad, I want a passing check followed by my own call to be what makes a Game Ready, so that I stay the one who decides.
31. As Dad, I want to run the check across every Game at once, so that a sweep is one command.
32. As Dad, I want a sweep whenever `SUITE-RULES.md` changes, so that existing Games get tickets for the new rule.
33. As Dad, I want rule changes to arrive in each Game as tickets, not handoff notes, so that there's one mechanism and nothing sits untracked.
34. As Dad, I want Doodle Monsters and Secret Script Studio to keep their Tiles while they catch up, so that the kids don't lose Games they already use.
35. As Dad, I want the first run of the check to file catch-up tickets for both live Games, so that their gaps get fixed through the normal flow.
36. As Dad, I want the lifecycle written into the Arcade's `DESIGN.md`, so that the process is part of the source of truth.
37. As Dad, I want an ADR recording "rules from the first commit" and "tickets replace handoffs", so that a later session doesn't bring handoff notes back.
38. As Dad, I want suite rule 7 to say Ready = passing check + Dad's call, so that the rules match the process.
39. As a future agent session, I want the check's judging logic to be a pure, tested module, so that I can change it with confidence.
40. As a future agent session, I want the starter itself checked by the same tests, so that the starter can't drift out of line with the rules.

## Implementation Decisions

- **Ready check module (new, the one new seam).** A pure function, with no I/O, from *facts about one or more Games* to a *verdict*, mirroring the Menu module. Tested with `node --test`.
  - **Facts per Game:** slug; HTTP status of the live page `/<slug>/` and of `/<slug>/icon-512.png`; the icon's PNG signature and IHDR width/height; whether the icon's bytes match the starter placeholder (by hash); storage names found in the source (IndexedDB database names, localStorage keys, cache names); whether a link to the site root `/` is found; service worker registrations and their scopes; git state (unmerged branches with commit counts, unpushed commits, untracked files, extra worktrees and whether they're merged).
  - **Verdict:** for each Game, a pass/fail per check (live page, icon loads, icon 512×512 PNG, icon not placeholder, storage prefixed, link home, service worker stays in its own path, git clean); ticket drafts for each failure (title, what to build, acceptance criteria, citing the suite rule number); "for you" items for housekeeping; and the manual tablet list to run.
  - **Git findings never fail a Game outright.** They become "for you" items, because they're Dad's to fix (housekeeping). The Ready decision looks at the suite-rule checks.
  - **Rule exceptions are explicit.** Throwaway test pages (e.g. Doodle Monsters' Night 1) may use unprefixed storage names when an accepted exception lists them; otherwise any unprefixed name fails rule 2. Keep the exception list in the check's inputs, not hard-coded logic.
- **Fact gathering (thin, not unit-tested).** Reads the Game's local repo at `Projects\<slug>\` (source files, git), and fetches the live URLs. Node built-ins only (fetch, fs, child_process for git), per the Arcade's no-dependencies rule. Has a "local only" mode with no network and no git, used for the starter test.
- **Report printing (thin, not unit-tested).** Turns a verdict into the report: grid first, then ticket drafts, then "for you", then the manual tablet list. Plain text/Markdown to the terminal.
- **Command line.** One command checks one Game by slug; with no slug it sweeps every Game in the Games list (including Coming-soon and Test entries, since they're Games too).
- **The script is read-only for Game repos.** The Arcade session that runs it files the drafts as tickets in `<game>/.scratch/arcade/issues/NN-<slug>.md`, numbered after any existing tickets, with `Status: ready-for-agent` (or `ready-for-human` for tablet checks). That is the only write into a Game's repo, and it's a deliberate session action, not the script.
- **Starter (new).** A minimal Vite + TypeScript Game in the Arcade repo, outside the published menu's code paths: relative base, a home screen with a house button linking to `/`, a placeholder `icon-512.png` (512×512, recognisably a placeholder), a small storage helper that prefixes every name with the slug, a GitHub Pages deploy workflow (Actions, as Secret Script Studio does), and a `CLAUDE.md` pointing at `SUITE-RULES.md`. No manifest, no service worker, no test page. A slug placeholder is replaced when copying.
- **NEW-GAME.md (new).** The checklist a session follows: copy the starter into `Projects\<slug>\`, replace the slug, ask Dad to run `gh repo create` (auto mode blocks agents from creating public repos), push, confirm the deploy, then continue to grilling. Points at the Ready check for step 5.
- **Starter publishing.** The starter is in the Arcade repo, which GitHub Pages publishes at the site root. Its files must not clash with the Arcade's own (e.g. no `index.html` at a path the menu uses). Being publicly reachable at an unlinked path is acceptable; the kids can't reach it.
- **Docs.** `DESIGN.md` gets a "Game lifecycle" section with the diagram above. ADR 0002 records "Games follow the suite rules from their first commit" and "tickets replace handoff notes". `SUITE-RULES.md` rule 7 becomes "Ready = a passing Ready check + Dad's call". `GLOSSARY.md` gains **Ready check** and **Starter**. `CLAUDE.md`'s Code list gains the check and the starter.
- **Ticket order.** (1) the Ready check module, fact gathering and report; (2) run it on Doodle Monsters and Secret Script Studio and file their catch-up tickets; (3) the starter, NEW-GAME.md and the doc updates. Ticket 3 can wait until Glyph Mines starts.

## Testing Decisions

- **Good tests check external behaviour:** given facts about a Game, what verdict comes out. They don't check how facts are gathered or how the report is formatted. Test names use glossary terms (Game, Tile, Ready).
- **Ready check module:** tested with hand-built facts. A Game meeting every rule passes every check; each rule broken alone fails exactly its check and drafts one ticket citing that rule; a placeholder icon fails "icon not placeholder" even though it's 512×512; a 404 icon fails "icon loads"; a service worker registered at `/` fails; unprefixed storage fails unless it's on the exception list; git findings produce "for you" items and never fail a check; a sweep returns one row per Game.
- **Starter:** a test gathers facts from the starter folder in local-only mode and runs the same module: every source check passes (prefixed storage, link home, no root service worker) and the placeholder icon is flagged. That keeps the starter honest through the one seam, with no separate starter tests.
- **Not unit-tested:** fact gathering and report printing, which are thin wrappers. Their proof is ticket 2: a real run against both live Games that finds the gaps the 2026-11-08 audit found by hand (no house button in either Game, Doodle Monsters' icon 404).
- **Prior art:** `test/menu.test.js` (pure module, hand-built inputs) and `test/manifest.test.js` (PNG signature and IHDR size check, reusable for the icon check).

## Out of Scope

- Fixing the two live Games. The check only files their tickets; each Game's own session does the work.
- A `/new-game` or `/arcade-audit` skill. Revisit after the starter has been used twice.
- Automatically running the check (CI, hooks, schedules). Sweeps run when Dad asks or when the suite rules change.
- Merging branches, removing worktrees or committing files in any repo. That's Dad's, from the "for you" list.
- A shared code package for Games (ADR 0001 leaves that for when Games share real logic).
- Checks that need the tablet, beyond listing them for Dad.
- Any change to the Menu module or how Tiles are drawn.

## Further Notes

- Open from the audit, for Dad: merge Doodle Monsters' `worktree-night-1-results` branch (one commit, the Night 1 "My Stuff, fullscreen" correction), then remove its worktree; remove Secret Script Studio's merged `tablet-test-results` worktree; Doodle Monsters' `.scratch/arcade/handoff.md` is untracked, and the catch-up tickets replace it.
- Secret Script Studio already has a house-button ticket (`.scratch/arcade/issues/02-house-button.md`, ready-for-agent). The catch-up run should see it and not file a duplicate.
- Secret Script Studio keeps its manifest and pass-through service worker scoped to its own path; that passes rule 3 and 6 as written. New Games from the starter have neither.
