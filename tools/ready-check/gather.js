// Fact gathering for the Ready check (thin, not unit-tested): fetches a Game's
// live page and Tile icon from GitHub Pages, and reads its source from its
// local repo (gather-source.js). Node built-ins only. Read-only.

import { join } from "node:path";
import { homedir } from "node:os";
import { gatherSource } from "./gather-source.js";

export const SITE = "https://trevordobrinska.github.io";

// Where the Games' local repos live: Projects\<slug>\.
export const PROJECTS = join(homedir(), "Projects");

// Facts about one Game, in the shape check.js documents.
export async function gatherFacts(slug, { projects = PROJECTS } = {}) {
  const source = gatherSource(join(projects, slug), slug);
  const root = SITE + "/" + slug + "/";
  const page = await fetch(root);
  const icon = await fetch(root + "icon-512.png");
  const iconBytes = icon.ok ? Buffer.from(await icon.arrayBuffer()) : null;
  return {
    slug,
    page: { status: page.status },
    icon: { status: icon.status, png: iconBytes && pngSize(iconBytes) },
    source,
  };
}

// Width and height from a PNG's IHDR chunk, or null if the bytes aren't a PNG
// (read the way test/manifest.test.js does).
export function pngSize(bytes) {
  if (bytes.length < 24 || bytes.toString("hex", 0, 8) !== "89504e470d0a1a0a") return null;
  if (bytes.toString("ascii", 12, 16) !== "IHDR") return null;
  return { width: bytes.readUInt32BE(16), height: bytes.readUInt32BE(20) };
}
