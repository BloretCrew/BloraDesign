// 检查构建产物：先 pnpm build 再跑测试（pnpm verify 会按顺序执行）
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const pkg = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8')) as {
  version: string;
};
const css = readFileSync(new URL('../dist/blora.css', import.meta.url), 'utf8');

describe('dist/blora.css', () => {
  it('bd.* 层按固定顺序出现（打包器会合并层声明，所以检查首次出现的顺序）', () => {
    const order: string[] = [];
    for (const m of css.matchAll(/@layer\s+([^{;]+)[{;]/g)) {
      for (const name of (m[1] ?? '').split(',').map((n) => n.trim())) {
        if (!order.includes(name)) order.push(name);
      }
    }
    expect(order).toEqual([
      'bd.reset',
      'bd.tokens',
      'bd.base',
      'bd.layout',
      'bd.components',
      'bd.patterns',
      'bd.motion',
      'bd.utilities',
    ]);
  });

  it('打包进了 Cortado 调色板，且放在 bd.tokens 层', () => {
    expect(css).toMatch(/@layer bd\.tokens\{[^]*--cortado-rosewater-285:#dc8a78/i);
  });

  it('banner 带当前版本号', () => {
    expect(css.startsWith(`/*! Blora Design ${pkg.version} `)).toBe(true);
  });
});

describe('dist/patterns.css', () => {
  const patterns = readFileSync(new URL('../dist/patterns.css', import.meta.url), 'utf8');

  it('页面模式都在 bd.patterns 层里，只用 --bd-* 变量', () => {
    expect(patterns).toMatch(/@layer bd\.patterns/);
    expect(patterns).not.toMatch(/--cortado-/);
  });
});

describe('dist/blora.js', () => {
  it('导出的 version 与 package.json 一致', async () => {
    const url = new URL('../dist/blora.js', import.meta.url).href;
    const mod = (await import(url)) as { version: string };
    expect(mod.version).toBe(pkg.version);
  });
});
