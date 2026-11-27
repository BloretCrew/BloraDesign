/**
 * 日期选择 bd-date（替代原生日期框和系统日期面板）：
 *   <div class="bd-date" data-mode="range" data-value="2026-11-18/2026-11-21">
 *     <button type="button" data-part="trigger" aria-label="时间窗口">
 *       <span data-part="value"><svg data-icon …日历…></svg><span data-part="text"></span></span>
 *       <span class="bd-pill" data-tone="sand" data-part="badge"></span>   区间模式可选：显示天数
 *     </button>
 *     <div data-part="panel" popover></div>                              日历由运行时画
 *     <input type="hidden" name="window">                                可选：表单提交用
 *   </div>
 * data-mode：single 选一天（选完关闭）；range 选起止（先点起点再点终点，选完关闭）。
 * 值写在 data-value（YYYY-MM-DD，区间用 / 分隔），变化时发出 bd-change（detail.value）。
 * 键盘：方向键按天 / 周移动，PageUp / PageDown 换月，Enter 选中，Esc 关闭。
 */
import { define } from './core';
import { popover } from './overlay';

const WEEK = ['日', '一', '二', '三', '四', '五', '六'];
const pad = (n: number): string => String(n).padStart(2, '0');
const iso = (d: Date): string => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const parse = (s: string | undefined): Date | null => {
  const m = s?.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  return m ? new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3])) : null;
};
const sameDay = (a: Date | null, b: Date | null): boolean => !!a && !!b && iso(a) === iso(b);
const DAY = 86400000;
const ICON = (d: string): string =>
  `<svg data-icon width="14" height="14" viewBox="0 0 24 24" aria-hidden="true"><path d="${d}"/></svg>`;

