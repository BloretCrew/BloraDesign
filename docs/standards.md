# Blora Design · UI 设计规范

> Blora Design 是一套令牌驱动的 Web UI 设计规范。  
> 本文是 **视觉与令牌** 的信源（色彩 / 字体 / 间距 / 动效 / 无障碍）。  
> **页面组合、表面层级、页面范式** → [`patterns.md`](./patterns.md)  
> **工程接入、组件用法、迁移** → [`guide.md`](./guide.md)  
> **完整迁移规范** → [`migration/from-any-ui-to-blora-design.md`](./migration/from-any-ui-to-blora-design.md)
> **框架接入说明** → [`framework.md`](./framework.md)
> **发布状态** → [`refactor/status.md`](./refactor/status.md)
> 默认配色 `coral` 的色值与当前 token CSS 对齐；换肤后以运行时令牌为准。
>
> **令牌名称以本文表格中的 CSS 变量为准**（与 `@bloret-crew/blora-design/token-manifest.json` 一致）。
> 颜色一律使用 `--blora-color-*` 语义令牌；不存在 `--blora-primary`、`--blora-surface-1`、`--blora-text-muted` 这类简写，写了也不会生效。

---

## 一 · 设计原则

Blora Design 将视觉令牌分为三个基础层：**背景与表面、内容、交互与状态**。组件只消费语义令牌，不依赖具体颜色名称。

### 1.1 三层模型 · Three-Layer Model

| 层 | 职责 | 在界面中的体现 |
|----|------|----------------|
| **背景与表面** | 建立页面层级 | 页面背景使用 `--blora-color-surface-canvas`，容器使用 `--blora-color-surface-default`，hover/分组与内凹面使用 `--blora-color-surface-raised` / `--blora-color-surface-sunken` |
| **内容** | 承载文本与结构 | 文本按强度使用 `--blora-color-text-*`，边框使用 `--blora-color-border-subtle` |
| **交互与状态** | 表达操作和反馈 | 主操作使用 `--blora-color-action-primary-default`，成功、警告、危险和信息使用 `--blora-color-status-*` |

具体色值由配色系统映射；组件结构、交互和可访问性不随配色变化。

### 1.2 六原则 · The Six Principles

1. **空间有序** — 组件内边距默认 ≥ 16px，分组间距默认 ≥ 32px，并统一取自间距令牌。
2. **节制用色** — 画面约 90% 为底色与文字色，主色 ≤ 5%，余者为状态语义。
3. **曲率连续** — 基础圆角从 6px 到 36px 平滑递进，表单控件优先使用胶囊曲率。
4. **动效克制** — 缓动以 `cubic-bezier(.25,.8,.25,1)` 为主，常规时长 160–420ms，避免无意义位移。
5. **字体统一** — 标题与正文共享现代无衬线骨架，代码使用等宽字体，各司其职。
6. **默认可访问** — 所有交互元素 ≥ 40×40，对比度满足 WCAG AA，支持键盘与 reduced-motion。

---

## 二 · 色彩系统

色板分三层：**背景与表面、文本与边框、功能色**。功能色只表达交互层级与状态，不承担装饰。

### 2.1 背景与表面 · Background & Surfaces

| Token | Coral 浅色 | 用途 |
|------|-----|------|
| `--blora-color-surface-canvas` | `#FAF7F8` | 页面底色（`body.blora-page` 已自动使用） |
| `--blora-color-surface-default` | `#FFFCFD` | 卡面、输入框、浮层 |
| `--blora-color-surface-raised` | `#F4ECEE` | 次级面 — hover、分组、引用块 |
| `--blora-color-surface-sunken` | `#E9DEE1` | 三级面 — 禁用、轨道、内凹区域 |

> 深色模式下这四个令牌会整体重映射（canvas 最深，sunken 最浅），组件与业务 CSS 不需要也不应该为暗色另写颜色。

### 2.2 文本与边框 · Text & Border

文字色自深至浅逐级递进，覆盖从主标题到禁用文本的全部层级：

