// The Ready check: `node tools/ready-check.js <slug>` checks one Game against
// the suite rules; with no slug it sweeps every Game in the Games list (all
// states). It prints a pass/fail grid, a ticket draft per failure, a "for you"
// list of git housekeeping for Dad, and the manual tablet list.
// Read-only: it never writes into a Game's repo. An Arcade session files the
// drafts as tickets in the Game's .scratch/arcade/issues/.

import { games } from "../games.js";
import { readyCheck } from "./ready-check/check.js";
import { gatherFacts, localIcon, STARTER } from "./ready-check/gather.js";
import { report } from "./ready-check/report.js";
import { readFileSync } from "node:fs";

// Accepted rule 2 exceptions (unprefixed storage names a Game may keep).
const exceptions = JSON.parse(readFileSync(new URL("./ready-check/exceptions.json", import.meta.url), "utf8"));

const allSlugs = [...new Set(games.map((g) => g.slug))];
const args = process.argv.slice(2);
const slugs = args.length ? args : allSlugs;

const facts = [];
for (const slug of slugs) facts.push(await gatherFacts(slug));
// A Game still publishing the starter's placeholder icon isn't Ready.
const placeholderIcons = [localIcon(STARTER.folder).sha256];
const verdict = readyCheck(facts, { exceptions, placeholderIcons, slugs: allSlugs });
console.log(report(verdict));
process.exitCode = verdict.games.every((g) => g.passes) ? 0 : 1;
