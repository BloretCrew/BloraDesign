# 1.x 与 2.x 已知差异

> 记录 Blora Design 2.0 与 1.x 展示页（已归档：`D:\MyFiles\Documents\projects\blora-design\legacy\showcase-v1.html`）之间**有意**或**已审核**的可见视觉/行为差异。  
> 格式：组件、1.x、2.0、原因、审核状态。

## 格式

```
### [组件名] - [简短描述]

- **组件**：…
- **1.x 表现**：…
- **2.0 表现**：…
- **改变原因**：a11y / RTL / bug 修复 / WCAG / 架构 / 其他
- **审核状态**：pending / approved / rejected
```

---

### Button - 加载态保留文字

- **组件**：button
- **1.x 表现**：`.blora-btn.is-loading` 把文字设为透明，只显示居中转圈。
- **2.0 表现**：`data-loading` 在文字左侧显示转圈，文字保持可见；纯图标按钮仍只显示转圈。
- **改变原因**：可用性（加载中仍需知道按钮在做什么）
- **审核状态**：approved

### Drawer - 打开时主机也带 open

- **组件**：drawer
- **1.x 表现**：`.blora-drawer.is-open` 就是可见层。
- **2.0 表现**：`blora-drawer:not([open])` 在升级前隐藏主机。`open()` 同时给主机和内部 `.blora-drawer` 打上 `open`，否则按钮点了内部已开、页面仍是 `display: none`。
- **改变原因**：bug 修复
- **审核状态**：approved（用户人工批准 2026-08-19）

### Transfer - 箭头在圆形钮里光学居中

- **组件**：transfer / icons
- **1.x 表现**：窄宽时整颗按钮 `rotate: 90deg`，Lucide 开口箭头在圆里会显得偏轴。
- **2.0 表现**：只旋转 SVG；圆形钮锁成正方形。Chevron 路径向尖端微调，使圆钮里的箭头视觉居中。
- **改变原因**：bug 修复
- **审核状态**：approved（用户人工批准 2026-08-19）

### Indicator - 不被父级宽度拉开

- **组件**：indicator
- **1.x 表现**：指示器跟宿主走，角标钉在角上。
- **2.0 表现**：`.blora-indicator` 的 `max-width` 锁在 `max-content`，父级再设宽度也不会把角标甩到盒子另一头。
- **改变原因**：bug 修复
- **审核状态**：approved（用户人工批准 2026-08-19）

### Card - content 变体给叠层填满卡面

- **组件**：card / deck
- **1.x 表现**：Deck 子项就是一张 `.blora-card`，标题直接写在卡面上，没有再套一层浅底内框。
- **2.0 表现**：新增 `data-variant="content"`：去掉内边距并裁切溢出，内容铺满卡面。展示页 Deck 用这个变体，不再套 `data-showcase-slide` 浅底框。
- **改变原因**：bug 修复
- **审核状态**：approved（用户人工批准 2026-08-19）

### Button group / Join - 统一焊接规则

- **组件**：button / join
- **1.x 表现**：`.blora-button-group` 和 `.blora-join` 是两套独立的焊接逻辑，圆角值、纵向支持、高度对齐各写各的。
- **2.0 表现**：横向按钮的焊接规则（margin、border-radius、corner-shape、等高、hover / focus 提升）统一写在 `button.css`，两个容器共用同一组选择器；Join 继续独有纵向 `data-orientation` 和 button + input 混合能力，`join.css` 只保留非按钮子元素规则。
- **改变原因**：一致性
- **审核状态**：approved（用户人工批准 2026-08-19）

### Typography - 放弃 Avenir，改平台系统字体栈

