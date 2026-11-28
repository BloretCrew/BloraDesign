/**
 * 规则目录：每条规则都对应 DESIGN.md 的一节，报告里会指过去。
 * 浏览器检查（在页面里量）和静态检查（读 HTML 源码）共用这一份。
 */
export interface RuleInfo {
  /** 规则名，命令行 --rule 和报告里用 */
  id: string;
  title: string;
  /** DESIGN.md 里对应的一节 */
  section: string;
  kind: 'browser' | 'html';
}

export const RULES: RuleInfo[] = [
  // ---- 浏览器检查 ----
  {
    id: 'whitespace',
    title: '格子里竖向空白超过 40px',
    section: 'Layout · 空白预算',
    kind: 'browser',
  },
  {
    id: 'squeezed',
    title: '元素被弹性布局压得比内容还矮',
    section: 'Layout · 数据决定长度的内容',
    kind: 'browser',
  },
  {
    id: 'halo-clip',
    title: '聚焦光晕会被裁掉（离裁切容器不足 3px）',
    section: "Do's and Don'ts · 检查",
    kind: 'browser',
  },
  {
    id: 'native-ui',
    title: '出现了浏览器 / 系统原生的控件外观',
    section: 'Components · 不出现原生控件',
    kind: 'browser',
  },
  { id: 'hard-color', title: '颜色不在设计变量里', section: 'Colors', kind: 'browser' },
  { id: 'gradient', title: '用了渐变', section: 'Shapes · 几何标记，代替渐变', kind: 'browser' },
  { id: 'border', title: '画了描边或轮廓线', section: 'Overview（零描边）', kind: 'browser' },
  {
    id: 'contrast',
    title: '文字对比度不够',
    section: 'Colors · 已知问题（对比度）',
    kind: 'browser',
  },
  {
    id: 'glide',
    title: '选中滑块没有和选中项对齐',
    section: 'Motion & Micro-interaction',
    kind: 'browser',
  },
  { id: 'overflow', title: '横向溢出或文字溢出容器', section: 'Layout · 响应式', kind: 'browser' },
  {
    id: 'tap-target',
    title: '手机上的可点击区域小于 24px',
    section: 'Layout · 响应式',
    kind: 'browser',
  },
  {
    id: 'reduced-motion',
    title: '开启「减少动效」后仍有位移或缩放动画',
    section: 'Motion & Micro-interaction',
    kind: 'browser',
  },
  // ---- 静态检查（HTML） ----
  {
    id: 'html/native-element',
    title: '用了带原生外观的元素',
    section: 'Components · 不出现原生控件',
    kind: 'html',
  },
  {
    id: 'html/native-input',
    title: '用了带系统面板的输入框类型',
    section: 'Components · 不出现原生控件',
    kind: 'html',
  },
  {
    id: 'html/title-attr',
    title: '用了 title 属性（会露出原生悬浮提示）',
    section: 'Components · 浮层与反馈',
    kind: 'html',
  },
  {
    id: 'html/native-dialog',
    title: '调用了 alert() / prompt() / 原生 confirm()',
    section: 'Components · 不出现原生控件',
    kind: 'html',
  },
  {
    id: 'html/one-component',
    title: '一个元素带了多个 bd- 组件类',
    section: 'Components · 写法',
    kind: 'html',
  },
  { id: 'html/state-class', title: '用类名表示状态', section: 'Components · 写法', kind: 'html' },
  {
    id: 'html/unknown-component',
    title: '不存在的 bd- 组件类',
    section: 'Components · 写法',
    kind: 'html',
  },
  { id: 'html/inline-color', title: 'style 属性里写死了颜色', section: 'Colors', kind: 'html' },
];

export const RULE = Object.fromEntries(RULES.map((r) => [r.id, r])) as Record<string, RuleInfo>;

export interface Violation {
  rule: string;
  message: string;
  /** warn：DESIGN.md 里记录过的已知问题，报告但不算失败 */
  level?: 'warn';
  /** 出问题的元素：简短的 CSS 路径 */
  target?: string;
  /** 所在格子的标题（找得到时） */
  tile?: string;
  /** 在哪个宽度 / 主题下发现的（浏览器检查） */
  where?: string[];
  /** 源码行号（静态检查） */
  line?: number;
}

export interface PageReport {
  /** 检查的页面（网址或文件） */
  page: string;
  violations: Violation[];
  /** 页面用 data-bd-allow 豁免掉的问题数 */
  allowed: number;
}

/** 有没有算作失败的问题（warn 不算） */
export const failed = (r: PageReport): boolean => r.violations.some((v) => v.level !== 'warn');
