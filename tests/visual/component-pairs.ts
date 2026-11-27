/**
 * 组件比对表：参考页里的一个元素 ↔ 框架示例页里对应的元素。
 * ref / ours 写成「页面 选择器」，选择器后面可以跟 @序号 取第几个匹配（默认第一个）。
 * props 为空时用默认的一组样式；text: false 表示两边文字不同，不比较宽度。
 * 选择器末尾写 ::before 时量伪元素。
 * 参考页的网址可以带 #场景名，打开后先切换到该场景（demo 页的 go(场景名)）。
 */
export interface Pair {
  name: string;
  ref: string;
  ours: string;
  props?: string[];
  text?: boolean;
  /** false：不比较宽高（参考页用浏览器默认的 normal 行高，高度随平台的中文字体变化；框架用固定高度） */
  size?: boolean;
}

const C = '/reference/components.html';
const CON = '/reference/demo-console.html';
const BTN = '/recipes/components/button.html';
const SEG = '/recipes/components/segmented.html';
const BADGE = '/recipes/components/badge.html';

export const BOX = [
  'height',
  'paddingTop',
  'paddingRight',
  'paddingBottom',
  'paddingLeft',
  'borderTopLeftRadius',
  'borderBottomRightRadius',
  'backgroundColor',
  'color',
  'boxShadow',
  'fontSize',
  'fontWeight',
  'letterSpacing',
  'columnGap',
];

