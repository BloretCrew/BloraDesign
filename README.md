# Blora Design

Bloret 的设计系统。零描边的「瓷砖格」界面：浅灰蓝画布上铺白色格子，格子之间留 6px 细缝；雾粉、暖杏、蔷薇三组柔色表达状态；编号、托盘、星轨环和等宽字带来精致感。

> **3.0 正在开发中**（`3.0.0-alpha`）。这是一次从零开始的重写，与 2.0 不兼容。进度见 [docs/roadmap.md](docs/roadmap.md)。

## 用法

```bash
npm install @bloret-crew/blora-design
```

```html
<link rel="stylesheet" href="node_modules/@bloret-crew/blora-design/dist/blora.css" />
<script type="module" src="node_modules/@bloret-crew/blora-design/dist/blora.js"></script>

<main class="bd-page">
  <section class="bd-mosaic" data-cols="3">
    <article class="bd-tile">
      <header class="bd-head">
        <h3>实例</h3>
        <p>近 24 小时的运行状态</p>
      </header>
    </article>
  </section>
</main>
```

页面就是普通 HTML：组件用 `bd-` 类名，变体用 `data-*`，状态用 ARIA 属性。运行时自动接管页面，Vue、React、服务端模板、静态页都能直接用，不需要初始化。

## 规范

[DESIGN.md](DESIGN.md) 是唯一的规范：颜色、字体、构图、动效和每个组件的写法都在里面，设计变量也从它生成。用 AI 写页面时，让它先读这份文件。

## 包

| 包                                                                 | 说明                                               |
| ------------------------------------------------------------------ | -------------------------------------------------- |
| [`@bloret-crew/blora-design`](packages/blora-design)               | 主包：`blora.css` + `blora.js`                     |
| [`@bloret-crew/stylelint-config-blora`](packages/stylelint-config) | stylelint 规则：禁止写死颜色、渐变、描边           |
| [`@bloret-crew/cortado`](https://github.com/BloretCrew/Cortado)    | 颜色来源：基于 Catppuccin 的单一调色板（独立仓库） |

## 许可

[Apache-2.0](LICENSE)。颜色来自 Cortado（MIT），基于 Catppuccin（MIT），见 [NOTICE](NOTICE)。
