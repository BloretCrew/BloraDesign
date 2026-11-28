# @bloret-crew/blora-check

Blora Design 的页面检查工具。用无头浏览器在 **1380 / 1024 / 375 三个宽度、浅色和深色**下打开页面，逐项量出违反 [DESIGN.md](https://github.com/BloretCrew/BloraDesign/blob/main/DESIGN.md) 的地方；同时读 HTML 源码检查写法。每个问题都会指出是哪个格子、哪个元素，违反了 DESIGN.md 的哪一节。

```bash
npm install -D @bloret-crew/blora-check
npx playwright install chromium   # 或者加 --channel chrome 用本机的 Chrome
```

```bash
blora check http://localhost:5173/              # 检查一个网址
blora check dist/                               # 检查目录里的全部 HTML
blora check app.html#settings --widths 375      # 本地文件可以带 #场景
blora lint src/**/*.html                        # 只检查 HTML 写法，不启动浏览器
blora rules                                     # 列出全部规则
```

## 规则

| 规则                 | 检查什么                                                                                          |
| -------------------- | ------------------------------------------------------------------------------------------------- |
| `whitespace`         | 格子里最大的一段竖向空白不超过 40px（滚动视口、长文、图表、看板除外）                             |
| `squeezed`           | 弹性布局里没有被压得比内容还矮的元素                                                              |
| `halo-clip`          | 输入类控件离会裁切内容的容器至少 3px，聚焦光晕不会被裁掉                                          |
| `native-ui`          | 没有原生外观：`appearance`、`<select>`、日期框、`<summary>` 三角、原生滚动条、`title`             |
| `hard-color`         | 计算后的颜色都能在 `--bd-*` 变量（或它们的半透明、混合）里找到                                    |
| `gradient`、`border` | 不用渐变，不画描边和 outline                                                                      |
| `contrast`           | 正文 ≥ 4.5，大字 ≥ 3，辅助文字（tertiary / quaternary）≥ 2                                        |
| `glide`              | 选中滑块和选中项完全重合                                                                          |
| `overflow`           | 页面不横向滚动，文字不溢出容器                                                                    |
| `tap-target`         | 手机上可点击区域至少 24 × 24（WCAG 2.2 AA）                                                       |
| `reduced-motion`     | 开启「减少动效」后没有位移、缩放、旋转动画                                                        |
| `html/*`             | 原生元素、`title` 属性、`alert()`、一个元素多个组件类、状态类名、不存在的组件、`style` 里写死颜色 |

**已知问题**（DESIGN.md · Colors · 已知问题里记录过的：雾粉实色底上的白字、浅底上的说明文字）作为提醒列出，不算失败；`--warnings` 逐条显示。

**豁免**：确实需要例外时，在元素或它的祖先上写 `data-bd-allow="规则名"`，报告里会计数。用之前先想想能不能改构图。

## 在代码里调用

```js
import { check, format, failed } from '@bloret-crew/blora-check';

const reports = await check({ targets: ['dist/index.html'], widths: [1380, 375] });
console.log(format(reports));
process.exitCode = reports.some(failed) ? 1 : 0;
```

Apache-2.0。
