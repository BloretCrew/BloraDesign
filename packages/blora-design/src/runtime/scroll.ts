/**
 * 滚动滑块：原生滚动条在 CSS 里全部隐藏，这里为整个页面和每个 .bd-scroll 画一条 Blora 的细滑块。
 * 滚动本身仍是原生的；滑块只负责显示位置，并支持拖动。
 */
import { define } from './core';
import type { Cleanup } from './core';

const INSET = 3;
const MIN = 24;
const HIDE_AFTER = 900;

type Axis = 'x' | 'y';

function thumb(scroller: HTMLElement, axis: Axis, page: boolean): Cleanup {
  const el = document.createElement('span');
  el.setAttribute('data-part', 'scrollbar');
  el.setAttribute('data-axis', axis);
  el.setAttribute('aria-hidden', 'true');
  if (page) el.setAttribute('data-scope', 'page');
  (page ? document.body : scroller).append(el);

  const states = new Set<string>(['idle']);
  const sync = (): void => el.setAttribute('data-state', [...states].join(' '));
  let hideTimer = 0;
  let hovering = false;
  let dragging: { start: number; scroll: number; ratio: number } | null = null;

  const metrics = () => {
    const client = axis === 'y' ? scroller.clientHeight : scroller.clientWidth;
    const total = axis === 'y' ? scroller.scrollHeight : scroller.scrollWidth;
    const pos = axis === 'y' ? scroller.scrollTop : scroller.scrollLeft;
    const track = client - INSET * 2;
    const len = Math.max(MIN, (track * client) / Math.max(total, 1));
    return { client, total, pos, track, len };
  };

  const update = (): void => {
    const { client, total, pos, track, len } = metrics();
    if (total - client < 1) {
      states.add('idle');
      sync();
      return;
    }
    states.delete('idle');
    const offset = INSET + ((track - len) * pos) / (total - client);
    // 元素内的滑块跟着内容一起滚走，所以要加回滚动距离；页面级滑块是 fixed 的
    const shift = page ? offset : offset + pos;
    if (axis === 'y') {
      el.style.height = `${len}px`;
      el.style.transform = `translateY(${shift}px)`;
    } else {
      el.style.width = `${len}px`;
      el.style.transform = `translateX(${shift}px)`;
    }
    sync();
  };

  const show = (): void => {
    states.add('visible');
    sync();
    clearTimeout(hideTimer);
    hideTimer = window.setTimeout(() => {
      if (hovering || dragging) return;
      states.delete('visible');
      sync();
    }, HIDE_AFTER);
  };

  const target: HTMLElement | Window = page ? window : scroller;
  const onScroll = (): void => {
    update();
    show();
  };
  const onEnter = (): void => {
    hovering = true;
    update();
    show();
  };
  const onLeave = (): void => {
    hovering = false;
    show();
  };
  const onDown = (e: PointerEvent): void => {
    e.preventDefault();
    const { client, total, track, len } = metrics();
    dragging = {
      start: axis === 'y' ? e.clientY : e.clientX,
      scroll: axis === 'y' ? scroller.scrollTop : scroller.scrollLeft,
      ratio: (total - client) / Math.max(track - len, 1),
    };
    el.setPointerCapture(e.pointerId);
    states.add('dragging');
    sync();
  };
  const onMove = (e: PointerEvent): void => {
    if (!dragging) return;
    const delta = (axis === 'y' ? e.clientY : e.clientX) - dragging.start;
    const next = dragging.scroll + delta * dragging.ratio;
    if (axis === 'y') scroller.scrollTop = next;
    else scroller.scrollLeft = next;
  };
  const onUp = (): void => {
    dragging = null;
    states.delete('dragging');
    show();
  };

  target.addEventListener('scroll', onScroll, { passive: true });
  el.addEventListener('pointerenter', onEnter);
  el.addEventListener('pointerleave', onLeave);
  el.addEventListener('pointerdown', onDown);
  el.addEventListener('pointermove', onMove);
  el.addEventListener('pointerup', onUp);
  el.addEventListener('pointercancel', onUp);
  if (!page) {
    scroller.addEventListener('pointerenter', onEnter);
    scroller.addEventListener('pointerleave', onLeave);
  }

  // 内容尺寸变化（加载更多、展开折叠）时重新计算
  const ro = new ResizeObserver(update);
  ro.observe(scroller);
  for (const child of scroller.children) if (child !== el) ro.observe(child);
  const mo = new MutationObserver(() => {
    for (const child of scroller.children) if (child !== el) ro.observe(child);
    update();
  });
  mo.observe(scroller, { childList: true });
  update();

  return () => {
    clearTimeout(hideTimer);
    target.removeEventListener('scroll', onScroll);
    if (!page) {
      scroller.removeEventListener('pointerenter', onEnter);
      scroller.removeEventListener('pointerleave', onLeave);
    }
    ro.disconnect();
    mo.disconnect();
    el.remove();
  };
}

/** 注册 .bd-scroll 的滚动滑块（入口 index.ts 调用） */
export function registerScroll(): void {
  define('.bd-scroll', (el) => {
    const y = thumb(el, 'y', false);
    const x = thumb(el, 'x', false);
    return () => {
      y();
      x();
    };
  });
}

/** 整个页面的滚动条 */
export function startPageScroll(): void {
  const run = (): void => {
    const root = document.scrollingElement as HTMLElement | null;
    if (root && document.body) thumb(root, 'y', true);
  };
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run, { once: true });
  } else {
    run();
  }
}
