// @ts-check
/**
 * blora-lint — zero-dependency consumer lint CLI for Blora Design.
 *
 * Scans consumer source for misuse of the Blora Design system: unknown tokens
 * and classes, custom-element internals, hardcoded colors, dark-mode overrides,
 * legacy 1.x APIs, and more. Data (tokens, shipped classes, contracts) is read
 * from the installed `@bloret-crew/blora-design` package `dist/` + `contracts/`,
 * so the rules track whatever version is actually installed.
 *
 * Usage:  node bin/blora-lint.mjs [paths...] [--json] [--errors-only]
 *
 * Programmatic API (same module):
 *   loadContext(pkgRoot?) -> context
 *   lintText(text, filename, context) -> Finding[]
 *   lintPaths(paths, options) -> { findings, context }
 */

import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { dirname, join, resolve, extname, relative } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * @typedef {Object} Finding
 * @property {string} file
 * @property {number} line
 * @property {number} column
 * @property {"error"|"warning"} severity
 * @property {string} rule
 * @property {string} message
 * @property {string} [suggestion]
 */

/**
 * @typedef {Object} Contract
 * @property {string} name
 * @property {string} kind
 * @property {string} [tagName]
 * @property {Record<string, {type?: string}>} [attributes]
 */

/**
 * @typedef {Object} LintContext
 * @property {Set<string>} tokens                registered custom-property names (--blora-*)
 * @property {Set<string>} shippedClasses        shipped .blora-* class names (without dot)
 * @property {Map<string,{attributes:Set<string>, enums:Map<string,Set<string>>}>} ceTags
 *           custom-element tag -> allowed attributes + enum constraints
 * @property {Map<string,{root:string, enums:Map<string,Set<string>>}>} cssOnly
 *           css-only/native contract name -> root class + data-* enum constraints
 * @property {Set<string>} ceNames               custom-element contract names (for ce-internals/ce-root-class)
 * @property {Set<string>} knownChildTags        known blora-* child/definition tags
 * @property {Set<string>} publicPartClasses     BEM part classes a contract explicitly
 *           declares as public consumer surface (composite add-on `classes[]`)
 */

const SCAN_EXTS = new Set([
  ".html",
  ".htm",
  ".vue",
  ".svelte",
  ".astro",
  ".jsx",
  ".tsx",
  ".js",
  ".mjs",
  ".cjs",
  ".ts",
  ".css",
  ".scss",
  ".less",
  ".php",
  ".erb",
]);
const SKIP_DIRS = new Set([
  "node_modules",
  "dist",
  "build",
  "out",
  "coverage",
  ".git",
  ".next",
  ".nuxt",
  "vendor",
]);
const MAX_FILE_BYTES = 1024 * 1024;
const CSS_LIKE = new Set([".css", ".scss", ".less"]);
const MARKUP_EXTS = new Set([".html", ".htm", ".vue", ".svelte", ".astro", ".jsx", ".tsx"]);

/** Read a file, retrying once if a dist file is briefly missing (concurrent rebuild). */
function readFileResilient(path) {
  try {
    return readFileSync(path, "utf8");
  } catch (err) {
    if (err && err.code === "ENOENT") {
      // brief window during a concurrent dist rebuild — wait ~10s then retry once
      const until = Date.now() + 10000;
      while (Date.now() < until) {
        try {
          return readFileSync(path, "utf8");
        } catch {
          // busy-wait via a synchronous no-op; kept short in practice
        }
      }
    }
    throw err;
  }
}

function safeReadJson(path) {
  try {
    return JSON.parse(readFileResilient(path));
  } catch {
    return null;
  }
}

/** Recursively collect files under a dir with an extension filter. */
function walkDir(dir, filter, acc) {
  let entries;
  try {
    entries = readdirSync(dir, { withFileTypes: true });
  } catch {
    return acc;
  }
  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (SKIP_DIRS.has(entry.name)) continue;
      walkDir(full, filter, acc);
    } else if (filter(full)) {
      acc.push(full);
    }
  }
  return acc;
}

/** Levenshtein edit distance (small strings). */
function editDistance(a, b) {
  const m = a.length;
  const n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;
  let prev = new Array(n + 1);
  let curr = new Array(n + 1);
  for (let j = 0; j <= n; j++) prev[j] = j;
  for (let i = 1; i <= m; i++) {
    curr[0] = i;
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      curr[j] = Math.min(prev[j] + 1, curr[j - 1] + 1, prev[j - 1] + cost);
    }
    [prev, curr] = [curr, prev];
  }
  return prev[n];
}

/** Nearest registered name by edit distance, or null if nothing reasonably close. */
function nearest(name, candidates) {
  let best = null;
  let bestD = Infinity;
  for (const c of candidates) {
    const d = editDistance(name, c);
    if (d < bestD) {
      bestD = d;
      best = c;
    }
  }
  // only suggest when it is plausibly a typo (<= 1/3 of the length)
  if (best && bestD <= Math.max(3, Math.floor(name.length / 3))) return best;
  return null;
}

/** Compute 1-based line + column for a string index. */
function posOf(text, index) {
  let line = 1;
  let last = -1;
  for (let i = 0; i < index; i++) {
    if (text.charCodeAt(i) === 10) {
      line++;
      last = i;
    }
  }
  return { line, column: index - last };
}

