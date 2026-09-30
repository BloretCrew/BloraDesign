# Blora Design 2.0 · 页面范式与组合规则

> 给人和 AI Agent：**迁移或新写任何页面之前先读完这一篇**。组件怎么写看
> [`migration/from-any-ui-to-blora-design.md`](./migration/from-any-ui-to-blora-design.md)；
> 本文解决"组件都对了，页面却很难看"的问题——表面层级、间距节奏、状态色和整页骨架。
> 文中每一段 HTML 只使用已发布的 class、标签和属性，并由测试与 `blora-lint` 校验。

## 0. 十条硬规则（先背下来）

1. **页面只写布局，外观全部来自组件。** 业务 CSS 只负责栅格、宽度、间距和定位；颜色、边框、圆角、阴影、字号由 Blora 组件和令牌提供。
2. **颜色只用 `--blora-color-*` 语义令牌。** 不存在 `--blora-primary`、`--blora-surface-1`、`--blora-text-muted`；不写十六进制、`rgb()`、Tailwind 颜色类。
3. **卡片最多一层。** 页面底 → 卡片，到此为止。卡片里的分组用列表、描述列表、分隔线、`data-variant="inset"` 内凹面组织，绝不再套一层 `.blora-card`。
4. **一个区域只有一个主按钮。** 其余用 `outline` / `ghost` / `text`；危险操作用 `danger`，并用 `<blora-popconfirm>` 或对话框确认。
5. **状态只用 Badge / Tag 的语义 variant。** 不自己写红绿蓝的"状态小块"，不用左侧彩色竖条表示状态。
6. **表单一律用 `<blora-field>`。** 标签、提示、错误、字数统计由 Field 生成，不手写 `<label>` 标题和红字。
7. **图标一律用 Lucide。** `data-icon="plus"` 写在 `.blora-button`、`.blora-badge` 或空的 `<span>` 上即可，`auto` 会自动填充；禁止 Emoji 和 `× → ★` 这类字符。
8. **旧 CSS 必须进 `@layer legacy`。** Blora 的样式都在 `@layer blora` 里，任何未分层的 `button {}`、`* {}`、`a {}` 都会盖掉所有组件（见第 1 节）。
9. **每个数据区都有加载、空、错误三态。** `.blora-skeleton` / `<blora-empty>` / `<blora-alert>`，外加操作反馈用 `message`。
10. **完成前运行 `npx blora-lint src`，零 error 才算完成**，然后在浅色、深色、390px 宽度下各看一遍。

## 1. 接入顺序与 CSS 层级

Blora 的全部样式声明在 `@layer blora.*` 中。浏览器规则是：**未分层的样式永远赢过分层样式，与选择器权重无关**。所以旧项目保留下来的全局样式（Tailwind preflight、`button { background: … }`、`* { margin: 0 }`、`a { color: inherit }`）会直接覆盖 Blora 组件——这是迁移后"按钮变形、输入框没边框、开关变方块"最常见的原因。

正确做法：在**所有样式之前**先声明层级顺序，旧样式放进最低的 `legacy` 层。

```css
/* src/styles/layers.css —— 必须是第一个被加载的样式 */
@layer legacy, blora;
```

```ts
// src/main.ts —— 导入顺序就是层级声明顺序
import "./styles/layers.css";
import "@bloret-crew/blora-design/blora.css";
import "@bloret-crew/blora-design/tokens.dark.css"; // 不用 theming add-on、又需要暗色时
import "@bloret-crew/blora-design-layout/layout.css"; // 使用侧栏布局时
import "@bloret-crew/blora-design/auto";
import "./styles/legacy.css"; // 文件内整体包在 @layer legacy { … } 里，或用 @import url(...) layer(legacy)
import "./styles/app.css"; // 新写的页面布局样式，保持未分层
```

