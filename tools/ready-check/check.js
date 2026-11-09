// The Ready check module: a pure function from facts about Games to a verdict.
// No I/O: gather.js collects the facts, report.js prints the verdict.
//
// Facts about one Game (gather.js builds these; tests build them by hand):
//   slug   the Game's slug, e.g. "doodle-monsters"
//   page   { status }       HTTP status of the live page /<slug>/
//   icon   { status, png, sha256 }  HTTP status of /<slug>/icon-512.png;
//                           png: { width, height } read from its IHDR, or
//                           null if the bytes aren't a PNG (or didn't load);
//                           sha256: hex hash of its bytes, null if no bytes
//   (local-only facts, e.g. the starter's: page { status: null } as nothing
//   was fetched; icon read from the folder's public/icon-512.png, status 200
//   if it's there, 404 if not)
//   source what the Game's own source says (read from its local repo):
//     storage         [{ kind, name, file, line }] each saved-data name found:
//                     kind "indexedDB", "localStorage" or "cache"; name is the
//                     literal name (or its fixed start, for "night1:verdict:" +
//                     id), or null with an `expression` when it can't be read
//     linksHome       [{ file, line }] each link to the site root "/"
//     serviceWorkers  [{ file, line, scope }] each service worker
//                     registration; scope is the site path it can control
//                     (e.g. "/secret-script-studio/"), or null if unreadable
//   git    the Game's local repo at Projects\<slug>\, null if there is none,
//          or left out when not gathered (no "for you" items then):
//            defaultBranch     e.g. "main"
//            unmergedBranches  [{ name, commits }] commits not on the default
//            unpushed          [{ branch, commits }] commits not on its upstream
//            untracked         [paths] untracked, not ignored
//            worktrees         [{ path, branch, merged }] extra worktrees
//
// Options (second argument to readyCheck):
//   exceptions  [{ slug, name, why }] accepted rule 2 exceptions: that Game
//               may use that exact unprefixed storage name (e.g. a throwaway
//               test page). Kept as data next to the CLI, not in this logic.
//   placeholderIcons  [sha256 hex] icons that are still a placeholder (the
//               starter's); a Game whose icon hashes to one fails
//               "icon not placeholder". The CLI passes the starter's.
//
// Verdict: { games, tabletList }
//   games       one entry per Game, in the order given:
//     slug      the Game's slug
//     checks    [{ name, rule, status }] in grid order; status is "pass",
//               "fail", or "skip" (not judged because a check it needs failed)
//     passes    true when every check passes. Ready is still Dad's call.
//     tickets   one draft per failed check: { check, rule, title, whatToBuild,
//               acceptance: [criteria] }
//     forYou    [lines] git housekeeping for Dad; never affects checks/passes
//   tabletList  the manual checks a script can't do, for every Game:
//               [{ name, rule, steps, ticket: { title, whatToBuild,
//               acceptance } }]; a failure is filed as ready-for-human

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
    name: "icon not placeholder",
    rule: 4,
    needs: ["icon loads"],
    judge: (facts, options) => !options.placeholderIcons.includes(facts.icon.sha256),
    ticket: (facts) => ({
      title: "Draw real Tile art for the icon",
      whatToBuild:
        "/" + facts.slug + "/icon-512.png is still the starter's placeholder picture, so the " +
        "Game's Tile wouldn't show the kids what the Game is. Replace public/icon-512.png with " +
        "the Game's own square 512×512 PNG (suite rule 4).",
      acceptance: [
        "https://trevordobrinska.github.io/" + facts.slug + "/icon-512.png shows the Game's own picture",
        "It is a PNG of exactly 512×512",
        "The Ready check's \"icon not placeholder\" passes",
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

// The manual tablet list: what a script can't see, run by Dad on the tablet for
// each Game. A failure is filed in that Game's repo from `ticket`, as
// ready-for-human (only the tablet can confirm the fix).
const TABLET_LIST = [
  {
    name: "house button returns to the Arcade",
    rule: 5,
    steps: "Open the Game from its Tile, tap its house button: the Arcade menu shows, still fullscreen.",
    ticket: {
      title: "House button returns to the Arcade on the tablet",
      whatToBuild:
        "On the tablet, the Game's house button didn't bring back the Arcade menu. " +
        "Every Game needs a house button linking to / (suite rule 5).",
      acceptance: [
        "On the tablet, tapping the house button shows the Arcade menu",
        "The Arcade is still fullscreen afterwards",
      ],
    },
  },
  {
    name: "system Back returns to the Arcade",
    rule: 5,
    steps: "Open the Game from its Tile, press the tablet's Back: the Arcade menu shows, still fullscreen.",
    ticket: {
      title: "System Back returns to the Arcade on the tablet",
      whatToBuild:
        "On the tablet, pressing Back in the Game didn't bring back the Arcade menu. " +
        "The Game mustn't trap or swallow Back (suite rule 5).",
      acceptance: [
        "On the tablet, pressing Back from the Game's first screen shows the Arcade menu",
        "The Arcade is still fullscreen afterwards",
      ],
    },
  },
];

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

export function readyCheck(gamesFacts, { exceptions = [], placeholderIcons = [] } = {}) {
  const options = { exceptions, placeholderIcons };
  return { games: gamesFacts.map((facts) => checkGame(facts, options)), tabletList: TABLET_LIST };
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
    forYou: forYou(facts.git),
  };
}

// Git housekeeping for Dad, one line per thing to do. Never a check: it can't
// fail a Game, and the Ready check never does it (the Arcade never fixes a Game).
function forYou(git) {
  if (git === undefined) return [];
  if (git === null) return ["No local repo found: clone it into Projects\\ so the Ready check can see its git state"];
  const items = [];
  git.unmergedBranches.forEach((b) =>
    items.push("Merge " + b.name + " (" + commits(b.commits) + ") into " + git.defaultBranch));
  git.unpushed.forEach((u) => items.push("Push " + commits(u.commits) + " on " + u.branch));
  git.untracked.forEach((file) => items.push("Commit or delete untracked " + file));
  git.worktrees.forEach((w) =>
    items.push(w.merged
      ? "Remove merged worktree " + w.path + " (" + w.branch + ")"
      : "Merge or remove worktree " + w.path + " (" + w.branch + ", not merged)"));
  return items;
}

function commits(n) {
  return n + (n === 1 ? " commit" : " commits");
}
