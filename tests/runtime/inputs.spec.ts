/** 输入类组件的交互：输入框小按钮、步进器、开关、滑块、上传区、选择器、日期 */
import { expect, test } from '@playwright/test';

const FORM = '/recipes/components/form.html';
const SEL = '/recipes/components/select.html';

test('输入框：清除按钮随内容显示，点击清空；显示密码切换明文', async ({ page }) => {
  await page.goto(FORM);
  const clear = page.locator('#clear > [data-part="clear"]');
  await expect(clear).toBeVisible();
  await clear.click();
  await expect(page.locator('#clear > input')).toHaveValue('');
  await expect(clear).toBeHidden();
  await expect(page.locator('#clear > input')).toBeFocused();
  const reveal = page.locator('#password > [data-part="reveal"]');
  await reveal.click();
  await expect(page.locator('#password > input')).toHaveAttribute('type', 'text');
  await expect(reveal).toHaveAttribute('aria-pressed', 'true');
});

test('步进器：加减、边界禁用、方向键，同步到隐藏输入框', async ({ page }) => {
  await page.goto(FORM);
  const value = page.locator('#stepper > [data-part="value"]');
  await page.locator('#stepper > [data-part="inc"]').click();
  await expect(value).toHaveAttribute('aria-valuenow', '7');
  await expect(page.locator('#stepper > input[type="hidden"]')).toHaveValue('7');
  await value.focus();
  await page.keyboard.press('End');
  await expect(value).toHaveAttribute('aria-valuenow', '9');
  await expect(page.locator('#stepper > [data-part="inc"]')).toBeDisabled();
  await page.keyboard.press('ArrowDown');
  await expect(value).toHaveText('8');
});

test('开关：点击切换 aria-checked', async ({ page }) => {
  await page.goto(FORM);
  const sw = page.locator('#switch');
  await sw.click();
  await expect(sw).toHaveAttribute('aria-checked', 'false');
  await sw.click();
  await expect(sw).toHaveAttribute('aria-checked', 'true');
});

test('滑块：点击轨道、拖动、方向键都会更新数值和位置', async ({ page }) => {
  await page.goto(FORM);
  const slider = page.locator('#slider');
  const track = slider.locator('[data-part="track"]');
  const box = (await track.boundingBox())!;
  await page.mouse.click(box.x + box.width * 0.25, box.y + box.height / 2);
  await expect(slider).toHaveAttribute('aria-valuenow', '25');
  await page.mouse.move(box.x + box.width * 0.25, box.y + box.height / 2);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width * 0.9, box.y + box.height / 2, { steps: 5 });
  await page.mouse.up();
  await expect(slider).toHaveAttribute('aria-valuenow', '90');
  await slider.focus();
  await page.keyboard.press('ArrowRight');
  await expect(slider).toHaveAttribute('aria-valuenow', '91');
  await expect(slider.locator('[data-part="tip"]')).toHaveText('91%');
  const fill = await slider
    .locator('[data-part="fill"]')
    .evaluate((el) => el.getBoundingClientRect().width);
  expect(Math.abs(fill - box.width * 0.91)).toBeLessThan(2);
});

test('上传区：选择文件后发出 bd-change，带上文件', async ({ page }) => {
  await page.goto(FORM);
  await page.evaluate(() => {
    document.querySelector('#drop')!.addEventListener('bd-change', (e) => {
      (window as unknown as { files: string[] }).files = (e as CustomEvent).detail.files.map(
        (f: File) => f.name,
      );
    });
  });
  await page
    .locator('#drop input[type="file"]')
    .setInputFiles({ name: 'orbit.yml', mimeType: 'text/yaml', buffer: Buffer.from('a: 1') });
  expect(await page.evaluate(() => (window as unknown as { files: string[] }).files)).toEqual([
    'orbit.yml',
  ]);
});