- **组件**：tokens / typography
- **1.x 表现**：`--blora-font-sans / heading` 栈首位是 `Avenir / Avenir Next`，Apple 设备渲染 Avenir，其他平台各自回退。
- **2.0 表现**：改为 `system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Noto Sans SC", "PingFang SC", "Microsoft YaHei", sans-serif`。Apple 设备用 San Francisco / 苹方，Windows 用 Segoe UI / 微软雅黑，Android 用 Roboto，Linux 用 Noto Sans SC。
- **改变原因**：其他（统一平台原生字体观感）
- **审核状态**：approved（用户人工批准 2026-08-19）

### Theming - 深浅色切换后主题仍跟着走

- **组件**：theming
- **1.x 表现**：配色写在 `:root` / `:root.blora-dark`，切深浅色不会把主题打回默认 Coral。
- **2.0 表现**：`data-blora-color-scheme` 只留在 `:root`。浅色/深色令牌选择器也只匹配 `:root`，避免写到 `body` 后把 Coral 语义令牌盖在主题上面。
- **改变原因**：bug 修复
- **审核状态**：approved（用户人工批准 2026-08-19）

### Dialog - 打开时挂到 body，遮罩盖满视口

- **组件**：dialog
- **1.x 表现**：模态挂到 portal / body，遮罩相对视口。锁滚动用 `position: fixed` 冻结页面，避免 `overflow: hidden` 打断 sticky 顶栏。
- **2.0 表现**：`show()` 把主机挂到 `document.body` 并 `showPopover()` 进入顶层，遮罩按视口铺满。滚动锁与 1.x 相同：冻结 `body` 而不是写 `overflow: hidden`。滚动到顶或滚下去，navbar 都留在视口顶部、叠在遮罩后面。
- **改变原因**：bug 修复
- **审核状态**：approved（用户人工批准 2026-08-19）

### Tooltip - 四向放置

- **组件**：tooltip
- **1.x 表现**：浮层主要在触发器上方，靠 JS 做横向避让。
- **2.0 表现**：`placement` 支持 `top` / `bottom` / `start` / `end`，以及物理 `left` / `right`。
- **改变原因**：架构（侧向提示是真实能力，不是皮肤）
- **审核状态**：approved（用户人工批准 2026-08-19）

### Button - 内部内容无法撑高

- **组件**：button
- **1.x 表现**：高度由 padding + 内容决定，大图标或图片会把同尺寸按钮撑得不一样高。
- **2.0 表现**：高度锁在 `--blora-button-height`（字号 + 上下 padding + 双边框）。图标尺寸走 `--blora-button-icon-size`（默认 `auto`，尊重 `createBloraIcon` 的宽高）；`data-size="icon"` 默认为 `1.125rem`。内部内容不能撑高按钮，但不会被压成 `1em`。
- **改变原因**：架构（同 `data-size` 必须等高，不因插图/图标变化）
- **审核状态**：approved（用户人工批准 2026-08-19）

### Checkbox - 对勾垂直居中微调

- **组件**：checkbox
- **1.x 表现**：对勾在 grid 居中下视觉略偏下。
- **2.0 表现**：`::after` 使用 `rotate(-45deg) scale(n)`，与 transfer 行复选框统一。
- **改变原因**：bug 修复
- **审核状态**：approved

### Sidebar layout - seamless 窄屏是视口抽屉

- **组件**：sidebar-layout
- **1.x 表现**：`max-width: 900px` 时 aside / mask 为 `position: fixed`，从视口左侧滑出。
- **2.0 表现**：`variant="default"` 抽屉仍叠在卡片内部（演示卡 / Storybook）。`variant="seamless"` 页面壳不再套一层圆角卡片，抽屉回到视口 `fixed`，并取消 `isolation`，使侧栏叠在 navbar 之上。
- **改变原因**：bug 修复（页面导航被收进内容卡）
- **审核状态**：approved（用户人工批准 2026-08-19）

### Sidebar layout - sticky 滚动裁切是渐变模糊边

