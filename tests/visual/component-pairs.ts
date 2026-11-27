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

const FORM = '/recipes/components/form.html';
const SURF = [
  'height',
  'width',
  'backgroundColor',
  'color',
  'borderTopLeftRadius',
  'borderBottomRightRadius',
  'boxShadow',
];

PAIRS.push(
  // ---- 输入框 ----
  {
    name: '清除框',
    ref: `${C} .field-box`,
    ours: `${FORM} #clear`,
    props: [...BOX, 'paddingLeft'],
    text: false,
  },
  {
    name: '清除按钮',
    ref: `${C} #clearBtn`,
    ours: `${FORM} #clear > [data-part="clear"]`,
    props: SURF,
  },
  {
    name: '输入框里的图标',
    ref: `${C} .field-box > svg`,
    ours: `${FORM} #clear > svg`,
    props: ['width', 'height', 'color'],
  },
  {
    name: '输入框文字',
    ref: `${C} #clearInput`,
    ours: `${FORM} #clear > input`,
    props: ['fontSize', 'fontWeight', 'color', 'height'],
    size: false,
  },
  {
    name: '密码框文字',
    ref: `${C} #pwdInput`,
    ours: `${FORM} #password > input`,
    props: ['fontFamily', 'fontSize', 'letterSpacing'],
    size: false,
  },
  {
    name: '显示密码按钮',
    ref: `${C} #eyeBtn`,
    ours: `${FORM} #password > [data-part="reveal"]`,
    props: [...SURF, 'marginRight'].filter((p) => p !== 'marginRight'),
  },
  {
    name: '前缀',
    ref: `${C} .addon-cap.left`,
    ours: `${FORM} #addon > [data-part="addon"]:first-child`,
    props: [...SURF, 'fontFamily', 'fontSize', 'paddingLeft'],
  },
  {
    name: '后缀',
    ref: `${C} .addon-cap.right`,
    ours: `${FORM} #addon > [data-part="addon"]:last-child`,
    props: [...SURF, 'fontFamily', 'fontSize'],
  },
  {
    name: '拼接的输入框',
    ref: `${C} .addon-mid`,
    ours: `${FORM} #addon > .bd-input`,
    props: ['height', 'backgroundColor', 'borderTopLeftRadius', 'paddingLeft', 'fontWeight'],
    size: false,
  },
  // ---- 步进器、开关 ----
  {
    name: '步进器 · 减',
    ref: `${C} .step-btn.dec`,
    ours: `${FORM} #stepper > [data-part="dec"]`,
    props: SURF.concat('borderTopRightRadius'),
  },
  {
    name: '步进器 · 加',
    ref: `${C} .step-btn.inc`,
    ours: `${FORM} #stepper > [data-part="inc"]`,
    props: SURF.concat('borderTopRightRadius'),
  },
  {
    name: '步进器 · 数值',
    ref: `${C} .step-num`,
    ours: `${FORM} #stepper > [data-part="value"]`,
    props: [...SURF, 'fontFamily', 'fontWeight'],
  },
  {
    name: '开关 · 开',
    ref: `${C} #mainSwitch`,
    ours: `${FORM} #switch`,
    props: [...SURF, 'paddingLeft'],
  },
  {
    name: '开关 · 圆钮',
    ref: `${C} #mainSwitch .sw-knob`,
    ours: `${FORM} #switch::before`,
    props: ['width', 'height', 'backgroundColor', 'transform'],
    size: false,
  },
  // ---- 复选、单选 ----
  {
    name: '复选 · 选中',
    ref: `${C} .chk-item.checked .orb-box`,
    ours: `${FORM} .bd-checkbox:checked`,
    props: ['width', 'height', 'backgroundColor', 'borderTopLeftRadius'],
  },
  {
    name: '复选 · 半选',
    ref: `${C} .chk-item.indet .orb-box`,
    ours: `${FORM} #indet`,
    props: ['width', 'height', 'backgroundColor', 'borderTopLeftRadius'],
  },
  {
    name: '单选 · 未选',
    ref: `${C} .chk-item:not(.checked) .orb-radio`,
    ours: `${FORM} .bd-radio:not(:checked)`,
    props: ['width', 'height', 'borderTopLeftRadius'],
  },
  {
    name: '复选项文字',
    ref: `${C} .chk-item`,
    ours: `${FORM} #checks > label`,
    props: ['fontSize', 'color', 'columnGap'],
  },
  // ---- 滑块 ----
  {
    name: '滑块 · 轨道',
    ref: `${C} .slider-rail`,
    ours: `${FORM} #slider [data-part="rail"]`,
    props: ['height', 'backgroundColor', 'borderTopLeftRadius'],
    size: false,
  },
  {
    name: '滑块 · 填充',
    ref: `${C} #sliderFill`,
    ours: `${FORM} #slider [data-part="fill"]`,
    props: ['height', 'backgroundColor'],
    size: false,
  },
  {
    name: '滑块 · 拇指',
    ref: `${C} #sliderThumb`,
    ours: `${FORM} #slider [data-part="thumb"]`,
    props: ['width', 'height', 'backgroundColor', 'boxShadow'],
  },
  {
    name: '滑块 · 操作区',
    ref: `${C} #orbitSlider`,
    ours: `${FORM} #slider > [data-part="track"]`,
    props: ['height'],
    size: false,
  },
  {
    name: '滑块 · 刻度',
    ref: `${C} .slider-ticks`,
    ours: `${FORM} #slider > [data-part="ticks"]`,
    props: ['fontFamily', 'fontSize', 'color', 'height'],
    size: false,
  },
  // ---- 上传区 ----
  // 参考页的上传区在更窄的格子里，标题换成了两行，不比高度
  {
    name: '上传区',
    ref: `${C} #dropZone`,
    ours: `${FORM} #drop`,
    props: ['backgroundColor', 'borderTopLeftRadius', 'columnGap'],
    size: false,
  },
  // 参考页的图标底没有设不收缩，标题较宽时（Linux 的中文字体）会被挤窄；框架固定 32，不比宽度
  {
    name: '上传区 · 图标底',
    ref: `${C} .dz-icon`,
    ours: `${FORM} #drop > [data-part="icon"]`,
    props: ['height', 'backgroundColor', 'color', 'borderTopLeftRadius'],
    size: false,
  },
  {
    name: '上传区 · 文字',
    ref: `${C} #dzTitle`,
    ours: `${FORM} #drop b`,
    props: ['fontSize', 'fontWeight', 'color'],
  },
  // ---- 字段 ----
  {
    name: '字段标签',
    ref: `${SETTINGS} .f-label`,
    ours: `${FORM} #settings [data-part="label"]`,
    props: ['fontSize', 'fontWeight', 'color', 'marginBottom', 'height'],
    size: false,
  },
  {
    name: '字段说明',
    ref: `${SETTINGS} .f-hint`,
    ours: `${FORM} #settings [data-part="hint"]`,
    props: ['fontSize', 'color', 'lineHeight', 'marginTop'],
    size: false,
  },
  {
    name: '字段输入框',
    ref: `${SETTINGS} #wsName`,
    ours: `${FORM} #wsName`,
    props: ['fontSize', 'color'],
    size: false,
  },
  {
    name: '字段外壳',
    ref: `${SETTINGS} .f .field`,
    ours: `${FORM} #wsName`,
    props: ['height', 'backgroundColor', 'borderTopLeftRadius', 'paddingLeft'],
    size: false,
  },
  {
    name: '只读字段',
    ref: `${SETTINGS} .field-ro`,
    ours: `${FORM} [data-readonly]`,
    props: ['height', 'backgroundColor', 'color', 'borderTopLeftRadius', 'paddingLeft'],
    size: false,
  },
  {
    name: '复制按钮',
    ref: `${SETTINGS} .field-ro .copy-btn`,
    ours: `${FORM} [data-readonly] > [data-part="copy"]`,
    props: [...SURF, 'marginRight'],
  },
  {
    name: '字段网格',
    ref: `${SETTINGS} .set-grid`,
    ours: `${FORM} #settings`,
    props: ['rowGap', 'columnGap'],
    size: false,
  },
);

