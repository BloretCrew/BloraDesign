/**
 * 表单控件的行为：
 * - bd-input：清除（data-part="clear"）、显示密码（"reveal"）、复制（"copy"）
 * - bd-stepper：role="spinbutton" 的数值，加减按钮、方向键、数字滚动动画，同步到里面的隐藏 <input>
 * - bd-switch：点击切换 aria-checked
 * - bd-slider：拖动、点击、键盘，画出轨道 / 填充 / 拇指 / 读数 / 刻度
 * - bd-dropzone：拖入高亮，放下的文件交给里面的 <input type="file">
 * 值变化时都会发出 bd-change（detail.value），data-bd-controlled 时只发事件、不改状态。
 */
import { define } from './core';
import { reducedMotion } from './motion';

function emit(el: HTMLElement, detail: Record<string, unknown>): boolean {
  return el.dispatchEvent(
    new CustomEvent('bd-change', { bubbles: true, cancelable: true, detail }),
  );
}

const controlled = (el: HTMLElement): boolean => el.hasAttribute('data-bd-controlled');

/* ---------------- 输入框 ---------------- */
function input(box: HTMLElement): () => void {
  const field = box.querySelector<HTMLInputElement>(':scope > input');
  const onClick = async (e: MouseEvent): Promise<void> => {
    const part = (e.target as Element | null)?.closest<HTMLElement>('[data-part]');
    if (!part || part.parentElement !== box) return;
    const kind = part.getAttribute('data-part');
    if (kind === 'clear' && field) {
      field.value = '';
      field.dispatchEvent(new Event('input', { bubbles: true }));
      field.focus();
    } else if (kind === 'reveal' && field) {
      const shown = field.type === 'text';
      field.type = shown ? 'password' : 'text';
      part.setAttribute('aria-pressed', String(!shown));
    } else if (kind === 'copy') {
      const text =
        field?.value ??
        box.querySelector(':scope > :is(data, code, span:not([data-part]))')?.textContent ??
        '';
      try {
        await navigator.clipboard.writeText(text.trim());
        box.dispatchEvent(
          new CustomEvent('bd-copy', { bubbles: true, detail: { text: text.trim() } }),
        );
      } catch {
        /* 没有剪贴板权限时静默失败 */
      }
    }
  };
  // 清除按钮靠 :placeholder-shown 显示 / 隐藏，没写 placeholder 时补一个空的
  if (
    field &&
    box.querySelector(':scope > [data-part="clear"]') &&
    !field.hasAttribute('placeholder')
  ) {
    field.setAttribute('placeholder', ' ');
  }
  const reveal = box.querySelector(':scope > [data-part="reveal"]');
  if (reveal && !reveal.hasAttribute('aria-pressed')) reveal.setAttribute('aria-pressed', 'false');
  box.addEventListener('click', onClick);
  return () => box.removeEventListener('click', onClick);
}

