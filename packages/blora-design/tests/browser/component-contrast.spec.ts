import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { expect, test } from "@playwright/test";

const packageRoot = resolve(import.meta.dirname, "..", "..");
const repoRoot = resolve(packageRoot, "..", "..");
const css =
  [
    resolve(packageRoot, "dist", "tokens.css"),
    resolve(packageRoot, "dist", "tokens.dark.css"),
    resolve(packageRoot, "dist", "tokens.themes.css"),
    resolve(packageRoot, "src", "components", "alert", "alert.css"),
    resolve(packageRoot, "src", "components", "avatar", "avatar.css"),
    resolve(packageRoot, "src", "components", "badge", "badge.css"),
    resolve(packageRoot, "src", "components", "button", "button.css"),
    resolve(packageRoot, "src", "components", "tag", "tag.css"),
    resolve(packageRoot, "src", "components", "statistic", "statistic.css"),
  ]
    .map((file) => readFileSync(file, "utf8"))
    .join("\n") + "\n* { transition: none !important; animation: none !important; }";

const themes = ["coral", "indigo", "graphite", "mono", "circuit", "dusk"];
const replicaPages = [
  resolve(repoRoot, "examples", "bbbs-replica", "index.html"),
  resolve(repoRoot, "examples", "bbbs-replica", "thread.html"),
];

interface ContrastResult {
  key: string;
  ratio: number;
  foreground: string;
  background: string;
}

async function measureContrast(page: import("@playwright/test").Page): Promise<ContrastResult[]> {
  return page.evaluate(() => {
    type Color = [number, number, number, number];
    const parseColor = (value: string): Color => {
      const numbers = value.match(/[\d.]+/g)?.map(Number) ?? [];
      if (value.startsWith("color(srgb")) {
        return [
          (numbers[0] ?? 0) * 255,
          (numbers[1] ?? 0) * 255,
          (numbers[2] ?? 0) * 255,
          numbers[3] ?? 1,
        ];
      }
      return [numbers[0] ?? 0, numbers[1] ?? 0, numbers[2] ?? 0, numbers[3] ?? 1];
    };
    const composite = (foreground: Color, background: Color): Color => {
      const alpha = foreground[3] + background[3] * (1 - foreground[3]);
      if (!alpha) return [0, 0, 0, 0];
      return [
        (foreground[0] * foreground[3] + background[0] * background[3] * (1 - foreground[3])) /
          alpha,
        (foreground[1] * foreground[3] + background[1] * background[3] * (1 - foreground[3])) /
          alpha,
        (foreground[2] * foreground[3] + background[2] * background[3] * (1 - foreground[3])) /
          alpha,
        alpha,
      ];
    };
    const backgroundFor = (element: Element): Color => {
      const chain: Element[] = [];
      for (let node: Element | null = element; node; node = node.parentElement) chain.push(node);
      let background: Color = [255, 255, 255, 1];
      for (const node of chain.reverse()) {
        background = composite(parseColor(getComputedStyle(node).backgroundColor), background);
      }
      return background;
    };
    const luminance = (color: Color): number => {
      const channels = color.slice(0, 3).map((channel) => {
        const normalized = channel / 255;
        return normalized <= 0.04045 ? normalized / 12.92 : ((normalized + 0.055) / 1.055) ** 2.4;
      });
      return 0.2126 * channels[0]! + 0.7152 * channels[1]! + 0.0722 * channels[2]!;
    };
    const contrast = (first: Color, second: Color): number => {
      const a = luminance(first);
      const b = luminance(second);
      return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
    };
    const cumulativeOpacity = (element: Element): number => {
      let opacity = 1;
      for (let node: Element | null = element; node; node = node.parentElement) {
        opacity *= Number.parseFloat(getComputedStyle(node).opacity) || 1;
      }
      return opacity;
    };
    return [...document.querySelectorAll<HTMLElement>("[data-contrast-key]")].map((element) => {
      const style = getComputedStyle(element);
      const background = backgroundFor(element);
      const parsedForeground = parseColor(style.color);
      parsedForeground[3] *= cumulativeOpacity(element);
      const renderedForeground = composite(parsedForeground, background);
      return {
        key: element.dataset.contrastKey!,
        ratio: contrast(renderedForeground, background),
        foreground: style.color,
        background: `rgb(${background.slice(0, 3).map(Math.round).join(", ")})`,
      };
    });
  });
}