- **组件**：sidebar-layout
- **1.x 表现**：sticky 侧栏滚出视口时，条目被硬裁切。
- **2.0 表现**：非抽屉的 sticky aside 在顶底加渐变模糊（越靠边越糊），只在该方向还有溢出时出现；移动端抽屉保持完全不透明，滚动后不使用顶底透明过渡。
- **改变原因**：可用性（裁切边缘更柔）
- **审核状态**：approved（用户人工批准 2026-08-19）

### Sidebar layout - seamless 抽屉开关是左下 FAB

- **组件**：sidebar-layout
- **1.x 表现**：窄屏开关是内容区左上角的小 outline 按钮。
- **2.0 表现**：`variant="seamless"` 使用正式 `.blora-fab[data-variant="surface"]`，固定在视口左下；`toggle-label` 作为 `aria-label`。卡片变体仍用 outline 文字钮。
- **改变原因**：可用性（页面级导航开关不应占掉标题行）
- **审核状态**：approved（用户人工批准 2026-08-19）

### Checkbox - 全选组纵向间距

- **组件**：checkbox
- **1.x 表现**：选项是 `inline-flex`，放进 `.blora-stack` 后仍会横排贴在一起。
- **2.0 表现**：`blora-checkbox[data-group]` 内选项纵向排列，间距 `--blora-space-3`。
- **改变原因**：bug 修复
- **审核状态**：approved（用户人工批准 2026-08-19）

### Radio - 内圆点几何居中

- **组件**：radio
- **1.x 表现**：内圆点用 `inset: 0; margin: auto` + `scale()`，非整倍 DPR / 125% 缩放下会偏 1px。
- **2.0 表现**：`top/left: 50%` + `translate(-50%, -50%)`，外圈 `box-sizing: border-box` + grid 居中。
- **改变原因**：bug 修复
- **审核状态**：approved（用户人工批准 2026-08-19）

### Pagination - 上一页/下一页按钮放大 50%

- **组件**：pagination
- **1.x 表现**：导航按钮约 2em。
- **2.0 表现**：`.blora-pagination__nav` 更大触控目标。
- **改变原因**：可用性
- **审核状态**：approved

### Comment - 改为 slot 布局壳

- **组件**：comment
- **1.x 表现**：作者手写 `.blora-comment` 树；2.0 前期 CE 用 `author` / `time` / `likes` 等属性生成固定操作。
- **2.0 表现**：`<blora-comment>` 只负责布局。头像、作者、时间、正文、操作通过 slot 塞入现有组件。
- **改变原因**：架构（评论内容因产品而异，不应收成底层属性）
- **审核状态**：approved（用户人工批准 2026-08-19）

### Tag - 去掉 solid 变体

- **组件**：tag
- **1.x 表现**：`.blora-tag--solid` 是深色实心胶囊，和 Badge 文字状态条几乎同形。
- **2.0 表现**：删除 `solid`。实心状态用 Badge；Tag 只保留浅底描边分类（含可关闭）。
- **改变原因**：其他（Badge / Tag 职责分开）
- **审核状态**：approved（用户人工批准 2026-08-19）

### Badge - 语义文字徽标内边距对齐 Tag

- **组件**：badge
- **1.x 表现**：所有徽标共用 `height: 1.5em; padding: 0 0.4em`，长单词左右几乎贴边。
- **2.0 表现**：数字角标 / 圆点 / 圆形仍用 1.x 紧凑尺寸；`neutral` / `info` / `success` / `warning` / `danger` 文字徽标使用与 `.blora-tag` 相同的 `0.2em 0.7em` 内边距。
- **改变原因**：其他（文字徽标可读性）
- **审核状态**：approved（用户人工批准 2026-08-19）

### 状态组件 - 小字号文字满足 WCAG AA

- **组件**：tag、badge、alert、sidebar navigation、thread composer
- **1.x 表现**：部分语义状态直接把较浅的状态色作为小字号文字色；在浅色主题、warning 金色和部分辅助文字场景中会低于 4.5:1。
- **2.0 表现**：Tag / Alert 的语义色保留在浅底、边框和图标上，文字使用高对比正文 token；Warning Badge 的实底向正文色轻微混合；Sidebar 当前项与 Thread composer 标签使用高对比文字。六套主题的明暗模式均由组件级和真实 BBBS 页面全文本浏览器门禁验证。
- **改变原因**：WCAG 2.2 AA / 可读性修复
- **审核状态**：approved（用户反馈并确认需统一修复，2026-08-25）