| 层级 | Token | Coral 浅色 | 用途 |
|------|-------|-----|------|
| Primary | `--blora-color-text-primary` | `#303143` | 品牌、页面标题和高强调数字 |
| Secondary | `--blora-color-text-secondary` | `#3D3E50` | 默认正文（`.blora-scope` 的默认文字色） |
| Emphasis | `--blora-color-text-emphasis` | `#555565` | 强调正文、卡片正文 |
| Muted | `--blora-color-text-muted` | `#74717C` | 辅助说明、元信息 |
| Subtle | `--blora-color-text-subtle` | `#9B959D` | 非关键说明（不用于小号正文，对比度不足 4.5:1） |
| Disabled | `--blora-color-text-disabled` | `#B9B2B8` | 禁用和占位文本 |
| On accent | `--blora-color-text-on-accent` | `#FFFFFF` | 主色/状态色实心底上的文字 |
| Border | `--blora-color-border-subtle` | `#D9D2D6` | 边框和分隔线的**颜色** |

`--blora-border-subtle`、`--blora-border-strong`、`--blora-border-primary` 是完整的 `border` 简写（含 `1px solid`），只能用于 `border` / `border-top` 等简写属性，不能当颜色使用。

高强调文本用于建立层级，不应用作大面积填充。

### 2.3 功能色 · Functional Accents

| Token | Coral 浅色 | 语义 |
|------|-----|------|
| `--blora-color-action-primary-default` | `#9F5964` | **唯一主强调色**（Coral） |
| `--blora-color-action-primary-hover` | `#80464F` | 主色 hover/press |
| `--blora-color-action-primary-soft` | `#C07E86` | 主色弱化（装饰、数据系列） |
| `--blora-color-status-danger` | `#AF4A3F` | 危险与错误（砖红，与主色明确区分；深色 `#E0715B`） |
| `--blora-color-status-neutral` | `#6E6975` | 中性强调 |
| `--blora-color-status-info` | `#5D6680` | 信息 |
| `--blora-color-status-success` | `#5B756B` | 成功 |
| `--blora-color-status-support` | `#687C7B` | 辅助数据系列 |
| `--blora-color-status-warning` | `#8C6429` | 警告（琥珀） |
| `--blora-color-status-secondary` | `#8B6571` | 次强调/数据系列 |

浅色底（tint）不需要新令牌：用 `color-mix(in srgb, var(--blora-color-status-success) 12%, transparent)` 这类写法从状态色派生，或直接使用 Tag / Alert / Badge 的语义 variant。

### 2.4 状态映射

| 状态 | 令牌 | 组件写法 |
|------|----|------|
| 成功 success | `--blora-color-status-success` | `data-variant="success"` |
| 警告 warning | `--blora-color-status-warning` | `data-variant="warning"` |
| 危险 danger  | `--blora-color-status-danger` | `data-variant="danger"`（Result 使用 `variant="error"`） |
| 信息 info    | `--blora-color-status-info` | `data-variant="info"` |

### 2.5 用色比例

> **90 / 5 / 5 法则**：底色与文字占 90%，主色占 ≤ 5%，状态色占 ≤ 5%。任何违反此比例的设计都需复审。

---

## 三 · 字体系统

### 3.1 字族

| 字族 | Token | 用途 |
|------|-------|------|
| 展示无衬线 | `--blora-font-heading` | 标题、品牌、数字大字 |
| UI 无衬线 | `--blora-font-sans` | 正文、按钮、表单、UI 文字 |
| 等宽 | `--blora-font-mono` | 代码、数据、技术标签 |

> 展示与 UI 字体统一采用 `system-ui` 系统栈（Apple 设备为 San Francisco / 苹方，Windows 为 Segoe UI / 微软雅黑，Android 为 Roboto，Linux 为 Noto Sans SC）；代码采用 `JetBrains Mono` 等宽栈。

### 3.2 字阶 · Type Scale

以 1.25 倍率递进（Major Third）：

| Token | size | 行高 | 用途 |
|-------|------|------|------|
| `--blora-text-xs`   | 12px | 1.6 | 辅助/标签 |
| `--blora-text-sm`   | 14px | 1.6 | 次要/按钮 |
| `--blora-text-base` | 16px | 1.6 | **正文基准** |
| `--blora-text-lg`   | 18px | 1.85 | 引文/小标题 |
| `--blora-text-xl`   | 22px | 1.4 | h4 |
| `--blora-text-2xl`  | 28px | 1.3 | h3 |
| `--blora-text-3xl`  | 36px | 1.25 | h2 |
| `--blora-text-4xl`  | 48px | 1.2 | h1 |
| `--blora-text-5xl`  | 64px | 1.1 | 英雄 |