/* ---------------- 步进器 ---------------- */
function stepper(host: HTMLElement): () => void {
  const value = host.querySelector<HTMLElement>(':scope > [data-part="value"]');
  const dec = host.querySelector<HTMLButtonElement>(':scope > [data-part="dec"]');
  const inc = host.querySelector<HTMLButtonElement>(':scope > [data-part="inc"]');
  const hidden = host.querySelector<HTMLInputElement>(':scope > input');
  if (!value) return () => {};
  value.setAttribute('role', 'spinbutton');
  if (!value.hasAttribute('tabindex')) value.tabIndex = 0;
  const num = (name: string, fallback: number): number => {
    const v = Number(value.getAttribute(name) ?? host.dataset[name.replace('aria-value', '')]);
    return Number.isFinite(v) && value.hasAttribute(name) ? v : fallback;
  };
  const min = (): number => num('aria-valuemin', -Infinity);
  const max = (): number => num('aria-valuemax', Infinity);
  const step = Number(host.dataset.step ?? 1);
  const read = (): number => Number(value.getAttribute('aria-valuenow') ?? value.textContent ?? 0);

  // 数字放在里面的 span 里滚动，外面的凹槽不动
  const render = (n: number, dir: number): void => {
    value.setAttribute('aria-valuenow', String(n));
    const digits = document.createElement('span');
    digits.textContent = String(n);
    value.replaceChildren(digits);
    if (hidden) hidden.value = String(n);
    if (dec) dec.disabled = n <= min();
    if (inc) inc.disabled = n >= max();
    if (dir && !reducedMotion()) {
      digits.animate(
        [
          { transform: `translateY(${dir * 60}%)`, opacity: 0 },
          { transform: 'none', opacity: 1 },
        ],
        { duration: 220, easing: 'cubic-bezier(0.22, 1, 0.36, 1)' },
      );
    }
  };
  const set = (n: number): void => {
    const next = Math.min(max(), Math.max(min(), n));
    const cur = read();
    if (next === cur) return;
    if (!emit(host, { value: next }) || controlled(host)) return;
    render(next, next > cur ? 1 : -1);
  };
  render(read(), 0);

  const onClick = (e: MouseEvent): void => {
    const part = (e.target as Element | null)?.closest('[data-part]')?.getAttribute('data-part');
    if (part === 'dec') set(read() - step);
    if (part === 'inc') set(read() + step);
  };
  const onKey = (e: KeyboardEvent): void => {
    const map: Record<string, number> = {
      ArrowUp: step,
      ArrowRight: step,
      ArrowDown: -step,
      ArrowLeft: -step,
      PageUp: step * 10,
      PageDown: -step * 10,
    };
    if (e.key in map) set(read() + (map[e.key] ?? 0));
    else if (e.key === 'Home' && Number.isFinite(min())) set(min());
    else if (e.key === 'End' && Number.isFinite(max())) set(max());
    else return;
    e.preventDefault();
  };
  // 受控时业务改 aria-valuenow，这里跟着更新文字和按钮状态
  const mo = new MutationObserver(() => {
    const n = read();
    if (value.textContent !== String(n)) render(n, 0);
  });
  mo.observe(value, { attributes: true, attributeFilter: ['aria-valuenow'] });
  host.addEventListener('click', onClick);
  value.addEventListener('keydown', onKey);
  return () => {
    mo.disconnect();
    host.removeEventListener('click', onClick);
    value.removeEventListener('keydown', onKey);
  };
}

/* ---------------- 开关 ---------------- */
function toggle(el: HTMLElement): () => void {
  if (!el.hasAttribute('aria-checked')) el.setAttribute('aria-checked', 'false');
  const onClick = (): void => {
    const next = el.getAttribute('aria-checked') !== 'true';
    if (!emit(el, { value: next }) || controlled(el)) return;
    el.setAttribute('aria-checked', String(next));
  };
  el.addEventListener('click', onClick);
  return () => el.removeEventListener('click', onClick);
}

