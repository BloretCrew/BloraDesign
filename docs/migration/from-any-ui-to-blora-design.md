# 从任意 UI 实现迁移到 Blora Design 2.0

> 面向使用 Bootstrap、Tailwind、Ant Design、Element Plus、Naive UI、Vuetify、MUI、PrimeVue、shadcn/ui、其他 UI 库，或自建 HTML/CSS/JS 组件的项目。
>
> 本规范的目标是：迁移后，所有 Blora Design 已经覆盖的界面能力都使用 Blora 官方组件、基础模式或公开服务；业务代码不重复实现同一组件，不引入第二套组件视觉，不使用未经过 Blora 统一的裸原生交互控件。
>
> **当前稳定版本**：`2.0.7`
> **推荐入口**：[`docs/guide.md`](../guide.md)
> **交互真值**：[`examples/showcase-v2/`](../../examples/showcase-v2/)
> **组件清单**：[`component-manifest.json`](../../packages/blora-design/component-manifest.json)
> **契约目录**：[`packages/blora-design/contracts/`](../../packages/blora-design/contracts/)
>
> **主题首屏**：在所有 Blora CSS 之前，将 `getThemeBootScript()` 返回值作为普通内联脚本输出；不要等 `type="module"` 或主题选择器升级后再恢复主题。

## 1. 迁移结论先看

迁移时遵守以下决策顺序：

1. **先查 Blora 组件清单**，再写 HTML、JSX、Vue 模板或 CSS。
2. 组件清单中有对应能力时，**必须使用对应 Blora 组件**。
3. Blora 组件已覆盖的交互，不得用 Tailwind utility、UI 框架组件、裸原生控件或自写组件替代。
4. 结构敏感控件使用 Composite Custom Element（复合自定义元素），不得复制它的内部 BEM 树（块-元素-修饰符结构）。
5. 业务代码只能拥有业务布局、业务数据和业务流程；组件结构、状态、键盘行为、焦点管理和视觉状态交给 Blora。
6. 所有颜色、间距、圆角、阴影、动效、层级和焦点样式使用 Blora token 或官方组件样式。
7. 所有交互状态必须同时有可访问的语义状态，不得只靠颜色区分。
8. 迁移完成前，旧 UI 框架的组件 CSS、theme provider、全局 reset 和重复组件实现必须移除或隔离。

### 1.1 “不使用浏览器原生组件”的准确执行口径

本项目禁止的是**业务直接使用未经过 Blora 统一的裸原生交互控件**，不是禁止 Blora 内部使用原生语义元素。

Blora 的 `Button` 是 `button.blora-button`，它仍然是原生 `button`；`Select`、`Search`、`Checkbox` 等 Composite CE 也会生成原生 `button`、`input`、`textarea`，以保留键盘、表单和辅助技术语义。这是正确实现，不属于绕过 Blora。

业务代码应遵守下表：

| 业务代码                     | 处理方式                                                                                 |
| ---------------------------- | ---------------------------------------------------------------------------------------- |
| 裸 `<button>`                | 改成 `.blora-button`，明确 `data-variant`、`data-size` 和 `type`                         |
| 裸 `<select>`                | 有 Blora 对应能力时改成 `<blora-select>`                                                 |
| 裸 `<input type="date">`     | 改成 `<blora-datepicker>`                                                                |
| 裸 `<input type="color">`    | 改成 `<blora-color-picker>`                                                              |
| 裸 `<input type="range">`    | 改成 `<blora-range>` 或 `<blora-slider>`                                                 |
| 裸 checkbox / radio / switch | 改成对应 Blora Composite CE                                                              |
| 裸 modal / drawer / popover  | 改成 `<blora-dialog>`、`<blora-drawer>`、`<blora-popover>`                               |
| 裸 tabs / segmented          | 改成 `<blora-tabs>`、`<blora-segmented>`                                                 |
| 裸 tooltip / dropdown        | 改成 `<blora-tooltip>`、`<blora-dropdown>`                                               |
| 无复杂交互的语义 HTML        | 可使用官方基础模式，例如 `<blockquote class="blora-quote">`、`.blora-card`、`.blora-tag` |

没有对应 Blora 组件的业务语义，可以使用原生 HTML 作为**内容语义**，但必须遵守 Blora 的 token、排版和无障碍规则。不得因为“没有现成组件”就复制一个通用组件。

## 2. 迁移前盘点

迁移前建立清单，不要边看页面边随意替换。

### 2.1 盘点对象

扫描以下内容：

- 路由和页面模板；
- UI 框架组件导入；
- Tailwind、Bootstrap utility 和 CSS-in-JS 样式；
- 自定义组件目录；
- 原生 `button`、`select`、`input`、`textarea`、`dialog`、`details`、`a[href]`；
- modal、drawer、popover、dropdown、tooltip、toast、notification、table、form、tabs、accordion；
- 图标来源，包括 Emoji、图标字体、Unicode 字符、SVG 字符串和第三方图标包；
- 颜色、间距、圆角、阴影、z-index 和动画变量；
- 全局 reset、主题 provider 和暗色模式覆盖；
- 依赖 `shadowRoot`、内部 class 或 DOM 查询的代码；
- 依赖页面语言、时区和浏览器默认文本的代码。

### 2.2 盘点表

每个旧 UI 节点至少记录：

| 字段            | 说明                                                |
| --------------- | --------------------------------------------------- |
| 页面/路由       | 节点出现的位置                                      |
| 旧实现          | 框架组件、原生控件或自定义实现                      |
| 交互类型        | 输入、选择、导航、反馈、浮层或内容展示              |
| 数据入口        | props、store、URL、接口或本地状态                   |
| 状态            | loading、empty、error、disabled、selected、expanded |
| 对应 Blora 能力 | 组件名、CSS 基础模式或公开 service                  |
| 迁移方式        | CE、CSS class、headless controller 或业务保留       |
| 验证路径        | 浏览器测试、axe、视觉回归或人工测试                 |

### 2.3 迁移前命令

```bash
# 扫描项目中的旧组件 class、内部结构和不符合迁移规范的实现
pnpm --filter @bloret-crew/blora-design run migrate:check -- ./src

# 查看完整组件清单和契约
node -e "const p=require('./packages/blora-design/component-manifest.json'); for(const c of p.components) console.log(c.name, c.kind, c.tagName || c.cssExport || '')"
```

## 3. 完整组件替换矩阵

以下矩阵是迁移的第一判断依据。`custom-element` 表示使用对应 Composite CE；`css-only` 表示使用官方 class 和语义 HTML；`native` 表示使用带有 Blora class 的原生元素；`headless` 表示业务保留开放 DOM，但必须使用官方 controller。

### 3.1 核心组件

