# Spec: Dobrinska Arcade V1 (the first live home page)

Status: resolved (2026-11-08: tickets 01–04 done, 05 closed as a false alarm; both Games Ready)

Sources: `DESIGN.md` (grilled 2026-11-07 and 2026-11-08), `GLOSSARY.md` (Dobrinska Arcade, Game, Tile, Coming-soon Tile, Ready), `SUITE-RULES.md`, and ADR 0001 (separate repos, one origin). Where this spec and DESIGN.md disagree, DESIGN.md wins: flag it, don't silently pick.

## Problem Statement

Dad is building several Games for his kids at once (Doodle Monsters, Secret Script Studio, and more on the idea board). Each one lives at its own web address. On their tablets, the kids would have to find each Game separately, Dad would have to approve each one in the Amazon Kids Parent Dashboard, and every new Game would mean another icon to hunt for. Dad wants the kids to open **one place** on their own tablet and pick whatever they want to play.

The tablets haven't had a first test session yet, so whatever gets installed first sets the habit. If Games get installed one by one now, that has to be undone later.

## Solution

The **Dobrinska Arcade** is one page at the root of `trevordobrinska.github.io`. It's a screen of big **Tiles**, one per Game, each showing the Game's icon and name. Each tablet installs only the Arcade to its home screen, and it opens fullscreen. Tapping a playable Tile opens that Game inside the same fullscreen window. Each Game's home screen has a house button back to the Arcade, and the tablet's Back works too.

Games that aren't Ready yet show as greyed-out **Coming-soon Tiles** that can't be opened. During a tablet test session, Dad adds temporary **Test Tiles** that open a Game's throwaway test page, and removes them afterwards.

V1 goes live **before** the next tablet session. At launch, Doodle Monsters and Secret Script Studio are Coming-soon Tiles, and Test Tiles are added when Dad needs them.

## User Stories

1. As a kid, I want one icon on my tablet's home screen, so that I always know where my Dad's Games are.
2. As a kid, I want to see every Game as a big picture with its name, so that I can pick one without reading much.
3. As a kid, I want to tap a Tile and land straight in the Game, so that starting to play takes one tap.
4. As a kid, I want the Game to stay fullscreen after I tap its Tile, so that it feels like an app, not a website.
5. As a kid, I want the Tiles to stay in the same place every time, so that I can find my favourite Game by where it is.
6. As a kid, I want new Games to show up at the end, so that the Games I already know don't move.
7. As a kid, I want to see greyed-out Coming-soon Tiles, so that I get excited about what Dad is building next.
8. As a kid, I want a Coming-soon Tile to do nothing when I tap it, so that I don't end up in a broken, half-built Game.
9. As a kid, I want my Tile choices to be the same as my sibling's, so that we can talk about the same Games.
10. As a kid, I want to get back to the Arcade from a Game with the house button or Back, so that I can switch Games without help.
11. As a kid on a big list of Games, I want to scroll down to see more Tiles, so that the Tiles stay big enough to tap.
12. As a kid, I want the Arcade to open quickly every time, so that I'm not staring at a blank screen.
13. As a kid, I want the Arcade to say "Dobrinska Arcade", so that it feels like our family's own thing.
14. As Dad, I want to approve one web address in the Parent Dashboard, so that every Game (now and future) is allowed without more setup.
15. As Dad, I want to add a Game by adding one entry to a list, so that releasing a Game takes a minute.
16. As Dad, I want to choose when a Game becomes Ready, so that the kids only see Games I'm happy with.
17. As Dad, I want to mark a Game as Coming-soon before it's Ready, so that I can build excitement without exposing unfinished work.
18. As Dad, I want to set the Tile order by hand, so that I control the layout.
19. As Dad, I want to add a temporary Test Tile for a test session, so that I can open a throwaway test page in a Kids profile, where I can't type an address.
20. As Dad, I want Test Tiles to be clearly marked as tests and easy to remove, so that they don't linger after the session.
21. As Dad, I want each Tile's icon to come from the Game's own address, so that a Game owns its look and I never copy icons between repos.
22. As Dad, I want a missing or broken icon to still show a usable Tile with the Game's name, so that one Game's mistake doesn't spoil the menu.
23. As Dad, I want a mistake in the Games list (duplicate slug, missing name) caught by a test, so that I don't publish a broken menu.
24. As Dad, I want the Arcade to have no build step, so that editing the Games list and pushing is the whole release process.
25. As Dad, I want the Arcade to be installable in Silk, so that it can live on the home screen.
26. As Dad, I want the Arcade's service worker to save nothing, so that the kids always get the latest version and I never have to clear caches.
27. As Dad, I want the Arcade's service worker to just pass every request through, so that Games under it aren't affected.
28. As Dad, I want each Game to stay in its own repo, so that building them in parallel doesn't cause collisions.
29. As Dad, I want the Arcade live before the first tablet session, so that the first install on each tablet is the Arcade.
30. As Dad, I want a checklist of the Arcade's tablet checks, so that I can confirm the install, fullscreen, Back and approval behaviour on the real devices.
31. As Dad building the next Game, I want a written list of suite rules, so that each new Game fits into the Arcade without surprises.

## Implementation Decisions

