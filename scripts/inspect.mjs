#!/usr/bin/env node
/**
 * 量参考页（或任意页面）里某个元素及其子元素的盒子和计算样式，用来照着补框架。
 *
 *   node scripts/inspect.mjs <路径[#场景]> <选择器> [深度=2] [序号=0]
 *   node scripts/inspect.mjs reference/demo-console.html#overview ".feed-item" 2
 *
 * 需要先启动 node scripts/serve.mjs（端口 4317）。只打印与默认值不同的常用属性。
 */
import { chromium } from '@playwright/test';

const [target, selector, depthArg = '2', indexArg = '0'] = process.argv.slice(2);
if (!target || !selector) {
  console.error('用法：node scripts/inspect.mjs <路径[#场景]> <选择器> [深度] [序号]');
  process.exit(1);
}
const [path, scene] = target.split('#');
const browser = await chromium.launch(process.env.CI ? {} : { channel: 'chrome' });
const page = await browser.newPage({
  viewport: { width: Number(process.env.W ?? 1380), height: 900 },
});
await page.goto(`http://localhost:4317/${path}`);
if (path.startsWith('reference/')) {
  await page.addStyleTag({
    content: `@font-face { font-family: Inter; font-weight: 100 900; src: url(/packages/blora-design/dist/fonts/inter-latin-wght-normal.woff2) format('woff2-variations'); }
@font-face { font-family: 'JetBrains Mono'; font-weight: 100 800; src: url(/packages/blora-design/dist/fonts/jetbrains-mono-latin-wght-normal.woff2) format('woff2-variations'); }`,
  });
}
if (scene) await page.evaluate((s) => window.go(s), scene);
await page.waitForTimeout(800);
const out = await page.evaluate(
  ({ selector, depth, index }) => {
    const PROPS = [
      'display',
      'position',
      'gridTemplateColumns',
      'flexDirection',
      'alignItems',
      'justifyContent',
      'gap',
      'padding',
      'margin',
      'borderRadius',
      'backgroundColor',
      'color',
      'letterSpacing',
      'textTransform',
      'fontFamily',
      'fontSize',
      'fontWeight',
      'lineHeight',
      'boxShadow',
      'opacity',
      'whiteSpace',
      'textAlign',
      'fontFeatureSettings',
      'fontVariantNumeric',
      'stroke',
      'fill',
    ];
    const ref = document.createElement('div');
    document.body.append(ref);
    const base = getComputedStyle(ref);
    const defaults = Object.fromEntries(PROPS.map((p) => [p, base[p]]));
    const root = document.querySelectorAll(selector)[index];
    if (!root) return `找不到 ${selector}`;
    const o = root.getBoundingClientRect();
    const lines = [];
    const walk = (el, d) => {
      const r = el.getBoundingClientRect();
      const cs = getComputedStyle(el);
      const cls = typeof el.className === 'string' ? el.className : el.getAttribute('class');
      const name = `${el.tagName.toLowerCase()}${cls ? '.' + cls.trim().split(/\s+/).join('.') : ''}`;
      const props = PROPS.filter(
        (p) => cs[p] !== defaults[p] && cs[p] !== 'normal' && cs[p] !== 'none',
      )
        .map((p) => `${p}: ${p === 'fontFamily' ? cs[p].split(',')[0] : cs[p]}`)
        .join('; ');
      const text =
        el.children.length === 0 ? ` "${(el.textContent ?? '').trim().slice(0, 30)}"` : '';
      lines.push(
        `${'  '.repeat(d)}${name} [${Math.round((r.x - o.x) * 10) / 10},${Math.round((r.y - o.y) * 10) / 10} ${Math.round(r.width * 10) / 10}×${Math.round(r.height * 10) / 10}]${text}\n${'  '.repeat(d)}  ${props}`,
      );
      for (const pseudo of ['::before', '::after']) {
        const ps = getComputedStyle(el, pseudo);
        if (ps.content && ps.content !== 'none' && ps.content !== 'normal') {
          lines.push(
            `${'  '.repeat(d)}  ${pseudo}: content ${ps.content}; ${ps.width}×${ps.height}; bg ${ps.backgroundColor}; ${ps.font}`,
          );
        }
      }
      if (d < depth) for (const c of el.children) walk(c, d + 1);
    };
    walk(root, 0);
    return lines.join('\n');
  },
  { selector, depth: Number(depthArg), index: Number(indexArg) },
);
console.log(out);
await browser.close();
