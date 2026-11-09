# 02: Tracer: Ready check for one Game (live page and Tile icon)

**What to build:** Dad runs one command with a Game's slug and gets a report: a pass/fail grid for that Game's live page and Tile icon, plus a ready-to-file ticket draft for each failure. This builds the whole path once (the pure Ready check module, fact gathering from the live site, report printing) so later tickets only add checks. See `../spec.md` (Implementation Decisions → Ready check module, Fact gathering, Report printing, Command line).

**Blocked by:** None (can start immediately)

**Status:** ready-for-agent

- [ ] The Ready check module is a pure function from facts about Games to a verdict, with no I/O, in the same style as the Menu module
- [ ] Checks in this ticket: live page `/<slug>/` loads (200); `icon-512.png` loads (200); the icon is a PNG of exactly 512×512 (signature + IHDR, read the way `test/manifest.test.js` does)
- [ ] Each failed check produces a ticket draft (title, what to build, acceptance criteria) that cites the suite rule it breaks
- [ ] Fact gathering uses Node built-ins only (the Arcade has no dependencies)
- [ ] The report prints the grid first, then the ticket drafts
- [ ] `node --test` covers the module with hand-built facts: a Game meeting every check passes; a 404 icon fails "icon loads"; a wrong-sized icon fails "icon 512×512"; each failure drafts exactly one ticket
- [ ] Real run: Doodle Monsters fails "icon loads"; Secret Script Studio passes all three
- [ ] `CLAUDE.md`'s Code list mentions the check and how to run it
