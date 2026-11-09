import { test } from "node:test";
import assert from "node:assert/strict";
import { readyCheck } from "../tools/ready-check/check.js";

// Facts about a Game that meets every check. Each test breaks one thing.
function goodGame(slug = "doodle-monsters") {
  return {
    slug,
    page: { status: 200 },
    icon: { status: 200, png: { width: 512, height: 512 } },
    source: {
      storage: [
        { kind: "indexedDB", name: slug, file: "src/storage.ts", line: 3 },
        { kind: "localStorage", name: slug + ":hard-mode", file: "src/main.ts", line: 64 },
      ],
      linksHome: [{ file: "src/home.ts", line: 12 }],
      serviceWorkers: [{ file: "src/main.ts", line: 52, scope: "/" + slug + "/" }],
    },
  };
}

function statuses(gameVerdict) {
  return Object.fromEntries(gameVerdict.checks.map((c) => [c.name, c.status]));
}

test("a Game meeting every check passes the Ready check with no ticket drafts", () => {
  const [game] = readyCheck([goodGame()]).games;
  assert.equal(game.slug, "doodle-monsters");
  assert.deepEqual(statuses(game), {
    "live page": "pass",
    "icon loads": "pass",
    "icon 512×512": "pass",
    "storage prefixed": "pass",
    "link home": "pass",
    "service worker scope": "pass",
  });
  assert.equal(game.passes, true);
  assert.deepEqual(game.tickets, []);
});

test('a 404 Tile icon fails "icon loads", skips the size check, and drafts one ticket citing rule 4', () => {
  const facts = goodGame();
  facts.icon = { status: 404, png: null };
  const [game] = readyCheck([facts]).games;
  assert.deepEqual(statuses(game), {
    "live page": "pass",
    "icon loads": "fail",
    "icon 512×512": "skip",
    "storage prefixed": "pass",
    "link home": "pass",
    "service worker scope": "pass",
  });
  assert.equal(game.passes, false);
  assert.equal(game.tickets.length, 1);
  const [ticket] = game.tickets;
  assert.equal(ticket.check, "icon loads");
  assert.equal(ticket.rule, 4);
  assert.match(ticket.title, /icon/i);
  assert.match(ticket.whatToBuild, /\/doodle-monsters\/icon-512\.png/);
  assert.match(ticket.whatToBuild, /404/);
  assert.ok(ticket.acceptance.length > 0);
});

test('a wrong-sized or non-PNG Tile icon fails "icon 512×512" alone and drafts one ticket citing rule 4', () => {
  for (const [png, said] of [
    [{ width: 256, height: 256 }, /256×256/],
    [{ width: 512, height: 384 }, /512×384/],
    [null, /not a PNG/],
  ]) {
    const facts = goodGame("secret-script-studio");
    facts.icon = { status: 200, png };
    const [game] = readyCheck([facts]).games;
    assert.deepEqual(statuses(game), {
      "live page": "pass",
      "icon loads": "pass",
      "icon 512×512": "fail",
      "storage prefixed": "pass",
      "link home": "pass",
      "service worker scope": "pass",
    });
    assert.equal(game.passes, false);
    assert.equal(game.tickets.length, 1);
    const [ticket] = game.tickets;
    assert.equal(ticket.check, "icon 512×512");
    assert.equal(ticket.rule, 4);
    assert.match(ticket.whatToBuild, /\/secret-script-studio\/icon-512\.png/);
    assert.match(ticket.whatToBuild, said);
    assert.ok(ticket.acceptance.length > 0);
  }
});

