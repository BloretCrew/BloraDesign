/**
 * 单选组（分段控件、页签、分页、导航…）的共同行为：
 * - 选中状态写在 ARIA 上：role="radio" 用 aria-checked，role="tab" 用 aria-selected，普通按钮用 aria-pressed；
 * - 点击切换选中项并发出可取消的 bd-change 事件；组上写 data-bd-controlled 时只发事件、不改状态；
 * - 键盘：整组只有当前项可以 Tab 进入，方向键 / Home / End 在组内移动并选中；
 * - 选中底是连续滑动的滑块（glide）。
 */
import type { Cleanup } from './core';
import { glide } from './glide';

export interface ChoiceOptions {
  /** 组内可选项（相对组的选择器） */
  items: string;
  /** 方向：决定用左右键还是上下键（两者都接受，这里只影响 aria-orientation） */
  orientation?: 'horizontal' | 'vertical';
  /** 托盘：整组一块凹槽底，托盘圆角 = 选中项圆角 + 内缩 */
  tray?: number;
  /** 用 aria-current 表示当前项（导航、分页），值为这里给的字符串，如 "page" */
  current?: string;
}

function stateAttr(item: Element): 'aria-checked' | 'aria-selected' | 'aria-pressed' {
  const role = item.getAttribute('role');
  if (role === 'radio' || role === 'menuitemradio') return 'aria-checked';
  if (role === 'tab' || role === 'option') return 'aria-selected';
  return 'aria-pressed';
}

export const SELECTED = ':is([aria-checked="true"], [aria-selected="true"], [aria-pressed="true"])';
export const CURRENT = ':is([aria-current]:not([aria-current="false"]))';

export function choice(host: HTMLElement, opt: ChoiceOptions): Cleanup {
  const items = (): HTMLElement[] =>
    [...host.querySelectorAll<HTMLElement>(opt.items)].filter(
      (el) => !el.hasAttribute('disabled') && el.getAttribute('aria-disabled') !== 'true',
    );
  const ACTIVE = opt.current ? CURRENT : SELECTED;
  const current = (): HTMLElement | undefined => items().find((el) => el.matches(ACTIVE));
  const mark = (el: HTMLElement, on: boolean): void => {
    if (opt.current) {
      if (on) el.setAttribute('aria-current', el.getAttribute('aria-current') || opt.current);
      else el.removeAttribute('aria-current');
    } else {
      el.setAttribute(stateAttr(el), String(on));
    }
  };

  if (opt.orientation && !host.hasAttribute('aria-orientation')) {
    host.setAttribute('aria-orientation', opt.orientation);
  }

  // 每一项都要有明确的状态值（屏幕阅读器读得出「未选中」）；aria-current 不需要
  if (!opt.current) {
    for (const el of items()) {
      const attr = stateAttr(el);
      if (!el.hasAttribute(attr)) el.setAttribute(attr, 'false');
    }
  }

  const syncTabIndex = (): void => {
    if (opt.current) return;
    const all = items();
    const active = current() ?? all[0];
    for (const el of all) el.tabIndex = el === active ? 0 : -1;
  };

  const select = (item: HTMLElement, focus: boolean): void => {
    if (focus) item.focus();
    if (item.matches(ACTIVE)) return;
    const value =
      item.dataset.value ?? item.getAttribute('value') ?? item.textContent?.trim() ?? '';
    const proceed = host.dispatchEvent(
      new CustomEvent('bd-change', { bubbles: true, cancelable: true, detail: { value, item } }),
    );
    if (!proceed || host.hasAttribute('data-bd-controlled')) return;
    for (const el of items()) mark(el, el === item);
    syncTabIndex();
  };

  const onClick = (e: MouseEvent): void => {
    // opt.items 可能以 :scope 开头，不能用 closest() 匹配，改为在组内可选项里找包含点击目标的那一项
    const target = e.target as Node | null;
    const item = target && items().find((el) => el.contains(target));
    if (item) select(item, false);
  };

  const onKey = (e: KeyboardEvent): void => {
    const all = items();
    const from = all.indexOf(document.activeElement as HTMLElement);
    if (from < 0) return;
    const step: Record<string, number> = {
      ArrowRight: 1,
      ArrowDown: 1,
      ArrowLeft: -1,
      ArrowUp: -1,
    };
    let to: number;
    if (e.key in step) to = (from + (step[e.key] ?? 0) + all.length) % all.length;
    else if (e.key === 'Home') to = 0;
    else if (e.key === 'End') to = all.length - 1;
    else return;
    e.preventDefault();
    const target = all[to];
    if (target) select(target, true);
  };

  const mo = new MutationObserver(syncTabIndex);
  mo.observe(host, {
    subtree: true,
    childList: true,
    attributes: true,
    attributeFilter: ['aria-checked', 'aria-selected', 'aria-pressed', 'aria-current', 'disabled'],
  });
  syncTabIndex();
  host.addEventListener('click', onClick);
  host.addEventListener('keydown', onKey);
  const offGlide = glide(host, {
    items: opt.items,
    active: `${opt.items}${ACTIVE}`,
    ...(opt.tray === undefined ? {} : { tray: opt.tray }),
  });

  return () => {
    mo.disconnect();
    host.removeEventListener('click', onClick);
    host.removeEventListener('keydown', onKey);
    offGlide();
  };
}
