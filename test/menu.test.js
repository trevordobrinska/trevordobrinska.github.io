import { test } from "node:test";
import assert from "node:assert/strict";
import { menu } from "../menu.js";
import { games } from "../games.js";

test("Tiles are Ready, then Test, then Coming-soon, keeping list order within each group", () => {
  const tiles = menu([
    { slug: "c1", name: "C1", state: "coming-soon" },
    { slug: "r1", name: "R1", state: "ready" },
    { slug: "t1", name: "T1", state: "test", path: "a/" },
    { slug: "c2", name: "C2", state: "coming-soon" },
    { slug: "r2", name: "R2", state: "ready" },
    { slug: "t2", name: "T2", state: "test", path: "b.html" },
  ]);
  assert.deepEqual(
    tiles.map((t) => t.name),
    ["R1", "R2", "T1", "T2", "C1", "C2"],
  );
});

test("Ready links to the Game's root, Test links below it, Coming-soon has no link", () => {
  const tiles = menu([
    { slug: "doodle-monsters", name: "Doodle Monsters", state: "ready" },
    { slug: "doodle-monsters", name: "Night 1", state: "test", path: "night1/" },
    { slug: "secret-script-studio", name: "Secret Script Studio", state: "coming-soon" },
  ]);
  assert.deepEqual(
    tiles.map((t) => t.href),
    ["/doodle-monsters/", "/doodle-monsters/night1/", null],
  );
});

test("every Tile's icon comes from the Game's own path", () => {
  const tiles = menu([
    { slug: "doodle-monsters", name: "Doodle Monsters", state: "ready" },
    { slug: "doodle-monsters", name: "Night 1", state: "test", path: "tablet-test.html" },
    { slug: "secret-script-studio", name: "Secret Script Studio", state: "coming-soon" },
  ]);
  assert.deepEqual(
    tiles.map((t) => t.icon),
    [
      "/doodle-monsters/icon-512.png",
      "/doodle-monsters/icon-512.png",
      "/secret-script-studio/icon-512.png",
    ],
  );
});

test("rejects two Ready entries with the same slug", () => {
  assert.throws(
    () =>
      menu([
        { slug: "doodle-monsters", name: "Doodle Monsters", state: "ready" },
        { slug: "doodle-monsters", name: "Doodle Monsters again", state: "ready" },
      ]),
    /duplicate slug "doodle-monsters"/,
  );
});

test("rejects a Ready and a Coming-soon entry with the same slug", () => {
  assert.throws(
    () =>
      menu([
        { slug: "doodle-monsters", name: "Doodle Monsters", state: "coming-soon" },
        { slug: "doodle-monsters", name: "Doodle Monsters", state: "ready" },
      ]),
    /duplicate slug "doodle-monsters"/,
  );
});

test("rejects an empty or missing name", () => {
  for (const name of ["", "   ", undefined]) {
    assert.throws(
      () => menu([{ slug: "doodle-monsters", name, state: "ready" }]),
      /name/,
      `name ${JSON.stringify(name)} should be rejected`,
    );
  }
});

test("rejects an unknown state", () => {
  assert.throws(
    () => menu([{ slug: "doodle-monsters", name: "Doodle Monsters", state: "live" }]),
    /unknown state "live"/,
  );
});

test("rejects a Test entry without a path", () => {
  for (const path of [undefined, ""]) {
    assert.throws(
      () => menu([{ slug: "doodle-monsters", name: "Night 1", state: "test", path }]),
      /path/,
    );
  }
});

test("a Test entry may share its slug with a Coming-soon or Ready entry", () => {
  const tiles = menu([
    { slug: "doodle-monsters", name: "Doodle Monsters", state: "coming-soon" },
    { slug: "doodle-monsters", name: "Night 1", state: "test", path: "night1/" },
    { slug: "secret-script-studio", name: "Secret Script Studio", state: "ready" },
    { slug: "secret-script-studio", name: "SSS test", state: "test", path: "tablet-test.html" },
  ]);
  assert.equal(tiles.length, 4);
});

test("the real launch Games list is valid: Doodle Monsters and Secret Script Studio, both Coming-soon", () => {
  const tiles = menu(games);
  assert.deepEqual(
    tiles.map((t) => [t.slug, t.state, t.href]),
    [
      ["doodle-monsters", "coming-soon", null],
      ["secret-script-studio", "coming-soon", null],
    ],
  );
});

test("each Tile says which kind it is", () => {
  const tiles = menu([
    { slug: "a", name: "A", state: "coming-soon" },
    { slug: "b", name: "B", state: "test", path: "x/" },
    { slug: "c", name: "C", state: "ready" },
  ]);
  assert.deepEqual(
    tiles.map((t) => t.state),
    ["ready", "test", "coming-soon"],
  );
});
