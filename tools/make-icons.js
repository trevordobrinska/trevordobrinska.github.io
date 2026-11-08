// One-off generator for the Arcade's own icons: a joystick on the page's
// night-purple background. Uses only Node built-ins, so there's no build step.
// The PNGs it writes are committed; rerun only to change the look:
//   node tools/make-icons.js
import { writeFileSync } from "node:fs";
import { deflateSync } from "node:zlib";

const night = [0x1d, 0x1b, 0x3a];
const purple = [0x5a, 0x54, 0xa8];
const stick = [0xc9, 0xc6, 0xe8];
const yellow = [0xff, 0xcc, 0x00];
const red = [0xff, 0x5a, 0x5f];

// Shapes in unit coordinates (0..1), drawn in order, last one on top.
const joystick = [
  { color: purple, inside: (x, y) => roundRect(x, y, 0.22, 0.64, 0.78, 0.8, 0.08) },
  { color: stick, inside: (x, y) => x >= 0.465 && x <= 0.535 && y >= 0.36 && y <= 0.7 },
  { color: yellow, inside: (x, y) => circle(x, y, 0.5, 0.33, 0.13) },
  { color: red, inside: (x, y) => circle(x, y, 0.68, 0.56, 0.045) },
];

function circle(x, y, cx, cy, r) {
  return (x - cx) ** 2 + (y - cy) ** 2 <= r * r;
}

function roundRect(x, y, left, top, right, bottom, r) {
  if (x < left || x > right || y < top || y > bottom) return false;
  const cx = Math.min(Math.max(x, left + r), right - r);
  const cy = Math.min(Math.max(y, top + r), bottom - r);
  return circle(x, y, cx, cy, r);
}

// "any" icons get rounded corners; the maskable one fills the square and
// shrinks the joystick into the central safe zone (a circle of radius 0.4).
function sample(x, y, maskable) {
  const scale = maskable ? 0.8 : 1;
  if (!maskable && !roundRect(x, y, 0, 0, 1, 1, 0.18)) return null;
  const ux = 0.5 + (x - 0.5) / scale;
  const uy = 0.5 + (y - 0.5) / scale;
  let color = night;
  for (const shape of joystick) if (shape.inside(ux, uy)) color = shape.color;
  return color;
}

// 4x4 supersampling for smooth edges.
function render(size, maskable) {
  const n = 4;
  const rows = [];
  for (let py = 0; py < size; py++) {
    const row = Buffer.alloc(1 + size * 4); // filter byte 0, then RGBA
    for (let px = 0; px < size; px++) {
      let r = 0, g = 0, b = 0, a = 0;
      for (let sy = 0; sy < n; sy++) {
        for (let sx = 0; sx < n; sx++) {
          const c = sample((px + (sx + 0.5) / n) / size, (py + (sy + 0.5) / n) / size, maskable);
          if (!c) continue;
          r += c[0]; g += c[1]; b += c[2]; a++;
        }
      }
      const o = 1 + px * 4;
      if (a) {
        row[o] = Math.round(r / a);
        row[o + 1] = Math.round(g / a);
        row[o + 2] = Math.round(b / a);
      }
      row[o + 3] = Math.round((a / (n * n)) * 255);
    }
    rows.push(row);
  }
  return png(size, Buffer.concat(rows));
}

function png(size, raw) {
  const header = Buffer.alloc(13);
  header.writeUInt32BE(size, 0);
  header.writeUInt32BE(size, 4);
  header[8] = 8; // bit depth
  header[9] = 6; // RGBA
  return Buffer.concat([
    Buffer.from("89504e470d0a1a0a", "hex"),
    chunk("IHDR", header),
    chunk("IDAT", deflateSync(raw, { level: 9 })),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

function chunk(type, data) {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type, "ascii"), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body));
  return Buffer.concat([length, body, crc]);
}

function crc32(bytes) {
  let crc = 0xffffffff;
  for (const byte of bytes) {
    crc ^= byte;
    for (let k = 0; k < 8; k++) crc = crc & 1 ? (crc >>> 1) ^ 0xedb88320 : crc >>> 1;
  }
  return (crc ^ 0xffffffff) >>> 0;
}

const out = new URL("../icons/", import.meta.url);
writeFileSync(new URL("icon-192.png", out), render(192, false));
writeFileSync(new URL("icon-512.png", out), render(512, false));
writeFileSync(new URL("icon-maskable-512.png", out), render(512, true));
