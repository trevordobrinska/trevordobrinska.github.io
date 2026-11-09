// Report printing for the Ready check (thin, not unit-tested): turns a verdict
// into Markdown for the terminal. Grid first, then ticket drafts.

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

  return lines.join("\n");
}
