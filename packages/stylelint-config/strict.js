// 严格版：给业务项目用。在基础规则之上，圆角、间距、投影、动效时长也只能用 --bd-* 变量（DESIGN.md · Shapes / Layout / Elevation / Motion）。
// Blora Design 自己的 CSS 为了和参考页逐像素一致用了一些具体数值，所以框架只用基础版。
import base from './index.js';

// 写死的非零长度：12px、1.5rem…（0、百分比、var() 里的都不算）
const LENGTH = '/(?<![\\w-])(?!0+(\\.0+)?(px|rem|em)\\b)\\d*\\.?\\d+(px|rem|em|vh|vw|ch|ex)\\b/';
// 写死的时长：0.2s、180ms（0s、0ms 不算）
const TIME = '/(?<![\\w-])(?!0+(\\.0+)?m?s\\b)\\d*\\.?\\d+m?s\\b/';

const messages = {
  radius: (prop) => `${prop} 不要写具体数值，改用 --bd-radius-*（DESIGN.md · Shapes · 圆角梯度）`,
  space: (prop) => `${prop} 不要写具体数值，改用 --bd-space-*（DESIGN.md · Layout · 间距节奏）`,
  shadow: () => '投影只用 --bd-shadow-*（DESIGN.md · Elevation & Depth）',
  time: (prop) => `${prop} 的时长改用 --bd-duration*（DESIGN.md · Motion & Micro-interaction）`,
};

export default {
  ...base,
  rules: {
    ...base.rules,
    'declaration-property-value-disallowed-list': [
      {
        ...base.rules['declaration-property-value-disallowed-list'][0],
        '/^border(-(top|bottom|start|end)-(left|right|start|end))?-radius$/': [LENGTH],
        '/^(margin|padding)(-(top|right|bottom|left|block|inline)(-(start|end))?)?$/': [LENGTH],
        '/^(gap|row-gap|column-gap)$/': [LENGTH],
        '/^(transition|transition-duration|transition-delay|animation|animation-duration|animation-delay)$/':
          [TIME],
      },
      {
        message: (prop, value) => {
          if (/radius/.test(prop)) return messages.radius(prop);
          if (/^(margin|padding|gap|row-gap|column-gap)/.test(prop)) return messages.space(prop);
          if (/^(transition|animation)/.test(prop)) return messages.time(prop);
          return base.rules['declaration-property-value-disallowed-list'][1].message(prop, value);
        },
      },
    ],
    'declaration-property-value-allowed-list': [
      { 'box-shadow': ['none', '/^(var\\(--bd-shadow-[\\w-]+\\)(\\s*,\\s*)?)+$/'] },
      { message: messages.shadow },
    ],
  },
};
