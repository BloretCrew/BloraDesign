/**
 * 静态检查：读 HTML 源码（不是运行后的 DOM——运行时会把 title 改成 data-tip，看 DOM 就漏了）。
 * 只看写法：原生元素、title 属性、原生弹窗、组件类和状态类、style 里写死的颜色。
 */
import { parse, type DefaultTreeAdapterTypes } from 'parse5';
import type { Violation } from './rules.js';

type Node = DefaultTreeAdapterTypes.Node;
type Element = DefaultTreeAdapterTypes.Element;

/** 框架里存在的组件类（test/components.test.ts 会核对它和 dist/blora.css 一致） */
export const COMPONENTS = new Set(
  [
    'accordion',
    'alert',
    'app',
    'avatar',
    'breadcrumb',
    'bulk',
    'button',
    'chart',
    'checkbox',
    'code',
    'command',
    'context',
    'corner',
    'date',
    'drawer',
    'dropzone',
    'empty',
    'field',
    'form',
    'group',
    'head',
    'input',
    'input-group',
    'item',
    'kbd',
    'layout',
    'legend',
    'list',
    'menu',
    'modal',
    'mosaic',
    'nav',
    'page',
    'pager',
    'pill',
    'popconfirm',
    'popover',
    'progress',
    'prose',
    'radio',
    'rail',
    'ring',
    'savebar',
    'scroll',
    'segmented',
    'select',
    'skeleton',
    'slider',
    'spec',
    'split',
    'stack',
    'stats',
    'stepper',
    'steps',
    'switch',
    'table',
    'tabs',
    'tag',
    'textarea',
    'tile',
    'toast',
    'toolbar',
    'tooltip',
    'topbar',
    'tray',
    'tree',
  ].map((n) => `bd-${n}`),
);

const NATIVE_ELEMENTS: Record<string, string> = {
  select: '用 bd-select 代替 <select>',
  datalist: '用 bd-select（可搜索）代替 <datalist>',
  progress: '用 bd-progress 代替 <progress>',
  meter: '用 bd-progress 或 bd-ring 代替 <meter>',
};

const NATIVE_INPUTS: Record<string, string> = {
  date: '用 bd-date',
  time: '用 bd-date',
  'datetime-local': '用 bd-date',
  month: '用 bd-date',
  week: '用 bd-date',
  color: '需要时设计 bd-color',
  range: '用 bd-slider',
  number: '用 bd-stepper',
};

// 状态要写在 ARIA / 原生状态上，不加这类类名
const STATE_CLASS =
  /^(active|selected|current|checked|open|opened|closed|disabled|expanded|collapsed|on|off|hover|focus|is-[\w-]+|has-[\w-]+)$/;

// style 属性里写死的颜色：#rgb、rgb()/hsl() 一类、常见颜色名
const COLOR_LITERAL =
  /#[0-9a-f]{3,8}\b|\b(rgba?|hsla?|hwb|lab|lch|oklab|oklch)\(|(?<![\w-])(red|blue|green|black|white|gray|grey|orange|yellow|purple|pink|brown)(?![\w-])/i;

const attr = (el: Element, name: string): string | undefined =>
  el.attrs.find((a) => a.name === name)?.value;

function lineOf(el: Element): number | undefined {
  return el.sourceCodeLocation?.startLine;
}

function describe(el: Element): string {
  const id = attr(el, 'id');
  const cls = attr(el, 'class')?.trim().split(/\s+/).slice(0, 2).join('.');
  return `<${el.tagName}${id ? `#${id}` : ''}${cls ? `.${cls}` : ''}>`;
}

function* elements(node: Node): Generator<Element> {
  if ('tagName' in node) yield node;
  const kids = 'childNodes' in node ? node.childNodes : [];
  // <template> 的内容在 content 里
  if ('content' in node && node.content) yield* elements(node.content as Node);
  for (const k of kids) yield* elements(k);
}

const textOf = (el: Element): string =>
  el.childNodes.map((n) => ('value' in n ? String(n.value) : '')).join('');

/** 检查一段 HTML 源码 */
export function checkHtml(source: string): Violation[] {
  const doc = parse(source, { sourceCodeLocationInfo: true });
  const out: Violation[] = [];
  const add = (rule: string, el: Element, message: string): void => {
    const line = lineOf(el);
    out.push({ rule, message, target: describe(el), ...(line ? { line } : {}) });
  };

  for (const el of elements(doc)) {
    const tag = el.tagName;
    // <svg> 里的 <title> 是无障碍名称，不是悬浮提示
    const inSvg = el.namespaceURI === 'http://www.w3.org/2000/svg';

    if (tag in NATIVE_ELEMENTS) add('html/native-element', el, NATIVE_ELEMENTS[tag] ?? '');

    if (tag === 'input') {
      const type = (attr(el, 'type') ?? 'text').toLowerCase();
      if (type in NATIVE_INPUTS)
        add(
          'html/native-input',
          el,
          `<input type="${type}"> 会露出系统面板，${NATIVE_INPUTS[type]}`,
        );
    }

    if (!inSvg && attr(el, 'title') !== undefined && tag !== 'link' && tag !== 'style') {
      add(
        'html/title-attr',
        el,
        `title="${attr(el, 'title')}" 会露出浏览器原生的悬浮提示，改用 data-tip`,
      );
    }

    const classes = (attr(el, 'class') ?? '').trim().split(/\s+/).filter(Boolean);
    const components = classes.filter((c) => c.startsWith('bd-'));
    if (components.length > 1) {
      add(
        'html/one-component',
        el,
        `一个元素只能是一个组件，这里有 ${components.join('、')}；变体用 data-*`,
      );
    }
    for (const c of components) {
      if (!COMPONENTS.has(c))
        add('html/unknown-component', el, `没有 ${c} 这个组件（拼错了，或者需要先设计）`);
    }
    for (const c of classes) {
      if (STATE_CLASS.test(c))
        add(
          'html/state-class',
          el,
          `类名 .${c} 表示状态，改用 ARIA 或原生状态（aria-selected、aria-current、:checked、[open]…）`,
        );
    }

    const style = attr(el, 'style');
    if (style && COLOR_LITERAL.test(style.replace(/var\([^)]*\)/g, ''))) {
      add('html/inline-color', el, `style="${style}" 里写死了颜色，改用 --bd-* 变量`);
    }

    // 内联脚本和 on* 事件里的原生弹窗
    const scripts: string[] = [];
    if (tag === 'script' && !attr(el, 'src')) scripts.push(textOf(el));
    for (const a of el.attrs) if (a.name.startsWith('on')) scripts.push(a.value);
    for (const code of scripts) {
      // 从 blora.js 导入的 confirm() 是 Blora 的确认弹窗，可以用
      const bloraConfirm = /import\s*\{[^}]*\bconfirm\b[^}]*\}\s*from\s*['"][^'"]*blora/.test(code);
      const hits = [...code.matchAll(/(?<![\w.$])(window\.)?(alert|prompt|confirm)\s*\(/g)].filter(
        (m) => !(m[2] === 'confirm' && !m[1] && bloraConfirm),
      );
      for (const m of hits) {
        add(
          'html/native-dialog',
          el,
          `${m[0].replace(/\s*\($/, '')}() 会弹出浏览器原生对话框，改用 toast() / confirm()（从 blora.js 导入）/ bd-modal`,
        );
      }
    }
  }
  return out;
}
