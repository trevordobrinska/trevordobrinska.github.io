// The Ready check: `node tools/ready-check.js <slug>` checks one Game against
// the suite rules and prints a pass/fail grid, then a ticket draft per failure.
// Read-only: it never writes into a Game's repo. An Arcade session files the
// drafts as tickets in the Game's .scratch/arcade/issues/.

import { readyCheck } from "./ready-check/check.js";
import { gatherFacts } from "./ready-check/gather.js";
import { report } from "./ready-check/report.js";

const slugs = process.argv.slice(2);
if (slugs.length === 0) {
  console.error("Usage: node tools/ready-check.js <slug> [<slug> ...]");
  process.exit(2);
}

const facts = [];
for (const slug of slugs) facts.push(await gatherFacts(slug));
const verdict = readyCheck(facts);
console.log(report(verdict));
process.exitCode = verdict.games.every((g) => g.passes) ? 0 : 1;