| 能力               | Blora 2.0 实现                      | 类型               | 迁移要求                                                    |
| ------------------ | ----------------------------------- | ------------------ | ----------------------------------------------------------- |
| Accordion          | `<blora-accordion>`                 | Composite CE       | 不手写展开、收起、ARIA 和高度动画                           |
| Alert              | `<blora-alert>`                     | Composite CE       | 使用官方变体和状态语义                                      |
| Autocomplete       | `<blora-autocomplete>`              | Composite CE       | 不手写建议列表和键盘导航                                    |
| Avatar             | `.blora-avatar`                     | CSS-only           | 使用 `data-size`、`data-variant`、`data-shape`              |
| BackTop            | `<blora-backtop>`                   | Composite CE       | 不手写滚动监听和显示状态                                    |
| Badge              | `.blora-badge`                      | CSS-only           | 数量、状态和角标使用 Badge                                  |
| Banner             | `<blora-banner>`                    | Composite CE       | 使用官方内容和关闭行为                                      |
| Breadcrumb         | `<blora-breadcrumb>`                | Composite CE       | 不手写分隔符和可访问名称                                    |
| Button             | `<button class="blora-button">`     | Native + CSS       | 必须有 `type`，变体使用 `data-*`                            |
| Calendar           | `<blora-calendar>`                  | Composite CE       | 不手写日期网格和选中状态                                    |
| Card               | `.blora-card`                       | CSS-only           | 使用官方 surface、variant 和 token                          |
| Carousel           | `<blora-carousel>`                  | Composite CE       | 不手写轮播控制和索引状态                                    |
| Cascader           | `<blora-cascader>`                  | Composite CE       | 不手写级联面板和键盘逻辑                                    |
| Chart Container    | `<blora-chart-container>`           | Composite CE       | 图表库只负责内容，不负责外壳                                |
| Chat               | `<blora-chat>`                      | Composite CE       | 使用官方消息布局和状态结构                                  |
| Checkbox           | `<blora-checkbox>`                  | Form-associated CE | 使用 `name` / `value` / `checked`，由组件参与 FormData      |
| Collapse           | `<blora-collapse>`                  | Composite CE       | 不手写高度折叠逻辑                                          |
| Color Picker       | `<blora-color-picker>`              | Composite CE       | 不使用裸 color input                                        |
| Command Palette    | `<blora-command>`                   | Composite CE       | 使用 OverlayController 管理的官方浮层                       |
| Comment            | `<blora-comment>`                   | Composite CE       | 头像、正文、操作通过 slot 提供                              |
| Copy               | `<blora-copy>`                      | Composite CE       | 不手写复制按钮、状态文本和图标                              |
| Datepicker         | `<blora-datepicker>`                | Composite CE       | 不使用裸 date input                                         |
| Deck               | `<blora-deck>`                      | Composite CE       | 不复制卡片叠放结构                                          |
| Descriptions       | `.blora-descriptions`               | CSS-only           | 使用官方描述列表 class                                      |
| Dialog             | `<blora-dialog>`                    | Composite CE       | 不手写遮罩、焦点陷阱和 Escape                               |
| Divider            | `.blora-divider`                    | CSS-only           | 使用 `data-orientation` / `data-variant`                    |
| Dock               | `<blora-dock>`                      | Composite CE       | 不手写固定导航和展开状态                                    |
| Drawer             | `<blora-drawer>`                    | Composite CE       | 不手写抽屉、滚动锁和焦点返回                                |
| Dropdown           | `<blora-dropdown>`                  | Composite CE       | 使用 `placement="top"` 或 `placement="bottom"` 控制垂直方向 |
| Empty              | `<blora-empty>`                     | Composite CE       | 所有可为空的列表和表格提供 Empty                            |
| FAB                | `.blora-fab`                        | CSS-only           | 使用官方尺寸、变体和图标规则                                |
| Field              | `<blora-field>`                     | Composite CE       | 标签、提示、错误和计数统一由 Field 组织                     |
| Fieldset           | `.blora-fieldset`                   | CSS-only           | 使用真实 `fieldset` / `legend`                              |
| Filter             | `.blora-filter`                     | CSS-only           | 使用官方 radio 筛选模式                                     |
| Footer             | `.blora-footer`                     | CSS-only           | 使用官方布局 class                                          |
| Form               | `createFormController`              | Headless           | 业务保留表单 DOM，挂载后创建并销毁 controller               |
| Hero               | `.blora-hero`                       | CSS-only           | 使用官方对齐和 surface 变体                                 |
| Image              | `<blora-image>`                     | Composite CE       | 预览使用 `openImagePreview`，不手写预览层                   |
| Indicator          | `.blora-indicator`                  | CSS-only           | 使用官方位置和状态属性                                      |
| Input              | `<input class="blora-input">`       | Native + CSS       | 不使用未样式化文本输入框                                    |
| Join               | `.blora-join`                       | CSS-only           | 输入和按钮组合使用官方焊接规则                              |
| List               | `.blora-list`                       | CSS-only           | 使用官方列表和 hover 规则                                   |
| Masonry            | `.blora-masonry`                    | CSS-only           | 不复制网格布局组件                                          |
| Media              | `.blora-media`                      | CSS-only           | 使用官方比例和 object-fit 规则                              |
| Megamenu           | `<blora-megamenu>`                  | Composite CE       | 不手写多级导航浮层                                          |
| Mentions           | `<blora-mentions>`                  | Composite CE       | 不手写提及建议列表                                          |
| Menu               | `.blora-menu`                       | CSS-only           | 原生链接列表使用官方结构和样式                              |
| Message            | `message` service                   | CSS + service      | 不实现 toast；使用 `message.success()` 等                   |
| Mockup             | `<blora-mockup>`                    | Composite CE       | 展示代码或设备外壳使用官方组件                              |
| Navbar             | `<blora-navbar>`                    | Composite CE       | 品牌、导航、工具和行动区使用官方 slot/子项                  |
| Notification       | `notify` service                    | CSS + service      | 使用官方 notification 容器和 placement                      |
| Number Input       | `<blora-number-input>`              | Composite CE       | 不手写增减按钮和输入同步                                    |
| OTP                | `<blora-otp>`                       | Composite CE       | 不手写多格输入和粘贴行为                                    |
| Pagination         | `<blora-pagination>`                | Composite CE       | 不手写页码窗口和省略号规则                                  |
| Popconfirm         | `<blora-popconfirm>`                | Composite CE       | 不手写确认浮层和焦点行为                                    |
| Popover            | `<blora-popover>`                   | Composite CE       | 不手写定位、outside close 和层级                            |
| Progress           | `<blora-progress>`                  | Composite CE       | 使用官方进度语义和状态                                      |
| Radio              | `<blora-radio>`                     | Composite CE       | 不使用裸 radio 皮肤                                         |
| Range              | `<blora-range>`                     | Composite CE       | 不使用裸 range input                                        |
| Rate               | `<blora-rate>`                      | Composite CE       | 不手写星级输入和键盘状态                                    |
| Result             | `<blora-result>`                    | Composite CE       | 错误、成功和空结果使用官方结构                              |
| Search             | `<blora-search>`                    | Composite CE       | 不手写搜索清除按钮和表单关联                                |
| Segmented          | `<blora-segmented>`                 | Composite CE       | 互斥筛选和视图切换使用官方滑动指示器                        |
| Select             | `<blora-select>`                    | Composite CE       | 不使用裸 select 或第三方 select                             |
| Sidebar Navigation | `<blora-sidebar-nav>`               | Composite CE       | 不手写导航组、当前项和键盘状态                              |
| Skeleton           | `.blora-skeleton`                   | CSS-only           | loading 使用官方骨架                                        |
| Slider             | `<blora-slider>`                    | Composite CE       | 不手写滑块轨道、键盘和 tooltip                              |
| Speed Dial         | `<blora-speed-dial>`                | Composite CE       | 不手写展开方向和 outside close                              |
| Spinner            | `.blora-spinner`                    | CSS-only           | loading 使用官方 spinner                                    |
| Splitter           | `<blora-splitter>`                  | Composite CE       | 不手写拖拽分栏和方向逻辑                                    |
| Statistic          | `<blora-statistic>`                 | Composite CE       | 数字、标题和趋势使用官方结构                                |
| Steps              | `<blora-steps>`                     | Composite CE       | 不手写步骤状态和导航语义                                    |
| Swap               | `<blora-swap>`                      | Composite CE       | 不手写交换动画和状态                                        |
| Switch             | `<blora-switch>`                    | Composite CE       | 不使用裸 checkbox 模拟开关                                  |
| Table              | `createTableController`             | Headless           | 业务保留表格 DOM，行选由 controller 注入                    |
| Tabs               | `<blora-tabs>`                      | Composite CE       | 不手写选中状态、指示器和键盘导航                            |
| Tag                | `.blora-tag`                        | CSS-only           | 分类和可关闭标签使用官方样式                                |
| Tags Input         | `<blora-tags-input>`                | Composite CE       | 不手写 token 输入、删除和表单关联                           |
| Textarea           | `<textarea class="blora-textarea">` | Native + CSS       | 使用官方输入表面和 Field 组织                               |
| Timeline           | `<blora-timeline>`                  | Composite CE       | 时间顺序、连线和节点使用官方组件                            |
| Time Picker        | `<blora-timepicker>`                | Composite CE       | 不手写时间面板和键盘逻辑                                    |
| Tooltip            | `<blora-tooltip>`                   | Composite CE       | 不手写 hover/focus 浮层                                     |
| Tour               | `<blora-tour>`                      | Composite CE       | 不手写遮罩、聚焦和步骤导航                                  |
| Transfer           | `<blora-transfer>`                  | Composite CE       | 不手写双栏选择和移动逻辑                                    |
| Tree               | `<blora-tree>`                      | Composite CE       | 不手写树节点展开和键盘逻辑                                  |
| Tree Select        | `<blora-tree-select>`               | Composite CE       | 不手写树形下拉选择器                                        |
| Upload             | `<blora-upload>`                    | Composite CE       | 不手写文件输入表面和上传状态                                |

### 3.2 Add-on 组件和服务

