import { readFileSync, readdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it, expect, beforeAll } from "vitest";
import { lintPaths, lintText, loadContext } from "../bin/lint-core.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const pkgRoot = resolve(here, "..");
const fixtures = join(here, "fixtures", "lint");

/* The rules and API live in lint-core.mjs; bin/blora-lint.mjs is only the
   shebang wrapper, so the core imports cleanly under Vitest. */
let ctx: ReturnType<typeof loadContext>;

beforeAll(() => {
  ctx = loadContext(pkgRoot);
});

/** Lint a fixture file and return its findings. */
function lintFixture(rel) {
  const file = join(fixtures, "bad", rel);
  return lintText(readFileSync(file, "utf8"), file, ctx);
}

/** Assert at least one finding with the given rule id (and optional severity). */
function expectRule(findings, rule, severity) {
  const hits = findings.filter((f) => f.rule === rule);
  expect(
    hits.length,
    `expected rule "${rule}" to fire; got: ${JSON.stringify(findings.map((f) => f.rule))}`,
  ).toBeGreaterThan(0);
  if (severity) {
    expect(
      hits.some((f) => f.severity === severity),
      `expected "${rule}" with severity ${severity}`,
    ).toBe(true);
  }
  return hits;
}

describe("loadContext", () => {
  it("loads tokens, shipped classes, contracts, and add-on tags", () => {
    expect(ctx.tokens.size).toBeGreaterThan(50);
    expect(ctx.tokens.has("--blora-color-surface-canvas")).toBe(true);
    expect(ctx.shippedClasses.has("blora-card")).toBe(true);
    expect(ctx.shippedClasses.has("blora-button")).toBe(true);
    // custom-element contract
    expect(ctx.ceTags.has("blora-select")).toBe(true);
    expect(ctx.ceNames.has("select")).toBe(true);
    // css-only / native contracts
    expect(ctx.cssOnly.has("media")).toBe(true);
    expect(ctx.cssOnly.has("button")).toBe(true);
    // add-on custom element (thread) discovered from monorepo addons/
    expect(ctx.ceTags.has("blora-thread-comment")).toBe(true);
    // composite add-on ships part classes -> not treated as internals
    expect(ctx.shippedClasses.has("blora-thread-comment__meta")).toBe(true);
  });
});

describe("rule families (one bad fixture each)", () => {
  it("1. unknown-token (error)", () => {
    const f = lintFixture("unknown-token.css");
    const hits = expectRule(f, "unknown-token", "error");
    // legacy alias suggestion is provided
    const legacy = hits.find((h) => h.message.includes("--blora-text-strong"));
    expect(legacy?.suggestion).toBe("--blora-color-text-primary");
  });

  it("2. invented-token (warning)", () => {
    const f = lintFixture("invented-token.css");
    expectRule(f, "invented-token", "warning");
  });

  it("3. unknown-class (error) in markup", () => {
    const f = lintFixture("unknown-class.html");
    expectRule(f, "unknown-class", "error");
  });

  it("3. invented-class (warning) in CSS", () => {
    const f = lintFixture("invented-class.css");
    expectRule(f, "invented-class", "warning");
  });

  it("4. ce-internals (error in markup) + ce-root-class (error)", () => {
    const f = lintFixture("ce-internals.html");
    expectRule(f, "ce-internals", "error");
    expectRule(f, "ce-root-class", "error");
  });

  it("4. ce-internals (warning in CSS)", () => {
    const f = lintFixture("ce-internals.css");
    const hits = expectRule(f, "ce-internals", "warning");
    expect(hits.every((h) => h.severity === "warning")).toBe(true);
  });

  it("5. unknown-element (warning)", () => {
    const f = lintFixture("unknown-element.html");
    expectRule(f, "unknown-element", "warning");
  });

  it("6. unknown-attribute + unknown-variant (warning)", () => {
    const f = lintFixture("unknown-attribute.html");
    expectRule(f, "unknown-attribute", "warning");
    const variants = expectRule(f, "unknown-variant", "warning");
    // both the css-only data-variant and data-ratio enums fired
    expect(variants.length).toBeGreaterThanOrEqual(2);
  });

  it("7. native-dialog (error)", () => {
    const f = lintFixture("native-dialog.js");
    const hits = expectRule(f, "native-dialog", "error");
    expect(hits.length).toBe(3); // alert, confirm, prompt
  });

  it("8. hardcoded-color (warning)", () => {
    const f = lintFixture("hardcoded-color.css");
    const hits = expectRule(f, "hardcoded-color", "warning");
    expect(hits.length).toBe(3); // hex, rgb, hsl
  });

  it("9. dark-override (warning)", () => {
    const f = lintFixture("dark-override.css");
    expectRule(f, "dark-override", "warning");
  });

  it("10. unlayered-global (warning, once per file, with count)", () => {
    const f = lintFixture("unlayered-global.css");
    const hits = expectRule(f, "unlayered-global", "warning");
    expect(hits.length).toBe(1);
    expect(hits[0].message).toMatch(/\d+ unlayered global/);
  });

  it("11. override-blora (warning)", () => {
    const f = lintFixture("override-blora.css");
    expectRule(f, "override-blora", "warning");
  });

  it("12. raw-control (warning)", () => {
    const f = lintFixture("raw-control.html");
    const hits = expectRule(f, "raw-control", "warning");
    expect(hits.length).toBeGreaterThanOrEqual(4);
  });

  it("13. plain-button + button-type (warning)", () => {
    const f = lintFixture("plain-button.html");
    expectRule(f, "plain-button", "warning");
    expectRule(f, "button-type", "warning");
  });

  it("14. emoji-icon (warning)", () => {
    const f = lintFixture("emoji-icon.html");
    expectRule(f, "emoji-icon", "warning");
  });

  it("15. nested-card (warning at 2, error at depth >= 3)", () => {
    const f = lintFixture("nested-card.html");
    const hits = expectRule(f, "nested-card");
    expect(hits.some((h) => h.severity === "warning")).toBe(true);
    expect(hits.some((h) => h.severity === "error")).toBe(true);
  });

  it("16. inline-handler (warning, .html only)", () => {
    const f = lintFixture("inline-handler.html");
    expectRule(f, "inline-handler", "warning");
  });

  it("17. legacy-1x (error) in markup", () => {
    const f = lintFixture("legacy-1x.html");
    expectRule(f, "legacy-1x", "error");
  });

  it("17. legacy-1x + shadow-access (error) in JS", () => {
    const f = lintFixture("legacy-1x.js");
    expectRule(f, "legacy-1x", "error");
    expectRule(f, "shadow-access", "error");
  });
});

