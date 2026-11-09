# 04: First tablet session: the Arcade's checks

**What to build:** On the real tablets, in a Kids profile, the Arcade is the one installed icon and the path a kid actually takes works: Arcade → Tile → page → back. This runs first at whichever Game's tablet session comes first (Doodle Monsters' Night 1 or Secret Script Studio's tablet test), before that Game's own checks. See DESIGN.md's tablet checklist.

**Blocked by:** 03

**Status:** resolved

- [x] Before the session: add a Test Tile for each test page being used that day (`/doodle-monsters/night1/` and/or `/secret-script-studio/tablet-test.html`) and push
- [x] Approving `trevordobrinska.github.io` in the Parent Dashboard also lets the Games' sub-addresses open
- [x] Silk in the Kids profile installs the Arcade to the home screen (done through the allowed site's icon in **My Stuff**, not Silk's install; see Comments)
- [x] Tapping a Tile opens the page inside the fullscreen Arcade window, not a browser tab
- [x] System Back (and the house button, once a Game has one) returns to the Arcade
- [x] Results recorded under `## Comments` here and DESIGN.md's checklist ticked; anything that fails becomes a new ticket
- [x] After the session: Test Tiles removed and pushed
- [x] Repeated on the son's tablet once its model is known (may be a later session)

## Comments

**2026-11-08, daughter's Fire HD 8 (Kids profile):**
- Before the session: Test Tiles for `/doodle-monsters/night1/` and `/secret-script-studio/tablet-test.html` went live (commit 635d2cb).
- Dad added `trevordobrinska.github.io` to the profile's allowed websites, and the Arcade opened in the Kids profile.
- **Add to home screen: failed.** The Kids profile offered no way to add the Arcade to the home screen. Becomes ticket 05.
- **Tile → page: passed.** Tapping a Test Tile opened its page, which means the one approval also covers the Games' sub-addresses. There's no fullscreen Arcade window to check without the install.
- **System Back: passed.** It returned to the Arcade menu. The house button can't be checked yet because no Game has one.

**Correction, same night:** Dad found the way onto the home screen. A site on the Parent Dashboard's allowed list appears as an icon in the kid's **My Stuff** folder on the home screen, and it opens fullscreen with no address bar. So "add to home screen: failed" above was wrong, and ticket 05 is closed as a false alarm.

**Both tablets, 2026-11-08:** Both first-night sessions are done on both tablets, and the Arcade is on both home screens. Dad noted only minor comments, which belong to the Games and are recorded in their own repos. After the session the Test Tiles were removed, and Doodle Monsters and Secret Script Studio became Ready (Dad's call).