### Segmented - 未选中项文字对比度

- **组件**：segmented
- **1.x 表现**：未选中项使用浅色 muted 文字，在 sunken 底色上部分主题只有约 3.6:1 – 4.3:1。
- **2.0 表现**：未选中项改用正文级 secondary 文字色，六套主题明暗模式均达 4.5:1；选中项保持 emphasis 色以维持层级。
- **改变原因**：WCAG 2.2 AA / 可读性修复
- **审核状态**：approved（真实 BBBS 页面全文本门禁发现，2026-08-25）

### Segmented - 裁切胶囊内焦点环内缩

- **组件**：segmented
- **1.x 表现**：选项按钮焦点环向外绘制；胶囊容器 `overflow-x: auto` 裁切时，环会顶到边缘被切掉一点。
- **2.0 表现**：选项按钮 `:focus-visible` 焦点环内缩（同 Tabs / Sidebar Nav），在裁切胶囊里四边完整可见。
- **改变原因**：WCAG / a11y 可见性修复
- **审核状态**：approved（键盘聚焦实测发现，2026-08-27）

### Pagination - 当前页悬浮反馈弱化

- **组件**：pagination
- **1.x 表现**：当前页悬浮仍可能应用普通页码的浅色背景，产生明显换色。
- **2.0 表现**：当前页悬浮保持强调色背景和前景色，仅轻微放大至 `1.06`。
- **改变原因**：其他（降低已选状态的悬浮干扰）
- **审核状态**：approved

### Input / Textarea / Select / Tags Input - 连贯圆角矩形

- **组件**：input、textarea、select 触发器、tags-input
- **1.x 表现**：`border-radius: 14px` 圆形弧。
- **2.0 表现**：与按钮同一套 `--blora-radius-lg` + `corner-shape: superellipse(1.2)`。卡片、面板、弹层、下拉、OTP 等矩形壳同样套超椭圆；圆形与胶囊除外。
- **改变原因**：其他（圆角衔接）
- **审核状态**：approved（用户人工批准 2026-08-19）

### Button - 圆角与直线用超椭圆衔接

- **组件**：button
- **1.x 表现**：`border-radius: 14px` 圆形弧，接到长边时曲率突变。
- **2.0 表现**：半径改为 `--blora-radius-lg`（18px），支持时使用 `corner-shape: superellipse(1.2)`，比 14px 超椭圆更圆，仍保持弧线与直线顺接。`data-size="icon"` 与 Speed Dial 圆形触发器强制 `corner-shape: round`，避免被拧成超椭圆。
- **改变原因**：其他（圆角衔接）
- **审核状态**：approved（用户人工批准 2026-08-19）

### Pagination - 单侧省略号改为扩窗补位

- **组件**：pagination
- **1.x 表现**：靠近首页/末页时省略号仍占位（或只藏一页），`1` 与窗口之间留空。
- **2.0 表现**：省略号若只会藏住紧邻首页/末页的那一页，则不渲染该省略号，固定窗口 +1 补齐，例如 `1 2 3 4 5 6 7 … 12`。
- **改变原因**：其他（避免空白占位）
- **审核状态**：approved（用户人工批准 2026-08-19）

### Tabs - Pills 底部裁切修复

- **组件**：tabs
- **1.x 表现**：Pills 底部完整。
- **2.0 表现**：曾出现 1px 裁切；以修复后 Story 为准。
- **改变原因**：bug 修复
- **审核状态**：approved

### Calendar - 选中日空心、今日底点

