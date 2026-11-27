/**
 * 第 ① 阶段验收：只用框架拼出的控制台骨架（recipes/patterns/console-overview.html）
 * 与参考页 reference/demo-console.html 在 1380 / 1024 / 375 三个宽度下逐项比对。
 *
 * 比对外壳、侧栏、顶栏、页头、各行的列宽、格子标题、托盘的位置和样式；
 * 不比对行高（格子里的组件第 ② 阶段才有，内容不同）和格子圆角（参考页在换列后的圆角分配有误，
 * 框架按 DESIGN.md 的规则分配，由 tests/runtime/shell.spec.ts 单独检查）。
 */
import { readFileSync } from 'node:fs';
import { expect, test, type Page } from '@playwright/test';
import { diff } from './compare';

const METRICS = readFileSync(new URL('./shell-metrics.js', import.meta.url), 'utf8');
// 参考页没有打包字体：注入框架自带的同一套字体，两边用同样的字形比较
const FONTS = `
@font-face { font-family: Inter; font-weight: 100 900; src: url(/packages/blora-design/dist/fonts/inter-latin-wght-normal.woff2) format('woff2-variations'); }
@font-face { font-family: 'JetBrains Mono'; font-weight: 100 800; src: url(/packages/blora-design/dist/fonts/jetbrains-mono-latin-wght-normal.woff2) format('woff2-variations'); }`;

type Box = { x: number; y: number; w: number; h: number };
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type M = any;

async function measure(page: Page, url: string, kind: 'reference' | 'framework'): Promise<M> {
  await page.goto(url);
  if (kind === 'reference') await page.addStyleTag({ content: FONTS });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(600);
  await page.addScriptTag({ content: METRICS });
  return page.evaluate(
    (k) => (window as unknown as { shellMetrics: (k: string) => M }).shellMetrics(k),
    kind,
  );
}

const at = (b: Box | null) => b && { x: b.x, w: b.w };
const counterKind = (content: string) =>
  content.includes('decimal-leading-zero')
    ? '01'
    : content.includes('upper-alpha')
      ? '1B'
      : content;

function comparable(m: M, width: number) {
  const tile = (t: M) => ({
    x: t.box.x,
    w: t.box.w,
    backgroundColor: t.backgroundColor,
    boxShadow: t.boxShadow,
    padding: t.padding,
    head: t.head && {
      dx: t.head.box.x - t.box.x,
      dy: t.head.box.y - t.box.y,
      h: t.head.box.h,
      title: {
        ...t.head.title,
        box: { y: t.head.title.box.y - t.head.box.y, h: t.head.title.box.h },
      },
      badge: { ...t.head.badge, text: counterKind(t.head.badge.text) },
      sub: {
        ...t.head.sub,
        box: {
          x: t.head.sub.box.x - t.box.x,
          y: t.head.sub.box.y - t.head.box.y,
          h: t.head.sub.box.h,
        },
      },
    },
    tray: t.tray && { ...t.tray, x: t.tray.x - t.box.x },
  });
  return {
    app: at(m.app),
    rail: m.rail,
    brand: m.brand && { ...m.brand, box: at(m.brand.box) },
    section: m.section,
    // ≤900 参考页的侧栏隐藏、另有一条 .mobile-nav；框架是同一个 bd-rail 变成横向导航条，用 strip 比对
    // 导航项高度固定，行高不影响排版，不比对
    items: width > 900 ? m.items.map((i: M) => ({ ...i, lineHeight: null })) : null,
    active: width > 900 ? m.active : null,
    glide: width > 900 ? m.glide && m.glide.box : null,
    count: m.count,
    note: m.note,
    collapse: m.collapse,
    topbar: m.topbar,
    // 框架的横向导航条保留格子投影（DESIGN.md · Elevation：侧栏和格子一样有投影），参考页漏了
    strip: m.strip && { ...m.strip, boxShadow: null, item: { ...m.strip.item, lineHeight: null } },
    pageHead: { ...m.pageHead, box: width > 640 ? m.pageHead.box : at(m.pageHead.box) },
    eyebrow: { ...m.eyebrow, box: { x: m.eyebrow.box.x, y: m.eyebrow.box.y, h: m.eyebrow.box.h } },
    title: { ...m.title, box: { x: m.title.box.x, y: m.title.box.y, h: m.title.box.h } },
    sub: { ...m.sub, box: { x: m.sub.box.x, y: m.sub.box.y, h: m.sub.box.h } },
    rows: m.rows.map((r: M) => ({
      x: r.box.x,
      w: r.box.w,
      columns: r.columns,
      tiles: r.tiles.map(tile),
    })),
  };
}

for (const [width, height] of [
  [1380, 900],
  [1024, 800],
  [375, 812],
] as const) {
  test(`控制台骨架与参考页一致 · ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height });
    const ref = comparable(await measure(page, '/reference/demo-console.html', 'reference'), width);
    const ours = comparable(
      await measure(page, '/recipes/patterns/console-overview.html', 'framework'),
      width,
    );
    expect(diff(ref, ours)).toEqual([]);
  });
}