| Add-on                               | 官方能力                                                                       | 迁移要求                                                                             |
| ------------------------------------ | ------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------ |
| `@bloret-crew/blora-design-thread`   | `<blora-thread-comment>`、`<blora-thread-composer>`                            | 评论卡片和撰写区使用官方 CE；评论排序、引用目标和请求由业务提供                      |
| `@bloret-crew/blora-design-markdown` | `<blora-markdown>`、`renderMarkdown()`                                         | 展示 Markdown 使用 CE；服务端字符串处理使用 `renderMarkdown()`；不可信 HTML 默认转义 |
| `@bloret-crew/blora-design-qrcode`   | `<blora-qrcode>`、`buildQRMatrix()`、`renderQRCode()`                          | 不接入第三方二维码视觉组件；SSR 可使用纯函数                                         |
| `@bloret-crew/blora-design-effects`  | Text FX、Rotate、Countdown、Count Up、Diff、Hover Gallery、Watermark、Shortcut | 使用官方 CE 或 service；不复制动效 CSS 和快捷键监听                                  |
| `@bloret-crew/blora-design-layout`   | Sidebar Layout、Affix、Anchor、Scroll Spy、Smooth Scroll                       | 页面骨架和滚动定位使用 add-on；Smooth Scroll 使用公开 service                        |
| `@bloret-crew/blora-design-theming`  | Palette Picker、Color Scheme Toggle、`applyTheme()`、`applyColorScheme()`      | 主题切换使用官方 picker/toggle 和 token；不写第二套暗色主题                          |

### 3.3 内容模式不是独立组件

部分内容模式使用原生语义 HTML + Blora class，不会单独出现在 Showcase 组件目录：

```html
<blockquote class="blora-quote">
  这是一段引用。
  <cite>来源</cite>
</blockquote>

<article class="blora-card">
  <h2>内容标题</h2>
  <p>正文内容。</p>
</article>
```

以下内容应优先使用官方基础 class，而不是新建 `BloraQuote`、`BloraCard` 等业务组件：

- `blockquote.blora-quote`；
- `.blora-card`；
- `.blora-list`；
- `.blora-divider`；
- `.blora-fieldset`；
- `.blora-hero`；
- `.blora-footer`；
- `.blora-menu`；
- `.blora-descriptions`。

## 4. 按旧技术栈迁移

### 4.1 Bootstrap

| Bootstrap            | Blora 2.0                                                  |
| -------------------- | ---------------------------------------------------------- |
| `.btn btn-primary`   | `.blora-button[data-variant="primary"]`                    |
| `.btn btn-secondary` | `.blora-button[data-variant="secondary"]`                  |
| `.btn btn-sm`        | `.blora-button[data-size="sm"]`                            |
| `.form-control`      | `<blora-input>`、`<blora-textarea>` 或 `<blora-field>`     |
| `.form-select`       | `<blora-select>`                                           |
| `.form-check`        | `<blora-checkbox>` 或 `<blora-radio>`                      |
| `.modal`             | `<blora-dialog>`                                           |
| `.offcanvas`         | `<blora-drawer>`                                           |
| `.dropdown`          | `<blora-dropdown>`                                         |
| `.collapse`          | `<blora-collapse>`                                         |
| `.accordion`         | `<blora-accordion>`                                        |
| `.nav-tabs`          | `<blora-tabs>`                                             |
| `.pagination`        | `<blora-pagination>`                                       |
| `.badge`             | `.blora-badge`                                             |
| `.alert`             | `<blora-alert>`                                            |
| `.table`             | `.blora-table` + `createTableController`（需要高级行为时） |

迁移后删除 Bootstrap 的组件 CSS 和 reset。不要在 `.blora-*` 节点上继续叠加 `btn`、`form-control`、`rounded-*`、`shadow-*` 等 Bootstrap class。

### 4.2 Tailwind

Tailwind 可继续作为业务布局工具，迁移后的限制如下：

- 不在 Blora 组件上叠加 Tailwind 的颜色、圆角、阴影、字体、焦点和状态 utility；
- 不用 Tailwind `flex`、`grid`、`p-*` 去重写 Composite CE 内部结构；
- `space-*`、`gap-*`、`text-*`、`bg-*` 不得覆盖组件官方状态；
- 页面自己的 grid/flex 布局可以使用 Tailwind，但尺寸、颜色和层级优先映射到 Blora token；
- Tailwind theme 中的颜色和 spacing 不得成为第二套设计语言；
- 建议建立 lint 规则，禁止 `className` 同时出现旧组件 class 和 `blora-*` 组件 class。

示例：

```tsx
// 合法：Tailwind 只负责业务布局，Blora 负责按钮表面
<div className="flex items-center gap-4">
  <button type="button" className="blora-button" data-variant="primary">
    保存
  </button>
</div>
```

```tsx
// 不合格：Tailwind 重写了 Blora 按钮的设计语言
<button className="blora-button rounded-none bg-red-500 px-8 shadow-xl hover:bg-red-600">
  保存
</button>
```

### 4.3 Ant Design / Ant Design Vue

| Ant                                | Blora 2.0                                |
| ---------------------------------- | ---------------------------------------- |
| `Button`                           | `.blora-button`                          |
| `Input` / `Input.TextArea`         | `<blora-input>` / `<blora-textarea>`     |
| `Select`                           | `<blora-select>`                         |
| `DatePicker`                       | `<blora-datepicker>`                     |
| `ColorPicker`                      | `<blora-color-picker>`                   |
| `Checkbox` / `Radio` / `Switch`    | 对应 Blora CE                            |
| `Modal`                            | `<blora-dialog>`                         |
| `Drawer`                           | `<blora-drawer>`                         |
| `Popover` / `Tooltip` / `Dropdown` | 对应 Blora CE                            |
| `Tabs` / `Segmented`               | 对应 Blora CE                            |
| `Table`                            | `.blora-table` + `createTableController` |
| `Tag` / `Badge` / `Alert`          | 对应 Blora class/CE                      |
| `message` / `notification`         | Blora `message` / `notify`               |

卸载 Ant 的 `ConfigProvider` 主题 token 和组件样式。React/Vue 仍可保留作为应用框架，但不要同时渲染 Ant 和 Blora 两套同类控件。

### 4.4 Element Plus / Naive UI / Vuetify / MUI / PrimeVue

按语义替换，不按旧组件名机械替换：

- `ElButton`、`NButton`、`VBtn`、MUI `Button`、PrimeVue `Button` → `.blora-button`；
- `ElSelect`、`NSelect`、`VSelect`、MUI `Select`、PrimeVue `Select` → `<blora-select>`；
- `ElDialog`、`NModal`、`VDialog`、MUI `Dialog`、PrimeVue `Dialog` → `<blora-dialog>`；
- `ElTable`、`NDataTable`、`VDataTable`、MUI Table、PrimeVue DataTable → `.blora-table` + 官方 controller；
- `ElMessage`、`useMessage`、Vuetify Snackbar、MUI Snackbar、PrimeVue Toast → `message` 或 `notify`；
- `ElTabs`、`NTabs`、`VTabs`、MUI Tabs、PrimeVue Tabs → `<blora-tabs>`；
- 各框架的 Tag、Badge、Alert、Card、Pagination、Tooltip、Dropdown、DatePicker 等，按第 3 节矩阵替换。

不要让旧 UI 框架处于“只提供行为、Blora 覆盖样式”的半迁移状态。旧组件的 DOM 结构、ARIA 约定、状态 class 和主题变量仍会与 Blora 冲突。

### 4.5 shadcn/ui、Headless UI、Radix、Reka UI

这些库通常把组件源码复制到项目中。迁移时不能只换颜色：

1. 删除与 Blora 能力重复的复制组件；
2. 结构敏感控件改渲染 Blora Composite CE；
3. Table、Tree、Form 等开放 DOM 场景才保留 headless 行为，并使用 Blora controller；
4. 删除复制组件的 `data-state`、焦点环、popover 定位和动画 CSS；
5. 业务布局保留在宿主项目，组件内部结构交给 Blora。

### 4.6 React

React 负责数据、状态、路由和业务事件；Blora 负责组件结构和视觉。

```tsx
import { useEffect, useRef } from "react";
import "@bloret-crew/blora-design/blora.css";
import "@bloret-crew/blora-design/auto";
import { createTableController } from "@bloret-crew/blora-design";

export function Members({ rows }) {
  const tableRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!tableRef.current) return;
    const controller = createTableController(tableRef.current);
    return () => controller.destroy();
  }, []);

  return (
    <div className="blora-table-wrap" data-blora-selectable ref={tableRef}>
      <table className="blora-table">
        <thead>
          <tr>
            <th data-sort data-col-key="name">
              成员
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id} data-row-key={row.id}>
              <td>{row.name}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

Composite CE 不需要 React ref controller。直接渲染标签：

```tsx
<blora-dialog open aria-label="删除成员">
  <p>确定要删除这个成员吗？</p>