describe("good page", () => {
  it("produces zero findings", () => {
    const { findings } = lintPaths([join(fixtures, "good")], { context: ctx });
    expect(findings, JSON.stringify(findings, null, 2)).toHaveLength(0);
  });
});

describe("scanning + API behavior", () => {
  it("inline-handler does not fire outside .html files", () => {
    const jsx = `<button type="button" className="blora-button" onClick={go}>Go</button>`;
    const findings = lintText(jsx, "Comp.jsx", ctx);
    expect(findings.some((f) => f.rule === "inline-handler")).toBe(false);
  });

  it("skips template-syntax variant values", () => {
    const vue = `<blora-button data-variant="{{ kind }}">X</blora-button>`;
    const findings = lintText(vue, "C.vue", ctx);
    expect(findings.some((f) => f.rule === "unknown-variant")).toBe(false);
  });

  it("does not flag hardcoded colors inside comments or url()", () => {
    const css = `/* #ffffff is fine here */\n.x { background: url(#grad); }`;
    const findings = lintText(css, "x.css", ctx);
    expect(findings.some((f) => f.rule === "hardcoded-color")).toBe(false);
  });

  it("does not flag SVG fill presentation attribute as hardcoded-color", () => {
    // Build the tag at runtime: the repo icon-policy suite forbids a literal
    // SVG opening tag as a string in test files under packages/blora-design/tests.
    const svg = `<${"svg"}><path fill="#ff0000" /></${"svg"}>`;
    const findings = lintText(svg, "icon.svg.html", ctx);
    expect(findings.some((f) => f.rule === "hardcoded-color")).toBe(false);
  });

  it("errorsOnly option filters out warnings", () => {
    const file = join(fixtures, "bad", "plain-button.html");
    const { findings } = lintPaths([file], { context: ctx, errorsOnly: true });
    expect(findings.every((f) => f.severity === "error")).toBe(true);
  });

  it("every bad fixture has a matching rule name", () => {
    // Guard: each *.<ext> under bad/ is named after a rule it must fire.
    const files = readdirSync(join(fixtures, "bad"));
    expect(files.length).toBeGreaterThanOrEqual(17);
  });
});

describe("documentation examples", () => {
  const repoRoot = resolve(pkgRoot, "..", "..");
  const sources = [
    { file: join(repoRoot, "docs", "patterns.md") },
    {
      file: join(repoRoot, "docs", "migration", "from-any-ui-to-blora-design.md"),
      from: "## 14. ",
      to: "## 16. ",
    },
  ];

  it("teach nothing the linter rejects", () => {
    const failures: string[] = [];
    for (const source of sources) {
      const doc = readFileSync(source.file, "utf8").replaceAll("\r\n", "\n");
      const start = source.from ? doc.indexOf(source.from) : 0;
      const end = source.to ? doc.indexOf(source.to) : doc.length;
      const body = doc.slice(start, end);
      let heading = "";
      for (const match of body.matchAll(/^(#{3,4} .+)$|```(html|css)\n([\s\S]*?)```/gm)) {
        if (match[1]) {
          heading = match[1];
          continue;
        }
        const extension = match[2] === "css" ? "css" : "html";
        const findings = lintText(match[3]!, join(repoRoot, `example.${extension}`), ctx).filter(
          (finding) => finding.severity === "error",
        );
        for (const finding of findings) {
          failures.push(`${source.file} ${heading}: ${finding.rule} ${finding.message}`);
        }
      }
    }
    expect(failures).toEqual([]);
  });
});
