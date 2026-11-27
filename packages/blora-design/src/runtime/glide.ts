/**
 * 选中滑块：单选组（侧栏、分段控件、页签、分页、导航、目录树）的选中底是一块独立的滑块，
 * 选中项变化时连续滑过去，而不是在两个按钮之间跳（DESIGN.md · Motion · 单选组的选中底必须连续滑动）。
 *
 * 业务只改 aria-current / aria-selected；滑块监听这些属性和组内重绘，自动跟随。
 * 组的尺寸变化（展开折叠、换行、窗口缩放）时即时跟随，不加过渡。
 * 选中项被折叠区裁掉、或整组不可见时，滑块隐藏。
 */
import type { Cleanup } from './core';
import { reducedMotion } from './motion';

export interface GlideOptions {
  /** 组内的可选项 */
  items: string;
  /** 当前选中项 */
  active: string;
  /** 托盘：整组一块凹槽底，托盘圆角 = 选中项圆角 + 内缩 */
  tray?: number;
}

const WATCHED = ['aria-current', 'aria-selected', 'aria-checked', 'class', 'hidden'];

export function glide(host: HTMLElement, opt: GlideOptions): Cleanup {
  const pill = document.createElement('span');
  pill.setAttribute('data-part', 'glide');
  pill.setAttribute('aria-hidden', 'true');
  let placed = false;
  let raf = 0;
  let instantNext = false;

  const clipped = (el: Element, r: DOMRect): boolean => {
    for (let p = el.parentElement; p && p !== host; p = p.parentElement) {
      if (getComputedStyle(p).overflow === 'visible') continue;
      const c = p.getBoundingClientRect();
      if (c.height < 1 || r.bottom > c.bottom + 1 || r.top < c.top - 1) return true;
    }
    return false;
  };

  const place = (instant: boolean): void => {
    if (!pill.isConnected) host.prepend(pill);
    const active = host.querySelector<HTMLElement>(opt.active);
    host.querySelectorAll('[data-glide-on]').forEach((el) => {
      if (el !== active) el.removeAttribute('data-glide-on');
    });
    const r = active?.getBoundingClientRect();
    if (!active || !r || !host.offsetParent || !r.width || clipped(active, r)) {
      active?.removeAttribute('data-glide-on');
      pill.style.opacity = '0';
      placed = false;
      return;
    }
    const radius = getComputedStyle(active).borderRadius;
    if (!active.hasAttribute('data-glide-on')) active.setAttribute('data-glide-on', '');
    const hr = host.getBoundingClientRect();
    const x = r.left - hr.left - host.clientLeft + host.scrollLeft;
    const y = r.top - hr.top - host.clientTop + host.scrollTop;
    const jump = instant || !placed || reducedMotion();
    if (jump) pill.style.transition = 'none';
    pill.style.width = `${r.width}px`;
    pill.style.height = `${r.height}px`;
    pill.style.borderRadius = radius;
    pill.style.transform = `translate(${x}px, ${y}px)`;
    pill.style.opacity = '1';
    if (jump) {
      void pill.offsetWidth;
      pill.style.transition = '';
    }
    if (opt.tray !== undefined) host.style.borderRadius = `calc(${radius} + ${opt.tray}px)`;
    placed = true;
  };

  const schedule = (instant: boolean): void => {
    instantNext ||= instant;
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(() => {
      const i = instantNext;
      instantNext = false;
      place(i);
    });
  };

  const mo = new MutationObserver((records) => {
    const relevant = records.some((m) => {
      if (m.target === pill) return false;
      if (m.type === 'attributes' && m.attributeName === 'data-glide-on') return false;
      return true;
    });
    if (relevant) schedule(false);
  });
  mo.observe(host, { subtree: true, childList: true, attributes: true, attributeFilter: WATCHED });

  const ro = new ResizeObserver(() => schedule(true));
  ro.observe(host);
  host.querySelectorAll(opt.items).forEach((el) => ro.observe(el));
  const onResize = (): void => schedule(true);
  window.addEventListener('resize', onResize);
  document.fonts?.ready.then(() => schedule(true));

  place(true);

  return () => {
    cancelAnimationFrame(raf);
    mo.disconnect();
    ro.disconnect();
    window.removeEventListener('resize', onResize);
    host.querySelectorAll('[data-glide-on]').forEach((el) => el.removeAttribute('data-glide-on'));
    pill.remove();
    if (opt.tray !== undefined) host.style.borderRadius = '';
  };
}
