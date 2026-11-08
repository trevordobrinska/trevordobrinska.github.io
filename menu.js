// The Menu module: turns the Games list into the Tiles to show, in order.

// Everything that depends on a Tile's state, in one place. Object key order
// is the group order: Ready, then Test, then Coming-soon.
//   playable    the Tile opens the Game (Coming-soon Tiles are inert)
//   badge       text shown on the Tile, or null
//   needsPath   the entry links below the Game's root via `path`
//   uniqueSlug  the slug can't repeat among these entries. Test entries are
//               temporary extras, so a Game can be Coming-soon and have a
//               Test Tile too.
const STATES = {
  ready: { playable: true, badge: null, needsPath: false, uniqueSlug: true },
  test: { playable: true, badge: "TEST", needsPath: true, uniqueSlug: false },
  "coming-soon": { playable: false, badge: null, needsPath: false, uniqueSlug: true },
};

// Throws an Error naming the first problem if the Games list is invalid.
export function menu(games) {
  validate(games);
  const tiles = [];
  Object.keys(STATES).forEach((state) => {
    games
      .filter((game) => game.state === state)
      .forEach((game) => tiles.push(toTile(game)));
  });
  return tiles;
}

function validate(games) {
  const seenSlugs = new Set();
  games.forEach((game, index) => {
    const where = "Games list entry " + (index + 1);
    if (!Object.prototype.hasOwnProperty.call(STATES, game.state)) {
      throw new Error(where + ' has unknown state "' + game.state + '"');
    }
    if (typeof game.slug !== "string" || game.slug.trim() === "") {
      throw new Error(where + " has an empty slug");
    }
    if (typeof game.name !== "string" || game.name.trim() === "") {
      throw new Error(where + " has an empty name");
    }
    const rules = STATES[game.state];
    if (rules.needsPath) {
      if (typeof game.path !== "string" || game.path === "") {
        throw new Error(where + " is a Test entry without a path");
      }
      if (game.path.charAt(0) === "/") {
        throw new Error(where + ' has a path starting with "/"; write it without the leading slash');
      }
    }
    if (rules.uniqueSlug) {
      if (seenSlugs.has(game.slug)) {
        throw new Error(where + ' has duplicate slug "' + game.slug + '"');
      }
      seenSlugs.add(game.slug);
    }
  });
}

function toTile(game) {
  const { playable, badge, needsPath } = STATES[game.state];
  const root = gameRoot(game.slug);
  return {
    slug: game.slug,
    name: game.name,
    state: game.state,
    playable,
    badge,
    href: playable ? root + (needsPath ? game.path : "") : null,
    icon: root + "icon-512.png",
  };
}

function gameRoot(slug) {
  return "/" + slug + "/";
}