</blora-dialog>
```

JSX 类型提示可按项目需要扩展 JSX intrinsic elements；不要为了类型提示复制组件实现。

### 4.7 Vue

```vue
<script setup>
import { onMounted, onBeforeUnmount, ref } from "vue";
import "@bloret-crew/blora-design/blora.css";
import "@bloret-crew/blora-design/auto";
import { createTableController } from "@bloret-crew/blora-design";

const tableRoot = ref(null);
let controller;
onMounted(() => {
  controller = createTableController(tableRoot.value);
});
onBeforeUnmount(() => controller?.destroy());
</script>

<template>
  <div ref="tableRoot" class="blora-table-wrap" data-blora-selectable>
    <table class="blora-table">
      <thead>
        <tr>
          <th data-sort data-col-key="name">成员</th>
        </tr>
      </thead>
      <tbody>
        <tr data-row-key="u1">
          <td>张三</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
```

`<blora-select>`、`<blora-tabs>`、`<blora-dialog>` 等 Composite CE 直接放进 Vue 模板；不要在 `onMounted` 中再次手写内部结构。

### 4.8 Svelte / Angular / 其他框架

规则相同：

- 在应用入口加载 `blora.css` 和 `@bloret-crew/blora-design/auto`；
- Composite CE 直接作为模板标签；
- Table/Form 等 controller 在 mount 生命周期创建；
- 在 unmount/destroy 生命周期调用 `destroy()`；
- 框架事件与 Blora `CustomEvent` 对接时读取 `event.detail`；
- 不依赖 shadow root 或内部生成节点；
- 不在框架组件封装层重新定义同名 Button、Select、Dialog 等组件。

## 5. 样式和设计语言迁移规则

### 5.1 样式入口

推荐聚合入口：

```ts
import "@bloret-crew/blora-design/blora.css";
import "@bloret-crew/blora-design/auto";
```

按需入口：

```ts
import "@bloret-crew/blora-design/tokens.css";
import "@bloret-crew/blora-design/foundations.css";
import "@bloret-crew/blora-design/components/button.css";
```

Add-on 样式按需引入：

```ts
import "@bloret-crew/blora-design-thread/thread.css";
import "@bloret-crew/blora-design-theming/theming.css";
```

不要同时加载旧 UI 框架的 reset、组件主题和 Blora 的同名组件样式。

### 5.2 Token 规则

业务 CSS 使用语义 token：

```css
.page-shell {
  color: var(--blora-color-text-primary);
  background: var(--blora-color-surface-canvas);
  padding: var(--blora-space-6);
  border-radius: var(--blora-radius-lg);
}
```

禁止：

```css
/* 禁止在迁移后的 Blora 组件皮肤里写这些 */
color: #1677ff;
padding: 13px;
border-radius: 11px;
box-shadow: 0 8px 24px rgb(0 0 0 / 20%);
z-index: 9999;
```

如果确实需要新的公共 token，必须先更新 token contract、生成文件和文档；业务页面不能自行创造 `--blora-*` 公共变量。

### 5.3 视觉状态

- 选中使用 `aria-selected`、`aria-checked`、`aria-pressed` 或官方 `data-*` 状态；
- 展开使用 `aria-expanded` 和官方 CE；
- 当前导航使用 `aria-current="page"`；
- loading 使用官方 spinner/skeleton/loading 状态；
- empty 使用 `<blora-empty>`；
- error 使用 Alert/Result/Field 的官方错误状态；
- focus 使用全局 `:focus-visible` 焦点环；
- `prefers-reduced-motion` 下不得保留必须依赖动画才能理解的状态。

### 5.4 图标

所有操作、状态和导航图标使用 `createBloraIcon()` 或官方组件生成的 Lucide SVG：

```ts
import { createBloraIcon } from "@bloret-crew/blora-design";
const icon = createBloraIcon("settings", 18);
```

禁止：

- Emoji 作为操作图标；
- `+`、`×`、`→`、`★`、`‹`、`›` 等文本字符冒充图标；
- icon font；
- 直接复制第三方组件库的 SVG；
- 只给图标不给 `aria-label`；
- 图标颜色低于 WCAG 非文本 3:1。

## 6. Composite CE 使用规范

### 6.1 注册

推荐在应用入口注册：

```ts
import "@bloret-crew/blora-design/auto";
```

只按需注册时使用具名定义函数。不要在多个页面重复注册或重复初始化。

### 6.2 属性和事件

所有属性、方法、事件和 slot 以对应 contract 为准：

```text
packages/blora-design/contracts/<component>.contract.json
addons/<name>/contracts/<name>.contract.json
```

不允许消费侧自行添加未登记的：

- 公共属性；
- 公共事件；
- CSS class；
- CSS custom property；
- CSS part；
- slot 名称。

### 6.3 禁止依赖内部结构

不要写：

```js
component.shadowRoot.querySelector(".internal-popup");
```

不要写：

```css
blora-select .blora-select__private-list { ... }
```

只使用 contract 声明的公共接口。需要新能力时先改 contract，再改组件和测试。

## 7. 表单、数据和生命周期

### 7.1 表单

- Field、Input、Select、Checkbox、Radio、Switch、Number Input、Range、Slider、Search、Upload、Tags Input、OTP 按官方 contract 使用；
- 不使用 placeholder 代替 label；
- 业务表单保留真实 `form` 语义；
- Table/Form controller 必须绑定到稳定的根节点；
- controller 在卸载时必须 `destroy()`；
- 不要同时把同一字段交给两套表单库注册；
- 提交错误使用 Field/Alert/Result 的官方状态。

### 7.2 Table

表格业务数据和列由应用拥有，表面和高级行为由 Blora 提供：

```html
<div class="blora-table-wrap" data-blora-selectable>
  <table class="blora-table">
    <thead>
      ...
    </thead>
    <tbody>
      ...
    </tbody>
  </table>
</div>
```

不要手写：

- 行选择 checkbox 列；
- 批量操作条；
- 排序指示器；
- 分页窗口；
- 虚拟滚动容器；
- 空、loading 和错误状态的重复表面。

### 7.3 业务动态内容

不要用 `innerHTML` 写入用户内容。使用 `textContent`、DOM API 或官方 Markdown renderer，并明确是否允许 HTML。

```js
status.textContent = userMessage;
```

## 8. 主题、语言和响应式

### 8.1 主题

使用 Theming add-on 的官方接口和 `data-blora-theme` / `data-blora-color-scheme`。不要为每个旧 UI 框架保留一套暗色覆盖。

```ts
import "@bloret-crew/blora-design-theming";
import { applyTheme, applyColorScheme } from "@bloret-crew/blora-design-theming";