### 3.3 字重与字距

- **字重**：默认 400，强调 500，标题 600，英雄 700。不使用 300。
- **字距**：标题与正文均为 `0`；仅全大写短标签可使用 `+0.18em`。

### 3.4 行高

- `--blora-leading-tight: 1.25` — 标题
- `--blora-leading-normal: 1.6` — 正文
- `--blora-leading-loose: 1.85` — 长文/引文

---

## 四 · 间距系统

Blora Design 采用 12 级非线性间距，组件与布局必须优先使用对应令牌：

| Token | rem | px | 典型用途 |
|-------|-----|----|----------|
| `--blora-space-0` | 0 | 0 | — |
| `--blora-space-1` | 0.25 | 4 | 图标内距/紧致间距 |
| `--blora-space-2` | 0.5 | 8 | 行内元素 |
| `--blora-space-3` | 0.75 | 12 | 小组件内距 |
| `--blora-space-4` | 1 | 16 | **默认组件内距** |
| `--blora-space-5` | 1.5 | 24 | 卡面内距/字段间距 |
| `--blora-space-6` | 2 | 32 | 分组之间 |
| `--blora-space-7` | 2.5 | 40 | 面板内距 |
| `--blora-space-8` | 3 | 48 | 区块之间 |
| `--blora-space-9` | 4 | 64 | 大段落 |
| `--blora-space-10` | 5 | 80 | 英雄区上下 |
| `--blora-space-11` | 6 | 96 | — |
| `--blora-space-12` | 8 | 128 | 顶层分隔 |

**使用规则**：相邻元素用 2/3/4；分组用 5/6；区块用 8/9。

---

## 五 · 圆角、边框、阴影

### 5.1 圆角 · Radius

| Token | 值 | 用途 |
|-------|----|------|
| `--blora-radius-xs` | 6px | 标签/小方块 |
| `--blora-radius-sm` | 10px | 紧凑控件 |
| `--blora-radius-md` | 14px | 卡面/常规容器 |
| `--blora-radius-lg` | 18px | 浮层/卡面 |
| `--blora-radius-xl` | 26px | 面板/模态 |
| `--blora-radius-2xl` | 36px | 大面板 |
| `--blora-radius-full` | 9999px | 胶囊/圆形 |

表单控件默认使用 `--blora-control-radius: var(--blora-radius-full)`；局部组件按层级选用上表曲率。

### 5.2 边框 · Border

- 默认边框：`border: var(--blora-border-subtle)`（等价于 `1px solid var(--blora-color-border-subtle)`）
- 强调边框：`border: var(--blora-border-strong)`（`1px solid var(--blora-color-text-subtle)`）
- 主色边框：`border: var(--blora-border-primary)`（`1px solid var(--blora-color-action-primary-default)`）
- 虚线分隔：`border-top: 1px dashed var(--blora-color-text-subtle)`，或直接使用 `.blora-divider[data-variant="dashed"]`

### 5.3 阴影 · Shadow

四级 + 两特殊。所有阴影保持低不透明度，形成柔和的现代层级。

| Token | 用途 |
|-------|------|
| `--blora-shadow-1` | 1px 浮起 — 列表项 |
| `--blora-shadow-2` | 卡面默认 |
| `--blora-shadow-3` | 浮层（popover/dropdown） |
| `--blora-shadow-4` | 模态/抽屉 |
| `--blora-shadow-inset` | 内凹 — 嵌套容器 |
| `--blora-shadow-primary` | 主色光晕 — 主按钮/标识 |

---

## 六 · 表面与媒体

### 6.1 表面纹理 · Surface Texture

`--blora-texture-background` 与 `--blora-texture-overlay` 在浅色下默认均为 `none`（深色下只有极弱的径向纹理），Blora Design 的基础表面保持纯净。产品可以覆盖这两个令牌增加低对比纹理，但禁止在单个组件内部硬编码装饰背景。

### 6.2 分隔线 · Divider

`.blora-divider` 提供默认、虚线和带文本三种结构化分隔方式。颜色、间距和边框均从语义令牌派生。

