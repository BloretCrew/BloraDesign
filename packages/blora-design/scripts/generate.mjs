// 生成 CSS：
//   src/css/generated/tokens.css  ← 根目录 DESIGN.md 的 YAML（颜色、字体、圆角、间距、动效、投影）
//   src/css/generated/mosaic.css  ← 拼图（bd-mosaic）各列数在各断点下的列模板与圆角分配
//   dist/tokens.json              ← 同一套变量的 JSON，给其他平台用
// 生成的文件不进 git，构建时重新生成。
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { colors as cortado } from '@bloret-crew/cortado';
import { parse } from 'yaml';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const md = await readFile(resolve(root, '../../DESIGN.md'), 'utf8');
const front = md.match(/^---\n([^]*?)\n---\n/)?.[1];
if (!front) throw new Error('DESIGN.md 缺少 YAML front matter');
const d = parse(front);

const fail = (msg) => {
  console.error(`DESIGN.md: ${msg}`);
  process.exit(1);
};

/* ---------- 颜色 ---------- */
const flatColors = Object.entries(d.colors).flatMap(([k, v]) =>
  typeof v === 'string' ? [[k, v]] : Object.entries(v).map(([k2, v2]) => [`${k}.${k2}`, v2]),
);
const colorVar = (path) => `--bd-${path.replace(/\./g, '-')}`;
for (const mode of ['light', 'dark']) {
  for (const [path] of flatColors) {
    const name = d.cortado?.[mode]?.[path];
    if (!name) fail(`cortado.${mode} 缺少 ${path}`);
    if (!(name in cortado)) fail(`cortado.${mode}.${path} 指向不存在的 Cortado 颜色 ${name}`);
  }
}
for (const [path, hex] of flatColors) {
  const actual = cortado[d.cortado.light[path]];
  if (actual.toUpperCase() !== String(hex).toUpperCase())
    fail(
      `colors.${path} 写的是 ${hex}，但 cortado.light 指向的 ${d.cortado.light[path]} 是 ${actual}`,
    );
}
const colorDecls = (mode) =>
  flatColors.map(([path]) => `${colorVar(path)}: var(--cortado-${d.cortado[mode][path]});`);

/* ---------- 投影：{颜色 百分比} → color-mix ---------- */
const colorRef = (ref) => {
  if (ref in cortado) return `var(--cortado-${ref})`;
  if (flatColors.some(([p]) => p === ref)) return `var(${colorVar(ref)})`;
  return fail(`elevation 里的颜色 ${ref} 既不是 Cortado 色名，也不是 colors 里的路径`);
};
const shadow = (v) =>
  String(v).replace(/\{\s*([\w.-]+)\s+([\d.]+%)\s*\}/g, (_, ref, pct) => {
    return `color-mix(in srgb, ${colorRef(ref)} ${pct}, transparent)`;
  });
// scrim 是弹窗遮罩的颜色，输出为 --bd-scrim；其余是投影 --bd-shadow-*
const shadowDecls = (mode) =>
  Object.entries(d.elevation[mode]).map(([k, v]) =>
    k === 'scrim' ? `--bd-scrim: ${shadow(v)};` : `--bd-shadow-${k}: ${shadow(v)};`,
  );

/* ---------- 字体、圆角、间距、动效 ---------- */
const family = (f) => (/mono/i.test(f) ? 'var(--bd-font-mono)' : 'var(--bd-font-sans)');
const typeDecls = Object.entries(d.typography).flatMap(([role, t]) =>
  [
    ['family', family(t.fontFamily)],
    ['size', t.fontSize],
    ['weight', t.fontWeight],
    ['leading', t.lineHeight],
    ['tracking', t.letterSpacing],
    ['feature', t.fontFeature],
  ]
    .filter(([, v]) => v !== undefined)
    .map(([k, v]) => `--bd-text-${role}-${k}: ${v};`),
);
const staticDecls = [
  `color-scheme: light;`,
  ...Object.entries(d.fonts).map(([k, v]) => `--bd-font-${k}: ${v};`),
  ...Object.entries(d.rounded).map(([k, v]) => `--bd-radius-${k}: ${v};`),
  ...Object.entries(d.spacing).map(([k, v]) => `--bd-space-${k}: ${v};`),
  ...Object.entries(d.motion).map(([k, v]) => `--bd-${k}: ${v};`),
  ...typeDecls,
];