test('a live page that doesn\'t load fails "live page" alone and drafts one ticket citing rule 1', () => {
  const facts = goodGame("glyph-mines");
  facts.page = { status: 404 };
  const [game] = readyCheck([facts]).games;
  assert.deepEqual(statuses(game), {
    "live page": "fail",
    "icon loads": "pass",
    "icon 512×512": "pass",
    "storage prefixed": "pass",
    "link home": "pass",
    "service worker scope": "pass",
  });
  assert.equal(game.tickets.length, 1);
  const [ticket] = game.tickets;
  assert.equal(ticket.check, "live page");
  assert.equal(ticket.rule, 1);
  assert.match(ticket.whatToBuild, /\/glyph-mines\//);
  assert.match(ticket.whatToBuild, /404/);
  assert.ok(ticket.acceptance.length > 0);
});

test("the verdict has one entry per Game, in the order given", () => {
  const verdict = readyCheck([goodGame("doodle-monsters"), goodGame("secret-script-studio")]);
  assert.deepEqual(
    verdict.games.map((g) => g.slug),
    ["doodle-monsters", "secret-script-studio"],
  );
});

test('unprefixed storage fails "storage prefixed" alone and drafts one ticket citing rule 2 that names it', () => {
  for (const kind of ["indexedDB", "localStorage", "cache"]) {
    const facts = goodGame();
    facts.source.storage.push({ kind, name: "zoo", file: "src/zoo.ts", line: 9 });
    const [game] = readyCheck([facts]).games;
    assert.deepEqual(statuses(game), {
      "live page": "pass",
      "icon loads": "pass",
      "icon 512×512": "pass",
      "storage prefixed": "fail",
      "link home": "pass",
      "service worker scope": "pass",
    });
    assert.equal(game.tickets.length, 1);
    const [ticket] = game.tickets;
    assert.equal(ticket.check, "storage prefixed");
    assert.equal(ticket.rule, 2);
    assert.match(ticket.whatToBuild, /"zoo"/);
    assert.match(ticket.whatToBuild, /src\/zoo\.ts:9/);
    assert.match(ticket.whatToBuild, /doodle-monsters/);
    assert.ok(ticket.acceptance.length > 0);
  }
});

test('a storage name the source builds in a way the check can\'t read fails "storage prefixed"', () => {
  const facts = goodGame();
  facts.source.storage.push({ kind: "localStorage", name: null, expression: "keyFor(id)", file: "src/a.ts", line: 2 });
  const [game] = readyCheck([facts]).games;
  assert.equal(statuses(game)["storage prefixed"], "fail");
  assert.match(game.tickets[0].whatToBuild, /keyFor\(id\)/);
});

test("an unprefixed storage name on the exception list for that Game passes", () => {
  const facts = goodGame();
  facts.source.storage.push({ kind: "indexedDB", name: "night1-test", file: "src/night1/main.ts", line: 109 });
  const exceptions = [{ slug: "doodle-monsters", name: "night1-test", why: "Night 1 test page" }];
  const [game] = readyCheck([facts], { exceptions }).games;
  assert.equal(statuses(game)["storage prefixed"], "pass");
  assert.equal(game.passes, true);
});

test("an exception listed for another Game doesn't excuse the name", () => {
  const facts = goodGame("secret-script-studio");
  facts.source.storage.push({ kind: "indexedDB", name: "night1-test", file: "src/x.ts", line: 1 });
  const exceptions = [{ slug: "doodle-monsters", name: "night1-test", why: "Night 1 test page" }];
  const [game] = readyCheck([facts], { exceptions }).games;
  assert.equal(statuses(game)["storage prefixed"], "fail");
});

test('a Game with no link to the site root fails "link home" alone and drafts one ticket citing rule 5', () => {
  const facts = goodGame("secret-script-studio");
  facts.source.linksHome = [];
  const [game] = readyCheck([facts]).games;
  assert.deepEqual(statuses(game), {
    "live page": "pass",
    "icon loads": "pass",
    "icon 512×512": "pass",
    "storage prefixed": "pass",
    "link home": "fail",
    "service worker scope": "pass",
  });
  assert.equal(game.passes, false);
  assert.equal(game.tickets.length, 1);
  const [ticket] = game.tickets;
  assert.equal(ticket.check, "link home");
  assert.equal(ticket.rule, 5);
  assert.match(ticket.title, /house button/i);
  assert.ok(ticket.acceptance.length > 0);
});

test('a service worker registered at the site root fails "service worker scope" alone and drafts one ticket citing rule 3', () => {
  const facts = goodGame("secret-script-studio");
  facts.source.serviceWorkers = [{ file: "src/main.ts", line: 53, scope: "/" }];
  const [game] = readyCheck([facts]).games;
  assert.deepEqual(statuses(game), {
    "live page": "pass",
    "icon loads": "pass",
    "icon 512×512": "pass",
    "storage prefixed": "pass",
    "link home": "pass",
    "service worker scope": "fail",
  });
  assert.equal(game.passes, false);
  assert.equal(game.tickets.length, 1);
  const [ticket] = game.tickets;
  assert.equal(ticket.check, "service worker scope");
  assert.equal(ticket.rule, 3);
  assert.match(ticket.whatToBuild, /src\/main\.ts:53/);
  assert.match(ticket.whatToBuild, /\/secret-script-studio\//);
  assert.ok(ticket.acceptance.length > 0);
});

test("a service worker scoped outside the Game's own path, or unreadable, fails \"service worker scope\"", () => {
  for (const scope of ["/doodle-monsters/", "/secret-script-studio-old/", null]) {
    const facts = goodGame("secret-script-studio");
    facts.source.serviceWorkers.push({ file: "src/sw.ts", line: 4, scope });
    const [game] = readyCheck([facts]).games;
    assert.equal(statuses(game)["service worker scope"], "fail", String(scope));
  }
});

test('a Game with no service worker passes "service worker scope"', () => {
  const facts = goodGame();
  facts.source.serviceWorkers = [];
  const [game] = readyCheck([facts]).games;
  assert.equal(statuses(game)["service worker scope"], "pass");
  assert.equal(game.passes, true);
});
