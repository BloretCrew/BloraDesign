/**
 * 数据展示组件的行为：
 * - bd-table：勾选行（含全选、半选）、相邻选中行相连、按列排序（行连续移动）、批量操作栏 bd-bulk 的展开收起
 * - bd-list：点击选中（aria-multiselectable 时可多选）
 * - bd-ring：画圆环、按数值取色（< 85 雾粉、85–100 暖杏、> 100 蔷薇），数值变化时圆弧连续过渡
 * - bd-progress：aria-valuenow 同步到 --bd-value
 * - bd-code：复制按钮（不复制命令提示符），按钮文字短暂变成「已复制」
 * - bd-accordion：展开 / 收起时高度连续过渡
 * - bd-corner：画角落的三道细弧和小点
 */
import { define } from './core';
import { animateHeight, flip, reducedMotion } from './motion';

const emit = (el: HTMLElement, detail: Record<string, unknown>): boolean =>
  el.dispatchEvent(new CustomEvent('bd-change', { bubbles: true, cancelable: true, detail }));

/* ---------------- 表格 ---------------- */
function table(el: HTMLElement): () => void {
  const tbl = el as HTMLTableElement;
  const body = tbl.tBodies[0];
  if (!body) return () => {};
  const all = tbl.tHead?.querySelector<HTMLInputElement>('.bd-checkbox') ?? null;
  const rows = (): HTMLTableRowElement[] => [...body.rows];
  const boxOf = (r: HTMLTableRowElement): HTMLInputElement | null =>
    r.querySelector('.bd-checkbox');
  const bulk = tbl.id
    ? document.querySelector<HTMLElement>(`.bd-bulk[data-for="${tbl.id}"]`)
    : null;

  const sync = (): void => {
    const sel = rows().filter((r) => boxOf(r)?.checked);
    for (const r of rows()) if (boxOf(r)) r.setAttribute('aria-selected', String(sel.includes(r)));
    if (all) {
      all.checked = sel.length > 0 && sel.length === rows().filter(boxOf).length;
      all.indeterminate = sel.length > 0 && !all.checked;
    }
    if (bulk) {
      const count = bulk.querySelector('[data-part="count"]');
      if (count) count.textContent = String(sel.length);
      const show = sel.length > 0;
      if (bulk.hidden === show) animateHeight(bulk, () => (bulk.hidden = !show));
    }
  };
  if (bulk) bulk.hidden = true;
  sync();

  const onChange = (e: Event): void => {
    const box = e.target as HTMLInputElement;
    if (!box.classList?.contains('bd-checkbox')) return;
    if (box === all)
      for (const r of rows()) {
        const b = boxOf(r);
        if (b) b.checked = all.checked;
      }
    sync();
    emit(tbl, { selected: rows().filter((r) => boxOf(r)?.checked) });
  };
  // 点整行也能勾选（点到行里的按钮、链接、输入框时除外）
  const onClick = (e: MouseEvent): void => {
    const t = e.target as Element;
    if (t.closest('a, button, input, select, textarea, label, [role="button"]')) return;
    const row = t.closest('tr');
    const box = row && body.contains(row) ? boxOf(row as HTMLTableRowElement) : null;
    if (!box) return;
    box.checked = !box.checked;
    box.dispatchEvent(new Event('change', { bubbles: true }));
  };
  // 排序：点表头里的按钮，按这一列的文字（数字按数值）排序，再点一次反向
  const onSort = (e: MouseEvent): void => {
    const th = (e.target as Element).closest<HTMLTableCellElement>('th[aria-sort]');
    if (!th || !(e.target as Element).closest('button')) return;
    const col = th.cellIndex;
    const dir = th.getAttribute('aria-sort') === 'ascending' ? 'descending' : 'ascending';
    for (const h of tbl.querySelectorAll('th[aria-sort]')) h.setAttribute('aria-sort', 'none');
    th.setAttribute('aria-sort', dir);
    const key = (r: HTMLTableRowElement): string =>
      r.cells[col]?.dataset.sort ?? r.cells[col]?.textContent?.trim() ?? '';
    const num = (s: string): number => Number.parseFloat(s.replace(/[^\d.-]/g, ''));
    const sorted = rows().sort((a, b) => {
      const x = key(a);
      const y = key(b);
      const d =
        Number.isNaN(num(x)) || Number.isNaN(num(y)) ? x.localeCompare(y, 'zh') : num(x) - num(y);
      return dir === 'ascending' ? d : -d;
    });
    flip(rows(), () => body.append(...sorted));
    emit(tbl, { sort: { column: col, direction: dir } });
  };
  tbl.addEventListener('change', onChange);
  body.addEventListener('click', onClick);
  tbl.tHead?.addEventListener('click', onSort);
  // 清空选择：批量操作栏里 data-part="clear" 的按钮
  const onBulk = (e: MouseEvent): void => {
    if (!(e.target as Element).closest('[data-part="clear"]')) return;
    for (const r of rows()) {
      const b = boxOf(r);
      if (b) b.checked = false;
    }
    sync();
    emit(tbl, { selected: [] });
  };
  bulk?.addEventListener('click', onBulk);
  return () => {
    tbl.removeEventListener('change', onChange);
    body.removeEventListener('click', onClick);
    tbl.tHead?.removeEventListener('click', onSort);
    bulk?.removeEventListener('click', onBulk);
  };
}

