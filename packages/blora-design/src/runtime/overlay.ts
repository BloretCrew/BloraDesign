/**
 * 弹出层底座：用浏览器原生的 popover 承担顶层显示、点外部关闭、Esc 关闭和焦点归还，
 * 这里只负责把面板放到触发元素旁边（下方放不下时翻到上方，左右不出视口），以及在滚动、缩放时跟着走。
 * 面板外观全部由 Blora 画（DESIGN.md · 不出现原生控件 · dialog / popover）。
 */
import type { Cleanup } from './core';

export interface PopoverOptions {
  /** 与触发元素的距离 */
  offset?: number;
  /** 面板至少和触发元素一样宽 */
  matchWidth?: boolean;
  /** 水平对齐：start 左对齐、end 右对齐 */
  align?: 'start' | 'end';
  /** 按哪个元素定位（默认就是触发元素；分裂按钮按整组定位） */
  reference?: HTMLElement;
  /** 打开 / 关闭时回调 */
  onToggle?: (open: boolean) => void;
}

let seq = 0;
const MARGIN = 8;

export function popover(
  anchor: HTMLElement,
  panel: HTMLElement,
  opt: PopoverOptions = {},
): Cleanup {
  const offset = opt.offset ?? 6;
  if (!panel.id) panel.id = `bd-pop-${++seq}`;
  if (!panel.hasAttribute('popover')) panel.setAttribute('popover', 'auto');
  panel.setAttribute('data-bd-floating', '');
  // 触发元素用 popovertarget 关联：浏览器负责开关和「点触发元素时不会先关再开」
  if (anchor instanceof HTMLButtonElement) anchor.setAttribute('popovertarget', panel.id);
  anchor.setAttribute('aria-expanded', 'false');
  anchor.setAttribute('aria-controls', panel.id);

  const place = (): void => {
    const r = (opt.reference ?? anchor).getBoundingClientRect();
    if (opt.matchWidth) panel.style.minWidth = `${r.width}px`;
    const pw = panel.offsetWidth;
    const ph = panel.offsetHeight;
    const below = innerHeight - r.bottom - offset - MARGIN;
    const above = r.top - offset - MARGIN;
    const up = ph > below && above > below;
    let x = opt.align === 'end' ? r.right - pw : r.left;
    x = Math.min(Math.max(MARGIN, x), innerWidth - pw - MARGIN);
    const y = up ? r.top - offset - ph : r.bottom + offset;
    panel.style.left = `${Math.round(x)}px`;
    panel.style.top = `${Math.round(y)}px`;
    panel.setAttribute('data-placement', `${up ? 'top' : 'bottom'}-${opt.align ?? 'start'}`);
  };

  const onScroll = (): void => place();
  const onBefore = (e: Event): void => {
    if ((e as ToggleEvent).newState === 'open') place();
  };
  const onToggle = (e: Event): void => {
    const open = (e as ToggleEvent).newState === 'open';
    anchor.setAttribute('aria-expanded', String(open));
    if (open) {
      place();
      addEventListener('scroll', onScroll, { capture: true, passive: true });
      addEventListener('resize', onScroll);
    } else {
      removeEventListener('scroll', onScroll, { capture: true });
      removeEventListener('resize', onScroll);
    }
    opt.onToggle?.(open);
  };
  // 内容变化（搜索过滤、换月）导致面板变高时重新放置
  const ro = new ResizeObserver(() => {
    if (panel.matches(':popover-open')) place();
  });
  ro.observe(panel);
  panel.addEventListener('beforetoggle', onBefore);
  panel.addEventListener('toggle', onToggle);

  return () => {
    ro.disconnect();
    panel.removeAttribute('data-bd-floating');
    panel.removeEventListener('beforetoggle', onBefore);
    panel.removeEventListener('toggle', onToggle);
    removeEventListener('scroll', onScroll, { capture: true });
    removeEventListener('resize', onScroll);
  };
}