- `legacy.css`：旧框架和旧页面的全部样式，整体包进 `@layer legacy { … }`。它们永远输给 Blora，迁移期间可以逐步删除。
- `app.css`：新写的页面布局。**保持未分层**，只写 class 选择器，只放布局属性和令牌，不写 `button`/`input`/`a` 这类元素选择器，不覆盖 `.blora-*` 的颜色、边框、圆角和内边距。
- 页面根节点：`<html lang="zh-CN">` + `<body class="blora-page blora-scope">`。
- 需要恢复用户主题时，在所有 CSS 之前输出 `getThemeBootScript()`（见 [`guide.md`](./guide.md) 第 5 节）。
- **Tailwind 项目**：v4 把第一行改成 `@layer legacy, theme, base, blora, components, utilities;`（preflight 在 `base`，必须排在 `blora` 前面）；v3 把 `@tailwind base` 放进 `@layer legacy { … }`，或关闭 `corePlugins.preflight`。Tailwind 只用于布局 utility，不给 Blora 组件加颜色、圆角、阴影类。

## 2. 令牌速查

| 用途                                | 令牌                                                                           |
| ----------------------------------- | ------------------------------------------------------------------------------ |
| 页面底 / 卡面 / 次级面 / 内凹面     | `--blora-color-surface-canvas` / `-default` / `-raised` / `-sunken`            |
| 标题 / 正文 / 强调正文 / 辅助       | `--blora-color-text-primary` / `-secondary` / `-emphasis` / `-muted`           |
| 禁用、占位                          | `--blora-color-text-disabled`                                                  |
| 边框颜色 / 边框简写                 | `--blora-color-border-subtle` / `border: var(--blora-border-subtle)`           |
| 主色                                | `--blora-color-action-primary-default` / `-hover`                              |
| 状态色                              | `--blora-color-status-success` / `-warning` / `-danger` / `-info` / `-neutral` |
| 间距（4/8/12/16/24/32/40/48/64px…） | `--blora-space-1` … `--blora-space-12`                                         |
| 圆角                                | `--blora-radius-xs` / `-sm` / `-md` / `-lg` / `-xl` / `-2xl` / `-full`         |
| 阴影                                | `--blora-shadow-1` … `--blora-shadow-4`                                        |
| 字号                                | `--blora-text-xs` … `--blora-text-5xl`                                         |

完整表格见 [`standards.md`](./standards.md)；令牌清单随包发布在 `@bloret-crew/blora-design/token-manifest.json`。

## 3. 布局原语（已发布的 class）

页面布局优先用这些 class，写不出来再写自己的 CSS。

| class                                                        | 作用                                                            |
| ------------------------------------------------------------ | --------------------------------------------------------------- |
| `.blora-container`（`--wide` 1440px / `--prose` 760px）      | 居中内容列，默认最大 1200px，自带左右内边距                     |
| `.blora-stack`（`--sm` / `--lg` / `--xl`）                   | 纵向节奏：子元素之间 16px（8 / 32 / 48px）                      |
| `.blora-row`（`--tight` / `--between` / `--center`）         | 横向排列、垂直居中、可换行，间距 12px                           |
| `.blora-actions`（`--tight` / `--end`）                      | 一排操作按钮，可换行；`--end` 靠右                              |
| `.blora-grid`（`--2` / `--3` / `--4`）                       | 等宽栅格，间距 24px；容器窄于 36rem 或视口窄于 880px 自动变单列 |
| `.blora-spacer`                                              | 在 flex 行里撑开剩余空间                                        |
| `.blora-h1` … `.blora-h4`                                    | 48 / 36 / 28 / 22px 标题                                        |
| `.blora-text-lead` / `-muted` / `-faint` / `-mono` / `-caps` | 引导段落、辅助文字、次要文字、等宽、全大写小标签                |
| `.blora-gap-2` / `-3` / `-4`                                 | 覆盖 flex/grid 的 gap                                           |

Reset 会清掉标题和段落的外边距，**所有间距都要靠上面的 class 或 gap 给出**，不要依赖浏览器默认 margin。

## 4. 表面层级与间距节奏

```text
页面底 surface-canvas（body.blora-page）
└── 卡片 .blora-card（surface-default + 细边框 + shadow-1）      ← 只允许这一层
    ├── 列表 .blora-list / 描述列表 table.blora-descriptions / 表格
    ├── 分隔 .blora-divider、.blora-card__foot
    └── 需要再分组时：.blora-card[data-variant="inset"]（内凹面，最多一层）
```