test('单选选择器：打开、选中、关闭，触发按钮和隐藏输入框同步', async ({ page }) => {
  await page.goto(SEL);
  const trigger = page.locator('#single [data-part="trigger"]');
  await expect(trigger).toContainText('亚太香港星轨区');
  await trigger.click();
  const panel = page.locator('#single [data-part="panel"]');
  await expect(panel).toBeVisible();
  await expect(trigger).toHaveAttribute('aria-expanded', 'true');
  await page.waitForTimeout(350); // 等展开动画结束
  // 面板贴在触发按钮下方 6px，至少和按钮一样宽
  const [t, p] = await Promise.all([trigger.boundingBox(), panel.boundingBox()]);
  expect(Math.round(p!.y - (t!.y + t!.height))).toBe(6);
  expect(p!.width).toBeGreaterThanOrEqual(t!.width - 1);
  await page.locator('#single [role="option"]', { hasText: '东京' }).click();
  await expect(panel).toBeHidden();
  await expect(trigger).toContainText('东京低延迟扇区');
  await expect(page.locator('#single input[type="hidden"]')).toHaveValue('ap-tyo-02');
  // 键盘：Enter 打开（焦点落在选中项），下移、Enter 选中
  await trigger.focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('#single [role="option"][aria-selected="true"]')).toBeFocused();
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('Enter');
  await expect(trigger).toContainText('法兰克福中继环');
});

test('多选选择器：切换选项、移除标签、搜索过滤与空状态', async ({ page }) => {
  await page.goto(SEL);
  const trigger = page.locator('#multi [data-part="trigger"]');
  await expect(trigger.locator('.bd-tag')).toHaveCount(3);
  await trigger.locator('.bd-tag', { hasText: '门户站点' }).locator('[data-part="remove"]').click();
  await expect(trigger.locator('.bd-tag')).toHaveCount(2);
  await expect(page.locator('#multi [data-part="panel"]')).toBeHidden();
  await trigger.click();
  await page.locator('#multi [role="option"]', { hasText: '统一鉴权' }).click();
  await expect(page.locator('#multi [data-part="panel"]')).toBeVisible();
  await expect(page.locator('#multi input[type="hidden"]')).toHaveValue('panel,pass,tunnel');
  await page.locator('#multi [data-part="search"]').fill('冷备');
  await expect(page.locator('#multi [role="option"]:visible')).toHaveCount(1);
  await page.locator('#multi [data-part="search"]').fill('不存在');
  await expect(page.locator('#multi [data-part="empty"]')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.locator('#multi [data-part="panel"]')).toBeHidden();
});

test('日期区间：先点起点再点终点，天数和文字更新，键盘可换天、换月', async ({ page }) => {
  await page.goto(SEL);
  const trigger = page.locator('#date [data-part="trigger"]');
  await expect(trigger).toContainText('2026-11-18 → 11-21');
  await expect(trigger.locator('[data-part="badge"]')).toHaveText('4 天窗口');
  await trigger.click();
  const panel = page.locator('#date [data-part="panel"]');
  await expect(panel.locator('[data-part="title"]')).toHaveText('2026 年 11 月');
  await expect(panel.locator('[data-date="2026-11-21"]')).toBeFocused();
  await panel.locator('[data-date="2026-11-05"]').click();
  await expect(trigger.locator('[data-part="badge"]')).toHaveText('点选终点');
  await panel.locator('[data-date="2026-11-09"]').click();
  await expect(panel).toBeHidden();
  await expect(trigger).toContainText('2026-11-05 → 11-09');
  await expect(trigger.locator('[data-part="badge"]')).toHaveText('5 天窗口');
  await expect(page.locator('#date input[type="hidden"]')).toHaveValue('2026-11-05/2026-11-09');
  await trigger.click();
  await expect(panel.locator('[data-date="2026-11-09"]')).toBeFocused();
  await page.keyboard.press('PageDown');
  await expect(panel.locator('[data-part="title"]')).toHaveText('2026 年 12 月');
  await page.keyboard.press('ArrowDown');
  await expect(panel.locator('[data-date="2026-12-16"]')).toBeFocused();
});
