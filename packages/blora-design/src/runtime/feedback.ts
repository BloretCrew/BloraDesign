/**
 * 反馈接口：
 * - toast(message, { tone, duration })：右下角的浅色提示条，自动消失；屏幕阅读器会朗读
 * - confirm({ title, description, confirmText, cancelText, tone })：Blora 样式的确认弹窗，返回 Promise<boolean>（代替浏览器的 confirm()）
 * - 提醒格的 data-part="close"：高度收起后移除，并把下方的细缝一起收掉
 */
import { define } from './core';
import { reducedMotion } from './motion';

export interface ToastOptions {
  tone?: 'blush' | 'sand' | 'rose';
  /** 显示多久（毫秒），默认 2400 */
  duration?: number;
}

export function toast(message: string, opt: ToastOptions = {}): void {
  let stack = document.querySelector<HTMLElement>('.bd-toast');
  if (!stack) {
    stack = document.createElement('div');
    stack.className = 'bd-toast';
    stack.setAttribute('aria-live', 'polite');
    document.body.append(stack);
  }
  const item = document.createElement('div');
  item.setAttribute('role', 'status');
  if (opt.tone && opt.tone !== 'blush') item.dataset.tone = opt.tone;
  item.textContent = message;
  stack.append(item);
  window.setTimeout(() => {
    item.setAttribute('data-leaving', '');
    window.setTimeout(() => item.remove(), reducedMotion() ? 0 : 220);
  }, opt.duration ?? 2400);
}

export interface ConfirmOptions {
  title: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  /** rose：危险操作，确认按钮是蔷薇色 */
  tone?: 'primary' | 'rose';
}

export function confirm(opt: ConfirmOptions): Promise<boolean> {
  return new Promise((resolve) => {
    const d = document.createElement('dialog');
    d.className = 'bd-modal';
    d.setAttribute('aria-labelledby', 'bd-confirm-title');
    const header = document.createElement('header');
    const h = Object.assign(document.createElement('h2'), {
      id: 'bd-confirm-title',
      textContent: opt.title,
    });
    header.append(h);
    d.append(header);
    if (opt.description)
      d.append(Object.assign(document.createElement('p'), { textContent: opt.description }));
    const footer = document.createElement('footer');
    const cancel = Object.assign(document.createElement('button'), {
      type: 'button',
      className: 'bd-button',
      textContent: opt.cancelText ?? '取消',
    });
    const ok = Object.assign(document.createElement('button'), {
      type: 'button',
      className: 'bd-button',
      textContent: opt.confirmText ?? '确认',
    });
    ok.dataset.variant = opt.tone === 'rose' ? 'rose' : 'primary';
    footer.append(cancel, ok);
    d.append(footer);
    document.body.append(d);
    let result = false;
    cancel.addEventListener('click', () => d.close());
    ok.addEventListener('click', () => {
      result = true;
      d.close();
    });
    d.addEventListener('close', () => {
      resolve(result);
      window.setTimeout(() => d.remove(), 320);
    });
    d.showModal();
    ok.focus();
  });
}

/** 提醒格关闭：格子高度收起；如果它独占一行，连这一行和下方的细缝一起收掉 */
function alertTile(tile: HTMLElement): () => void {
  const onClick = (e: MouseEvent): void => {
    if (!(e.target as Element).closest('[data-part="close"]')) return;
    const row =
      tile.parentElement?.classList.contains('bd-mosaic') &&
      tile.parentElement.children.length === 1
        ? tile.parentElement
        : tile;
    tile.dispatchEvent(new CustomEvent('bd-close', { bubbles: true }));
    if (reducedMotion()) {
      row.remove();
      return;
    }
    const h = row.getBoundingClientRect().height;
    const gap = parseFloat(getComputedStyle(row.parentElement ?? row).rowGap) || 0;
    row.style.overflow = 'hidden';
    const anim = row.animate(
      [
        { height: `${h}px`, opacity: 1, marginBottom: '0px' },
        { height: '0px', opacity: 0, marginBottom: `${-gap}px` },
      ],
      { duration: 300, easing: 'cubic-bezier(0.22, 1, 0.36, 1)', fill: 'forwards' },
    );
    anim.addEventListener('finish', () => row.remove());
  };
  tile.addEventListener('click', onClick);
  return () => tile.removeEventListener('click', onClick);
}

export function registerFeedback(): void {
  define('.bd-tile[data-variant="alert"]', alertTile);
}
