/**
 * 第 ② 阶段：框架组件与参考页（reference/components.html 等）逐个比对尺寸和样式。
 * 比对表在 component-pairs.ts。
 */
import { expect, test, type Page } from '@playwright/test';
import { diff } from './compare';
import { BOX, PAIRS, type Pair } from './component-pairs';

const FONTS = `
@font-face { font-family: Inter; font-weight: 100 900; src: url(/packages/blora-design/dist/fonts/inter-latin-wght-normal.woff2) format('woff2-variations'); }
@font-face { font-family: 'JetBrains Mono'; font-weight: 100 800; src: url(/packages/blora-design/dist/fonts/jetbrains-mono-latin-wght-normal.woff2) format('woff2-variations'); }`;

type Measure = Record<string, string | number> | null;

function split(spec: string): { url: string; selector: string; index: number } {
  const [url = '', ...rest] = spec.split(' ');
  const sel = rest.join(' ');
  const m = sel.match(/^(.*)@(\d+)$/);
  return { url, selector: m ? m[1]! : sel, index: m ? Number(m[2]) : 0 };
}

async function measureOn(
  page: Page,
  url: string,
  items: { key: string; selector: string; index: number; props: string[]; width: boolean }[],
) {
  await page.goto(url);
  if (url.startsWith('/reference/')) await page.addStyleTag({ content: FONTS });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(500);
  return page.evaluate((list) => {
    const out: Record<string, Record<string, string | number> | null> = {};
    for (const it of list) {
      const el = document.querySelectorAll(it.selector)[it.index];
      if (!el) {
        out[it.key] = null;
        continue;
      }
      const cs = getComputedStyle(el);
      const r = el.getBoundingClientRect();
      const m: Record<string, string | number> = { h: Math.round(r.height * 2) / 2 };
      if (it.width) m.w = Math.round(r.width * 2) / 2;
      for (const p of it.props) m[p] = (cs as unknown as Record<string, string>)[p] ?? '';
      out[it.key] = m;
    }
    return out;
  }, items);
}

test('组件与参考页一致', async ({ page }) => {
  await page.setViewportSize({ width: 1380, height: 900 });
  const byUrl = (side: 'ref' | 'ours') => {
    const groups = new Map<
      string,
      { key: string; selector: string; index: number; props: string[]; width: boolean }[]
    >();
    PAIRS.forEach((p: Pair) => {
      const { url, selector, index } = split(p[side]);
      const list = groups.get(url) ?? [];
      list.push({
        key: p.name,
        selector,
        index,
        props: p.props ?? BOX,
        width: p.text !== false && !p.props,
      });
      groups.set(url, list);
    });
    return groups;
  };
  const collect = async (side: 'ref' | 'ours') => {
    const all: Record<string, Measure> = {};
    for (const [url, items] of byUrl(side)) Object.assign(all, await measureOn(page, url, items));
    return all;
  };
  const ref = await collect('ref');
  const ours = await collect('ours');
  const missing = PAIRS.filter((p) => !ref[p.name] || !ours[p.name]).map(
    (p) => `${p.name}: ${!ref[p.name] ? '参考页' : '示例页'}找不到元素`,
  );
  expect(missing).toEqual([]);
  expect(diff(ref, ours)).toEqual([]);
});
