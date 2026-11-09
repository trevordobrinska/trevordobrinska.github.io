// The Ready check: `node tools/ready-check.js <slug>` checks one Game against
// the suite rules; with no slug it sweeps every Game in the Games list (all
// states). It prints a pass/fail grid, a ticket draft per failure, a "for you"
// list of git housekeeping for Dad, and the manual tablet list.
// Read-only: it never writes into a Game's repo. An Arcade session files the
// drafts as tickets in the Game's .scratch/arcade/issues/.

import { games } from "../games.js";
import { readyCheck } from "./ready-check/check.js";
import { gatherFacts } from "./ready-check/gather.js";
import { report } from "./ready-check/report.js";

const args = process.argv.slice(2);
const slugs = args.length ? args : [...new Set(games.map((g) => g.slug))];

const facts = [];
for (const slug of slugs) facts.push(await gatherFacts(slug));
const verdict = readyCheck(facts);
console.log(report(verdict));
process.exitCode = verdict.games.every((g) => g.passes) ? 0 : 1;
