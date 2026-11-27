/**
 * 中文段落不以一两个字结尾（DESIGN.md · Typography）：把段落最后 5 个字用不可见的「连接符」（U+2060 WORD JOINER）连在一起，
 * 换行时这几个字只会整体换到下一行。只改文字节点的内容、不增删节点，所以不会和 Vue / React 管理的 DOM 冲突；
 * 框架更新文字后会自动重新处理。复制出来的文字里会带着这些不可见字符。
 */
import { define } from './core';

const WJ = '\u2060';
const TAIL = 5;
const WORD = /[A-Za-z0-9.\-_]/;

function lastText(el: Element): Text | null {
  const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
  let last: Text | null = null;
  while (walker.nextNode()) {
    const node = walker.currentNode as Text;
    if (node.data.trim()) last = node;
  }
  return last;
}

function bind(el: Element): void {
  const node = lastText(el);
  if (!node) return;
  const raw = node.data.replaceAll(WJ, '');
  const trail = raw.match(/\s*$/)?.[0] ?? '';
  const text = raw.slice(0, raw.length - trail.length);
  const chars = [...text];
  if (chars.length < TAIL * 2) return;
  let cut = chars.length - TAIL;
  // 末尾是英文 / 数字时退到词首，不把单词拆开
  while (cut > 0 && WORD.test(chars[cut - 1] ?? '') && WORD.test(chars[cut] ?? '')) cut--;
  if (cut <= 0) return;
  const next = chars.slice(0, cut).join('') + chars.slice(cut).join(WJ) + trail;
  if (next !== node.data) node.data = next;
}

const SELECTOR = [
  '.bd-head > p',
  '.bd-tile[data-variant="page"] > p',
  '.bd-prose p',
  '[data-bd-tail]',
].join(', ');

/** 注册段落末尾不留孤字（入口 index.ts 调用） */
export function registerTail(): void {
  define(SELECTOR, (el) => {
    bind(el);
    const mo = new MutationObserver(() => {
      mo.disconnect();
      bind(el);
      mo.observe(el, { subtree: true, childList: true, characterData: true });
    });
    mo.observe(el, { subtree: true, childList: true, characterData: true });
    return () => mo.disconnect();
  });
}
