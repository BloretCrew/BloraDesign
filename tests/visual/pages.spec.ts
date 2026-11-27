/**
 * 第 ② 阶段验收：只用框架重写的整页（recipes/pages/）与参考页（reference/）逐场景整页截图，逐像素比对。
 *
 * 每个场景一条测试，差异图写到 .page-diff/<名字>-{ref,ours,diff}.png。
 * 差异像素占比不能超过 PAGES 表里给的预算（已知且已记录的偏差会占用一点预算，见 docs/roadmap.md）。
 *
 * 只跑一页：pnpm exec playwright test tests/visual/pages.spec.ts -g "console"
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { expect, test, type Page } from '@playwright/test';
import pixelmatch from 'pixelmatch';
import { PNG } from 'pngjs';

const FONTS = `
@font-face { font-family: Inter; font-weight: 100 900; src: url(/packages/blora-design/dist/fonts/inter-latin-wght-normal.woff2) format('woff2-variations'); }
@font-face { font-family: 'JetBrains Mono'; font-weight: 100 800; src: url(/packages/blora-design/dist/fonts/jetbrains-mono-latin-wght-normal.woff2) format('woff2-variations'); }`;

// 截图时隐藏文字光标、滚动滑块这类与布局无关、出现时机不定的东西
const QUIET = `* { caret-color: transparent !important; }`;

interface Scene {
  page: string;
  scene?: string;
  /** 允许的差异像素占比（0–1） */
  budget: number;
  /** 允许的整页高度差（px），只给已记录的偏差用（docs/roadmap.md） */
  height?: number;
}

// 默认只比 1380；BD_WIDTHS=1024,375 可以另比窄屏
const WIDTHS = (process.env.BD_WIDTHS ?? '1380').split(',').map(Number);

export const PAGES: Scene[] = [
  ...['start', 'overview', 'list', 'detail', 'settings'].map((scene) => ({
    page: 'demo-console',
    scene,
    budget: 0.011,
  })),
  // 套餐页：对比表托盘按 DESIGN.md 用 5 / 4（参考页 4 / 3）、展开的常见问题用雾粉浅底、收束行上边距 4，共高 13px（docs/roadmap.md）
  { page: 'demo-billing', scene: 'plans', budget: 0.025, height: 13 },
  ...['usage', 'invoices', 'payment'].map((scene) => ({
    page: 'demo-billing',
    scene,
    budget: 0.01,
  })),
  ...['board', 'inbox', 'schedule', 'profile'].map((scene) => ({
    page: 'demo-team',
    scene,
    budget: 0.01,
  })),
  ...['help', 'article', 'changelog', 'search'].map((scene) => ({
    page: 'demo-docs',
    scene,
    budget: 0.01,
  })),
  // 组件全集页比 DESIGN.md 早：格子标题 14.5 / 600、指标格是居中 52px 环的另一种版式，按 DESIGN.md 实现（docs/roadmap.md）
  { page: 'components', budget: 0.05, height: 8 },
];

const ours = (p: string) => `/recipes/pages/${p.replace(/^demo-/, '')}.html`;

async function shoot(page: Page, url: string, scene: string | undefined, ref: boolean) {
  await page.goto(url);
  if (ref) await page.addStyleTag({ content: FONTS });
  await page.addStyleTag({ content: QUIET });
  if (scene) {
    await page.evaluate((s) => (window as unknown as { go: (s: string) => void }).go(s), scene);
  }
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(900);
  await page.mouse.move(0, 0);
  return PNG.sync.read(await page.screenshot({ fullPage: true, animations: 'disabled' }));
}

/** 两张图尺寸不同时，补成同样大小（多出的部分算作差异） */
function pad(img: PNG, w: number, h: number): PNG {
  if (img.width === w && img.height === h) return img;
  const out = new PNG({ width: w, height: h });
  out.data.fill(0);
  PNG.bitblt(img, out, 0, 0, Math.min(img.width, w), Math.min(img.height, h), 0, 0);
  return out;
}

for (const width of WIDTHS) {
  for (const s of PAGES) {
    const name = `${s.page.replace(/^demo-/, '')}${s.scene ? `-${s.scene}` : ''}@${width}`;
    test(`整页一致：${name}`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      const a = await shoot(page, `/reference/${s.page}.html`, s.scene, true);
      const b = await shoot(page, ours(s.page), s.scene, false);
      const w = Math.max(a.width, b.width);
      const h = Math.max(a.height, b.height);
      const ra = pad(a, w, h);
      const rb = pad(b, w, h);
      const out = new PNG({ width: w, height: h });
      const bad = pixelmatch(ra.data, rb.data, out.data, w, h, { threshold: 0.25 });
      const dir = '.page-diff';
      mkdirSync(dir, { recursive: true });
      writeFileSync(`${dir}/${name}-ref.png`, PNG.sync.write(ra));
      writeFileSync(`${dir}/${name}-ours.png`, PNG.sync.write(rb));
      writeFileSync(`${dir}/${name}-diff.png`, PNG.sync.write(out));
      const ratio = bad / (w * h);
      console.log(
        `${name}: 高度 参考 ${a.height} / 框架 ${b.height}，差异 ${(ratio * 100).toFixed(3)}%`,
      );
      expect({
        height: Math.abs(b.height - a.height) <= (s.height ?? 0),
        ratio: ratio <= s.budget,
      }).toEqual({
        height: true,
        ratio: true,
      });
    });
  }
}
