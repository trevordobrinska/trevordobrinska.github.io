# 05: Catch-up run: file tickets in Doodle Monsters and Secret Script Studio

**What to build:** Run the Ready check sweep against the two live Games and file its ticket drafts into each Game's own tracker, so their gaps get fixed through each Game's normal flow. Both Games keep their Tiles meanwhile. This is the only ticket that writes into a Game's repo, and it writes tickets only. See `../spec.md` (Solution, Command line, Further Notes).

**Blocked by:** 03, 04

**Status:** ready-for-agent

- [ ] Sweep run; the report (grid, drafts, "for you", tablet list) is pasted into this ticket's Comments
- [ ] Doodle Monsters gets tickets in `.scratch/arcade/issues/` (create it; numbered from 01): Tile icon (rule 4), house button (rule 5), and pointing `CLAUDE.md` at `SUITE-RULES.md` plus changing `DESIGN.md`'s "installed on the home screen" line to "reached from the Dobrinska Arcade" (the items its untracked handoff note asked for)
- [ ] Secret Script Studio: its existing house-button ticket (02 in `.scratch/arcade/issues/`) covers the link-home failure, so no duplicate is filed; any other failure gets a new ticket numbered after the existing ones
- [ ] Each filed ticket follows that repo's ticket format and `Status:` vocabulary, and is committed in that repo on a branch (not master) and pushed, for Dad to merge
- [ ] No Game code or docs are changed, only ticket files
- [ ] The "for you" list is handed to Dad in the final report, not acted on
