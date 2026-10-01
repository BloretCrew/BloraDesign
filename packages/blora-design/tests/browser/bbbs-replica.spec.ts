import { test, expect } from "@playwright/test";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

const homePath = resolve(import.meta.dirname, "../../../..", "examples/bbbs-replica/index.html");
const threadPath = resolve(import.meta.dirname, "../../../..", "examples/bbbs-replica/thread.html");

async function sidebarGeometry(page: import("@playwright/test").Page) {
  return page.evaluate(() => {
    const aside = document.querySelector<HTMLElement>(".blora-sidebar-layout__aside")!;
    const search = document.querySelector<HTMLElement>("blora-search")!;
    const input = search.querySelector<HTMLInputElement>("input")!;
    const icon = search.querySelector<HTMLElement>(".blora-search__icon")!;
    const clear = search.querySelector<HTMLElement>(".blora-search__clear")!;
    const asideRect = aside.getBoundingClientRect();
    const searchRect = search.getBoundingClientRect();
    const inputRect = input.getBoundingClientRect();
    const iconRect = icon.getBoundingClientRect();
    const clearRect = clear.getBoundingClientRect();
    const asideStyle = getComputedStyle(aside);
    const bodyStyle = getComputedStyle(document.body);
    return {
      bodyClasses: [...document.body.classList],
      asideOverflowX: asideStyle.overflowX,
      asideScrollLeft: aside.scrollLeft,
      asideScrollWidth: aside.scrollWidth,
      asideClientWidth: aside.clientWidth,
      asideScrollbarColor: asideStyle.scrollbarColor,
      bodyScrollbarColor: bodyStyle.scrollbarColor,
      searchInsideAside:
        searchRect.left >= asideRect.left && searchRect.right <= asideRect.right + 0.5,
      inputInsideSearch:
        inputRect.left >= searchRect.left && inputRect.right <= searchRect.right + 0.5,
      iconInsideSearch:
        iconRect.left >= searchRect.left && iconRect.right <= searchRect.right + 0.5,
      clearInsideSearch:
        clear.hidden ||
        (clearRect.left >= searchRect.left && clearRect.right <= searchRect.right + 0.5),
      paletteLabelFits: (() => {
        const label = document.querySelector<HTMLElement>(".blora-palette-picker__label");
        return !label || label.scrollHeight <= label.clientHeight + 1;
      })(),
    };
  });
}

test("BBBS replica search and sidebar remain contained across theme changes", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 960 });
  await page.goto(pathToFileURL(homePath).href);
  await page.waitForFunction(
    () =>
      customElements.get("blora-sidebar-layout") &&
      customElements.get("blora-palette-picker") &&
      customElements.get("blora-search"),
  );
  await page.waitForTimeout(300);

  const initial = await sidebarGeometry(page);
  expect(initial.bodyClasses).toEqual(expect.arrayContaining(["blora-page", "blora-scope"]));
  expect(initial.asideOverflowX).toBe("hidden");
  expect(initial.asideScrollLeft).toBe(0);
  expect(initial.asideScrollWidth).toBeLessThanOrEqual(initial.asideClientWidth + 1);
  expect(initial.asideScrollbarColor).not.toBe("auto");
  expect(initial.bodyScrollbarColor).not.toBe("auto");
  expect(initial.searchInsideAside).toBe(true);
  expect(initial.inputInsideSearch).toBe(true);
  expect(initial.iconInsideSearch).toBe(true);
  expect(initial.clearInsideSearch).toBe(true);
  expect(initial.paletteLabelFits).toBe(true);

  const palette = page.locator("blora-palette-picker");
  const paletteRoot = palette.locator(".blora-palette-picker");
  const paletteTrigger = palette.locator("[data-blora-palette-trigger]");
  const paletteMenu = palette.locator(".blora-palette-picker__menu");
  await expect(paletteMenu).toHaveAttribute("popover", "manual");
  await expect(paletteMenu).toBeHidden();
  await paletteTrigger.click();
  await expect(paletteRoot).toHaveAttribute("data-open", "");
  await expect(paletteMenu).toBeVisible();
  const palettePlacement = await page.evaluate(() => {
    const trigger = document.querySelector<HTMLElement>("[data-blora-palette-trigger]")!;
    const menu = document.querySelector<HTMLElement>(".blora-palette-picker__menu")!;
    const triggerRect = trigger.getBoundingClientRect();
    const menuRect = menu.getBoundingClientRect();
    return {
      insideViewport:
        menuRect.top >= 0 &&
        menuRect.left >= 0 &&
        menuRect.right <= window.innerWidth &&
        menuRect.bottom <= window.innerHeight,
      aboveTrigger: menuRect.bottom <= triggerRect.top,
    };
  });
  expect(palettePlacement.insideViewport).toBe(true);
  expect(palettePlacement.aboveTrigger).toBe(true);
  await paletteTrigger.click();
  await expect(paletteRoot).not.toHaveAttribute("data-open", "");
  await expect(paletteMenu).toBeHidden();

  await page.locator("blora-color-scheme-toggle button").click();
  await page.locator("blora-search input").fill("BBBS");
  const after = await sidebarGeometry(page);
  expect(after.asideScrollLeft).toBe(0);
  expect(after.asideScrollWidth).toBeLessThanOrEqual(after.asideClientWidth + 1);
  expect(after.searchInsideAside).toBe(true);
  expect(after.inputInsideSearch).toBe(true);
  expect(after.iconInsideSearch).toBe(true);
  expect(after.clearInsideSearch).toBe(true);
  expect(after.paletteLabelFits).toBe(true);
});

