/** 数据展示组件的交互：表格勾选与排序、批量栏、连贯列表、环形读数、进度条、复制代码、手风琴、角落几何线 */
import { expect, test } from '@playwright/test';

const DATA = '/recipes/components/data.html';

test('表格：点行勾选、全选半选、批量栏随选中数展开收起', async ({ page }) => {
  await page.goto(DATA);
  const rows = page.locator('#nodes tbody tr');
  const all = page.locator('#nodes thead .bd-checkbox');
  await expect(rows.nth(0)).toHaveAttribute('aria-selected', 'true');
  expect(await all.evaluate((el) => (el as HTMLInputElement).indeterminate)).toBe(true);
  await expect(page.locator('#bulk')).toBeVisible();
  await expect(page.locator('#bulk [data-part="count"]')).toHaveText('2');
  await rows.nth(2).locator('td').nth(1).click();
  await expect(rows.nth(2)).toHaveAttribute('aria-selected', 'true');
  await expect(page.locator('#bulk [data-part="count"]')).toHaveText('3');
  await all.check();
  await expect(page.locator('#nodes tbody tr[aria-selected="true"]')).toHaveCount(4);
  await page.locator('#bulk [data-part="clear"]').click();
  await expect(page.locator('#nodes tbody tr[aria-selected="true"]')).toHaveCount(0);
  await expect(page.locator('#bulk')).toBeHidden();
});

test('表格：点表头排序，行连续移动到新位置', async ({ page }) => {
  await page.goto(DATA);
  await page.locator('#nodes th[aria-sort] > button').click();
  await expect(page.locator('#nodes th[aria-sort]')).toHaveAttribute('aria-sort', 'ascending');
  const moving = await page
    .locator('#nodes tbody tr')
    .evaluateAll((rs) => rs.filter((r) => r.getAnimations().length).length);
  expect(moving).toBe(0); // 已经是升序，行不需要移动
  await page.locator('#nodes th[aria-sort] > button').click();
  await expect(page.locator('#nodes th[aria-sort]')).toHaveAttribute('aria-sort', 'descending');
  const moved = await page
    .locator('#nodes tbody tr')
    .evaluateAll((rs) => rs.filter((r) => r.getAnimations().length).length);
  expect(moved).toBeGreaterThan(0);
  await expect(page.locator('#nodes tbody tr').first()).toContainText('web-edge-03');
});

test('连贯列表：点击切换选中', async ({ page }) => {
  await page.goto(DATA);
  const item = page.locator('#list > [role="option"]', { hasText: '身份认证中心' });
  await item.click();
  await expect(item).toHaveAttribute('aria-selected', 'true');
  await item.click();
  await expect(item).toHaveAttribute('aria-selected', 'false');
});

test('环形读数：按数值取色，数值变化时圆弧连续过渡', async ({ page }) => {
  await page.goto(DATA);
  await expect(page.locator('#ring')).toHaveAttribute('data-level', 'normal');
  await expect(page.locator('#ring-near')).toHaveAttribute('data-level', 'near');
  await expect(page.locator('#ring > b')).toHaveText('68');
  const animating = await page.evaluate(async () => {
    const ring = document.querySelector('#ring')!;
    ring.setAttribute('aria-valuenow', '112');
    await new Promise((r) => setTimeout(r, 30));
    return ring.querySelector('[data-part="arc"]')!.getAnimations().length;
  });
  expect(animating).toBe(1);
  await expect(page.locator('#ring')).toHaveAttribute('data-level', 'over');
  await expect(page.locator('#ring > b')).toHaveText('112');
  // 超过 100% 是满环
  expect(await page.locator('#ring [data-part="arc"]').getAttribute('stroke-dasharray')).toBe(
    '113.1 113.1',
  );
});

test('进度条：aria-valuenow 同步到宽度', async ({ page }) => {
  await page.goto(DATA);
  await expect(page.locator('#progress')).toHaveAttribute('role', 'progressbar');
  expect(
    await page
      .locator('#progress')
      .evaluate((el) => (el as HTMLElement).style.getPropertyValue('--bd-value')),
  ).toBe('68%');
});

test('代码块：复制时去掉命令提示符，按钮短暂显示「已复制」', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.goto(DATA);
  await page.locator('#code [data-part="copy"]').click();
  await expect(page.locator('#code [data-part="copy"] > span')).toHaveText('已复制');
  const text = await page.evaluate(() => navigator.clipboard.readText());
  expect(text).toBe('# 应该返回 edge.blora.app.\ndig +short app.example.com CNAME');
});

test('手风琴：展开、收起都有高度过渡', async ({ page }) => {
  await page.goto(DATA);
  // 只数高度动画（同时可能有底色渐变）
  const heightAnims = (el: Element): number =>
    el.getAnimations().filter((a) => {
      const kf = (a.effect as KeyframeEffect | null)?.getKeyframes() ?? [];
      return kf.some((k) => 'height' in k);
    }).length;
  const second = page.locator('#acc > details').nth(1);
  await second.locator('summary').click();
  await expect(second).toHaveAttribute('open', '');
  expect(await second.evaluate(heightAnims)).toBe(1);
  await page.waitForTimeout(400);
  await second.locator('summary').click();
  expect(await second.evaluate(heightAnims)).toBe(1);
  await expect(second).not.toHaveAttribute('open', '');
});

test('角落几何线：画出三道弧和一个小点，不超出格子', async ({ page }) => {
  await page.goto(DATA);
  await expect(page.locator('.bd-corner circle')).toHaveCount(4);
  const inside = await page.evaluate(() => {
    const c = document.querySelector('.bd-corner')!.getBoundingClientRect();
    const t = document.querySelector('.bd-corner')!.closest('.bd-tile')!.getBoundingClientRect();
    return Math.round(c.right) === Math.round(t.right) && Math.round(c.top) === Math.round(t.top);
  });
  expect(inside).toBe(true);
});