const SEL = '/recipes/components/select.html';
const MULTI_OPEN = `${SEL}#click=${encodeURIComponent('#multi [data-part="trigger"]')}`;
const REF_MULTI_OPEN = `${C}#click=${encodeURIComponent('#multiPicker .picker-trigger')}`;
const DATE_OPEN = `${SEL}#click=${encodeURIComponent('#date [data-part="trigger"]')}`;
const REF_CAL_OPEN = `${C}#click=${encodeURIComponent('#calPicker .picker-trigger')}`;
const TRIGGER = [
  'height',
  'backgroundColor',
  'borderTopLeftRadius',
  'paddingTop',
  'paddingLeft',
  'paddingRight',
  'columnGap',
];

PAIRS.push(
  // ---- 选择器 ----
  {
    name: '单选 · 触发按钮',
    ref: `${C} #singlePicker .picker-trigger`,
    ours: `${SEL} #single [data-part="trigger"]`,
    props: TRIGGER,
    size: false,
  },
  {
    name: '单选 · 当前值',
    ref: `${C} #singleLabel`,
    ours: `${SEL} #single [data-part="value"]`,
    props: ['fontSize', 'fontWeight', 'color'],
    size: false,
  },
  {
    name: '单选 · 箭头',
    ref: `${C} #singlePicker .picker-trigger > svg:last-child`,
    ours: `${SEL} #single [data-part="trigger"] > svg:last-child`,
    props: ['width', 'height', 'color'],
  },
  {
    name: '多选 · 触发按钮（打开）',
    ref: `${REF_MULTI_OPEN} #multiPicker .picker-trigger`,
    ours: `${MULTI_OPEN} #multi [data-part="trigger"]`,
    props: [...TRIGGER, 'paddingBottom', 'boxShadow'],
    size: false,
  },
  {
    name: '多选 · 标签',
    ref: `${REF_MULTI_OPEN} #multiTags .tag-chip`,
    ours: `${MULTI_OPEN} #multi [data-part="value"] > .bd-tag`,
    props: [
      'height',
      'fontSize',
      'fontWeight',
      'paddingLeft',
      'paddingRight',
      'borderTopLeftRadius',
      'backgroundColor',
      'color',
      'columnGap',
    ],
  },
  {
    name: '下拉面板',
    ref: `${REF_MULTI_OPEN} #multiPicker .picker-drop`,
    ours: `${MULTI_OPEN} #multi [data-part="panel"]`,
    props: ['backgroundColor', 'borderTopLeftRadius', 'paddingTop', 'paddingLeft', 'boxShadow'],
    size: false,
  },
  {
    name: '下拉搜索框',
    ref: `${REF_MULTI_OPEN} #multiSearch`,
    ours: `${MULTI_OPEN} #multi [data-part="search"]`,
    props: [
      'height',
      'backgroundColor',
      'borderTopLeftRadius',
      'paddingLeft',
      'fontSize',
      'marginBottom',
    ],
    size: false,
  },
  {
    name: '选项 · 选中',
    ref: `${REF_MULTI_OPEN} #multiList > .menu-opt.sel`,
    ours: `${MULTI_OPEN} #multi [role="option"][aria-selected="true"]`,
    props: [
      'fontSize',
      'fontWeight',
      'color',
      'backgroundColor',
      'paddingTop',
      'paddingLeft',
      'borderTopLeftRadius',
      'borderBottomLeftRadius',
    ],
    size: false,
  },
  {
    name: '选项 · 与下一项相连',
    ref: `${REF_MULTI_OPEN} #multiList > .menu-opt.sel.join-bot`,
    ours: `${MULTI_OPEN} #multi [role="option"][aria-selected="true"]:has(+ [aria-selected="true"])`,
    props: ['borderBottomLeftRadius', 'borderTopLeftRadius'],
    size: false,
  },
  {
    name: '选项 · 未选',
    ref: `${REF_MULTI_OPEN} #multiList > .menu-opt:not(.sel)`,
    ours: `${MULTI_OPEN} #multi [role="option"][aria-selected="false"]`,
    props: ['fontSize', 'fontWeight', 'color', 'backgroundColor'],
    size: false,
  },
  // ---- 日期 ----
  {
    name: '日期 · 天数标签',
    ref: `${C} #calSpanBadge`,
    ours: `${SEL} #date [data-part="badge"]`,
    props: ['height', 'fontSize', 'paddingLeft', 'borderTopLeftRadius', 'backgroundColor', 'color'],
  },
  {
    name: '日期 · 文字',
    ref: `${C} #calLabel`,
    ours: `${SEL} #date [data-part="text"]`,
    props: ['fontFamily', 'fontSize'],
    size: false,
  },
  {
    name: '日期 · 触发按钮',
    ref: `${C} #calPicker .picker-trigger`,
    ours: `${SEL} #date [data-part="trigger"]`,
    props: [...TRIGGER, 'paddingBottom'],
    size: false,
  },
  {
    name: '日历面板',
    ref: `${REF_CAL_OPEN} #calPicker .picker-drop`,
    ours: `${DATE_OPEN} #date [data-part="panel"]`,
    props: ['width', 'paddingTop', 'paddingLeft', 'borderTopLeftRadius', 'backgroundColor'],
    size: false,
  },
  {
    name: '日历 · 月份标题',
    ref: `${REF_CAL_OPEN} .cal-head`,
    ours: `${DATE_OPEN} #date [data-part="head"]`,
    props: ['fontSize', 'fontWeight', 'marginBottom', 'height'],
  },
  {
    name: '日历 · 翻页',
    ref: `${REF_CAL_OPEN} .cal-nav-btn`,
    ours: `${DATE_OPEN} #date [data-part="prev"]`,
    props: SURF,
  },
  {
    name: '日历 · 星期',
    ref: `${REF_CAL_OPEN} .cal-weekdays span`,
    ours: `${DATE_OPEN} #date [data-part="weekdays"] > span`,
    props: ['fontSize', 'color', 'paddingTop', 'height', 'width'],
  },
  {
    name: '日历 · 普通日',
    ref: `${REF_CAL_OPEN} .cal-day:not(.muted):not([class*="range"]):not(.in-range)`,
    ours: `${DATE_OPEN} #date button[data-part="day"]:not([data-state])`,
    props: SURF,
  },
  {
    name: '日历 · 起点',
    ref: `${REF_CAL_OPEN} .cal-day.range-start`,
    ours: `${DATE_OPEN} #date [data-state="start"]`,
    props: [...SURF, 'borderTopRightRadius', 'fontWeight'],
  },
  {
    name: '日历 · 区间内',
    ref: `${REF_CAL_OPEN} .cal-day.in-range`,
    ours: `${DATE_OPEN} #date [data-state="between"]`,
    props: SURF,
  },
  {
    name: '日历 · 终点',
    ref: `${REF_CAL_OPEN} .cal-day.range-end`,
    ours: `${DATE_OPEN} #date [data-state="end"]`,
    props: [...SURF, 'borderTopRightRadius'],
  },
);

