/**
 * 折线图 bd-chart：读 <data value="1,2,3"> 画成平滑折线（Catmull-Rom 转三次贝塞尔，曲线经过每个数据点），
 * 纵轴三档（最大、一半、0），横轴标签取 data-labels。数据或标签变化时重画；悬停时显示参考线、圆点和读数。
 */
import { define } from './core';
import { reducedMotion } from './motion';

const W = 600;
const H = 200;
const LEFT = 34;
const SVG = 'http://www.w3.org/2000/svg';

type Point = [number, number];

function smooth(p: Point[]): string {
  const f = (n: number): string => n.toFixed(1);
  return p
    .map((q, i) => {
      const p1 = p[i - 1];
      if (!p1) return `M${f(q[0])} ${f(q[1])}`;
      const p0 = p[i - 2] ?? p1;
      const p3 = p[i + 1] ?? q;
      const k = 1 / 6;
      const c1: Point = [p1[0] + (q[0] - p0[0]) * k, p1[1] + (q[1] - p0[1]) * k];
      const c2: Point = [q[0] - (p3[0] - p1[0]) * k, q[1] - (p3[1] - p1[1]) * k];
      return `C${[c1, c2, q].map((c) => `${f(c[0])} ${f(c[1])}`).join(' ')}`;
    })
    .join(' ');
}

function chart(host: HTMLElement): () => void {
  let first = true;
  const make = <K extends keyof HTMLElementTagNameMap>(
    tag: K,
    part: string,
  ): HTMLElementTagNameMap[K] => {
    const el = document.createElement(tag);
    el.dataset.part = part;
    return el;
  };
  const plot = make('div', 'plot');
  const axisX = make('div', 'axis-x');
  axisX.setAttribute('aria-hidden', 'true');
  host.append(plot, axisX);
  host.style.setProperty('--bd-chart-inset', `${(LEFT / W) * 100}%`);
  if (!host.hasAttribute('role')) host.setAttribute('role', 'img');

  const render = (): void => {
    const series = [...host.querySelectorAll<HTMLDataElement>(':scope > data')].map((d) => ({
      tone: d.dataset.tone ?? 'blush',
      label: d.dataset.label ?? '',
      values: d.value.split(',').map(Number),
    }));
    const main = series[0];
    if (!main) return;
    const unit = host.dataset.unit ?? '';
    const max = Math.ceil((Math.max(...series.flatMap((s) => s.values)) * 1.15) / 10) * 10 || 10;
    const pts = (v: number[]): Point[] =>
      v.map((n, i) => [LEFT + ((W - LEFT) * i) / Math.max(1, v.length - 1), H - (n / max) * H]);

    const svg = document.createElementNS(SVG, 'svg');
    svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
    svg.setAttribute('preserveAspectRatio', 'none');
    svg.setAttribute('aria-hidden', 'true');
    if (first ? !host.closest('[data-bd-instant]') && !reducedMotion() : !reducedMotion())
      svg.dataset.draw = '';
    const grid = document.createElementNS(SVG, 'g');
    grid.dataset.part = 'grid';
    for (const f of [0.25, 0.5, 0.75, 1]) {
      const l = document.createElementNS(SVG, 'line');
      l.setAttribute('x1', String(LEFT));
      l.setAttribute('x2', String(W));
      l.setAttribute('y1', String(H - H * f));
      l.setAttribute('y2', String(H - H * f));
      grid.append(l);
    }
    svg.append(grid);
    const lines = document.createElementNS(SVG, 'g');
    // 对比线画在下面，主线压在上面
    for (const s of [...series.slice(1), main]) {
      const path = document.createElementNS(SVG, 'path');
      path.dataset.part = 'line';
      path.dataset.tone = s.tone;
      if (s !== main) path.dataset.variant = 'compare';
      path.setAttribute('d', smooth(pts(s.values)));
      lines.append(path);
    }
    svg.append(lines);

    const axisY = make('div', 'axis-y');
    axisY.setAttribute('aria-hidden', 'true');
    axisY.innerHTML = [`${max}${unit}`, `${max / 2}${unit}`, '0']
      .map((t) => `<span>${t}</span>`)
      .join('');
    const guide = make('div', 'guide');
    const dot = make('div', 'dot');
    const tip = make('div', 'tip');
    plot.replaceChildren(svg, axisY, guide, dot, tip);
    axisX.innerHTML = (host.dataset.labels ?? '')
      .split(',')
      .filter(Boolean)
      .map((t) => `<span>${t}</span>`)
      .join('');

    const pa = pts(main.values);
    plot.onpointermove = (e: PointerEvent): void => {
      const r = plot.getBoundingClientRect();
      const fx = ((e.clientX - r.left) / r.width) * W;
      const idx = Math.max(
        0,
        Math.min(
          main.values.length - 1,
          Math.round(((fx - LEFT) / (W - LEFT)) * (main.values.length - 1)),
        ),
      );
      const point = pa[idx];
      if (!point) return;
      const [x, y] = point;
      const px = (x / W) * r.width;
      guide.style.left = `${px}px`;
      dot.style.left = `${px}px`;
      dot.style.top = `${(y / H) * r.height}px`;
      tip.style.left = `${Math.min(Math.max(px, 60), r.width - 60)}px`;
      const others = series
        .slice(1)
        .map((s) => ` <span>· ${s.label} ${s.values[idx] ?? ''}${unit}</span>`)
        .join('');
      tip.innerHTML = `<b>${main.values[idx]}${unit}</b>${others}`;
      host.dataset.hover = '';
    };
    plot.onpointerleave = (): void => {
      delete host.dataset.hover;
    };
    first = false;
  };

  render();
  const mo = new MutationObserver(render);
  mo.observe(host, {
    subtree: true,
    attributes: true,
    attributeFilter: ['value', 'data-labels', 'data-unit'],
    childList: false,
  });
  return () => {
    mo.disconnect();
    plot.remove();
    axisX.remove();
  };
}

export function registerChart(): void {
  define('.bd-chart', chart);
}