const block = (sel, decls, indent = '  ') =>
  `${indent}${sel} {\n${decls.map((x) => `${indent}  ${x}`).join('\n')}\n${indent}}`;
const dark = ['color-scheme: dark;', ...colorDecls('dark'), ...shadowDecls('dark')];
const tokens = `/* 由 scripts/generate.mjs 从 DESIGN.md 生成，不要手改 */
@layer bd.tokens {
${block(':root', [...staticDecls, ...colorDecls('light'), ...shadowDecls('light')])}
  @media (prefers-color-scheme: dark) {
${block(':root:not([data-theme="light"])', dark, '    ')}
  }
${block(':root[data-theme="dark"]', dark)}
}
`;

/* ---------- 拼图：列数 × 断点 ---------- */
// [桌面, ≤1100, ≤900, ≤640]；与 DESIGN.md · Layout · 响应式一致
const COLS = {
  1: [1, 1, 1, 1],
  2: [2, 2, 1, 1],
  3: [3, 3, 1, 1],
  4: [4, 2, 2, 2],
  5: [5, 3, 2, 1],
  6: [6, 3, 2, 2],
};
const BREAKS = [null, 1100, 900, 640];
const at = (n, pos) => `.bd-mosaic[data-cols="${n}"] > :where(${pos})`;
const outer = 'var(--bd-radius-tile)';
const seam = 'var(--bd-radius-seam)';
const rulesFor = (declared, eff, custom) => {
  const lines = [];
  const tpl = custom
    ? `var(--bd-columns, repeat(${eff}, minmax(0, 1fr)))`
    : `repeat(${eff}, minmax(0, 1fr))`;
  lines.push(`.bd-mosaic[data-cols="${declared}"] { grid-template-columns: ${tpl}; }`);
  lines.push(
    `${at(declared, '*')} { --bd-corner-tl: ${seam}; --bd-corner-tr: ${seam}; --bd-corner-br: ${seam}; --bd-corner-bl: ${seam}; }`,
  );
  const N = eff;
  lines.push(`${at(declared, ':first-child')} { --bd-corner-tl: ${outer}; }`);
  lines.push(
    `${at(declared, `:nth-child(${N}), :last-child:nth-child(-n + ${N})`)} { --bd-corner-tr: ${outer}; }`,
  );
  lines.push(
    `${at(declared, `:nth-child(${N}n + 1):nth-last-child(-n + ${N})`)} { --bd-corner-bl: ${outer}; }`,
  );
  lines.push(
    `${at(declared, `:last-child, :nth-child(${N}n):nth-last-child(-n + ${N})`)} { --bd-corner-br: ${outer}; }`,
  );
  return lines;
};
let mosaic =
  '/* 由 scripts/generate.mjs 生成，不要手改。圆角规则：格子的某个角，两侧都没有相邻格子时是外角 20，否则是缝角 6 */\n@layer bd.layout {\n';
BREAKS.forEach((bp, i) => {
  const body = Object.entries(COLS).flatMap(([n, effs]) => {
    if (i > 0 && effs[i] === effs[i - 1]) return [];
    return rulesFor(n, effs[i], effs[i] === Number(n));
  });
  if (!body.length) return;
  const indent = bp ? '    ' : '  ';
  const text = body.map((l) => indent + l).join('\n');
  mosaic += bp ? `  @media (max-width: ${bp}px) {\n${text}\n  }\n` : `${text}\n`;
});
mosaic += '}\n';

/* ---------- 写文件 ---------- */
await rm(resolve(root, 'dist'), { recursive: true, force: true });
await mkdir(resolve(root, 'src/css/generated'), { recursive: true });
await mkdir(resolve(root, 'dist'), { recursive: true });
await writeFile(resolve(root, 'src/css/generated/tokens.css'), tokens);
await writeFile(resolve(root, 'src/css/generated/mosaic.css'), mosaic);
const json = {
  light: Object.fromEntries(flatColors.map(([p]) => [colorVar(p), cortado[d.cortado.light[p]]])),
  dark: Object.fromEntries(flatColors.map(([p]) => [colorVar(p), cortado[d.cortado.dark[p]]])),
  radius: d.rounded,
  space: d.spacing,
  typography: d.typography,
  fonts: d.fonts,
  motion: d.motion,
};
await writeFile(resolve(root, 'dist/tokens.json'), JSON.stringify(json, null, 2) + '\n');
console.log(
  `tokens: ${flatColors.length} colors × 2 modes, ${typeDecls.length} type vars → src/css/generated/`,
);