- **表格本身就是一层表面**（`.blora-table-wrap` 自带边框和圆角），直接放在页面上，不要再装进卡片。
- **统计数字**：每个指标一张小卡片放进 `.blora-grid`，或一张卡片里用 `.blora-grid` 排多个 `<blora-statistic>`；不要"大卡片里套灰框再套小卡片"。
- **间距递进**：卡片内元素之间 16px（`.blora-stack`）→ 卡片之间 24px（`.blora-grid` 默认）→ 页面区块之间 48px（`.blora-stack--xl`）。
- **卡片密度**：默认内边距 32px 适合内容卡；资源卡片网格和统计卡用 `data-size="sm"`（24px）。
- **页面宽度**：后台类页面内容列 1200–1440px 居中；表单页 760px 左右。

## 5. 排版层级

| 层级                       | 写法                                                                            |
| -------------------------- | ------------------------------------------------------------------------------- |
| 页面标题（每页一个）       | `<h1 class="blora-h2">`                                                         |
| 区块标题                   | `<h2 class="blora-h4">`                                                         |
| 卡片标题 / 描述            | `.blora-card__title` / `.blora-card__desc`                                      |
| 正文                       | 默认样式，不加 class                                                            |
| 元信息（时间、计数、路径） | `.blora-text-muted`                                                             |
| 代码、密钥、ID             | `.blora-text-mono`、`<code class="blora-code">`，敏感值用 `<blora-copy masked>` |

不要自定义字号和字重；不要把表单标签写成标题。

## 6. 状态与颜色

| 需求                           | 用法                                                           | 不要                 |
| ------------------------------ | -------------------------------------------------------------- | -------------------- |
| 对象状态（有效、已停用、失败） | `<span class="blora-badge" data-variant="success">有效</span>` | 自己写绿底绿字小方块 |
| 分类、关键词、可筛选标签       | `<span class="blora-tag">`，需要语义时加 `data-variant`        | 蓝色描边胶囊         |
| 数量 / 未读                    | `<span class="blora-badge">5</span>`（单字符自动变圆）         | 蓝色方块数字         |
| 页面内持续的提示或错误         | `<blora-alert variant="warning" …>`                            | 红色 div             |
| 操作结果                       | `message.success("已保存")`                                    | `alert()`            |
| 危险确认                       | `<blora-popconfirm>` 或 `<blora-dialog>`                       | `confirm()`          |
| 主操作                         | `.blora-button[data-variant="primary"]`，每区一个              | 多个主按钮并排       |

Badge 的语义 variant：`neutral`、`info`、`success`、`warning`、`danger`；Tag 的语义 variant：`primary`、`neutral`、`info`、`success`、`warning`、`danger`。

## 7. 按钮层级

| 场景         | variant                                          | size       |
| ------------ | ------------------------------------------------ | ---------- |
| 页头主操作   | `primary`                                        | 默认       |
| 页头次操作   | `outline`                                        | 默认       |
| 卡片底部操作 | `outline` + 最多一个 `primary`                   | `sm`       |
| 表格行内操作 | `ghost` / `text`                                 | `sm`       |
| 删除、撤销   | `danger`（配合确认）                             | 与同行一致 |
| 纯图标       | 任意 variant + `data-size="icon"` + `aria-label` | —          |

所有按钮都写 `type`；图标写 `data-icon="…"`，放在文字前（`data-icon-position="end"` 放后面）。

## 8. 页面范式

以下范式可以直接复制，把文案和数据换成业务内容即可。它们在 Showcase 的「页面范式」分组里有可交互的渲染版本。

### 8.1 应用骨架：侧栏导航 + 内容区

```html
<blora-sidebar-layout
  class="app-shell"
  variant="seamless"
  sticky
  label="主导航"
  toggle-label="打开导航"
>
  <blora-sidebar-layout-sidebar>
    <div class="app-sidebar">
      <a class="app-brand" href="/">
        <span class="blora-avatar" data-size="sm" data-shape="square" data-variant="primary"
          >CR</span
        >
        <strong>CrewRouter</strong>
      </a>
      <blora-sidebar-nav label="主导航" value="keys">
        <blora-sidebar-nav-group label="工作台">
          <blora-sidebar-nav-link
            label="模型库"
            href="/models"
            value="models"
          ></blora-sidebar-nav-link>
          <blora-sidebar-nav-link
            label="API Key 与用量"
            href="/keys"
            value="keys"
          ></blora-sidebar-nav-link>
          <blora-sidebar-nav-link
            label="统计信息"
            href="/stats"
            value="stats"
          ></blora-sidebar-nav-link>
        </blora-sidebar-nav-group>
        <blora-sidebar-nav-group label="设置">
          <blora-sidebar-nav-link
            label="用户设置"
            href="/settings"
            value="settings"
          ></blora-sidebar-nav-link>
        </blora-sidebar-nav-group>
      </blora-sidebar-nav>
    </div>
  </blora-sidebar-layout-sidebar>
  <blora-sidebar-layout-content>
    <main class="app-main blora-stack--xl">
      <!-- 8.2 页头 + 各个区块 -->
    </main>
  </blora-sidebar-layout-content>
</blora-sidebar-layout>
```