- **组件**：calendar
- **1.x 表现**：选中日实心填充等（以冻结展示页为准）。
- **2.0 表现**：选中日空心描边 + 主色字；今日为数字下方圆点。
- **改变原因**：与当前产品 QA 目标对齐（非静默改版）
- **审核状态**：approved（人眼 2026-08-02）

### Collapse / Accordion - 测量高度动画

- **组件**：collapse / accordion
- **1.x 表现**：展开模型与 2.0 实现细节可能不同。
- **2.0 表现**：关闭 `max-height: 0`，打开使用测量高度 token；去掉过大硬顶。
- **改变原因**：bug 修复（展开对称、避免假 400px 顶）
- **审核状态**：approved

### Table - 排序指示默认隐藏

- **组件**：table
- **1.x 表现**：表头排序箭头可见性可能始终显示。
- **2.0 表现**：默认隐藏；hover 显示 ⇅；已排序显示 ▲/▼。
- **改变原因**：与 QA 目标对齐
- **审核状态**：approved

### Select - 多选标签复用官方 Tag

- **组件**：select
- **1.x 表现**：`.blora-select-tag` 为灰底小圆角芯片。
- **2.0 表现**：Shadow 内复用官方 `.blora-tag[data-variant=primary]` / `.blora-tag__close`，与 Tags Input 一致。
- **改变原因**：与正式 Tag 表面统一（非另造一套芯片）
- **审核状态**：approved（用户人工批准 2026-08-19）

### Table - 行选内置

- **组件**：table
- **1.x 表现**：`data-blora-selectable` 由 1.x JS 注入选择列。
- **2.0 表现**：同等由 `createTableController` 注入 `blora-checkbox` + 批量条；**不要求**业务拼装。
- **改变原因**：架构（headless controller）
- **审核状态**：approved

### Popover - 相对触发器左对齐

- **组件**：popover
- **1.x 表现**：可能居中于触发器。
- **2.0 表现**：面板相对触发器左对齐（`left: 0`）。
- **改变原因**：与 QA 目标对齐
- **审核状态**：approved

### List - 无外框

- **组件**：list
- **1.x / 2.0**：列表根节点无外边框；需要卡片感时与 Card 组合。
- **改变原因**：有意设计（intentional CSS-only 壳）
- **审核状态**：approved

### API 表面 - 无全局 Blora 单例

- **组件**：package entry
- **1.x 表现**：`Blora.init` / `Blora.toast` / `Blora.table.*` 全局对象。
- **2.0 表现**：ESM 具名导出 + Composite CE；仅 Table / Form 等开放数据能力保留 headless controller，不提供 1.x runtime compatibility layer。
- **改变原因**：架构（2.0 重构）
- **审核状态**：approved

### Palette Picker - 小号说明文字对比度

- **组件**：theming / palette-picker
- **1.x 表现**：菜单提示和配色说明使用低对比度 subtle 文本。
- **2.0 表现**：提示和说明使用 emphasis 文本，保证白色与选中 tint 背景上的 12px 文字符合 WCAG 2.2 AA。
- **改变原因**：WCAG / a11y
- **审核状态**：approved（用户人工批准 2026-08-19）

### Sidebar Navigation - 当前项只高亮文字

- **组件**：sidebar-nav
- **1.x 表现**：当前项使用主题色文字、字重和主题色浅底。
- **2.0 表现**：当前项只使用主题色文字和字重；浅底仅作为 hover 反馈。
- **改变原因**：统一 Storybook、Showcase 与正式组件的状态层级，避免当前态与 hover 态竞争。
- **审核状态**：approved（用户确认 2026-08-10）

### Sidebar Navigation - 裁切侧栏内焦点环内缩

- **组件**：sidebar-nav
- **1.x 表现**：导航链接焦点环向外绘制；链接铺满可滚动/裁切侧栏宽度时，被 `overflow-x: hidden` 裁切的一侧会切掉部分焦点环（实测左缘被切约 4px）。
- **2.0 表现**：导航链接 `:focus-visible` 焦点环内缩，与 Tabs 一致，在 `overflow-x: hidden` 的侧栏里四边完整可见。
- **改变原因**：WCAG / a11y 可见性修复
- **审核状态**：approved（键盘聚焦实测发现，2026-08-25）