/* ---------------- 连贯列表 ---------------- */
function list(el: HTMLElement): () => void {
  if (el.getAttribute('role') !== 'listbox') return () => {};
  const multi = el.getAttribute('aria-multiselectable') === 'true';
  const onClick = (e: MouseEvent): void => {
    const o = (e.target as Element).closest<HTMLElement>('[role="option"]');
    if (!o || o.parentElement !== el) return;
    const on = o.getAttribute('aria-selected') !== 'true';
    if (!emit(el, { item: o, selected: on }) || el.hasAttribute('data-bd-controlled')) return;
    if (!multi)
      for (const x of el.querySelectorAll(':scope > [role="option"]'))
        x.setAttribute('aria-selected', 'false');
    o.setAttribute('aria-selected', String(multi ? on : true));
  };
  el.addEventListener('click', onClick);
  return () => el.removeEventListener('click', onClick);
}

/* ---------------- 环形读数 ---------------- */
const R = 18;
const C = 2 * Math.PI * R;
function ring(el: HTMLElement): () => void {
  if (!el.hasAttribute('role')) el.setAttribute('role', 'meter');
  const size = 44;
  el.insertAdjacentHTML(
    'afterbegin',
    `<svg viewBox="0 0 ${size} ${size}" aria-hidden="true"><circle data-part="track" cx="22" cy="22" r="${R}" fill="none" stroke-width="4"/><circle data-part="arc" cx="22" cy="22" r="${R}" fill="none" stroke-width="4" stroke-linecap="round" transform="rotate(-90 22 22)"/></svg>`,
  );
  const arc = el.querySelector<SVGCircleElement>('[data-part="arc"]');
  const label = el.querySelector(':scope > b') ?? el.appendChild(document.createElement('b'));
  let shown = -1;
  const render = (): void => {
    const max = Number(el.getAttribute('aria-valuemax') ?? 100);
    const value = Number(el.getAttribute('aria-valuenow') ?? 0);
    const pct = (value / (max || 1)) * 100;
    el.dataset.level = pct > 100 ? 'over' : pct >= 85 ? 'near' : 'normal';
    if (!el.dataset.bdText) label.textContent = el.dataset.text ?? String(Math.round(pct));
    const len = Math.min(1, Math.max(0, pct / 100)) * C;
    const to = `${len.toFixed(1)} ${C.toFixed(1)}`;
    if (arc) {
      // 首屏不播放；之后数值变化时圆弧连续过渡
      if (shown >= 0 && !reducedMotion()) {
        arc.animate(
          [
            { strokeDasharray: arc.getAttribute('stroke-dasharray') ?? `0 ${C}` },
            { strokeDasharray: to },
          ],
          {
            duration: 600,
            easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
          },
        );
      }
      arc.setAttribute('stroke-dasharray', to);
    }
    shown = pct;
  };
  const mo = new MutationObserver(render);
  mo.observe(el, {
    attributes: true,
    attributeFilter: ['aria-valuenow', 'aria-valuemax', 'data-text'],
  });
  render();
  return () => {
    mo.disconnect();
    el.querySelector(':scope > svg')?.remove();
  };
}