test("component text variants keep WCAG AA contrast across every theme", async ({ page }) => {
  test.setTimeout(120_000);
  await page.setContent(`<!doctype html>
    <html data-blora-theme="coral" data-blora-color-scheme="light">
      <head><style>${css}</style></head>
      <body class="blora-page blora-scope">
        <main style="background:var(--blora-color-surface-default);padding:2rem;display:flex;gap:1rem;flex-wrap:wrap">
          <span class="blora-avatar" data-contrast-key="avatar-default">Aa</span>
          <span class="blora-avatar" data-variant="primary" data-contrast-key="avatar-primary">Aa</span>
          <span class="blora-avatar" data-variant="neutral" data-contrast-key="avatar-neutral">Aa</span>
          <span class="blora-avatar" data-variant="info" data-contrast-key="avatar-info">Aa</span>
          <span class="blora-avatar" data-variant="success" data-contrast-key="avatar-success">Aa</span>

          <span class="blora-badge" data-contrast-key="badge-primary">Badge</span>
          <span class="blora-badge" data-variant="neutral" data-contrast-key="badge-neutral">Badge</span>
          <span class="blora-badge" data-variant="info" data-contrast-key="badge-info">Badge</span>
          <span class="blora-badge" data-variant="success" data-contrast-key="badge-success">Badge</span>
          <span class="blora-badge" data-variant="warning" data-contrast-key="badge-warning">Badge</span>
          <span class="blora-badge" data-variant="danger" data-contrast-key="badge-danger">Badge</span>

          <span class="blora-tag" data-contrast-key="tag-default">Tag</span>
          <span class="blora-tag" data-variant="primary" data-contrast-key="tag-primary">Tag</span>
          <span class="blora-tag" data-variant="neutral" data-contrast-key="tag-neutral">Tag</span>
          <span class="blora-tag" data-variant="info" data-contrast-key="tag-info">Tag</span>
          <span class="blora-tag" data-variant="success" data-contrast-key="tag-success">Tag</span>
          <span class="blora-tag" data-variant="warning" data-contrast-key="tag-warning">Tag</span>
          <span class="blora-tag" data-variant="danger" data-contrast-key="tag-danger">Tag</span>
          <div class="blora-stat"><div class="blora-stat__label" data-contrast-key="stat-label">本月访问</div></div>

          <button class="blora-button" data-variant="primary" data-contrast-key="button-primary">Primary</button>
          <button class="blora-button" data-variant="secondary" data-contrast-key="button-secondary">Secondary</button>
          <button class="blora-button" data-variant="ghost" data-contrast-key="button-ghost">Ghost</button>
          <button class="blora-button" data-variant="outline" data-contrast-key="button-outline">Outline</button>
          <button class="blora-button" data-variant="danger" data-contrast-key="button-danger">Danger</button>

          ${["info", "success", "warning", "danger"]
            .map(
              (variant) => `<div class="blora-alert" data-variant="${variant}">
                <span class="blora-alert__icon" aria-hidden="true">●</span>
                <div class="blora-alert__body">
                  <div class="blora-alert__title" data-contrast-key="alert-${variant}-title">${variant}</div>
                  <div class="blora-alert__desc" data-contrast-key="alert-${variant}-description">Description</div>
                </div>
              </div>`,
            )
            .join("")}
        </main>
      </body>
    </html>`);

  const failures: string[] = [];
  for (const theme of themes) {
    for (const scheme of ["light", "dark"] as const) {
      await page.locator("html").evaluate(
        (root, state) => {
          root.setAttribute("data-blora-theme", state.theme);
          root.setAttribute("data-blora-color-scheme", state.scheme);
        },
        { theme, scheme },
      );
      await page.waitForTimeout(300);
      for (const result of await measureContrast(page)) {
        if (result.ratio < 4.5) {
          failures.push(
            `${theme}/${scheme} ${result.key}: ${result.ratio.toFixed(2)}:1 (${result.foreground} on ${result.background})`,
          );
        }
      }
    }
  }

  expect(failures).toEqual([]);
});

