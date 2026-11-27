/** 构图层与运行时：圆角规则、编号、选中滑块、侧栏收起、滚动滑块、段落末尾不留孤字 */
import { expect, test, type Page } from '@playwright/test';

const PAGE = '/recipes/patterns/console-overview.html';
const WIDTHS = [
  [1380, 900],
  [1024, 800],
  [375, 812],
] as const;

async function open(page: Page, width: number, height: number): Promise<void> {
  await page.setViewportSize({ width, height });
  await page.goto(PAGE);
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(150);
}

/** 选中滑块与当前项的位置、尺寸、圆角是否完全重合 */
async function glideOffset(page: Page): Promise<number[]> {
  return page.evaluate(() => {
    const g = document.querySelector('.bd-rail > [data-part="glide"]')!.getBoundingClientRect();
    const a = document.querySelector('.bd-rail [aria-current="page"]')!.getBoundingClientRect();
    return [g.x - a.x, g.y - a.y, g.width - a.width, g.height - a.height].map(
      (v) => Math.round(v * 10) / 10,
    );
  });
}

for (const [width, height] of WIDTHS) {
  test.describe(`${width}px`, () => {
    test('格子圆角：两侧都没有相邻格子的角是外角 20，否则是缝角 6', async ({ page }) => {
      await open(page, width, height);
      const wrong = await page.evaluate(() => {
        const out: string[] = [];
        document.querySelectorAll('.bd-mosaic').forEach((mosaic, mi) => {
          const tiles = [
            ...mosaic.querySelectorAll(':scope > .bd-tile, :scope > .bd-stack > .bd-tile'),
          ];
          const boxes = tiles.map((t) => t.getBoundingClientRect());
          const near = (a: number, b: number) => Math.abs(a - b) <= 7;
          const overlapX = (a: DOMRect, b: DOMRect) =>
            Math.min(a.right, b.right) - Math.max(a.left, b.left) > 1;
          const overlapY = (a: DOMRect, b: DOMRect) =>
            Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top) > 1;
          boxes.forEach((r, i) => {
            const others = boxes.filter((_, j) => j !== i);
            const left = others.some((o) => near(o.right, r.left) && overlapY(o, r));
            const right = others.some((o) => near(o.left, r.right) && overlapY(o, r));
            const above = others.some((o) => near(o.bottom, r.top) && overlapX(o, r));
            const below = others.some((o) => near(o.top, r.bottom) && overlapX(o, r));
            const expect = {
              TopLeft: !left && !above,
              TopRight: !right && !above,
              BottomRight: !right && !below,
              BottomLeft: !left && !below,
            };
            const cs = getComputedStyle(tiles[i]!);
            for (const [corner, outer] of Object.entries(expect)) {
              const actual = cs.getPropertyValue(
                `border-${corner
                  .replace(/([A-Z])/g, '-$1')
                  .toLowerCase()
                  .slice(1)}-radius`,
              );
              const want = outer ? '20px' : '6px';
              if (actual !== want)
                out.push(`第 ${mi + 1} 行第 ${i + 1} 格 ${corner}: ${actual}，应为 ${want}`);
            }
          });
        });
        return out;
      });
      expect(wrong).toEqual([]);
    });

    test('选中滑块与当前导航项完全重合', async ({ page }) => {
      await open(page, width, height);
      // 过渡结束后对齐；机器负载高时过渡可能晚一点结束，所以轮询等待
      await expect.poll(() => glideOffset(page), { timeout: 2000 }).toEqual([0, 0, 0, 0]);
    });
  });
}

test('编号：每行第一个有标题的格子 01、02，同一行其他格子 1B、2B', async ({ page }) => {
  await open(page, 1380, 900);
  const kinds = await page.evaluate(() =>
    [...document.querySelectorAll('.bd-head > h2')].map(
      (h) => getComputedStyle(h, '::before').content,
    ),
  );
  expect(kinds).toEqual([
    'counter(bd-row, decimal-leading-zero)',
    'counter(bd-row) counter(bd-cell, upper-alpha)',
    'counter(bd-row, decimal-leading-zero)',
    'counter(bd-row) counter(bd-cell, upper-alpha)',
  ]);
});