### Accordion / Collapse - 完整 disclosure 关联

- **组件**：accordion / collapse
- **1.x 表现**：标题按钮和内容区域没有稳定的双向 ID 关联，关闭内容仍可能留在辅助技术可访问树中。
- **2.0 表现**：CE 自动生成原生标题按钮、`aria-expanded`、`aria-controls`、内容 `region`、`aria-labelledby` 与同步的 `aria-hidden`。
- **改变原因**：WCAG / a11y bug 修复
- **审核状态**：approved（用户人工批准 2026-08-19）

### Thread - 评论流单一职责与长内容自动折叠

- **组件**：thread add-on
- **1.x / 早期 2.0 表现**：同时提供 `.blora-post*` 主帖 + replies 整组折叠和评论流两套高度重合的结构；折叠按钮控制整组回复。
- **当前 2.0 表现**：删除旧主帖 / replies 模式和根 Headless controller；Thread 由 `<blora-thread-comment>` 与 `<blora-thread-composer>` 两个开放 Composite CE 组成，继续复用核心 Timeline。评论 CE 按正文实际高度独立折叠，正文底边使用 `mask-image` 渐隐和高度动画；Composer CE 提供同行工具胶囊、编辑 / 预览切换、标准输入表面和操作区，工具与提交行为由消费者定义。
- **改变原因**：产品职责收口；匹配 Bloret BBS 长评论阅读行为，同时复用核心 Timeline 的顺序、连线和图标节点。
- **审核状态**：approved（用户确认 2026-08-20）

### Palette Picker - 弹层文字使用正常行高

- **组件**：theming / palette-picker
- **1.x 表现**：无对应 CE 宿主继承问题。
- **2.0 表现**：CE 宿主和菜单显式使用正式 normal 行高，标题、提示、配色名称与说明保持独立文本行。
- **改变原因**：修复 `line-height: 0` 从宿主继承到 light DOM 弹层造成的文字重叠。
- **审核状态**：approved（用户人工批准 2026-08-19）

### Palette Picker - 弹层挨着触发器、窄屏不再固定在顶部

- **组件**：theming / palette-picker
- **此前（≤560px）表现**：菜单作为顶部固定面板（top-sheet）弹出，底部触发器的菜单会远离按钮；横向也不钳制，窄列下可能溢出。
- **当前表现**：`placeMenu` 在任意断点都运行，菜单上下贴着触发器翻开、超出视口垂直钳制滚动；横向钳制在视口内；菜单改为 top-layer `popover`，即使抽屉侧栏带有 `transform`（作为 fixed 元素的包含块）也不会被抽屉裁切。
- **改变原因**：bug 修复（菜单未挨着按钮、被抽屉裁切）
- **审核状态**：approved（用户反馈，2026-08-27）

### Tabs - 正式 full-bleed 面板模式

- **组件**：tabs
- **1.x / 2.0 默认表现**：普通面板在导航下保留 `space-5` 顶部间距。
- **2.0 新增表现**：`<blora-tabs flush>` 移除 CE 自有 panel inset，供 Preview、代码区等自行持有完整背景和间距的内容使用。
- **改变原因**：避免全宽内容与 Tabs 默认间距叠加形成异色空带，同时不破坏普通文字面板的 v1 视觉基线。
- **审核状态**：approved（用户人工批准 2026-08-19）

### Tabs - 指示线与焦点环视觉分离

- **组件**：tabs
- **1.x / 2.0 原表现**：选中指示线为 2px；键盘焦点环在 flush 容器中可能与指示线视觉粘连。
- **2.0 修正表现**：水平与垂直选中指示线统一为 3px，焦点环使用 6px 安全内缩，与指示线保留清晰间隔。
- **改变原因**：WCAG / a11y 可见性与视觉层级修复
- **审核状态**：approved（用户确认 2026-08-12）

