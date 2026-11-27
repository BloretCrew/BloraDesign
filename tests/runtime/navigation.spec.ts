/** 页签、分页、导航、目录树、步骤条的交互 */
import { expect, test, type Page } from '@playwright/test';

const TABS = '/recipes/components/tabs.html';
const NAV = '/recipes/components/nav.html';

/** 某个组里滑块与当前项的偏差（位置、尺寸） */
function glideOffset(page: Page, host: string, active: string): Promise<number[]> {
  return page.evaluate(
    ([h, a]) => {
      const g = document.querySelector(`${h} > [data-part="glide"]`)!.getBoundingClientRect();
      const r = document.querySelector(a!)!.getBoundingClientRect();
      return [g.x - r.x, g.y - r.y, g.width - r.width, g.height - r.height].map((v) =>
        Math.round(v),
      );
    },
    [host, active],
  );
}

test('页签：切换时只显示对应面板；关闭当前页签后选中相邻页签；新加的页签弹出', async ({ page }) => {
  await page.goto(TABS);
  await expect(page.locator('#p1')).toBeVisible();
  await expect(page.locator('#p2')).toBeHidden();
  await page.locator('#tabs > [role="tab"]', { hasText: '证书策略' }).click();
  await expect(page.locator('#p2')).toBeVisible();
  await expect(page.locator('#p1')).toBeHidden();
  await expect
    .poll(() => glideOffset(page, '#tabs', '#tabs > [aria-selected="true"]'), { timeout: 2000 })
    .toEqual([0, 0, 0, 0]);

  await page.locator('#tabs > [aria-selected="true"] [data-part="close"]').click();
  await expect(page.locator('#tabs > [role="tab"]')).toHaveCount(2);
  await expect(page.locator('#p2')).toHaveCount(0);
  await expect(page.locator('#tabs > [aria-selected="true"]')).toContainText('审计流水');
  await expect(page.locator('#p3')).toBeVisible();

  const animated = await page.evaluate(async () => {
    const tabs = document.querySelector('#tabs')!;
    const tab = document.createElement('button');
    tab.type = 'button';
    tab.setAttribute('role', 'tab');
    tab.textContent = '新分片';
    tabs.append(tab);
    await new Promise((r) => setTimeout(r, 30));
    return tab.getAnimations().length;
  });
  expect(animated).toBe(1);
});

test('分页：点击页码移动 aria-current，滑块跟随', async ({ page }) => {
  await page.goto(TABS);
  await page.locator('#pager > button', { hasText: '3' }).click();
  await expect(page.locator('#pager > [aria-current="page"]')).toHaveText('3');
  await expect(page.locator('#pager > [aria-current]')).toHaveCount(1);
  await expect
    .poll(() => glideOffset(page, '#pager', '#pager > [aria-current="page"]'), { timeout: 2000 })
    .toEqual([0, 0, 0, 0]);
});

test('步骤条：点击后当前步骤移动，之前的步骤显示为已完成', async ({ page }) => {
  await page.goto(TABS);
  const steps = page.locator('#steps > button');
  await steps.nth(2).click();
  await expect(steps.nth(2)).toHaveAttribute('aria-current', 'step');
  await page.waitForTimeout(300); // 等底色渐变结束
  const bgs = await steps.evaluateAll((els) => els.map((e) => getComputedStyle(e).backgroundColor));
  // 前两步暖杏（已完成），第三步雾粉（当前）
  expect(bgs[0]).toBe(bgs[1]);
  expect(bgs[2]).not.toBe(bgs[0]);
  await steps.nth(0).click();
  await expect(steps.nth(0)).toHaveAttribute('aria-current', 'step');
  await page.waitForTimeout(300);
  expect(await steps.nth(1).evaluate((e) => getComputedStyle(e).backgroundColor)).toBe(
    await steps.nth(2).evaluate((e) => getComputedStyle(e).backgroundColor),
  );
});

test('分区导航：点击切换当前项，滑块连续滑动', async ({ page }) => {
  await page.goto(NAV);
  await page.locator('#settings > button', { hasText: '通知' }).click();
  await expect(page.locator('#settings > [aria-current]')).toHaveText(/通知/);
  await expect
    .poll(() => glideOffset(page, '#settings', '#settings > [aria-current]'), { timeout: 2000 })
    .toEqual([0, 0, 0, 0]);
});

test('目录树：展开收起有高度过渡，选中文件时滑块跟随，键盘可操作', async ({ page }) => {
  await page.goto(NAV);
  const policies = page.locator('#tree > li').nth(1);
  await policies.locator(':scope > [data-part="node"]').click();
  await expect(policies).toHaveAttribute('aria-expanded', 'true');
  const anims = await policies
    .locator(':scope > [role="group"]')
    .evaluate((g) => g.getAnimations().length);
  expect(anims).toBe(1);
  await page
    .locator('#tree [role="treeitem"]:not([aria-expanded])', { hasText: 'geo-fence.rego' })
    .locator(':scope > [data-part="node"]')
    .click();
  await expect(page.locator('#tree [aria-selected="true"]')).toHaveCount(1);
  await expect(page.locator('#tree [aria-selected="true"]')).toContainText('geo-fence.rego');
  await expect
    .poll(() => glideOffset(page, '#tree', '#tree [aria-selected="true"] > [data-part="node"]'), {
      timeout: 2000,
    })
    .toEqual([0, 0, 0, 0]);

  // 收起所在文件夹：滑块隐藏
  await policies.locator(':scope > [data-part="node"]').click();
  await expect(policies).toHaveAttribute('aria-expanded', 'false');
  await expect
    .poll(
      () =>
        page.locator('#tree > [data-part="glide"]').evaluate((g) => getComputedStyle(g).opacity),
      { timeout: 2000 },
    )
    .toBe('0');

  // 键盘：焦点在第一个文件夹上，下移、Enter 选中
  await page.locator('#tree > li').first().locator(':scope > [data-part="node"]').focus();
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('Enter');
  await expect(page.locator('#tree [aria-selected="true"]')).toContainText('config-keys.json');
  await page.keyboard.press('ArrowLeft');
  await expect(
    page.locator('#tree > li').first().locator(':scope > [data-part="node"]'),
  ).toBeFocused();
  await page.keyboard.press('ArrowLeft');
  await expect(page.locator('#tree > li').first()).toHaveAttribute('aria-expanded', 'false');
});

test('≤900：竖排导航变成横向滚动条，二级条目和标题隐藏', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto(NAV);
  const dir = await page.locator('#toc').evaluate((el) => getComputedStyle(el).flexDirection);
  expect(dir).toBe('row');
  await expect(page.locator('#toc > [data-level="2"]').first()).toBeHidden();
  await expect(page.locator('#toc > [data-part="label"]')).toBeHidden();
});
