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
  lines.push("", "pass = meets the check, FAIL = breaks it, - = not judged (a check it needs failed).");
  lines.push("Passing is not Ready: Ready is still Dad's call.", "");

  const drafts = verdict.games.flatMap((game) => game.tickets.map((t) => ({ slug: game.slug, ...t })));
  lines.push("## Ticket drafts (" + drafts.length + ")", "");
  if (drafts.length === 0) lines.push("None.", "");
  drafts.forEach((t) => {
    lines.push("### For " + t.slug + "/.scratch/arcade/issues/NN-<slug>.md", "");
    lines.push("# NN: " + t.title, "");
    lines.push("**What to build:** " + t.whatToBuild, "");
    lines.push("**Suite rule:** " + t.rule + " (Ready check: \"" + t.check + "\" failed)", "");
    lines.push("**Status:** ready-for-agent", "");
    t.acceptance.forEach((a) => lines.push("- [ ] " + a));
    lines.push("");
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
  lines.push("", "If one fails, file this in that Game's .scratch/arcade/issues/NN-<slug>.md:", "");
  verdict.tabletList.forEach((item) => {
    lines.push("### If \"" + item.name + "\" fails", "");
    lines.push("# NN: " + item.ticket.title, "");
    lines.push("**What to build:** " + item.ticket.whatToBuild, "");
    lines.push("**Suite rule:** " + item.rule + " (tablet check: \"" + item.name + "\" failed)", "");
    lines.push("**Status:** ready-for-human", "");
    item.ticket.acceptance.forEach((a) => lines.push("- [ ] " + a));
    lines.push("");
  });

  return lines.join("\n");
}