test("BBBS replica visible text keeps WCAG AA contrast across every theme", async ({ page }) => {
  const failures: string[] = [];

  for (const replicaPage of replicaPages) {
    await page.goto(pathToFileURL(replicaPage).href);
    await page.waitForFunction(() => customElements.get("blora-sidebar-layout"));
    if (replicaPage.endsWith("thread.html")) {
      await page.waitForFunction(() => customElements.get("blora-thread-comment"));
    }

    for (const theme of themes) {
      for (const scheme of ["light", "dark"] as const) {
        await page.locator("html").evaluate(
          (root, state) => {
            root.setAttribute("data-blora-theme", state.theme);
            root.setAttribute("data-blora-color-scheme", state.scheme);
          },
          { theme, scheme },
        );
        await page.waitForTimeout(300);

        const results = await page.evaluate(() => {
          type Color = [number, number, number, number];
          const parseColor = (value: string): Color => {
            const numbers = value.match(/[\d.]+/g)?.map(Number) ?? [];
            if (value.startsWith("color(srgb")) {
              return [
                (numbers[0] ?? 0) * 255,
                (numbers[1] ?? 0) * 255,
                (numbers[2] ?? 0) * 255,
                numbers[3] ?? 1,
              ];
            }
            return [numbers[0] ?? 0, numbers[1] ?? 0, numbers[2] ?? 0, numbers[3] ?? 1];
          };
          const composite = (foreground: Color, background: Color): Color => {
            const alpha = foreground[3] + background[3] * (1 - foreground[3]);
            if (!alpha) return [0, 0, 0, 0];
            return [
              (foreground[0] * foreground[3] +
                background[0] * background[3] * (1 - foreground[3])) /
                alpha,
              (foreground[1] * foreground[3] +
                background[1] * background[3] * (1 - foreground[3])) /
                alpha,
              (foreground[2] * foreground[3] +
                background[2] * background[3] * (1 - foreground[3])) /
                alpha,
              alpha,
            ];
          };
          const backgroundFor = (element: Element): Color => {
            const chain: Element[] = [];
            for (let node: Element | null = element; node; node = node.parentElement)
              chain.push(node);
            let background: Color = [255, 255, 255, 1];
            for (const node of chain.reverse()) {
              background = composite(
                parseColor(getComputedStyle(node).backgroundColor),
                background,
              );
            }
            return background;
          };
          const luminance = (color: Color): number => {
            const channels = color.slice(0, 3).map((channel) => {
              const normalized = channel / 255;
              return normalized <= 0.04045
                ? normalized / 12.92
                : ((normalized + 0.055) / 1.055) ** 2.4;
            });
            return 0.2126 * channels[0]! + 0.7152 * channels[1]! + 0.0722 * channels[2]!;
          };
          const contrast = (first: Color, second: Color): number => {
            const a = luminance(first);
            const b = luminance(second);
            return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
          };
          const cumulativeOpacity = (element: Element): number => {
            let opacity = 1;
            for (let node: Element | null = element; node; node = node.parentElement) {
              opacity *= Number.parseFloat(getComputedStyle(node).opacity) || 1;
            }
            return opacity;
          };
          const pathFor = (element: Element): string => {
            const id = element.id ? `#${element.id}` : "";
            const classes = [...element.classList]
              .slice(0, 2)
              .map((name) => `.${name}`)
              .join("");
            return `${element.localName}${id}${classes}`;
          };
          const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
          const rows: Array<{
            key: string;
            text: string;
            ratio: number;
            threshold: number;
            foreground: string;
            background: string;
          }> = [];
          const seen = new Set<string>();
          for (let node = walker.nextNode(); node; node = walker.nextNode()) {
            const text = node.textContent?.trim().replace(/\s+/g, " ") ?? "";
            const element = node.parentElement;
            if (!text || !element) continue;
            if (element.closest("script, style, template, [hidden], [aria-hidden='true']"))
              continue;
            if (element.closest(":disabled, [aria-disabled='true']")) continue;
            const style = getComputedStyle(element);
            if (
              style.display === "none" ||
              style.visibility === "hidden" ||
              Number.parseFloat(style.opacity) === 0 ||
              element.getClientRects().length === 0
            ) {
              continue;
            }
            const key = `${pathFor(element)}:${text.slice(0, 60)}`;
            if (seen.has(key)) continue;
            seen.add(key);
            const background = backgroundFor(element);
            const foreground = parseColor(style.color);
            foreground[3] *= cumulativeOpacity(element);
            const renderedForeground = composite(foreground, background);
            const fontSize = Number.parseFloat(style.fontSize);
            const fontWeight = Number.parseFloat(style.fontWeight) || 400;
            const large = fontSize >= 24 || (fontSize >= 18.66 && fontWeight >= 700);
            rows.push({
              key: pathFor(element),
              text: text.slice(0, 60),
              ratio: contrast(renderedForeground, background),
              threshold: large ? 3 : 4.5,
              foreground: style.color,
              background: `rgb(${background.slice(0, 3).map(Math.round).join(", ")})`,
            });
          }
          return rows;
        });

        for (const result of results) {
          if (result.ratio + 0.01 < result.threshold) {
            failures.push(
              `${replicaPage.split(/[\\/]/).pop()} ${theme}/${scheme} ${result.key} “${result.text}”: ${result.ratio.toFixed(2)}:1 < ${result.threshold}:1 (${result.foreground} on ${result.background})`,
            );
          }
        }
      }
    }
  }

  expect(failures).toEqual([]);
});

