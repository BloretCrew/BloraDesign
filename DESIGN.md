---
version: alpha
name: Blora Design
# 3.0（2026-11-27）：随框架重写改为 bd- 写法；YAML 是设计变量的唯一来源（见 Colors）
description: >-
  Blora Design：零描边的「瓷砖格」界面。浅灰蓝画布上铺白色格子，格子之间留 6px 细缝，
  外角 20、缝角 6；雾粉 / 暖杏 / 蔷薇三组柔色表达状态；用编号、托盘、星轨环和等宽字
  建立精致感。框架：npm 包 @bloret-crew/blora-design（一份 CSS + 一个自动接管的运行时）。
colors:
  primary: '#DC8A78'
  on-primary: '#FFFFFF'
  ink: '#292B36'
  ink-secondary: '#5C5F77'
  ink-tertiary: '#85899B'
  ink-quaternary: '#ACB0BE'
  ink-description: '#6C6F85'
  ink-prose: '#3F4250'
  canvas: '#ECEEF5'
  seam: '#E6E9EF'
  tile: '#FFFFFF'
  tile-tint: '#EFF1F5'
  tray: '#F3F4F9'
  well: '#EFF1F5'
  slot: '#E6E9EF'
  slot-hover: '#DCE0E8'
  control: '#FFFFFF'
  float: '#FFFFFF'
  dash: '#D7D5E2'
  blush:
    solid: '#DC8A78'
    solid-hover: '#D27E6C'
    track: '#E0A39A'
    fill: '#F2D5CF'
    fill-hover: '#F0C6C6'
    soft: '#F8E8E5'
    soft-hover: '#F4DBD6'
    ink: '#824B43'
  sand:
    solid: '#D4A178'
    fill: '#F6DCC4'
    fill-hover: '#EED0B4'
    soft: '#F9EDE0'
    ink: '#805836'
  rose:
    solid: '#C6747D'
    fill: '#F2CDCD'
    fill-hover: '#EEBEBE'
    soft: '#F9E6E9'
    ink: '#8F464F'
# 每个颜色在浅色 / 深色模式下取 Cortado 的哪个颜色。生成器按这里输出 --bd-* 变量，
# 并检查 light 一栏的色值与上面 colors 完全一致。键名是 colors 里的路径（blush.solid）
cortado:
  light:
    primary: rosewater-285
    on-primary: slate-0
    ink: slate-710
    ink-secondary: slate-510
    ink-tertiary: slate-365
    ink-quaternary: slate-240
    ink-description: slate-455
    ink-prose: slate-620
    canvas: slate-55
    seam: slate-65
    tile: slate-0
    tile-tint: slate-40
    tray: slate-30
    well: slate-40
    slot: slate-65
    slot-hover: slate-95
    control: slate-0
    float: slate-0
    dash: slate-125
    blush.solid: rosewater-285
    blush.solid-hover: rosewater-320
    blush.track: rosewater-230
    blush.fill: rosewater-105
    blush.fill-hover: rosewater-140
    blush.soft: rosewater-55
    blush.soft-hover: rosewater-90
    blush.ink: rosewater-525
    sand.solid: apricot-255
    sand.fill: apricot-90
    sand.fill-hover: apricot-125
    sand.soft: apricot-50
    sand.ink: apricot-505
    rose.solid: flamingo-350
    rose.fill: flamingo-120
    rose.fill-hover: flamingo-160
    rose.soft: flamingo-60
    rose.ink: flamingo-510
  dark:
    primary: rosewater-285
    on-primary: slate-0
    ink: slate-50
    ink-secondary: slate-220
    ink-tertiary: slate-380
    ink-quaternary: slate-505
    ink-description: slate-270
    ink-prose: slate-155
    canvas: slate-800
    seam: slate-775
    tile: slate-745
    tile-tint: slate-730
    tray: slate-755
    well: slate-765
    slot: slate-670
    slot-hover: slate-625
    control: slate-705
    float: slate-705
    dash: slate-605
    blush.solid: rosewater-285
    blush.solid-hover: rosewater-250
    blush.track: rosewater-370
    blush.fill: rosewater-675
    blush.fill-hover: rosewater-635
    blush.soft: rosewater-720
    blush.soft-hover: rosewater-690
    blush.ink: rosewater-135
    sand.solid: apricot-255
    sand.fill: apricot-660
    sand.fill-hover: apricot-620
    sand.soft: apricot-715
    sand.ink: apricot-105
    rose.solid: flamingo-350
    rose.fill: flamingo-675
    rose.fill-hover: flamingo-640
    rose.soft: flamingo-725
    rose.ink: flamingo-135
typography:
  page-title:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: 640
    lineHeight: 1.35
    letterSpacing: -0.01em
  tile-title:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: 650
    lineHeight: 1.35
    letterSpacing: -0.005em
  body:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: 400
    lineHeight: 1.55
  description:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: 400
    lineHeight: 1.55
  caption:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: 400
    lineHeight: 1.5
  prose:
    fontFamily: Inter
    fontSize: 14.5px
    fontWeight: 400
    lineHeight: 1.75
  label:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: 600
    lineHeight: 1.4
  button:
    fontFamily: Inter
    fontSize: 13.5px
    fontWeight: 540
  pill:
    fontFamily: Inter
    fontSize: 11.5px
    fontWeight: 560
  metric:
    fontFamily: Inter
    fontSize: 28px
    fontWeight: 620
    lineHeight: 1.15
    letterSpacing: -0.03em
    fontFeature: '"tnum"'
  value-mono:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: 560
    fontFeature: '"tnum"'
  index-mono:
    fontFamily: JetBrains Mono
    fontSize: 11px
    fontWeight: 600
  eyebrow-mono:
    fontFamily: JetBrains Mono
    fontSize: 10.5px
    fontWeight: 600
    letterSpacing: 0.12em
rounded:
  tile: 20px
  seam: 6px
  rail: 32px
  rail-item: 22px
  tray: 12px
  control: 12px
  icon: 10px
  cell: 7px
  pill: 999px
spacing:
  seam: 6px
  tight-xs: 2px
  tight-sm: 4px
  tight-md: 6px
  tile-gap: 10px
  group: 14px
  tile-padding-y: 16px
  tile-padding-x: 18px
  tray-padding: 5px
  tray-gap: 4px
  cell-padding-y: 9px
  cell-padding-x: 12px
  cell-dense-padding-y: 7px
  cell-dense-padding-x: 10px
  tile-dense-padding-x: 12px
  prose-measure: 720px
# 以下三组是 Blora 的扩展（Google DESIGN.md 格式之外），同样由生成器输出为 --bd-* 变量
fonts:
  sans: Inter, -apple-system, BlinkMacSystemFont, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif
  mono: '"JetBrains Mono", "SF Mono", Menlo, Consolas, monospace'
motion:
  ease-out: cubic-bezier(0.22, 1, 0.36, 1)
  ease-pop: cubic-bezier(0.34, 1.56, 0.64, 1)
  duration: 340ms
  duration-pop: 260ms
  duration-fade: 200ms
  duration-hover: 150ms
# 投影：{颜色 百分比} 会生成 color-mix(in srgb, <颜色> <百分比>, transparent)；颜色写 Cortado 色名或 colors 里的路径
elevation:
  light:
    tile: 0 1px 2px {slate-780 4%}
    cell: 0 1px 2px {slate-780 5%}
    control: 0 1px 2.5px {slate-780 4.5%}
    float: 0 14px 34px {slate-780 9%}, 0 2px 8px {slate-780 4%}
    focus: 0 0 0 3px {blush.solid 22%}
  dark:
    tile: none
    cell: none
    control: 0 1px 3px {slate-815 24%}
    float: 0 16px 38px {slate-815 46%}, 0 2px 8px {slate-815 26%}
    focus: 0 0 0 3px {blush.solid 30%}