export function registerDate(): void {
  define('.bd-date', (host) => {
    const trigger = host.querySelector<HTMLElement>(':scope > [data-part="trigger"]');
    const panel = host.querySelector<HTMLElement>(':scope > [data-part="panel"]');
    if (!trigger || !panel) return undefined;
    const range = host.dataset.mode === 'range';
    const text = trigger.querySelector<HTMLElement>('[data-part="text"]');
    const badge = trigger.querySelector<HTMLElement>('[data-part="badge"]');
    const hidden = host.querySelector<HTMLInputElement>(':scope > input[type="hidden"]');
    trigger.setAttribute('aria-haspopup', 'dialog');

    const [a, b] = (host.dataset.value ?? '').split('/');
    let start = parse(a);
    let end = range ? parse(b) : null;
    let view = new Date((start ?? new Date()).getFullYear(), (start ?? new Date()).getMonth(), 1);
    let focusDay: Date = start ?? new Date();

    const write = (): void => {
      const value = range
        ? start && end
          ? `${iso(start)}/${iso(end)}`
          : ''
        : start
          ? iso(start)
          : '';
      host.dataset.value = value;
      if (hidden) hidden.value = value;
      if (text) {
        if (!start) text.textContent = host.dataset.placeholder ?? '选择日期';
        else if (!range) text.textContent = iso(start);
        else if (!end) text.textContent = `${iso(start)} → 选择结束日`;
        else text.textContent = `${iso(start)} → ${pad(end.getMonth() + 1)}-${pad(end.getDate())}`;
      }
      if (badge) {
        badge.textContent =
          start && end ? `${Math.round((+end - +start) / DAY) + 1} 天窗口` : '点选终点';
      }
    };

    const render = (): void => {
      const y = view.getFullYear();
      const m = view.getMonth();
      const first = new Date(y, m, 1).getDay();
      const days = new Date(y, m + 1, 0).getDate();
      const cells: string[] = [];
      for (let i = 0; i < first; i++) cells.push('<span data-part="day" data-muted></span>');
      for (let d = 1; d <= days; d++) {
        const date = new Date(y, m, d);
        const key = iso(date);
        let state = '';
        if (start && end && !sameDay(start, end)) {
          if (sameDay(date, start)) state = 'start';
          else if (sameDay(date, end)) state = 'end';
          else if (date > start && date < end) state = 'between';
        } else if (sameDay(date, start)) {
          state = 'single';
        }
        const selected = state === 'start' || state === 'end' || state === 'single';
        const tab = sameDay(date, focusDay) ? '0' : '-1';
        cells.push(
          `<button type="button" data-part="day" data-date="${key}"${state ? ` data-state="${state}"` : ''} aria-pressed="${selected}" aria-label="${y} 年 ${m + 1} 月 ${d} 日" tabindex="${tab}">${d}</button>`,
        );
      }
      panel.innerHTML = `
        <div data-part="head">
          <button type="button" data-part="prev" aria-label="上个月">${ICON('m15 18-6-6 6-6')}</button>
          <span data-part="title" aria-live="polite">${y} 年 ${m + 1} 月</span>
          <button type="button" data-part="next" aria-label="下个月">${ICON('m9 18 6-6-6-6')}</button>
        </div>
        <div data-part="weekdays" aria-hidden="true">${WEEK.map((w) => `<span>${w}</span>`).join('')}</div>
        <div data-part="grid">${cells.join('')}</div>`;
    };

    const focusOn = (d: Date): void => {
      focusDay = d;
      if (d.getMonth() !== view.getMonth() || d.getFullYear() !== view.getFullYear()) {
        view = new Date(d.getFullYear(), d.getMonth(), 1);
      }
      render();
      panel.querySelector<HTMLElement>(`[data-date="${iso(d)}"]`)?.focus();
    };

    const pick = (d: Date): void => {
      let nextStart = start;
      let nextEnd = end;
      if (!range) {
        nextStart = d;
      } else if (!start || end) {
        nextStart = d;
        nextEnd = null;
      } else if (d < start) {
        nextEnd = start;
        nextStart = d;
      } else {
        nextEnd = d;
      }
      const value = range
        ? nextStart && nextEnd
          ? `${iso(nextStart)}/${iso(nextEnd)}`
          : ''
        : nextStart
          ? iso(nextStart)
          : '';
      const done = !range || !!nextEnd;
      if (done) {
        const proceed = host.dispatchEvent(
          new CustomEvent('bd-change', { bubbles: true, cancelable: true, detail: { value } }),
        );
        if (!proceed || host.hasAttribute('data-bd-controlled')) return;
      }
      start = nextStart;
      end = nextEnd;
      focusDay = d;
      write();
      render();
      if (done) {
        panel.hidePopover();
        trigger.focus();
      } else {
        panel.querySelector<HTMLElement>(`[data-date="${iso(d)}"]`)?.focus();
      }
    };

    const offPop = popover(trigger, panel, {
      align: 'end',
      onToggle: (open) => {
        if (!open) return;
        focusDay = end ?? start ?? new Date();
        view = new Date(focusDay.getFullYear(), focusDay.getMonth(), 1);
        render();
        panel.querySelector<HTMLElement>(`[data-date="${iso(focusDay)}"]`)?.focus();
      },
    });

    const onClick = (e: MouseEvent): void => {
      const el = (e.target as Element | null)?.closest<HTMLElement>('[data-part]');
      const part = el?.getAttribute('data-part');
      if (part === 'prev' || part === 'next') {
        view = new Date(view.getFullYear(), view.getMonth() + (part === 'prev' ? -1 : 1), 1);
        render();
        panel.querySelector<HTMLElement>(`[data-part="${part}"]`)?.focus();
      } else if (part === 'day' && el?.dataset.date) {
        const d = parse(el.dataset.date);
        if (d) pick(d);
      }
    };
    const onKey = (e: KeyboardEvent): void => {
      const day = (e.target as Element | null)?.closest<HTMLElement>('[data-date]');
      if (!day) return;
      const d = parse(day.dataset.date) ?? focusDay;
      const move: Record<string, number> = {
        ArrowLeft: -1,
        ArrowRight: 1,
        ArrowUp: -7,
        ArrowDown: 7,
      };
      if (e.key in move) focusOn(new Date(+d + (move[e.key] ?? 0) * DAY));
      else if (e.key === 'PageUp' || e.key === 'PageDown') {
        focusOn(
          new Date(d.getFullYear(), d.getMonth() + (e.key === 'PageUp' ? -1 : 1), d.getDate()),
        );
      } else return;
      e.preventDefault();
    };

    write();
    render();
    panel.addEventListener('click', onClick);
    panel.addEventListener('keydown', onKey);
    return () => {
      offPop();
      panel.removeEventListener('click', onClick);
      panel.removeEventListener('keydown', onKey);
    };
  });
}
