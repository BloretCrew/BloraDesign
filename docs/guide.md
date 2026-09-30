# Blora Design 2.0 · 使用与迁移指南

> **面向 Blora Design 2.0 Stable（当前 `2.0.8`）**。展示型内容使用官方 class 和语义 HTML，结构敏感交互使用 Composite Custom Element，开放数据 DOM 使用公开 headless controller。
> **写页面之前先读 [`patterns.md`](./patterns.md)**：卡片层级、间距节奏、状态色、CSS 层级和整页范式都在那里。
> 设计令牌见 [`standards.md`](./standards.md)。完整迁移规范见 [`migration/from-any-ui-to-blora-design.md`](./migration/from-any-ui-to-blora-design.md)。组件契约见 `packages/blora-design/contracts/*.contract.json`。交互示例见 `examples/showcase-v2/`。

---

## 目录

1. [安装与页面骨架](#1-安装与页面骨架)
2. [全局约定](#2-全局约定)
3. [常用组件写法](#3-常用组件写法)
4. [Add-on 包](#4-add-on-包)
5. [主题首屏与表单可访问性](#5-主题首屏与表单可访问性)
6. [完整跨框架迁移规范](./migration/from-any-ui-to-blora-design.md)
7. [验收清单](#7-验收清单)
8. [页面范式与组合规则](./patterns.md)

---

## 1. 安装与页面骨架

### 1.1 安装 npm 包

```bash
npm install @bloret-crew/blora-design
```

可选 add-on：

```bash
npm install \
  @bloret-crew/blora-design-markdown \
  @bloret-crew/blora-design-thread \
  @bloret-crew/blora-design-qrcode \
  @bloret-crew/blora-design-effects \
  @bloret-crew/blora-design-layout \
  @bloret-crew/blora-design-theming
```

消费项目只能使用 npm 包公开 `exports`。不要从 git 仓库、工作区源码目录或生成目录导入，也不要复制组件实现。

### 1.2 样式与自动注册

```ts
import "@bloret-crew/blora-design/blora.css";
import "@bloret-crew/blora-design/auto";
```

按需加载时使用 token、foundation 和已声明的组件 CSS 子路径：

```ts
import "@bloret-crew/blora-design/tokens.css";
import "@bloret-crew/blora-design/foundations.css";
import "@bloret-crew/blora-design/components/button.css";
```

页面根节点建议使用：

```html
<body class="blora-page blora-scope">
  <main>页面内容</main>
</body>
```

### 1.3 页面骨架

页面自己的布局可以使用 CSS Grid、Flexbox 或框架布局工具；组件表面和交互必须来自 Blora：

```html
<blora-sidebar-layout variant="seamless" sticky label="主导航">
  <blora-sidebar-layout-sidebar>
    <blora-sidebar-nav label="导航" value="home">
      <blora-sidebar-nav-group label="工作区">
        <blora-sidebar-nav-link label="首页" href="/" value="home"></blora-sidebar-nav-link>
        <blora-sidebar-nav-link label="设置" href="/settings" value="settings"></blora-sidebar-nav-link>
      </blora-sidebar-nav-group>
    </blora-sidebar-nav>
  </blora-sidebar-layout-sidebar>
  <blora-sidebar-layout-content>
    <main>业务内容</main>
  </blora-sidebar-layout-content>
</blora-sidebar-layout>
```

---

## 2. 全局约定

1. class 前缀使用 `blora-*`。
2. 变体和尺寸使用对应 contract 登记的 `data-*` 或属性值。
3. Button 使用 `.blora-button`，并明确 `type`。
4. 结构敏感控件使用官方 Composite Custom Element，不复制内部 DOM。
5. 公开数据 DOM 只使用 contract 明确的 controller，并在卸载时调用 `destroy()`。
6. 浮层交给官方组件处理 stacking、顶层、焦点、Escape、outside close 和滚动锁。
7. 颜色、间距、圆角、阴影、动效和层级使用 `--blora-*` token。
8. 用户内容不得用 `innerHTML` 写入；使用 `textContent`、DOM API 或官方 Markdown renderer。
9. 操作、状态和导航图标使用 `createBloraIcon()` 或官方组件生成的 Lucide SVG；不要使用 Emoji、图标字体或文本字符冒充图标。
10. 组件自动生成的 chrome 使用 locale pack，页面必须设置正确的 `<html lang>`。
11. 迁移项目从已发布 npm 包引入 Blora，不引用本仓库 `src/`，不复制源码或生成文件。

---

## 3. 常用组件写法

### 3.1 Button、Tag、Badge、Card

```html
<button type="button" class="blora-button" data-variant="primary">保存</button>
<span class="blora-tag" data-variant="primary">设计系统</span>
<span class="blora-badge" data-variant="success" data-shape="pill">已完成</span>

<article class="blora-card">
  <h2>项目概览</h2>
  <p>内容表面、颜色和间距由 Blora CSS 与 token 提供。</p>
</article>
```

### 3.2 Field、Input、Textarea

```html
<blora-field label="项目名称" name="project" required hint="最多 40 个字符" maxlength="40"></blora-field>

<!-- 2.1.0+：写在里面的原生控件会被保留（type、name、autocomplete 不丢） -->
<blora-field label="备注" hint="选填">
  <textarea class="blora-textarea" name="note" rows="4"></textarea>
</blora-field>
```

### 3.3 Select、Tabs、Segmented、Accordion

```html
<blora-select name="status" placeholder="选择状态">
  <blora-option value="active">进行中</blora-option>
  <blora-option value="done">已完成</blora-option>
</blora-select>

<blora-tabs>
  <blora-tab label="概览" value="overview" selected>概览内容</blora-tab>
  <blora-tab label="设置" value="settings">设置内容</blora-tab>
</blora-tabs>

<blora-segmented value="week">
  <blora-segment value="day">日</blora-segment>
  <blora-segment value="week">周</blora-segment>
  <blora-segment value="month">月</blora-segment>
</blora-segmented>

<blora-accordion>
  <blora-accordion-item heading="详情" open>可折叠内容。</blora-accordion-item>
</blora-accordion>
```

### 3.4 Dialog、Drawer、Popover、Tooltip

```html
<button type="button" class="blora-button" data-variant="primary" id="open-dialog">
  打开对话框
</button>
<blora-dialog id="dialog">
  <span slot="title">删除成员</span>
  <p>确定要删除这个成员吗？</p>
</blora-dialog>

<!-- trigger 属性生成触发按钮，子元素是浮层内容 -->
<blora-popover trigger="说明">
  <p>这里是补充信息。</p>
</blora-popover>

<!-- Tooltip 的子元素就是触发器 -->
<blora-tooltip text="保存当前项目">
  <button type="button" class="blora-button" data-variant="ghost">保存</button>
</blora-tooltip>
```

```ts
document.querySelector("#open-dialog")?.addEventListener("click", () => {
  document.querySelector("#dialog")?.show();
});
```

### 3.5 Table 与 Form controller

Table 和 Form 让业务保留开放数据 DOM，controller 只负责官方行为：

```html
<form id="members-form">
  <div class="blora-table-wrap" data-blora-selectable>
    <table class="blora-table">
      <thead><tr><th data-sort data-col-key="name">成员</th></tr></thead>
      <tbody><tr data-row-key="u1"><td>张三</td></tr></tbody>
    </table>
  </div>
</form>
```

```ts
import { createFormController, createTableController } from "@bloret-crew/blora-design";

const table = createTableController(document.querySelector(".blora-table-wrap"));
const form = createFormController(document.querySelector("#members-form"));
window.addEventListener("pagehide", () => {
  table.destroy();
  form.destroy();
}, { once: true });
```

### 3.6 引用内容模式

引用是语义内容模式，不需要新建组件：

```html
<blockquote class="blora-quote">
  这是一段引用。
  <cite>来源</cite>
</blockquote>
```

---

## 4. Add-on 包

每个 add-on 都从独立 npm 包安装并导入：

```ts
import "@bloret-crew/blora-design-thread/thread.css";
import "@bloret-crew/blora-design-thread";
import "@bloret-crew/blora-design-theming/theming.css";
import "@bloret-crew/blora-design-theming";
```

- Thread：`<blora-thread-comment>`、`<blora-thread-composer>`。
- Markdown：`<blora-markdown>`、`renderMarkdown()`。
- QR Code：`<blora-qrcode>`、`buildQRMatrix()`、`renderQRCode()`。
- Effects：Text FX、Rotate、Countdown、Count Up、Diff、Hover Gallery、Watermark 和 Shortcut。
- Layout：Sidebar Layout、Affix、Anchor、Scroll Spy 和 Smooth Scroll。
- Theming：Palette Picker、Color Scheme Toggle、`applyTheme()` 和 `applyColorScheme()`。

每个 add-on 的逐能力 npm 示例见[完整跨框架迁移规范](./migration/from-any-ui-to-blora-design.md)。

---

## 5. 主题首屏与表单可访问性

如果页面从本地存储恢复主题，必须在所有 Blora CSS 之前执行 Theming add-on 的阻塞式启动脚本，避免首屏先按系统主题绘制：

在服务端模板或构建阶段生成 `<head>` 内容：

```ts
import { getThemeBootScript } from "@bloret-crew/blora-design-theming";

const themeBootScript = getThemeBootScript();
// 将 themeBootScript 作为普通同步 <script> 的内容输出到所有 Blora CSS 之前。
```

生成的 HTML 顺序必须是：

```html
<script>/* themeBootScript */</script>
<link rel="stylesheet" href="/node_modules/@bloret-crew/blora-design-theming/theming.css">
<link rel="stylesheet" href="/node_modules/@bloret-crew/blora-design/blora.css">
```

脚本应作为普通同步脚本输出在 `<head>` 中，不能等 `type="module"` 或自定义元素升级后再执行。表单字段优先使用 `<blora-field>`；它会自动关联 label、hint、error，并在错误状态下同步 `aria-invalid`。登录、注册和密码表单所需的 `autocomplete`、`inputmode`、`aria-label`、`autocapitalize`、`spellcheck`、`enterkeyhint` 也会透传给内部原生控件。

## 6. 完整跨框架迁移规范

请按 [`migration/from-any-ui-to-blora-design.md`](./migration/from-any-ui-to-blora-design.md) 执行。文档覆盖 Bootstrap、Tailwind、Ant Design、Element Plus、Naive UI、Vuetify、MUI、PrimeVue、shadcn/ui、React、Vue、Svelte、Angular 和手写 UI，并包含 87 个核心组件示例、21 个 add-on 能力示例、npm-only 规则和最终验收清单。

---

## 7. 验收清单

- [ ] 所有依赖来自已发布 npm 包，不引用仓库 `src/`，不复制组件源码。
- [ ] `npx blora-lint src` 没有 error（2.1.0+）。
- [ ] 页面组合符合 [`patterns.md`](./patterns.md)：卡片不嵌套、状态用 Badge/Tag、旧 CSS 在 `@layer legacy`。
- [ ] 组件清单中已有能力全部改用对应 Blora 组件或官方基础模式。
- [ ] Composite CE 由 `@bloret-crew/blora-design/auto` 或官方 add-on 注册。
- [ ] 业务代码没有复制内部 BEM 树，也没有访问 `shadowRoot`。
- [ ] Table/Form controller 在卸载时调用 `destroy()`。
- [ ] 表格行选使用内置 `data-blora-selectable`。
- [ ] 颜色、间距、圆角、阴影、动效和层级使用 Blora token。
- [ ] 图标使用 `createBloraIcon()` 或官方 Lucide SVG。
- [ ] 六套主题、明暗模式、RTL、reduced-motion 和移动视口通过验证。
- [ ] 键盘、焦点、Escape、outside close、表单错误和 loading/empty/error 状态通过验证。
- [ ] Chromium、移动 Chromium、Firefox、WebKit 和已约定的 Safari 人工路径通过验证。
- [ ] `pnpm verify`、axe 和视觉回归通过。

---

## 相关文档

| 文档 | 内容 |
|------|------|
| [`docs/standards.md`](./standards.md) | 设计 token、视觉和无障碍规则 |
| [`docs/framework.md`](./framework.md) | 框架接入与 npm 包边界 |
| [`docs/migration/from-any-ui-to-blora-design.md`](./migration/from-any-ui-to-blora-design.md) | 完整迁移规范和逐组件示例 |
| [`docs/refactor/status.md`](./refactor/status.md) | 发布与维护状态 |
| [`docs/refactor/component-matrix.md`](./refactor/component-matrix.md) | 组件覆盖矩阵 |
