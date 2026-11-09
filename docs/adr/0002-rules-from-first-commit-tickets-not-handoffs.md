# 2. Games follow the suite rules from their first commit; tickets replace handoff notes

Date: 2026-11-08

## Status
Accepted. Supersedes the handoff notes used for Doodle Monsters and Secret Script Studio.

## Context
The suite rules were written after Doodle Monsters and Secret Script Studio were mostly built. They reached the Games as handoff notes in each Game's `.scratch/` folder, for the Game's own session to turn into tickets. The first audit across all three repos (2026-11-08) found what slipped: neither Game has a house button, Doodle Monsters' Tile icon is a 404, and Doodle Monsters' handoff note was never committed or turned into tickets, with nothing to flag it.

## Decision
- **Rules from the first commit.** Every new Game starts as a copy of the Arcade's starter, which already meets the suite rules.
- **Tickets, not handoff notes.** When the suite rules change or a Ready check fails, the Arcade session files a ticket straight into the Game's `.scratch/arcade/issues/`. That is the only thing the Arcade writes into a Game's repo; it never fixes a Game itself.

## Consequences
- One mechanism: rule changes arrive in each Game's normal ticket flow, so nothing sits untracked.
- The starter lives next to `SUITE-RULES.md`, so a rule change and a starter change happen together.
- The two live Games get catch-up tickets from the first Ready check run, and their handoff notes are retired.
