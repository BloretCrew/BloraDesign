import { readFileSync } from 'node:fs';
import { defineConfig } from 'vite';

const pkg = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf8')) as {
  version: string;
};

export default defineConfig({
  define: { __BD_VERSION__: JSON.stringify(pkg.version) },
  build: {
    lib: { entry: 'src/index.ts', formats: ['es'], fileName: () => 'blora.js' },
    target: 'es2023',
    sourcemap: true,
    emptyOutDir: false,
  },
});
