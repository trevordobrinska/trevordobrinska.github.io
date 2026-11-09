# 04: Sweep, git "for you" list, and manual tablet list

**What to build:** Run with no slug, the Ready check covers every Game in the Games list in one report. Git housekeeping across each Game's repo shows up as a "for you" list for Dad, never as a failure, and the report ends with the manual tablet checks a script can't do. See `../spec.md` (Verdict, Git findings, Command line).

**Blocked by:** 02 (can run alongside 03)

**Status:** resolved

- [x] No slug: the check runs for every Game in the Games list (Ready, Test and Coming-soon entries alike) and prints one grid row per Game
- [x] Git facts per Game: branches not merged into the default branch (with commit counts), unpushed commits, untracked files, extra worktrees and whether each is merged
- [x] Git findings become "for you" items (what to do, e.g. "merge X", "remove merged worktree Y") and never fail a check
- [x] The report ends with the manual tablet list: house button and system Back both return to the Arcade
- [x] `node --test`: git findings produce "for you" items and leave every check passing; a sweep returns one row per Game
- [x] Real run lists whatever housekeeping is open at the time (on 2026-11-08 that was Doodle Monsters' untracked handoff note and leftover worktrees)
