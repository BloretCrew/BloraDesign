/** 分段控件：点击 / 方向键切换、选中滑块连续滑动、data-bd-controlled 时只发事件 */
import { expect, test, type Page } from '@playwright/test';

const PAGE = '/recipes/components/segmented.html';

async function offset(page: Page, group: string): Promise<number[]> {
  return page.evaluate((g) => {
    const host = document.querySelector(g)!;
    const a = host.querySelector('[aria-checked="true"]')!.getBoundingClientRect();
    const p = host.querySelector(':scope > [data-part="glide"]')!.getBoundingClientRect();
    return [p.x - a.x, p.y - a.y, p.width - a.width, p.height - a.height].map((v) => Math.round(v));
  }, group);
}

test('点击切换：aria-checked 移过去，滑块滑到新位置，发出 bd-change', async ({ page }) => {
  await page.goto(PAGE);
  await page.evaluate(() => {
    (window as unknown as { changes: string[] }).changes = [];
    document.addEventListener('bd-change', (e) =>
      (window as unknown as { changes: string[] }).changes.push((e as CustomEvent).detail.value),
    );
  });
  await page.locator('#range > button', { hasText: '30 天' }).click();
  await expect(page.locator('#range > [aria-checked="true"]')).toHaveText('30 天');
  // 过渡结束后对齐；机器负载高时过渡可能晚一点结束，所以轮询等待
  await expect.poll(() => offset(page, '#range'), { timeout: 2000 }).toEqual([0, 0, 0, 0]);
  expect(await page.evaluate(() => (window as unknown as { changes: string[] }).changes)).toEqual([
    '30 天',
  ]);
});

test('键盘：只有选中项能 Tab 进入，方向键 / Home / End 移动并选中', async ({ page }) => {
  await page.goto(PAGE);
  const tabIndexes = await page
    .locator('#tier > button')
    .evaluateAll((els) => els.map((e) => (e as HTMLElement).tabIndex));
  expect(tabIndexes).toEqual([-1, 0, -1]);
  await page.locator('#tier > [aria-checked="true"]').focus();
  await page.keyboard.press('ArrowRight');
  await expect(page.locator('#tier > [aria-checked="true"]')).toHaveText('星轨 8G');
  await expect(page.locator('#tier > [aria-checked="true"]')).toBeFocused();
  await page.keyboard.press('ArrowRight');
  await expect(page.locator('#tier > [aria-checked="true"]')).toHaveText('轻量 2G');
  await page.keyboard.press('End');
  await expect(page.locator('#tier > [aria-checked="true"]')).toHaveText('星轨 8G');
  await page.keyboard.press('Home');
  await expect(page.locator('#tier > [aria-checked="true"]')).toHaveText('轻量 2G');
});

test('data-bd-controlled：运行时只发事件，由业务改状态，滑块照样跟随', async ({ page }) => {
  await page.goto(PAGE);
  await page.evaluate(() => {
    const view = document.querySelector('#view')!;
    view.setAttribute('data-bd-controlled', '');
    view.addEventListener('bd-change', (e) => {
      const item = (e as CustomEvent).detail.item as HTMLElement;
      setTimeout(() => {
        view
          .querySelectorAll('[role="radio"]')
          .forEach((el) => el.setAttribute('aria-checked', String(el === item)));
      }, 50);
    });
  });
  const second = page.locator('#view > [role="radio"]').nth(1);
  await second.click();
  await expect(second).toHaveAttribute('aria-checked', 'true');
  // 过渡结束后对齐；机器负载高时过渡可能晚一点结束，所以轮询等待
  await expect.poll(() => offset(page, '#view'), { timeout: 2000 }).toEqual([0, 0, 0, 0]);
});

test('JS 加载之前选中项自己显示选中底', async ({ page }) => {
  await page.route('**/blora.js', (route) => route.abort());
  await page.goto(PAGE);
  const bg = await page
    .locator('#range > [aria-checked="true"]')
    .evaluate((el) => getComputedStyle(el).backgroundColor);
  expect(bg).toBe('rgb(255, 255, 255)');
});