test("BBBS replica visible icons keep WCAG non-text contrast across every theme", async ({
  page,
}) => {
  const failures: string[] = [];

  for (const replicaPage of replicaPages) {
    await page.goto(pathToFileURL(replicaPage).href);
    await page.waitForFunction(() => customElements.get("blora-sidebar-layout"));
    if (replicaPage.endsWith("thread.html")) {
      await page.waitForFunction(() => customElements.get("blora-thread-comment"));
    }

    for (const theme of themes) {
      for (const scheme of ["light", "dark"] as const) {
        await page.locator("html").evaluate(
          (root, state) => {
            root.setAttribute("data-blora-theme", state.theme);
            root.setAttribute("data-blora-color-scheme", state.scheme);
          },
          { theme, scheme },
        );
        await page.waitForTimeout(300);

        const results = await page.evaluate(() => {
          type Color = [number, number, number, number];
          const parseColor = (value: string): Color => {
            const numbers = value.match(/[\d.]+/g)?.map(Number) ?? [];
            if (value.startsWith("color(srgb")) {
              return [
                (numbers[0] ?? 0) * 255,
                (numbers[1] ?? 0) * 255,
                (numbers[2] ?? 0) * 255,
                numbers[3] ?? 1,
              ];
            }
            return [numbers[0] ?? 0, numbers[1] ?? 0, numbers[2] ?? 0, numbers[3] ?? 1];
          };
          const composite = (foreground: Color, background: Color): Color => {
            const alpha = foreground[3] + background[3] * (1 - foreground[3]);
            if (!alpha) return [0, 0, 0, 0];
            return [
              (foreground[0] * foreground[3] +
                background[0] * background[3] * (1 - foreground[3])) /
                alpha,
              (foreground[1] * foreground[3] +
                background[1] * background[3] * (1 - foreground[3])) /
                alpha,
              (foreground[2] * foreground[3] +
                background[2] * background[3] * (1 - foreground[3])) /
                alpha,
              alpha,
            ];
          };
          const backgroundFor = (element: Element): Color => {
            const chain: Element[] = [];
            for (let node: Element | null = element; node; node = node.parentElement)
              chain.push(node);
            let background: Color = [255, 255, 255, 1];
            for (const node of chain.reverse()) {
              background = composite(
                parseColor(getComputedStyle(node).backgroundColor),
                background,
              );
            }
            return background;
          };
          const luminance = (color: Color): number => {
            const channels = color.slice(0, 3).map((channel) => {
              const normalized = channel / 255;
              return normalized <= 0.04045
                ? normalized / 12.92
                : ((normalized + 0.055) / 1.055) ** 2.4;
            });
            return 0.2126 * channels[0]! + 0.7152 * channels[1]! + 0.0722 * channels[2]!;
          };
          const contrast = (first: Color, second: Color): number => {
            const a = luminance(first);
            const b = luminance(second);
            return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
          };
          const pathFor = (element: Element): string => {
            const owner =
              element.closest<HTMLElement>("[data-icon], button, .feed-item__icon") ??
              element.parentElement;
            const icon = owner?.getAttribute("data-icon") ?? "";
            const classes = owner
              ? [...owner.classList]
                  .slice(0, 2)
                  .map((name) => `.${name}`)
                  .join("")
              : "";
            return `${owner?.localName ?? element.localName}${classes}${icon ? `[${icon}]` : ""}`;
          };
          const seen = new Set<string>();
          return [...document.querySelectorAll<SVGElement>("svg")]
            .filter((svg) => {
              if (svg.closest("[hidden]")) return false;
              const style = getComputedStyle(svg);
              return (
                style.display !== "none" &&
                style.visibility !== "hidden" &&
                Number.parseFloat(style.opacity) !== 0 &&
                svg.getClientRects().length > 0
              );
            })
            .map((svg) => {
              const style = getComputedStyle(svg);
              const owner =
                svg.closest<HTMLElement>("[data-icon], button, .feed-item__icon") ?? svg;
              const color = parseColor(style.color || getComputedStyle(owner).color);
              const background = backgroundFor(svg);
              const key = pathFor(svg);
              return {
                key,
                ratio: contrast(composite(color, background), background),
                foreground: style.color || getComputedStyle(owner).color,
                background: `rgb(${background.slice(0, 3).map(Math.round).join(", ")})`,
              };
            })
            .filter((result) => {
              const signature = `${result.key}:${result.foreground}:${result.background}`;
              if (seen.has(signature)) return false;
              seen.add(signature);
              return true;
            });
        });

        for (const result of results) {
          if (result.ratio + 0.01 < 3) {
            failures.push(
              `${replicaPage.split(/[\\/]/).pop()} ${theme}/${scheme} ${result.key}: ${result.ratio.toFixed(2)}:1 < 3:1 (${result.foreground} on ${result.background})`,
            );
          }
        }
      }
    }
  }

  expect(failures).toEqual([]);
});