/* ---------------- 滑块 ---------------- */
function slider(el: HTMLElement): () => void {
  const min = Number(el.getAttribute('aria-valuemin') ?? 0);
  const max = Number(el.getAttribute('aria-valuemax') ?? 100);
  const step = Number(el.dataset.step ?? 1);
  const unit = el.dataset.unit ?? (max === 100 && min === 0 ? '%' : '');
  if (!el.hasAttribute('tabindex')) el.tabIndex = 0;

  el.innerHTML = '';
  const track = document.createElement('span');
  track.setAttribute('data-part', 'track');
  track.innerHTML =
    '<span data-part="tip"></span><span data-part="rail"><span data-part="fill"></span></span><span data-part="thumb"></span>';
  el.append(track);
  const ticks = el.dataset.ticks?.split(',').map((t) => t.trim());
  if (ticks?.length) {
    const row = document.createElement('span');
    row.setAttribute('data-part', 'ticks');
    row.setAttribute('aria-hidden', 'true');
    for (const t of ticks)
      row.append(Object.assign(document.createElement('span'), { textContent: t }));
    el.append(row);
  }
  const tip = track.querySelector('[data-part="tip"]') as HTMLElement;

  const read = (): number => Number(el.getAttribute('aria-valuenow') ?? min);
  const render = (): void => {
    const n = read();
    el.style.setProperty('--bd-value', `${((n - min) / (max - min || 1)) * 100}%`);
    tip.textContent = `${n}${unit}`;
    if (!el.hasAttribute('aria-valuetext') || el.dataset.bdValuetext) {
      el.setAttribute('aria-valuetext', `${n}${unit}`);
      el.dataset.bdValuetext = '1';
    }
  };
  const set = (raw: number): void => {
    const n = Math.min(max, Math.max(min, Math.round((raw - min) / step) * step + min));
    if (n === read()) return;
    if (!emit(el, { value: n }) || controlled(el)) return;
    el.setAttribute('aria-valuenow', String(n));
  };
  const fromPointer = (x: number): number => {
    const r = track.getBoundingClientRect();
    return min + ((x - r.left) / r.width) * (max - min);
  };

  const onDown = (e: PointerEvent): void => {
    if (el.getAttribute('aria-disabled') === 'true') return;
    el.setPointerCapture(e.pointerId);
    el.setAttribute('data-dragging', '');
    set(fromPointer(e.clientX));
  };
  const onMove = (e: PointerEvent): void => {
    if (el.hasAttribute('data-dragging')) set(fromPointer(e.clientX));
  };
  const onUp = (): void => el.removeAttribute('data-dragging');
  const onKey = (e: KeyboardEvent): void => {
    const big = (max - min) / 10;
    const map: Record<string, number> = {
      ArrowRight: step,
      ArrowUp: step,
      ArrowLeft: -step,
      ArrowDown: -step,
      PageUp: big,
      PageDown: -big,
    };
    if (e.key in map) set(read() + (map[e.key] ?? 0));
    else if (e.key === 'Home') set(min);
    else if (e.key === 'End') set(max);
    else return;
    e.preventDefault();
  };
  const mo = new MutationObserver(render);
  mo.observe(el, { attributes: true, attributeFilter: ['aria-valuenow'] });
  render();
  el.addEventListener('pointerdown', onDown);
  el.addEventListener('pointermove', onMove);
  el.addEventListener('pointerup', onUp);
  el.addEventListener('pointercancel', onUp);
  el.addEventListener('keydown', onKey);
  return () => {
    mo.disconnect();
    el.removeEventListener('pointerdown', onDown);
    el.removeEventListener('pointermove', onMove);
    el.removeEventListener('pointerup', onUp);
    el.removeEventListener('pointercancel', onUp);
    el.removeEventListener('keydown', onKey);
  };
}

/* ---------------- 上传区 ---------------- */
function dropzone(zone: HTMLElement): () => void {
  const file = zone.querySelector<HTMLInputElement>('input[type="file"]');
  let depth = 0;
  const onEnter = (e: DragEvent): void => {
    e.preventDefault();
    depth++;
    zone.setAttribute('data-dragover', '');
  };
  const onOver = (e: DragEvent): void => e.preventDefault();
  const onLeave = (): void => {
    depth = Math.max(0, depth - 1);
    if (!depth) zone.removeAttribute('data-dragover');
  };
  const onDrop = (e: DragEvent): void => {
    e.preventDefault();
    depth = 0;
    zone.removeAttribute('data-dragover');
    const files = e.dataTransfer?.files;
    if (!files?.length) return;
    if (file) {
      file.files = files;
      file.dispatchEvent(new Event('change', { bubbles: true }));
    } else {
      emit(zone, { files: [...files] });
    }
  };
  const onChange = (): void => {
    if (file?.files?.length) emit(zone, { files: [...file.files] });
  };
  zone.addEventListener('dragenter', onEnter);
  zone.addEventListener('dragover', onOver);
  zone.addEventListener('dragleave', onLeave);
  zone.addEventListener('drop', onDrop);
  file?.addEventListener('change', onChange);
  return () => {
    zone.removeEventListener('dragenter', onEnter);
    zone.removeEventListener('dragover', onOver);
    zone.removeEventListener('dragleave', onLeave);
    zone.removeEventListener('drop', onDrop);
    file?.removeEventListener('change', onChange);
  };
}

export function registerForm(): void {
  define('.bd-input:not(input)', input);
  define('.bd-stepper', stepper);
  define('.bd-switch', toggle);
  define('.bd-slider', slider);
  define('.bd-dropzone', dropzone);
}