// ---------------------------------------------------------------------------
// Legacy token aliases (rule 1 suggestions). Explicit legacy -> current map.
// ---------------------------------------------------------------------------
/** @type {Record<string,string>} */
const LEGACY_TOKEN_ALIASES = {
  "--blora-background": "--blora-color-surface-canvas",
  "--blora-surface-1": "--blora-color-surface-default",
  "--blora-surface-2": "--blora-color-surface-raised",
  "--blora-surface-3": "--blora-color-surface-sunken",
  "--blora-text-strong": "--blora-color-text-primary",
  "--blora-text-primary": "--blora-color-text-primary",
  "--blora-foreground": "--blora-color-text-secondary",
  "--blora-text-emphasis": "--blora-color-text-emphasis",
  "--blora-text-muted": "--blora-color-text-muted",
  "--blora-text-subtle": "--blora-color-text-subtle",
  "--blora-text-disabled": "--blora-color-text-disabled",
  "--blora-primary": "--blora-color-action-primary-default",
  "--blora-primary-hover": "--blora-color-action-primary-hover",
  "--blora-danger": "--blora-color-status-danger",
  "--blora-success": "--blora-color-status-success",
  "--blora-warning": "--blora-color-status-warning",
  "--blora-info": "--blora-color-status-info",
  "--blora-accent-neutral": "--blora-color-status-neutral",
};

/** Parse enum type strings like `"\"primary\" | \"neutral\""` into a value set. */
function parseEnumValues(type) {
  if (typeof type !== "string") return null;
  const matches = type.match(/"([^"]+)"/g);
  if (!matches) return null;
  const vals = matches.map((m) => m.slice(1, -1));
  // only treat as an enum when every alternative is a bare literal (no `string`)
  if (/\bstring\b|\bnumber\b|\bboolean\b/.test(type)) return null;
  return vals.length ? new Set(vals) : null;
}

/** Extract every `.blora-xxx` class and `--blora-xxx:` custom prop from CSS text. */
function harvestCss(cssText, shippedClasses, tokens) {
  const classRe = /\.(blora-[a-z0-9_-]+)/g;
  let m;
  while ((m = classRe.exec(cssText))) shippedClasses.add(m[1]);
  const propRe = /(--blora-[a-z0-9-]+)\s*:/g;
  while ((m = propRe.exec(cssText))) tokens.add(m[1]);
}

