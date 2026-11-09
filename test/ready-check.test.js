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

test("git housekeeping in a Game's repo becomes \"for you\" items and never fails a check", () => {
  const facts = goodGame();
  facts.git = {
    defaultBranch: "main",
    unmergedBranches: [{ name: "worktree-night-1-results", commits: 1 }],
    unpushed: [{ branch: "main", commits: 2 }],
    untracked: [".scratch/arcade/handoff.md"],
    worktrees: [
      { path: "C:/Projects/doodle-monsters/.claude/worktrees/night-1", branch: "worktree-night-1-results", merged: false },
      { path: "C:/Projects/doodle-monsters/.claude/worktrees/old", branch: "worktree-old", merged: true },
    ],
  };
  const [game] = readyCheck([facts]).games;
  assert.equal(game.passes, true);
  assert.deepEqual(game.tickets, []);
  assert.deepEqual(game.forYou, [
    "Merge worktree-night-1-results (1 commit) into main",
    "Push 2 commits on main",
    "Commit or delete untracked .scratch/arcade/handoff.md",
    "Merge or remove worktree C:/Projects/doodle-monsters/.claude/worktrees/night-1 (worktree-night-1-results, not merged)",
    "Remove merged worktree C:/Projects/doodle-monsters/.claude/worktrees/old (worktree-old)",
  ]);
});

test('a Game with no local repo gets one "for you" item saying so, and still passes', () => {
  const facts = goodGame("glyph-mines");
  facts.git = null;
  const [game] = readyCheck([facts]).games;
  assert.equal(game.passes, true);
  assert.equal(game.forYou.length, 1);
  assert.match(game.forYou[0], /no local repo/i);
});

test("a sweep returns one row per Game and one manual tablet list for house button and Back", () => {
  const slugs = ["doodle-monsters", "secret-script-studio", "glyph-mines"];
  const verdict = readyCheck(slugs.map((slug) => goodGame(slug)));
  assert.deepEqual(verdict.games.map((g) => g.slug), slugs);
  assert.equal(verdict.tabletList.length, 2);
  const [house, back] = verdict.tabletList;
  assert.match(house.name, /house button/i);
  assert.match(back.name, /Back/);
  for (const item of verdict.tabletList) {
    assert.equal(item.rule, 5);
    assert.match(item.steps, /Arcade/);
    assert.ok(item.ticket.title && item.ticket.whatToBuild && item.ticket.acceptance.length > 0);
  }
});
