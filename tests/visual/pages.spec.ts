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

type PerWidth = Partial<Record<number, number>>;

interface Scene {
  page: string;
  scene?: string;
  /** 只比这些宽度（默认三档都比） */
  widths?: number[];
  /** 允许的差异像素占比（0–1），按宽度覆盖默认值 */
  budget?: PerWidth;
  /** 允许的整页高度差（px），只给已记录的偏差用（docs/roadmap.md） */
  height?: PerWidth;
}

// 默认预算：窄屏文字换行多，次像素位置的差异也多一些
const BUDGET: Record<number, number> = { 1380: 0.011, 1024: 0.016, 375: 0.035 };
// 默认高度差：桌面必须一致；手机上参考页有收起的批量栏等留下的 1–4px 残余间距
const HEIGHT: Record<number, number> = { 1380: 0, 1024: 0, 375: 4 };

// CI 的 Linux Chromium 用另一套中文回落字体和字形微调，文字边缘的差异像素比 macOS 多；
// 几何仍由「高度一致」把关，所以像素预算在 CI 上放宽一倍
const SLACK = process.env.CI ? 2 : 1;

// 默认比 1380 / 1024 / 375 三档；BD_WIDTHS=1024 只比其中一档
const WIDTHS = (process.env.BD_WIDTHS ?? '1380,1024,375').split(',').map(Number);

const scenes = (page: string, list: string[]): Scene[] => list.map((scene) => ({ page, scene }));

export const PAGES: Scene[] = [
  ...scenes('demo-console', ['start', 'overview', 'list', 'detail', 'settings']),
  ...scenes('demo-billing', ['plans', 'usage', 'invoices', 'payment']),
  ...scenes('demo-team', ['board', 'inbox', 'schedule', 'profile']),
  ...scenes('demo-docs', ['help', 'article', 'changelog', 'search']),
  // 组件全集页比 DESIGN.md 早：格子标题 14.5 / 600、指标格是居中 52px 环的另一种版式，按 DESIGN.md 实现；
  // 它的手机版式（隐藏格子说明、标签上下排）是展示页自己的，只比桌面宽度（docs/roadmap.md）
  { page: 'components', widths: [1380], budget: { 1380: 0.05 }, height: { 1380: 10 } },
];

// 已记录的偏差（docs/roadmap.md）
const EXCEPTIONS: Record<string, Pick<Scene, 'budget' | 'height'>> = {
  // 套餐页：对比表托盘按 DESIGN.md 用 5 / 4（参考页 4 / 3）、展开的常见问题用雾粉浅底、收束行上边距 4
  // 窄屏对比表变成单独一行，这几处差异全部累加到页面高度上（+20）
  'demo-billing#plans': {
    budget: { 1380: 0.02, 1024: 0.022 },
    height: { 1380: 13, 1024: 20, 375: 20 },
  },
};

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
    if (s.widths && !s.widths.includes(width)) continue;
    const extra = EXCEPTIONS[`${s.page}#${s.scene ?? ''}`] ?? {};
    const budget = extra.budget?.[width] ?? s.budget?.[width] ?? BUDGET[width] ?? 0.011;
    const heightSlack = extra.height?.[width] ?? s.height?.[width] ?? HEIGHT[width] ?? 0;
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
        height: Math.abs(b.height - a.height) <= heightSlack,
        ratio: ratio <= budget * SLACK,
      }).toEqual({
        height: true,
        ratio: true,
      });
    });
  }
}
