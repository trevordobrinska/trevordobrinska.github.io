// Source fact gathering for the Ready check (thin, not unit-tested): reads a
// Game's source folder and finds its saved-data names, links home and service
// worker registrations, in the `source` shape check.js documents. Read-only.
// Node built-ins only.
//
// It takes a folder path, so it works on a Game's local repo
// (Projects\<slug>\) or on any other folder, e.g. the starter.
//
// This is a text scan, not a JavaScript parser. Names it can read: string
// literals, `const NAME = "..."` in the same file, and `+` joins of those
// (a join with something it can't read keeps the readable start, e.g.
// VERDICT_KEY + id gives "night1:verdict:"). Anything else is reported as
// unreadable, which the check fails, so write names the plain way.

import { readdirSync, readFileSync } from "node:fs";
import { join, relative, extname } from "node:path";

const SOURCE_EXTENSIONS = new Set([".js", ".mjs", ".cjs", ".ts", ".mts", ".tsx", ".jsx", ".html"]);
// Not shipped to the kids: dependencies, build output, tooling and tests.
const SKIP_DIRS = new Set(["node_modules", "dist", "build", "coverage", "test", "tests", "__tests__"]);
const SKIP_FILE = /\.(test|spec)\.[a-z]+$/;

// Where the scan finds saved-data names: the first argument of these calls.
const STORAGE_CALLS = [
  { kind: "indexedDB", pattern: /\bindexedDB\s*\.\s*(?:open|deleteDatabase)\s*\(/g },
  { kind: "indexedDB", pattern: /\bopenDB\s*\(/g },
  { kind: "localStorage", pattern: /\blocalStorage\s*\.\s*(?:getItem|setItem|removeItem)\s*\(/g },
  { kind: "cache", pattern: /\bcaches\s*\.\s*(?:open|delete|has)\s*\(/g },
];

const Q = "[\"'`]";
const LINK_HOME = new RegExp(
  [
    "href\\s*[=:]\\s*" + Q + "(?:/|https://trevordobrinska\\.github\\.io/?)" + Q,
    "location(?:\\.href)?\\s*=\\s*" + Q + "/" + Q,
    "location\\.(?:assign|replace)\\(\\s*" + Q + "/" + Q,
  ].join("|"),
  "g",
);

// Whitespace and comments may sit between `navigator.serviceWorker` and
// `.register(` in a chained call.
const SW_REGISTER = /\bserviceWorker(?:\s|\/\/[^\n]*\n|\/\*[\s\S]*?\*\/)*\.\s*register\s*\(/g;

// Facts about the source in `folder`, for the Game whose slug is `slug`.
export function gatherSource(folder, slug) {
  const storage = [];
  const linksHome = [];
  const serviceWorkers = [];
  const seenNames = new Set();

  for (const path of sourceFiles(folder)) {
    const file = relative(folder, path).split("\\").join("/");
    const text = readFileSync(path, "utf8");
    const constants = readConstants(text);
    const lineAt = (index) => text.slice(0, index).split("\n").length;

    for (const { kind, pattern } of STORAGE_CALLS) {
      for (const match of text.matchAll(pattern)) {
        const [first] = callArguments(text, match.index + match[0].length);
        const value = readString(first, constants);
        const name = value.text === "" ? null : value.text;
        const key = kind + "\0" + name;
        if (name !== null && seenNames.has(key)) continue;
        seenNames.add(key);
        const found = { kind, name, file, line: lineAt(match.index) };
        if (name === null) found.expression = first;
        storage.push(found);
      }
    }

    for (const match of text.matchAll(LINK_HOME)) {
      linksHome.push({ file, line: lineAt(match.index) });
    }

    for (const match of text.matchAll(SW_REGISTER)) {
      const [script, options] = callArguments(text, match.index + match[0].length);
      serviceWorkers.push({ file, line: lineAt(match.index), scope: workerScope(script, options, constants, slug) });
    }
  }

  return { storage, linksHome, serviceWorkers };
}

function* sourceFiles(folder) {
  for (const entry of readdirSync(folder, { withFileTypes: true })) {
    if (entry.name.startsWith(".")) continue; // .git, .claude, .scratch, ...
    const path = join(folder, entry.name);
    if (entry.isDirectory()) {
      if (!SKIP_DIRS.has(entry.name)) yield* sourceFiles(path);
    } else if (SOURCE_EXTENSIONS.has(extname(entry.name)) && !SKIP_FILE.test(entry.name)) {
      yield path;
    }
  }
}

// `const NAME = <expression>;` in the file, as name -> expression text.
function readConstants(text) {
  const constants = new Map();
  for (const m of text.matchAll(/\b(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*(?::\s*[\w<>[\]|\s]+)?=\s*/g)) {
    const [expression] = callArguments(text, m.index + m[0].length, true);
    if (!constants.has(m[1])) constants.set(m[1], expression);
  }
  return constants;
}

// The comma-separated arguments of a call whose "(" ends just before `start`,
// as trimmed text. With `statement`, reads one expression up to ";" or a line
// end at depth 0 instead.
function callArguments(text, start, statement = false) {
  const args = [];
  let depth = 0;
  let quote = null;
  let current = "";
  for (let i = start; i < text.length; i++) {
    const c = text[i];
    if (quote) {
      current += c;
      if (c === "\\") current += text[++i] ?? "";
      else if (c === quote) quote = null;
      continue;
    }
    if (c === '"' || c === "'" || c === "`") quote = c;
    else if ("([{".includes(c)) depth++;
    else if (")]}".includes(c)) {
      if (depth === 0) break;
      depth--;
    } else if (depth === 0 && c === ",") {
      if (statement) break;
      args.push(current.trim());
      current = "";
      continue;
    } else if (statement && depth === 0 && (c === ";" || c === "\n")) break;
    current += c;
  }
  args.push(current.trim());
  return args;
}

// What a string expression is known to say: { text, complete }. `text` is
// the readable start; `complete` is false when part of it couldn't be read.
function readString(expression, constants, seen = new Set()) {
  let text = "";
  for (const part of splitTopLevel(expression, "+")) {
    const value = readPart(part, constants, seen);
    text += value.text;
    if (!value.complete) return { text, complete: false };
  }
  return { text, complete: true };
}

function readPart(part, constants, seen) {
  const literal = part.match(/^(["'])((?:\\.|(?!\1).)*)\1$/s);
  if (literal) return { text: literal[2], complete: true };
  const template = part.match(/^`([^`]*)`$/s);
  if (template) {
    const at = template[1].indexOf("${");
    return at === -1
      ? { text: template[1], complete: true }
      : { text: template[1].slice(0, at), complete: false };
  }
  if (/^import\.meta\.env\.BASE_URL$/.test(part)) return { text: "./", complete: true };
  if (constants.has(part) && !seen.has(part)) {
    return readString(constants.get(part), constants, new Set([...seen, part]));
  }
  return { text: "", complete: false };
}

function splitTopLevel(expression, separator) {
  const parts = [];
  let depth = 0;
  let quote = null;
  let current = "";
  for (let i = 0; i < expression.length; i++) {
    const c = expression[i];
    if (quote) {
      current += c;
      if (c === "\\") current += expression[++i] ?? "";
      else if (c === quote) quote = null;
      continue;
    }
    if (c === '"' || c === "'" || c === "`") quote = c;
    else if ("([{".includes(c)) depth++;
    else if (")]}".includes(c)) depth--;
    else if (depth === 0 && c === separator) {
      parts.push(current.trim());
      current = "";
      continue;
    }
    current += c;
  }
  parts.push(current.trim());
  return parts;
}

// The site path a registration can control, or null if it can't be read.
// Relative URLs are taken against the Game's own path /<slug>/, as Vite's
// relative base makes them at runtime.
function workerScope(script, options, constants, slug) {
  const page = "https://site.invalid/" + slug + "/";
  if (options) {
    const scope = options.match(/\bscope\s*:\s*([^,}]+)/);
    if (scope) {
      const value = readString(scope[1].trim(), constants);
      return value.complete ? new URL(value.text, page).pathname : null;
    }
  }
  const url = scriptUrl(script, constants, page);
  return url === null ? null : url.pathname.replace(/[^/]*$/, "");
}

// The worker script's URL: a string, a constant, or new URL(string, base).
function scriptUrl(expression, constants, page, seen = new Set()) {
  const newUrl = expression.match(/^new\s+URL\s*\(/);
  if (newUrl) {
    const [path, base] = callArguments(expression, newUrl[0].length);
    const pathValue = readString(path, constants);
    if (!pathValue.complete) return null;
    // A base the scan can't read (document.baseURI, a link's href) is taken
    // as the Game's own page; a readable one is used.
    const baseValue = base ? readString(base, constants) : { complete: false };
    const baseUrl = baseValue.complete ? new URL(baseValue.text, page) : new URL(page);
    return new URL(pathValue.text, baseUrl);
  }
  if (constants.has(expression) && !seen.has(expression)) {
    return scriptUrl(constants.get(expression), constants, page, new Set([...seen, expression]));
  }
  const value = readString(expression, constants);
  return value.complete ? new URL(value.text, page) : null;
}
