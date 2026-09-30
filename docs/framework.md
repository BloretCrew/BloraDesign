# Blora Design 2.0 · 框架说明

Blora Design 2.0 是基于 Design Token、Composite Custom Element 和公开 headless controller 的 ESM 设计系统。它不要求 React、Vue 或其他特定框架运行时。

日常用法看 [`guide.md`](./guide.md)，页面组合规则看 [`patterns.md`](./patterns.md)，完整迁移规范看 [`migration/from-any-ui-to-blora-design.md`](./migration/from-any-ui-to-blora-design.md)。交互真值在 `examples/showcase-v2/`，组件契约在 `packages/blora-design/contracts/`，发布状态在 [`refactor/status.md`](./refactor/status.md)。

框架项目的三个要点：

- 入口最先加载只含 `@layer legacy, blora;` 的样式文件，旧框架样式放进 `legacy` 层（Tailwind 的写法见 `patterns.md` 第 1 节）。
- 图标在模板里写 `<span data-icon="plus" aria-hidden="true"></span>`：`auto` 会持续填充后渲染的节点，框架不会删除它不认识的子节点。
- 模板里只使用 contract 声明过的属性；需要调用方法（`show()`、`close()`）时在挂载后通过 ref 调用。

## 安装和入口

```bash
npm install @bloret-crew/blora-design
```

```ts
import "@bloret-crew/blora-design/blora.css";
import "@bloret-crew/blora-design/auto";
import { createTableController, message } from "@bloret-crew/blora-design";
```

| 入口 | 作用 |
|------|------|
| `@bloret-crew/blora-design` | ESM API、组件定义函数、表格/表单 controller、`message` / `notify` |
| `@bloret-crew/blora-design/auto` | 注册完整默认 Composite Custom Element 面 |
| `@bloret-crew/blora-design/blora.css` | Token、基础样式和核心组件 CSS 聚合入口 |
| `@bloret-crew/blora-design/blora.global.js` | CDN / IIFE 的 `globalThis.Blora` |
| `@bloret-crew/blora-design/custom-elements.json` | Custom Elements Manifest |
| `@bloret-crew/blora-design/component-manifest.json` | 组件清单 |
| `@bloret-crew/blora-design/api-snapshot.json` | API snapshot |

Add-on 使用独立 npm 包：

```bash
npm install \
  @bloret-crew/blora-design-markdown \
  @bloret-crew/blora-design-thread \
  @bloret-crew/blora-design-qrcode \
  @bloret-crew/blora-design-effects \
  @bloret-crew/blora-design-layout \
  @bloret-crew/blora-design-theming
```

## 结构选择

1. **展示型内容**使用官方 class 和语义 HTML，例如 `.blora-card`、`.blora-list`、`.blora-quote`、`.blora-tag`、`.blora-badge`、`.blora-divider`。
2. **结构敏感交互**使用官方 Composite Custom Element，例如 `<blora-select>`、`<blora-dialog>`、`<blora-tabs>`、`<blora-datepicker>`。
3. **开放数据 DOM**使用官方 headless controller，例如 `createTableController()` 和 `createFormController()`。
4. 业务代码负责数据、路由和业务流程；Blora 负责组件结构、状态、键盘行为、焦点管理和视觉状态。
5. 不复制 Composite Custom Element 的内部结构，不访问 `shadowRoot`，不依赖未在 contract 中声明的 class 或属性。

## 浮层和生命周期

Dialog、Command、Tour、Drawer、图片预览以及 Theming Palette Picker 统一使用官方顶层浮层机制。不要在业务层重新实现遮罩、焦点陷阱、滚动锁、Escape 或 outside close。

Table/Form controller 必须在挂载后初始化，在宿主卸载时调用 `destroy()`：

```ts
const root = document.querySelector(".blora-table-wrap");
const controller = createTableController(root);
window.addEventListener("pagehide", () => controller.destroy(), { once: true });
```

## 语言、主题和图标

- 组件自动生成的 chrome 由 locale pack 提供；页面设置正确的 `<html lang>`。
- 业务文案由业务应用管理，不要修改组件内部生成文本来绕过 locale。
- 颜色、间距、圆角、阴影、动效和层级使用 `--blora-*` token。
- 操作、状态和导航图标使用 `createBloraIcon()` 或官方组件生成的 Lucide SVG。
- 不使用 Emoji、图标字体或文本字符冒充图标。
- 所有六套主题、明暗模式、RTL、reduced-motion 和移动视口都要验证。

## 框架接入原则

React、Vue、Svelte、Angular 或其他框架只负责宿主应用的状态和生命周期。Composite CE 直接作为模板标签使用；Table、Form 等开放 DOM controller 按框架生命周期创建和销毁。

不要让其他 UI 组件库继续提供同类 Button、Select、Dialog、Tabs、Table 或主题样式；迁移项目统一使用已发布 npm 包中的 Blora 能力。完整的替换矩阵、npm-only 规则、示例和验收清单见 [`migration/from-any-ui-to-blora-design.md`](./migration/from-any-ui-to-blora-design.md)。
