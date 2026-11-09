import { test } from "node:test";
import assert from "node:assert/strict";
import { readyCheck } from "../tools/ready-check/check.js";

// Facts about a Game that meets every check. Each test breaks one thing.
function goodGame(slug = "doodle-monsters") {
  return {
    slug,
    page: { status: 200 },
    icon: { status: 200, png: { width: 512, height: 512 } },
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