### 6.3 图片色调 · Image Tone

- `.blora-image-muted` — 降低饱和度并轻微收敛对比度：`saturate(.6) contrast(.96)`
- `.blora-image-monochrome` — 完全灰度并保留结构对比：`grayscale(1) contrast(1.02)`

---

## 七 · 动效

### 7.1 缓动 · Easing

| Token | 曲线 | 用途 |
|-------|------|------|
| `--blora-easing-standard` | `cubic-bezier(.25,.8,.25,1)` | **默认** — 柔和快速收束 |
| `--blora-easing-soft` | `cubic-bezier(.4,0,.2,1)` | 柔和 |
| `--blora-easing-overshoot` | `cubic-bezier(.34,1.56,.64,1)` | 微弹 — 仅 FAB/Message 等 |

`--blora-ease`、`--blora-ease-soft`、`--blora-ease-overshoot` 是历史别名；新代码使用 `--blora-easing-*`。

### 7.2 时长 · Duration

| Token | 时长 | 用途 |
|-------|------|------|
| `--blora-duration-fast` | 160ms | 颜色/边框/hover |
| `--blora-duration-base` | 260ms | 位移/显隐默认 |
| `--blora-duration-slow` | 420ms | 抽屉/折叠 |
| `--blora-duration-emphasis` | 700ms | 需要额外关注的强调动画 |

`--blora-dur-fast` / `--blora-dur-base` / `--blora-dur-slow` / `--blora-dur-emphasis` 是历史别名。组件 CSS 一律写 `--blora-duration-*`，禁止 `transition: all`。

### 7.3 组件动效

- **FAB 浮起** FAB hover 时 `scale(1.12)`，主色按钮的悬停浮起。
- **状态点呼吸** `.blora-dot[data-pulse]` — 在线状态的 2s 呼吸；放在 `.blora-avatar-wrap` 里时自动贴在头像右下角。

### 7.4 reduced-motion

一切动画在 `prefers-reduced-motion: reduce` 下降级至 0.01ms。**强制要求**。

---

## 八 · 图标规范

- **风格**：Lucide 线性图标，`stroke-width: 2`、圆端圆角（`stroke-linecap: round`）。
- **尺寸**：默认 22px，按钮内 16–18px，导航 20px。
- **颜色**：继承 `currentColor`，hover/active 状态按组件规则使用主色。
- **引入方式**：
  - 组件内的图标由组件自己生成（例如 `.blora-button[data-icon="plus"]`、`<blora-speed-dial-action icon="upload">`）；
  - 业务代码需要图标时调用 `createBloraIcon(name, size)`；
  - 默认包只含常用图标，需要其他 Lucide 图标时加载一次 `@bloret-crew/blora-design/icons-full`（CDN 用 `icons-full.global.js`）。
- **禁止**：Emoji、图标字体、`‹ › × ★ → +` 等文本字符、从其他组件库复制的 SVG。

---

## 九 · 可访问性 · Accessibility

### 9.1 对比度

所有正文与背景对比度 ≥ **4.5:1**（WCAG AA）；大字 ≥ 3:1。默认 Coral 下应满足 AA；换肤后以实际令牌复验：
- `text-emphasis` / `background`、`text-muted` / `background`、`primary` / `background` 需 ≥ 4.5:1（正文/可点控件）
- `text-subtle` / `background` 通常不足 4.5:1 — **仅用于非文本装饰或大号辅助内容**

### 9.2 焦点

`:focus-visible` 一律 `outline: 2px solid var(--blora-primary); outline-offset: 2px;` 不移除。

### 9.3 触摸目标

可点击元素 ≥ 40×40px。移动端建议 ≥ 44×44。

### 9.4 键盘

- 模态 / 抽屉 / 命令面板：`Esc` 关闭；打开时焦点移入浮层、关闭后归还；`Tab` 圈禁于浮层内
- 命令面板 `Ctrl/⌘ + K` 唤起
- 标签页：方向键 / Home / End 切换；树：`Enter` / `Space` 展开与选中（`role` 与 `aria-*` 由组件自动管理）
- 复选 / 单选 / 开关 / 滑块以原生 input 为底，天然键盘可达
- 下拉、分段、评分、分页、范围滑块由对应组件提供键盘操作（方向键、Home/End、Enter/Space、Esc）；业务不要为了"键盘可用"改回裸原生控件

