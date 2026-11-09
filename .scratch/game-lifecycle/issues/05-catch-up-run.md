# 05: Catch-up run: file tickets in Doodle Monsters and Secret Script Studio

**What to build:** Run the Ready check sweep against the two live Games and file its ticket drafts into each Game's own tracker, so their gaps get fixed through each Game's normal flow. Both Games keep their Tiles meanwhile. This is the only ticket that writes into a Game's repo, and it writes tickets only. See `../spec.md` (Solution, Command line, Further Notes).

**Blocked by:** 03, 04

**Status:** resolved

- [x] Sweep run; the report (grid, drafts, "for you", tablet list) is pasted into this ticket's Comments
- [x] Doodle Monsters gets tickets in `.scratch/arcade/issues/` (create it; numbered from 01): Tile icon (rule 4), house button (rule 5), and pointing `CLAUDE.md` at `SUITE-RULES.md` plus changing `DESIGN.md`'s "installed on the home screen" line to "reached from the Dobrinska Arcade" (the items its untracked handoff note asked for)
- [x] Secret Script Studio: its existing house-button ticket (02 in `.scratch/arcade/issues/`) covers the link-home failure, so no duplicate is filed; any other failure gets a new ticket numbered after the existing ones
- [x] Each filed ticket follows that repo's ticket format and `Status:` vocabulary, and is committed in that repo on a branch (not master) and pushed, for Dad to merge
- [x] No Game code or docs are changed, only ticket files
- [x] The "for you" list is handed to Dad in the final report, not acted on

## Comments

- 2026-11-08 (agent): Ran the sweep with `node tools/ready-check.js` from the Arcade checkout (exit 1, both Games fail). The full report is below.
  - **Doodle Monsters:** filed `.scratch/arcade/issues/01-tile-icon.md`, `02-house-button.md` and `03-point-docs-at-suite-rules.md` on branch `arcade-catch-up-tickets`, pushed for Dad to merge. Dad's checkout (master, untracked handoff note) was not touched. Master is no longer ahead of origin, so nothing depended on unpushed work.
  - **Secret Script Studio:** only "link home" fails, and its existing `.scratch/arcade/issues/02-house-button.md` covers that, so nothing new was filed and no branch was pushed.
  - **Not acted on, for Dad:** the "for you" list in the report. Beyond what the script reports: Doodle Monsters' remote branch `worktree-night-1-results` is already merged into master (so the spec's "merge it" item is done; the remote branch can be deleted), and its local branch `landscape` is merged and can be deleted. The sweep doesn't report merged branches or remote-only branches.

````markdown
# Ready check

| Game | live page | icon loads | icon 512×512 | storage prefixed | link home | service worker scope | passes |
| --- | --- | --- | --- | --- | --- | --- | --- |
| doodle-monsters | pass | FAIL | - | pass | FAIL | pass | no |
| secret-script-studio | pass | pass | pass | pass | FAIL | pass | no |

pass = meets the check, FAIL = breaks it, - = not judged (a check it needs failed).
Passing is not Ready: Ready is still Dad's call.

## Ticket drafts (3)

### For doodle-monsters/.scratch/arcade/issues/NN-<slug>.md

# NN: Publish a Tile icon at /doodle-monsters/icon-512.png

**What to build:** The Arcade loads each Game's Tile picture from /doodle-monsters/icon-512.png, but the live site answers 404, so the Tile shows a name only. Add a square 512×512 PNG at that path (in the build output, e.g. Vite's public/) so the kids can find the Game without reading (suite rule 4).

**Suite rule:** 4 (Ready check: "icon loads" failed)

**Status:** ready-for-agent

- [ ] https://trevordobrinska.github.io/doodle-monsters/icon-512.png loads (200) after deploying
- [ ] It is a PNG of exactly 512×512
- [ ] The Game's Tile in the Arcade shows the picture

### For doodle-monsters/.scratch/arcade/issues/NN-<slug>.md

# NN: Add a house button back to the Arcade

**What to build:** The Game's source has no link to the site root "/", so the kids can only leave it with the tablet's Back. Add a small house button to the Game's home screen that links to the Arcade at "/" (suite rule 5), e.g. <a href="/">.

**Suite rule:** 5 (Ready check: "link home" failed)

**Status:** ready-for-agent

- [ ] The Game's home screen shows a small house button
- [ ] Tapping it opens the Arcade (https://trevordobrinska.github.io/)
- [ ] The Ready check's "link home" passes

### For secret-script-studio/.scratch/arcade/issues/NN-<slug>.md

# NN: Add a house button back to the Arcade

**What to build:** The Game's source has no link to the site root "/", so the kids can only leave it with the tablet's Back. Add a small house button to the Game's home screen that links to the Arcade at "/" (suite rule 5), e.g. <a href="/">.

**Suite rule:** 5 (Ready check: "link home" failed)

**Status:** ready-for-agent

- [ ] The Game's home screen shows a small house button
- [ ] Tapping it opens the Arcade (https://trevordobrinska.github.io/)
- [ ] The Ready check's "link home" passes

## For you

Git housekeeping in each Game's repo. Never a failure, and never done by the check.

### doodle-monsters

- [ ] Commit or delete untracked .scratch/arcade/handoff.md

### secret-script-studio

- [ ] Remove merged worktree C:/Users/trevo/Projects/secret-script-studio/.claude/worktrees/tablet-test-results (worktree-tablet-test-results)

## Tablet list

For each Game, on the tablet, from the installed Arcade:

- [ ] **house button returns to the Arcade** (rule 5): Open the Game from its Tile, tap its house button: the Arcade menu shows, still fullscreen.
- [ ] **system Back returns to the Arcade** (rule 5): Open the Game from its Tile, press the tablet's Back: the Arcade menu shows, still fullscreen.

If one fails, file this in that Game's .scratch/arcade/issues/NN-<slug>.md:

### If "house button returns to the Arcade" fails

# NN: House button returns to the Arcade on the tablet

**What to build:** On the tablet, the Game's house button didn't bring back the Arcade menu. Every Game needs a house button linking to / (suite rule 5).

**Suite rule:** 5 (tablet check: "house button returns to the Arcade" failed)

**Status:** ready-for-human

- [ ] On the tablet, tapping the house button shows the Arcade menu
- [ ] The Arcade is still fullscreen afterwards

### If "system Back returns to the Arcade" fails

# NN: System Back returns to the Arcade on the tablet

**What to build:** On the tablet, pressing Back in the Game didn't bring back the Arcade menu. The Game mustn't trap or swallow Back (suite rule 5).

**Suite rule:** 5 (tablet check: "system Back returns to the Arcade" failed)

**Status:** ready-for-human

- [ ] On the tablet, pressing Back from the Game's first screen shows the Arcade menu
- [ ] The Arcade is still fullscreen afterwards
````