applyTheme("coral");
applyColorScheme("dark");
```

所有六套主题都必须检查：

```text
coral / indigo / graphite / mono / circuit / dusk
```

### 8.2 语言

- 页面设置正确的 `<html lang>`；
- Blora 自动生成的 chrome 使用 locale pack；
- 业务文案由业务应用翻译；
- 不在框架适配层硬编码中文或英文；
- 新增公共 chrome 文案时同时更新 `en` 和 `zh-CN` locale；
- 不能通过替换组件内部文本绕过 i18n。

### 8.3 响应式

至少检查：

- 320px；
- 390px；
- 768px；
- 1440px；
- 触摸输入；
- 键盘输入；
- RTL；
- reduced motion。

移动端不通过隐藏焦点、裁切菜单、压缩触摸目标或删除 label 来“适配”。

## 9. 分阶段迁移流程

### 阶段 A：建立 Blora 基础

- [ ] 记录当前路由、UI 框架和自定义组件；
- [ ] 安装 `@bloret-crew/blora-design@latest`；
- [ ] 导入 `blora.css` 和 `auto`；
- [ ] 设置页面 `blora-page blora-scope`；
- [ ] 移除重复 reset 和旧组件主题；
- [ ] 建立 Blora token 使用规则和 lint 规则。

### 阶段 B：替换结构敏感交互

按风险从高到低迁移：

1. Dialog、Drawer、Popover、Dropdown、Tooltip；
2. Select、Datepicker、Time Picker、Color Picker；
3. Tabs、Segmented、Accordion、Collapse；
4. Search、Autocomplete、Mentions、Transfer、Tree Select；
5. Table、Form、Upload 和文件交互；
6. Navbar、Sidebar Navigation、Pagination、Timeline。

每替换一组组件，同时删除旧组件实现、旧事件桥接和旧状态 CSS。

### 阶段 C：替换基础表面

- [ ] Button；
- [ ] Card、List、Descriptions、Fieldset；
- [ ] Tag、Badge、Alert、Banner、Message、Notification；
- [ ] Avatar、Image、Media、Hero、Footer；
- [ ] Progress、Spinner、Skeleton、Empty、Result、Statistic；
- [ ] Divider、Indicator、FAB、Join、Masonry。

### 阶段 D：统一图标、主题和文案

- [ ] 清除 Emoji、icon font 和文本字符图标；
- [ ] 所有颜色迁移到 Blora token；
- [ ] 所有主题和深色模式通过浏览器实测；
- [ ] 所有组件 chrome 走 locale；
- [ ] 所有状态具备文字、图标或结构辅助，不只依赖颜色。

### 阶段 E：删除旧实现

- [ ] 删除旧 UI 框架组件导入；
- [ ] 删除旧组件目录；
- [ ] 删除旧组件 CSS 和主题 provider；
- [ ] 删除旧 DOM 查询和状态 class；
- [ ] 删除旧组件测试；
- [ ] 删除只为旧组件保留的 token 和 utility；
- [ ] 确认依赖树中没有重复 UI 组件库。

## 10. 严格禁止事项

以下任一项存在，都不能称为完成迁移：

1. 已有 Blora 组件却继续使用同类旧框架组件；
2. 已有 Blora 组件却复制一份业务组件；
3. 手写 Select、Modal、Drawer、Tabs、Tooltip、Dropdown、Accordion、Datepicker、Pagination 或 Table 选择列；
4. 直接使用 `shadowRoot` 或未声明的内部 class；
5. 用 Tailwind、Bootstrap 或 CSS-in-JS 覆盖 Blora 组件状态；
6. 在组件 CSS 中写死颜色、间距、圆角、阴影、动效或 z-index；
7. 用 Emoji、图标字体或文本字符替代 Lucide SVG；
8. 用 `innerHTML` 写入用户内容；
9. 只用颜色表达错误、成功、选中或禁用；
10. 通过 `outline: none` 删除焦点而没有等价的可见焦点方案；
11. 通过 `overflow: hidden` 裁切菜单、焦点环或触摸目标；
12. 在业务层硬编码组件 chrome 语言；
13. controller 初始化后没有在卸载时 `destroy()`；
14. 只验证 Chromium，不验证移动端、Firefox、WebKit 或已约定的 Safari 人工路径；
15. 只截一张页面截图，不操作真实交互；
16. 不更新 contract、API snapshot、CHANGELOG 或迁移文档就扩展公共 API；
17. 把“能显示”当作迁移完成，却没有检查空、错、loading、disabled、键盘和 reduced-motion 状态。

## 11. 迁移验收清单

### 11.1 结构

- [ ] 组件矩阵中有对应能力的节点全部改用 Blora；
- [ ] 没有重复的 Button、Select、Dialog、Tabs、Table 等组件；
- [ ] Composite CE 由 `@bloret-crew/blora-design/auto` 或官方 add-on 注册；
- [ ] 业务代码没有复制内部 BEM 树；
- [ ] 没有直接访问 shadow root；
- [ ] Table/Form controller 有完整生命周期。

### 11.2 视觉

- [ ] 页面使用 `blora.css` 或官方组件 CSS；
- [ ] 颜色、间距、圆角、阴影、动效和层级使用 token；
- [ ] 没有旧框架组件主题覆盖；
- [ ] 组件状态和页面布局在六套主题中一致；
- [ ] 首尾圆角、裁切容器、浮层边界和焦点环均完整；
- [ ] 移动端没有横向溢出；
- [ ] 视觉结果与 Showcase v2 和冻结基线一致，允许的差异已记录。

### 11.3 行为和无障碍

- [ ] 所有按钮有明确 `type`；
- [ ] icon-only 控件有 `aria-label`；
- [ ] Tab、方向键、Enter、Space、Escape 行为可用；
- [ ] 焦点环在所有交互元素上可见；
- [ ] Dialog/Drawer/Popover 的焦点陷阱、返回焦点和 outside close 正常；
- [ ] 表单 label、错误、描述和提交状态关联正确；
- [ ] loading、empty、error、disabled、selected、expanded 状态可理解；
- [ ] axe 没有 serious 或 critical 问题；
- [ ] 文本达到 WCAG 2.2 AA，图标达到非文本 3:1；
- [ ] reduced motion、RTL 和 320px 路径通过。

### 11.4 发布门禁

```bash
pnpm --filter @bloret-crew/blora-design run migrate:check -- ./src
pnpm lint
pnpm lint:css
pnpm lint:contracts
pnpm lint:contrast
pnpm typecheck
pnpm test
pnpm test:browser
pnpm test:a11y
pnpm test:visual
pnpm verify
```

发布前还要完成：

- [ ] npm clean consumer 安装；
- [ ] ESM 和 SSR import；
- [ ] CDN IIFE；
- [ ] CSP 页面；
- [ ] Firefox、WebKit 和 Safari 人工路径；
- [ ] package exports、publint、attw、pack；
- [ ] 版本、CHANGELOG、迁移记录和发布 tag 对齐。

## 12. 迁移完成定义

迁移完成必须同时满足三个条件：

1. **能力归属正确**：Blora 已覆盖的能力全部由 Blora 提供，业务只保留数据和业务流程；
2. **视觉归属正确**：页面只使用 Blora 的组件样式和 token，不存在第二套交互视觉；
3. **验证证据完整**：结构、行为、无障碍、主题、响应式、跨浏览器和发布门禁均有结果。

“旧 UI 框架的组件换了颜色”不算迁移完成；“页面能渲染”也不算迁移完成。只有旧组件实现已经退出、Blora 组件拥有对应能力、验收清单全部通过，项目才可以标记为已迁移到 Blora Design 2.0。

## 13. 相关文档

- [Blora Design 2.0 使用指南](../guide.md)
- [组件 contract](../../packages/blora-design/contracts/)
- [组件 manifest](../../packages/blora-design/component-manifest.json)
- [Showcase v2](../../examples/showcase-v2/)
- [发布与最终验收记录](../refactor/rc-release-rehearsal.md)
- [浏览器矩阵](../refactor/browser-matrix.md)

## 14. 每个核心组件的最小示例

所有示例都从已发布 npm 包导入。示例中的标签、属性、事件和 slot 以对应 contract 与 Showcase v2 为准；不要把示例改写成项目内复制的组件。

**npm-only 强制规则**：消费项目必须从 npm 安装 `@bloret-crew/blora-design` 和官方 add-on 包，并使用包的 `exports`；禁止引用本仓库或 git 仓库中的 `packages/**/src`、`addons/**/src`，禁止复制组件源码、内部 CSS 或生成文件。下面所有 `import` 都是 npm 包导入，示例中的 `/images/*` 仅代表消费项目自己的业务资源。

安装并导入：

```bash
pnpm add @bloret-crew/blora-design
```

```ts
import "@bloret-crew/blora-design/blora.css";
import "@bloret-crew/blora-design/auto";
```

### Accordion（accordion）

```html
<blora-accordion>
  <blora-accordion-item heading="设计令牌" open
    >颜色、间距和圆角来自统一 token。</blora-accordion-item
  >
  <blora-accordion-item heading="组件结构">结构由官方 CE 生成。</blora-accordion-item>
</blora-accordion>
```

### Alert（alert）

```html
<blora-alert variant="info" title="提示" description="这是一条信息。"></blora-alert>
```

### Autocomplete（autocomplete）

```html
<blora-autocomplete label="组件" placeholder="搜索组件…">
  <blora-autocomplete-option value="Button"></blora-autocomplete-option>
  <blora-autocomplete-option value="Dialog"></blora-autocomplete-option>
  <blora-autocomplete-option value="Table"></blora-autocomplete-option>
</blora-autocomplete>
```

### Avatar（avatar）

```html
<span class="blora-avatar" data-size="md" data-variant="primary">Lo</span>
```

### Backtop（backtop）

```html
<blora-backtop target="body" show-after="120" label="返回顶部"></blora-backtop>
```

### Badge（badge）

```html
<span class="blora-badge" data-variant="success" data-shape="pill">已完成</span>
```

### Banner（banner）

```html
<blora-banner title="Blora Design 2.0" description="当前使用统一的设计语言。"
  ><blora-banner-action label="查看指南" value="guide" variant="primary"></blora-banner-action
></blora-banner>
```

### Breadcrumb（breadcrumb）

```html
<blora-breadcrumb>
  <blora-breadcrumb-item label="首页" href="/"></blora-breadcrumb-item>
  <blora-breadcrumb-item label="设置" href="/settings"></blora-breadcrumb-item>
  <blora-breadcrumb-item label="主题" current></blora-breadcrumb-item>
</blora-breadcrumb>
```

### Button（button）

```html
<button type="button" class="blora-button" data-variant="primary">保存</button>
```

### Calendar（calendar）

```html
<blora-calendar value="2026-08-28"></blora-calendar>
```

### Card（card）

```html
<article class="blora-card">
  <h2>项目概览</h2>
  <p>卡片内容使用 Blora surface 和 token。</p>
</article>
```

### Carousel（carousel）

```html
<blora-carousel label="项目图片">
  <blora-carousel-slide label="第一张"><img src="/images/one.jpg" alt="第一张图片" /></blora-carousel-slide>
  <blora-carousel-slide label="第二张"><img src="/images/two.jpg" alt="第二张图片" /></blora-carousel-slide>
</blora-carousel>
```

### Cascader（cascader）

```html
<blora-cascader placeholder="选择成员" show-result>
  <blora-cascader-option label="技术部">
    <blora-cascader-option label="前端组">
      <blora-cascader-option label="张三"></blora-cascader-option>
      <blora-cascader-option label="李四"></blora-cascader-option>
    </blora-cascader-option>
  </blora-cascader-option>
  <blora-cascader-option label="产品部">
    <blora-cascader-option label="桌面组">
      <blora-cascader-option label="周十"></blora-cascader-option>
    </blora-cascader-option>
  </blora-cascader-option>
</blora-cascader>
```

### ChartContainer（chart-container）

```html
<blora-chart-container title="销售趋势" subtitle="最近 7 天" trend="+12%" trend-variant="success">
  <svg viewBox="0 0 400 160" width="100%" height="160" role="img" aria-label="销售趋势折线图">
    <polyline points="0,120 114,90 228,60 342,40 400,20" fill="none" stroke="currentColor" stroke-width="2.5"></polyline>
  </svg>
</blora-chart-container>
```

### Chat（chat）

```html
<blora-chat author="Alice" time="10:24" avatar="A" message="设计稿已经更新。"></blora-chat>
<blora-chat author="Blora" time="10:26" avatar="B" message="收到，我来检查组件状态。" side="end" avatar-variant="primary"></blora-chat>
```

### Checkbox（checkbox）

```html
<form id="terms-form">
  <blora-checkbox name="terms" value="accepted">同意服务条款</blora-checkbox>
  <button type="submit" class="blora-button" data-variant="primary">继续</button>
</form>
<script type="module">
  document.querySelector("#terms-form")?.addEventListener("submit", (event) => {
    event.preventDefault();
    const values = new FormData(event.currentTarget);
    console.log(values.get("terms"));
  });
</script>
```

### Collapse（collapse）

```html
<blora-collapse>
  <blora-collapse-item heading="详情">可折叠内容。</blora-collapse-item>
</blora-collapse>
```

### ColorPicker（color-picker）

```html
<blora-color-picker label="品牌颜色" value="#7fadad"></blora-color-picker>
```

### CommandPalette（command-palette）

```html
<blora-command placeholder="输入命令或搜索…">
  <blora-command-item value="new" icon="document" shortcut="⌘N">新建文档</blora-command-item>
  <blora-command-item value="open" icon="folder" shortcut="⌘O">打开文件</blora-command-item>
  <blora-command-item value="settings" icon="settings" shortcut="⌘,">设置</blora-command-item>
</blora-command>
```

### Comment（comment）

```html
<blora-comment>
  <span slot="author">Loong</span>
  <time slot="time" datetime="2026-08-28">刚刚</time>
  <p>这是一条评论。</p>
</blora-comment>
```

### Copy（copy）

```html
<blora-copy text="npm install @bloret-crew/blora-design" label="复制安装命令"></blora-copy>

<!-- Sensitive values stay copyable while their display is masked by default. -->
<blora-copy text="sk_live_7f3a9c2d" masked label="复制 API Key"></blora-copy>
```

### Datepicker（datepicker）

```html
<blora-datepicker name="date" value="2026-08-28" placeholder="选择日期"></blora-datepicker>
```

### Deck（deck）

```html
<blora-deck>
  <article class="blora-card">第一张卡片</article>
  <article class="blora-card">第二张卡片</article>
</blora-deck>
```

### Descriptions（descriptions）

```html
<table class="blora-descriptions">
  <tbody>
    <tr><th>状态</th><td>在线</td></tr>
    <tr><th>版本</th><td>2.0.8</td></tr>
  </tbody>
</table>
```

### Dialog（dialog）

```html
<button type="button" class="blora-button" data-variant="primary" id="open-dialog">
  打开对话框
</button>
<blora-dialog id="confirm-dialog">
  <span slot="title">删除成员</span>
  <p>确定要删除这个成员吗？</p>
</blora-dialog>
<script type="module">
  const dialog = document.querySelector("#confirm-dialog");
  document.querySelector("#open-dialog")?.addEventListener("click", () => dialog.show());
</script>
```

### Divider（divider）

```html
<hr class="blora-divider" data-orientation="horizontal" />
```

### Dock（dock）

```html
<blora-dock label="主导航" static>
  <blora-dock-item value="home" href="/" icon="home" active><span>首页</span></blora-dock-item>
  <blora-dock-item value="projects" href="/projects" icon="folder"><span>项目</span></blora-dock-item>
</blora-dock>
```

### Drawer（drawer）

```html
<button type="button" class="blora-button" id="open-drawer">打开菜单</button>
<blora-drawer id="nav-drawer" title="导航菜单">菜单内容</blora-drawer>
<script type="module">
  const drawer = document.querySelector("#nav-drawer");
  document.querySelector("#open-drawer")?.addEventListener("click", () => drawer.open());
</script>
```

### Dropdown（dropdown）

```html
<blora-dropdown label="更多操作" placement="top">
  <blora-dropdown-item value="rename">重命名</blora-dropdown-item>
  <blora-dropdown-item value="delete">删除</blora-dropdown-item>
</blora-dropdown>

<!-- 也可以把头像和用户信息作为整个触发区域。 -->
<blora-dropdown aria-label="Loong 用户菜单">
  <div slot="trigger" aria-label="打开 Loong 用户菜单">
    <span class="blora-avatar" data-size="md" data-variant="primary">Lo</span>
    <strong>Loong</strong>
    <span>Coding · 在线</span>
  </div>
  <blora-dropdown-item value="profile">个人资料</blora-dropdown-item>
  <blora-dropdown-item value="settings">设置</blora-dropdown-item>
</blora-dropdown>
```

### Empty（empty）

```html
<blora-empty id="projects-empty" title="暂无项目" description="创建项目后，它们会显示在这里。" action-label="创建项目"></blora-empty>
<script type="module">
  document
    .querySelector("#projects-empty")
    ?.addEventListener("blora-empty-action", () => openCreateDialog());
</script>
```

### Fab（fab）

```html
<button type="button" class="blora-fab" data-variant="primary" aria-label="新建项目">
  <span data-icon="plus"></span>
</button>
```

### Field（field）

```html
<!-- 属性写法：Field 生成 label、原生 input、提示和错误。 -->
<blora-field label="项目名称" name="project" required hint="最多 40 个字符" maxlength="40"></blora-field>

<!-- 子控件写法（2.0.9+）：写在里面的原生 input/textarea 会被保留，type、name、autocomplete 不会丢。 -->
<blora-field label="密码" hint="至少 8 位" required>
  <input class="blora-input" type="password" name="password" autocomplete="current-password" />
</blora-field>
```

不要在 Field 外面再手写 `<label>`、大号标题或 `.blora-field__*` 结构；错误信息写在 `error` 属性上，Field 会同步 `aria-invalid` 和 `aria-describedby`。

### Fieldset（fieldset）

```html
<fieldset class="blora-fieldset">
  <legend>通知设置</legend>
  <blora-checkbox>接收邮件通知</blora-checkbox>
</fieldset>
```

### Filter（filter）

```html
<form class="blora-filter" aria-label="状态筛选">
  <label class="blora-filter__item"
    ><input type="radio" name="status" value="all" checked /><span class="blora-filter__label"
      >全部</span
    ></label
  >
  <label class="blora-filter__item"
    ><input type="radio" name="status" value="open" /><span class="blora-filter__label"
      >进行中</span
    ></label
  >
</form>
```

### Footer（footer）

```html
<footer class="blora-footer">
  <span>© 2026 Blora Design</span>
  <nav><a href="/docs">文档</a></nav>
</footer>
```

### Form（form）

```html
<form class="blora-form" id="profile-form">
  <blora-field label="昵称" name="nickname"></blora-field>
  <button type="submit" class="blora-button" data-variant="primary">保存</button>
</form>
<script type="module">
  import { createFormController } from "@bloret-crew/blora-design";
  const controller = createFormController(document.querySelector("#profile-form"));
  window.addEventListener("pagehide", () => controller.destroy(), { once: true });
</script>
```


### Hero（hero）

```html
<section class="blora-hero" data-align="center">
  <h1>管理你的项目</h1>
  <p>用统一的设计语言构建界面。</p>
</section>
```

### Image（image）

```html
<blora-image src="/images/project.png" alt="项目预览" preview></blora-image>
```

### Indicator（indicator）

```html
<span class="blora-indicator" data-placement="top-end" data-variant="danger">3</span>
```

### Input（input）

```html
<!-- 需要标签/提示/错误时放进 blora-field（见 Field）；单独使用时给 aria-label。 -->
<input class="blora-input" type="text" name="project" aria-label="项目名称" />

<!-- Use the compact size for dense inline editing, such as a key name. -->
<input class="blora-input" data-size="sm" type="text" name="keyName" aria-label="Key 名称" />
```

### Join（join）

```html
<div class="blora-join">
  <input class="blora-input" placeholder="搜索项目" />
  <button type="button" class="blora-button" data-variant="primary">搜索</button>
</div>
```

### List（list）

```html
<ul class="blora-list" data-hover>
  <li class="blora-list__item">项目一</li>
  <li class="blora-list__item">项目二</li>
</ul>
```

### Masonry（masonry）

```html
<div class="blora-masonry">
  <article class="blora-card">内容 A</article>
  <article class="blora-card">内容 B</article>
</div>
```

### Media（media）

```html
<figure class="blora-media" data-ratio="16:9">
  <img src="/images/cover.jpg" alt="封面" />
</figure>
```

### Megamenu（megamenu）

```html
<blora-megamenu label="产品">
  <blora-megamenu-section title="设计"><a href="/design">设计系统</a></blora-megamenu-section>
  <blora-megamenu-section title="组件"><a href="/components">组件</a></blora-megamenu-section>
</blora-megamenu>
```

### Mentions（mentions）

```html
<blora-mentions label="评论" placeholder="输入 @ 提及用户">
  <blora-mention value="alice"></blora-mention>
  <blora-mention value="bob"></blora-mention>
  <blora-mention value="carol"></blora-mention>
</blora-mentions>
```

### Menu（menu）

```html
<nav class="blora-menu" aria-label="项目菜单">
  <a href="/overview" aria-current="page">概览</a>
  <a href="/settings">设置</a>
</nav>
```

### Message（message）

```html
<script type="module">
  import { message } from "@bloret-crew/blora-design";
  message.success("保存成功");
</script>
```

### Mockup（mockup）

```html
<blora-mockup title="安装命令">
  <code>npm install @bloret-crew/blora-design</code>
</blora-mockup>
```

### Navbar（navbar）

```html
<blora-navbar title="Blora Design" brand-href="/">
  <blora-navbar-link label="文档" href="/docs"></blora-navbar-link>
  <blora-navbar-action label="开始使用" href="/start" variant="primary"></blora-navbar-action>
</blora-navbar>
```

### Notification（notification）

```html
<script type="module">
  import { notify } from "@bloret-crew/blora-design";
  notify({ title: "构建完成", content: "部署已经完成。", placement: "top-end" });
</script>
```

### NumberInput（number-input）

```html
<blora-number-input label="数量" min="0" max="10" value="2"></blora-number-input>
```

### Otp（otp）

```html
<blora-otp label="验证码" length="6"></blora-otp>
```

### Pagination（pagination）

```html
<!-- total 是总页数（不是条目数）；默认就是带数字页码的完整分页。 -->
<blora-pagination id="project-pages" label="项目分页" page="2" total="12" max-visible="7"></blora-pagination>
<script type="module">
  document
    .querySelector("#project-pages")
    ?.addEventListener("blora-change", (event) => loadPage(event.detail.page));
</script>
```

### Popconfirm（popconfirm）

```html
<blora-popconfirm trigger="删除" message="确认删除此项？" cancel-label="取消" confirm-label="确定"></blora-popconfirm>
```

### Popover（popover）

```html
<!-- trigger 属性生成触发按钮；子元素是浮层内容（纯文本可改用 content 属性）。 -->
<blora-popover trigger="说明">
  <p>这里是补充信息。</p>
</blora-popover>
```

### Progress（progress）

```html
<blora-progress value="72" label="上传进度"></blora-progress>
```

### Radio（radio）

```html
<div class="blora-stack" role="radiogroup" aria-label="方案">
  <blora-radio name="plan" value="pro">专业版</blora-radio>
  <blora-radio name="plan" value="team">团队版</blora-radio>
</div>
```

### Range（range）

```html
<blora-range min="0" max="100" values="20,80"></blora-range>
```

### Rate（rate）

```html
<blora-rate label="评分" value="4"></blora-rate>
```

### Result（result）

```html
<blora-result variant="success" title="操作完成" description="项目已经创建。"></blora-result>
```

### Search（search）

```html
<blora-search label="搜索项目" placeholder="输入关键词"></blora-search>
```

### Segmented（segmented）

```html
<blora-segmented value="week">
  <blora-segment value="day">日</blora-segment>
  <blora-segment value="week">周</blora-segment>
  <blora-segment value="month">月</blora-segment>
</blora-segmented>
```

### Select（select）

```html
<blora-select name="status" value="active" placeholder="选择状态">
  <blora-option value="active">进行中</blora-option>
  <blora-option value="done">已完成</blora-option>
</blora-select>
```

### SidebarNav（sidebar-nav）

```html
<blora-sidebar-nav label="项目导航" value="overview">
  <blora-sidebar-nav-group label="项目">
    <blora-sidebar-nav-link label="概览" href="/overview" value="overview"></blora-sidebar-nav-link>
    <blora-sidebar-nav-link label="设置" href="/settings" value="settings"></blora-sidebar-nav-link>
  </blora-sidebar-nav-group>
</blora-sidebar-nav>
```

### Skeleton（skeleton）

```html
<div class="blora-skeleton" data-variant="text" aria-label="加载中"></div>
```

### Slider（slider）

```html
<blora-slider min="0" max="100" value="60"></blora-slider>
```

### SpeedDial（speed-dial）

```html
<blora-speed-dial label="快速操作">
  <blora-speed-dial-action value="new" label="新建" icon="document-add"></blora-speed-dial-action>
  <blora-speed-dial-action value="upload" label="上传" icon="upload"></blora-speed-dial-action>
</blora-speed-dial>
```

### Spinner（spinner）

```html
<span class="blora-spinner" role="status" aria-label="加载中"></span>
```

### Splitter（splitter）

```html
<blora-splitter>
  <blora-splitter-pane>导航</blora-splitter-pane>
  <blora-splitter-pane>内容</blora-splitter-pane>
</blora-splitter>
```

### Statistic（statistic）

```html
<blora-statistic label="本月访问" value="12,480" trend="↑ 12.5%" direction="up"></blora-statistic>
```

### Steps（steps）

```html
<blora-steps current="1">
  <blora-step title="准备"></blora-step>
  <blora-step title="配置"></blora-step>
  <blora-step title="完成"></blora-step>
</blora-steps>
```

### Swap（swap）

```html
<blora-swap off-label="深色模式" on-label="浅色模式"></blora-swap>
```

### Switch（switch）

```html
<blora-switch name="notifications" checked>接收通知</blora-switch>
```

### Table（table）

```html
<div class="blora-table-wrap" data-blora-selectable>
  <table class="blora-table">
    <thead>
      <tr>
        <th data-sort data-col-key="name">成员</th>
      </tr>
    </thead>
    <tbody>
      <tr data-row-key="u1">
        <td>张三</td>
      </tr>
    </tbody>
  </table>
</div>
<script type="module">
  import { createTableController } from "@bloret-crew/blora-design";
  const controller = createTableController(document.querySelector(".blora-table-wrap"));
  window.addEventListener("pagehide", () => controller.destroy(), { once: true });
</script>
```

### Tabs（tabs）

```html
<blora-tabs>
  <blora-tab label="概览" value="overview" selected>概览内容</blora-tab>
  <blora-tab label="设置" value="settings">设置内容</blora-tab>
</blora-tabs>
```

### Tag（tag）

```html
<span class="blora-tag" data-variant="primary">设计系统</span>
```

### TagsInput（tags-input）

```html
<blora-tags-input label="技术栈" values="TypeScript,Web Components"></blora-tags-input>
```

### Textarea（textarea）

```html
<blora-field label="备注" hint="选填">
  <textarea class="blora-textarea" name="note" rows="4" placeholder="补充说明"></textarea>
</blora-field>
```

### Timeline（timeline）

```html
<blora-timeline>
  <blora-timeline-item time="09:00" title="开始" variant="primary"></blora-timeline-item>
  <blora-timeline-item time="12:00" title="完成" variant="success"></blora-timeline-item>
</blora-timeline>
```

### Timepicker（timepicker）

```html
<blora-timepicker name="time" value="09:30" placeholder="HH:MM"></blora-timepicker>
```

### Tooltip（tooltip）

```html
<!-- 子元素就是触发器；提示文字写在 text 属性上。 -->
<blora-tooltip text="保存当前项目">
  <button type="button" class="blora-button" data-variant="ghost">保存</button>
</blora-tooltip>
```

### Tour（tour）

```html
<blora-tour label="新手引导">
  <blora-tour-step title="标签" description="高亮贴合的胶囊标签。"><span class="blora-tag" data-variant="primary">步骤 A</span></blora-tour-step>
  <blora-tour-step title="按钮" description="跟随按钮圆角的高亮。"><button type="button" class="blora-button" data-variant="outline">步骤 B</button></blora-tour-step>
</blora-tour>
```

### Transfer（transfer）

```html
<blora-transfer source-label="候选" target-label="已选">
  <blora-transfer-item value="zhang">张三</blora-transfer-item>
  <blora-transfer-item value="li">李四</blora-transfer-item>
  <blora-transfer-item value="wang" target checked>王五</blora-transfer-item>
</blora-transfer>
```

### Tree（tree）

```html
<blora-tree value="tech">
  <blora-tree-node value="tech" label="技术部" open selected>
    <blora-tree-node value="zhang" label="张三"></blora-tree-node>
    <blora-tree-node value="li" label="李四"></blora-tree-node>
  </blora-tree-node>
</blora-tree>
```

### TreeSelect（tree-select）

```html
<blora-tree-select label="选择部门" placeholder="选择部门">
  <blora-tree-select-option label="华东" value="east">
    <blora-tree-select-option label="上海" value="sh"></blora-tree-select-option>
    <blora-tree-select-option label="杭州" value="hz"></blora-tree-select-option>
  </blora-tree-select-option>
  <blora-tree-select-option label="华北" value="north">
    <blora-tree-select-option label="北京" value="bj"></blora-tree-select-option>
  </blora-tree-select-option>
</blora-tree-select>
```

### Upload（upload）

```html
<blora-upload prompt="拖拽文件至此" hint="支持 SVG / PNG / JPG · 单文件 ≤ 8MB" accept=".svg,.png,.jpg" multiple></blora-upload>
```


## 15. Add-on 的最小示例

每个 add-on 示例都必须先从 npm 安装对应包，再从包根入口或已声明 CSS 子路径导入；不能从仓库源码目录导入。

### effects

安装并导入：

```bash
pnpm add @bloret-crew/blora-design-effects
```

```ts
import "@bloret-crew/blora-design-effects/effects.css";
import "@bloret-crew/blora-design-effects";
```

#### Text FX

```html
<blora-text-fx effect="bloom" loop>欢迎使用 Blora</blora-text-fx>
```

#### Rotate

```html
<blora-text-rotate interval="3200">
  <span>结构统一</span>
  <span>令牌驱动</span>
</blora-text-rotate>
```

#### Countdown

```html
<blora-countdown seconds="86405"></blora-countdown>
```

#### Count Up

```html
<blora-count-up value="1280">0</blora-count-up>
```

#### Diff

```html
<blora-diff>
  <blora-diff-before><img src="/images/before.jpg" alt="改造前" /></blora-diff-before>
  <blora-diff-after><img src="/images/after.jpg" alt="改造后" /></blora-diff-after>
</blora-diff>
```

#### Hover Gallery

```html
<blora-hover-gallery aria-label="图库"><img src="/images/a.jpg" alt="图一" /></blora-hover-gallery>
```

#### Watermark

```html
<blora-watermark text="内部资料"><article class="blora-card">内容</article></blora-watermark>
```

#### Shortcut

```html
<script type="module">
  import { initShortcutHints } from "@bloret-crew/blora-design-effects";
  initShortcutHints(document);
</script>
```

### layout

安装并导入：

```bash
pnpm add @bloret-crew/blora-design-layout
```

```ts
import "@bloret-crew/blora-design-layout/layout.css";
import "@bloret-crew/blora-design-layout";
```

#### Sidebar Layout

```html
<blora-sidebar-layout sticky label="页面导航" toggle-label="打开导航">
  <blora-sidebar-layout-sidebar>导航</blora-sidebar-layout-sidebar>
  <blora-sidebar-layout-content>内容</blora-sidebar-layout-content>
</blora-sidebar-layout>
```

#### Affix

```html
<blora-affix offset="16">固定工具栏</blora-affix>
```

#### Anchor

```html
<blora-anchor offset="80" sync-hash>
  <a class="blora-anchor__link" href="#section-a">章节 A</a>
  <a class="blora-anchor__link" href="#section-b">章节 B</a>
</blora-anchor>
```

#### Smooth Scroll

```html
<script type="module">
  import { initSmoothScroll } from "@bloret-crew/blora-design-layout";
  const cleanup = initSmoothScroll();
  window.addEventListener("pagehide", cleanup, { once: true });
</script>
```

### markdown

安装并导入：

```bash
pnpm add @bloret-crew/blora-design-markdown
```

```ts
import "@bloret-crew/blora-design-markdown/markdown.css";
import "@bloret-crew/blora-design-markdown";
```

#### Markdown CE

```html
<blora-markdown>
  <script type="text/markdown"># 标题

正文内容</script>
</blora-markdown>
```

#### SSR Renderer

```html
<script type="module">
  import { renderMarkdown } from "@bloret-crew/blora-design-markdown";
  const html = renderMarkdown("# 标题\n\n正文内容", { sanitize: true });
</script>
```

### qrcode

安装并导入：

```bash
pnpm add @bloret-crew/blora-design-qrcode
```

```ts
import "@bloret-crew/blora-design-qrcode/qrcode.css";
import "@bloret-crew/blora-design-qrcode";
```

#### QRCode CE

```html
<blora-qrcode value="https://blora.design" label="Blora Design 官网"></blora-qrcode>
```

#### Matrix Service

```html
<script type="module">
  import { buildQRMatrix } from "@bloret-crew/blora-design-qrcode";
  const matrix = buildQRMatrix("https://blora.design");
</script>
```

### theming

安装并导入：

```bash
pnpm add @bloret-crew/blora-design-theming
```

```ts
import "@bloret-crew/blora-design-theming/theming.css";
import "@bloret-crew/blora-design-theming";
```

#### Palette Picker

```html
<blora-palette-picker icon-only></blora-palette-picker>
```

#### Color Scheme Toggle

```html
<blora-color-scheme-toggle></blora-color-scheme-toggle>
```

#### Theme Service

```html
<script type="module">
  import { applyTheme, applyColorScheme } from "@bloret-crew/blora-design-theming";
  applyTheme("coral");
  applyColorScheme("dark");
</script>
```

### thread

安装并导入：

```bash
pnpm add @bloret-crew/blora-design-thread
```

```ts
import "@bloret-crew/blora-design-thread/thread.css";
import "@bloret-crew/blora-design-thread";
```

#### Comment Stream

```html
<blora-timeline
  ><blora-timeline-item icon="message" content-layout="block"
    ><blora-thread-comment
      ><div slot="head">作者 · 刚刚</div>
      <p>评论内容</p></blora-thread-comment
    ></blora-timeline-item
  ></blora-timeline
>
```

#### Composer

```html
<blora-thread-composer>
  <textarea class="blora-textarea" rows="4" placeholder="发表评论"></textarea>
  <div slot="actions">
    <button type="button" class="blora-button" data-variant="primary">提交</button>
  </div></blora-thread-composer
>
```

## 16. 迁移文档索引

- [Blora Design 2.0 使用指南](../guide.md)
- [组件 contract](../../packages/blora-design/contracts/)
- [组件 manifest](../../packages/blora-design/component-manifest.json)
- [Showcase v2](../../examples/showcase-v2/)
- [发布与最终验收记录](../refactor/rc-release-rehearsal.md)
- [浏览器矩阵](../refactor/browser-matrix.md)
