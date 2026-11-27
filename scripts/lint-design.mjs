// 运行 Google design.md lint，只输出摘要。
// 允许的已知警告：orphaned-tokens（颜色用于圆点、细缝等，不被 components 引用）和主按钮对比度（DESIGN.md · Colors · 已知问题）。
// 出现错误或其他警告时退出码为 1。
import { execFileSync } from 'node:child_process';

const ALLOWED = [
  (f) => f.rule === 'orphaned-tokens',
  (f) => f.rule === 'contrast-ratio' && f.path === 'components.button-primary',
];

let out;
try {
  out = execFileSync('design.md', ['lint', 'DESIGN.md'], { encoding: 'utf8' });
} catch (err) {
  out = err.stdout ?? '';
}
const report = JSON.parse(out.slice(out.indexOf('{')));
const problems = report.findings.filter(
  (f) => f.severity === 'error' || (f.severity === 'warning' && !ALLOWED.some((ok) => ok(f))),
);
const info = report.findings.find((f) => f.rule === 'token-summary');
if (info) console.log(info.message);
console.log(
  `design.md lint: ${report.summary.errors} errors, ${report.summary.warnings} warnings（已知警告 ${report.summary.warnings - problems.filter((f) => f.severity === 'warning').length} 条）`,
);
for (const f of problems) console.error(`  ${f.severity} [${f.rule}] ${f.path ?? ''} ${f.message}`);
process.exit(problems.length ? 1 : 0);
