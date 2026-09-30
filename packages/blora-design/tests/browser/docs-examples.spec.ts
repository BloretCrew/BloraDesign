/**
 * The migration standard is copied verbatim by people and AI agents, so every
 * HTML example in its per-component sections must mount real, defined Blora
 * elements that render something. This keeps the documentation executable.
 */
import { readFileSync, readdirSync } from "node:fs";
import { resolve } from "node:path";
import { expect, test } from "@playwright/test";

const packageRoot = resolve(import.meta.dirname, "..", "..");
const repoRoot = resolve(packageRoot, "..", "..");
const addons = ["effects", "layout", "markdown", "qrcode", "theming", "thread"];

const scripts = [
  resolve(packageRoot, "dist", "blora.global.js"),
  resolve(packageRoot, "dist", "icons-full.global.js"),
  ...addons.map((name) => resolve(repoRoot, "addons", name, "dist", `${name}.global.js`)),
]
  .map((file) => `<script>${readFileSync(file, "utf8")}</script>`)
  .join("\n");

const styles = [
  resolve(packageRoot, "dist", "tokens.css"),
  resolve(packageRoot, "dist", "foundations", "reset.css"),
  resolve(packageRoot, "dist", "foundations", "base.css"),
  resolve(packageRoot, "dist", "foundations", "layout.css"),
]
  .map((file) => readFileSync(file, "utf8"))
  .join("\n");

interface Example {
  heading: string;
  html: string;
}

/** tagName -> attributes declared by the core and add-on contracts. */
function contractAttributes(): Record<string, string[]> {
  const map: Record<string, string[]> = {};
  const coreDir = resolve(packageRoot, "contracts");
  for (const file of readdirSync(coreDir).filter((name) => name.endsWith(".contract.json"))) {
    const contract = JSON.parse(readFileSync(resolve(coreDir, file), "utf8"));
    if (contract.tagName) map[contract.tagName] = Object.keys(contract.attributes ?? {});
  }
  for (const addon of addons) {
    const dir = resolve(repoRoot, "addons", addon, "contracts");
    for (const file of readdirSync(dir).filter((name) => name.endsWith(".json"))) {
      const contract = JSON.parse(readFileSync(resolve(dir, file), "utf8"));
      for (const [tag, definition] of Object.entries<{ attributes?: unknown }>(
        contract.customElements ?? {},
      )) {
        const attributes = definition.attributes;
        map[tag] = Array.isArray(attributes)
          ? attributes.map(String)
          : Object.keys((attributes as Record<string, unknown>) ?? {});
      }
    }
  }
  return map;
}

/** Every `.blora-*` class shipped by the core and add-on CSS bundles. */
function shippedClasses(): Set<string> {
  const classes = new Set<string>();
  const walk = (dir: string) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const path = resolve(dir, entry.name);
      if (entry.isDirectory()) walk(path);
      else if (entry.name.endsWith(".css")) {
        for (const match of readFileSync(path, "utf8").matchAll(/\.(blora-[a-z0-9_-]+)/gi)) {
          classes.add(match[1]!);
        }
      }
    }
  };
  walk(resolve(packageRoot, "dist"));
  for (const addon of addons) walk(resolve(repoRoot, "addons", addon, "dist"));
  return classes;
}