```css
/* app.css（未分层，只写布局和令牌） */
.app-shell {
  --blora-sidebar-width: 16rem;
  --blora-sidebar-min-height: 100dvh;
  --blora-sidebar-aside-padding: 0;
  --blora-sidebar-aside-background: transparent;
  --blora-sidebar-content-padding: var(--blora-space-7) var(--blora-space-8);
  --blora-sidebar-sticky-offset: 0;
  --blora-sidebar-sticky-height: 100dvh;
}

.app-sidebar {
  display: flex;
  flex-direction: column;
  gap: var(--blora-space-5);
  min-height: 100dvh;
  padding: var(--blora-space-5) var(--blora-space-3);
  border-inline-end: var(--blora-border-subtle);
}

.app-brand {
  display: flex;
  align-items: center;
  gap: var(--blora-space-3);
  padding-inline: var(--blora-space-2);
  color: var(--blora-color-text-primary);
}

.app-main {
  width: min(100%, 80rem);
  margin-inline: auto;
}

@media (max-width: 560px) {
  .app-shell {
    --blora-sidebar-content-padding: var(--blora-space-5) var(--blora-space-4);
  }
}
```

侧栏在窄屏自动变成抽屉，不要自己写汉堡菜单。导航图标、用户菜单等放在 `.app-sidebar` 里，用户菜单用 `<blora-dropdown placement="top">`（带 `slot="trigger"` 的头像区域）。

### 8.2 页头：标题 + 说明 + 操作

```html
<header class="blora-row blora-row--between">
  <div class="blora-stack--sm">
    <h1 class="blora-h2">API Key 与用量</h1>
    <p class="blora-text-muted">管理密钥、路由和调用额度。</p>
  </div>
  <div class="blora-actions">
    <button type="button" class="blora-button" data-variant="outline" data-icon="download">
      导出
    </button>
    <button type="button" class="blora-button" data-variant="primary" data-icon="plus">
      创建密钥
    </button>
  </div>
</header>
```

### 8.3 统计区

```html
<section class="blora-grid blora-grid--3" aria-label="用量概览">
  <article class="blora-card" data-size="sm">
    <blora-statistic label="调用次数" value="12,926" trend="+8.2%" direction="up"></blora-statistic>
  </article>
  <article class="blora-card" data-size="sm">
    <blora-statistic label="Token 消耗" value="3.22" suffix="B"></blora-statistic>
  </article>
  <article class="blora-card" data-size="sm">
    <blora-statistic
      label="积分消耗"
      value="1,087.11"
      trend="-2.4%"
      direction="down"
    ></blora-statistic>
  </article>
</section>
```

统计卡片直接放在页面上，不要再包进一个带标题的大卡片或灰色容器。

### 8.4 工具栏 + 表格 + 分页

