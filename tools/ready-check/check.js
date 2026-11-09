// The Ready check module: a pure function from facts about Games to a verdict.
// No I/O: gather.js collects the facts, report.js prints the verdict.
//
// Facts about one Game (gather.js builds these; tests build them by hand):
//   slug   the Game's slug, e.g. "doodle-monsters"
//   page   { status }       HTTP status of the live page /<slug>/
//   icon   { status, png }  HTTP status of /<slug>/icon-512.png, and
//                           png: { width, height } read from its IHDR, or
//                           null if the bytes aren't a PNG (or didn't load)
//   git    the Game's local repo at Projects\<slug>\, null if there is none,
//          or left out when not gathered (no "for you" items then):
//            defaultBranch     e.g. "main"
//            unmergedBranches  [{ name, commits }] commits not on the default
//            unpushed          [{ branch, commits }] commits not on its upstream
//            untracked         [paths] untracked, not ignored
//            worktrees         [{ path, branch, merged }] extra worktrees
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
//   judge    (facts) => true when the Game meets the check
//   ticket   (facts) => { title, whatToBuild, acceptance } drafted on failure
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
];

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

export function readyCheck(gamesFacts) {
  return { games: gamesFacts.map(checkGame), tabletList: TABLET_LIST };
}

function checkGame(facts) {
  const status = {};
  const checks = [];
  const tickets = [];
  CHECKS.forEach((check) => {
    if (check.needs.some((name) => status[name] !== "pass")) {
      status[check.name] = "skip";
    } else {
      status[check.name] = check.judge(facts) ? "pass" : "fail";
    }
    checks.push({ name: check.name, rule: check.rule, status: status[check.name] });
    if (status[check.name] === "fail") {
      tickets.push({ check: check.name, rule: check.rule, ...check.ticket(facts) });
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