components:
  tile:
    backgroundColor: '{colors.tile}'
    textColor: '{colors.ink}'
    rounded: '{rounded.tile}'
    padding: 16px 18px
  tray:
    backgroundColor: '{colors.tray}'
    rounded: '{rounded.tray}'
    padding: '{spacing.tray-padding}'
  tray-cell:
    backgroundColor: '{colors.tile}'
    textColor: '{colors.ink-secondary}'
    rounded: '{rounded.cell}'
    padding: 9px 12px
  tray-cell-dense:
    backgroundColor: '{colors.tile}'
    textColor: '{colors.ink-secondary}'
    rounded: '{rounded.cell}'
    padding: 7px 10px
    height: 32px
  tile-caption:
    textColor: '{colors.ink-description}'
    typography: '{typography.caption}'
  tile-tag:
    textColor: '{colors.ink-quaternary}'
    typography: '{typography.eyebrow-mono}'
  index-badge:
    backgroundColor: '{colors.blush.soft}'
    textColor: '{colors.blush.ink}'
    typography: '{typography.index-mono}'
    rounded: '{rounded.pill}'
    size: 24px
  button-primary:
    backgroundColor: '{colors.primary}'
    textColor: '{colors.on-primary}'
    typography: '{typography.button}'
    rounded: '{rounded.pill}'
    height: 35px
    padding: 0 13px
  button-blush:
    backgroundColor: '{colors.blush.fill}'
    textColor: '{colors.blush.ink}'
    typography: '{typography.button}'
    rounded: '{rounded.pill}'
    height: 35px
  button-surface:
    backgroundColor: '{colors.well}'
    textColor: '{colors.ink}'
    typography: '{typography.button}'
    rounded: '{rounded.pill}'
    height: 35px
  field:
    backgroundColor: '{colors.well}'
    textColor: '{colors.ink}'
    typography: '{typography.body}'
    rounded: '{rounded.control}'
    height: 38px
  pill-blush:
    backgroundColor: '{colors.blush.soft}'
    textColor: '{colors.blush.ink}'
    typography: '{typography.pill}'
    rounded: '{rounded.pill}'
  pill-sand:
    backgroundColor: '{colors.sand.soft}'
    textColor: '{colors.sand.ink}'
    typography: '{typography.pill}'
    rounded: '{rounded.pill}'
  pill-rose:
    backgroundColor: '{colors.rose.soft}'
    textColor: '{colors.rose.ink}'
    typography: '{typography.pill}'
    rounded: '{rounded.pill}'
  page-head:
    backgroundColor: '{colors.tile}'
    textColor: '{colors.ink}'
    typography: '{typography.page-title}'
    rounded: '{rounded.tile}'
    padding: 16px 20px
---

# Blora Design 设计语言

## Overview

**一句话：用细缝拼起来的白瓷砖，每一块都装满、装整齐。**

Blora Design 的界面由一块块白色「格子」拼成，格子之间只留 6px 的细缝，整页像一面贴好的瓷砖墙。它的精致感不靠大字号、大留白或装饰效果，而是来自四个反复出现的细节：

1. **编号**：每个格子的标题前有一枚圆形等宽编号（`01`、`1B`），让页面有目录感。
2. **托盘**：同类条目放进浅灰蓝托盘，托盘里是一格格白色小块，形成「白 → 灰蓝 → 白」三层。
3. **星轨**：Logo 里的圆环 + 轨道点，在界面里化成环形读数和几何标记。
4. **等宽字**：编号、数值、金额、标识符、小标签全部用 JetBrains Mono，带出工具感。

设计宗旨按优先级排列。冲突时，前面的压过后面的：

1. **满而不挤**：格子里不能出现大块无意义的空白；但内容之间要有明确的分组节奏。
2. **零描边**：任何地方都不画边框和分隔线，层次全部靠底色深浅、细缝和圆角表达。
3. **处处是 Blora**：页面上不出现任何浏览器或系统原生控件的外观（下拉框、日期面板、滚动条、悬浮提示…），见 Components · 不出现原生控件。
4. **同一套语法**：标题、托盘、读数、标签在所有页面写法一致，用户学一次就会读整个产品。
5. **安静的颜色**：雾粉是唯一的强调色，暖杏和蔷薇只用来表达状态；不用渐变。
6. **连续的动效**：尺寸和位置的变化都要连续过渡，不跳、不闪。

**怎么用**：页面引入 `@bloret-crew/blora-design` 的 `blora.css` 和 `blora.js`，用普通 HTML 加 `bd-` 类名写页面（写法见 Components · 写法）。运行时会自动接管页面上的组件，不需要初始化。本文既约束框架本身的实现，也约束用框架写页面的方式。

## Colors

**颜色来源是 Cortado**（npm 包 `@bloret-crew/cortado`，仓库 BloretCrew/Cortado）：一套基于 Catppuccin 的单一调色板。

- 本文 YAML 是设计变量的唯一来源：`colors` 写每个语义颜色在浅色模式下的色值，`cortado` 写它在浅色 / 深色模式下各取 Cortado 的哪个颜色。框架的生成器据此输出 CSS 变量，并检查两者一致。
- 变量名 = `--bd-` + `colors` 里的路径，用连字符连接：`ink` → `--bd-ink`，`blush.solid` → `--bd-blush-solid`。
- 页面和组件**只用 `--bd-*`**。不写死色值，不用 `rgb()` / `rgba()`，也不直接用 `--cortado-*`（stylelint 规则包会报错）。需要半透明时用 `color-mix(in srgb, var(--bd-blush-solid) 22%, transparent)`。
- 改色去 Cortado 改；改「哪个语义用哪个颜色」改本文的 `cortado` 一栏。

色板只有三类：**中性底色**、**墨色文字**、**三组柔色**。