```html
<section class="blora-stack" aria-labelledby="members-title">
  <div class="blora-row blora-row--between">
    <h2 class="blora-h4" id="members-title">成员</h2>
    <div class="blora-actions">
      <blora-search label="搜索成员" placeholder="姓名或邮箱"></blora-search>
      <blora-segmented value="all">
        <blora-segment value="all">全部</blora-segment>
        <blora-segment value="active">活跃</blora-segment>
        <blora-segment value="disabled">已停用</blora-segment>
      </blora-segmented>
      <button type="button" class="blora-button" data-variant="primary" data-icon="plus">
        邀请成员
      </button>
    </div>
  </div>
  <div class="blora-table-wrap">
    <table class="blora-table">
      <thead>
        <tr>
          <th data-sort data-col-key="name">成员</th>
          <th>角色</th>
          <th>状态</th>
          <th>操作</th>
        </tr>
      </thead>
      <tbody>
        <tr data-row-key="u1">
          <td>张三</td>
          <td>管理员</td>
          <td><span class="blora-badge" data-variant="success">活跃</span></td>
          <td>
            <button type="button" class="blora-button" data-variant="ghost" data-size="sm">
              编辑
            </button>
          </td>
        </tr>
        <tr data-row-key="u2">
          <td>李四</td>
          <td>成员</td>
          <td><span class="blora-badge" data-variant="neutral">已停用</span></td>
          <td>
            <button type="button" class="blora-button" data-variant="ghost" data-size="sm">
              编辑
            </button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
  <div class="blora-row blora-row--between">
    <span class="blora-text-muted">共 48 人</span>
    <blora-pagination label="成员分页" page="1" total="5"></blora-pagination>
  </div>
</section>
```

表格需要排序、行选或列设置时，再用 `createTableController()` 挂载（见迁移规范 Table 一节）。没有数据时用 `<blora-empty>` 替换整个表格，而不是留一个空表头。

### 8.5 资源卡片网格（API Key、项目、实例）

```html
<section class="blora-stack" aria-labelledby="keys-title">
  <div class="blora-row blora-row--between">
    <div class="blora-stack--sm">
      <h2 class="blora-h4" id="keys-title">普通 API Key</h2>
      <p class="blora-text-muted">仅自己管理的密钥</p>
    </div>
    <span class="blora-badge" data-variant="neutral">5</span>
  </div>
  <div class="blora-grid blora-grid--2">
    <article class="blora-card blora-stack" data-size="sm">
      <header class="blora-card__header">
        <div class="blora-row blora-row--tight">
          <h3 class="blora-card__title">Tools</h3>
          <span class="blora-badge" data-variant="success">有效</span>
          <span class="blora-tag">签名关闭</span>
        </div>
        <blora-switch name="tools-enabled" checked>启用</blora-switch>
      </header>
      <p class="blora-text-muted">最近使用 2026-08-25 · 创建于 2026-08-23 · 26 次 · 61.3K Token</p>
      <blora-copy text="sk-01a7e55f9c3d2b045" masked label="复制 Tools 的 API Key"></blora-copy>
      <footer class="blora-card__foot blora-row blora-row--between">
        <span class="blora-tag" data-variant="primary">路由 cursor-grok-4.5</span>
        <div class="blora-actions blora-actions--tight">
          <button type="button" class="blora-button" data-variant="outline" data-size="sm">
            模型队列
          </button>
          <blora-dropdown label="更多" align="end">
            <blora-dropdown-item value="rename">重命名</blora-dropdown-item>
            <blora-dropdown-item value="rotate">重新生成</blora-dropdown-item>
            <blora-dropdown-item value="delete" separator>删除</blora-dropdown-item>
          </blora-dropdown>
        </div>
      </footer>
    </article>
  </div>
</section>
```

- 卡片标题行用 `.blora-card__header`，左边标题和状态，右边开关或操作。
- 状态用 Badge，分类（路由、签名策略）用 Tag；不要给卡片加左侧彩色竖条。
- 密钥用 `<blora-copy masked>`，`text` 传完整值，眼睛按钮由组件提供。
- 卡片内只有一个层级：元信息一行、复制区一行、底部操作一行。

### 8.6 卡片内列表（成员、设备、关联账户）

```html
<article class="blora-card">
  <header class="blora-card__header">
    <div>
      <h2 class="blora-card__title">关联账户</h2>
      <p class="blora-card__desc">登录方式与第三方账户</p>
    </div>
    <button
      type="button"
      class="blora-button"
      data-variant="outline"
      data-size="sm"
      data-icon="link"
    >
      关联新账户
    </button>
  </header>
  <ul class="blora-list">
    <li class="blora-list__item">
      <span class="blora-avatar" data-size="sm" data-variant="info">GH</span>
      <div class="blora-list__meta">
        <div class="blora-list__title">GitHub</div>
        <div class="blora-list__desc">rhedar · 2026-07-17 关联</div>
      </div>
      <span class="blora-badge" data-variant="success">已连接</span>
      <button type="button" class="blora-button" data-variant="ghost" data-size="sm">解除</button>
    </li>
    <li class="blora-list__item">
      <span class="blora-avatar" data-size="sm">MC</span>
      <div class="blora-list__meta">
        <div class="blora-list__title">Minecraft</div>
        <div class="blora-list__desc">尚未关联</div>
      </div>
      <button type="button" class="blora-button" data-variant="outline" data-size="sm">关联</button>
    </li>
  </ul>
</article>
```