### Dialog - 内缩分界线

- **组件**：dialog
- **1.x / 2.0 原表现**：Header 与 Footer 分界线贯穿面板全宽。
- **2.0 修正表现**：分界线与内容列对齐、左右内缩 `space-6`；Header 与 Footer 保持原有垂直内边距。
- **空 Footer 行为**：未提供 footer 内容时，操作区、底部分界线及其占位高度自动隐藏；动态 slot 内容会实时同步。
- **改变原因**：视觉层级优化
- **审核状态**：approved（用户确认 2026-08-12）

### Button Group - 稳定悬浮与完整焦点环

- **组件**：button / button-group
- **1.x / 2.0 原表现**：组内按钮沿用独立按钮的上浮动效；横向滚动容器可能裁切 v1 外置焦点环的上下边缘。
- **2.0 修正表现**：组内 hover/active 仅使用背景反馈、不发生位移；滚动容器预留并抵消焦点安全区，完整显示外置焦点环且不改变布局占位。
- **改变原因**：交互稳定性与 WCAG / a11y 可见性修复
- **审核状态**：approved（用户确认 2026-08-12）

### Navbar - 毛玻璃背景更加通透

- **组件**：navbar
- **1.x 表现**：毛玻璃层使用 82% 表面色混合。
- **2.0 表现**：毛玻璃层使用 72% 表面色混合，保留 20px 模糊、饱和度、边框和前景对比度。
- **改变原因**：其他（经产品要求降低不透明度）
- **审核状态**：approved

### Navbar - 仅图标品牌焦点环为纯圆

- **组件**：navbar
- **1.x 表现**：品牌链接圆角为 md 半径；窄屏标题隐藏后只留圆形 logo，焦点环仍是 md 圆角矩形。
- **2.0 表现**：窄屏（≤720px 标题隐藏）时品牌链接圆角改为 `50%`，焦点环与圆形 logo 一致。
- **改变原因**：bug 修复（焦点环与资产形状不一致）
- **审核状态**：approved（用户反馈，2026-08-27）

### Coral Danger / 各主题浅色 Warning - 语义色可区分

- **组件**：tokens（coral / dusk / graphite / circuit / indigo）→ button、badge、tag、alert、result、message、notification
- **1.x 表现**：Coral 的 danger（浅 `#9E5559`、深 `#D27779`）与主色（`#9F5964` / `#D18A94`）色相只差 6–7°，危险按钮与主按钮几乎同色；浅色 warning（`#806C4F` 等）是偏橄榄的灰褐色，读起来不像警告。
- **2.0 表现**：Coral danger 改为砖红 `#AF4A3F`（深色 `#E0715B`），与主色拉开色相和饱和度；coral、dusk、graphite、circuit、indigo 的浅色 warning 统一为琥珀 `#8C6429`（深色值不变）。Warning Badge 直接使用 warning 令牌，不再与主文字色混合。
- **改变原因**：可用性（危险操作必须一眼区分）+ WCAG（白字 ≥ 5:1，画布上 ≥ 4.5:1，六套主题明暗均过对比度门禁）
- **审核状态**：approved（用户批准 2026-09-30）

### Card / Stack / Field / Statistic - 页面组合与排版收口

- **组件**：card、foundations/stack、field、statistic
- **此前表现**：卡片没有正式标题操作行和说明类；Stack 间距被组件 margin 重置覆盖；Field 在布局容器内叠加底部间距；中文统计标签沿用拉丁大写字距，标签文字对比度不足。
- **当前表现**：Card 提供已登记的 header、desc 和 sm 尺寸；Stack 在 utilities 层统一控制纵向间距，Field 在 Stack/Grid 中取消重复 margin；中文统计标签使用正常字距，标签使用 text-muted 令牌。
- **改变原因**：页面组合缺口、布局和 WCAG 缺陷修复；公共 Card 能力已经同步 contract 和 API 生成流程。
- **审核状态**：已检查（2026-10-01，实际 Chromium 浅深色组件截图及 390px/桌面页面范式逐张检查）。

