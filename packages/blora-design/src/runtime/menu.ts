/**
 * 菜单类浮层：bd-menu、bd-split（分裂按钮）、bd-popover、bd-popconfirm、bd-context（右键菜单）、悬浮提示 data-tip。
 * 面板都用原生 popover（顶层、点外部关闭、Esc），位置由 overlay.ts 计算。
 * 菜单：方向键在菜单项之间移动；点菜单项发出 bd-select（detail.item）并关闭；menuitemradio 自动切换 aria-checked。
 * 原位确认：点 data-part="confirm" 发出 bd-confirm 并关闭，点 data-part="cancel" 直接关闭。
 */
import { define } from './core';
import { popover } from './overlay';

const ITEM = '[role="menuitem"], [role="menuitemradio"], [role="menuitemcheckbox"]';

function menuKeys(panel: HTMLElement): (e: KeyboardEvent) => void {
  return (e) => {
    const items = [...panel.querySelectorAll<HTMLElement>(ITEM)].filter(
      (x) => !x.hasAttribute('disabled'),
    );
    const i = items.indexOf(document.activeElement as HTMLElement);
    let to: HTMLElement | undefined;
    if (e.key === 'ArrowDown') to = items[(i + 1) % items.length];
    else if (e.key === 'ArrowUp') to = items[(i - 1 + items.length) % items.length];
    else if (e.key === 'Home') to = items[0];
    else if (e.key === 'End') to = items[items.length - 1];
    else return;
    e.preventDefault();
    to?.focus();
  };
}

function menuClick(
  host: HTMLElement,
  panel: HTMLElement,
  back: HTMLElement | null,
): (e: MouseEvent) => void {
  return (e) => {
    const item = (e.target as Element).closest<HTMLElement>(ITEM);
    if (!item || !panel.contains(item) || item.hasAttribute('disabled')) return;
    if (item.getAttribute('role') === 'menuitemradio') {
      for (const x of panel.querySelectorAll('[role="menuitemradio"]'))
        x.setAttribute('aria-checked', String(x === item));
    } else if (item.getAttribute('role') === 'menuitemcheckbox') {
      item.setAttribute('aria-checked', String(item.getAttribute('aria-checked') !== 'true'));
    }
    host.dispatchEvent(
      new CustomEvent('bd-select', {
        bubbles: true,
        detail: { item, value: item.dataset.value ?? item.textContent?.trim() },
      }),
    );
    if (item.getAttribute('role') !== 'menuitemcheckbox') {
      panel.hidePopover();
      back?.focus();
    }
  };
}

/** 触发按钮 + 面板：菜单、分裂按钮、普通浮层、原位确认 */
function anchored(host: HTMLElement): (() => void) | undefined {
  const panel = host.querySelector<HTMLElement>(':scope > [data-part="panel"]');
  const trigger =
    host.querySelector<HTMLElement>(':scope > [data-part="trigger"]') ??
    host.querySelector<HTMLElement>(':scope > button');
  if (!panel || !trigger) return undefined;
  const isMenu = panel.getAttribute('role') === 'menu';
  if (isMenu) trigger.setAttribute('aria-haspopup', 'menu');
  const offPop = popover(trigger, panel, {
    offset: 7,
    ...(host.classList.contains('bd-split') ? { reference: host } : {}),
    align: host.dataset.align === 'end' ? 'end' : 'start',
    onToggle: (open) => {
      if (!open || !isMenu) return;
      (
        panel.querySelector<HTMLElement>('[aria-checked="true"]') ??
        panel.querySelector<HTMLElement>(ITEM)
      )?.focus();
    },
  });
  const onKey = menuKeys(panel);
  const onClick = isMenu ? menuClick(host, panel, trigger) : null;
  const onConfirm = (e: MouseEvent): void => {
    const part = (e.target as Element).closest('[data-part]')?.getAttribute('data-part');
    if (part === 'confirm') {
      host.dispatchEvent(new CustomEvent('bd-confirm', { bubbles: true }));
      panel.hidePopover();
    } else if (part === 'cancel') {
      panel.hidePopover();
    }
  };
  panel.addEventListener('keydown', onKey);
  if (onClick) panel.addEventListener('click', onClick);
  panel.addEventListener('click', onConfirm);
  return () => {
    offPop();
    panel.removeEventListener('keydown', onKey);
    if (onClick) panel.removeEventListener('click', onClick);
    panel.removeEventListener('click', onConfirm);
  };
}

