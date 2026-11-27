/**
 * 组件比对表：参考页里的一个元素 ↔ 框架示例页里对应的元素。
 * ref / ours 写成「页面 选择器」，选择器后面可以跟 @序号 取第几个匹配（默认第一个）。
 * props 为空时用默认的一组样式；text: false 表示两边文字不同，不比较宽度。
 */
export interface Pair {
  name: string;
  ref: string;
  ours: string;
  props?: string[];
  text?: boolean;
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
