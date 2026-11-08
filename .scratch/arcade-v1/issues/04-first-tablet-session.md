# 04: First tablet session: the Arcade's checks

**What to build:** On the real tablets, in a Kids profile, the Arcade is the one installed icon and the path a kid actually takes works: Arcade → Tile → page → back. This runs first at whichever Game's tablet session comes first (Doodle Monsters' Night 1 or Secret Script Studio's tablet test), before that Game's own checks. See DESIGN.md's tablet checklist.

**Blocked by:** 03

**Status:** ready-for-human

- [ ] Before the session: add a Test Tile for each test page being used that day (`/doodle-monsters/night1/` and/or `/secret-script-studio/tablet-test.html`) and push
- [ ] Approving `trevordobrinska.github.io` in the Parent Dashboard also lets the Games' sub-addresses open
- [ ] Silk in the Kids profile installs the Arcade to the home screen
- [ ] Tapping a Tile opens the page inside the fullscreen Arcade window, not a browser tab
- [ ] System Back (and the house button, once a Game has one) returns to the Arcade
- [ ] Results recorded under `## Comments` here and DESIGN.md's checklist ticked; anything that fails becomes a new ticket
- [ ] After the session: Test Tiles removed and pushed
- [ ] Repeated on the son's tablet once its model is known (may be a later session)