- **画布 canvas (#ECEEF5)**：格子之间露出的底色，冷一点的浅灰蓝，是「细缝」的颜色。
- **格子 tile (#FFFFFF)**：所有内容的承载面。
- **托盘 tray (#F3F4F9) / 浅底 tile-tint (#EFF1F5) / 凹槽 well (#EFF1F5)**：格子里的第二层。托盘装白色小格；凹槽是输入框、分段控件、次要按钮的底。slot (#E6E9EF) 是凹槽里再深一档的底（托盘内的悬停、开关轨道）。
- **墨色**：ink #292B36 用于标题和正文；ink-secondary #5C5F77 用于次要正文；ink-tertiary #85899B 用于标签；ink-quaternary #ACB0BE 只用于占位、单位、禁用，以及**等宽装饰性元信息**（格子右上的等宽标签）。说明文字用 ink-description #6C6F85，比 tertiary 深一档，保证可读。长文正文用 ink-prose #3F4250。
- **雾粉 blush**：主色，用于主按钮、选中态、编号、进度、推荐。
- **暖杏 sand**：完成、已支付、当前状态等「温和的肯定」，以及接近上限这类「留意」。
- **蔷薇 rose**：超限、逾期、失败、危险操作。

每组柔色都有四个层级：`solid`（填充按钮、进度条、圆点）、`fill`（较深的底，如次主按钮）、`soft`（标签和高亮底）、`ink`（放在 soft / fill 上的文字）。**文字永远用 ink，不用 solid**，solid 在白底上的对比度不够。`-hover` 是对应层级的悬停色。

暖杏同时承担「肯定」和「留意」两种语义。同一个视图里如果两种都出现，「留意」要配文字标签（如「接近上限」），不能只靠颜色区分。

深色模式由 `cortado.dark` 决定：默认跟随系统，`<html data-theme="light|dark">` 可以强制指定。深色下格子不加投影。

**已知问题（对比度）**：按 WCAG AA（正文 4.5:1）检查，主按钮白字在雾粉 #DC8A78 上只有 2.64:1；ink-tertiary #85899B 在浅底上约 3.2:1。2026-11-27 比较过四种方案（加深字色、加深底色、改柔和主按钮），视觉上都不如现状，**暂时保持白字 + 雾粉实色底**，等 3.0 全部完成后再统一调整。在此之前：

- 主按钮文字至少 13.5px、字重 540，且同一格子只放一个主按钮；
- tertiary 只用于 12px 以上的标签，不用于正文；
- 需要满足无障碍标准的产品，把主按钮改用 blush-fill 底 + blush-ink 字。

`blush.solid`、`seam`、`dash` 等颜色没有被下面的 `components` 引用，用于圆点、进度条、细缝和拖放区，lint 的 orphaned-tokens 警告可以忽略。

## Typography

正文 14px，界面里的大部分文字在 11–14px 之间。层级主要靠**字重和颜色**拉开，而不是靠字号。

| 角色         | 规格                                                                                      | 用途                                                       |
| ------------ | ----------------------------------------------------------------------------------------- | ---------------------------------------------------------- |
| page-title   | 20 / 640                                                                                  | 页头格的标题                                               |
| tile-title   | 14 / 650                                                                                  | 格子标题                                                   |
| body         | 14 / 400 / 1.55                                                                           | 正文、表格                                                 |
| description  | 13 / 400 / 1.55，颜色 ink-description                                                     | 卡片正文里的说明文字、页头说明                             |
| caption      | 12 / 400 / 1.5，颜色 ink-description                                                      | 格子标题下方的说明（`bd-head` 里的 `<p>`）、托盘小格的副行 |
| prose        | 14.5 / 400 / 1.75，颜色 ink-prose                                                         | 只用于长文阅读区 `bd-prose`（见 Components · 长文阅读）    |
| label        | 12 / 600，颜色 ink-tertiary                                                               | 字段名、读数名、托盘里的标签                               |
| metric       | 28 / 620，等宽数字                                                                        | 指标大数字                                                 |
| value-mono   | Mono 12 / 560                                                                             | 托盘里的数值、金额、配额、ID                               |
| index-mono   | Mono 11 / 600                                                                             | 编号                                                       |
| eyebrow-mono | Mono 10.5 / 600，大写，字距 .12em；颜色 ink-tertiary（页头）或 ink-quaternary（格子右上） | 页头标题上方的英文小标签、格子右上的标签                   |

规则：

- 标题字重 600–650，大数字 620，按钮 540。**字重上限 650，700 及以上一律不用**，满屏粗体是「粗糙感」的主要来源。
- 所有会上下对比的数字都开 `tabular-nums`。
- 行高：界面文字（导航、按钮、标签、说明）1.5，正文段落（`<p>`）1.55，长文 1.75。
- 中文段落不能以一两个字结尾（孤行）。浏览器自带的 `text-wrap: pretty` 对中文不生效，所以**运行时会把段落最后 5 个字连在一起**（`bd-head` 的说明、页头说明、`bd-prose` 的段落，以及任何写了 `data-bd-tail` 的元素）：在这几个字之间插入不可见的连接符 U+2060，只改文字内容、不增删节点，不会和 Vue / React 冲突；复制出来的文字会带着这些不可见字符。标题用 `text-wrap: balance`。业务不需要手动处理。
- 卡片里的说明文字尽量一行，最多两行；同一行的几张卡，说明要么都是一行，要么都是两行。
- 字体随框架提供（Inter、JetBrains Mono），不依赖用户电脑上装了什么。

## Layout

**这一节是整套语言的核心。** 「空」不是组件样式造成的，而是格子的组合方式造成的：同一行的格子会被拉成一样高，内容少的格子就空出一大块。所以下面的规则约束的是**怎么组合格子**，不只是格子长什么样。框架的构图层（`bd-page`、`bd-mosaic`、`bd-tile`、`bd-stack`、`bd-tray`）把能写进样式的规则都写进去了，剩下的靠这一节和检查工具。

### 网格与细缝

- 页面 `bd-page` 是一串「行」，每一行是一个 `bd-mosaic`，格子之间统一 6px 细缝，行与行之间也是 6px。列数用 `data-cols`，跨列用格子上的 `data-span`。
- 外角 20px，细缝两侧的角 6px：一行最左、最右的格子外侧是 20，相邻的一侧是 6。行换列（如 4 列变 2×2）时，角也要重新分配。`bd-mosaic` 自动分配，业务不写圆角。
- 页面左右只留 12px，不在两侧留大块空白；内容区最宽 1760px。
- 页面标题也是一个格子（`bd-tile data-variant="page"`），不让文字直接漂在画布上。

### 内容等量原则（最重要）

**同一行的格子必须装分量相当的内容。** 判断方法：每个格子的「内容组」数量差不超过 1，最长列表的条目数不超过最短的 1.5 倍。

内容不等量时，按下面的顺序处理，**禁止**用拉伸内部面板（`flex: 1` 的列表或底色块）去填：

1. **统一结构**：把不等长的清单换成同一组字段。例：套餐卡不列 3 / 5 / 7 条功能，而是每张都列「实例 / 构建 / 日志保留 / 支持」4 行规格（`bd-spec`），完整清单放进下方对比表。
2. **改列数**：宽格子里的表单用 3 列，列表用 2 列，让高格子变矮。
3. **改组合**：一个高格子旁边放两个上下叠放的矮格子（`bd-stack`），而不是一个矮格子。
4. **加收束元素**：在矮格子底部放有意义的结尾，比如对比读数、合计或主操作，放进 `data-part="foot"` 固定在底部。必须是真实信息，不能是装饰。
5. **改行**：实在无法等量，就把这个格子换到别的行，或单独成行。

### 铺满高度（grow）

让一行撑满到窗口底部（`bd-mosaic data-grow`）是空白的头号来源：内容固定的格子被拉高，底部空出一大块。

- **只有「弹性内容」可以铺满**：图表、时间网格（日程）、可滚动列表、地图、代码或日志查看器。这些内容在变高时信息量随之增加，不是填充。
- **内容固定的行一律不铺满**：表单、规格托盘、卡片行、说明格。页面底部留出画布是允许的，格子内部留空是不允许的。
- 一行里只要有一个格子是固定内容，这一行就不铺满。
- 「禁止 `flex: 1`」只针对列表和底色面板；图表、时间网格、滚动视口（格子里的 `data-grow` 子元素）可以跟随格子长高。

### 数据决定长度的内容（例外）

看板列、筛选后的列表、主从视图（收件箱）、可展开的标签云：它们的长度本身就是数据，无法也不应该「等量」。这类内容：

- **允许顶部对齐、底边参差**（`bd-mosaic data-align="start"`）：看板各列按卡片数自然高低，不拉伸成等高，也不往列底放填充物。参差的底边露出画布，不算格子内部空白。
- **固定高度的滚动视口**（收件箱列表、阅读区）不计入空白预算，但视口里的内容要从顶部开始排，空列表要有空状态。
- **固定高度的 flex 容器（滚动视口、做高度动画的列）里，子元素一律 `flex-shrink: 0`**，超出就滚动或裁切。自带 `overflow` 的子元素（代码块、可横向滚动的表格）`min-height` 会自动变成 0，不加这一条就会被压成一条细线。框架的组件已经遵守这一条，自定义容器也必须遵守。
- **展开 / 筛选后**的临时高度差可以接受，相邻格子出现的空白不算违规；但默认状态（首屏）必须满足空白预算。
- 空的一列 / 空的视口用空状态（`bd-empty`）填，不用底色块。

### 空白预算（可检查）

- 任意格子内部，最大的一段竖向空白（不含内边距）**不超过 40px**。
- 一行文字在宽格子里不能只占一半宽度：要么让右侧有元信息（两端对齐），要么把格子变窄。
- 表单里的输入框单个宽度不超过约 360px；更宽时增加列数。搜索格里的主搜索框不受此限，可以占满格子宽度。
- 检查口径：在默认状态、1380 / 1024 / 375 三个宽度下检查；「数据决定长度」的内容与长文阅读区按各自的例外处理。`blora check` 会自动检查（见 Do's and Don'ts · 检查）。

### 间距节奏：组内紧，组间松

不要处处用同一个间距。间距分五档：

| 档位     | 值   | 用在                                                                                                      |
| -------- | ---- | --------------------------------------------------------------------------------------------------------- |
| tight-xs | 2px  | 数值和它的备注（¥99 → 按月付费）                                                                          |
| tight-sm | 4px  | 托盘里的小格之间                                                                                          |
| tight-md | 6px  | 标题和说明（字面到字面的视觉距离；实现上标题行高 1.35 + 说明 `margin-top: 1px` 即可）；编号和标题之间是 8 |
| tile-gap | 10px | 格子内的默认间距                                                                                          |
| group    | 14px | 两个内容组之间                                                                                            |

格子内边距 16 / 18，页头格 16 / 20。**间距不随字号放大**：把字号调大时，内边距和间距保持不变。

**窄格子的紧凑变体**：格子内容宽度小于约 280px 时（如 1024 下四列看板），左右内边距改为 12，标题行整体右移 6px，让标题文字仍对齐到 18。`bd-tile` 用容器查询自动切换。

### 两端对齐

格子里每一个横向「行」最好有左右两端：

- 标题行：左边是编号 + 标题，右边是操作按钮或等宽标签（`bd-head` 的 `data-part="end"`）。
- 数值行：左边是读数，右边是对比或单位。
- 列表项：左边是图标和名称，右边是数值或状态。

### 响应式

- ≥1281：完整布局。≤1280：侧栏自动收起，次要侧栏可隐藏。≤1100：双栏表单类行改为上下排列。≤900：侧栏变成顶栏下方的横向导航条。≤640：页面边距 8、格子内边距 16。
- `bd-mosaic` 的列数随宽度自动减少，圆角随之重新分配：

  | `data-cols` | 桌面 | ≤1100 | ≤900  | ≤640  |
  | ----------- | ---- | ----- | ----- | ----- |
  | 1           | 1    | 1     | 1     | 1     |
  | 2           | 2    | 2     | 1     | 1     |
  | 3           | 3    | 3     | 1     | 1     |
  | 4           | 4    | 2 × 2 | 2 × 2 | 2 × 2 |
  | 5           | 5    | 3     | 2     | 1     |
  | 6           | 6    | 3     | 2     | 2     |

  指标行（4 列）在手机上保持 2 × 2，其余行在 ≤900 变成单列。

- 改成单列后重新检查空白预算：并排时等量，不代表上下排时就不空。
- 横向控件（如五段分段控件）放不下时，先去掉计数和内边距，不要换行，也不要让它溢出。

## Elevation & Depth

- 格子、页头、顶栏、侧栏加一层极淡的投影：`0 1px 2px` 墨色 4%。托盘里的小格是 `0 1px 2px` 墨色 5%。深色模式下都去掉。
- 浮层（菜单、气泡、弹窗）用 `0 14px 34px` 墨色 9% 加 `0 2px 8px` 墨色 4%。
- 投影颜色由 ink 用 `color-mix` 调出，同样是设计变量（`--bd-shadow-tile`、`--bd-shadow-cell`、`--bd-shadow-float`），组件不自己写投影。
- 层次主要靠**底色三层**：画布 → 白格子 → 托盘或凹槽 → 白小格。不要叠加第四层底色。

## Shapes

### 圆角梯度

格子 20 → 托盘、终端、日志、输入框 12 → 图标底 10 → 托盘小格、标签 7 → 按钮、徽标、状态标签用胶囊。圆角变量是 `--bd-radius-<名称>`（`rounded` 里的键）。

- **同心圆角只用在「只装小块」的容器上**：容器里只有标签或小格、四周等距内缩时，内圆角 = 外圆角 − 内缩（托盘 12、内缩 5、小格 7）。容器里混有文字、按钮等其他内容时，不强求同心。
- 不使用 4px 以下的圆角，搜索高亮、细条形图除外。
- **侧栏是胶囊形**：外圆角 32（收起时 64 宽的一半），里面的 Logo、导航按钮、选中高亮都是 32 − 10 = 22。收起时它们是正圆，展开后是胶囊，和圆形编号、环形读数同属一个圆润的家族。侧栏只装按钮，所以严格同心。
  - 实现：`bd-rail` 在自己的作用域内重定义 `--bd-radius-rail-item`，不改全局变量。格子里的导航（`bd-nav data-orientation="vertical"`：设置页分区导航、文章目录）仍然跟随格子，是 20 − 10 = 10。

### 几何标记，代替渐变

**不使用渐变，也不使用大色块**（大面积底色渐变、按钮渐变、文字渐变、装饰性大圆盘、整列色带都不用）。`repeating-linear-gradient` 画的硬边条纹也算渐变，需要条纹就用真实元素。图表面积填充只能是平涂（不透明度 ≤ 12%），或者不填充。需要强调时，按顺序选：

1. 状态标签（`bd-pill`）。
2. **角落几何线**（`bd-corner`）：格子右上角 2–3 道同心细弧，圆心放在角外约 12px，线宽 1px，颜色 blush-fill / blush-track；可在最外一道弧上放一颗 2–3px 的实心小点。弧线可以从右上角的标签后面穿出，但最外一道必须停在正文第一行之上。只画线，不画成图形或插画。
3. 环形读数（`bd-ring`）：4px 线宽的圆环 + 环心等宽读数，只用于真实的比例数据（规则见 Components · 星轨环读数）。

几何线是装饰，不受「零描边」限制；「零描边」指的是不给格子、输入框、表格画边框和分隔线。拖放区（`bd-dropzone`）的虚线轮廓是唯一的线框例外，由组件用 SVG 画，颜色 dash。几何标记只用在需要被注意的那一个格子上（推荐、当前、异常），**一个视图最多一处**，标记不能压住文字。

## Motion & Micro-interaction

- 标准缓动 `cubic-bezier(0.22, 1, 0.36, 1)`，时长 340ms；弹出用 pop 缓动，时长 260ms；悬停 150ms。
- **裁切容器里的可聚焦控件，四周至少留 4px**：展开 / 收起动画常用 `overflow: hidden` 裁切内容，而输入框、文本框、选择器的聚焦光晕是向外 3px 的 `box-shadow`，贴边的一侧会被裁掉。给裁切容器里的内容加 4px 内边距（顶部最容易漏）。
- **单选组的选中底必须连续滑动**：「一组里选一个」的控件（`bd-segmented`、`bd-tabs`、`bd-pager`、`bd-nav`、`bd-tree`、`bd-rail`），选中底是一块独立的滑块，选中项变化时滑过去，而不是在两个按钮之间跳。框架自动处理，业务只需改 `aria-selected` / `aria-current`（或让运行时处理点击）。
  - 组内项本来是透明底：滑块直接垫在下面。
  - 组内项各自有底色（分页、页签）：做成托盘——整组一块凹槽底、项透明，托盘圆角 = 项圆角 + 3（同心）。
  - 托盘列表（收件箱、日程条目）的小格是不透明白底，滑块会被挡住：选中底改为淡入淡出。
  - 多状态的进度（`bd-steps`）不用滑块：底色渐变，圆点内容变化时从 0.55 倍弹回原尺寸。
  - JS 加载前，选中项用自己的底色显示选中态；运行时接管后换成滑块，不闪。
- **空间变化必须连续**：侧栏展开收起、列表增删、筛选结果、折叠面板都要动画化高度或位置（grid `0fr → 1fr`、FLIP、WAAPI），不用淡入淡出代替，**也不允许高度跳变**。
- 数字变化用滚动计数；进度、环形读数用 WAAPI 动画 `stroke-dasharray`。
- **FLIP 移动（看板卡片、列表重排）的三条实现要求**，否则动画中会错位、结束时跳一下（框架的动效模块按此实现；自己写 FLIP 时同样适用）：
  1. 先改 DOM、**一次性量完所有终点**（元素位置、容器高度），再开始任何动画。容器高度动画的第一帧是旧高度，开始之后再量会量到被挤压的布局。
  2. 做高度动画的容器里，子元素一律 `flex-shrink: 0`，溢出靠容器裁切，不能让标题行等被压扁。
  3. 需要飞出裁切范围的替身，放进当前场景（`position: absolute`），坐标用「终点 − 场景左上角」，不要用 `position: fixed` 或「视口坐标 + 滚动距离」：页面高度变化时浏览器会修正滚动，替身会和卡片错开。
- 首屏不播放过渡；入场动画只用 `fill-mode: backwards`，不留残余的 transform。
- 遵守 `prefers-reduced-motion`：开启后去掉所有位移和缩放，只保留颜色和透明度变化。

## Voice & Content Strategy

- 中文为主，技术名词保留英文（vCPU、CNAME、HTTPS）；中英文之间加空格。
- 页头格：等宽英文小标签（`PLANS`、`USAGE`）+ 中文标题 + 一行说明。
- 说明写「是什么 / 会怎样」，不写口号；一张卡的说明不超过两行。
- 数值带单位，单位用 ink-quaternary 或更小字号。
- 示例数据要像真的：长短混合、要有超长名称（用省略号截断）、要有空状态。
- **不要为了填满网格而编造字段或设置项。** 网格放不满时，让最后一个字段跨列，或减少列数。
- 组件自己生成的文字（「无结果」「已复制」「第 2 页」）由框架的语言包提供，跟随 `<html lang>`。

## Components

### 写法

页面是普通 HTML。一个元素最多带一个 `bd-` 类，表示「它是什么组件」；其余一律用属性：

| 东西           | 写法                                                | 例子                                                                                |
| -------------- | --------------------------------------------------- | ----------------------------------------------------------------------------------- |
| 组件           | `class="bd-<组件>"`                                 | `bd-tile`、`bd-segmented`                                                           |
| 内部部件       | 优先语义元素和 role；不够时用 `data-part`           | `.bd-segmented > [role=tab]`、`<div data-part="end">`                               |
| 变体           | `data-<维度>`                                       | `data-tone="rose"`、`data-size="sm"`、`data-variant="ghost"`                        |
| 布局参数       | `data-<参数>`                                       | `data-cols="3"`、`data-span="2"`、`data-grow`                                       |
| 密度           | `data-density="compact"`，写在页面或任意容器上      |                                                                                     |
| 状态           | 只用 ARIA 和原生状态，**不加 `.active` 一类的类名** | `aria-selected`、`aria-current`、`aria-expanded`、`:checked`、`[open]`、`:disabled` |
| 事件           | `bd-<动作>`，用连字符                               | `bd-change`、`bd-open`、`bd-close`                                                  |
| 由框架控制状态 | `data-bd-controlled`：运行时只发事件、不改状态      | Vue 里绑定 `:aria-selected`                                                         |

```html
<main class="bd-page">
  <section class="bd-mosaic" data-cols="3">
    <article class="bd-tile">
      <header class="bd-head">
        <h3>实例</h3>
        <p>近 24 小时的运行状态</p>
        <div data-part="end"><span class="bd-pill" data-tone="sand">运行中</span></div>
      </header>
      <div class="bd-segmented" role="tablist" aria-label="视图">
        <button role="tab" aria-selected="true">列表</button>
        <button role="tab">网格</button>
      </div>
    </article>
  </section>
</main>
```

**组件名表**（参考页 `reference/` 早于 3.0，仍是旧类名，对照如下）：

| 分类       | 3.0 组件                                                                                                                                        | 参考页里的写法                                                                                                                                                        |
| ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 构图       | `bd-app`、`bd-rail`、`bd-topbar`、`bd-page`                                                                                                     | 页面外壳、`.side-rail`、`.top-header`                                                                                                                                 |
|            | `bd-mosaic`、`bd-tile`、`bd-head`、`bd-stack`                                                                                                   | `.mosaic-*` / `.blora-row`、`.tile`、`.tile-head`、`.col-stack` / `.blora-stack`                                                                                      |
|            | `bd-tray`、`bd-corner`、`bd-scroll`                                                                                                             | `.tray`、`.plan-corner`、（新增）                                                                                                                                     |
| 基础       | `bd-button`、`bd-group`、`<svg data-icon>`、`bd-kbd`、`bd-pill`、`bd-tag`、`bd-avatar`                                                          | `.btn`、`.coupled-pair`、`svg.i`、`.kbd`、`.status-pill`、`.tag-chip`、`.av-orb`                                                                                      |
| 导航       | `bd-segmented`、`bd-tabs`、`bd-pager`、`bd-nav`、`bd-breadcrumb`、`bd-tree`、`bd-steps`                                                         | `.seg-bar` / `.seg` / `#viewPair`、`.tabs-bar`、`.pager`、`.jump-strip` / `.settings-nav` / `.doc-toc` / `.mobile-nav`、`.crumbs`、`.tree-list`、`.c-step`            |
| 输入       | `bd-field`、`bd-input`、`bd-textarea`、`bd-select`、`bd-date`、`bd-stepper`、`bd-slider`、`bd-switch`、`bd-checkbox`、`bd-radio`、`bd-dropzone` | `.field-box`、输入框、`.picker-shell`、日历、`.num-stepper`、`.slider-block`、`.sw-pill`、`.chk-item`、`.orb-radio`、`.dropzone`                                      |
| 数据展示   | `bd-table`、`bd-list`、`bd-spec`、`bd-ring`、`bd-metric`、`bd-progress`、`bd-code`、`bd-prose`、`bd-accordion`、`bd-empty`、`bd-skeleton`       | 表格、`.seamless-list`、`.spec-row` / `.spec-stack`、`.orbit-ring-wrap` / `.kpi-ring`、`.orbit-tile`、进度条、代码块、阅读区、`.acc-card`、`.empty-card`、`.skel-bar` |
| 反馈与浮层 | `bd-toast`、`bd-alert`、`bd-tooltip`、`bd-popover`、`bd-popconfirm`、`bd-menu`、`bd-context`、`bd-modal`、`bd-drawer`、`bd-command`             | `.toast-stack`、`.alert-strip`、`.tip-card`、`.float-panel`、确认气泡、`.menu-opt`、右键菜单、`.modal-card`、`.drawer-panel`、命令面板                                |

看板、收件箱、日程、设置页、套餐卡、文档阅读页是**模式**：由上面的组件拼成，仓库 `recipes/` 里有示例，不做成组件。新组件必须先设计、经确认写进本文，再实现。

**设计变量的名字**（全部由本文 YAML 生成）：

| YAML                    | CSS 变量                                                           | 例子                                              |
| ----------------------- | ------------------------------------------------------------------ | ------------------------------------------------- |
| `colors.<路径>`         | `--bd-<路径>`                                                      | `--bd-ink`、`--bd-blush-solid`、`--bd-on-primary` |
| `rounded.<名>`          | `--bd-radius-<名>`                                                 | `--bd-radius-tile`、`--bd-radius-cell`            |
| `spacing.<名>`          | `--bd-space-<名>`                                                  | `--bd-space-seam`、`--bd-space-group`             |
| `typography.<角色>`     | `--bd-text-<角色>-size / -weight / -leading / -tracking / -family` | `--bd-text-caption-size`                          |
| `fonts.<名>`            | `--bd-font-<名>`                                                   | `--bd-font-sans`、`--bd-font-mono`                |
| `motion.<名>`           | `--bd-<名>`                                                        | `--bd-ease-out`、`--bd-duration`                  |
| `elevation.<模式>.<名>` | `--bd-shadow-<名>`                                                 | `--bd-shadow-tile`、`--bd-shadow-focus`           |

### 外壳与构图

```html
<div class="bd-app">
  <nav class="bd-rail" aria-label="主导航">
    <a data-part="brand" href="/"
      ><span data-part="logo"><svg>…</svg></span><span>Blora Cloud</span></a
    >
    <p data-part="section">工作区</p>
    <a href="/overview" aria-current="page"><svg data-icon>…</svg><span>总览</span></a>
    <a href="/instances"
      ><svg data-icon>…</svg><span>实例</span><span data-part="count">24</span></a
    >
    <div data-part="foot">
      <div data-part="note">团队版 · 本月用量 <data>68%</data></div>
      <button type="button" data-part="collapse" aria-expanded="true" aria-label="收起侧栏">
        <svg data-icon>…</svg><span>收起侧栏</span>
      </button>
    </div>
  </nav>
  <main class="bd-page">
    <header class="bd-topbar">
      …
      <div data-part="end">…</div>
    </header>
    <header class="bd-tile" data-variant="page">
      <p data-part="eyebrow">Overview</p>
      <h1>早上好，Rhedar</h1>
      <p>过去 7 天所有服务运行平稳。</p>
      <div data-part="end">…本页操作…</div>
    </header>
    <section class="bd-mosaic" data-cols="2" style="--bd-columns: minmax(0, 1.75fr) minmax(0, 1fr)">
      …
    </section>
  </main>
</div>
```

- **侧栏**：导航项是 `bd-rail` 里没有 `data-part` 的 `<a>` / `<button>`，当前项写 `aria-current="page"`。链接的 `aria-current` 由页面或路由设置；按钮型导航项由运行时在点击时切换（加 `data-bd-controlled` 则只发 `bd-change` 事件）。收起状态写在收起按钮的 `aria-expanded` 上，运行时会记住用户的选择；≤1280 自动收起、不能手动展开；≤900 同一份标记变成横向导航条，不需要另写移动端导航。
- **拼图**：`data-cols` 1–6 决定列数，`--bd-columns` 只在桌面列数下生效，用来设定列宽比例。`data-grow` 让这一行撑满剩余高度（只用于弹性内容），`data-align="start"` 让格子顶部对齐、底边参差（看板），`data-index="none"` 让这一行不编号（同类卡片）。上下叠放的格子用 `bd-stack` 包起来放进拼图，最后一个格子吃掉剩余高度。
- **格子**：`data-grow` 的子元素跟随格子长高；`data-part="foot"` 的子元素固定在底部；`data-density="compact"` 用紧凑内边距（可写在格子或任意祖先上）。
- **托盘**：`bd-tray` 的每个直接子元素是一个小格；`data-cols="2"` 排成两列（≤640 变回一列）；`data-density="compact"` 用紧凑小格。
- **滚动区域**：固定高度、需要滚动的区域写 `bd-scroll`，运行时画滚动滑块；整个页面的滚动滑块自动出现。

### 不出现原生控件

原生元素只能当作承载行为和语义的底子，**外观 100% 由 Blora 画**；自带浏览器或系统界面的东西一律换成 Blora 组件：

| 原生东西                                           | 用什么                                                                                   |
| -------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| `<select>`、`<datalist>` 及其下拉                  | `bd-select`（单选 / 多选 / 标签式 / 可搜索），值放在组件内的隐藏 `<input>`，表单照常提交 |
| 日期、时间类 `<input>` 和系统日期面板              | `bd-date`：文本框 + Blora 日历浮层                                                       |
| `type=range` / `type=number` 的箭头 / `type=color` | `bd-slider` / `bd-stepper` / 需要时设计 `bd-color`                                       |
| `type=file` 的按钮                                 | `bd-dropzone`（点击后弹出的系统文件窗口属于操作系统，是唯一例外）                        |
| 搜索框的清除按钮、密码框的显示按钮                 | 去掉，用 Blora 自己的按钮                                                                |
| checkbox / radio                                   | 保留 `<input>`，`appearance: none` 后全部重画                                            |
| 文本框、多行文本框                                 | 保留元素，光标色、占位文字、选中文字、自动填充底色、拖拽角全部重画                       |
| `<progress>`、`<meter>`                            | `bd-progress`、`bd-ring`                                                                 |
| `<details>`                                        | 可承载折叠行为，去掉默认三角，展开收起加高度过渡                                         |
| `<dialog>`、`popover`                              | 只借用顶层显示、焦点约束、Esc、点击外部关闭；默认边框、内边距、`::backdrop` 全部重置     |
| 滚动条                                             | `bd-scroll`：隐藏原生滚动条，叠加 Blora 的细滑块；滚动本身仍是原生的。整个页面也是       |
| `title` 悬浮提示                                   | **禁止**，用 `data-tip` 或 `bd-tooltip`                                                  |
| 表单校验气泡                                       | 运行时给带 `bd-field` 的表单加 `novalidate`，错误由 `bd-field` 显示                      |
| `alert()` / `confirm()` / `prompt()`               | **禁止**，用 `toast()`、`confirm()`、`bd-modal`                                          |
| 默认焦点框、文字选中色、移动端点按高亮             | 统一用 Blora 的聚焦光晕（只在键盘操作时显示）和选中色                                    |
| 右键菜单                                           | 默认保留浏览器的；只有定义了 `bd-context` 的区域替换                                     |

网页管不到的：系统文件选择窗口、权限请求、浏览器自身界面；拼写检查的波浪线只能关掉，不能改样式。

### 格子标题语法

```
[01] 标题文字                          [等宽标签 / 操作]
     说明文字（与标题文字左对齐，缩进 32px）
```

- 写法：`bd-head` 里放一个 `<h2>`–`<h4>`（标题）、可选一个 `<p>`（说明）、可选一个 `data-part="end"`（右侧槽位）。编号由 CSS 计数器自动生成，**不写进标记**。
- 编号：24px 圆形，blush-soft 底，等宽 11 / 600。每行第一个格子编 `01`、`02`；同一行的其他格子编 `1B`、`1C`。
- 说明用 caption（12 / ink-description），与标题文字左对齐（缩进 32px）。

**编号范围**

| 情况                                                                                                                                                    | 规则                                 |
| ------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------ |
| 普通内容格（有 `bd-head`）                                                                                                                              | 编号                                 |
| 页头格（`data-variant="page"`）、指标格（`bd-metric`）、同排的「同类卡片」（套餐卡、分类卡、模板卡、上一篇 / 下一篇，写 `bd-mosaic data-index="none"`） | 不编号，它们本身是并列项目，不是章节 |
| 自带序号的卡片（步骤卡 1 / 2 / 3）                                                                                                                      | 保留自己的序号，不叠加计数器         |
| 与一行并排、上下叠放的格子（`bd-stack`）                                                                                                                | 延续该行：1B、1C…                    |
| 跨多行的侧栏（sticky 侧栏）                                                                                                                             | 归入它开始的那一行，依次 1B、1C…     |
| 一行第一个格子没有标题（如长文正文）                                                                                                                    | 下一个有标题的格子从 `0N` 开始       |
| 筛选隐藏了格子                                                                                                                                          | 按可见格子重新计数，可以接受         |

**右侧槽位**（只放一种）：

- 操作：最多 2 个 ghost / surface 按钮；
- 等宽大写标签（`<span data-part="tag">MTD · 5 ITEMS</span>`）；
- 一个状态标签（`bd-pill`）；
- 不超过 3 段的分段控件（筛选 / 切换视图），或图表图例；
- 32px 的行内环形读数（`bd-ring data-size="sm"`）：仅当整个格子讲的就是这一个比例时（如入门进度）。

放不下时，在 ≤640 把右侧槽位换到标题下方并占满宽度，不要挤压或溢出。`bd-head` 自动处理。

### 托盘（Tray）

同一个格子里有**三条及以上同类条目**（配额、资源、支付卡、设置开关、图例、规格、看板卡片、日程条目、时间线）时，必须放进托盘 `bd-tray`：托盘是 tray 底色、12 圆角、5 内缩，里面每个直接子元素是一个白色小格，7 圆角，小格之间 4px。小格里左边是标签或名称，右边是等宽数值。

- **一两条**：不需要托盘；但如果它和同一结构里其他托盘并列（如每个版本都有变更列表），为了一致可以用单格托盘。
- **时间线**也进托盘：先后顺序用小格里的时间标签表达，不画连接线（零描边）。
- **界面表格**（对比表、DNS 记录、规格对比）用托盘语法：`bd-table` 的表头是托盘外的一行标签，每一数据行是一个白色小格；分组名是托盘上方的小标签，不单独占一行空格子。
- **紧凑变体**（`data-density="compact"`）：规格行、表格行用 7 / 10 内边距、行高 32；其他条目用默认的 9 / 12。
- **悬停**：小格已经是白色，悬停不换底色（不加第四层底色）；改为标题变深或变雾粉墨色、右侧箭头右移 2px、或显出行内操作。
- 小格里放文字、开关、按钮等混合内容时，圆角仍是 7：同心规则看的是「托盘 → 小格」这一层，与小格里装什么无关。
- 长文正文里的列表、有序列表不进托盘。

### 星轨环读数（Ring metric）

指标是比例（预算使用率、配额、进度、CPU / 内存占用）时，在指标格右上角放 44px 环形读数 `bd-ring`：环宽 4，环心是等宽整数。写法是 `<div class="bd-ring" role="meter" aria-valuenow="72" aria-valuemin="0" aria-valuemax="100" aria-label="预算使用率"></div>`，圆环由运行时画；JS 加载前只显示数字。

- **颜色**：< 85% 雾粉；85–100% 暖杏（留意）；> 100% 蔷薇满环。组件按数值自动取色。
- **不适合环的比例**：长期接近 100% 的数值（可用性 99.9x%）画成环几乎是满的，没有信息量；用等宽数值放在托盘或规格行里。
- **位置**：指标格右上角 44px；或作为格子标题的右侧槽位，32px 行内变体（见格子标题语法）。托盘小格、规格行里不放环。
- **动效**：WAAPI 动画 `stroke-dasharray`，首屏不播放，遵守减少动效设置。
- **不是比例的指标**：保留 36px 图标底；要表达趋势时，可以用迷你折线（1.6px 线、无填充、雾粉实色）代替图标底。

### 规格行（Spec rows）

把对比性的信息写成「标签 — 值」的规格行 `bd-spec`，代替自由文字清单。写法是 `<dl class="bd-spec">`，每行一个 `<div><dt>标签</dt><dd>值</dd></div>`。多张卡并排时，每张卡的规格行字段完全一致。规格行是托盘的紧凑变体：标签 label 角色（12 / 600 / ink-tertiary），值 value-mono，内边距 7 / 10。

### 表单

- 每个字段是一个 `bd-field`：标签在上、控件在下；标签用 label 角色（12 / 600 / ink-tertiary），与控件间距 6；说明和错误在控件下方。
- 列数按格子内容宽度：≥ 820px 三列，≥ 480px 两列，更窄一列（表单容器用容器查询自动切换）。长字段（公司名、地址）用 `data-span="2"` 或 `data-span="full"`。
- 只读字段：凹槽底 + ink-secondary 文字，可以在右侧放复制按钮；不要做成禁用的灰色。
- 输入框单个宽度上限约 360px（搜索框除外）。

### 长文阅读

文档正文、文章、更新说明这类「要读完」的内容放进 `bd-prose`，它是唯一可以放宽行高的地方：

- 正文 prose 14.5 / 1.75，行宽上限 720px（约 40 个汉字）；界面其他部分仍是 1.55。
- 格子内边距仍用 16 / 18，不因为是长文就加大。
- 段落之间 10，块（列表、代码、提示、表格）之前后 14，章节之间 28。28 是唯一大于 14 的间距，只用在长文里，不算违反空白预算。
- 屏幕更宽时，多出的宽度给右侧栏（文章信息、相关链接），不在正文两侧留白。
- 提示 / 注意框：凹槽底 + 开头一个状态标签（提示、注意），不用整块彩色底。
- 代码块 `bd-code`：12 圆角、凹槽底、右上角复制按钮。正文里的表格按托盘语法。

### 按钮

`bd-button`：胶囊形，高 35；小号 29（`data-size="sm"`），大号 40（`data-size="lg"`）。变体 `data-variant`：`primary` 雾粉实心；`blush` 次主（雾粉 fill）；`sand` 暖杏辅助；`surface` 中性（凹槽底，默认，可不写）；`elevated` 浮起（白底 + 浅投影，用在凹槽里）；`ghost` 轻量（透明）；`rose` 危险。只有图标时加 `data-shape="icon"` 并写 `aria-label`。一个格子里最多一个实心主按钮。

- 忙碌：`aria-busy="true"`，图标换成转圈的 `<svg data-icon data-spin>`；禁用：`disabled`。
- 计数：按钮里放 `<span data-part="count">3</span>`；快捷键：放一个 `bd-kbd`。
- 耦合工具组 `bd-group`：一块凹槽里放几个小号按钮（如「重连 / 刷新」），里面的按钮自动变成 29 高。
- 「一组里选一个」不是按钮组，用分段控件。

### 分段控件（Segmented）

`bd-segmented`：凹槽底，选中底是连续滑动的滑块。写法 `role="radiogroup"` + 每项 `role="radio" aria-checked`（或 `role="tablist"` + `role="tab" aria-selected`）。运行时负责点击切换、方向键 / Home / End 和发出 `bd-change`。

- 默认：选中底白色浮起，项高 30，未选中文字 ink-tertiary（时间范围、筛选）。
- `data-shape="pill"`：胶囊形、项高 29，只有图标的项是 31 宽的正圆（视图切换）。
- `data-tone="sand"`：暖杏选中底，占满一行、各档等宽（规格档位）。
- 段数不超过 5；放在格子标题右侧槽位时不超过 3。

### 页签、分页、导航、目录树、步骤条

- **页签 `bd-tabs`**：托盘形（整行一块凹槽底、页签透明），选中底是连续滑动的雾粉滑块。`role="tablist"` + `role="tab" aria-selected aria-controls`，面板 `role="tabpanel"`，运行时切换面板的 `hidden`。可关闭的页签里放 `<span data-part="close">`：点击发出可取消的 `bd-close`，默认移除页签和面板并选中相邻页签。新加入的页签从 0.85 倍弹出。
- **分页 `bd-pager`**：托盘形，页码 30 × 30，当前页 `aria-current="page"` 由雾粉滑块垫底；上一页 / 下一页写 `data-part="prev"` / `"next"`，省略号 `<span data-part="gap">`。
- **导航 `bd-nav`**：当前项 `aria-current`。默认横向胶囊（页内跳转，可加 `<span data-part="dot">`；写 `data-spy` 时按滚动位置自动高亮）；`data-orientation="vertical"` 竖排，本身是一个格子（设置页分区导航、文章目录），条目圆角 20 − 10 = 10，二级条目 `data-level="2"`，目录标题 `<p data-part="label">`，`data-density="compact"` 是文章目录的紧凑样式；≤900 自动变成横向滚动条。
- **面包屑 `bd-breadcrumb`**：`<nav>` 里放链接，当前页 `aria-current="page"`，分隔符 `/` 由 CSS 画。
- **目录树 `bd-tree`**：ARIA tree。每项 `role="treeitem"`，行是 `<span data-part="node">`，子项放在 `role="group"` 里；文件夹写 `aria-expanded`，文件写 `aria-selected`。图标尺寸：箭头 11（`data-part="chevron"`）、文件夹 14（暖杏色）、文件 13。展开收起有高度过渡；选中的文件被收起时滑块隐藏；方向键 / Enter 可操作。
- **步骤条 `bd-steps`**：一排步骤块，当前步骤 `aria-current="step"`，它之前的步骤自动显示为已完成（暖杏、圆点里是对勾），不需要另外标记。每步写 `<span data-part="title">` 和可选的 `<span data-part="desc">`。状态变化时底色渐变、圆点从 0.55 倍弹回。≤640 改成竖排。

### 小块

- `bd-kbd`：快捷键，19 高，白底浮起，可放图标和字母。
- `bd-tag`：雾粉浅底标签，可在里面放一个移除按钮（写 `aria-label`）。
- `bd-avatar`：34px 圆形头像，`data-tone` 选底色；相邻的头像自动叠放 7px，并有一圈格子色描边分隔（这是唯一允许的「描边」，用投影画）。

### 状态标签（Pill）

`bd-pill`：胶囊形，11.5 / 560，soft 底 + ink 字，颜色用 `data-tone="blush|sand|rose"`，不写是中性（凹槽底 + ink-tertiary）。列表里表示运行状态时加 `data-dot`，前面多一个 6px 圆点。状态用词固定，按颜色分组：

- 雾粉：进行中、评审中、推荐、最新；
- 暖杏：已完成、已支付、当前、接近上限、测试中；
- 蔷薇：逾期、失败、超限、已废弃；
- 中性（凹槽底）：待开始、已暂停、已退款、草稿。

新增状态词要求 2–4 个字，描述状态而不是形容；先找现有词，找不到再加进本表。

### 提醒格（Alert）

整格提醒（到期、失败、配额告警）用 `bd-alert`，它是普通白色格子：左侧 36px 图标底（对应语义的 soft 色），标题前一个状态标签，右侧是操作和关闭按钮。**不把整个格子染成暖杏或蔷薇色**。关闭时用高度动画收起，并把下方的细缝一起收掉。

### 空状态

`bd-empty`：居中，包含一个 36px 图标底、一行文字（一句说明，或一个加粗短标题，不同时出现两行）和一个操作。一组建议词（`bd-tag`）算作「一个操作」。高度和它替代的内容相同，或者用高度动画过渡，不能让整行跳变。

## Do's and Don'ts

**Do**

- 先决定一行里放哪些格子、它们的内容是否等量，再画格子；再决定这一行该不该铺满高度。
- 用统一结构（规格行、同一组字段）让并排的卡片天然等高。
- 三条以上的同类条目放进托盘；数值用等宽字、两端对齐。
- 格子标题统一用 `bd-head`：「编号 + 标题 + 右侧标签或操作」。
- 强调用状态标签，或一处角落几何线。
- 状态写在 ARIA 属性上，样式和无障碍语义一起对。
- 写完页面跑一遍 `blora check`。

**Don't**

- 不要用 `flex: 1` 拉伸列表或底色面板，去填等高行留下的空（图表、时间网格、滚动视口除外）。
- 不要让内容固定的行铺满窗口高度（`data-grow`）。
- 不要为了「不空」而整体放大字号、按钮或间距；也不要在放大字号时同步放大间距。
- 不要画边框、分隔线、描边。
- 不要使用渐变，也不要用大色块（装饰性圆盘、整列色带）做强调。
- 不要写死颜色，也不要直接用 `--cortado-*`。
- 不要用 `<select>`、`title` 属性、`alert()` 等会露出原生界面的东西。
- 不要用类名表示状态或变体（`.active`、`.primary`），也不要给一个元素挂多个 `bd-` 组件类。
- 不要让中文段落以一两个字结尾。
- 不要让同一行的卡片说明一张一行、一张三行。
- 不要让文字直接漂在画布上（页面标题也要放进格子）。
- 不要在一个视图里放多处几何标记，也不要让标记压住文字。
- 不要用 700 及以上的字重。
- 不要为了填满网格编造字段。

### 检查

`blora check <网址或目录>`（npm 包 `@bloret-crew/blora-check`）在 1380 / 1024 / 375 三个宽度、浅色和深色下检查：空白预算、压缩、光晕裁切、原生外观、写死颜色、对比度、选中底对齐、横向溢出、移动端点击区域、减少动效。失败时指出是哪个格子、违反本文哪一节。

在 `blora check` 发布之前，可以在浏览器控制台运行下面三段脚本。

**空白检查**：列出最大竖向空白超过 40px 的格子（装饰用的 svg 不计入）：

```js
[...document.querySelectorAll('.bd-tile')]
  .filter((t) => t.offsetParent)
  .map((t) => {
    const tb = t.getBoundingClientRect(),
      pb = parseFloat(getComputedStyle(t).paddingBottom);
    const iv = [...t.querySelectorAll('*')]
      // 叶子元素 + 自己带文字的元素（段落里有 <span> 时，段落本身的文字也要算）
      .filter(
        (e) =>
          e.offsetParent &&
          !e.closest('svg') &&
          (!e.children.length ||
            /svg|BUTTON|INPUT/i.test(e.tagName) ||
            [...e.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim())),
      )
      .map((e) => {
        const r = e.getBoundingClientRect();
        return [r.top, r.bottom];
      })
      .sort((a, b) => a[0] - b[0]);
    if (!iv.length) return null;
    let cur = iv[0][1],
      gap = 0;
    for (const [a, b] of iv.slice(1)) {
      gap = Math.max(gap, a - cur);
      cur = Math.max(cur, b);
    }
    gap = Math.max(gap, tb.bottom - pb - cur);
    return gap > 40
      ? [t.querySelector('.bd-head :is(h2, h3, h4)')?.textContent ?? t.className, Math.round(gap)]
      : null;
  })
  .filter(Boolean);
```

**压缩检查**：列出被 flex 容器压扁的元素（实际高度小于内容高度、又不是有意的滚动视口）。行数截断（line-clamp）的标题会出现在结果里，属于正常：

```js
[...document.querySelectorAll('*')]
  .filter((e) => {
    const p = e.parentElement;
    if (!e.offsetParent || !p) return false;
    const pc = getComputedStyle(p),
      cs = getComputedStyle(e);
    return (
      pc.display.includes('flex') &&
      pc.flexDirection.startsWith('column') &&
      +cs.flexShrink > 0 &&
      +cs.flexGrow === 0 &&
      cs.overflow !== 'visible' &&
      e.scrollHeight - e.getBoundingClientRect().height > 2
    );
  })
  .map((e) => [e.className, Math.round(e.getBoundingClientRect().height), e.scrollHeight]);
```

**光晕裁切检查**：列出聚焦光晕会被裁掉的控件（离最近的裁切容器不足 3px）。检查前先把折叠区域展开：

```js
[...document.querySelectorAll('.bd-input, .bd-textarea, .bd-select, .bd-date, .bd-stepper')]
  .filter((e) => e.offsetParent)
  .map((el) => {
    let a = el.parentElement;
    while (
      a &&
      a !== document.body &&
      !/(hidden|clip|auto|scroll)/.test(getComputedStyle(a).overflow)
    )
      a = a.parentElement;
    if (!a || a === document.body) return null;
    const r = el.getBoundingClientRect(),
      c = a.getBoundingClientRect();
    const room = {
      top: r.top - c.top,
      right: c.right - r.right,
      bottom: c.bottom - r.bottom,
      left: r.left - c.left,
    };
    const tight = Object.entries(room)
      .filter(([, v]) => v < 3)
      .map(([k, v]) => `${k} ${Math.round(v)}`);
    return tight.length ? [el.id || el.className, tight.join(', ')] : null;
  })
  .filter(Boolean);
```

### 参考实现

`reference/` 里是 3.0 的视觉真值：组件全集和 4 个 demo 页。它们早于 3.0 框架，用的是旧类名（对照见 Components · 写法）；第 ② 阶段会用框架重写同样的页面，并与它们逐像素比对。组件外观以 `components.html` 为准，页面组合规则以本文为准：

| 文件                          | 内容                                                             |
| ----------------------------- | ---------------------------------------------------------------- |
| `reference/components.html`   | 组件全集（按钮、选择器、表格、树、页签、提示、骨架屏…）          |
| `reference/demo-console.html` | 云控制台：开始使用、总览、实例列表、实例详情、设置               |
| `reference/demo-billing.html` | 账单与套餐：套餐、用量、发票、支付方式（最早按本文对齐的参考页） |
| `reference/demo-team.html`    | 协作与工单：看板、收件箱、日程、成员资料                         |
| `reference/demo-docs.html`    | 文档与帮助中心：帮助中心、文章、更新日志、搜索                   |