`.blora-list__meta` 会占满中间空间，后面的 Badge 和按钮自动靠右；列表项之间的分隔线由组件提供。

### 8.7 设置表单

```html
<form class="blora-card blora-stack--lg" id="profile-form">
  <header class="blora-card__header">
    <div>
      <h2 class="blora-card__title">个人资料</h2>
      <p class="blora-card__desc">这些信息会显示在你的主页上。</p>
    </div>
  </header>
  <div class="blora-grid blora-grid--2">
    <blora-field label="昵称" name="nickname" required maxlength="20"></blora-field>
    <blora-field
      label="邮箱"
      name="email"
      type="email"
      hint="用于接收通知"
      autocomplete="email"
    ></blora-field>
  </div>
  <blora-field label="个人简介" name="bio" textarea limit="120"></blora-field>
  <fieldset class="blora-fieldset" data-variant="flat">
    <legend>通知</legend>
    <div class="blora-grid blora-gap-3">
      <blora-switch name="notify-email" checked>邮件通知</blora-switch>
      <blora-switch name="notify-sms">短信通知</blora-switch>
    </div>
  </fieldset>
  <footer class="blora-card__foot blora-actions blora-actions--end">
    <button type="reset" class="blora-button" data-variant="ghost">重置</button>
    <button type="submit" class="blora-button" data-variant="primary">保存</button>
  </footer>
</form>
```

提交错误写到对应字段的 `error` 属性上；整体失败用表单顶部的 `<blora-alert variant="danger">`；成功用 `message.success()`。

### 8.8 详情页：描述列表 + 时间线

```html
<div class="blora-grid blora-grid--2">
  <article class="blora-card">
    <header class="blora-card__header">
      <h2 class="blora-card__title">密钥详情</h2>
      <span class="blora-badge" data-variant="success">有效</span>
    </header>
    <table class="blora-descriptions">
      <tbody>
        <tr>
          <th>名称</th>
          <td>Tools</td>
        </tr>
        <tr>
          <th>路由</th>
          <td>cursor-grok-4.5-medium-fast</td>
        </tr>
        <tr>
          <th>创建时间</th>
          <td>2026-08-23 10:24</td>
        </tr>
      </tbody>
    </table>
  </article>
  <article class="blora-card">
    <header class="blora-card__header">
      <h2 class="blora-card__title">最近活动</h2>
    </header>
    <blora-timeline>
      <blora-timeline-item time="10:24" title="创建密钥" variant="primary"></blora-timeline-item>
      <blora-timeline-item
        time="12:00"
        title="首次调用成功"
        variant="success"
      ></blora-timeline-item>
    </blora-timeline>
  </article>
</div>
```

### 8.9 对话框表单与危险确认

```html
<button type="button" class="blora-button" data-variant="primary" data-icon="plus" id="create-key">
  创建密钥
</button>
<blora-dialog id="create-key-dialog" size="sm">
  <span slot="title">创建密钥</span>
  <form class="blora-stack" id="create-key-form">
    <blora-field label="名称" name="name" required maxlength="32"></blora-field>
    <blora-field label="备注" name="note" textarea hint="选填"></blora-field>
  </form>
  <div slot="footer" class="blora-actions blora-actions--end">
    <button type="button" class="blora-button" data-variant="ghost" id="create-key-cancel">
      取消
    </button>
    <button type="submit" class="blora-button" data-variant="primary" form="create-key-form">
      创建
    </button>
  </div>
</blora-dialog>

<blora-popconfirm
  trigger="删除"
  message="删除后使用此密钥的请求会立即失败，确定删除？"
  confirm-label="删除"
  cancel-label="取消"
></blora-popconfirm>
```

