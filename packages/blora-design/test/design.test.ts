// DESIGN.md 的 YAML 是设计变量的唯一来源：检查颜色映射完整、指向存在的 Cortado 颜色、且与写下的色值一致
import { readFileSync } from 'node:fs';
import { colors as cortado } from '@bloret-crew/cortado';
import { describe, expect, it } from 'vitest';
import { parse } from 'yaml';

const md = readFileSync(new URL('../../../DESIGN.md', import.meta.url), 'utf8');
const front = md.match(/^---\n([^]*?)\n---\n/)?.[1];
if (!front) throw new Error('DESIGN.md 缺少 YAML front matter');

interface Design {
  colors: Record<string, string | Record<string, string>>;
  cortado: { light: Record<string, string>; dark: Record<string, string> };
}
const design = parse(front) as Design;

/** colors 拍平成 { 'blush.solid': '#DC8A78' } */
const flat = Object.fromEntries(
  Object.entries(design.colors).flatMap(([k, v]) =>
    typeof v === 'string' ? [[k, v]] : Object.entries(v).map(([k2, v2]) => [`${k}.${k2}`, v2]),
  ),
);
const palette = cortado as Record<string, string>;

describe('DESIGN.md · colors ↔ cortado', () => {
  it.each(['light', 'dark'] as const)('%s 一栏与 colors 的键完全一致', (mode) => {
    expect(Object.keys(design.cortado[mode]).sort()).toEqual(Object.keys(flat).sort());
  });

  it.each(['light', 'dark'] as const)('%s 一栏只引用存在的 Cortado 颜色', (mode) => {
    const missing = Object.values(design.cortado[mode]).filter((name) => !(name in palette));
    expect(missing).toEqual([]);
  });

  it('light 一栏的 Cortado 色值等于 colors 里写下的色值', () => {
    const mismatch = Object.entries(design.cortado.light)
      .filter(([key, name]) => palette[name]?.toUpperCase() !== flat[key]?.toUpperCase())
      .map(([key, name]) => `${key}: colors=${flat[key]} cortado ${name}=${palette[name]}`);
    expect(mismatch).toEqual([]);
  });
});
