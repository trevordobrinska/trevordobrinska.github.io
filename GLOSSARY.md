# Glossary: Dobrinska Arcade

**Dobrinska Arcade** (the Arcade): the one home page where the kids find every Game Dad builds. It's the only icon on each tablet's home screen, and every Game opens from it.

**Game**: anything that has a Tile in the Arcade, whether it's a game or more of a tool (e.g. Secret Script Studio). Each Game is its own project.

**Tile**: the big button for one Game in the Arcade. Tapping a playable Tile opens the Game.

**Coming-soon Tile**: a greyed-out Tile for a Game that isn't ready yet. It can't be opened; it's there to build excitement.

**Ready**: Dad's call that a Game is fit to play, made after a passing Ready check. Only Ready Games get a playable Tile.

**Ready check**: the Arcade's script plus a short manual tablet list that checks a Game against the suite rules. It prints a pass/fail grid, a ticket draft for each failure, and a "for you" list of housekeeping for Dad. It never writes into a Game's repo.

**Starter**: the minimal Game kept in the Arcade repo next to `SUITE-RULES.md`. Every new Game begins as a copy of it (following `NEW-GAME.md`), so it meets the suite rules from its first commit.

**Test Tile**: a temporary Tile, marked "TEST", that opens a Game's throwaway test page for a tablet test session (e.g. `/doodle-monsters/night1/`). Dad removes it after the session. Test Tiles are never Ready.

**Games list**: the one hand-edited list of Games, in the order their Tiles appear. Adding a Game to the Arcade means adding one entry to it.

**Menu module**: the pure function that turns the Games list into the Tiles to show, in order, and catches mistakes in the list. It's the one part of the Arcade with tests.