export const PAIRS: Pair[] = [
  // ---- 按钮 ----
  {
    name: '主按钮',
    ref: `${C} #sec-1 .btn-primary`,
    ours: `${BTN} #levels > [data-variant="primary"]`,
  },
  {
    name: '雾粉次主',
    ref: `${C} #sec-1 .btn-blush`,
    ours: `${BTN} #levels > [data-variant="blush"]`,
  },
  {
    name: '暖杏辅助',
    ref: `${C} #sec-1 .btn-sand`,
    ours: `${BTN} #levels > [data-variant="sand"]`,
  },
  { name: '中性按钮', ref: `${C} #sec-1 .btn-surface`, ours: `${BTN} #levels > :nth-child(4)` },
  {
    name: '轻量按钮',
    ref: `${C} #sec-1 .btn-ghost`,
    ours: `${BTN} #levels > [data-variant="ghost"]`,
  },
  { name: '禁用按钮', ref: `${C} #sec-1 .btn:disabled`, ours: `${BTN} #levels > :disabled` },
  {
    name: '危险按钮',
    ref: `${C} #sec-1 .btn-rose`,
    ours: `${BTN} #levels > [data-variant="rose"]`,
  },
  { name: '小号按钮', ref: `${C} #sec-1 .btn-sm`, ours: `${BTN} #sizes > [data-size="sm"]` },
  { name: '大号按钮', ref: `${C} #sec-1 .btn-lg`, ours: `${BTN} #sizes > [data-size="lg"]` },
  // 参考页的图标按钮被后面的 .btn 规则改回了 13px 内边距（宽度仍是 35，图标居中），框架直接用 0，外观相同
  {
    name: '图标按钮',
    ref: `${C} #sec-1 .btn-icon.btn-surface`,
    ours: `${BTN} #sizes > [data-shape="icon"]`,
    props: ['width', 'height', 'borderTopLeftRadius', 'backgroundColor', 'color'],
  },
  {
    name: '图标按钮里的图标',
    ref: `${C} #sec-1 .btn-icon.btn-surface svg`,
    ours: `${BTN} #sizes > [data-shape="icon"] svg`,
    props: ['width', 'height', 'strokeWidth'],
  },
  { name: '图标 + 文字按钮', ref: `${C} #asyncBtn`, ours: `${BTN} #sizes > :nth-child(5)` },
  { name: '耦合工具组', ref: `${C} #sec-1 .coupled-pair`, ours: `${BTN} #groups > .bd-group` },
  {
    name: '工具组 · 浮起按钮',
    ref: `${C} #sec-1 .coupled-pair .btn-elev`,
    ours: `${BTN} .bd-group > [data-variant="elevated"]`,
  },
  {
    name: '工具组 · 轻量按钮',
    ref: `${C} #sec-1 .coupled-pair .btn-ghost`,
    ours: `${BTN} .bd-group > [data-variant="ghost"]`,
  },
  { name: '按钮里的计数', ref: `${C} #sec-1 .count-chip`, ours: `${BTN} [data-part="count"]` },

  // ---- 分段控件 ----
  { name: '分段控件 · 时间范围', ref: `${CON} #rangeSeg`, ours: `${SEG} #range` },
  // 分段项本身没有底色（底色由滑块提供），圆角、间距不影响外观，只比文字和高度
  {
    name: '分段控件 · 未选中项',
    ref: `${CON} #rangeSeg .seg-btn`,
    ours: `${SEG} #range > button`,
    props: [...['color', 'fontSize', 'fontWeight', 'height', 'backgroundColor'], 'paddingLeft'],
  },
  {
    name: '分段控件 · 项宽',
    ref: `${CON} #rangeSeg .seg-btn`,
    ours: `${SEG} #range > button`,
    props: ['width'],
  },
  {
    name: '分段控件 · 选中项',
    ref: `${CON} #rangeSeg .seg-btn.active`,
    ours: `${SEG} #range > [aria-checked="true"]`,
    props: ['color', 'fontWeight', 'height'],
  },
  {
    name: '分段控件 · 滑块',
    ref: `${CON} #rangeSeg .seg-glider`,
    ours: `${SEG} #range > [data-part="glide"]`,
    props: ['backgroundColor', 'boxShadow', 'borderTopLeftRadius', 'height'],
  },
  { name: '视图切换', ref: `${C} #viewPair`, ours: `${SEG} #view` },
  {
    name: '视图切换 · 未选中项',
    ref: `${C} #viewPair > .btn-ghost`,
    ours: `${SEG} #view > [aria-checked="false"]`,
  },
  {
    name: '视图切换 · 滑块',
    ref: `${C} #viewPair > .glide-pill`,
    ours: `${SEG} #view > [data-part="glide"]`,
    props: ['backgroundColor', 'boxShadow', 'borderTopLeftRadius', 'height'],
  },
  // 规格档位占满所在的行，两边容器宽度不同，不比宽度
  { name: '规格档位', ref: `${C} #segBar`, ours: `${SEG} #tier`, text: false },
  {
    name: '规格档位 · 未选中项',
    ref: `${C} #segBar > .seg-btn`,
    ours: `${SEG} #tier > button`,
    props: ['color', 'fontSize', 'fontWeight', 'height', 'backgroundColor'],
  },
  {
    name: '规格档位 · 选中项',
    ref: `${C} #segBar > .seg-btn.active`,
    ours: `${SEG} #tier > [aria-checked="true"]`,
    props: ['color', 'fontWeight', 'height'],
  },
  {
    name: '规格档位 · 滑块',
    ref: `${C} #segBar > .seg-glider`,
    ours: `${SEG} #tier > [data-part="glide"]`,
    props: ['backgroundColor', 'borderTopLeftRadius', 'height'],
  },

  // ---- 小块 ----
  {
    name: '状态标签 · 暖杏',
    ref: `${C} .status-pill.ok:not(.picker-trigger > *)`,
    ours: `${BADGE} #pills > [data-tone="sand"]`,
    text: false,
  },
  {
    name: '状态标签 · 雾粉',
    ref: `${C} .status-pill.sync`,
    ours: `${BADGE} #pills > [data-tone="blush"]`,
    text: false,
  },
  {
    name: '状态标签 · 蔷薇',
    ref: `${C} .status-pill.warn`,
    ours: `${BADGE} #pills > [data-tone="rose"]`,
    text: false,
  },
  { name: '头像', ref: `${C} .av-orb`, ours: `${BADGE} .bd-avatar` },
  {
    name: '叠放的头像',
    ref: `${C} .av-orb@1`,
    ours: `${BADGE} .bd-avatar@1`,
    props: ['marginLeft', 'boxShadow'],
  },
  { name: '快捷键', ref: `${C} .btn-search .kbd`, ours: `${BADGE} #search .bd-kbd` },
  { name: '带快捷键的按钮', ref: `${C} .btn-search`, ours: `${BADGE} #search` },
];

