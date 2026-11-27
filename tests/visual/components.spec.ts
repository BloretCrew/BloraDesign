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
type Item = {
  key: string;
  selector: string;
  index: number;
  props: string[];
  width: boolean;
  height: boolean;
};

function split(spec: string): { url: string; selector: string; index: number } {
  const [url = '', ...rest] = spec.split(' ');
  const sel = rest.join(' ');
  const m = sel.match(/^(.*)@(\d+)$/);
  return { url, selector: m ? m[1]! : sel, index: m ? Number(m[2]) : 0 };
}

async function measureOn(page: Page, url: string, items: Item[]) {
  const [path = url, scene] = url.split('#');
  await page.goto(path);
  // demo 页的场景默认隐藏，先切过去
  if (scene)
    await page.evaluate((s) => (window as unknown as { go: (s: string) => void }).go(s), scene);
  if (path.startsWith('/reference/')) await page.addStyleTag({ content: FONTS });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(500);
  return page.evaluate((list) => {
    const out: Record<string, Record<string, string | number> | null> = {};
    for (const it of list) {
      const pseudo = it.selector.endsWith('::before') ? '::before' : undefined;
      const sel = pseudo ? it.selector.slice(0, -'::before'.length) : it.selector;
      const el = document.querySelectorAll(sel)[it.index];
      // 找不到，或者元素不可见（量到的尺寸没有意义）
      if (!el || (!pseudo && el.getBoundingClientRect().width === 0)) {
        out[it.key] = null;
        continue;
      }
      const cs = getComputedStyle(el, pseudo);
      const r = el.getBoundingClientRect();
      const m: Record<string, string | number> = {};
      if (it.height) m.h = Math.round(r.height * 2) / 2;
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
    const groups = new Map<string, Item[]>();
    PAIRS.forEach((p: Pair) => {
      const { url, selector, index } = split(p[side]);
      const list = groups.get(url) ?? [];
      list.push({
        key: p.name,
        selector,
        index,
        props: p.props ?? BOX,
        width: p.size !== false && p.text !== false && !p.props,
        height: p.size !== false,
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
    (p) => `${p.name}: ${!ref[p.name] ? '参考页' : '示例页'}找不到可见的元素`,
  );
  expect(missing).toEqual([]);
  expect(diff(ref, ours)).toEqual([]);
});
