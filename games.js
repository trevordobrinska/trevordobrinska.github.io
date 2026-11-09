// The Games list: the only file to edit to change the Arcade's menu.
//
// Each entry:
//   slug   the Game's repo name and path, e.g. "doodle-monsters"
//   name   shown on the Tile
//   state  "ready"       playable Tile, opens /<slug>/
//          "coming-soon" greyed-out Tile that can't be opened
//          "test"        temporary Test Tile for a tablet session; needs `path`
//   path   Test entries only: the page below /<slug>/, e.g. "night1/"
//
// List order is the Tile order (Ready, then Test, then Coming-soon).
// Add new Games at the end. Remove Test entries after the session.
// Run `node --test` before pushing.

export const games = [
  { slug: "doodle-monsters", name: "Doodle Monsters", state: "coming-soon" },
  { slug: "secret-script-studio", name: "Secret Script Studio", state: "coming-soon" },

  // Test Tiles for the first tablet session (ticket 04). Remove after it.
  { slug: "doodle-monsters", name: "Doodle Monsters Night 1", state: "test", path: "night1/" },
  { slug: "secret-script-studio", name: "Secret Script Studio Test", state: "test", path: "tablet-test.html" },
];
