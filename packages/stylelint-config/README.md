# @bloret-crew/stylelint-config-blora

Blora Design 的 stylelint 规则，每条都对应 [DESIGN.md](https://github.com/BloretCrew/BloraDesign/blob/main/DESIGN.md) 里的一节：

- 不写死颜色（十六进制、颜色名、`rgb()` / `hsl()` / `oklch()` 等），只用 `--bd-*` 变量；半透明用 `color-mix()`
- 不直接引用 `--cortado-*` 调色板
- 不用渐变
- 不画描边和 `outline`（`border: 0` / `none` 可以）

```bash
npm install -D stylelint @bloret-crew/stylelint-config-blora
```

```json
{ "extends": ["@bloret-crew/stylelint-config-blora"] }
```

Apache-2.0。
