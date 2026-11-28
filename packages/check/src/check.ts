/**
 * blora check：静态检查 HTML 源码，再用无头浏览器在 1380 / 1024 / 375、浅色 / 深色下逐项量页面。
 */
import { createServer, type Server } from 'node:http';
import { readFile, readdir, stat, mkdir, writeFile } from 'node:fs/promises';
import { extname, join, relative, resolve, sep } from 'node:path';
import { chromium, type Browser } from 'playwright';
import { pageChecks, type RawViolation } from './browser.js';
import { checkHtml } from './html.js';
import { RULES, type PageReport, type Violation } from './rules.js';

export interface CheckOptions {
  /** 网址、HTML 文件或目录；本地文件的网址可以带 #场景 */
  targets: string[];
  /** 本地文件从哪个目录起服务（页面里的相对路径要能解析到），默认当前目录 */
  root?: string;
  widths?: number[];
  themes?: ('light' | 'dark')[];
  /** 只跑这些规则；默认全部 */
  rules?: string[];
  /** 不跑这些规则 */
  ignore?: string[];
  /** 只做静态检查（不启动浏览器） */
  staticOnly?: boolean;
  /** 给每个问题截一张图，存到这个目录 */
  screenshots?: string;
  /** 用本机安装的 Chrome 而不是 Playwright 下载的 Chromium */
  channel?: string;
}

const TYPES: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.woff2': 'font/woff2',
  '.map': 'application/json',
};

function serve(root: string): Promise<{ server: Server; origin: string }> {
  const server = createServer(async (req, res) => {
    const path = decodeURIComponent(new URL(req.url ?? '/', 'http://x').pathname);
    const file = resolve(root, `.${path}`);
    if (!file.startsWith(root)) return void res.writeHead(403).end();
    try {
      const body = await readFile(file);
      res
        .writeHead(200, { 'content-type': TYPES[extname(file)] ?? 'application/octet-stream' })
        .end(body);
    } catch {
      res.writeHead(404).end();
    }
  });
  return new Promise((ok) =>
    server.listen(0, '127.0.0.1', () => {
      const addr = server.address();
      ok({
        server,
        origin: `http://127.0.0.1:${typeof addr === 'object' && addr ? addr.port : 0}`,
      });
    }),
  );
}

async function htmlFiles(dir: string): Promise<string[]> {
  const out: string[] = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    if (entry.name.startsWith('.') || entry.name === 'node_modules') continue;
    const p = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...(await htmlFiles(p)));
    else if (entry.name.endsWith('.html')) out.push(p);
  }
  return out.sort();
}

interface Target {
  /** 报告里显示的名字 */
  label: string;
  /** 浏览器打开的网址（静态检查时为 undefined 也行） */
  url?: string;
  /** 本地文件路径（读源码用） */
  file?: string;
}

async function expand(targets: string[], root: string): Promise<Target[]> {
  const out: Target[] = [];
  for (const t of targets) {
    if (/^https?:\/\//.test(t)) {
      out.push({ label: t, url: t });
      continue;
    }
    const [path = t, hash] = t.split('#');
    const abs = resolve(path);
    const info = await stat(abs).catch(() => null);
    if (!info) throw new Error(`找不到 ${path}`);
    const files = info.isDirectory() ? await htmlFiles(abs) : [abs];
    for (const f of files) {
      const rel = relative(root, f);
      if (rel.startsWith('..')) throw new Error(`${f} 不在 --root（${root}）里面`);
      // 单页应用可以在 <meta name="blora-scenes" content="a,b,c"> 里列出场景（按 location.hash 切换），逐个检查
      let scenes: (string | undefined)[] = [hash];
      if (!hash) {
        const meta = (await readFile(f, 'utf8')).match(
          /<meta\s+name="blora-scenes"\s+content="([^"]*)"/,
        );
        if (meta?.[1])
          scenes = meta[1]
            .split(',')
            .map((x) => x.trim())
            .filter(Boolean);
      }
      for (const sc of scenes) {
        const label = relative(process.cwd(), f) + (sc ? `#${sc}` : '');
        out.push({ label, file: f, url: `/${rel.split(sep).join('/')}${sc ? `#${sc}` : ''}` });
      }
    }
  }
  return out;
}

async function launch(channel?: string): Promise<Browser> {
  if (channel) return chromium.launch({ channel });
  try {
    return await chromium.launch();
  } catch {
    // 没装 Playwright 的 Chromium 时，退回本机的 Chrome
    return chromium.launch({ channel: 'chrome' });
  }
}

const THEME_NAME = { light: '浅色', dark: '深色' } as const;

