// 把 src/css/blora.css 及其 @import（包括 node_modules 里的 Cortado）打包成 dist/blora.css；页面模式打包成 dist/patterns.css
import { copyFile, mkdir, readFile, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import browserslist from 'browserslist';
import { browserslistToTargets, bundleAsync } from 'lightningcss';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const pkg = JSON.parse(await readFile(resolve(root, 'package.json'), 'utf8'));
const targets = browserslistToTargets(browserslist(pkg.browserslist));

const resolver = {
  resolve(specifier, from) {
    if (specifier.startsWith('.') || specifier.startsWith('/')) {
      return resolve(dirname(from), specifier);
    }
    return createRequire(from).resolve(specifier);
  },
};

// blora.css：核心；patterns.css：页面模式（看板、日程、套餐卡…），按需引入，只用 --bd-* 变量
const sizes = [];
for (const name of ['blora', 'patterns']) {
  const { code, map, warnings } = await bundleAsync({
    filename: resolve(root, `src/css/${name}.css`),
    targets,
    minify: true,
    sourceMap: true,
    errorRecovery: false,
    resolver,
  });
  if (warnings.length) {
    for (const w of warnings) console.error(`${w.loc.filename}:${w.loc.line} ${w.message}`);
    process.exit(1);
  }
  const banner = `/*! Blora Design ${pkg.version}${name === 'patterns' ? ' · patterns' : ''} | Apache-2.0 | colors: Cortado (MIT) */\n`;
  await writeFile(
    resolve(root, `dist/${name}.css`),
    banner + code.toString() + `\n/*# sourceMappingURL=${name}.css.map */\n`,
  );
  await writeFile(resolve(root, `dist/${name}.css.map`), map);
  sizes.push(`dist/${name}.css  ${(code.length / 1024).toFixed(1)} kB`);
}
// 字体：Inter、JetBrains Mono 可变字体（SIL OFL 1.1），连同许可一起放进 dist/fonts
const require = createRequire(import.meta.url);
const FONTS = {
  '@fontsource-variable/inter': [
    'inter-latin-wght-normal.woff2',
    'inter-latin-ext-wght-normal.woff2',
  ],
  '@fontsource-variable/jetbrains-mono': ['jetbrains-mono-latin-wght-normal.woff2'],
};
await mkdir(resolve(root, 'dist/fonts'), { recursive: true });
for (const [name, files] of Object.entries(FONTS)) {
  const dir = dirname(require.resolve(`${name}/package.json`));
  for (const file of files)
    await copyFile(resolve(dir, 'files', file), resolve(root, 'dist/fonts', file));
  const short = name.split('/')[1];
  await copyFile(resolve(dir, 'LICENSE'), resolve(root, `dist/fonts/${short}.LICENSE.txt`));
}

console.log(sizes.join('\n'));
