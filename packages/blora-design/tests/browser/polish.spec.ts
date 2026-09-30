/**
 * Regression gates for the 2.0.9 polish pass: states that rendered but were
 * unreadable, detached or indistinguishable in the showcase audit.
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { expect, test } from "@playwright/test";

const distDir = resolve(import.meta.dirname, "..", "..", "dist");
const globalJs = readFileSync(resolve(distDir, "blora.global.js"), "utf8");

function css(...files: string[]): string {
  return files.map((file) => readFileSync(resolve(distDir, file), "utf8")).join("\n");
}

function componentCss(...names: string[]): string {
  return css(
    "tokens.css",
    "foundations/reset.css",
    "foundations/base.css",
    ...names.map((name) => `components/${name}/${name}.css`),
  );
}

function page(styles: string, content: string, withRuntime = false): string {
  const runtime = withRuntime
    ? `<script>${globalJs}</script><script>globalThis.Blora.autoDefine()</script>`
    : "";
  return `<!doctype html><html lang="zh-CN"><head><style>${styles}</style></head><body class="blora-page blora-scope">${content}${runtime}</body></html>`;
}

test("pills Tabs paint the selected label above the sliding indicator", async ({ page: p }) => {
  await p.setContent(
    page(
      componentCss("tabs"),
      `<blora-tabs id="pills" variant="pills">
        <blora-tab label="概览" value="overview" selected>概览内容</blora-tab>
        <blora-tab label="活动" value="activity">活动内容</blora-tab>
      </blora-tabs>`,
      true,
    ),
  );
  const selected = p.locator('#pills .blora-tabs__tab[aria-selected="true"]');
  await expect(selected).toHaveText("概览");
  await expect(p.locator("#pills .blora-tabs__indicator")).toHaveCount(1);

  /* Hit-testing follows paint order once the indicator accepts pointer
     events, so the element on top at the label's centre must be the tab. */
  const hit = await selected.evaluate((tab) => {
    const indicator = tab.parentElement!.querySelector<HTMLElement>(".blora-tabs__indicator")!;
    indicator.style.pointerEvents = "auto";
    const rect = tab.getBoundingClientRect();
    const top = document.elementFromPoint(rect.left + rect.width / 2, rect.top + rect.height / 2);
    indicator.style.pointerEvents = "";
    return {
      topIsTab: top === tab || tab.contains(top),
      tabZ: Number(getComputedStyle(tab).zIndex),
      indicatorZ: Number(getComputedStyle(indicator).zIndex),
      color: getComputedStyle(tab).color,
      indicatorBackground: getComputedStyle(indicator).backgroundColor,
    };
  });
  expect(hit.topIsTab).toBe(true);
  expect(Number.isNaN(hit.indicatorZ) || hit.indicatorZ < hit.tabZ).toBe(true);
  expect(hit.color).not.toBe(hit.indicatorBackground);

  await p.locator("#pills .blora-tabs__tab").nth(1).click();
  const second = p.locator("#pills .blora-tabs__tab").nth(1);
  await expect(second).toHaveAttribute("aria-selected", "true");
  const secondOnTop = await second.evaluate((tab) => {
    const indicator = tab.parentElement!.querySelector<HTMLElement>(".blora-tabs__indicator")!;
    indicator.style.pointerEvents = "auto";
    const rect = tab.getBoundingClientRect();
    const top = document.elementFromPoint(rect.left + rect.width / 2, rect.top + rect.height / 2);
    indicator.style.pointerEvents = "";
    return top === tab || tab.contains(top);
  });
  expect(secondOnTop).toBe(true);
});

