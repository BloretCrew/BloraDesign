/**
 * Generate the official Lucide icon data tables from lucide-static (ISC).
 * Run via `pnpm --filter @bloret-crew/blora-design exec node scripts/gen-icons.mjs`
 * after bumping lucide-static.
 *
 * Two outputs are committed so the runtime keeps zero dependencies:
 *  - `icons.data.ts`       (BLORA_ICON_DATA)     — curated default set bundled with the core.
 *  - `icons-full.data.ts`  (BLORA_ICON_FULL_DATA) — every lucide icon, loaded on demand via
 *    `@bloret-crew/blora-design/icons-full` / `icons-full.global.js`. Once loaded, any lucide
 *    name works through `createBloraIcon` without a framework rebuild.
 */
import { readFileSync, readdirSync, writeFileSync, existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const packageRoot = resolve(__dirname, "..");
const lucideRoot = resolve(packageRoot, "node_modules", "lucide-static", "icons");
const curatedOut = resolve(packageRoot, "src", "core", "icons.data.ts");
const fullOut = resolve(packageRoot, "src", "core", "icons-full.data.ts");

// Stable public Blora name -> canonical Lucide icon (SVG file name).
const ICON_MAP = {
  "arrow-up": "arrow-up",
  ban: "ban",
  calendar: "calendar",
  camera: "camera",
  chart: "chart-bar",
  check: "check",
  "chevron-down": "chevron-down",
  "chevron-left": "chevron-left",
  "chevron-right": "chevron-right",
  "circle-alert": "circle-alert",
  "circle-check": "circle-check",
  "circle-x": "circle-x",
  clock: "clock",
  close: "x",
  copy: "copy",
  document: "file",
  "document-add": "file-plus",
  ellipsis: "ellipsis",
  eye: "eye",
  "eye-off": "eye-off",
  flame: "flame",
  folder: "folder",
  grip: "grip",
  heart: "heart",
  home: "home",
  image: "image",
  inbox: "inbox",
  info: "info",
  key: "key",
  mail: "mail",
  menu: "menu",
  message: "message-square",
  mic: "mic",
  minus: "minus",
  moon: "moon",
  palette: "palette",
  pencil: "pencil",
  phone: "phone",
  plus: "plus",
  "arrow-down-up": "arrow-down-up",
  "arrow-down": "arrow-down",
  search: "search",
  settings: "settings",
  share: "share",
  smile: "smile",
  sparkles: "sparkles",
  star: "star",
  sun: "sun",
  "thumbs-up": "thumbs-up",
  trash: "trash",
  "triangle-alert": "triangle-alert",
  upload: "upload",
  user: "user",
};

/**
 * Parse a lucide-static SVG into a list of { tag, attrs } nodes.
 * Supported tags mirror createBloraIcon's builder (circle | path | rect).
 */
function parseSvg(name, file) {
  const src = readFileSync(file, "utf8");
  const nodes = [];
  const re = /<(circle|path|rect|line|polyline|polygon|ellipse)\b([^>]*?)\/>/g;
  let m;
  while ((m = re.exec(src))) {
    const tag = m[1];
    const attrs = {};
    for (const attr of m[2].matchAll(/([a-zA-Z][a-zA-Z0-9-]*)="([^"]*)"/g)) {
      attrs[attr[1]] = attr[2];
    }
    // Keep only presentation-relevant attributes.
    const keep = {};
    for (const k of [
      "d",
      "cx",
      "cy",
      "r",
      "rx",
      "ry",
      "x",
      "y",
      "x1",
      "y1",
      "x2",
      "y2",
      "width",
      "height",
      "points",
      "fill",
      "fill-rule",
    ]) {
      if (attrs[k] !== undefined) keep[k] = attrs[k];
    }
    nodes.push({ tag, attrs: keep });
  }
  if (nodes.length === 0) {
    throw new Error(`No drawable nodes parsed from ${name} (${file})`);
  }
  return nodes;
}

function nodeStr(nodes) {
  return nodes.map((n) => `{ tag: "${n.tag}", attrs: ${JSON.stringify(n.attrs)} }`).join(", ");
}

const header = (exportName) => [
  "/* Generated from lucide-static (ISC) — do not edit by hand.",
  "   Run `node scripts/gen-icons.mjs` to regenerate after bumping lucide-static. */",
  "",
  "export interface BloraIconNode {",
  '  tag: "circle" | "ellipse" | "line" | "path" | "polygon" | "polyline" | "rect";',
  "  attrs: Record<string, string>;",
  "}",
  "",
  `export const ${exportName}: Record<string, BloraIconNode[]> = {`,
];

const footer = ["};", ""];

// ---- Curated set (default core bundle) ----
{
  const lines = header("BLORA_ICON_DATA");
  const sorted = Object.keys(ICON_MAP).sort();
  for (const name of sorted) {
    const file = join(lucideRoot, `${ICON_MAP[name]}.svg`);
    if (!existsSync(file)) {
      throw new Error(`Missing lucide icon ${ICON_MAP[name]} for ${name}`);
    }
    const nodes = parseSvg(name, file);
    lines.push(`  ${JSON.stringify(name)}: [${nodeStr(nodes)}],`);
  }
  lines.push(...footer);
  writeFileSync(curatedOut, lines.join("\n"));
  console.log(`[gen-icons] wrote ${curatedOut} (${sorted.length} curated icons)`);
}

// ---- Full lucide set (opt-in module) ----
{
  const files = readdirSync(lucideRoot)
    .filter((f) => f.endsWith(".svg"))
    .sort();
  const lines = header("BLORA_ICON_FULL_DATA");
  for (const file of files) {
    const name = file.replace(/\.svg$/, "");
    const nodes = parseSvg(name, join(lucideRoot, file));
    lines.push(`  ${JSON.stringify(name)}: [${nodeStr(nodes)}],`);
  }
  lines.push(...footer);
  writeFileSync(fullOut, lines.join("\n"));
  console.log(`[gen-icons] wrote ${fullOut} (${files.length} lucide icons)`);
}
