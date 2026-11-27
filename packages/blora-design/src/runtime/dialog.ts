/**
 * 弹窗 bd-modal、抽屉 bd-drawer、命令面板 bd-command（原生 <dialog>）：
 * - 任何元素写 data-bd-open="对话框 id" 点击即打开；data-part="close" 关闭；点遮罩关闭；
 * - 命令面板：输入过滤、上下键选择、Enter 执行（触发选项的 click）；写 data-shortcut="mod+k" 注册快捷键；
 * - openCommand(id?) / closeDialog(el) 供业务调用。
 */
import { define } from './core';

function closeDialog(d: HTMLDialogElement): void {
  if (d.open) d.close();
}

/** 打开命令面板（不传 id 时打开页面上第一个 bd-command） */
export function openCommand(id?: string): void {
  const d = (
    id ? document.getElementById(id) : document.querySelector('dialog.bd-command')
  ) as HTMLDialogElement | null;
  if (d && !d.open) d.showModal();
}

function command(d: HTMLDialogElement): () => void {
  const input = d.querySelector<HTMLInputElement>('input');
  const options = (): HTMLElement[] => [...d.querySelectorAll<HTMLElement>('[role="option"]')];
  const visible = (): HTMLElement[] => options().filter((o) => !o.hidden);
  const mark = (o: HTMLElement | undefined): void => {
    for (const x of options()) x.setAttribute('aria-selected', String(x === o));
    o?.scrollIntoView({ block: 'nearest' });
  };
  const filter = (): void => {
    const q = input?.value.trim().toLowerCase() ?? '';
    for (const o of options()) o.hidden = !!q && !(o.textContent ?? '').toLowerCase().includes(q);
    const empty = d.querySelector<HTMLElement>('[data-part="empty"]');
    if (empty) empty.hidden = visible().length > 0;
    mark(visible()[0]);
  };
  const onKey = (e: KeyboardEvent): void => {
    const all = visible();
    const i = all.findIndex((o) => o.getAttribute('aria-selected') === 'true');
    if (e.key === 'ArrowDown') mark(all[(i + 1) % all.length]);
    else if (e.key === 'ArrowUp') mark(all[(i - 1 + all.length) % all.length]);
    else if (e.key === 'Enter' && all[i]) all[i].click();
    else return;
    e.preventDefault();
  };
  const onClick = (e: MouseEvent): void => {
    const o = (e.target as Element).closest<HTMLElement>('[role="option"]');
    if (!o) return;
    d.dispatchEvent(
      new CustomEvent('bd-select', {
        bubbles: true,
        detail: { item: o, value: o.dataset.value ?? o.textContent?.trim() },
      }),
    );
    closeDialog(d);
  };
  const shortcut = d.dataset.shortcut?.toLowerCase();
  const onGlobal = (e: KeyboardEvent): void => {
    if (!shortcut) return;
    const [mod, key] = shortcut.split('+');
    if (mod === 'mod' && (e.metaKey || e.ctrlKey) && e.key.toLowerCase() === key) {
      e.preventDefault();
      if (d.open) closeDialog(d);
      else d.showModal();
    }
  };
  const onOpen = (): void => {
    if (!d.open) return;
    if (input) {
      input.value = '';
      input.focus();
    }
    filter();
  };
  const mo = new MutationObserver(onOpen);
  mo.observe(d, { attributes: true, attributeFilter: ['open'] });
  input?.addEventListener('input', filter);
  d.addEventListener('keydown', onKey);
  d.addEventListener('click', onClick);
  document.addEventListener('keydown', onGlobal);
  filter();
  return () => {
    mo.disconnect();
    input?.removeEventListener('input', filter);
    d.removeEventListener('keydown', onKey);
    d.removeEventListener('click', onClick);
    document.removeEventListener('keydown', onGlobal);
  };
}

function dialog(el: HTMLElement): () => void {
  const d = el as HTMLDialogElement;
  // 点遮罩（对话框本身、而不是里面的内容）关闭
  const onClick = (e: MouseEvent): void => {
    if ((e.target as Element).closest('[data-part="close"]')) {
      closeDialog(d);
      return;
    }
    if (e.target !== d) return;
    const r = d.getBoundingClientRect();
    const inside =
      e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom;
    if (!inside) closeDialog(d);
  };
  d.addEventListener('click', onClick);
  const offCommand = d.classList.contains('bd-command') ? command(d) : () => {};
  return () => {
    d.removeEventListener('click', onClick);
    offCommand();
  };
}

export function registerDialogs(): void {
  define('dialog.bd-modal, dialog.bd-drawer, dialog.bd-command', dialog);
  if (typeof document === 'undefined') return;
  document.addEventListener('click', (e) => {
    const opener = (e.target as Element | null)?.closest<HTMLElement>('[data-bd-open]');
    const d = opener
      ? (document.getElementById(opener.dataset.bdOpen ?? '') as HTMLDialogElement | null)
      : null;
    if (d && typeof d.showModal === 'function' && !d.open) d.showModal();
  });
}
