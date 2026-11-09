// Fact gathering for the Ready check (thin, not unit-tested): fetches a Game's
// live page and Tile icon from GitHub Pages, and reads its source from its
// local repo (gather-source.js). Node built-ins only. Read-only.

import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { gatherSource } from "./gather-source.js";

const SITE = "https://trevordobrinska.github.io";

// Each Game's local repo lives at Projects\<slug>\ in the home folder (a fixed
// place, so a run from an Arcade worktree still finds them).
const PROJECTS = join(homedir(), "Projects");

// The starter (in this repo, next to SUITE-RULES.md) and the slug placeholder
// that NEW-GAME.md replaces when a Game is copied from it.
export const STARTER = {
  folder: fileURLToPath(new URL("../../starter/", import.meta.url)),
  slug: "game-slug",
};

// Facts about one Game, in the shape check.js documents. The Game's source is
// read from `folder` (default Projects\<slug>\); with no such folder, `source`
// and `git` are null. With `localOnly`, nothing is fetched and git isn't read:
// the page is { status: null }, the icon is the folder's public/icon-512.png,
// and `git` is left out (used for the starter).
export async function gatherFacts(slug, { folder = join(PROJECTS, slug), localOnly = false } = {}) {
  const source = existsSync(folder) ? gatherSource(folder, slug) : null;
  if (localOnly) return { slug, page: { status: null }, icon: localIcon(folder), source };
  const root = SITE + "/" + slug + "/";
  const page = await fetch(root);
  const icon = await fetch(root + "icon-512.png");
  const iconBytes = icon.ok ? Buffer.from(await icon.arrayBuffer()) : null;
  return {
    slug,
    page: { status: page.status },
    icon: { status: icon.status, ...iconFacts(iconBytes) },
    source,
    git: gitFacts(folder),
  };
}

// The Tile icon a folder would publish (Vite copies public/ to the build root):
// { status, png, sha256 }. The CLI passes the starter's as the placeholder.
export function localIcon(folder) {
  const path = join(folder, "public", "icon-512.png");
  if (!existsSync(path)) return { status: 404, png: null, sha256: null };
  return { status: 200, ...iconFacts(readFileSync(path)) };
}

function iconFacts(bytes) {
  if (bytes === null) return { png: null, sha256: null };
  return { png: pngSize(bytes), sha256: createHash("sha256").update(bytes).digest("hex") };
}

// Git state of a Game's local repo, or null if there isn't one. Read-only git
// commands only: no fetch, so "unpushed" is against the last-known remote.
// Each lookup stands alone: one that fails (no commits yet, an upstream that's
// gone, no main or master) is noted in `problems` and the rest still run.
function gitFacts(dir) {
  if (!existsSync(join(dir, ".git"))) return null;
  const problems = [];
  // The command's output, or null (noting `problem`) if git refused it.
  const git = (problem, ...args) => {
    try {
      return execFileSync("git", ["-C", dir, ...args], { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim();
    } catch {
      if (problem) problems.push(problem);
      return null;
    }
  };
  const lines = (text) => (text ? text.split("\n") : []);
  const ahead = (from, to, problem) => {
    const count = git(problem, "rev-list", "--count", from + ".." + to);
    return count === null ? null : Number(count);
  };

  const defaultBranch = defaultBranchOf(git);
  if (defaultBranch === null) problems.push("no default branch found (origin/HEAD, main or master), so unmerged work isn't listed");

  const branches = lines(git("couldn't list its branches", "for-each-ref", "refs/heads", "--format=%(refname:short) %(upstream:short)"))
    .map((line) => {
      const [name, upstream] = line.split(" ");
      return { name, upstream };
    });

  const unmergedBranches = defaultBranch === null ? [] : branches
    .filter((b) => b.name !== defaultBranch)
    .map((b) => ({ name: b.name, commits: ahead(defaultBranch, b.name, "couldn't compare " + b.name + " with " + defaultBranch) }))
    .filter((b) => b.commits > 0);

  const unpushed = branches
    .filter((b) => b.upstream)
    .map((b) => ({
      branch: b.name,
      commits: ahead(b.upstream, b.name, "upstream " + b.upstream + " of " + b.name + " is missing (gone from the remote?)"),
    }))
    .filter((u) => u.commits > 0);

  const untracked = lines(git("couldn't list untracked files", "ls-files", "--others", "--exclude-standard"));

  // The first entry of `worktree list` is the repo itself, not an extra one.
  const worktrees = (git("couldn't list its worktrees", "worktree", "list", "--porcelain") || "")
    .split(/\n\s*\n/)
    .slice(1)
    .map((block) => {
      const field = (key) => (block.match(new RegExp("^" + key + " (.*)$", "m")) || [])[1];
      const ref = field("branch");
      const branch = ref ? ref.replace(/^refs\/heads\//, "") : "detached";
      const path = field("worktree");
      const merged = defaultBranch === null ? null : ahead(defaultBranch, field("HEAD"), "couldn't compare worktree " + path + " with " + defaultBranch);
      return { path, branch, merged: merged === 0 };
    });

  return { defaultBranch, unmergedBranches, unpushed, untracked, worktrees, problems };
}

// The default branch: origin/HEAD's, else main, else master, as long as it is
// a local branch; null if none is.
function defaultBranchOf(git) {
  const remote = git(null, "symbolic-ref", "--short", "refs/remotes/origin/HEAD");
  const candidates = [remote && remote.replace(/^origin\//, ""), "main", "master"].filter(Boolean);
  return candidates.find((name) => git(null, "rev-parse", "--verify", "--quiet", "refs/heads/" + name) !== null) ?? null;
}

// Width and height from a PNG's IHDR chunk, or null if the bytes aren't a PNG
// (read the way test/manifest.test.js does).
function pngSize(bytes) {
  if (bytes.length < 24 || bytes.toString("hex", 0, 8) !== "89504e470d0a1a0a") return null;
  if (bytes.toString("ascii", 12, 16) !== "IHDR") return null;
  return { width: bytes.readUInt32BE(16), height: bytes.readUInt32BE(20) };
}
