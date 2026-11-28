# AGENTS.md

给在本仓库里工作的 AI 和开发者看的说明。

## 这是什么

Blora Design 3.0：Bloret 的设计系统。业务页面写普通 HTML + `bd-` 类名，引入一份 `blora.css` 和一个自动接管的 `blora.js`；看板、日程、套餐卡这类页面模式另有可选的 `patterns.css`（`data-pattern` 挂样式）。3.0 是从零开始的重写，与 2.0 没有任何关系，不要参考、引用或兼容 2.0。

## 先读

1. `DESIGN.md`：唯一的规范。YAML 是设计变量的来源，正文规定视觉和写法。改任何视觉之前先读它，规则冲突时以它为准。
2. `docs/roadmap.md`：3.0 的方案和分阶段计划，当前做到哪一阶段。
3. `reference/`：视觉真值（组件全集和 4 个 demo），用的是 3.0 之前的旧类名。新实现要和它们逐像素一致。

## 不能违反的规则

- **零描边**：不画 border、outline、分隔线（拖放区的 SVG 虚线是唯一例外）。
- **不用渐变、不用大色块**。
- **不写死颜色**：只用 `--bd-*` 变量；不直接用 `--cortado-*`；半透明用 `color-mix()`。
- **不出现任何原生控件外观**：不用 `<select>`、`<progress>`、`title` 属性、`alert()`，原生滚动条和日期面板也不行。完整清单见 DESIGN.md · Components · 不出现原生控件。
- **一套写法**：一个元素最多一个 `bd-` 类；变体用 `data-*`；状态只用 ARIA / 原生状态，不加 `.active`；事件名 `bd-<动作>`。
- **新组件先设计**：没写进 DESIGN.md、没经过确认的组件不要实现。只在一张页面上出现的画面放进 `src/css/patterns/`，不做成组件。
- **页面里不写样式**：`recipes/pages/` 的页面不能有 `<style>`，`style=""` 只用于 `--bd-columns`、`--bd-value` 这类布局或数据参数。

## 目录

| 路径                        | 内容                                                                                     |
| --------------------------- | ---------------------------------------------------------------------------------------- |
| `DESIGN.md`                 | 规范 + 设计变量来源                                                                      |
| `packages/blora-design`     | 主包 `@bloret-crew/blora-design`：`dist/blora.css`、`dist/blora.js`、`dist/patterns.css` |
| `packages/stylelint-config` | `@bloret-crew/stylelint-config-blora`：本仓库自己的 CSS 也用它检查                       |
| `recipes/`                  | 每个组件的 HTML 示例；`recipes/pages/` 是只用框架重写的整页（和参考页逐像素比对）        |
| `reference/`                | 视觉真值页面                                                                             |
| `docs/`                     | 方案与计划                                                                               |

## 命令

需要 Node ≥ 24、pnpm（版本见 `package.json` 的 `packageManager`）。

```bash
pnpm install
pnpm build        # 构建全部包
pnpm test         # 测试（依赖构建产物，先 build）
pnpm lint         # ESLint、stylelint、DESIGN.md lint、Prettier
pnpm check:pages  # 用 blora check 检查 recipes/pages 的全部场景
pnpm verify       # CI 跑的全套：build → lint → typecheck → test → 浏览器测试 → blora check
```

提交前跑 `pnpm verify`。改 DESIGN.md 后，`pnpm lint:design` 允许出现 orphaned-tokens 警告和主按钮对比度警告（已知问题），不允许出现错误。

## 发布

用 Changesets：`pnpm changeset` 记录变更，版本和发布由维护者执行。包名统一 `@bloret-crew/*`，Blora Design 用 Apache-2.0，Cortado 是 MIT。