const TABS = '/recipes/components/tabs.html';
const NAV = '/recipes/components/nav.html';
const DOCS = '/reference/demo-docs.html#article';
const SETTINGS = '/reference/demo-console.html#settings';
const VIS = [
  'color',
  'fontSize',
  'fontWeight',
  'height',
  'paddingLeft',
  'paddingRight',
  'columnGap',
];
const LOOK = [
  'color',
  'fontSize',
  'fontWeight',
  'paddingLeft',
  'paddingRight',
  'backgroundColor',
  'borderTopLeftRadius',
];

PAIRS.push(
  // ---- 页签 ----
  { name: '页签组', ref: `${C} #tabsBar`, ours: `${TABS} #tabs`, text: false },
  {
    name: '页签 · 选中',
    ref: `${C} #tabsBar > .tab-pill.active`,
    ours: `${TABS} #tabs > [aria-selected="true"]`,
    props: VIS,
  },
  {
    name: '页签 · 未选中',
    ref: `${C} #tabsBar > .tab-pill:not(.active)`,
    ours: `${TABS} #tabs > [aria-selected="false"]`,
    props: [...VIS, 'backgroundColor'],
  },
  {
    name: '页签 · 滑块',
    ref: `${C} #tabsBar > .glide-pill`,
    ours: `${TABS} #tabs > [data-part="glide"]`,
    props: ['backgroundColor', 'height', 'width', 'borderTopLeftRadius'],
  },
  {
    name: '页签 · 关闭',
    ref: `${C} #tabsBar .tab-close`,
    ours: `${TABS} #tabs [data-part="close"]`,
    props: ['width', 'height', 'opacity', 'borderTopLeftRadius'],
  },
  // ---- 分页 ----
  { name: '分页', ref: `${C} #pagerBar`, ours: `${TABS} #pager` },
  {
    name: '分页 · 当前页',
    ref: `${C} #pagerBar > .page-btn.active`,
    ours: `${TABS} #pager > [aria-current="page"]`,
    props: VIS,
  },
  {
    name: '分页 · 其他页',
    ref: `${C} #pagerBar > .page-btn:not(.active)`,
    ours: `${TABS} #pager > button:not([aria-current])`,
    props: [...VIS, 'backgroundColor', 'width'],
  },
  {
    name: '分页 · 滑块',
    ref: `${C} #pagerBar > .glide-pill`,
    ours: `${TABS} #pager > [data-part="glide"]`,
    props: ['backgroundColor', 'height', 'width', 'borderTopLeftRadius'],
  },
  // ---- 步骤条 ----
  {
    name: '步骤 · 已完成',
    ref: `${C} #stepTrack > .c-step.done`,
    ours: `${TABS} #steps > :first-child`,
    props: [...LOOK, 'paddingTop'],
    size: false,
  },
  {
    name: '步骤 · 当前',
    ref: `${C} #stepTrack > .c-step.current`,
    ours: `${TABS} #steps > [aria-current="step"]`,
    props: [...LOOK, 'paddingTop'],
    size: false,
  },
  {
    name: '步骤 · 未开始',
    ref: `${C} #stepTrack > .c-step:last-child`,
    ours: `${TABS} #steps > :last-child`,
    props: [...LOOK, 'paddingTop'],
    size: false,
  },
  {
    name: '步骤 · 圆点',
    ref: `${C} #stepTrack > .c-step.current .c-orb`,
    ours: `${TABS} #steps > [aria-current="step"]::before`,
    props: ['width', 'height', 'backgroundColor', 'color', 'fontSize', 'fontWeight'],
    size: false,
  },
  // ---- 导航 ----
  {
    name: '页内导航 · 当前',
    ref: `${C} #jumpNav > .jump-pill.active`,
    ours: `${NAV} #jump > [aria-current="true"]`,
    props: LOOK,
    size: false,
  },
  {
    name: '页内导航 · 其他',
    ref: `${C} #jumpNav > .jump-pill:not(.active)`,
    ours: `${NAV} #jump > a:not([aria-current])`,
    props: [...LOOK, 'width', 'columnGap'],
    size: false,
  },
  {
    name: '页内导航 · 滑块',
    ref: `${C} #jumpNav > .glide-pill`,
    ours: `${NAV} #jump > [data-part="glide"]`,
    props: ['backgroundColor', 'width', 'borderTopLeftRadius'],
    size: false,
  },
  {
    name: '页内导航 · 圆点',
    ref: `${C} #jumpNav .jump-dot`,
    ours: `${NAV} #jump [data-part="dot"]`,
    props: ['width', 'height', 'opacity', 'backgroundColor'],
  },
  {
    name: '分区导航 · 当前',
    ref: `${SETTINGS} .settings-nav > button.active`,
    ours: `${NAV} #settings > [aria-current="true"]`,
    props: VIS,
  },
  {
    name: '分区导航 · 其他',
    ref: `${SETTINGS} .settings-nav > button:not(.active)`,
    ours: `${NAV} #settings > button:not([aria-current])`,
    props: [...VIS, 'borderTopLeftRadius'],
  },
  {
    name: '分区导航 · 图标',
    ref: `${SETTINGS} .settings-nav > button svg`,
    ours: `${NAV} #settings > button svg`,
    props: ['width', 'height'],
  },
  {
    name: '文章目录 · 标题',
    ref: `${DOCS} .toc-label`,
    ours: `${NAV} #toc > [data-part="label"]`,
    props: [...LOOK, 'letterSpacing', 'textTransform', 'paddingTop', 'paddingBottom'],
    size: false,
  },
  {
    name: '文章目录 · 当前',
    ref: `${DOCS} .doc-toc > button.active`,
    ours: `${NAV} #toc > [aria-current="true"]`,
    props: [...LOOK, 'minHeight', 'lineHeight'],
    size: false,
  },
  {
    name: '文章目录 · 二级',
    ref: `${DOCS} .doc-toc > button.sub`,
    ours: `${NAV} #toc > [data-level="2"]`,
    props: [...LOOK, 'minHeight', 'lineHeight'],
    size: false,
  },
  // ---- 目录树 ----
  // 参考页的文件夹名粗体写在里面的 span 上，框架写在整行上，外观相同
  {
    name: '目录树 · 文件夹',
    ref: `${C} .tree-list > .tree-node`,
    ours: `${NAV} #tree > li > [data-part="node"]`,
    props: VIS.filter((p) => p !== 'fontWeight'),
  },
  {
    name: '目录树 · 文件夹图标',
    ref: `${C} .tree-list > .tree-node svg:not(.chev)`,
    ours: `${NAV} #tree > li > [data-part="node"] > svg:not([data-part])`,
    props: ['width', 'height', 'color'],
  },
  {
    name: '目录树 · 箭头',
    ref: `${C} .tree-list > .tree-node svg.chev`,
    ours: `${NAV} #tree > li > [data-part="node"] > [data-part="chevron"]`,
    props: ['width', 'height', 'color', 'marginRight'],
  },
  {
    name: '目录树 · 选中文件',
    ref: `${C} .tree-node.active`,
    ours: `${NAV} #tree [aria-selected="true"] > [data-part="node"]`,
    props: VIS,
  },
  {
    name: '目录树 · 文件',
    ref: `${C} .tree-inner > .tree-node:not(.active)`,
    ours: `${NAV} #tree [aria-selected="false"] > [data-part="node"]`,
    props: VIS,
  },
  {
    name: '目录树 · 滑块',
    ref: `${C} .tree-list > .glide-pill`,
    ours: `${NAV} #tree > [data-part="glide"]`,
    props: ['backgroundColor', 'height', 'borderTopLeftRadius'],
  },
  // ---- 面包屑 ----
  {
    name: '面包屑',
    ref: `${CON} #crumbs`,
    ours: `${TABS} #crumbs`,
    props: ['fontSize', 'color', 'columnGap', 'height'],
  },
);