/** Extract `"blora-xxx"` string literals (child/definition tags) from JS text. */
function harvestTagLiterals(jsText, knownChildTags) {
  const re = /["'`](blora-[a-z0-9-]+)["'`]/g;
  let m;
  while ((m = re.exec(jsText))) knownChildTags.add(m[1]);
}

/** Load a directory of `*.contract.json` core contracts into the context. */
function loadCoreContracts(contractsDir, ctx) {
  const files = walkDir(contractsDir, (f) => f.endsWith(".contract.json"), []);
  for (const file of files) {
    const c = /** @type {Contract} */ (safeReadJson(file));
    if (!c || !c.name) continue;
    const attrs = c.attributes || {};
    if (c.kind === "custom-element") {
      const tag = c.tagName || `blora-${c.name}`;
      const allowed = new Set(Object.keys(attrs));
      const enums = new Map();
      for (const [attr, def] of Object.entries(attrs)) {
        const vals = parseEnumValues(def && def.type);
        if (vals) enums.set(attr, vals);
      }
      ctx.ceTags.set(tag, { attributes: allowed, enums });
      ctx.ceNames.add(c.name);
    } else if (c.kind === "css-only" || c.kind === "native") {
      const root = `blora-${c.name}`;
      const enums = new Map();
      for (const [attr, def] of Object.entries(attrs)) {
        const vals = parseEnumValues(def && def.type);
        if (vals && attr.startsWith("data-")) enums.set(attr, vals);
      }
      ctx.cssOnly.set(c.name, { root, enums });
    }
    // headless / css-and-service: no markup surface to constrain here
  }
}

/** Load add-on contracts (customElements shape) + dist tag literals. */
function loadAddonDir(addonRoot, ctx) {
  const contractsDir = join(addonRoot, "contracts");
  const distDir = join(addonRoot, "dist");
  if (existsSync(contractsDir)) {
    const files = walkDir(contractsDir, (f) => f.endsWith(".contract.json"), []);
    for (const file of files) {
      const c = safeReadJson(file);
      if (!c || !c.customElements) continue;
      for (const [tag, def] of Object.entries(c.customElements)) {
        const allowed = new Set();
        const enums = new Map();
        const attributes = def && def.attributes;
        if (Array.isArray(attributes)) {
          for (const a of attributes) allowed.add(a);
        } else if (attributes && typeof attributes === "object") {
          for (const [a, adef] of Object.entries(attributes)) {
            allowed.add(a);
            const vals = parseEnumValues(adef && adef.type);
            if (vals) enums.set(a, vals);
          }
        }
        ctx.ceTags.set(tag, { attributes: allowed, enums });
        ctx.ceNames.add(tag.replace(/^blora-/, ""));
        // child definitions listed as tag names count as known child tags
        const defs = def && def.definitions;
        if (Array.isArray(defs)) {
          for (const d of defs) {
            if (/^blora-[a-z0-9-]+$/.test(d)) ctx.knownChildTags.add(d);
          }
        }
      }
      // classes array (composite add-ons) are shipped classes AND declared
      // public part surface (so ce-internals must not flag them).
      if (Array.isArray(c.classes)) {
        for (const cls of c.classes) {
          const name = String(cls).replace(/^\./, "");
          if (name.startsWith("blora-")) {
            ctx.shippedClasses.add(name);
            ctx.publicPartClasses.add(name);
          }
        }
      }
    }
  }
  if (existsSync(distDir)) {
    const cssFiles = walkDir(distDir, (f) => f.endsWith(".css"), []);
    for (const f of cssFiles) harvestCss(readFileResilient(f), ctx.shippedClasses, ctx.tokens);
    const jsFiles = walkDir(distDir, (f) => /\.(js|mjs|cjs)$/.test(f), []);
    for (const f of jsFiles) harvestTagLiterals(readFileResilient(f), ctx.knownChildTags);
  }
}

/**
 * Build a lint context from an installed Blora Design package.
 * @param {string} [pkgRoot] path to the package root (defaults to bin/..).
 * @returns {LintContext}
 */
export function loadContext(pkgRoot) {
  const root = pkgRoot ? resolve(pkgRoot) : resolve(__dirname, "..");
  const distDir = join(root, "dist");
  const contractsDir = join(root, "contracts");

  /** @type {LintContext} */
  const ctx = {
    tokens: new Set(),
    shippedClasses: new Set(),
    ceTags: new Map(),
    cssOnly: new Map(),
    ceNames: new Set(),
    knownChildTags: new Set(),
    publicPartClasses: new Set(),
  };

  // 1. token manifest
  const manifest = safeReadJson(join(distDir, "token-manifest.json"));
  if (manifest) {
    for (const t of manifest.tokens || []) if (t && t.name) ctx.tokens.add(t.name);
    for (const t of manifest.darkOverrides || []) if (t && t.name) ctx.tokens.add(t.name);
  }

  // 2. dist CSS: shipped classes + shipped custom properties
  const cssFiles = walkDir(distDir, (f) => f.endsWith(".css"), []);
  for (const f of cssFiles) harvestCss(readFileResilient(f), ctx.shippedClasses, ctx.tokens);

  // 3. dist JS: known child/definition tag literals
  const jsFiles = walkDir(distDir, (f) => /\.(js|mjs|cjs)$/.test(f), []);
  for (const f of jsFiles) harvestTagLiterals(readFileResilient(f), ctx.knownChildTags);

  // 4. core contracts
  loadCoreContracts(contractsDir, ctx);

  // 5. add-ons: monorepo <repoRoot>/addons/<name> and sibling installs.
  // monorepo: root is packages/blora-design -> repoRoot is two levels up.
  const repoRoot = resolve(root, "..", "..");
  const monorepoAddons = join(repoRoot, "addons");
  if (existsSync(monorepoAddons)) {
    for (const entry of readdirSync(monorepoAddons, { withFileTypes: true })) {
      if (entry.isDirectory()) loadAddonDir(join(monorepoAddons, entry.name), ctx);
    }
  }
  // consumer install: sibling packages node_modules/@bloret-crew/blora-design-<name>
  const nmScope = resolve(root, "..", "@bloret-crew");
  if (existsSync(nmScope)) {
    for (const entry of readdirSync(nmScope, { withFileTypes: true })) {
      if (entry.isDirectory() && entry.name.startsWith("blora-design-")) {
        loadAddonDir(join(nmScope, entry.name), ctx);
      }
    }
  }

  // every custom-element tag is also a "known" tag for element checks
  for (const tag of ctx.ceTags.keys()) ctx.knownChildTags.add(tag);

  return ctx;
}

// ---------------------------------------------------------------------------
// Lint engine
// ---------------------------------------------------------------------------

/** Framework-syntax / always-allowed attribute test for custom-element attrs. */
function isAlwaysAllowedAttr(attr) {
  const ALWAYS = new Set([
    "id",
    "class",
    "style",
    "slot",
    "hidden",
    "lang",
    "dir",
    "role",
    "title",
    "tabindex",
    "key",
    "ref",
  ]);
  if (ALWAYS.has(attr)) return true;
  if (attr.startsWith("aria-") || attr.startsWith("data-")) return true;
  // framework binding syntax
  if (/^[:@#*[(]/.test(attr)) return true;
  if (/^(v-|x-|bind:|on:)/.test(attr)) return true;
  if (/^on[A-Z]/.test(attr)) return true; // React camelCase handlers
  return false;
}

/** Does a value contain template/interpolation syntax we should skip? */
function hasTemplateSyntax(value) {
  return value.includes("{") || value.includes("$") || value.includes("<%");
}

/** Extract <style> block ranges [start,end) from markup text. */
function styleBlockRanges(text) {
  const ranges = [];
  const re = /<style\b[^>]*>([\s\S]*?)<\/style>/gi;
  let m;
  while ((m = re.exec(text))) {
    ranges.push([m.index + m[0].indexOf(">") + 1, m.index + m[0].length - "</style>".length]);
  }
  return ranges;
}

function inRanges(index, ranges) {
  for (const [s, e] of ranges) if (index >= s && index < e) return true;
  return false;
}

/** Split text into lines, tracking whether each falls inside an HTML/JS comment. */
function analyzeComments(text, ext) {
  // Returns a function isCommentAt(index) using precomputed comment ranges.
  const ranges = [];
  const markup = MARKUP_EXTS.has(ext) || ext === ".php" || ext === ".erb";
  if (markup) {
    const re = /<!--[\s\S]*?-->/g;
    let m;
    while ((m = re.exec(text))) ranges.push([m.index, m.index + m[0].length]);
  }
  // block + line comments for code/CSS files
  const blockRe = /\/\*[\s\S]*?\*\//g;
  let m;
  while ((m = blockRe.exec(text))) ranges.push([m.index, m.index + m[0].length]);
  return (index) => {
    for (const [s, e] of ranges) if (index >= s && index < e) return true;
    return false;
  };
}

/**
 * Lint a single text buffer.
 * @param {string} text
 * @param {string} filename
 * @param {LintContext} ctx
 * @returns {Finding[]}
 */
export function lintText(text, filename, ctx) {
  /** @type {Finding[]} */
  const out = [];
  const ext = extname(filename).toLowerCase();
  const isCss = CSS_LIKE.has(ext);
  const isMarkup = MARKUP_EXTS.has(ext);
  const isHtml = ext === ".html" || ext === ".htm";
  const isComment = analyzeComments(text, ext);
  const styleRanges = isMarkup ? styleBlockRanges(text) : [];
  const lines = text.split(/\r?\n/);

  /** push a finding located at a string index. */
  const add = (index, severity, rule, message, suggestion) => {
    const { line, column } = posOf(text, index);
    out.push({ file: filename, line, column, severity, rule, message, suggestion });
  };

  const registeredTokens = ctx.tokens;

  // ---- Rule 1: unknown-token — var(--blora-*) not registered -------------
  {
    const re = /var\(\s*(--blora-[a-z0-9-]+)/g;
    let m;
    while ((m = re.exec(text))) {
      const name = m[1];
      if (registeredTokens.has(name)) continue;
      let suggestion = LEGACY_TOKEN_ALIASES[name];
      if (!suggestion) suggestion = nearest(name, registeredTokens) || undefined;
      add(
        m.index + m[0].indexOf(name),
        "error",
        "unknown-token",
        `Unknown Blora token ${name}`,
        suggestion,
      );
    }
  }

  // ---- Rule 2: invented-token — declaring an unregistered --blora-* prop --
  // A declaration (not var() use): `--blora-foo: value`. Only flag names that
  // look like they intend to be Blora tokens but are not registered.
  {
    const re = /(^|[;{]\s*|\n\s*)(--blora-[a-z0-9-]+)\s*:/g;
    let m;
    while ((m = re.exec(text))) {
      const name = m[2];
      const idx = m.index + m[0].indexOf(name);
      if (registeredTokens.has(name)) continue;
      // component-level custom props (--blora-<component>-*) are legitimately
      // author-set (see contract cssProperties). Only warn on ones not shipped.
      add(
        idx,
        "warning",
        "invented-token",
        `Declares unregistered Blora custom property ${name}`,
        undefined,
      );
    }
  }

  // ---- Rule 3: unknown-class / invented-class ----------------------------
  // markup class attribute tokens
  if (!isCss) {
    const attrRe =
      /\b(?:class|className)\s*=\s*(?:"([^"]*)"|'([^']*)'|\{`([^`]*)`\}|\{"([^"]*)"\}|\{'([^']*)'\})/g;
    let m;
    while ((m = attrRe.exec(text))) {
      const value = m[1] ?? m[2] ?? m[3] ?? m[4] ?? m[5] ?? "";
      const attrStart = m.index + m[0].indexOf(value);
      for (const tok of value.split(/\s+/)) {
        if (!tok || !tok.startsWith("blora-")) continue;
        if (hasTemplateSyntax(tok)) continue;
        if (ctx.shippedClasses.has(tok)) continue;
        // ce-root-class / ce-internals handled separately below; skip here if so
        const bem = tok.match(/^(blora-[a-z0-9-]+?)__/);
        if (bem && ctx.ceNames.has(bem[1].replace(/^blora-/, ""))) continue;
        if (ctx.ceNames.has(tok.replace(/^blora-/, ""))) continue;
        const idx = attrStart + value.indexOf(tok);
        const suggestion = nearest(tok, ctx.shippedClasses) || undefined;
        add(idx, "error", "unknown-class", `Unknown Blora class ${tok}`, suggestion);
      }
    }
  }
  // CSS selectors defining .blora-* that are not shipped -> invented-class
  if (isCss || styleRanges.length) {
    const re = /\.(blora-[a-z0-9_-]+)/g;
    let m;
    while ((m = re.exec(text))) {
      const cls = m[1];
      const idx = m.index;
      if (isComment(idx)) continue;
      if (!isCss && !inRanges(idx, styleRanges)) continue;
      if (ctx.shippedClasses.has(cls)) continue;
      // skip BEM internals / ce-root handled by rule 4
      add(
        idx,
        "warning",
        "invented-class",
        `CSS selector .${cls} is not a shipped Blora class; use your own prefix`,
        undefined,
      );
    }
  }

  // ---- Rule 4: ce-internals / ce-root-class ------------------------------
  {
    // ce-internals: blora-<ce>__* anywhere. error in markup, warn in CSS/JS.
    const re = /(?<![\w-])(blora-[a-z0-9-]+?)__[a-z0-9-]+/g;
    let m;
    while ((m = re.exec(text))) {
      const base = m[1];
      const full = m[0];
      const name = base.replace(/^blora-/, "");
      if (!ctx.ceNames.has(name)) continue;
      // A BEM class a contract EXPLICITLY declares as public surface (composite
      // add-ons like thread list .blora-thread-comment__meta in their classes[])
      // is intended consumer surface, not a private internal. A part class that
      // merely appears in the component's own dist CSS is still an internal.
      if (ctx.publicPartClasses.has(full)) continue;
      const idx = m.index;
      if (isComment(idx)) continue;
      const inStyle = isCss || inRanges(idx, styleRanges);
      const severity = inStyle ? "warning" : "error";
      add(
        idx,
        severity,
        "ce-internals",
        `${m[0]} is an internal part of custom element <${base}>; do not target it`,
        undefined,
      );
    }
    // ce-root-class: markup class token exactly blora-<ce> for a CE contract
    if (!isCss) {
      const attrRe = /\b(?:class|className)\s*=\s*(?:"([^"]*)"|'([^']*)')/g;
      let a;
      while ((a = attrRe.exec(text))) {
        const value = a[1] ?? a[2] ?? "";
        const attrStart = a.index + a[0].indexOf(value);
        for (const tok of value.split(/\s+/)) {
          const nm = tok.replace(/^blora-/, "");
          if (ctx.ceNames.has(nm) && ctx.ceTags.has(tok)) {
            const idx = attrStart + value.indexOf(tok);
            add(
              idx,
              "error",
              "ce-root-class",
              `class="${tok}" targets a custom element; use the element <${tok}> instead`,
              `<${tok}>`,
            );
          }
        }
      }
    }
  }

  // ---- Rule 5 & 6: elements, attributes, variants ------------------------
  if (isMarkup || isHtml) {
    lintMarkupTags(text, ctx, add, isComment);
  }

  // ---- Rule 7: native-dialog — global alert/confirm/prompt ---------------
  if (!isCss) {
    const re = /(?<![.\w$])(alert|confirm|prompt)\s*\(/g;
    let m;
    while ((m = re.exec(text))) {
      const idx = m.index;
      if (isComment(idx)) continue;
      add(
        idx,
        "error",
        "native-dialog",
        `Native ${m[1]}() is not allowed; use Blora dialog/message APIs`,
        undefined,
      );
    }
  }

  // ---- Rule 8: hardcoded-color -------------------------------------------
  {
    lintHardcodedColor(text, ext, isCss, styleRanges, isComment, add);
  }

  // ---- Rule 9: dark-override ---------------------------------------------
  if (isCss || styleRanges.length) {
    const patterns = [
      /prefers-color-scheme\s*:\s*dark/gi,
      /\.dark\b/g,
      /\[data-theme\s*=\s*["']dark["']\]/gi,
    ];
    for (const pat of patterns) {
      let m;
      while ((m = pat.exec(text))) {
        const idx = m.index;
        if (isComment(idx)) continue;
        if (!isCss && !inRanges(idx, styleRanges)) continue;
        add(
          idx,
          "warning",
          "dark-override",
          `Manual dark-mode override; Blora tokens already handle dark mode`,
          undefined,
        );
      }
    }
  }

  // ---- Rule 10: unlayered-global (once per file) -------------------------
  if (isCss) {
    lintUnlayeredGlobal(text, filename, out);
  }

  // ---- Rule 11: override-blora -------------------------------------------
  if (isCss || styleRanges.length) {
    lintOverrideBlora(text, isCss, styleRanges, isComment, ctx, add);
  }

  // ---- Rule 12: raw-control ----------------------------------------------
  if (isMarkup || isHtml) {
    lintRawControl(lines, text, add);
  }

  // ---- Rule 13: plain-button / button-type -------------------------------
  if (isMarkup || isHtml) {
    const re = /<button\b([^>]*)>/gi;
    let m;
    while ((m = re.exec(text))) {
      const attrs = m[1];
      const idx = m.index;
      if (isComment(idx)) continue;
      const classMatch = attrs.match(/\b(?:class|className)\s*=\s*["']([^"']*)["']/);
      const classList = classMatch ? classMatch[1] : "";
      const hasBloraBtn = /\bblora-(button|fab|swap)\b/.test(classList);
      if (!hasBloraBtn) {
        add(
          idx,
          "warning",
          "plain-button",
          `<button> without a Blora button class (blora-button/blora-fab/blora-swap)`,
          undefined,
        );
      }
      if (!/\btype\s*=/.test(attrs)) {
        add(
          idx,
          "warning",
          "button-type",
          `<button> without an explicit type= attribute`,
          `type="button"`,
        );
      }
    }
  }

  // ---- Rule 14: emoji-icon -----------------------------------------------
  if (isMarkup || isHtml) {
    const iconChars =
      /[\u00D7\u2715\u2716\u2039\u203A\u2190\u2192\u2605\u2606]|\p{Extended_Pictographic}/gu;
    let m;
    while ((m = iconChars.exec(text))) {
      const idx = m.index;
      if (isComment(idx)) continue;
      if (inRanges(idx, styleRanges)) continue;
      // only in markup text/attribute regions, not inside <script> blocks
      add(
        idx,
        "warning",
        "emoji-icon",
        `Emoji/glyph "${m[0]}" used as an icon; use a Blora icon instead`,
        undefined,
      );
    }
  }

  // ---- Rule 15: nested-card ----------------------------------------------
  if (isMarkup) {
    lintNestedCard(text, add, isComment);
  }

  // ---- Rule 16: inline-handler (.html only) ------------------------------
  if (isHtml) {
    const re = /\bon[a-z]+\s*=/gi;
    let m;
    while ((m = re.exec(text))) {
      const idx = m.index;
      if (isComment(idx)) continue;
      if (inRanges(idx, styleRanges)) continue;
      add(
        idx,
        "warning",
        "inline-handler",
        `Inline event handler ${m[0].replace(/\s*=$/, "")} violates CSP; bind in a module script`,
        undefined,
      );
    }
  }

  // ---- Rule 17: legacy-1x / shadow-access --------------------------------
  {
    /** @type {Array<[RegExp,string]>} */
    const legacy = [
      [/\bclass\s*=\s*["'][^"']*\bblora-btn(?:--[a-z0-9-]+)?\b/g, "blora-btn legacy class"],
      [/(?<![\w-])blora-btn(?:--[a-z0-9-]+)?(?![\w-])/g, "blora-btn legacy class"],
      [/\bBlora\.init\s*\(/g, "Blora.init()"],
      [/\bBlora\.configure\s*\(/g, "Blora.configure()"],
      [/\bBlora\.applyColorMode\b/g, "Blora.applyColorMode"],
      [/\bdata-blora-palette\b/g, "data-blora-palette"],
      [/\bdata-blora-color-mode\b/g, "data-blora-color-mode"],
      [/(?<![\w-])blora-dark(?![\w-])/g, "blora-dark class"],
    ];
    const seen = new Set();
    for (const [pat, label] of legacy) {
      let m;
      while ((m = pat.exec(text))) {
        const idx = m.index;
        if (isComment(idx)) continue;
        const key = idx + ":" + label;
        if (seen.has(key)) continue;
        seen.add(key);
        add(idx, "error", "legacy-1x", `Legacy Blora 1.x API: ${label}`, undefined);
      }
    }
    const shadowRe = /\.shadowRoot\b/g;
    let m;
    while ((m = shadowRe.exec(text))) {
      const idx = m.index;
      if (isComment(idx)) continue;
      add(
        idx,
        "error",
        "shadow-access",
        `Reaching into .shadowRoot of a Blora element breaks encapsulation`,
        undefined,
      );
    }
  }

  return out;
}

// ---------------------------------------------------------------------------
// Rule 5 & 6: element / attribute / variant checks over markup tags.
// ---------------------------------------------------------------------------
/**
 * Walk opening tags in markup and flag unknown <blora-*> elements, unknown
 * attributes on contract/add-on custom elements, and disallowed enum values.
 * @param {string} text
 * @param {LintContext} ctx
 * @param {(index:number,sev:"error"|"warning",rule:string,msg:string,sug?:string)=>void} add
 * @param {(index:number)=>boolean} isComment
 */
function lintMarkupTags(text, ctx, add, isComment) {
  const tagRe = /<([a-z][a-z0-9-]*)((?:\s+[^<>]*?)?)\/?>/gi;
  let m;
  while ((m = tagRe.exec(text))) {
    const tag = m[1].toLowerCase();
    const attrText = m[2] || "";
    const idx = m.index;
    if (isComment(idx)) continue;
    const isBloraTag = tag.startsWith("blora-");

    // Rule 5: unknown-element
    if (isBloraTag && !ctx.ceTags.has(tag) && !ctx.knownChildTags.has(tag)) {
      add(idx, "warning", "unknown-element", `Unknown Blora element <${tag}>`, undefined);
    }

    // Parse attributes for this tag
    const attrs = parseAttributes(attrText, m.index + m[0].indexOf(attrText));

    // Rule 6: unknown-attribute (custom-element / add-on tags only)
    const ce = ctx.ceTags.get(tag);
    if (ce) {
      for (const at of attrs) {
        if (isAlwaysAllowedAttr(at.name)) continue;
        if (!ce.attributes.has(at.name)) {
          add(
            at.nameIndex,
            "warning",
            "unknown-attribute",
            `Attribute ${at.name} is not declared on <${tag}>`,
            undefined,
          );
        }
      }
    }

    // Rule 6: unknown-variant — CE enum attributes.
    if (ce) {
      for (const at of attrs) {
        const allowed = ce.enums.get(at.name);
        if (allowed && at.value != null && !hasTemplateSyntax(at.value)) {
          if (!allowed.has(at.value)) {
            add(
              at.valueIndex,
              "warning",
              "unknown-variant",
              `${at.name}="${at.value}" is not a valid value on <${tag}> (allowed: ${[...allowed].join(", ")})`,
              undefined,
            );
          }
        }
      }
    }

    // Rule 6: unknown-variant — css-only data-* enums on elements whose class
    // list contains the root class.
    const classAttr = attrs.find((a) => a.name === "class" || a.name === "className");
    if (classAttr && classAttr.value) {
      const classes = new Set(classAttr.value.split(/\s+/));
      for (const [, info] of ctx.cssOnly) {
        if (!classes.has(info.root)) continue;
        for (const at of attrs) {
          const allowed = info.enums.get(at.name);
          if (allowed && at.value != null && !hasTemplateSyntax(at.value)) {
            if (!allowed.has(at.value)) {
              add(
                at.valueIndex,
                "warning",
                "unknown-variant",
                `${at.name}="${at.value}" is not valid for .${info.root} (allowed: ${[...allowed].join(", ")})`,
                undefined,
              );
            }
          }
        }
      }
    }
  }
}

/**
 * Parse an attribute string into name/value records with source indexes.
 * @param {string} attrText
 * @param {number} baseIndex absolute index of attrText in the source.
 */
function parseAttributes(attrText, baseIndex) {
  const out = [];
  const re =
    /([:@#*[\](.)a-zA-Z_][-\w:.@#*[\]()]*)(?:\s*=\s*("([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g;
  let m;
  while ((m = re.exec(attrText))) {
    const name = m[1];
    if (!name) continue;
    let value = null;
    let valueIndex = baseIndex + m.index;
    if (m[3] != null) {
      value = m[3];
      valueIndex = baseIndex + m.index + m[0].indexOf('"') + 1;
    } else if (m[4] != null) {
      value = m[4];
      valueIndex = baseIndex + m.index + m[0].indexOf("'") + 1;
    } else if (m[5] != null) {
      value = m[5];
      valueIndex = baseIndex + m.index + m[0].lastIndexOf(m[5]);
    }
    out.push({ name, value, nameIndex: baseIndex + m.index, valueIndex });
  }
  return out;
}

// ---------------------------------------------------------------------------
// Rule 8: hardcoded-color
// ---------------------------------------------------------------------------
/**
 * Flag hex/rgb/hsl colors inside CSS declarations or style="" attributes.
 * Ignores comments, url(), and SVG presentation attributes (fill="#..").
 */
function lintHardcodedColor(text, ext, isCss, styleRanges, isComment, add) {
  const colorRe = /#[0-9a-fA-F]{3,8}\b|(?:rgb|rgba|hsl|hsla)\s*\([^)]*\)/g;

  const flagRegion = (regionText, offset, insideStyleAttr) => {
    let m;
    while ((m = colorRe.exec(regionText))) {
      const abs = offset + m.index;
      if (isComment(abs)) continue;
      // ignore url(...) contents
      const before = regionText.slice(Math.max(0, m.index - 4), m.index);
      if (/url\($/.test(before)) continue;
      // ignore SVG presentation attributes fill/stroke/stop-color = "#.."
      if (!insideStyleAttr) {
        const pre = text.slice(Math.max(0, abs - 24), abs);
        if (/\b(?:fill|stroke|stop-color|flood-color|lighting-color)\s*=\s*["']?$/.test(pre)) {
          continue;
        }
      }
      add(
        abs,
        "warning",
        "hardcoded-color",
        `Hardcoded color ${m[0]}; use a Blora token`,
        undefined,
      );
    }
    colorRe.lastIndex = 0;
  };

  if (isCss) {
    flagRegion(text, 0, false);
  } else {
    // <style> blocks
    for (const [s, e] of styleRanges) flagRegion(text.slice(s, e), s, false);
    // style="" attributes
    const styleAttrRe = /\bstyle\s*=\s*("([^"]*)"|'([^']*)')/g;
    let m;
    while ((m = styleAttrRe.exec(text))) {
      const value = m[2] ?? m[3] ?? "";
      const off = m.index + m[0].indexOf(value);
      flagRegion(value, off, true);
    }
  }
}

// ---------------------------------------------------------------------------
// Rule 10: unlayered-global — once per file
// ---------------------------------------------------------------------------
const BARE_ELEMENT_SELECTORS = new Set([
  "*",
  "button",
  "input",
  "select",
  "textarea",
  "a",
  "table",
  "th",
  "td",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "label",
  "ul",
  "ol",
  "li",
  "p",
]);

/**
 * Detect top-level CSS rules NOT inside @layer whose selector list contains a
 * bare element selector. Emits one warning per file (with count + first line).
 */
function lintUnlayeredGlobal(text, filename, out) {
  let depth = 0;
  const layerStack = [];
  let count = 0;
  let firstIndex = -1;
  let i = 0;
  const len = text.length;

  // strip comments for scanning by masking them with spaces
  const masked = text.replace(/\/\*[\s\S]*?\*\//g, (s) => " ".repeat(s.length));

  while (i < len) {
    const ch = masked[i];
    if (ch === "@") {
      // detect @layer NAME { or @layer a,b,c;
      const rest = masked.slice(i, i + 200);
      const lm = rest.match(/^@layer\b[^{;]*([{;])/);
      if (lm) {
        if (lm[1] === "{") {
          layerStack.push(depth + 1);
        }
        i += lm[0].length;
        if (lm[1] === "{") depth++;
        continue;
      }
      // other at-rules with blocks (@media etc.) — treat contents at same layer
      const am = rest.match(/^@[a-z-]+\b[^{;]*([{;])/i);
      if (am) {
        i += am[0].length;
        if (am[1] === "{") depth++;
        continue;
      }
    }
    if (ch === "{") {
      // capture the selector preceding this brace at depth 0 and not in a layer
      if (depth === 0 && layerStack.length === 0) {
        // find selector start (previous } or ; or start)
        let sStart = i - 1;
        while (sStart >= 0 && !"};{".includes(masked[sStart])) sStart--;
        const selector = masked.slice(sStart + 1, i).trim();
        if (selectorHasBareElement(selector)) {
          count++;
          if (firstIndex < 0) firstIndex = sStart + 1;
        }
      }
      depth++;
      i++;
      continue;
    }
    if (ch === "}") {
      depth = Math.max(0, depth - 1);
      if (layerStack.length && layerStack[layerStack.length - 1] === depth + 1) {
        layerStack.pop();
      }
      i++;
      continue;
    }
    i++;
  }

  if (count > 0) {
    const { line, column } = posOf(text, firstIndex);
    out.push({
      file: filename,
      line,
      column,
      severity: "warning",
      rule: "unlayered-global",
      message:
        `${count} unlayered global element rule(s); Blora CSS lives in @layer blora, so ` +
        `these override every component. Put legacy CSS in \`@layer legacy\` with ` +
        `\`@layer legacy, blora;\` declared first, or scope it.`,
      suggestion: undefined,
    });
  }
}

/** Does a selector list contain a bare element selector from the risk set? */
function selectorHasBareElement(selectorList) {
  if (!selectorList || selectorList.startsWith("@") || selectorList.startsWith(":")) return false;
  for (const sel of selectorList.split(",")) {
    // examine each compound; a bare element is a leading token with no . # [ : etc.
    const compounds = sel.trim().split(/\s+|[>+~]/);
    for (const comp of compounds) {
      const c = comp.trim();
      if (!c) continue;
      if (BARE_ELEMENT_SELECTORS.has(c)) return true;
    }
  }
  return false;
}

// ---------------------------------------------------------------------------
// Rule 11: override-blora
// ---------------------------------------------------------------------------
const VISUAL_PROP_RE = new RegExp(
  `(?:^|[;{]|\\n)\\s*(color|background[\\w-]*|border[\\w-]*|box-shadow|font[\\w-]*|padding[\\w-]*|height|line-height|opacity|outline)\\s*:`,
  "i",
);

/**
 * Flag app CSS rules whose selector targets a .blora-* class and sets visual
 * properties. Layout-only properties are allowed.
 */
function lintOverrideBlora(text, isCss, styleRanges, isComment, ctx, add) {
  const ruleRe = /([^{}]+)\{([^{}]*)\}/g;
  let m;
  while ((m = ruleRe.exec(text))) {
    const selector = m[1];
    const body = m[2];
    if (selector.trim().startsWith("@")) continue;
    // selector must target a shipped .blora-* class
    const clsMatch = selector.match(/\.(blora-[a-z0-9_-]+)/);
    if (!clsMatch) continue;
    if (!ctx.shippedClasses.has(clsMatch[1])) continue;
    // test the comment/style-range membership at the class position: the match
    // can start inside a preceding comment even when the rule itself does not.
    const idx = m.index + selector.indexOf(clsMatch[0]);
    if (isComment(idx)) continue;
    if (!isCss && !inRanges(idx, styleRanges)) continue;
    if (VISUAL_PROP_RE.test(body)) {
      add(
        idx,
        "warning",
        "override-blora",
        `App CSS overrides visual properties of Blora class .${clsMatch[1]}; ` +
          `restyle via tokens/variants instead of overriding the component`,
        undefined,
      );
    }
  }
}

// ---------------------------------------------------------------------------
// Rule 12: raw-control
// ---------------------------------------------------------------------------
/** Flag raw native controls that have Blora equivalents. */
function lintRawControl(lines, text, add) {
  const controlRe =
    /<select\b(?![^>]*\bis\s*=)|<input\b[^>]*\btype\s*=\s*["']?(?:checkbox|radio|range|date|color|time|datetime-local|month|week|file)\b|<dialog\b|<progress\b/gi;
  let offset = 0;
  for (let li = 0; li < lines.length; li++) {
    const line = lines[li];
    let m;
    controlRe.lastIndex = 0;
    while ((m = controlRe.exec(line))) {
      // <select> that is actually blora-select is not matched (starts with <select ...);
      // exempt when this line or 3 preceding lines mention blora-filter
      const ctxLines = [line, lines[li - 1] || "", lines[li - 2] || "", lines[li - 3] || ""];
      if (ctxLines.some((l) => /blora-filter/.test(l))) continue;
      const abs = offset + m.index;
      add(
        abs,
        "warning",
        "raw-control",
        `Raw native control ${m[0].split(/\s/)[0]}>; use the Blora equivalent`,
        undefined,
      );
    }
    offset += line.length + 1;
  }
}

// ---------------------------------------------------------------------------
// Rule 15: nested-card — small tag-stack parser
// ---------------------------------------------------------------------------
const VOID_TAGS = new Set([
  "area",
  "base",
  "br",
  "col",
  "embed",
  "hr",
  "img",
  "input",
  "link",
  "meta",
  "param",
  "source",
  "track",
  "wbr",
]);

/**
 * Track a stack of open elements; when a .blora-card / .blora-panel opens
 * inside another, warn (error at nesting depth >= 3).
 */
function lintNestedCard(text, add, isComment) {
  const tokenRe = /<(\/?)([a-z][a-z0-9-]*)((?:\s+[^<>]*?)?)(\/?)>/gi;
  /** @type {Array<{tag:string, isCard:boolean}>} */
  const stack = [];
  let cardDepth = 0;
  let m;
  while ((m = tokenRe.exec(text))) {
    const closing = m[1] === "/";
    const tag = m[2].toLowerCase();
    const attrText = m[3] || "";
    const selfClose = m[4] === "/" || VOID_TAGS.has(tag);
    const idx = m.index;
    if (isComment(idx)) continue;

    if (closing) {
      // pop until matching tag
      for (let k = stack.length - 1; k >= 0; k--) {
        if (stack[k].tag === tag) {
          for (let j = stack.length - 1; j >= k; j--) {
            if (stack[j].isCard) cardDepth--;
          }
          stack.length = k;
          break;
        }
      }
      continue;
    }

    const classMatch = attrText.match(/\b(?:class|className)\s*=\s*["']([^"']*)["']/);
    const classList = classMatch ? classMatch[1] : "";
    const isCard = /\bblora-(card|panel)\b/.test(classList);

    if (isCard) {
      if (cardDepth >= 1) {
        const severity = cardDepth >= 2 ? "error" : "warning";
        add(
          idx,
          severity,
          "nested-card",
          `Nested Blora card/panel (depth ${cardDepth + 1}); cards should not be nested`,
          undefined,
        );
      }
    }

    if (!selfClose) {
      stack.push({ tag, isCard });
      if (isCard) cardDepth++;
    }
  }
}

// ---------------------------------------------------------------------------
// Path scanning + CLI
// ---------------------------------------------------------------------------
/**
 * Lint a set of file/directory paths.
 * @param {string[]} paths
 * @param {{pkgRoot?:string, context?:LintContext, errorsOnly?:boolean}} [options]
 * @returns {{findings:Finding[], context:LintContext}}
 */
export function lintPaths(paths, options = {}) {
  const context = options.context || loadContext(options.pkgRoot);
  /** @type {string[]} */
  const files = [];
  for (const p of paths) {
    let st;
    try {
      st = statSync(p);
    } catch {
      continue;
    }
    if (st.isDirectory()) {
      walkDir(p, (f) => SCAN_EXTS.has(extname(f).toLowerCase()), files);
    } else if (SCAN_EXTS.has(extname(p).toLowerCase())) {
      files.push(p);
    }
  }

  /** @type {Finding[]} */
  let findings = [];
  for (const file of files) {
    let st;
    try {
      st = statSync(file);
    } catch {
      continue;
    }
    if (st.size > MAX_FILE_BYTES) continue;
    let text;
    try {
      text = readFileSync(file, "utf8");
    } catch {
      continue;
    }
    findings.push(...lintText(text, file, context));
  }
  if (options.errorsOnly) findings = findings.filter((f) => f.severity === "error");
  return { findings, context };
}

/** Format findings as human-readable text grouped by file. */
function formatText(findings) {
  const byFile = new Map();
  for (const f of findings) {
    if (!byFile.has(f.file)) byFile.set(f.file, []);
    byFile.get(f.file).push(f);
  }
  let errors = 0;
  let warnings = 0;
  const chunks = [];
  for (const [file, list] of byFile) {
    list.sort((a, b) => a.line - b.line || a.column - b.column);
    const rel = relative(process.cwd(), file) || file;
    chunks.push(rel);
    for (const f of list) {
      if (f.severity === "error") errors++;
      else warnings++;
      const loc = `${f.line}:${f.column}`.padStart(7);
      const sev = f.severity.padEnd(7);
      const suffix = f.suggestion ? `  -> ${f.suggestion}` : "";
      chunks.push(`${loc}  ${sev}  ${f.rule}  ${f.message}${suffix}`);
    }
    chunks.push("");
  }
  const total = errors + warnings;
  if (total === 0) {
    chunks.push("✔ 0 problems");
  } else {
    chunks.push(`✖ ${total} problems (${errors} errors, ${warnings} warnings)`);
  }
  return { text: chunks.join("\n"), errors, warnings };
}

/** Parse argv into paths + flags. */
function parseArgs(argv) {
  const paths = [];
  let json = false;
  let errorsOnly = false;
  for (const arg of argv) {
    if (arg === "--json") json = true;
    else if (arg === "--errors-only") errorsOnly = true;
    else if (arg.startsWith("--")) {
      // unknown flag — ignore quietly
    } else paths.push(arg);
  }
  if (paths.length === 0) {
    paths.push(existsSync("./src") ? "./src" : ".");
  }
  return { paths, json, errorsOnly };
}

/** CLI entry point. Returns the process exit code. */
export function main(argv = process.argv.slice(2)) {
  const { paths, json, errorsOnly } = parseArgs(argv);
  const { findings } = lintPaths(paths, { errorsOnly });
  if (json) {
    process.stdout.write(JSON.stringify(findings, null, 2) + "\n");
  } else {
    const { text } = formatText(findings);
    process.stdout.write(text + "\n");
  }
  return findings.some((f) => f.severity === "error") ? 1 : 0;
}