test("BBBS replica thread renders a comment-stream timeline rail", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 960 });
  await page.goto(pathToFileURL(threadPath).href);
  await page.waitForFunction(() => customElements.get("blora-thread-comment"));
  await page.waitForTimeout(300);

  await expect(page.locator("#comment-stream blora-timeline")).toHaveCount(1);
  await expect(page.locator("#comment-stream .blora-timeline")).toHaveCount(1);
  await expect(page.locator("#comment-stream .blora-timeline__item")).toHaveCount(4);
  await expect(page.locator("#comment-stream .blora-timeline__dot--icon")).toHaveCount(4);
});

test("BBBS replica thread timeline rail is visible and indents comment cards", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 960 });
  await page.goto(pathToFileURL(threadPath).href);
  await page.waitForFunction(() => customElements.get("blora-thread-comment"));
  await page.waitForTimeout(300);

  const geometry = await page.evaluate(() => {
    const timeline = document.querySelector<HTMLElement>("#comment-stream .blora-timeline")!;
    const rail = getComputedStyle(timeline, "::before");
    const timelineRect = timeline.getBoundingClientRect();
    const firstCard = document
      .querySelector<HTMLElement>("#comment-stream .blora-thread-comment__card")!
      .getBoundingClientRect();
    return {
      railWidth: rail.width,
      railHeight: Number.parseFloat(rail.height),
      railBackground: rail.backgroundColor,
      timelineLeft: timelineRect.left,
      firstCardLeft: firstCard.left,
    };
  });

  expect(geometry.railWidth).toBe("1px");
  expect(geometry.railHeight).toBeGreaterThan(100);
  expect(geometry.railBackground).not.toBe("rgba(0, 0, 0, 0)");
  expect(geometry.firstCardLeft).toBeGreaterThan(geometry.timelineLeft);
});

test("BBBS replica thread comment stream fits mobile viewport", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(pathToFileURL(threadPath).href);
  await page.waitForFunction(() => customElements.get("blora-thread-comment"));
  await page.waitForTimeout(300);

  const fits = await page.evaluate(() => {
    const timeline = document.querySelector<HTMLElement>("#comment-stream .blora-timeline");
    const doc = document.documentElement;
    return {
      hasTimeline: !!timeline,
      docScrollWidth: doc.scrollWidth,
      docClientWidth: doc.clientWidth,
    };
  });

  expect(fits.hasTimeline).toBe(true);
  expect(fits.docScrollWidth).toBeLessThanOrEqual(fits.docClientWidth + 1);
});

test("BBBS replica feed items show no strong ring on pointer focus", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 960 });
  await page.goto(pathToFileURL(homePath).href);
  await page.waitForFunction(() => customElements.get("blora-sidebar-layout"));
  await page.waitForTimeout(300);

  const state = await page.evaluate(() => {
    const item = document.querySelectorAll<HTMLElement>(".feed-item")[1]!;
    const link = item.querySelector<HTMLElement>(".feed-item__link")!;
    link.focus({ preventScroll: true });
    return {
      focused: document.activeElement === link,
      itemBoxShadow: getComputedStyle(item).boxShadow,
    };
  });

  expect(state.focused).toBe(true);
  expect(state.itemBoxShadow).toBe("none");
});