test("avatar badge and presence dot stay anchored to a stretched wrap", async ({ page: p }) => {
  await p.setContent(
    page(
      componentCss("avatar", "badge"),
      `<div style="display:grid;width:40rem">
        <div class="blora-avatar-wrap" id="badge-wrap">
          <div class="blora-avatar" data-size="lg" data-variant="primary">AB</div>
          <span class="blora-badge">3</span>
        </div>
        <div class="blora-avatar-wrap" id="dot-wrap">
          <div class="blora-avatar" data-size="lg" data-variant="primary">AB</div>
          <span class="blora-dot" data-variant="success" aria-label="在线"></span>
        </div>
      </div>`,
    ),
  );
  for (const [wrap, mark] of [
    ["#badge-wrap", ".blora-badge"],
    ["#dot-wrap", ".blora-dot"],
  ] as const) {
    const geometry = await p.locator(wrap).evaluate((root, selector) => {
      const avatar = root.querySelector(".blora-avatar")!.getBoundingClientRect();
      const badge = root.querySelector(selector)!.getBoundingClientRect();
      return {
        wrapWidth: root.getBoundingClientRect().width,
        avatarWidth: avatar.width,
        badgeCenterX: badge.left + badge.width / 2,
        avatarRight: avatar.right,
        avatarLeft: avatar.left,
        position: getComputedStyle(root.querySelector(selector)!).position,
      };
    }, mark);
    expect(geometry.position).toBe("absolute");
    expect(geometry.wrapWidth).toBeLessThan(geometry.avatarWidth + 2);
    expect(geometry.badgeCenterX).toBeGreaterThan(geometry.avatarLeft + geometry.avatarWidth / 2);
    expect(geometry.badgeCenterX).toBeLessThan(geometry.avatarRight + 8);
  }
});

test("tag semantic variants are visually distinct and include danger", async ({ page: p }) => {
  await p.setContent(
    page(
      componentCss("tag"),
      ["default", "primary", "info", "success", "warning", "danger"]
        .map(
          (variant) =>
            `<span class="blora-tag"${variant === "default" ? "" : ` data-variant="${variant}"`} data-key="${variant}">${variant}</span>`,
        )
        .join(""),
    ),
  );
  const styles = await p.locator("[data-key]").evaluateAll((tags) =>
    tags.map((tag) => ({
      key: (tag as HTMLElement).dataset.key,
      background: getComputedStyle(tag).backgroundColor,
      color: getComputedStyle(tag).color,
      border: getComputedStyle(tag).borderTopColor,
    })),
  );
  const backgrounds = new Set(styles.map((style) => style.background));
  const colors = new Set(styles.map((style) => style.color));
  expect(backgrounds.size).toBe(styles.length);
  expect(colors.size).toBeGreaterThanOrEqual(5);
  const danger = styles.find((style) => style.key === "danger")!;
  const fallback = styles.find((style) => style.key === "default")!;
  expect(danger.background).not.toBe(fallback.background);
  expect(danger.border).not.toBe(fallback.border);
});

test("disabled form controls share one sunken treatment", async ({ page: p }) => {
  await p.setContent(
    page(
      componentCss("input", "textarea", "select"),
      `<input class="blora-input" disabled value="x" id="input" />
       <textarea class="blora-textarea" disabled id="textarea">x</textarea>
       <blora-select id="select" label="状态" disabled>
         <blora-option value="a">A</blora-option>
       </blora-select>`,
      true,
    ),
  );
  const input = await p
    .locator("#input")
    .evaluate((element) => getComputedStyle(element).backgroundColor);
  const textarea = await p.locator("#textarea").evaluate((element) => ({
    background: getComputedStyle(element).backgroundColor,
    resize: getComputedStyle(element).resize,
  }));
  await expect(p.locator("#select")).toHaveAttribute("disabled", "");
  const select = await p.locator("#select").evaluate((host) => {
    const trigger = host.shadowRoot?.querySelector(".blora-select__trigger");
    return {
      background: trigger ? getComputedStyle(trigger).backgroundColor : "",
      opacity: getComputedStyle(host).opacity,
    };
  });
  expect(textarea.background).toBe(input);
  expect(textarea.resize).toBe("none");
  expect(select.background).toBe(input);
  expect(select.opacity).toBe("1");
});