/** 检查一组页面，返回每个页面的问题 */
export async function check(options: CheckOptions): Promise<PageReport[]> {
  const root = resolve(options.root ?? '.');
  const widths = options.widths ?? [1380, 1024, 375];
  const themes = options.themes ?? ['light', 'dark'];
  const enabled = RULES.map((r) => r.id).filter(
    (id) => (!options.rules || options.rules.includes(id)) && !options.ignore?.includes(id),
  );
  const browserRules = enabled.filter((id) => !id.startsWith('html/'));
  const targets = await expand(options.targets, root);

  const local = targets.some((t) => t.file);
  const served = local ? await serve(root) : null;
  const browser = options.staticOnly || !browserRules.length ? null : await launch(options.channel);
  const reports: PageReport[] = [];

  try {
    for (const t of targets) {
      const url = t.file ? `${served?.origin ?? ''}${t.url ?? ''}` : (t.url ?? '');
      const violations: Violation[] = [];
      // 豁免的问题按「规则 + 元素」去重计数
      const allowedKeys = new Set<string>();

      // ---- 静态检查 ----
      if (enabled.some((id) => id.startsWith('html/'))) {
        const source = t.file ? await readFile(t.file, 'utf8') : await (await fetch(url)).text();
        violations.push(...checkHtml(source).filter((v) => enabled.includes(v.rule)));
      }

      // ---- 浏览器检查 ----
      if (browser) {
        const merged = new Map<
          string,
          Violation & { box?: RawViolation['box']; shot?: { width: number; theme: string } }
        >();
        const runs: { width: number; theme: 'light' | 'dark'; reduced: boolean }[] = [];
        for (const width of widths)
          for (const theme of themes) runs.push({ width, theme, reduced: false });
        if (browserRules.includes('reduced-motion'))
          runs.push({ width: widths[0] ?? 1380, theme: themes[0] ?? 'light', reduced: true });
        for (const run of runs) {
          const context = await browser.newContext({
            viewport: { width: run.width, height: 900 },
            colorScheme: run.theme,
            reducedMotion: run.reduced ? 'reduce' : 'no-preference',
          });
          const page = await context.newPage();
          await page.goto(url, { waitUntil: 'load' });
          await page.evaluate(() => document.fonts.ready);
          await page.waitForTimeout(700);
          const rules = run.reduced
            ? ['reduced-motion']
            : browserRules.filter((r) => r !== 'reduced-motion');
          const raw = await page.evaluate(pageChecks, {
            width: run.width,
            rules,
            reducedMotion: run.reduced,
          });
          const where = run.reduced ? '减少动效' : `${run.width} ${THEME_NAME[run.theme]}`;
          for (const v of raw) {
            if (v.allowed) {
              allowedKeys.add(`${v.rule}|${v.target ?? ''}`);
              continue;
            }
            // 同一个问题在几个宽度 / 主题下出现时合并成一条（数值不同的也算同一个问题）
            const key = `${v.rule}|${v.target ?? ''}|${v.message.replace(/[\d.]+/g, '#')}`;
            const hit = merged.get(key);
            if (hit) hit.where?.push(where);
            else {
              const item: Violation & {
                box?: RawViolation['box'];
                shot?: { width: number; theme: string };
              } = {
                rule: v.rule,
                message: v.message,
                where: [where],
                ...(v.level ? { level: v.level } : {}),
                shot: { width: run.width, theme: run.theme },
              };
              if (v.target) item.target = v.target;
              if (v.tile) item.tile = v.tile;
              if (v.box) item.box = v.box;
              merged.set(key, item);
            }
          }
          await context.close();
        }

        // ---- 截图：在第一次发现问题的宽度和主题下，框出元素 ----
        if (options.screenshots && merged.size) {
          await mkdir(options.screenshots, { recursive: true });
          let n = 0;
          for (const v of merged.values()) {
            if (!v.box || !v.shot || n >= 40) continue;
            const context = await browser.newContext({
              viewport: { width: v.shot.width, height: 900 },
              colorScheme: v.shot.theme as 'light' | 'dark',
            });
            const page = await context.newPage();
            await page.goto(url, { waitUntil: 'load' });
            await page.waitForTimeout(700);
            const pad = 24;
            const clip = {
              x: Math.max(0, v.box.x - pad),
              y: Math.max(0, v.box.y - pad),
              width: Math.min(v.box.w + pad * 2, v.shot.width),
              height: Math.min(v.box.h + pad * 2, 1600),
            };
            await page.evaluate((b) => {
              const mark = document.createElement('div');
              Object.assign(mark.style, {
                position: 'absolute',
                left: `${b.x}px`,
                top: `${b.y}px`,
                width: `${b.w}px`,
                height: `${b.h}px`,
                boxShadow: '0 0 0 2px rgb(220 60 60)',
                borderRadius: '4px',
                zIndex: '2147483647',
                pointerEvents: 'none',
              });
              document.body.append(mark);
            }, v.box);
            const name = `${t.label.replace(/[^\w.-]+/g, '_')}-${++n}-${v.rule}.png`;
            await writeFile(
              join(options.screenshots, name),
              await page.screenshot({ clip, fullPage: true }),
            );
            v.where?.push(`截图 ${join(options.screenshots, name)}`);
            await context.close();
          }
        }
        for (const v of merged.values()) {
          delete v.box;
          delete v.shot;
          violations.push(v);
        }
      }
      reports.push({ page: t.label, violations, allowed: allowedKeys.size });
    }
  } finally {
    await browser?.close();
    served?.server.close();
  }
  return reports;
}