test("BBBS replica feed item focus ring is inset so it is not clipped", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 960 });
  await page.goto(pathToFileURL(homePath).href);
  await page.waitForFunction(() => customElements.get("blora-sidebar-layout"));
  await page.waitForTimeout(300);

  const link = page.locator(".feed-item .feed-item__link").first();
  await link.focus();
  await expect(link).toBeFocused();

  const state = await link.evaluate((element) => {
    const style = getComputedStyle(element);
    return {
      outlineWidth: style.outlineWidth,
      outlineOffset: style.outlineOffset,
    };
  });

  expect(state.outlineWidth).toBe("2px");
  expect(state.outlineOffset).toBe("-2px");
});

// WebKit's keyboard traversal can skip absolutely positioned full-card links;
// direct focus keeps this geometry assertion engine-independent.

test("BBBS replica feed first/last link focus ring follows the list corners", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 960 });
  await page.goto(pathToFileURL(homePath).href);
  await page.waitForFunction(() => customElements.get("blora-sidebar-layout"));
  await page.waitForTimeout(300);

  const radii = await page.evaluate(() => {
    const items = Array.from(document.querySelectorAll<HTMLElement>(".feed-item"));
    const radius = (item: HTMLElement) =>
      getComputedStyle(item.querySelector<HTMLElement>(".feed-item__link")!);
    return {
      firstTop: radius(items[0]!).borderTopLeftRadius,
      firstBottom: radius(items[0]!).borderBottomLeftRadius,
      lastTop: radius(items[items.length - 1]!).borderTopLeftRadius,
      lastBottom: radius(items[items.length - 1]!).borderBottomLeftRadius,
    };
  });

  expect(radii.firstTop).toBe("18px");
  expect(radii.firstBottom).toBe("0px");
  expect(radii.lastTop).toBe("0px");
  expect(radii.lastBottom).toBe("18px");
});

test("BBBS replica sidebar nav link focus ring is inset so it is not clipped", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 960 });
  await page.goto(pathToFileURL(homePath).href);
  await page.waitForFunction(() => customElements.get("blora-sidebar-layout"));
  await page.waitForTimeout(300);

  const link = page.locator(".blora-sidebar-nav__link").first();
  await link.focus();
  await expect(link).toBeFocused();

  const offset = await link.evaluate((element) => getComputedStyle(element).outlineOffset);
  expect(offset).toBe("-2px");
});

test("BBBS replica segmented item focus ring is inset so it is not clipped", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 960 });
  await page.goto(pathToFileURL(homePath).href);
  await page.waitForFunction(() => customElements.get("blora-segmented"));
  await page.waitForTimeout(300);

  const sel = ".blora-segmented__item";
  let reached = false;
  for (let i = 0; i < 40; i++) {
    await page.keyboard.press("Tab");
    reached = await page.evaluate((s) => document.activeElement?.matches(s) ?? false, sel);
    if (reached) break;
  }
  expect(reached).toBe(true);

  const state = await page.evaluate(() => {
    const el = document.activeElement!;
    const style = getComputedStyle(el);
    return {
      focusVisible: el.matches(":focus-visible"),
      outlineOffset: style.outlineOffset,
    };
  });

  expect(state.focusVisible).toBe(true);
  expect(state.outlineOffset).toBe("-2px");
});

test("dark mode keeps a non-default palette after theme changes", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 960 });
  await page.goto(pathToFileURL(homePath).href);
  await page.waitForFunction(() => customElements.get("blora-palette-picker"));
  await page.waitForTimeout(300);

  const paletteTrigger = page.locator("blora-palette-picker [data-blora-palette-trigger]");
  await paletteTrigger.click();
  await page.locator('[data-blora-palette-option="indigo"]').click();
  await page.locator("blora-color-scheme-toggle button").click();
  await expect(page.locator("html")).toHaveAttribute("data-blora-color-scheme", "dark");
  await paletteTrigger.click();
  await page.locator('[data-blora-palette-option="graphite"]').click();
  await expect(page.locator("html")).toHaveAttribute("data-blora-theme", "graphite");
  const primary = await page.evaluate(() =>
    getComputedStyle(document.documentElement)
      .getPropertyValue("--blora-color-action-primary-default")
      .trim(),
  );
  expect(primary).toBe("#91A5B7");
});

