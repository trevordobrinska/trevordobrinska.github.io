// Report printing for the Ready check (thin, not unit-tested): turns a verdict
// into Markdown for the terminal. Grid first, then ticket drafts, then "for
// you", then the manual tablet list.

const MARK = { pass: "pass", fail: "FAIL", skip: "-" };

export function report(verdict) {
  const lines = ["# Ready check", ""];

  const names = verdict.games.length ? verdict.games[0].checks.map((c) => c.name) : [];
  lines.push("| Game | " + names.join(" | ") + " | passes |");
  lines.push("|" + " --- |".repeat(names.length + 2));
  verdict.games.forEach((game) => {
    const cells = game.checks.map((c) => MARK[c.status]);
    lines.push("| " + game.slug + " | " + cells.join(" | ") + " | " + (game.passes ? "yes" : "no") + " |");
  });
  lines.push("", "pass = meets the check, FAIL = breaks it, - = not judged (a check it needs didn't pass, or its facts weren't gathered).");
  lines.push("Passing is not Ready: Ready is still Dad's call.", "");

  const drafts = verdict.games.flatMap((game) => game.tickets.map((t) => ({ slug: game.slug, ...t })));
  lines.push("## Ticket drafts (" + drafts.length + ")", "");
  if (drafts.length === 0) lines.push("None.", "");
  else lines.push("Skip any draft that an open ticket in the Game's repo already covers.", "");
  drafts.forEach((t) => {
    lines.push("### For " + t.slug + "/.scratch/arcade/issues/NN-<ticket-name>.md", "");
    ticket(lines, t, "Ready check: \"" + t.check + "\" failed", "ready-for-agent");
  });

  lines.push("## For you", "");
  lines.push("Git housekeeping in each Game's repo. Never a failure, and never done by the check.", "");
  verdict.games.forEach((game) => {
    lines.push("### " + game.slug, "");
    if (game.forYou.length === 0) lines.push("Nothing open.");
    game.forYou.forEach((item) => lines.push("- [ ] " + item));
    lines.push("");
  });

  lines.push("## Tablet list", "");
  lines.push("For each Game, on the tablet, from the installed Arcade:", "");
  verdict.tabletList.forEach((item) => {
    lines.push("- [ ] **" + item.name + "** (rule " + item.rule + "): " + item.steps);
  });
  lines.push("", "If one fails, file this in that Game's .scratch/arcade/issues/NN-<ticket-name>.md:", "");
  verdict.tabletList.forEach((item) => {
    lines.push("### If \"" + item.name + "\" fails", "");
    ticket(lines, { rule: item.rule, ...item.ticket }, "tablet check: \"" + item.name + "\" failed", "ready-for-human");
  });

  return lines.join("\n");
}

// One ticket draft, in the Game's issue file format.
function ticket(lines, t, source, status) {
  lines.push("# NN: " + t.title, "");
  lines.push("**What to build:** " + t.whatToBuild, "");
  lines.push("**Suite rule:** " + t.rule + " (" + source + ")", "");
  lines.push("**Status:** " + status, "");
  t.acceptance.forEach((a) => lines.push("- [ ] " + a));
  lines.push("");
}
