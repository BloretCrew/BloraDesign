import { describe, it, expect } from "vitest";
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

const foundationsDir = resolve(import.meta.dirname, "..", "src", "foundations");
const distDir = resolve(import.meta.dirname, "..", "dist");

describe("foundations CSS files", () => {
  it("reset.css exists and uses :where() for zero specificity", () => {
    const css = readFileSync(resolve(foundationsDir, "reset.css"), "utf8");
    expect(css).toContain(":where(body.blora-page");
    expect(css).toContain("box-sizing: border-box");
    // Should not use !important (Spec §8.3)
    expect(css).not.toContain("!important");
    expect(css).toContain("::selection");
    // Selection ink follows the theme text color on the mixed primary wash
    expect(css).toMatch(/::selection[^{]*\{[^}]*\bcolor:\s*var\(--blora-color-text-primary\)/);
  });

  it("base.css has typography, focus, and reduced-motion", () => {
    const css = readFileSync(resolve(foundationsDir, "base.css"), "utf8");
    expect(css).toContain(".blora-h1");
    expect(css).toContain("--blora-font-heading");
    expect(css).toContain(":focus-visible");
    expect(css).toContain("prefers-reduced-motion");
  });

  it("base.css uses logical properties for RTL", () => {
    const css = readFileSync(resolve(foundationsDir, "base.css"), "utf8");
    expect(css).toContain("border-inline-start");
    expect(css).toContain("inset-inline-end");
    // Should not use left/right for logical directions
    expect(css).not.toMatch(/\bborder-left\b/);
    expect(css).not.toMatch(/\bpadding-left\b/);
  });

  it("layout.css has container and grid; stack spacing ships in the utilities layer", () => {
    const css = readFileSync(resolve(foundationsDir, "layout.css"), "utf8");
    expect(css).toContain(".blora-container");
    expect(css).toContain(".blora-grid");
    expect(css).toContain("container-type: inline-size");
    expect(css).toContain("@container");
    const stack = readFileSync(resolve(foundationsDir, "stack.css"), "utf8");
    expect(stack).toContain(".blora-stack > * + *");
    const entry = readFileSync(resolve(import.meta.dirname, "..", "src", "blora.css"), "utf8");
    expect(entry).toContain('@import "./foundations/stack.css" layer(blora.utilities);');
    // Divider shipped as its own component entry after the layout split
    const dividerCss = readFileSync(
      resolve(import.meta.dirname, "..", "src", "components", "divider", "divider.css"),
      "utf8",
    );
    expect(dividerCss).toContain(".blora-divider");
  });

  it("layout.css uses logical properties", () => {
    const css = readFileSync(resolve(foundationsDir, "layout.css"), "utf8");
    expect(css).toContain("margin-inline");
    expect(css).toContain("padding-inline");
    expect(css).toContain("inset-inline-end");
    // Should not use physical left/right for logical directions
    expect(css).not.toMatch(/\bpadding-right\b/);
  });

  it("utilities.css has minimal set", () => {
    const css = readFileSync(resolve(foundationsDir, "utilities.css"), "utf8");
    expect(css).toContain(".blora-sr-only");
    expect(css).toContain(".blora-hidden");
    expect(css).toContain(".blora-text-start");
    expect(css).toContain(".blora-text-center");
  });

  it("blora.css entry has @layer declaration in correct order", () => {
    const css = readFileSync(resolve(import.meta.dirname, "..", "src", "blora.css"), "utf8");
    expect(css).toContain(
      "@layer blora.tokens, blora.reset, blora.base, blora.components, blora.utilities",
    );
  });
});

describe("built foundations output", () => {
  it("dist contains foundations.css and blora.css", () => {
    expect(existsSync(resolve(distDir, "foundations.css"))).toBe(true);
    expect(existsSync(resolve(distDir, "blora.css"))).toBe(true);
    expect(existsSync(resolve(distDir, "reset.css"))).toBe(true);
    expect(existsSync(resolve(distDir, "foundations", "reset.css"))).toBe(true);
    expect(existsSync(resolve(distDir, "foundations", "base.css"))).toBe(true);
    expect(existsSync(resolve(distDir, "foundations", "layout.css"))).toBe(true);
  });

  it("dist/blora.css has @layer and @import", () => {
    const css = readFileSync(resolve(distDir, "blora.css"), "utf8");
    expect(css).toContain("@layer");
    expect(css).toContain("blora.tokens");
    expect(css).toContain("blora.reset");
    expect(css).toContain("blora.base");
    expect(css).toContain("blora.utilities");
  });
});
