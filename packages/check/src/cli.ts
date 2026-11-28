#!/usr/bin/env node
/**
 * blora check <网址 | 文件 | 目录>…   浏览器检查 + HTML 静态检查
 * blora lint  <文件 | 目录>…          只做 HTML 静态检查（不启动浏览器）
 * blora rules                         列出全部规则
 */
import { parseArgs } from 'node:util';
import { check } from './check.js';
import { format } from './report.js';
import { RULES, failed } from './rules.js';

const HELP = `用法：
  blora check <网址 | HTML 文件 | 目录>…   在 1380 / 1024 / 375、浅色 / 深色下检查页面，并检查 HTML 写法
  blora lint  <HTML 文件 | 目录>…         只检查 HTML 写法（不启动浏览器）
  blora rules                             列出全部规则和对应的 DESIGN.md 章节

本地文件可以在后面加 #场景（页面按 location.hash 切换场景时），例如 console.html#settings。

选项：
  --root <目录>        本地文件从哪个目录起服务（页面里的相对路径要能找到），默认当前目录
  --widths 1380,375    只检查这些宽度
  --themes light       只检查浅色（light）或深色（dark）
  --rules a,b          只跑这些规则
  --ignore a,b         跳过这些规则
  --screenshots <目录>  给每个问题截图，框出出问题的元素
  --channel chrome     用本机安装的 Chrome
  --warnings           逐条列出已知问题（DESIGN.md 里记录过、不算失败的）
  --json               输出 JSON
  -h, --help           显示帮助`;

const list = (s?: string): string[] | undefined =>
  s
    ? s
        .split(',')
        .map((x) => x.trim())
        .filter(Boolean)
    : undefined;

async function main(): Promise<number> {
  const { values, positionals } = parseArgs({
    allowPositionals: true,
    options: {
      root: { type: 'string' },
      widths: { type: 'string' },
      themes: { type: 'string' },
      rules: { type: 'string' },
      ignore: { type: 'string' },
      screenshots: { type: 'string' },
      channel: { type: 'string' },
      json: { type: 'boolean' },
      warnings: { type: 'boolean' },
      help: { type: 'boolean', short: 'h' },
    },
  });
  const [command, ...targets] = positionals;
  if (values.help || !command) {
    console.log(HELP);
    return 0;
  }
  if (command === 'rules') {
    for (const r of RULES)
      console.log(`${r.id.padEnd(22)} ${r.title}  （DESIGN.md › ${r.section}）`);
    return 0;
  }
  if (command !== 'check' && command !== 'lint') {
    console.error(`不认识的命令 ${command}\n\n${HELP}`);
    return 2;
  }
  if (!targets.length) {
    console.error('请给出要检查的网址、文件或目录');
    return 2;
  }
  const known = new Set(RULES.map((r) => r.id));
  for (const id of [...(list(values.rules) ?? []), ...(list(values.ignore) ?? [])]) {
    if (!known.has(id)) {
      console.error(`没有 ${id} 这条规则（blora rules 可以列出全部）`);
      return 2;
    }
  }
  const themes = list(values.themes) as ('light' | 'dark')[] | undefined;
  const rules = list(values.rules);
  const ignore = list(values.ignore);
  const widths = list(values.widths)?.map(Number);
  const reports = await check({
    targets,
    staticOnly: command === 'lint',
    ...(values.root ? { root: values.root } : {}),
    ...(widths ? { widths } : {}),
    ...(themes ? { themes } : {}),
    ...(rules ? { rules } : {}),
    ...(ignore ? { ignore } : {}),
    ...(values.screenshots ? { screenshots: values.screenshots } : {}),
    ...(values.channel ? { channel: values.channel } : {}),
  });
  console.log(
    values.json
      ? JSON.stringify(reports, null, 2)
      : format(reports, { warnings: !!values.warnings }),
  );
  return reports.some(failed) ? 1 : 0;
}

main().then(
  (code) => process.exit(code),
  (err: unknown) => {
    console.error(err instanceof Error ? err.message : err);
    process.exit(2);
  },
);