/** HTML blocks of the executable documents, scripts removed. */
function examples(): Example[] {
  const sources: Array<{ file: string; from?: string; to?: string; label: string }> = [
    {
      file: resolve(repoRoot, "docs", "migration", "from-any-ui-to-blora-design.md"),
      from: "## 14. ",
      to: "## 16. ",
      label: "migration",
    },
    { file: resolve(repoRoot, "docs", "patterns.md"), label: "patterns" },
  ];
  const found: Example[] = [];
  for (const source of sources) {
    const doc = readFileSync(source.file, "utf8").replaceAll("\r\n", "\n");
    const start = source.from ? doc.indexOf(source.from) : 0;
    const end = source.to ? doc.indexOf(source.to) : doc.length;
    const body = doc.slice(start, end);
    let heading = "";
    for (const match of body.matchAll(/^(#{3,4} .+)$|```html\n([\s\S]*?)```/gm)) {
      if (match[1]) {
        heading = `${source.label} · ${match[1].replace(/^#+ /, "")}`;
      } else if (match[2]) {
        const html = match[2].replace(
          /<script\b(?![^>]*type="text\/markdown")[\s\S]*?<\/script>/g,
          "",
        );
        if (html.trim()) found.push({ heading, html });
      }
    }
  }
  return found;
}

test("every per-component migration example mounts defined, rendering elements", async ({
  page,
}) => {
  test.setTimeout(120_000);
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.setContent(
    `<!doctype html><html lang="zh-CN"><head><style>${styles}</style></head>
     <body class="blora-page blora-scope"><main id="mount"></main>${scripts}
     <script>globalThis.Blora.autoDefine();</script></body></html>`,
  );

  const list = examples();
  const allowed = contractAttributes();
  const classes = shippedClasses();
  expect(list.length).toBeGreaterThan(90);
  const failures: string[] = [];
  for (const example of list) {
    const report = await page.evaluate(
      async ({ html, allowed }) => {
        const mount = document.getElementById("mount")!;
        /* Trusted fixture text from our own docs; parsed inertly, then adopted
           so the custom elements upgrade on connection. */
        const parsed = new DOMParser().parseFromString(`<body>${html}</body>`, "text/html");
        const problems: string[] = [];
        /* Authored attributes must be declared by the contract (global HTML,
           ARIA and data-* attributes are always fine). */
        const global = new Set(["id", "class", "style", "slot", "hidden", "lang", "dir", "role"]);
        for (const element of parsed.body.querySelectorAll("*")) {
          const declared = allowed[element.localName];
          if (!declared) continue;
          for (const { name } of element.attributes) {
            if (global.has(name) || name.startsWith("aria-") || name.startsWith("data-")) continue;
            if (!declared.includes(name)) {
              problems.push(`<${element.localName}> has undeclared attribute "${name}"`);
            }
          }
        }
        mount.replaceChildren(
          ...[...parsed.body.childNodes].map((node) => document.importNode(node, true)),
        );
        await new Promise((done) => setTimeout(done, 30));
        const hosts = [...mount.querySelectorAll("*")].filter((element) =>
          element.localName.startsWith("blora-"),
        );
        const topLevel = hosts.filter((host) => {
          for (let node = host.parentElement; node && node !== mount; node = node.parentElement) {
            if (node.localName.startsWith("blora-")) return false;
          }
          return true;
        });
        /* Nested undefined tags (blora-option …) are declarative data consumed by
         their defined parent; only top-level hosts must be registered. */
        for (const host of topLevel) {
          if (!customElements.get(host.localName)) {
            problems.push(`<${host.localName}> is undefined`);
            continue;
          }
          const rendered =
            (host.shadowRoot?.childNodes.length ?? 0) > 0 ||
            host.querySelector("[data-blora-generated]") !== null ||
            [...host.children].some((child) => !child.localName.startsWith("blora-")) ||
            (host.children.length === 0 && (host.textContent ?? "").trim() !== "");
          if (!rendered) problems.push(`<${host.localName}> rendered no official tree`);
        }
        mount.replaceChildren();
        return problems;
      },
      { html: example.html, allowed },
    );
    for (const problem of report) failures.push(`${example.heading}: ${problem}`);
    for (const match of example.html.matchAll(/\bclass="([^"]*)"/g)) {
      for (const name of match[1]!.split(/\s+/)) {
        if (name.startsWith("blora-") && !classes.has(name)) {
          failures.push(`${example.heading}: class "${name}" is not shipped by any Blora CSS`);
        }
      }
    }
  }
  expect(failures).toEqual([]);
  expect(errors).toEqual([]);
});
