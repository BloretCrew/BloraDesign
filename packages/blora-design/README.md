# @bloret-crew/blora-design

Blora Design 2.0 — token-driven, accessible, zero-dependency Web UI design system.

**Status: 2.x Stable** (stable-core surface frozen since `2.0.0`; see the monorepo `CHANGELOG.md`)

## AI agents start here

Read [`llms.txt`](./llms.txt) first. The package ships the full rules offline in `dist/docs/`:
`patterns.md` (page composition), `migration/from-any-ui-to-blora-design.md` (every component),
`standards.md` (tokens). Contracts live in `contracts/`.

## Entry points

| Import | Notes |
|--------|--------|
| `@bloret-crew/blora-design/blora.css` | Tokens, foundations and every component style, inside `@layer blora.*` |
| `@bloret-crew/blora-design/auto` | Side-effect: defines every Composite CE and fills `data-icon` icons |
| `@bloret-crew/blora-design` | Main ESM (tree-shake friendly): controllers, `message`, `notify`, icons |
| `@bloret-crew/blora-design/button` (also select/dialog/table) | JS subpaths |
| `@bloret-crew/blora-design/blora.global.js` | IIFE CDN → `globalThis.Blora` (`Blora.autoDefine()`) |
| `@bloret-crew/blora-design/custom-elements.json` | CEM |
| `@bloret-crew/blora-design/component-manifest.json` | Component list |

`sideEffects`: CSS under `dist/*.css` and `dist/auto.js` only.

## Installation

```sh
pnpm add @bloret-crew/blora-design
```

## Usage

```css
/* styles/layers.css — load before every other stylesheet */
@layer legacy, blora;
```

```js
import "./styles/layers.css";
import "@bloret-crew/blora-design/blora.css";
import "@bloret-crew/blora-design/auto";
import { createTableController, message } from "@bloret-crew/blora-design";
```

```html
<button type="button" class="blora-button" data-variant="primary" data-icon="plus">新建</button>
<blora-field label="名称" name="name" required></blora-field>
<blora-search label="搜索" placeholder="搜索…"></blora-search>
```

- Keep legacy/global CSS inside `@layer legacy`: unlayered element rules (`button {}`, `input {}`, `* {}`) override every Blora component.
- Prefer native HTML + Blora classes for primitives and Composite Custom Elements for structure-sensitive controls.
- Use the published package exports only. Do not import repository source paths or copy component implementations.
- Human guide (Chinese): [`docs/guide.md`](../../docs/guide.md) · page patterns: [`docs/patterns.md`](../../docs/patterns.md)

## License

Apache-2.0
