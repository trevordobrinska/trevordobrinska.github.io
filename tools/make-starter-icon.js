// One-off generator for the starter's placeholder Tile icon: a grey
// checkerboard crossed out in magenta, so nobody mistakes it for real Tile art.
// Uses only Node built-ins. The PNG it writes is committed; rerun only to
// change the look (the Ready check flags whatever bytes are committed):
//   node tools/make-starter-icon.js
import { writeFileSync } from "node:fs";
import { deflateSync } from "node:zlib";

const SIZE = 512;
const light = [0xdd, 0xdd, 0xdd];
const dark = [0xaa, 0xaa, 0xaa];
const magenta = [0xff, 0x00, 0xcc];
const SQUARE = 64; // checkerboard squares, px
const STROKE = 28; // half-width of each stroke of the X, px

function colorAt(x, y) {
  // Distance to each diagonal of the square.
  const onX = Math.abs(x - y) / Math.SQRT2 <= STROKE || Math.abs(x + y - SIZE) / Math.SQRT2 <= STROKE;
  const onFrame = x < STROKE || y < STROKE || x >= SIZE - STROKE || y >= SIZE - STROKE;
  if (onX || onFrame) return magenta;
  return (Math.floor(x / SQUARE) + Math.floor(y / SQUARE)) % 2 ? dark : light;
}

function render() {
  const rows = [];
  for (let y = 0; y < SIZE; y++) {
    const row = Buffer.alloc(1 + SIZE * 3); // filter byte 0, then RGB
    for (let x = 0; x < SIZE; x++) {
      const [r, g, b] = colorAt(x + 0.5, y + 0.5);
      row[1 + x * 3] = r;
      row[2 + x * 3] = g;
      row[3 + x * 3] = b;
    }
    rows.push(row);
  }
  return png(Buffer.concat(rows));
}

function png(raw) {
  const header = Buffer.alloc(13);
  header.writeUInt32BE(SIZE, 0);
  header.writeUInt32BE(SIZE, 4);
  header[8] = 8; // bit depth
  header[9] = 2; // RGB
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

writeFileSync(new URL("../starter/public/icon-512.png", import.meta.url), render());