- **New repo `trevordobrinska.github.io`**, made from the existing `Projects\arcade\` folder (which already holds DESIGN.md, GLOSSARY.md, SUITE-RULES.md and ADR 0001). GitHub Pages publishes it from the default branch at the site root. No build step and no GitHub Actions workflow are needed.
- **Plain HTML, CSS and a small amount of browser JavaScript as ES modules.** No framework, bundler or runtime dependencies.
- **Games list module:** one hand-edited data file is the only thing Dad edits to change the menu. Each entry has:
  - `slug`: the Game's repo name and path, e.g. `doodle-monsters`
  - `name`: shown on the Tile
  - `state`: one of `ready`, `coming-soon`, `test`
  - `path`: optional, for Test Tiles that point below the Game's root, e.g. `night1/` or `tablet-test.html`

  The list order is the hand-set Tile order.
- **Menu module (the one tested seam):** a pure function that takes the Games list and returns the Tiles to show, in order. It also validates the list. Its rules:
  - Ready Tiles first, in list order. Then Test Tiles, in list order. Then Coming-soon Tiles, in list order.
  - A Ready Tile links to `/<slug>/`. A Test Tile links to `/<slug>/<path>`. A Coming-soon Tile has no link.
  - Every Tile's icon is `/<slug>/icon-512.png`.
  - Validation fails on duplicate slugs among Ready and Coming-soon entries, an empty name, an unknown state, or a Test entry without a `path`. A Test entry may share its slug with a Ready or Coming-soon entry (e.g. Doodle Monsters is Coming-soon *and* has a Night 1 Test Tile).
- **Page:** renders the Menu module's Tiles into a vertically scrolling grid of big Tiles sized for a 1280×800 Fire HD 8 in either orientation. Coming-soon Tiles are greyed out and do nothing when tapped. Test Tiles are visibly marked (e.g. a "TEST" badge). If an icon fails to load, the Tile still shows the Game's name on a plain background.
- **Title:** the page title, the manifest's `name` and its `short_name` are all "Dobrinska Arcade". If the home-screen label gets cut off, a shorter `short_name` is allowed.
- **Manifest:** `display: fullscreen`, scope and start URL at the site root (`/`), plus the Arcade's own icons. Its look is the Arcade's own and needs no matching to any Game.
- **Service worker:** a copy of Secret Script Studio's pass-through worker: install skips waiting, activate claims clients, and fetch goes to the network. It is registered at the site root, saves nothing and has no offline support. Games that register their own worker within their path keep control of their own pages.
- **Storage:** V1 saves nothing. If the Arcade ever saves data, it follows the suite rule and prefixes it `arcade`.
- **Launch Games list:** Doodle Monsters and Secret Script Studio, both Coming-soon. Doodle Monsters has no `icon-512.png` yet, so its Tile falls back to name-only, which is expected for now.
- **Suite rules stay in the Arcade repo** (SUITE-RULES.md). Changes the Games need (house button, icon, install wording) are tracked in each Game's `.scratch/arcade/handoff.md`, not here.

## Testing Decisions

- **Good tests check external behaviour only:** given a Games list, check which Tiles come out, in what order, with which links and icons, and which lists are rejected. Don't test the HTML structure, CSS or how rendering is done.
- **One tested module: the Menu module**, tested with Node's built-in test runner (`node --test`). No packages, no `package.json` dependencies, no build. Cases:
  - Ready, Test and Coming-soon entries are ordered correctly, and list order is kept within each group.
  - Links: Ready gets `/<slug>/`, Test gets `/<slug>/<path>`, and Coming-soon gets none.
  - Icon addresses.
  - Each validation failure listed above.
  - A Test entry sharing a slug with a Coming-soon entry is allowed.
  - The real launch Games list passes validation.
- **Prior art:** both Games keep their rules in pure modules tested by Vitest (e.g. Secret Script Studio's share-link packing and Doodle Monsters' Zoo save/load). The Arcade follows the same split, with the rule logic pure and tested and the drawing kept separate, but uses `node --test` so it needs no build tooling.
- **Everything else is a human tablet check**, done in the Arcade's DESIGN.md checklist at whichever Game's tablet session comes first, and before that Game's own checks. That covers:
  - Parent Dashboard approval covers the sub-addresses
  - Silk in a Kids profile installs the Arcade
  - a Tile opens inside the fullscreen window
  - the house button and Back return to the Arcade
  - then repeat on the son's tablet
- **Before tablets:** a quick desktop check in Chromium that the page renders, the manifest is valid, the service worker registers, and Tiles link to the live Game paths.

## Out of Scope

- Per-kid menus, profiles or settings (one shared menu by design).
- Offline play or caching of any kind.
- Moving Games into one repo, or shared code packages between Games (see ADR 0001).
- Changes inside the Games (house button, Doodle Monsters' icon, DESIGN.md install wording). These are tracked in each Game's `.scratch/arcade/handoff.md`.
- Making any Game Ready. That's Dad's call, made later by editing the Games list.
- Search, categories, favourites, play history, sounds or animations beyond simple tap feedback.
- A custom domain, analytics or a 404 page.
- Glyph Mines reading Secret Script Studio's data (decided when Glyph Mines is grilled).

## Further Notes

- **Going live involves a human step:** Dad (or an agent with his approval) creates the public `trevordobrinska.github.io` repo on GitHub, pushes it, and turns on Pages if it isn't on automatically. Publishing to a public GitHub repo needs Dad's go-ahead.
- `Projects\arcade\` has no CLAUDE.md or `docs/agents/` yet. The first implementation ticket should add them, copying the Games' local-markdown tracker and triage-label conventions, so later sessions find this spec.
- The Doodle Monsters tablet is a 2020 Fire HD 8 (Silk, Chromium-based); the son's tablet model is still unknown. Keep the JavaScript to features Chromium has supported for several years.
