/** Reviewed visual coverage for the 2.1 migration and composition changes. */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { expect, test } from "@playwright/test";

const repoRoot = resolve(import.meta.dirname, "../../../..");
const showcaseUrl = pathToFileURL(resolve(repoRoot, "examples/showcase-v2/index.html")).href;
const basicUrl = pathToFileURL(resolve(repoRoot, "examples/basic/index.html")).href;
const distDir = resolve(import.meta.dirname, "../..", "dist");
const cssUrl = pathToFileURL(resolve(distDir, "blora.css")).href;
const darkCssUrl = pathToFileURL(resolve(distDir, "tokens.dark.css")).href;
const runtime = readFileSync(resolve(distDir, "blora.global.js"), "utf8");

for (const scheme of ["light", "dark"] as const) {
  test(`migration component states ${scheme}`, async ({ page }) => {
    await page.setViewportSize({ width: 960, height: 1000 });
    // A file origin lets the real bundle resolve its component CSS imports.
    await page.goto(basicUrl);
    await page.setContent(`<!doctype html><html lang="en" data-blora-color-scheme="${scheme}">
      <head><meta charset="utf-8"><link rel="stylesheet" href="${cssUrl}"><link rel="stylesheet" href="${darkCssUrl}"></head>
      <body class="blora-page blora-scope" style="font-family:var(--blora-font-sans)">
        <main id="review" class="blora-stack--lg" style="padding:var(--blora-space-6)">
          <div class="blora-actions">
            <button type="button" class="blora-button" data-variant="primary" data-icon="plus">Create</button>
            <button type="button" class="blora-button" data-variant="danger" data-icon="trash">Delete</button>
            <button type="button" class="blora-button" data-size="icon" data-shape="square" data-icon="settings" aria-label="Settings"></button>
            <button type="button" class="blora-button" data-size="icon" data-shape="circle" data-icon="bell" aria-label="Notifications"></button>
          </div>
          <div class="blora-row">
            <span class="blora-tag" data-variant="info">Info</span>
            <span class="blora-tag" data-variant="success">Success</span>
            <span class="blora-tag" data-variant="warning">Warning</span>
            <span class="blora-tag" data-variant="danger">Danger</span>
          </div>
          <div class="blora-grid blora-grid--2">
            <blora-alert variant="info" title="Information" description="Review the details."></blora-alert>
            <blora-alert variant="success" title="Saved" description="Your changes are ready."></blora-alert>
            <blora-alert variant="warning" title="Low quota" description="Check usage before continuing."></blora-alert>
            <blora-alert variant="danger" title="Connection failed" description="Please try again."></blora-alert>
          </div>
          <blora-tabs variant="pills">
            <blora-tab label="Overview" value="overview" selected>Selected labels remain readable.</blora-tab>
            <blora-tab label="Activity" value="activity">Recent activity.</blora-tab>
          </blora-tabs>
          <div class="blora-row" style="align-items:stretch">
            <span class="blora-avatar-wrap"><span class="blora-avatar">AB</span><span class="blora-dot" data-variant="success" aria-label="Online"></span></span>
            <span class="blora-avatar-wrap"><span class="blora-avatar">CD</span><span class="blora-badge">2</span></span>
            <blora-copy text="sk-example-key" masked label="Copy API key"></blora-copy>
          </div>
          <article class="blora-card blora-stack--lg" data-size="sm">
            <header class="blora-card__header">
              <div><h2 class="blora-card__title">Account settings</h2><p class="blora-card__desc">Consistent header and form spacing.</p></div>
              <button type="button" class="blora-button" data-variant="outline" data-size="sm">Manage</button>
            </header>
            <div class="blora-grid blora-grid--3">
              <blora-field label="Name" value="Unavailable" disabled></blora-field>
              <label class="blora-field"><span class="blora-field__label">Role</span><blora-select value="member" disabled><blora-option value="member">Member</blora-option></blora-select></label>
              <blora-field label="Notes" value="Unavailable" textarea disabled></blora-field>
            </div>
          </article>
        </main>
      </body></html>`);
    await page.addScriptTag({ content: runtime });
    await page.evaluate((colorScheme) => {
      (globalThis as unknown as { Blora: { autoDefine(): void } }).Blora.autoDefine();
      document.documentElement.setAttribute("data-blora-color-scheme", colorScheme);
    }, scheme);
    await expect(page.locator(".blora-alert__icon svg")).toHaveCount(4);
    await expect(page.locator('.blora-tabs__tab[aria-selected="true"]')).toHaveText("Overview");
    await expect(page.locator('#review .blora-button[data-icon="plus"] svg')).toHaveCount(1);
    const review = page.locator("#review");
    const renderPath = test.info().outputPath("render.png");
    await review.screenshot({ path: renderPath, animations: "disabled" });
    await test.info().attach("render", {
      path: renderPath,
      contentType: "image/png",
    });
    await expect(review).toHaveScreenshot(`migration-states-${scheme}.png`, {
      animations: "disabled",
    });
  });

  for (const viewport of [
    { name: "desktop", width: 1440, height: 1000 },
    { name: "mobile", width: 390, height: 844 },
  ]) {
    for (const pattern of ["resources", "table", "settings", "states"]) {
      test(`page pattern ${pattern} ${scheme} ${viewport.name}`, async ({ page }) => {
        await page.setViewportSize({ width: viewport.width, height: viewport.height });
        await page.goto(`${showcaseUrl}#pattern-${pattern}`);
        await page.locator("html").evaluate((element, colorScheme) => {
          element.setAttribute("data-blora-color-scheme", colorScheme);
        }, scheme);
        const panel = page.locator(`[data-component-panel="pattern-${pattern}"]`);
        await expect(panel).toHaveAttribute("data-hydrated", "true");
        const preview = page.locator(`[data-example="pattern-${pattern}"]`);
        expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
          viewport.width,
        );
        // Keep the responsive width, but paint the whole long pattern in one
        // viewport; off-screen form actions otherwise disappear from captures.
        const bounds = await preview.boundingBox();
        await page.setViewportSize({
          width: viewport.width,
          height: Math.max(viewport.height, Math.ceil(bounds!.height) + 200),
        });
        const screenshotOptions = {
          animations: "disabled" as const,
          // The floating drawer launcher belongs to the page shell, not this crop.
          style: ".blora-sidebar-layout__toggle { visibility: hidden; }",
        };
        const renderPath = test.info().outputPath("render.png");
        await preview.screenshot({ path: renderPath, ...screenshotOptions });
        await test.info().attach("render", {
          path: renderPath,
          contentType: "image/png",
        });
        await expect(preview).toHaveScreenshot(
          `pattern-${pattern}-${scheme}-${viewport.name}.png`,
          screenshotOptions,
        );
      });
    }
  }
}