/** 右键菜单：在指针处弹出，左右上下不出视口 */
function contextMenu(zone: HTMLElement): (() => void) | undefined {
  const panel = zone.querySelector<HTMLElement>(':scope > [data-part="panel"]');
  if (!panel) return undefined;
  if (!panel.hasAttribute('popover')) panel.setAttribute('popover', 'auto');
  panel.setAttribute('data-bd-floating', '');
  const open = (x: number, y: number): void => {
    panel.style.left = '0px';
    panel.style.top = '0px';
    if (!panel.matches(':popover-open')) panel.showPopover();
    const w = panel.offsetWidth;
    const h = panel.offsetHeight;
    const left = Math.min(x, innerWidth - w - 8);
    const top = y + h > innerHeight - 8 ? y - h : y;
    panel.style.left = `${Math.max(8, left)}px`;
    panel.style.top = `${Math.max(8, top)}px`;
    panel.setAttribute('data-placement', top < y ? 'top-start' : 'bottom-start');
    panel.querySelector<HTMLElement>(ITEM)?.focus();
  };
  const onContext = (e: MouseEvent): void => {
    if (panel.contains(e.target as Node)) return;
    e.preventDefault();
    open(e.clientX, e.clientY);
  };
  const onClickZone = (e: MouseEvent): void => {
    if (zone.dataset.trigger !== 'click' || panel.contains(e.target as Node)) return;
    open(e.clientX, e.clientY);
  };
  const onKey = menuKeys(panel);
  const onClick = menuClick(zone, panel, null);
  zone.addEventListener('contextmenu', onContext);
  zone.addEventListener('click', onClickZone);
  panel.addEventListener('keydown', onKey);
  panel.addEventListener('click', onClick);
  return () => {
    zone.removeEventListener('contextmenu', onContext);
    zone.removeEventListener('click', onClickZone);
    panel.removeEventListener('keydown', onKey);
    panel.removeEventListener('click', onClick);
  };
}

/* ---------------- 悬浮提示 ---------------- */
let tip: HTMLElement | null = null;
let tipFor: Element | null = null;
let tipTimer = 0;

function showTip(el: Element): void {
  const text = el.getAttribute('data-tip');
  if (!text) return;
  if (!tip) {
    tip = document.createElement('div');
    tip.className = 'bd-tooltip';
    tip.setAttribute('popover', 'manual');
    tip.setAttribute('role', 'tooltip');
    tip.id = 'bd-tooltip';
    document.body.append(tip);
  }
  tip.textContent = text;
  tipFor = el;
  el.setAttribute('aria-describedby', 'bd-tooltip');
  if (!tip.matches(':popover-open')) tip.showPopover();
  const r = el.getBoundingClientRect();
  const below = el.getAttribute('data-tip-placement') === 'bottom' || r.top < tip.offsetHeight + 16;
  const x = Math.min(
    Math.max(8, r.left + r.width / 2 - tip.offsetWidth / 2),
    innerWidth - tip.offsetWidth - 8,
  );
  tip.style.left = `${x}px`;
  tip.style.top = `${below ? r.bottom + 8 : r.top - 8 - tip.offsetHeight}px`;
  tip.setAttribute('data-placement', below ? 'bottom' : 'top');
}

function hideTip(): void {
  clearTimeout(tipTimer);
  tipFor?.removeAttribute('aria-describedby');
  tipFor = null;
  if (tip?.matches(':popover-open')) tip.hidePopover();
}

function tooltips(): void {
  const enter = (e: Event): void => {
    const target = e.target instanceof Element ? e.target : null;
    // 漏写成 title 的提示：改成 data-tip，避免出现浏览器原生的提示框
    const titled = target?.closest('[title]:not(svg [title], title)');
    if (titled && !titled.hasAttribute('data-tip')) {
      titled.setAttribute('data-tip', titled.getAttribute('title') ?? '');
      titled.removeAttribute('title');
    }
    const el = target?.closest('[data-tip]');
    if (!el || el === tipFor) return;
    clearTimeout(tipTimer);
    tipTimer = window.setTimeout(() => showTip(el), e.type === 'focusin' ? 0 : 120);
  };
  const leave = (e: Event): void => {
    const to = (e as MouseEvent).relatedTarget as Element | null;
    if (tipFor && to && tipFor.contains(to)) return;
    hideTip();
  };
  document.addEventListener('pointerover', enter);
  document.addEventListener('focusin', enter);
  document.addEventListener('pointerout', leave);
  document.addEventListener('focusout', hideTip);
  addEventListener('scroll', hideTip, { capture: true, passive: true });
}

export function registerMenus(): void {
  define('.bd-menu, .bd-split, .bd-popover, .bd-popconfirm', anchored);
  define('.bd-context', contextMenu);
  if (typeof document !== 'undefined') tooltips();
}