test("BBBS replica palette picker lists the shipping themes", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 960 });
  await page.goto(pathToFileURL(homePath).href);
  await page.waitForFunction(() => customElements.get("blora-palette-picker"));
  await page.waitForTimeout(300);

  await page.locator("blora-palette-picker [data-blora-palette-trigger]").click();
  const menu = page.locator(".blora-palette-picker__menu");
  await expect(menu).toBeVisible();
  await expect(menu.locator('[data-blora-palette-option="lotus"]')).toHaveCount(0);
  await expect(menu.locator("[data-blora-palette-option]")).toHaveCount(6);
});

test("BBBS replica palette menu opens adjacent to its trigger on mobile", async ({ page }) => {
  await page.setViewportSize({ width: 480, height: 1000 });
  await page.goto(pathToFileURL(homePath).href);
  await page.waitForFunction(() => customElements.get("blora-palette-picker"));
  await page.waitForTimeout(300);

  // On mobile the sidebar is a drawer; open it to reach the palette trigger.
  await page.locator(".blora-sidebar-layout__toggle").first().click();
  await page.waitForTimeout(300);
  await page.locator("blora-palette-picker [data-blora-palette-trigger]").click();

  const measure = () =>
    page.evaluate(() => {
      const trigger = document.querySelector("blora-palette-picker [data-blora-palette-trigger]")!;
      const menu = document.querySelector("blora-palette-picker .blora-palette-picker__menu")!;
      const t = trigger.getBoundingClientRect();
      const m = menu.getBoundingClientRect();
      return {
        gap: Math.round(t.top - m.bottom),
        insideX: m.left >= 0 && m.right <= window.innerWidth,
        insideY: m.top >= 0 && m.bottom <= window.innerHeight,
      };
    });

  // The drawer and the menu both animate in; a fixed wait read mid-transition geometry
  // under parallel load, so poll until the menu has settled next to its trigger.
  await expect
    .poll(async () => {
      const geo = await measure();
      return geo.gap >= 0 && geo.gap <= 12 && geo.insideX && geo.insideY;
    })
    .toBe(true);
});

test("BBBS replica feed filter is a segmented control that filters the feed", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 960 });
  await page.goto(pathToFileURL(homePath).href);
  await page.waitForFunction(() => customElements.get("blora-segmented"));
  await page.waitForTimeout(300);

  const segmented = page.locator("#feed-filter");
  await expect(segmented).toHaveCount(1);
  await expect(page.locator("#feed-filter .blora-segmented__item")).toHaveCount(3);
  await expect(page.locator("[data-feed-item]")).toHaveCount(4);

  await segmented.locator('[data-value="followed"]').click();
  await expect(page.locator("#feed-filter .blora-segmented")).toHaveAttribute(
    "data-value",
    "followed",
  );
  expect(await page.locator("[data-feed-item]:visible").count()).toBe(2);

  await segmented.locator('[data-value="popular"]').click();
  await expect(page.locator("#feed-filter .blora-segmented")).toHaveAttribute(
    "data-value",
    "popular",
  );
  expect(await page.locator("[data-feed-item]:visible").count()).toBe(3);

  await segmented.locator('[data-value="all"]').click();
  await expect(page.locator("#feed-filter .blora-segmented")).toHaveAttribute("data-value", "all");
  expect(await page.locator("[data-feed-item]:visible").count()).toBe(4);
});

test("BBBS replica reaction chips grow as capsules without overflow", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 960 });
  await page.goto(pathToFileURL(threadPath).href);
  await page.waitForFunction(() => customElements.get("blora-thread-comment"));
  await page.waitForTimeout(300);

  const chips = await page.evaluate(() =>
    [...document.querySelectorAll<HTMLElement>("[data-blora-thread-react]")].map((chip) => {
      const style = getComputedStyle(chip);
      return {
        clientWidth: chip.clientWidth,
        scrollWidth: chip.scrollWidth,
        borderRadius: style.borderRadius,
      };
    }),
  );

  expect(chips.length).toBeGreaterThanOrEqual(4);
  for (const chip of chips) {
    expect(chip.scrollWidth).toBeLessThanOrEqual(chip.clientWidth + 1);
    expect(chip.borderRadius).toBe("9999px");
  }
});
