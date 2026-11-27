/** 不出现原生控件外观（DESIGN.md · Components · 不出现原生控件）：重置样式把原生外观全部去掉 */
import { expect, test } from '@playwright/test';

test('原生控件的 appearance 全部为 none，没有默认边框、焦点框和滚动条', async ({ page }) => {
  await page.goto('/tests/fixtures/native.html');
  const problems = await page.evaluate(() => {
    const out: string[] = [];
    document.querySelectorAll('input, select, textarea, button, progress, meter').forEach((el) => {
      const cs = getComputedStyle(el);
      const name = `${el.tagName.toLowerCase()}${el.getAttribute('type') ? `[${el.getAttribute('type')}]` : ''}`;
      if (cs.appearance !== 'none') out.push(`${name} appearance=${cs.appearance}`);
      if (cs.borderTopStyle !== 'none' && parseFloat(cs.borderTopWidth) > 0)
        out.push(`${name} 有边框`);
    });
    document.querySelectorAll('*').forEach((el) => {
      if (getComputedStyle(el).scrollbarWidth !== 'none')
        out.push(`${el.tagName.toLowerCase()} 显示原生滚动条`);
    });
    const marker = getComputedStyle(document.querySelector('summary')!, '::marker').content;
    if (marker !== '""' && marker !== 'none') out.push(`summary 有默认三角 ${marker}`);
    return out;
  });
  expect(problems).toEqual([]);
  await page.locator('input[type="text"]').focus();
  expect(
    await page.locator('input[type="text"]').evaluate((el) => getComputedStyle(el).outlineStyle),
  ).toBe('none');
});
