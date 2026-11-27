import stylelint from 'stylelint';
import { describe, expect, it } from 'vitest';
import config from '../index.js';

async function rulesHit(code: string): Promise<string[]> {
  const { results } = await stylelint.lint({ code, config });
  return (results[0]?.warnings ?? []).map((w) => w.rule).sort();
}

describe('stylelint-config-blora', () => {
  it('合规写法不报错', async () => {
    expect(
      await rulesHit(`.bd-tile {
        background: var(--bd-surface-tile);
        border: 0;
        outline: none;
        box-shadow: 0 0 0 3px color-mix(in srgb, var(--bd-accent) 22%, transparent);
      }`),
    ).toEqual([]);
  });

  it.each([
    ['写死十六进制颜色', 'a { color: #fff; }', 'color-no-hex'],
    ['颜色名', 'a { color: white; }', 'color-named'],
    ['渐变', 'a { background: linear-gradient(red 0, blue 1px); }', 'function-disallowed-list'],
    ['rgba()', 'a { color: rgba(0 0 0 / 50%); }', 'function-disallowed-list'],
    [
      '描边简写',
      'a { border: 1px solid var(--bd-ink-4); }',
      'declaration-property-value-disallowed-list',
    ],
    ['单边描边', 'a { border-bottom: 1px solid; }', 'declaration-property-value-disallowed-list'],
    ['outline', 'a { outline: 2px solid; }', 'declaration-property-value-disallowed-list'],
    ['描边宽度', 'a { border-width: 1px; }', 'property-disallowed-list'],
    [
      '直接引用调色板',
      'a { color: var(--cortado-rosewater-285); }',
      'declaration-property-value-disallowed-list',
    ],
  ])('拦下%s', async (_name, code, rule) => {
    expect(await rulesHit(code)).toContain(rule);
  });
});
