// The Ready check module: a pure function from facts about Games to a verdict.
// No I/O: gather.js collects the facts, report.js prints the verdict.
//
// Facts about one Game (gather.js builds these; tests build them by hand):
//   slug   the Game's slug, e.g. "doodle-monsters"
//   page   { status }       HTTP status of the live page /<slug>/
//   icon   { status, png }  HTTP status of /<slug>/icon-512.png, and
//                           png: { width, height } read from its IHDR, or
//                           null if the bytes aren't a PNG (or didn't load)
//   source what the Game's own source says (read from its local repo):
//     storage         [{ kind, name, file, line }] each saved-data name found:
//                     kind "indexedDB", "localStorage" or "cache"; name is the
//                     literal name (or its fixed start, for "night1:verdict:" +
//                     id), or null with an `expression` when it can't be read
//     linksHome       [{ file, line }] each link to the site root "/"
//     serviceWorkers  [{ file, line, scope }] each service worker
//                     registration; scope is the site path it can control
//                     (e.g. "/secret-script-studio/"), or null if unreadable
//
// Options (second argument to readyCheck):
//   exceptions  [{ slug, name, why }] accepted rule 2 exceptions: that Game
//               may use that exact unprefixed storage name (e.g. a throwaway
//               test page). Kept as data next to the CLI, not in this logic.
//
// Verdict: { games: [one entry per Game, in the order given] }, each entry
//   slug     the Game's slug
//   checks   [{ name, rule, status }] in grid order; status is "pass",
//            "fail", or "skip" (not judged because a check it needs failed)
//   passes   true when every check passes. Ready is still Dad's call.
//   tickets  one draft per failed check: { check, rule, title, whatToBuild,
//            acceptance: [criteria] }

// The checks, in grid order. Adding a check is one entry here. Each one:
//   name     the grid column, and how tickets refer to it
//   rule     the SUITE-RULES.md rule number it enforces
//   needs    names of checks that must pass first, or it's skipped
//   judge    (facts, options) => true when the Game meets the check
//   ticket   (facts, options) => { title, whatToBuild, acceptance } on failure
const CHECKS = [
  {
    name: "live page",
    rule: 1,
    needs: [],
    judge: (facts) => facts.page.status === 200,
    ticket: (facts) => ({
      title: "Publish the Game at /" + facts.slug + "/",
      whatToBuild:
        "The Game's Tile opens /" + facts.slug + "/, but the live site answers " +
        facts.page.status + ". Deploy the Game to GitHub Pages from the repo named " +
        facts.slug + ", built with relative URLs (Vite base \"./\") so it works under " +
        "its own path (suite rule 1).",
      acceptance: [
        "https://trevordobrinska.github.io/" + facts.slug + "/ loads (200) after deploying",
        "The Game's scripts, styles and images load from below /" + facts.slug + "/",
      ],
    }),
  },
  {
    name: "icon loads",
    rule: 4,
    needs: [],
    judge: (facts) => facts.icon.status === 200,
    ticket: (facts) => ({
      title: "Publish a Tile icon at /" + facts.slug + "/icon-512.png",
      whatToBuild:
        "The Arcade loads each Game's Tile picture from /" + facts.slug + "/icon-512.png, " +
        "but the live site answers " + facts.icon.status + ", so the Tile shows a name only. " +
        "Add a square 512×512 PNG at that path (in the build output, e.g. Vite's public/) so the kids " +
        "can find the Game without reading (suite rule 4).",
      acceptance: [
        "https://trevordobrinska.github.io/" + facts.slug + "/icon-512.png loads (200) after deploying",
        "It is a PNG of exactly 512×512",
        "The Game's Tile in the Arcade shows the picture",
      ],
    }),
  },
  {
    name: "icon 512×512",
    rule: 4,
    needs: ["icon loads"],
    judge: (facts) =>
      facts.icon.png !== null && facts.icon.png.width === 512 && facts.icon.png.height === 512,
    ticket: (facts) => ({
      title: "Make the Tile icon a 512×512 PNG",
      whatToBuild:
        "/" + facts.slug + "/icon-512.png loads, but " +
        (facts.icon.png === null
          ? "it is not a PNG"
          : "it is " + facts.icon.png.width + "×" + facts.icon.png.height) +
        ". The Arcade draws every Tile from a square 512×512 PNG (suite rule 4). " +
        "Replace it with a 512×512 PNG.",
      acceptance: [
        "https://trevordobrinska.github.io/" + facts.slug + "/icon-512.png is a PNG of exactly 512×512",
        "The Game's Tile in the Arcade shows the picture undistorted",
      ],
    }),
  },
  {
    name: "storage prefixed",
    rule: 2,
    needs: [],
    judge: (facts, options) => unprefixedStorage(facts, options).length === 0,
    ticket: (facts, options) => ({
      title: "Start every saved-data name with " + facts.slug,
      whatToBuild:
        "Every Game shares one browser origin, so IndexedDB database names, localStorage keys " +
        "and cache names must all start with \"" + facts.slug + "\" (suite rule 2). The source has " +
        "names that don't, or that the Ready check can't read: " +
        unprefixedStorage(facts, options).map(describeStorage).join("; ") + ". " +
        "Rename them (keeping the kids' existing saves, e.g. by copying old data across once), " +
        "and write each name as a string literal or a constant so the check can read it.",
      acceptance: [
        "Every IndexedDB database, localStorage key and cache name in the source starts with \"" +
          facts.slug + "\"",
        "Saves made before the rename still load",
        "The Ready check's \"storage prefixed\" passes",
      ],
    }),
  },
  {
    name: "link home",
    rule: 5,
    needs: [],
    judge: (facts) => facts.source.linksHome.length > 0,
    ticket: () => ({
      title: "Add a house button back to the Arcade",
      whatToBuild:
        "The Game's source has no link to the site root \"/\", so the kids can only leave it " +
        "with the tablet's Back. Add a small house button to the Game's home screen that links " +
        "to the Arcade at \"/\" (suite rule 5), e.g. <a href=\"/\">.",
      acceptance: [
        "The Game's home screen shows a small house button",
        "Tapping it opens the Arcade (https://trevordobrinska.github.io/)",
        "The Ready check's \"link home\" passes",
      ],
    }),
  },
  {
    name: "service worker scope",
    rule: 3,
    needs: [],
    judge: (facts) => strayWorkers(facts).length === 0,
    ticket: (facts) => ({
      title: "Keep the service worker inside /" + facts.slug + "/",
      whatToBuild:
        "Every Game shares one origin with the Arcade, so a Game's service worker must be scoped " +
        "to its own path /" + facts.slug + "/ and never claim the site root (suite rule 3). " +
        "These registrations could reach outside it, or their scope can't be read: " +
        strayWorkers(facts)
          .map((w) => w.file + ":" + w.line + " (scope " + (w.scope === null ? "unreadable" : w.scope) + ")")
          .join("; ") +
        ". Register the worker from a relative URL inside the Game's path (e.g. " +
        "new URL(\"sw.js\", document.baseURI)) with no wider scope.",
      acceptance: [
        "Every service worker registration's scope is inside /" + facts.slug + "/",
        "The Arcade's own service worker at / still controls the Arcade after opening the Game",
        "The Ready check's \"service worker scope\" passes",
      ],
    }),
  },
];