const DATA = '/recipes/components/data.html';
const BILL = '/reference/demo-billing.html';
const TEXT = ['fontSize', 'fontWeight', 'color'];

PAIRS.push(
  // ---- 表格 ----
  {
    name: '批量操作栏',
    ref: `${C} #bulkBar`,
    ours: `${DATA} #bulk`,
    props: [
      'backgroundColor',
      'color',
      'fontSize',
      'fontWeight',
      'paddingTop',
      'paddingLeft',
      'borderTopLeftRadius',
      'height',
    ],
    size: false,
  },
  {
    name: '表头文字',
    ref: `${C} .table-head > span`,
    ours: `${DATA} #nodes th:nth-child(2)`,
    props: TEXT,
    size: false,
  },
  {
    name: '选中行',
    ref: `${C} .t-row.sel`,
    ours: `${DATA} #nodes tbody tr[aria-selected="true"] > td:nth-child(2)`,
    props: ['backgroundColor', 'fontSize'],
    size: false,
  },
  {
    name: '选中行 · 行高',
    ref: `${C} .t-row.sel`,
    ours: `${DATA} #nodes tbody tr[aria-selected="true"]`,
    props: ['height'],
    size: false,
  },
  {
    name: '选中行 · 相连的圆角',
    ref: `${C} .t-row.sel.join-bot`,
    ours: `${DATA} #nodes tbody tr[aria-selected="true"]:has(+ [aria-selected="true"]) > td:first-child`,
    props: ['borderTopLeftRadius', 'borderBottomLeftRadius'],
    size: false,
  },
  // ---- 连贯列表 ----
  {
    name: '列表 · 选中项',
    ref: `${C} #inlineSeamlessList > .s-item.sel`,
    ours: `${DATA} #list > [aria-selected="true"]`,
    props: [...TEXT, 'backgroundColor', 'minHeight', 'paddingLeft', 'borderTopLeftRadius'],
    size: false,
  },
  {
    name: '列表 · 未选项',
    ref: `${C} #inlineSeamlessList > .s-item:not(.sel)`,
    ours: `${DATA} #list > [aria-selected="false"]`,
    props: [...TEXT, 'height'],
  },
  {
    name: '列表 · 版本号',
    ref: `${C} #inlineSeamlessList .s-item:not(.sel) .s-ver`,
    ours: `${DATA} #list > [aria-selected="false"] [data-part="meta"]`,
    props: ['fontFamily', ...TEXT],
    size: false,
  },
  // ---- 规格行 ----
  {
    name: '规格行托盘',
    ref: `${BILL} .plan-specs`,
    ours: `${DATA} #spec`,
    props: ['backgroundColor', 'paddingTop', 'rowGap', 'borderTopLeftRadius'],
    size: false,
  },
  {
    name: '规格行',
    ref: `${BILL} .plan-specs > .spec`,
    ours: `${DATA} #spec > div`,
    props: [
      'backgroundColor',
      'fontSize',
      'color',
      'paddingTop',
      'paddingLeft',
      'borderTopLeftRadius',
      'height',
    ],
    size: false,
  },
  {
    name: '规格值',
    ref: `${BILL} .plan-specs > .spec b`,
    ours: `${DATA} #spec dd`,
    props: ['fontFamily', ...TEXT],
  },
  {
    name: '角落几何线',
    ref: `${BILL} .plan-corner`,
    ours: `${DATA} .bd-corner`,
    props: ['width', 'height', 'top', 'right'],
  },
  // ---- 指标格 ----
  {
    name: '指标格',
    ref: `${CON} .row-4 > .kpi`,
    ours: `${DATA} [data-variant="metric"]`,
    props: ['paddingTop', 'paddingLeft', 'rowGap'],
    size: false,
  },
  {
    name: '指标 · 标签',
    ref: `${CON} .kpi-label`,
    ours: `${DATA} [data-variant="metric"] > [data-part="label"]`,
    props: [...TEXT, 'letterSpacing', 'height'],
  },
  {
    name: '指标 · 数值',
    ref: `${CON} .kpi-value`,
    ours: `${DATA} [data-variant="metric"] > [data-part="value"]`,
    props: [...TEXT, 'letterSpacing', 'lineHeight', 'height'],
    size: false,
  },
  {
    name: '指标 · 单位',
    ref: `${CON} .row-4 > :nth-child(2) .kpi-value small`,
    ours: `${DATA} [data-variant="metric"]:nth-child(2) [data-part="value"] > small`,
    props: [...TEXT, 'marginLeft'],
  },
  {
    name: '指标 · 脚注',
    ref: `${CON} .kpi-foot`,
    ours: `${DATA} [data-variant="metric"] > [data-part="foot"]`,
    props: [...TEXT, 'columnGap'],
    size: false,
  },
  {
    name: '指标 · 变化量',
    ref: `${CON} .delta.up`,
    ours: `${DATA} [data-part="delta"]`,
    props: [...TEXT, 'backgroundColor', 'paddingLeft', 'borderTopLeftRadius', 'height'],
  },
  {
    name: '指标 · 图标底',
    ref: `${CON} .kpi-ico`,
    ours: `${DATA} [data-variant="metric"] > [data-part="icon"]`,
    props: [...SURF, 'top', 'right'],
  },
  {
    name: '环形读数',
    ref: `${CON} #costRing`,
    ours: `${DATA} #ring`,
    props: ['width', 'height', 'top', 'right'],
  },
  {
    name: '环形读数 · 数字',
    ref: `${CON} #costRing b`,
    ours: `${DATA} #ring > b`,
    props: ['fontFamily', ...TEXT, 'letterSpacing'],
  },
  {
    name: '环形读数 · 圆弧',
    ref: `${CON} #costRing .ring-fg`,
    ours: `${DATA} #ring [data-part="arc"]`,
    props: ['stroke', 'strokeWidth', 'strokeDasharray'],
    size: false,
  },
  {
    name: '进度条',
    ref: `${CON} .kpi-foot.col .meter`,
    ours: `${DATA} #progress`,
    props: ['height', 'backgroundColor', 'borderTopLeftRadius'],
    size: false,
  },
  // ---- 手风琴、空状态、骨架屏 ----
  {
    name: '手风琴 · 展开',
    ref: `${C} .acc-card.open`,
    ours: `${DATA} #acc > details[open]`,
    props: ['backgroundColor', 'borderTopLeftRadius'],
    size: false,
  },
  {
    name: '手风琴 · 标题',
    ref: `${C} .acc-card.open .acc-trigger`,
    ours: `${DATA} #acc > details[open] > summary`,
    props: [...TEXT, 'paddingTop', 'paddingLeft'],
    size: false,
  },
  {
    name: '手风琴 · 收起',
    ref: `${C} .acc-card:not(.open)`,
    ours: `${DATA} #acc > details:not([open])`,
    props: ['backgroundColor'],
    size: false,
  },
  {
    name: '空状态（横排）',
    ref: `${C} .empty-card`,
    ours: `${DATA} #empty-inline`,
    props: ['backgroundColor', 'paddingTop', 'paddingLeft', 'borderTopLeftRadius', 'columnGap'],
    size: false,
  },
  {
    name: '空状态 · 图标底',
    ref: `${C} .empty-card .orbit-mark`,
    ours: `${DATA} #empty-inline > [data-part="icon"]`,
    props: SURF.filter((p) => p !== 'color'),
  },
);