test('点击导航项：aria-current 移过去，选中滑块连续滑到新位置', async ({ page }) => {
  await open(page, 1380, 900);
  const events: string[] = [];
  await page.exposeFunction('logEvent', (t: string) => events.push(t));
  await page.evaluate(() =>
    document.addEventListener('bd-change', (e) =>
      (window as unknown as { logEvent: (t: string) => void }).logEvent(
        (e as CustomEvent).detail.item.textContent.trim(),
      ),
    ),
  );
  await page.locator('.bd-rail button:not([data-part])', { hasText: '实例' }).click();
  await expect(page.locator('.bd-rail [aria-current="page"]')).toHaveText(/实例/);
  // 过渡中：滑块还在路上
  const mid = await page.evaluate(
    () =>
      getComputedStyle(document.querySelector('.bd-rail > [data-part="glide"]')!)
        .transitionProperty,
  );
  expect(mid).toContain('transform');
  // 过渡结束后对齐；机器负载高时过渡可能晚一点结束，所以轮询等待
  await expect.poll(() => glideOffset(page), { timeout: 2000 }).toEqual([0, 0, 0, 0]);
  expect(events).toEqual(['实例24']);
});

test('收起侧栏：宽度连续变化，刷新后保持收起且不播放过渡', async ({ page }) => {
  await open(page, 1380, 900);
  const toggle = page.locator('.bd-rail [data-part="collapse"]');
  await toggle.click();
  await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  await page.waitForTimeout(500);
  expect(await page.locator('.bd-rail').evaluate((el) => el.getBoundingClientRect().width)).toBe(
    64,
  );
  // 过渡结束后对齐；机器负载高时过渡可能晚一点结束，所以轮询等待
  await expect.poll(() => glideOffset(page), { timeout: 2000 }).toEqual([0, 0, 0, 0]);
  await page.reload();
  await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  expect(await page.locator('.bd-rail').evaluate((el) => el.getBoundingClientRect().width)).toBe(
    64,
  );
  await toggle.click();
  await page.waitForTimeout(500);
  expect(await page.locator('.bd-rail').evaluate((el) => el.getBoundingClientRect().width)).toBe(
    208,
  );
});

test('≤900：侧栏变成顶栏下方的横向导航条', async ({ page }) => {
  await open(page, 375, 812);
  const order = await page.evaluate(() => {
    const top = document.querySelector('.bd-topbar')!.getBoundingClientRect();
    const rail = document.querySelector('.bd-rail')!.getBoundingClientRect();
    const head = document.querySelector('.bd-tile[data-variant="page"]')!.getBoundingClientRect();
    return [top.bottom + 6 === rail.top, rail.bottom + 6 === head.top, Math.round(rail.height)];
  });
  expect(order).toEqual([true, true, 42]);
});

test('页面滚动条：原生滚动条隐藏，Blora 滑块跟随滚动、可以拖动', async ({ page }) => {
  await open(page, 1024, 600);
  const thumb = page.locator('body > [data-part="scrollbar"][data-scope="page"]');
  await expect(thumb).toHaveCount(1);
  expect(await page.evaluate(() => getComputedStyle(document.documentElement).scrollbarWidth)).toBe(
    'none',
  );
  await page.mouse.wheel(0, 300);
  await expect(thumb).toHaveAttribute('data-state', /visible/);
  const y1 = await thumb.evaluate((el) => el.getBoundingClientRect().top);
  expect(y1).toBeGreaterThan(3);
  const box = (await thumb.boundingBox())!;
  await page.mouse.move(box.x + 2, box.y + 10);
  await page.mouse.down();
  await page.mouse.move(box.x + 2, box.y + 60);
  await page.mouse.up();
  expect(await page.evaluate(() => scrollY)).toBeGreaterThan(300);
});

test('段落末尾 5 个字连在一起，不留孤字', async ({ page }) => {
  await open(page, 1380, 900);
  const tail = await page
    .locator('.bd-tile[data-variant="page"] > h1 + p')
    .evaluate((p) => p.textContent);
  expect(tail).toContain('警\u2060待\u2060处\u2060理\u2060。');
});
