# Blora Design 2.0 发布与维护状态

> 这是 2.0 Stable 的发布记录和后续维护边界。当前版本为 `2.0.8`，所有计划内发布工作已经完成。

## 当前状态

- Stable 版本：`2.0.8`
- npm `latest`：`2.0.8`
- 核心组件：87 个
- 官方 add-on：Markdown、Thread、QRCode、Effects、Layout、Theming
- 稳定核心 API：已冻结
- 发布状态：已完成最终验收

## 已完成的发布验收

- `pnpm verify` 全量通过；
- Chromium、移动 Chromium、Firefox、WebKit 浏览器套件通过；
- Firefox：87/87；
- WebKit：87/87；
- Safari：项目所有者已完成人工抽测；
- axe 无障碍 smoke 通过；
- 视觉回归 smoke 通过；
- npm clean consumer 安装通过；
- ESM 和 Node SSR import 通过；
- CDN IIFE 加载通过；
- CSP 页面加载通过；
- publint、attw、package exports、size 和 pack 检查通过；
- 组件 contract、manifest 和 API snapshot 生成通过；
- 87 个核心组件展示页齐全；
- 跨框架迁移规范和每个组件的示例齐全；
- npm-only 消费规则已写入用户文档。

完整证据见 [`rc-release-rehearsal.md`](./rc-release-rehearsal.md) 和 [`browser-matrix.md`](./browser-matrix.md)。

## 组件和工程边界

- 展示型内容使用官方 CSS class 和语义 HTML；
- 结构敏感交互使用官方 Composite Custom Element；
- 业务必须从已发布 npm 包导入；
- 业务不得引用工作区源码、git 源码路径、生成文件或复制组件实现；
- 开放数据 DOM 只使用 contract 明确的 controller，并在卸载时调用 `destroy()`；
- 颜色、间距、圆角、阴影、动效、层级和焦点状态使用登记 token；
- 公共 API 变更必须同步 contract、manifest、测试、文档和 CHANGELOG。

## 后续维护

后续工作只属于新需求、缺陷修复或文档维护，不属于 2.0 发布遗留项：

- 用户反馈驱动的缺陷修复；
- 新组件或新能力；
- 新浏览器版本回归；
- add-on 测试深度扩展；
- 设计 token 或无障碍规则的增量改进。

这些工作必须遵守当前 contract、npm-only 和完整门禁规则。


## 2.1.0 迭代（未发布）

目标：组件本身更一致，其他项目（及其 AI Agent）迁移时一次写对。已完成：

- 页面组合规范 `docs/patterns.md` 与 Showcase「页面范式」分组；
- 随包发布 `llms.txt`、`dist/docs/` 离线规范和 `npx blora-lint`；
- 迁移规范逐例改为真实 API，并由浏览器门禁和 lint 执行校验；
- `data-icon` 自动填充、Field 采纳子控件、Card 标题行、Tag danger；
- Coral danger/warning 调色与语义变体、禁用态、Tabs/Avatar/Navbar 缺陷修复（见 `known-differences.md`）。

2026-10-01 收尾：核心包和六个官方 add-on 的源码版本已统一准备为 `2.1.0`；增加浅深色组件状态和桌面/390px 页面范式的视觉门禁，修复窄屏 List 正文挤压，并检查实际 tarball 中的离线规范和 lint CLI。

本轮验收（Windows，2026-10-01）：

- `pnpm verify` 完整通过：351 个单元测试，210 项 Chromium / mobile Chromium / axe 检查，契约、对比度、类型、文档、包导出、体积和安装包门禁；
- Firefox 104/104、WebKit 104/104；构建完成后顺序运行，避免产物重建干扰浏览器检查；
- 视觉回归 48/48；新增的 18 张浅深色组件与页面范式基线均已逐张审核；
- 核心包与六个 add-on 的实际 tarball 均可安装；安装后的 `blora-lint` 接受有效写法，并对不存在的 token 返回错误与退出码 1；五份离线规范和入口文件齐全。

发布待办：推送并发布 `2.1.0`。在发布完成前，不将本次能力描述为 npm `latest` 已可用；不要覆盖 Stable `2.0.8` 的发布记录。