### List - 窄屏状态与操作不再挤压正文

- **组件**：list
- **此前表现**：390px 页面中，头像、状态 Badge 和操作按钮将 meta 挤成窄列，GitHub 标题与状态重叠，关联日期逐字换行。
- **当前表现**：沿用既有 560px 窄屏断点，列表行允许换行；meta 保留 12ch 的正文基准宽度，状态和操作空间不足时换到下一行。桌面布局不变。
- **改变原因**：响应式布局 bug 修复。
- **审核状态**：已检查（2026-10-01，浅深色手机页面范式；回归测试在修复前的构建样式上失败）。

### Showcase - 预览组合与移动导航

- **组件**：examples/showcase-v2
- **此前表现**：单个按钮被预览列拉宽，展示行偏在居中列的一侧，卡片和表单间距重复；WebKit 打开移动导航时，首项 focus 的滚动偶尔覆盖当前项的定位。
- **当前表现**：独立控件保留固有宽度，展示行居中，页面范式占用预览宽度；移动导航在打开帧和 transform 过渡结束后定位当前路由。
- **改变原因**：展示页布局和移动导航可见性 bug 修复。
- **审核状态**：已检查（2026-10-01，实际 Chromium 桌面和手机截图；WebKit 浏览器回归）。

### Tag / Alert - 语义变体提高区分度，Tag 新增 danger

- **组件**：tag、alert
- **1.x 表现**：Tag 语义变体底色 8%、边框 25%、文字统一为强调文字色；Alert 底色 6%。在低饱和配色下 info / success / neutral 几乎一样，暗色下 Alert 四态难以区分。
- **2.0 表现**：Tag 底色 15%（warning 16%）、边框 45%，文字向状态色靠拢（与主文字色混合保证 AA），新增 `data-variant="danger"`；Alert 底色 11–13%、边框 32–38%。
- **改变原因**：语义表达（状态不能只剩边框差异）；对比度门禁覆盖全部主题
- **审核状态**：approved（用户批准 2026-09-30）

### Alert / Result / Message / Notification - 状态图标统一为圆形线框

- **组件**：status-icon（alert、result、message、notification）
- **1.x 表现**：success 用裸 `check`、danger 用裸 `x`，warning / info 却是带圆圈的图标，同一组状态像两套图标。
- **2.0 表现**：success `circle-check`、danger/error `circle-x`、warning `circle-alert`、info `info`，均为圆形线框 Lucide 图标（默认图标集新增 `circle-x`）。
- **改变原因**：视觉一致性
- **审核状态**：approved（用户批准 2026-09-30）

### Tabs(pills) / Avatar / Navbar / 表单禁用态 - 缺陷修复

- **组件**：tabs、avatar、navbar、select、textarea、button、copy
- **1.x 表现**：胶囊 Tabs 的滑动指示块画在选中文字上方，选中项只剩空色块；头像角标和在线点在拉伸的行里会飘到最右；窄容器里导航链接逐字换行；禁用 Select 只是半透明；禁用 Textarea 仍可拖拽；方形图标按钮因 18px 圆角看起来是圆的；Copy 图标对比度约 2.7:1；默认头像字母约 3.7:1。
- **2.0 表现**：指示块位于标签下层；`.blora-avatar-wrap` 收缩包裹头像、在线点贴在头像右下角；导航链接不换行，受限时菜单横向滚动；禁用 Select 与禁用 Input 同为内凹底；禁用 Textarea 不可拖拽；方形图标按钮用 `radius-md`；Copy 图标 ≥ 3:1；默认头像字母 ≥ 4.5:1。
- **改变原因**：bug 修复 / WCAG
- **审核状态**：approved（用户批准 2026-09-30）
