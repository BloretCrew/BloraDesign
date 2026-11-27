// 把 src/css/blora.css 及其 @import（包括 node_modules 里的 Cortado）打包成 dist/blora.css
import { readFile, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import browserslist from 'browserslist';
import { browserslistToTargets, bundleAsync } from 'lightningcss';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const pkg = JSON.parse(await readFile(resolve(root, 'package.json'), 'utf8'));
const targets = browserslistToTargets(browserslist(pkg.browserslist));

const { code, map, warnings } = await bundleAsync({
  filename: resolve(root, 'src/css/blora.css'),
  targets,
  minify: true,
  sourceMap: true,
  errorRecovery: false,
  resolver: {
    resolve(specifier, from) {
      if (specifier.startsWith('.') || specifier.startsWith('/')) {
        return resolve(dirname(from), specifier);
      }
      return createRequire(from).resolve(specifier);
    },
  },
});

if (warnings.length) {
  for (const w of warnings) console.error(`${w.loc.filename}:${w.loc.line} ${w.message}`);
  process.exit(1);
}

const banner = `/*! Blora Design ${pkg.version} | Apache-2.0 | colors: Cortado (MIT) */\n`;
await writeFile(
  resolve(root, 'dist/blora.css'),
  banner + code.toString() + '\n/*# sourceMappingURL=blora.css.map */\n',
);
await writeFile(resolve(root, 'dist/blora.css.map'), map);
console.log(`dist/blora.css  ${(code.length / 1024).toFixed(1)} kB`);
