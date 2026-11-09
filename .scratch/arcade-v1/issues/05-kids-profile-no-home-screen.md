# 05: A Kids profile can't put the Arcade on the home screen

**What's wrong:** At the first tablet session (2026-11-08, daughter's Fire HD 8, Kids profile), the Arcade opened once `trevordobrinska.github.io` was an allowed website, but there was no way to add it to the home screen. DESIGN.md assumes "only the Arcade goes on each tablet's home screen" and that Games open "inside the Arcade's fullscreen window". Neither is possible from a Kids profile as tested. See ticket 04's Comments.

**Blocked by:** None

**Status:** needs-triage

What still works: the allowed website opens the Arcade, Tiles open their pages, and system Back returns to the menu. So "one place to find every Game" holds, just not as a fullscreen home-screen app.

Questions for triage (likely a short grilling, since this changes DESIGN.md):
- Where exactly does the allowed Arcade appear for the kid (a Web or Websites tab, or something else)? Is that easy enough for her to find on her own?
- Does the Kids-profile browser show its own address or toolbar bars? If so, do the Tiles still fit 1280×800 in both orientations?
- Is there another route to an icon, e.g. something set up from the parent profile or the Parent Dashboard? It needs checking on the device, not assuming.
- If there's no icon: update DESIGN.md (Installing, Getting back, tablet checklist) and the spec's user stories 1, 4 and 25. Decide whether the manifest and service worker still earn their place, since they're harmless either way.
- Repeat the check on the son's tablet once its model is known.
