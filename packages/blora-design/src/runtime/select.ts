/**
 * 选择器 bd-select（替代原生 <select>）：
 *   <div class="bd-select">
 *     <button type="button" data-part="trigger" aria-label="区域"><span data-part="value"></span><svg data-part="chevron"…></button>
 *     <div data-part="panel">
 *       <input data-part="search" placeholder="搜索…">            可选：有它就能搜索
 *       <div role="listbox" aria-multiselectable="true">           多选时加 aria-multiselectable
 *         <div role="option" data-value="hk" aria-selected="true">亚太 · 香港</div>
 *       </div>
 *     </div>
 *     <input type="hidden" name="region">                          可选：表单提交用
 *   </div>
 * 单选：选中后关闭，触发按钮显示选中项的文字；多选：触发按钮里是可移除的标签，相邻的选中项连成一块。
 * 键盘：上下键移动、Enter / 空格选中、Esc 关闭、输入文字搜索。值变化发出 bd-change（detail.value）。
 */
import { define } from './core';
import { animateHeight } from './motion';
import { popover } from './overlay';

const OPTION = '[role="option"]';

export function registerSelect(): void {
  define('.bd-select', (host) => {
    const trigger = host.querySelector<HTMLElement>(':scope > [data-part="trigger"]');
    const panel = host.querySelector<HTMLElement>(':scope > [data-part="panel"]');
    const list = panel?.querySelector<HTMLElement>('[role="listbox"]');
    if (!trigger || !panel || !list) return undefined;
    const search = panel.querySelector<HTMLInputElement>('[data-part="search"]');
    const hidden = host.querySelector<HTMLInputElement>(':scope > input[type="hidden"]');
    const valueBox = trigger.querySelector<HTMLElement>('[data-part="value"]');
    const multi = list.getAttribute('aria-multiselectable') === 'true';
    const placeholder = host.dataset.placeholder ?? '请选择…';
    trigger.setAttribute('aria-haspopup', 'listbox');

    const options = (): HTMLElement[] => [...list.querySelectorAll<HTMLElement>(OPTION)];
    const visible = (): HTMLElement[] =>
      options().filter((o) => !o.hidden && o.getAttribute('aria-disabled') !== 'true');
    const selected = (): HTMLElement[] =>
      options().filter((o) => o.getAttribute('aria-selected') === 'true');
    const valueOf = (o: HTMLElement): string => o.dataset.value ?? o.textContent?.trim() ?? '';
    const labelOf = (o: HTMLElement): string =>
      o.querySelector('[data-part="label"]')?.textContent?.trim() ?? o.textContent?.trim() ?? '';
    for (const o of options()) {
      if (!o.hasAttribute('aria-selected')) o.setAttribute('aria-selected', 'false');
      o.tabIndex = -1;
    }

    /* 触发按钮里显示当前值 */
    const render = (): void => {
      const sel = selected();
      if (hidden) hidden.value = sel.map(valueOf).join(',');
      if (!valueBox) return;
      if (!multi) {
        valueBox.textContent = sel[0] ? labelOf(sel[0]) : placeholder;
        valueBox.toggleAttribute('data-empty', !sel[0]);
        return;
      }
      valueBox.replaceChildren(
        ...(sel.length
          ? sel.map((o) => {
              const tag = document.createElement('span');
              tag.className = 'bd-tag';
              tag.append(labelOf(o));
              const x = document.createElement('span');
              x.setAttribute('data-part', 'remove');
              x.setAttribute('role', 'button');
              x.setAttribute('aria-label', `移除 ${labelOf(o)}`);
              x.dataset.value = valueOf(o);
              x.innerHTML =
                '<svg data-icon width="10" height="10" viewBox="0 0 24 24" aria-hidden="true"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>';
              tag.append(x);
              return tag;
            })
          : [Object.assign(document.createElement('span'), { textContent: placeholder })]),
      );
      valueBox.toggleAttribute('data-empty', !sel.length);
    };

    const commit = (next: HTMLElement[]): void => {
      const value = multi ? next.map(valueOf) : next[0] ? valueOf(next[0]) : '';
      const proceed = host.dispatchEvent(
        new CustomEvent('bd-change', { bubbles: true, cancelable: true, detail: { value } }),
      );
      if (!proceed || host.hasAttribute('data-bd-controlled')) return;
      for (const o of options()) o.setAttribute('aria-selected', String(next.includes(o)));
    };

    const choose = (o: HTMLElement): void => {
      if (multi) {
        const cur = selected();
        commit(cur.includes(o) ? cur.filter((x) => x !== o) : [...cur, o]);
      } else {
        commit([o]);
        panel.hidePopover();
        trigger.focus();
      }
    };

    const offPop = popover(trigger, panel, {
      matchWidth: true,
      onToggle: (open) => {
        if (!open) {
          if (search) {
            search.value = '';
            filter();
          }
          return;
        }
        (search ?? selected()[0] ?? visible()[0])?.focus();
      },
    });

    const filter = (): void => {
      const q = search?.value.trim().toLowerCase() ?? '';
      for (const o of options()) o.hidden = !!q && !labelOf(o).toLowerCase().includes(q);
      const empty = panel.querySelector<HTMLElement>('[data-part="empty"]');
      if (empty) empty.hidden = visible().length > 0;
    };

    const onListClick = (e: MouseEvent): void => {
      const o = (e.target as Element | null)?.closest<HTMLElement>(OPTION);
      if (o && list.contains(o) && o.getAttribute('aria-disabled') !== 'true') choose(o);
    };
    const onTriggerClick = (e: MouseEvent): void => {
      const x = (e.target as Element | null)?.closest<HTMLElement>('[data-part="remove"]');
      if (!x) return;
      // 点标签上的 ×：只移除这一项，不打开面板
      e.preventDefault();
      e.stopPropagation();
      commit(selected().filter((o) => valueOf(o) !== x.dataset.value));
    };
    const onKey = (e: KeyboardEvent): void => {
      const all = visible();
      const i = all.indexOf(document.activeElement as HTMLElement);
      let to: HTMLElement | undefined;
      if (e.key === 'ArrowDown') to = all[i + 1] ?? all[0];
      else if (e.key === 'ArrowUp')
        to = i <= 0 ? ((search ?? all[all.length - 1]) as HTMLElement) : all[i - 1];
      else if ((e.key === 'Enter' || e.key === ' ') && i >= 0) {
        e.preventDefault();
        const o = all[i];
        if (o) choose(o);
        return;
      } else if (e.key === 'Enter' && document.activeElement === search && all[0]) {
        e.preventDefault();
        choose(all[0]);
        return;
      } else return;
      e.preventDefault();
      to?.focus();
    };

    // 选中状态变化（点击、受控更新）时重画触发按钮；多选的标签增减时触发按钮的高度连续变化
    const mo = new MutationObserver(() => animateHeight(trigger, render));
    mo.observe(list, { subtree: true, attributes: true, attributeFilter: ['aria-selected'] });
    render();
    filter();

    list.addEventListener('click', onListClick);
    trigger.addEventListener('click', onTriggerClick, true);
    panel.addEventListener('keydown', onKey);
    search?.addEventListener('input', filter);

    return () => {
      offPop();
      mo.disconnect();
      list.removeEventListener('click', onListClick);
      trigger.removeEventListener('click', onTriggerClick, true);
      panel.removeEventListener('keydown', onKey);
      search?.removeEventListener('input', filter);
    };
  });
}
