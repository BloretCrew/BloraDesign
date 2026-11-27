// Blora Design 的 stylelint 规则。每条规则对应 DESIGN.md 里的一节，报错信息会指过去。

const sides = '(-(top|right|bottom|left|block|inline)(-(start|end))?)?';

export default {
  rules: {
    // DESIGN.md · Colors：颜色只用 --bd-* 语义变量
    'color-no-hex': [true, { message: '不要写死颜色，改用 --bd-* 语义变量（DESIGN.md · Colors）' }],
    'color-named': [
      'never',
      { message: '不要写颜色名，改用 --bd-* 语义变量（DESIGN.md · Colors）' },
    ],
    'function-disallowed-list': [
      [
        '/^(repeating-)?(linear|radial|conic)-gradient$/',
        '/^(rgb|rgba|hsl|hsla|hwb|lab|lch|oklab|oklch)$/',
      ],
      {
        message: (fn) =>
          /gradient/.test(fn)
            ? `不要用渐变 ${fn}()，改用状态标签或角落几何线（DESIGN.md · Shapes · 几何标记）`
            : `不要写死颜色 ${fn}()，改用 --bd-* 变量；需要半透明时用 color-mix()（DESIGN.md · Colors）`,
      },
    ],
    // DESIGN.md · Overview「零描边」：不画边框、分隔线；焦点用聚焦光晕，不用 outline
    'declaration-property-value-disallowed-list': [
      {
        [`/^border${sides}$/`]: ['/^(?!(none|0)$)/'],
        '/^outline$/': ['/^(?!(none|0)$)/'],
        // 页面和组件不直接引用调色板：语义由 DESIGN.md 决定
        '/.*/': ['/var\\(\\s*--cortado-/'],
      },
      {
        message: (prop, value) =>
          /--cortado-/.test(value)
            ? '不要直接用 --cortado-* 调色板，改用 --bd-* 语义变量（DESIGN.md · Colors）'
            : `不要画 ${prop}：Blora Design 零描边，层次靠底色、细缝和圆角（DESIGN.md · Overview）`,
      },
    ],
    'property-disallowed-list': [
      [`/^border${sides}-(width|style|color)$/`, 'border-image', '/^outline-(width|style|color)$/'],
      { message: (prop) => `不要设置 ${prop}：Blora Design 零描边（DESIGN.md · Overview）` },
    ],
  },
};