/* ---------------- 进度条 ---------------- */
function progress(el: HTMLElement): () => void {
  if (!el.hasAttribute('role')) el.setAttribute('role', 'progressbar');
  const render = (): void => {
    const max = Number(el.getAttribute('aria-valuemax') ?? 100);
    const value = Number(el.getAttribute('aria-valuenow') ?? 0);
    el.style.setProperty('--bd-value', `${Math.min(100, (value / (max || 1)) * 100)}%`);
  };
  const mo = new MutationObserver(render);
  mo.observe(el, { attributes: true, attributeFilter: ['aria-valuenow', 'aria-valuemax'] });
  render();
  return () => mo.disconnect();
}

/* ---------------- 代码块 ---------------- */
function code(el: HTMLElement): () => void {
  const onClick = async (e: MouseEvent): Promise<void> => {
    const btn = (e.target as Element).closest<HTMLElement>('[data-part="copy"]');
    const pre = el.querySelector('pre');
    if (!btn || !pre) return;
    const clone = pre.cloneNode(true) as HTMLElement;
    clone.querySelectorAll('[data-part="prompt"]').forEach((p) => p.remove());
    try {
      await navigator.clipboard.writeText(clone.textContent?.replace(/\n$/, '') ?? '');
    } catch {
      return;
    }
    const label = btn.querySelector('span');
    if (label) {
      const old = label.dataset.text ?? label.textContent ?? '';
      label.dataset.text = old;
      label.textContent = '已复制';
      setTimeout(() => (label.textContent = old), 1500);
    }
    el.dispatchEvent(
      new CustomEvent('bd-copy', { bubbles: true, detail: { text: clone.textContent } }),
    );
  };
  el.addEventListener('click', onClick);
  return () => el.removeEventListener('click', onClick);
}

/* ---------------- 手风琴 ---------------- */
function accordion(el: HTMLElement): () => void {
  const onClick = (e: MouseEvent): void => {
    const summary = (e.target as Element).closest('summary');
    const details = summary?.parentElement as HTMLDetailsElement | null;
    if (!summary || !details || details.parentElement !== el || reducedMotion()) return;
    e.preventDefault();
    const from = details.getBoundingClientRect().height;
    if (!details.open) {
      details.open = true;
      const to = details.getBoundingClientRect().height;
      details.animate([{ height: `${from}px` }, { height: `${to}px` }], {
        duration: 340,
        easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
      });
    } else {
      const to = summary.getBoundingClientRect().height;
      const anim = details.animate([{ height: `${from}px` }, { height: `${to}px` }], {
        duration: 300,
        easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
      });
      anim.addEventListener('finish', () => (details.open = false));
    }
  };
  el.addEventListener('click', onClick);
  return () => el.removeEventListener('click', onClick);
}

/* ---------------- 角落几何线 ---------------- */
function corner(el: HTMLElement): undefined {
  el.setAttribute('aria-hidden', 'true');
  if (!el.querySelector('svg')) {
    el.innerHTML =
      '<svg viewBox="0 0 80 56"><circle cx="92" cy="-12" r="34"/><circle cx="92" cy="-12" r="48"/><circle cx="92" cy="-12" r="62"/><circle data-part="dot" cx="70" cy="46" r="2.4"/></svg>';
  }
  return undefined;
}

export function registerData(): void {
  define('table.bd-table', table);
  define('.bd-list', list);
  define('.bd-ring', ring);
  define('.bd-progress', progress);
  define('.bd-code', code);
  define('.bd-accordion', accordion);
  define('.bd-corner', corner);
}
