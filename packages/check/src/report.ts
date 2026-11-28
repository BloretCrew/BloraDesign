/** 把检查结果排成给人看的文字 */
import { RULE, failed, type PageReport } from './rules.js';

const useColor = process.stdout.isTTY && !process.env.NO_COLOR;
const paint = (code: number) => (s: string) => (useColor ? `\x1b[${code}m${s}\x1b[0m` : s);
const red = paint(31);
const green = paint(32);
const dim = paint(2);
const bold = paint(1);
const yellow = paint(33);

export function format(reports: PageReport[], opt: { warnings?: boolean } = {}): string {
  const lines: string[] = [];
  let errors = 0;
  let warns = 0;
  let allowed = 0;
  for (const r of reports) {
    allowed += r.allowed;
    const e = r.violations.filter((v) => v.level !== 'warn').length;
    const w = r.violations.length - e;
    errors += e;
    warns += w;
    const extra = [w ? `${w} 个已知问题` : '', r.allowed ? `豁免 ${r.allowed} 处` : '']
      .filter(Boolean)
      .join('，');
    if (!r.violations.length || !failed(r)) {
      lines.push(`${green('✓')} ${r.page}${extra ? `  ${dim(extra)}` : ''}`);
      if (!w || !opt.warnings) continue;
    } else {
      lines.push(
        `${red('✗')} ${bold(r.page)}  ${dim([`${e} 个问题`, extra].filter(Boolean).join('，'))}`,
      );
    }
    // 按规则分组
    const byRule = new Map<string, typeof r.violations>();
    for (const v of r.violations) {
      // 已知问题默认只计数，--warnings 时逐条列出
      if (v.level === 'warn' && !opt.warnings) continue;
      byRule.set(v.rule, [...(byRule.get(v.rule) ?? []), v]);
    }
    for (const [rule, list] of byRule) {
      const info = RULE[rule];
      const allWarn = list.every((v) => v.level === 'warn');
      lines.push(
        `  ${allWarn ? yellow(rule) : red(rule)}  ${info?.title ?? ''}  ${dim(`DESIGN.md › ${info?.section ?? ''}`)}`,
      );
      for (const v of list) {
        const at = [
          v.tile ? `「${v.tile}」格子` : '',
          v.target ?? '',
          v.line ? `第 ${v.line} 行` : '',
        ]
          .filter(Boolean)
          .join(' · ');
        lines.push(`    ${v.level === 'warn' ? yellow('!') : red('×')} ${v.message}`);
        if (at) lines.push(`      ${dim(at)}`);
        if (v.where?.length) lines.push(`      ${dim(v.where.join('，'))}`);
      }
    }
  }
  lines.push('');
  const tail = [
    warns ? `${warns} 个已知问题${opt.warnings ? '' : '（--warnings 逐条列出）'}` : '',
    allowed ? `豁免 ${allowed} 处` : '',
  ]
    .filter(Boolean)
    .join('，');
  lines.push(
    errors
      ? red(`${errors} 个问题，${reports.filter(failed).length} / ${reports.length} 个页面`) +
          (tail ? dim(`（另有 ${tail}）`) : '')
      : green(`全部通过（${reports.length} 个页面）`) + (tail ? dim(`，${tail}`) : ''),
  );
  return lines.join('\n');
}