PAIRS.push(
  {
    name: '长文 · 正文',
    ref: `${DOCS} .prose > p:not(.lead)`,
    ours: `${DATA} #prose > p:not([data-part])`,
    props: [...TEXT, 'lineHeight', 'marginBottom'],
    size: false,
  },
  {
    name: '长文 · 导语',
    ref: `${DOCS} .prose .lead`,
    ours: `${DATA} #prose > [data-part="lead"]`,
    props: [...TEXT, 'marginBottom'],
    size: false,
  },
  {
    name: '长文 · 二级标题',
    ref: `${DOCS} .prose h2`,
    ours: `${DATA} #prose h2`,
    props: [...TEXT, 'letterSpacing', 'marginBottom'],
    size: false,
  },
  {
    name: '长文 · 提示框',
    ref: `${DOCS} .prose .callout`,
    ours: `${DATA} #prose aside`,
    props: [
      'backgroundColor',
      'paddingTop',
      'paddingLeft',
      'borderTopLeftRadius',
      'fontSize',
      'lineHeight',
      'columnGap',
    ],
    size: false,
  },
  {
    name: '代码块',
    ref: `${DOCS} .code-block`,
    ours: `${DATA} #code`,
    props: ['backgroundColor', 'borderTopLeftRadius'],
    size: false,
  },
  {
    name: '代码块 · 头部',
    ref: `${DOCS} .code-head`,
    ours: `${DATA} #code > figcaption`,
    props: ['paddingTop', 'paddingLeft', 'paddingRight'],
    size: false,
  },
  {
    name: '代码块 · 代码',
    ref: `${DOCS} .code-block pre`,
    ours: `${DATA} #code > pre`,
    props: [
      'fontFamily',
      'fontSize',
      'lineHeight',
      'color',
      'paddingTop',
      'paddingLeft',
      'paddingBottom',
    ],
    size: false,
  },
  {
    name: '代码块 · 注释',
    ref: `${DOCS} .code-block .c`,
    ours: `${DATA} #code [data-tone="comment"]`,
    props: ['color'],
    size: false,
  },
  {
    name: '代码块 · 提示符',
    ref: `${DOCS} .code-block .p`,
    ours: `${DATA} #code [data-part="prompt"]`,
    props: ['color', 'userSelect'],
    size: false,
  },
);
