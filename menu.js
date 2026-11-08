// The Menu module: turns the Games list into the Tiles to show, in order.

const GROUP_ORDER = ["ready", "test", "coming-soon"];

// Throws an Error naming the first problem if the Games list is invalid.
export function menu(games) {
  validate(games);
  const tiles = [];
  GROUP_ORDER.forEach((state) => {
    games
      .filter((game) => game.state === state)
      .forEach((game) => tiles.push(toTile(game)));
  });
  return tiles;
}

function validate(games) {
  // Test entries are temporary extras, so only Ready and Coming-soon slugs
  // must be unique: a Game can be Coming-soon and have a Test Tile too.
  const seenSlugs = new Set();
  games.forEach((game, index) => {
    const where = "Games list entry " + (index + 1);
    if (GROUP_ORDER.indexOf(game.state) === -1) {
      throw new Error(where + ' has unknown state "' + game.state + '"');
    }
    if (typeof game.name !== "string" || game.name.trim() === "") {
      throw new Error(where + " has an empty name");
    }
    if (game.state === "test") {
      if (typeof game.path !== "string" || game.path === "") {
        throw new Error(where + " is a Test entry without a path");
      }
      return;
    }
    if (seenSlugs.has(game.slug)) {
      throw new Error(where + ' has duplicate slug "' + game.slug + '"');
    }
    seenSlugs.add(game.slug);
  });
}

function toTile(game) {
  return {
    slug: game.slug,
    name: game.name,
    state: game.state,
    href: linkFor(game),
    icon: "/" + game.slug + "/icon-512.png",
  };
}

function linkFor(game) {
  if (game.state === "ready") return "/" + game.slug + "/";
  if (game.state === "test") return "/" + game.slug + "/" + game.path;
  return null;
}