test("navbar links never break inside a word in a narrow container", async ({ page: p }) => {
  await p.setContent(
    page(
      componentCss("navbar", "button"),
      `<div style="width:30rem">
        <blora-navbar title="Blora Design" brand-href="#">
          <blora-navbar-link label="设计规范" href="#a"></blora-navbar-link>
          <blora-navbar-link label="设计令牌" href="#b"></blora-navbar-link>
          <blora-navbar-link label="组件" href="#c"></blora-navbar-link>
          <blora-navbar-action label="开始使用" href="#d" variant="primary"></blora-navbar-action>
        </blora-navbar>
      </div>`,
      true,
    ),
  );
  const links = p.locator(".blora-navbar__link");
  await expect(links).toHaveCount(3);
  const measured = await links.evaluateAll((items) =>
    items.map((item) => {
      const range = document.createRange();
      range.selectNodeContents(item);
      const tops = new Set([...range.getClientRects()].map((rect) => Math.round(rect.top)));
      return { whiteSpace: getComputedStyle(item).whiteSpace, lines: tops.size };
    }),
  );
  for (const link of measured) {
    expect(link.whiteSpace).toBe("nowrap");
    expect(link.lines).toBe(1);
  }
});

test("square and circle icon buttons have different corner radii", async ({ page: p }) => {
  await p.setContent(
    page(
      componentCss("button"),
      `<button type="button" class="blora-button" data-size="icon" data-shape="square" aria-label="A" id="square">A</button>
       <button type="button" class="blora-button" data-size="icon" data-shape="circle" aria-label="B" id="circle">B</button>`,
    ),
  );
  const radius = async (selector: string) =>
    p.locator(selector).evaluate((element) => {
      const width = element.getBoundingClientRect().width;
      return parseFloat(getComputedStyle(element).borderTopLeftRadius) / width;
    });
  expect(await radius("#square")).toBeLessThan(0.4);
  expect(await radius("#circle")).toBeGreaterThanOrEqual(0.5);
});

test("status icons share the circled Lucide family", async ({ page: p }) => {
  await p.setContent(
    page(
      componentCss("alert"),
      ["info", "success", "warning", "danger"]
        .map(
          (variant) =>
            `<blora-alert variant="${variant}" title="${variant}" description="d" data-key="${variant}"></blora-alert>`,
        )
        .join(""),
      true,
    ),
  );
  const icons = await p
    .locator("blora-alert")
    .evaluateAll((alerts) =>
      alerts.map((alert) => alert.querySelector("svg")?.getAttribute("data-blora-icon") ?? ""),
    );
  expect(icons).toEqual(["info", "circle-check", "circle-alert", "circle-x"]);
});

test("card header aligns title block and actions without title margin drift", async ({
  page: p,
}) => {
  await p.setContent(
    page(
      componentCss("card", "button"),
      `<article class="blora-card" data-size="sm" style="width:36rem">
        <header class="blora-card__header">
          <div>
            <h2 class="blora-card__title">API 密钥</h2>
            <p class="blora-card__desc">仅自己管理的密钥</p>
          </div>
          <button type="button" class="blora-button" data-variant="primary" data-size="sm">创建</button>
        </header>
        <p class="blora-card__body">内容</p>
      </article>`,
    ),
  );
  const geometry = await p.locator(".blora-card").evaluate((card) => {
    const header = card.querySelector(".blora-card__header")!.getBoundingClientRect();
    const block = card.querySelector(".blora-card__header > div")!.getBoundingClientRect();
    const button = card.querySelector(".blora-button")!.getBoundingClientRect();
    const title = card.querySelector(".blora-card__title")!;
    return {
      padding: getComputedStyle(card).paddingTop,
      titleMargin: getComputedStyle(title).marginBottom,
      titleWeight: getComputedStyle(title).fontWeight,
      buttonRightGap: header.right - button.right,
      blockCenter: block.top + block.height / 2,
      buttonCenter: button.top + button.height / 2,
    };
  });
  expect(geometry.padding).toBe("24px");
  expect(geometry.titleMargin).toBe("0px");
  expect(Number(geometry.titleWeight)).toBeGreaterThanOrEqual(600);
  expect(Math.abs(geometry.buttonRightGap)).toBeLessThan(1);
  expect(Math.abs(geometry.blockCenter - geometry.buttonCenter)).toBeLessThan(2);
});
