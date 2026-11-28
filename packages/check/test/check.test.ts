/**
 * 第 ③ 阶段验收：一组故意写错的页面，每一页都要被对应的规则拦下，而且只被这条规则拦下；写对的页面没有问题。
 * 先构建 @bloret-crew/blora-design（fixtures 引用它的 dist）和本包。
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { check, type CheckOptions } from '../src/check';
import { checkHtml, COMPONENTS } from '../src/html';

const root = fileURLToPath(new URL('../../..', import.meta.url));
const fixture = (name: string): string =>
  fileURLToPath(new URL(`./fixtures/${name}.html`, import.meta.url));
// 本地用已安装的 Chrome；CI 用 Playwright 下载的 Chromium
const channel = process.env.CI ? {} : { channel: 'chrome' };

async function rulesOf(name: string, opt: Partial<CheckOptions> = {}): Promise<string[]> {
  const [report] = await check({
    targets: [fixture(name)],
    root,
    widths: [1380],
    themes: ['light'],
    ...channel,
    ...opt,
  });
  return [
    ...new Set((report?.violations ?? []).filter((v) => v.level !== 'warn').map((v) => v.rule)),
  ].sort();
}

describe('blora check：写错的页面被对应的规则拦下', () => {
  it('写对的页面：没有问题', async () => {
    expect(await rulesOf('clean', { widths: [1380, 375], themes: ['light', 'dark'] })).toEqual([]);
  });

  const cases: [string, string[], Partial<CheckOptions>?][] = [
    ['whitespace', ['whitespace']],
    ['squeezed', ['squeezed']],
    ['halo-clip', ['halo-clip']],
    ['native-ui', ['html/native-element', 'html/native-input', 'native-ui']],
    ['hard-color', ['hard-color']],
    ['gradient', ['gradient']],
    ['border', ['border']],
    ['contrast', ['contrast']],
    ['glide', ['glide']],
    ['overflow', ['overflow']],
    ['tap-target', ['tap-target'], { widths: [375] }],
    ['reduced-motion', ['reduced-motion']],
    [
      'html-static',
      [
        'html/inline-color',
        'html/native-dialog',
        'html/one-component',
        'html/state-class',
        'html/title-attr',
        'html/unknown-component',
      ],
      { staticOnly: true },
    ],
  ];
  for (const [name, expected, opt] of cases) {
    it(`${name}：只被 ${expected.join('、')} 拦下`, async () => {
      expect(await rulesOf(name, opt)).toEqual(expected.sort());
    });
  }
});

describe('静态检查', () => {
  it('报出行号和元素', () => {
    const [v] = checkHtml('<p>\n<select aria-label="区域"></select>\n</p>');
    expect(v).toMatchObject({ rule: 'html/native-element', line: 2, target: '<select>' });
  });

  it('从 blora.js 导入的 confirm() 不算原生弹窗，window.confirm() 算', () => {
    const ok = `<script type="module">import { confirm } from './blora.js'; confirm({ title: '删除？' });</script>`;
    const bad = `<script>if (window.confirm('删除？')) {}</script>`;
    expect(checkHtml(ok)).toEqual([]);
    expect(checkHtml(bad).map((v) => v.rule)).toEqual(['html/native-dialog']);
  });

  it('svg 里的 <title> 是无障碍名称，不算 title 属性；var() 里的颜色名不算写死颜色', () => {
    expect(
      checkHtml('<svg><title>图标</title></svg><p style="color: var(--bd-ink)">字</p>'),
    ).toEqual([]);
  });

  it('组件清单与 dist/blora.css 里的组件类一致', () => {
    const css = readFileSync(new URL('../../blora-design/dist/blora.css', import.meta.url), 'utf8');
    const inCss = new Set([...css.matchAll(/\.(bd-[a-z][a-z-]*)/g)].map((m) => m[1] ?? ''));
    expect([...COMPONENTS].sort()).toEqual([...inCss].sort());
  });
});
