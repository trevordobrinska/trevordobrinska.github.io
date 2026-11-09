# 01: Write the Game lifecycle into the Arcade's docs

**What to build:** The decisions from the 2026-11-08 grilling become part of the Arcade's source of truth, so any session reading the docs knows how a new Game joins the Arcade and what Ready means. See `../spec.md` (Solution, Implementation Decisions → Docs).

**Blocked by:** None (can start immediately)

**Status:** ready-for-agent

- [ ] `DESIGN.md` has a "Game lifecycle" section with the six-step diagram from the spec (Start → Grill → Build → Tablet → Ready → Live), including: the Arcade never fixes a Game, failures become tickets in the Game's repo, housekeeping goes on Dad's "for you" list, sweeps run when Dad asks and whenever `SUITE-RULES.md` changes, and Coming-soon Tiles are Dad's call per Game (default: no Tile until Ready)
- [ ] ADR 0002 records two decisions: Games follow the suite rules from their first commit (via the starter), and tickets filed straight into each Game replace handoff notes. It notes what it supersedes (the handoff approach used for Doodle Monsters and Secret Script Studio)
- [ ] `SUITE-RULES.md` rule 7 says a Game becomes Ready after a passing Ready check plus Dad's call
- [ ] `GLOSSARY.md` defines **Ready check** and **Starter**, and the **Ready** entry mentions the check
- [ ] Nothing in the docs still tells a session to write handoff notes
