// Fact gathering for the Ready check (thin, not unit-tested): fetches a Game's
// live page and Tile icon from GitHub Pages. Node built-ins only.

import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

export const SITE = "https://trevordobrinska.github.io";

// Each Game's local repo lives at Projects\<slug>\ in the home folder (a fixed
// place, so a run from an Arcade worktree still finds them).
export const PROJECTS = join(homedir(), "Projects");

// Facts about one Game, in the shape check.js documents.
export async function gatherFacts(slug) {
  const root = SITE + "/" + slug + "/";
  const page = await fetch(root);
  const icon = await fetch(root + "icon-512.png");
  const iconBytes = icon.ok ? Buffer.from(await icon.arrayBuffer()) : null;
  return {
    slug,
    page: { status: page.status },
    icon: { status: icon.status, png: iconBytes && pngSize(iconBytes) },
    git: gitFacts(join(PROJECTS, slug)),
  };
}

// Git state of a Game's local repo, or null if there isn't one. Read-only git
// commands only: no fetch, so "unpushed" is against the last-known remote.
export function gitFacts(dir) {
  if (!existsSync(join(dir, ".git"))) return null;
  const git = (...args) =>
    execFileSync("git", ["-C", dir, ...args], { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim();
  const lines = (text) => (text ? text.split("\n") : []);
  const ahead = (from, to) => Number(git("rev-list", "--count", from + ".." + to));

  const defaultBranch = defaultBranchOf(git);
  const branches = lines(git("for-each-ref", "refs/heads", "--format=%(refname:short) %(upstream:short)"))
    .map((line) => {
      const [name, upstream] = line.split(" ");
      return { name, upstream };
    });

  const unmergedBranches = branches
    .filter((b) => b.name !== defaultBranch)
    .map((b) => ({ name: b.name, commits: ahead(defaultBranch, b.name) }))
    .filter((b) => b.commits > 0);

  const unpushed = branches
    .filter((b) => b.upstream)
    .map((b) => ({ branch: b.name, commits: ahead(b.upstream, b.name) }))
    .filter((u) => u.commits > 0);

  const untracked = lines(git("ls-files", "--others", "--exclude-standard"));

  // The first entry of `worktree list` is the repo itself, not an extra one.
  const worktrees = git("worktree", "list", "--porcelain")
    .split(/\n\s*\n/)
    .slice(1)
    .map((block) => {
      const field = (key) => (block.match(new RegExp("^" + key + " (.*)$", "m")) || [])[1];
      const ref = field("branch");
      const branch = ref ? ref.replace(/^refs\/heads\//, "") : "detached";
      return { path: field("worktree"), branch, merged: ahead(defaultBranch, field("HEAD")) === 0 };
    });

  return { defaultBranch, unmergedBranches, unpushed, untracked, worktrees };
}

function defaultBranchOf(git) {
  try {
    return git("symbolic-ref", "--short", "refs/remotes/origin/HEAD").replace(/^origin\//, "");
  } catch {
    try {
      git("rev-parse", "--verify", "--quiet", "refs/heads/main");
      return "main";
    } catch {
      return "master";
    }
  }
}

// Width and height from a PNG's IHDR chunk, or null if the bytes aren't a PNG
// (read the way test/manifest.test.js does).
export function pngSize(bytes) {
  if (bytes.length < 24 || bytes.toString("hex", 0, 8) !== "89504e470d0a1a0a") return null;
  if (bytes.toString("ascii", 12, 16) !== "IHDR") return null;
  return { width: bytes.readUInt32BE(16), height: bytes.readUInt32BE(20) };
}