### 9.5 动效降级

见 7.4。

---

## 十 · 暗色模式

Blora Design 支持浅色、深色和跟随系统三种状态，全部由根元素属性驱动：

| 状态 | 根元素 | 写法 |
|------|--------|------|
| 浅色 | `<html data-blora-color-scheme="light">` | `applyColorScheme("light")` |
| 深色 | `<html data-blora-color-scheme="dark">` | `applyColorScheme("dark")` |
| 跟随系统 | 不设置 `data-blora-color-scheme` | 移除该属性，`tokens.dark.css` 按 `prefers-color-scheme` 生效 |

`applyColorScheme()` / `applyTheme()` 来自 `@bloret-crew/blora-design-theming`；只用核心包时，同时引入 `tokens.dark.css` 并直接设置属性即可。首屏恢复用户选择时使用 `getThemeBootScript()`（见 [`guide.md`](./guide.md) 第 5 节）。

深色下 Coral 的关键色值：页面底 `#17161C`、主文字 `#F8F2F4`、主色 `#D18A94`。

**不另写组件样式**，所有组件通过 token 自动适配；业务 CSS 里出现 `.dark`、`@media (prefers-color-scheme: dark)` 或第二套颜色即视为违规。

---

## 十一 · 内容与文案

界面文案宜简短、清楚、直接，避免空泛口号。

- **标题**：简洁直白，避免堆砌修饰。
- **正文**：使用现代白话，优先表达任务、状态与下一步操作。
- **按钮**：动词 + 宾语，2–4 字为佳。"保存""新建"优于文学化的表达。
- **空状态**：用"暂无数据"等通用表达即可，配合辅助操作的清晰指引。
- **错误**：陈述事实 + 给出下一步，不指责用户。

---

## 十二 · 设计交付清单

设计稿交付前，逐项核对：

- [ ] 色板仅取自 token，无自定义色
- [ ] 主色面积 ≤ 5%
- [ ] 字体仅取自展示、UI 与等宽字族令牌，字阶仅取自 token
- [ ] 间距取自 12 级，无任意值
- [ ] 圆角取自 token，表单控件遵循统一胶囊曲率
- [ ] 阴影 ≤ shadow-4，无重投影
- [ ] 动效时长在 token 范围内
- [ ] 焦点态、禁用态、hover 态、error 态四态齐全
- [ ] 暗色模式可读
- [ ] 移动端 ≥ 320px 不破版

---

## 十三 · 组件选择与组合

### 13.1 优先使用原生语义

- 输入、选择、文件、开关、Swap、Filter 与 Diff 应保留原生 `input`，自定义视觉不能替换键盘和表单语义。
- Fieldset 必须使用 `<fieldset>` / `<legend>`，Kbd 使用 `<kbd>`，Footer、Hero、Sidebar 优先采用对应语义元素。
- 无原生语义的展开组件由对应 Composite CE 同步 `aria-expanded`、焦点与 Esc 行为；业务不重复绑定同一状态。

### 13.2 组件组合边界

- Sidebar Layout 负责应用级页面结构；Drawer 负责临时任务面板，两者不可因外观相似而互换。
- Megamenu 用于多分组全局导航；普通操作集合继续使用 Dropdown。
- Dock 适合 3–5 个高频一级入口；桌面信息密集型应用优先 Navbar 或 Sidebar。
- 搜索框使用 `<blora-search>`；需要提交时把它放进原生 `<form role="search">`，不要自己拼放大镜按钮或复用组件内部 class。
- Deck 只表现有明确前后顺序的同类对象，不用于隐藏大量可操作内容。
- 页面级组合（卡片嵌套层数、区块间距、统计区、资源列表、设置表单）遵守 [`patterns.md`](./patterns.md)。

### 13.3 可选视觉效果

- Text Rotate 只用于短句轮换，间隔不低于 1200ms；关键信息必须始终静态可见。
- Browser、Code、Phone、Window Mockup 必须承载真实内容预览，不作为空洞装饰。
- 所有效果必须通过语义令牌取色，并在 `prefers-reduced-motion: reduce` 下静止。

---

> 语义清晰、默认可用、按需扩展。
