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
  expect(hit.indicatorZ).toBeLessThan(hit.tabZ);
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
