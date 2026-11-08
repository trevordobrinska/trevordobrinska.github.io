# 01: Scaffold the Arcade repo and show the menu from the Games list

**What to build:** Opening the Arcade page locally in desktop Chromium shows "Dobrinska Arcade" and a scrolling grid of big Tiles drawn from the hand-edited Games list. At launch that's Doodle Monsters and Secret Script Studio, both as greyed-out Coming-soon Tiles that do nothing when tapped. The Menu module (a pure function from Games list to ordered Tiles, with validation) is the one tested seam. This ticket also sets the folder up as a repo that later sessions can find their way around. See `../spec.md` (Implementation Decisions: Games list, Menu module, Page).

**Blocked by:** None (can start immediately)

**Status:** ready-for-agent

- [ ] `Projects\arcade\` is a git repo (local only, no remote yet) with a CLAUDE.md and `docs/agents/` copied from the Games' conventions: local-markdown tracker in `.scratch/`, five triage labels, single-context GLOSSARY.md + `docs/adr/`
- [ ] The Games list holds entries with `slug`, `name`, `state` (`ready` / `coming-soon` / `test`) and, for Test entries only, `path`; list order is the Tile order
- [ ] The Menu module orders Tiles as Ready, then Test, then Coming-soon, keeping list order within each group
- [ ] Ready links to `/<slug>/`, Test links to `/<slug>/<path>`, Coming-soon has no link; every icon is `/<slug>/icon-512.png`
- [ ] Validation rejects duplicate slugs among Ready/Coming-soon entries, an empty name, an unknown state, and a Test entry without `path`; a Test entry may share a slug with a Ready/Coming-soon entry
- [ ] `node --test` covers all of the above plus "the real launch Games list is valid", with no package dependencies and no build step
- [ ] The page renders big Tiles that fit a 1280×800 tablet in both orientations and scroll vertically; Coming-soon Tiles are greyed out and inert; Test Tiles show a TEST badge
- [ ] A Tile whose icon fails to load still shows the Game's name on a plain background (true for both launch Games locally)
- [ ] Plain HTML/CSS/ES modules only; no framework, bundler or runtime dependency
