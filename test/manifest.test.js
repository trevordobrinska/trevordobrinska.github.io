import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const root = new URL("../", import.meta.url);
const manifest = JSON.parse(readFileSync(new URL("manifest.webmanifest", root), "utf8"));

// Width and height from a PNG's IHDR chunk, after checking the signature.
function pngSize(path) {
  const bytes = readFileSync(new URL(path.replace(/^\//, ""), root));
  assert.equal(bytes.toString("hex", 0, 8), "89504e470d0a1a0a", path + " is not a PNG");
  return { width: bytes.readUInt32BE(16), height: bytes.readUInt32BE(20) };
}

test("the manifest names the Arcade and opens it fullscreen at the site root", () => {
  assert.equal(manifest.name, "Dobrinska Arcade");
  assert.equal(manifest.short_name, "Dobrinska Arcade");
  assert.equal(manifest.display, "fullscreen");
  assert.equal(manifest.start_url, "/");
  assert.equal(manifest.scope, "/");
  assert.match(manifest.background_color, /^#[0-9a-f]{6}$/i);
  assert.match(manifest.theme_color, /^#[0-9a-f]{6}$/i);
});

test("the manifest has 192, 512 and maskable 512 icons, each a PNG of the size it claims", () => {
  const icons = manifest.icons.map((icon) => {
    const { width, height } = pngSize(icon.src);
    assert.equal(icon.type, "image/png");
    assert.equal(icon.sizes, width + "x" + height, icon.src);
    return icon.sizes + " " + (icon.purpose || "any");
  });
  assert.deepEqual(icons.sort(), ["192x192 any", "512x512 any", "512x512 maskable"]);
});