// Service worker registrations whose scope isn't inside /<slug>/.
function strayWorkers(facts) {
  const own = "/" + facts.slug + "/";
  return facts.source.serviceWorkers.filter((w) => w.scope === null || !w.scope.startsWith(own));
}

// Storage names that break rule 2: not starting with the slug, unreadable,
// and not an accepted exception for this Game.
function unprefixedStorage(facts, options) {
  const excused = new Set(
    options.exceptions.filter((e) => e.slug === facts.slug).map((e) => e.name),
  );
  return facts.source.storage.filter(
    (s) => s.name === null || (!s.name.startsWith(facts.slug) && !excused.has(s.name)),
  );
}

function describeStorage(s) {
  const what = s.name === null ? "an unreadable name (" + s.expression + ")" : "\"" + s.name + "\"";
  return s.kind + " " + what + " at " + s.file + ":" + s.line;
}

export function readyCheck(gamesFacts, { exceptions = [] } = {}) {
  const options = { exceptions };
  return { games: gamesFacts.map((facts) => checkGame(facts, options)) };
}

function checkGame(facts, options) {
  const status = {};
  const checks = [];
  const tickets = [];
  CHECKS.forEach((check) => {
    if (check.needs.some((name) => status[name] !== "pass")) {
      status[check.name] = "skip";
    } else {
      status[check.name] = check.judge(facts, options) ? "pass" : "fail";
    }
    checks.push({ name: check.name, rule: check.rule, status: status[check.name] });
    if (status[check.name] === "fail") {
      tickets.push({ check: check.name, rule: check.rule, ...check.ticket(facts, options) });
    }
  });
  return {
    slug: facts.slug,
    checks,
    passes: checks.every((c) => c.status === "pass"),
    tickets,
  };
}
