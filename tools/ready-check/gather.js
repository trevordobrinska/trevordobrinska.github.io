// Fact gathering for the Ready check (thin, not unit-tested): fetches a Game's
// live page and Tile icon from GitHub Pages. Node built-ins only.

export const SITE = "https://trevordobrinska.github.io";

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
  };
}

// Width and height from a PNG's IHDR chunk, or null if the bytes aren't a PNG
// (read the way test/manifest.test.js does).
export function pngSize(bytes) {
  if (bytes.length < 24 || bytes.toString("hex", 0, 8) !== "89504e470d0a1a0a") return null;
  if (bytes.toString("ascii", 12, 16) !== "IHDR") return null;
  return { width: bytes.readUInt32BE(16), height: bytes.readUInt32BE(20) };
}
