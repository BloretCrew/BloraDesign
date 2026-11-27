/** 反馈与浮层：菜单、分裂按钮、原位确认、右键菜单、悬浮提示、弹窗、抽屉、命令面板、提示条、确认弹窗、提醒格 */
import { expect, test } from '@playwright/test';

const OV = '/recipes/components/overlay.html';

test('分裂按钮：菜单与整组左对齐；方向键移动，选中后关闭并发出 bd-select', async ({ page }) => {
  await page.goto(OV);
  await page.evaluate(() =>
    document.addEventListener(
      'bd-select',
      (e) => ((window as unknown as { picked: string }).picked = (e as CustomEvent).detail.value),
    ),
  );
  await page.locator('#split [data-part="trigger"]').click();
  const panel = page.locator('#split > [data-part="panel"]');
  await expect(panel).toBeVisible();
  await page.waitForTimeout(300);
  const [group, box] = await Promise.all([
    page.locator('#split').boundingBox(),
    panel.boundingBox(),
  ]);
  expect(Math.round(box!.x)).toBe(Math.round(group!.x));
  await expect(panel.locator('[aria-checked="true"]')).toBeFocused();
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('Enter');
  await expect(panel).toBeHidden();
  await expect(page.locator('#split [aria-checked="true"]')).toHaveText('蓝绿双轨切流');
  expect(await page.evaluate(() => (window as unknown as { picked: string }).picked)).toBe(
    '蓝绿双轨切流',
  );
});

test('原位确认：确认发出 bd-confirm，取消直接关闭', async ({ page }) => {
  await page.goto(OV);
  await page.evaluate(() =>
    document
      .querySelector('#popconfirm')!
      .addEventListener('bd-confirm', () => ((window as unknown as { ok: boolean }).ok = true)),
  );
  const trigger = page.locator('#popconfirm > .bd-button');
  const panel = page.locator('#popconfirm > [data-part="panel"]');
  await trigger.click();
  await panel.locator('[data-part="cancel"]').click();
  await expect(panel).toBeHidden();
  expect(await page.evaluate(() => (window as unknown as { ok?: boolean }).ok)).toBeUndefined();
  await trigger.click();
  await panel.locator('[data-part="confirm"]').click();
  await expect(panel).toBeHidden();
  expect(await page.evaluate(() => (window as unknown as { ok?: boolean }).ok)).toBe(true);
});

test('右键菜单：在指针处弹出，不出现浏览器原生菜单', async ({ page }) => {
  await page.goto(OV);
  const zone = page.locator('#context');
  const b = (await zone.boundingBox())!;
  await page.mouse.click(b.x + 40, b.y + 20, { button: 'right' });
  const panel = page.locator('#context > [data-part="panel"]');
  await expect(panel).toBeVisible();
  const p = (await panel.boundingBox())!;
  expect(Math.abs(p.x - (b.x + 40))).toBeLessThan(2);
  await page.keyboard.press('Escape');
  await expect(panel).toBeHidden();
});

test('悬浮提示：悬停出现，移开消失；title 会被改成 data-tip', async ({ page }) => {
  await page.goto(OV);
  await page.locator('#tip').hover();
  const tip = page.locator('.bd-tooltip');
  await expect(tip).toBeVisible();
  await expect(tip).toHaveText('浅色柔和悬浮气泡 · 无突兀黑底');
  await page.mouse.move(5, 5);
  await expect(tip).toBeHidden();
  await page.evaluate(() =>
    document.querySelector('#open-drawer')!.setAttribute('title', '打开遥测舱'),
  );
  await page.locator('#open-drawer').hover();
  await expect(page.locator('#open-drawer')).not.toHaveAttribute('title', /.+/);
  await expect(tip).toHaveText('打开遥测舱');
});

test('弹窗：data-bd-open 打开，关闭按钮、点遮罩、Esc 都能关闭', async ({ page }) => {
  await page.goto(OV);
  const modal = page.locator('#modal');
  await page.locator('#open-modal').click();
  await expect(modal).toBeVisible();
  await modal.locator('header [data-part="close"]').click();
  await expect(modal).toBeHidden();
  await page.locator('#open-modal').click();
  await page.waitForTimeout(350);
  await page.mouse.click(10, 10);
  await expect(modal).toBeHidden();
  await page.locator('#open-modal').click();
  await page.keyboard.press('Escape');
  await expect(modal).toBeHidden();
});

test('命令面板：快捷键打开，输入过滤，回车执行并关闭', async ({ page }) => {
  await page.goto(OV);
  await page.evaluate(() =>
    document
      .querySelector('#command')!
      .addEventListener(
        'bd-select',
        (e) =>
          ((window as unknown as { cmd: string }).cmd = (
            e as CustomEvent
          ).detail.item.textContent.trim()),
      ),
  );
  await page.keyboard.press('ControlOrMeta+k');
  const cmd = page.locator('#command');
  await expect(cmd).toBeVisible();
  await expect(cmd.locator('input')).toBeFocused();
  await page.keyboard.type('深色');
  await expect(cmd.locator('[role="option"]:visible')).toHaveCount(1);
  await page.keyboard.press('Enter');
  await expect(cmd).toBeHidden();
  expect(await page.evaluate(() => (window as unknown as { cmd: string }).cmd)).toContain(
    '切换深色模式',
  );
});

test('提示条：出现后自动消失', async ({ page }) => {
  await page.goto(OV);
  await page.locator('#toast-btn').click();
  const t = page.locator('.bd-toast > [role="status"]');
  await expect(t).toHaveText('遥测舱配置已保存');
  await expect(page.locator('.bd-toast')).toHaveAttribute('aria-live', 'polite');
  await expect(t).toHaveCount(0, { timeout: 4000 });
});

test('confirm()：Blora 样式的确认弹窗，返回用户的选择', async ({ page }) => {
  await page.goto(OV);
  await page.locator('#confirm-btn').click();
  const dlg = page.locator('dialog.bd-modal[open]', { hasText: '删除工作区？' });
  await expect(dlg).toBeVisible();
  await dlg.locator('footer .bd-button[data-variant="rose"]').click();
  await expect(page.locator('body')).toHaveAttribute('data-confirmed', 'true');
  await page.locator('#confirm-btn').click();
  await page.locator('dialog.bd-modal[open] footer .bd-button:not([data-variant])').click();
  await expect(page.locator('body')).toHaveAttribute('data-confirmed', 'false');
});

test('提醒格：关闭时连同这一行和细缝一起收起', async ({ page }) => {
  await page.goto(OV);
  const rows = await page.locator('main > .bd-mosaic').count();
  await page.locator('#alert-tile [data-part="close"]').click();
  await expect(page.locator('#alert-tile')).toHaveCount(0);
  await expect(page.locator('main > .bd-mosaic')).toHaveCount(rows - 1);
});