```js
const dialog = document.querySelector("#create-key-dialog");
document.querySelector("#create-key")?.addEventListener("click", () => dialog.show());
document.querySelector("#create-key-cancel")?.addEventListener("click", () => dialog.close());
document.querySelector("blora-popconfirm")?.addEventListener("blora-confirm", () => deleteKey());
```

遮罩、焦点陷阱、Esc 关闭、滚动锁都由组件负责，不要自己写。

### 8.10 加载、空、错误三态

```html
<!-- 加载：骨架屏保持最终布局的形状 -->
<article class="blora-card" data-size="sm" aria-busy="true">
  <div class="blora-skeleton" data-variant="title"></div>
  <div class="blora-skeleton" data-variant="text"></div>
  <div class="blora-skeleton" data-variant="text"></div>
</article>

<!-- 空：说明原因并给出下一步 -->
<blora-empty
  title="还没有密钥"
  description="创建第一个密钥后即可调用 API。"
  action-label="创建密钥"
></blora-empty>

<!-- 错误：陈述事实 + 下一步 -->
<blora-alert
  variant="danger"
  title="加载失败"
  description="网络异常，请检查连接后重试。"
></blora-alert>
```

短暂的操作反馈用 `message.success()` / `message.error()`（从 `@bloret-crew/blora-design` 导入），不要用 `alert()`。

## 9. 常见错误对照

| 迁移后常见写法                                               | 问题                               | 正确写法                                                                          |
| ------------------------------------------------------------ | ---------------------------------- | --------------------------------------------------------------------------------- |
| 大卡片里放灰色容器，容器里再放统计小卡片                     | 三层表面、灰度混乱，暗色下糊成一片 | 8.3：统计卡直接放在 `.blora-grid` 里                                              |
| `<span style="background:#e6f4ea;color:#1e8e3e">有效</span>` | 第二套颜色，暗色和换肤全部失效     | `<span class="blora-badge" data-variant="success">有效</span>`                    |
| 卡片左侧彩色竖条表示状态                                     | Blora 没有这种语言，状态只靠颜色   | 标题行里放 Badge                                                                  |
| 蓝色描边的标签、蓝色数字方块                                 | 浏览器默认色或旧框架色             | `.blora-tag`、`.blora-badge`                                                      |
| 自己画的开关、`<input type="checkbox">` 开关                 | 形状、焦点、暗色都不一致           | `<blora-switch>`                                                                  |
| 粗体深色的"更多"按钮                                         | 次要操作抢了主操作                 | `outline` / `ghost` 小按钮，更多操作放进 `<blora-dropdown>`                       |
| `<label class="blora-field">` 或手写 `.blora-field__label`   | 在复刻组件内部结构                 | `<blora-field label="…">`，可以把原生 input 写在里面                              |
| `var(--blora-primary)`、`var(--blora-surface-1)`             | 这些令牌不存在，样式静默失效       | `var(--blora-color-action-primary-default)`、`var(--blora-color-surface-default)` |
| 旧 CSS 原样保留在全局                                        | 未分层样式覆盖所有 Blora 组件      | 第 1 节：放进 `@layer legacy`                                                     |
| `alert()` / `confirm()`                                      | 原生弹窗与主题、移动端都不一致     | `message`、`<blora-popconfirm>`、`<blora-dialog>`                                 |
| Emoji、`×`、`→` 当图标                                       | 与 Lucide 线性图标混杂             | `data-icon="close"`、`data-icon="chevron-right"`                                  |

## 10. 完成前自检

- [ ] `npx blora-lint src` 没有 error，warning 都有理由。
- [ ] 每个页面只有一个 `h1`，每个区域最多一个主按钮。
- [ ] 没有卡片嵌套卡片（`inset` 内凹面除外，且最多一层）。
- [ ] 业务 CSS 里没有颜色值、没有元素选择器、没有覆盖 `.blora-*` 的外观属性。
- [ ] 所有状态用 Badge/Tag/Alert 的 variant 表达，并有文字，不只靠颜色。
- [ ] 每个数据区都有加载、空、错误三态。
- [ ] 浅色、深色、至少两套主题下截图检查；390px 宽度无横向滚动。
- [ ] 键盘能完成主要流程：Tab 顺序合理，Esc 能关闭浮层，焦点环可见。
