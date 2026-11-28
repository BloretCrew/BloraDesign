/**
 * 浏览器检查：在页面里运行（page.evaluate），量出违反 DESIGN.md 的地方。
 * 整个函数会被序列化后送进页面，所以必须自包含：不能引用这个文件里的其他东西。
 */

export interface PageCheckOptions {
  width: number;
  /** 只检查这些规则 */
  rules: string[];
  /** 减少动效模式下的那一轮只查 reduced-motion */
  reducedMotion: boolean;
}

export interface RawViolation {
  rule: string;
  message: string;
  /** warn：已知问题（DESIGN.md 里记录过），报告但不算失败 */
  level?: 'warn';
  /** 页面用 data-bd-allow 明确豁免了这条规则 */
  allowed?: boolean;
  target?: string;
  tile?: string;
  box?: { x: number; y: number; w: number; h: number };
}

export function pageChecks(opt: PageCheckOptions): RawViolation[] {
  const out: RawViolation[] = [];
  const want = (rule: string): boolean => opt.rules.includes(rule);

  /* ---------------- 工具 ---------------- */
  const visible = (el: Element): boolean => {
    const r = el.getBoundingClientRect();
    if (r.width < 0.5 || r.height < 0.5) return false;
    return el.checkVisibility({ opacityProperty: true, visibilityProperty: true });
  };
  const pathOf = (el: Element): string => {
    const parts: string[] = [];
    let e: Element | null = el;
    for (let i = 0; e && e !== document.body && i < 3; i++, e = e.parentElement) {
      if (e.id) {
        parts.unshift(`#${e.id}`);
        break;
      }
      const cls = [...e.classList].find((c) => c.startsWith('bd-'));
      const part = e.getAttribute('data-part');
      const pattern = e.getAttribute('data-pattern');
      parts.unshift(
        `${e.tagName.toLowerCase()}${cls ? `.${cls}` : ''}${part ? `[data-part=${part}]` : ''}${pattern ? `[data-pattern=${pattern}]` : ''}`,
      );
    }
    return parts.join(' > ');
  };
  const tileOf = (el: Element): string | undefined => {
    const t = el.closest('.bd-tile');
    if (!t) return undefined;
    const h = t.querySelector(':scope > .bd-head :is(h2, h3, h4), :scope > :is(h1, h2, h3)');
    return (h?.textContent ?? '').replace(/\s+/g, ' ').trim().slice(0, 40) || undefined;
  };
  const report = (rule: string, el: Element | null, message: string, level?: 'warn'): void => {
    const v: RawViolation = { rule, message };
    if (level) v.level = level;
    // 页面用 data-bd-allow="规则 …" 豁免（写在元素或它的祖先上），报告里只计数
    const allow = el?.closest('[data-bd-allow]')?.getAttribute('data-bd-allow')?.split(/\s+/) ?? [];
    if (allow.includes(rule)) v.allowed = true;
    if (el) {
      v.target = pathOf(el);
      const tile = tileOf(el);
      if (tile) v.tile = tile;
      const r = el.getBoundingClientRect();
      v.box = { x: r.x + scrollX, y: r.y + scrollY, w: r.width, h: r.height };
    }
    out.push(v);
  };
  const ownText = (el: Element): string =>
    [...el.childNodes]
      .filter((n) => n.nodeType === Node.TEXT_NODE)
      .map((n) => n.textContent ?? '')
      .join('')
      .trim();
  // svg 里只看真正画出来的图形（容器 <svg> 的默认黑色填充不算）
  const SHAPE = /^(path|circle|rect|ellipse|line|polyline|polygon|text|use)$/;
  const all = [...document.body.querySelectorAll('*')].filter(
    (e) => !(e instanceof SVGElement) || e.tagName === 'svg' || SHAPE.test(e.tagName),
  );

  type RGBA = [number, number, number, number];
  const probe = document.createElement('i');
  probe.style.display = 'none';
  document.body.append(probe);
  const parseColor = (text: string): RGBA | null => {
    let m = text.match(/^rgba?\(([\d.]+),\s*([\d.]+),\s*([\d.]+)(?:,\s*([\d.]+))?\)$/);
    if (m) return [Number(m[1]), Number(m[2]), Number(m[3]), m[4] === undefined ? 1 : Number(m[4])];
    m = text.match(/^color\(srgb ([\d.e-]+) ([\d.e-]+) ([\d.e-]+)(?: \/ ([\d.]+))?\)$/);
    if (m)
      return [
        Number(m[1]) * 255,
        Number(m[2]) * 255,
        Number(m[3]) * 255,
        m[4] === undefined ? 1 : Number(m[4]),
      ];
    return null;
  };
  const resolve = (value: string): RGBA | null => {
    probe.style.color = '';
    probe.style.color = value;
    if (!probe.style.color) return null;
    return parseColor(getComputedStyle(probe).color);
  };

  /* ---------------- 空白预算 ---------------- */
  if (want('whitespace')) {
    for (const t of document.querySelectorAll('.bd-tile')) {
      if (!visible(t)) continue;
      // 弹性内容（滚动视口、长文、图表、data-grow）按各自的例外处理
      if (t.querySelector('.bd-scroll, .bd-prose, .bd-chart, [data-grow]')) continue;
      // 顶部对齐、底边参差的行（看板）：长度由数据决定，不检查
      if (t.closest('.bd-mosaic[data-align="start"]')) continue;
      const tb = t.getBoundingClientRect();
      const pb = parseFloat(getComputedStyle(t).paddingBottom);
      const iv = [...t.querySelectorAll('*')]
        .filter(
          (e) =>
            visible(e) &&
            !e.closest('svg') &&
            !e.closest('.bd-corner') &&
            (!e.children.length ||
              /^(svg|BUTTON|INPUT)$/i.test(e.tagName) ||
              [...e.childNodes].some((n) => n.nodeType === 3 && (n.textContent ?? '').trim())),
        )
        .map((e) => {
          const r = e.getBoundingClientRect();
          return [r.top, r.bottom] as [number, number];
        })
        .sort((a, b) => a[0] - b[0]);
      if (!iv.length) continue;
      let cur = iv[0]?.[1] ?? 0;
      let gap = 0;
      for (const [a, b] of iv.slice(1)) {
        gap = Math.max(gap, a - cur);
        cur = Math.max(cur, b);
      }
      gap = Math.max(gap, tb.bottom - pb - cur);
      if (gap > 40.5)
        report('whitespace', t, `格子里最大的一段竖向空白是 ${Math.round(gap)}px（上限 40）`);
    }
  }

  /* ---------------- 压缩 ---------------- */
  if (want('squeezed')) {
    for (const e of all) {
      const p = e.parentElement;
      if (!p || !visible(e)) continue;
      const pc = getComputedStyle(p);
      const cs = getComputedStyle(e);
      if (!pc.display.includes('flex') || !pc.flexDirection.startsWith('column')) continue;
      if (+cs.flexShrink === 0 || +cs.flexGrow > 0 || cs.overflow === 'visible') continue;
      const clamp = cs.getPropertyValue('-webkit-line-clamp');
      if (clamp && clamp !== 'none') continue;
      if (e.matches('.bd-scroll, [data-grow]') || e.closest('.bd-scroll')) continue;
      const h = e.getBoundingClientRect().height;
      if (e.scrollHeight - h > 2)
        report('squeezed', e, `高 ${Math.round(h)}px，内容需要 ${e.scrollHeight}px`);
    }
  }

  /* ---------------- 光晕裁切 ---------------- */
  if (want('halo-clip')) {
    for (const el of document.querySelectorAll(
      '.bd-input, .bd-textarea, .bd-select, .bd-date, .bd-stepper',
    )) {
      if (!visible(el)) continue;
      let a = el.parentElement;
      while (
        a &&
        a !== document.body &&
        !/(hidden|clip|auto|scroll)/.test(getComputedStyle(a).overflow)
      )
        a = a.parentElement;
      if (!a || a === document.body) continue;
      const r = el.getBoundingClientRect();
      const c = a.getBoundingClientRect();
      const room = {
        上: r.top - c.top,
        右: c.right - r.right,
        下: c.bottom - r.bottom,
        左: r.left - c.left,
      };
      const tight = Object.entries(room).filter(([, v]) => v < 3 && v > -1);
      if (tight.length)
        report(
          'halo-clip',
          el,
          `离裁切容器 ${pathOf(a)} 太近（${tight.map(([k, v]) => `${k} ${Math.round(v)}px`).join('，')}，至少 3px）`,
        );
    }
  }

  /* ---------------- 原生外观 ---------------- */
  if (want('native-ui')) {
    for (const el of document.querySelectorAll('select, datalist, progress, meter'))
      report('native-ui', el, `<${el.tagName.toLowerCase()}> 带原生外观`);
    for (const el of document.querySelectorAll('input, button, textarea')) {
      if (el instanceof HTMLInputElement && el.type === 'hidden') continue;
      if (!visible(el)) continue;
      const ap = getComputedStyle(el).appearance;
      if (ap && ap !== 'none') report('native-ui', el, `appearance 是 ${ap}，原生外观没有去掉`);
      if (
        el instanceof HTMLInputElement &&
        /^(date|time|datetime-local|month|week|color|range|number)$/.test(el.type)
      )
        report('native-ui', el, `<input type="${el.type}"> 会露出系统面板`);
    }
    for (const el of document.querySelectorAll('summary')) {
      if (visible(el) && getComputedStyle(el).display === 'list-item')
        report('native-ui', el, '<summary> 还带着原生三角');
    }
    for (const el of document.querySelectorAll('[title]'))
      report('native-ui', el, 'title 属性会露出原生悬浮提示');
    // 原生滚动条：能滚动、又没有隐藏原生滚动条的区域
    const scrollers = [document.documentElement, ...all];
    for (const el of scrollers) {
      const cs = getComputedStyle(el);
      const scrollY =
        el.scrollHeight > el.clientHeight + 1 &&
        /(auto|scroll)/.test(el === document.documentElement ? 'auto' : cs.overflowY);
      const scrollX =
        el.scrollWidth > el.clientWidth + 1 &&
        /(auto|scroll)/.test(el === document.documentElement ? 'auto' : cs.overflowX);
      if (
        (scrollY || scrollX) &&
        cs.scrollbarWidth !== 'none' &&
        (el === document.documentElement || visible(el))
      )
        report(
          'native-ui',
          el === document.documentElement ? null : el,
          `${el === document.documentElement ? '页面' : '这个区域'}露出了原生滚动条，用 bd-scroll`,
        );
    }
  }

  /* ---------------- 写死颜色、渐变、描边 ---------------- */
  if (want('hard-color') || want('gradient') || want('border')) {
    // 当前主题下所有 --bd-* 变量解析出来的颜色
    const rootStyle = getComputedStyle(document.documentElement);
    const palette: RGBA[] = [];
    for (const name of rootStyle) {
      if (!name.startsWith('--bd-')) continue;
      const c = resolve(rootStyle.getPropertyValue(name).trim());
      if (c && c[3] > 0) palette.push(c);
    }
    const near = (a: RGBA, b: RGBA, tol: number): boolean =>
      Math.abs(a[0] - b[0]) <= tol && Math.abs(a[1] - b[1]) <= tol && Math.abs(a[2] - b[2]) <= tol;
    const cache = new Map<string, boolean>();
    // 允许：设计变量本身、它的半透明版本、两个设计变量按任意比例 color-mix 出来的颜色
    const allowed = (text: string): boolean => {
      const hit = cache.get(text);
      if (hit !== undefined) return hit;
      const c = parseColor(text);
      let ok = !c || c[3] === 0;
      if (c && !ok) {
        ok = palette.some((p) => near(c, p, 1.6));
        for (let i = 0; !ok && i < palette.length; i++)
          for (let j = i + 1; !ok && j < palette.length; j++) {
            const a = palette[i];
            const b = palette[j];
            if (!a || !b) continue;
            const d: [number, number, number] = [b[0] - a[0], b[1] - a[1], b[2] - a[2]];
            const len = d[0] ** 2 + d[1] ** 2 + d[2] ** 2;
            if (!len) continue;
            const t = ((c[0] - a[0]) * d[0] + (c[1] - a[1]) * d[1] + (c[2] - a[2]) * d[2]) / len;
            if (t < 0 || t > 1) continue;
            ok = near(c, [a[0] + d[0] * t, a[1] + d[1] * t, a[2] + d[2] * t, 1], 2);
          }
      }
      cache.set(text, ok);
      return ok;
    };
    for (const el of all) {
      if (!visible(el)) continue;
      const cs = getComputedStyle(el);
      if (want('hard-color')) {
        const checks: [string, string][] =
          el instanceof SVGElement ? [] : [['背景色', cs.backgroundColor]];
        if (ownText(el)) checks.push(['文字颜色', cs.color]);
        const shadowColors =
          cs.boxShadow === 'none'
            ? []
            : (cs.boxShadow.match(/(rgba?\([^)]*\)|color\([^)]*\))/g) ?? []);
        for (const s of shadowColors) checks.push(['投影颜色', s]);
        if (el instanceof SVGElement && el.tagName !== 'svg') {
          if (cs.fill !== 'none' && !cs.fill.startsWith('url') && +cs.fillOpacity > 0)
            checks.push(['填充色', cs.fill]);
          if (
            cs.stroke !== 'none' &&
            !cs.stroke.startsWith('url') &&
            parseFloat(cs.strokeWidth) > 0
          )
            checks.push(['描线色', cs.stroke]);
        }
        const bad = checks.filter(([, v]) => !allowed(v));
        if (bad.length)
          report('hard-color', el, bad.map(([k, v]) => `${k} ${v}`).join('；') + ' 不在设计变量里');
      }
      if (want('gradient') && /gradient\(/.test(cs.backgroundImage))
        report('gradient', el, `背景用了渐变：${cs.backgroundImage.slice(0, 60)}`);
      if (want('border')) {
        const sides = ['Top', 'Right', 'Bottom', 'Left'] as const;
        const drawn = sides.filter((s) => {
          const w = parseFloat(cs.getPropertyValue(`border-${s.toLowerCase()}-width`));
          const st = cs.getPropertyValue(`border-${s.toLowerCase()}-style`);
          const col = parseColor(cs.getPropertyValue(`border-${s.toLowerCase()}-color`));
          return w > 0 && st !== 'none' && st !== 'hidden' && (!col || col[3] > 0);
        });
        if (drawn.length) report('border', el, `画了描边（${drawn.join('、')}）`);
        if (cs.outlineStyle !== 'none' && parseFloat(cs.outlineWidth) > 0)
          report('border', el, '画了 outline（焦点用聚焦光晕）');
      }
    }
  }

  /* ---------------- 对比度 ---------------- */
  if (want('contrast')) {
    const rootStyle = getComputedStyle(document.documentElement);
    const token = (n: string): RGBA | null => resolve(rootStyle.getPropertyValue(n).trim());
    const aux = [token('--bd-ink-tertiary'), token('--bd-ink-quaternary')].filter(
      Boolean,
    ) as RGBA[];
    const desc = token('--bd-ink-description');
    const onPrimary = token('--bd-on-primary');
    const blushSolid = token('--bd-blush-solid');
    const same = (a: RGBA | null, b: RGBA | null): boolean =>
      !!a &&
      !!b &&
      Math.abs(a[0] - b[0]) < 2 &&
      Math.abs(a[1] - b[1]) < 2 &&
      Math.abs(a[2] - b[2]) < 2;
    const lum = (c: RGBA): number => {
      const f = (v: number): number => {
        const s = v / 255;
        return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
      };
      return 0.2126 * f(c[0]) + 0.7152 * f(c[1]) + 0.0722 * f(c[2]);
    };
    const over = (top: RGBA, bottom: RGBA): RGBA => {
      const a = top[3];
      return [
        top[0] * a + bottom[0] * (1 - a),
        top[1] * a + bottom[1] * (1 - a),
        top[2] * a + bottom[2] * (1 - a),
        1,
      ];
    };
    const backdrop = (el: Element): RGBA => {
      const layers: RGBA[] = [];
      for (let e: Element | null = el; e; e = e.parentElement) {
        const c = parseColor(getComputedStyle(e).backgroundColor);
        if (c && c[3] > 0) {
          layers.push(c);
          if (c[3] >= 1) break;
        }
      }
      let base: RGBA = [255, 255, 255, 1];
      for (const l of layers.reverse()) base = over(l, base);
      return base;
    };
    const dimmed = (el: Element): boolean => {
      for (let e: Element | null = el; e; e = e.parentElement)
        if (+getComputedStyle(e).opacity < 1) return true;
      return false;
    };
    for (const el of all) {
      if (!ownText(el) || !visible(el)) continue;
      // 禁用、有意调淡、纯装饰（命令提示符）、图形标志（role="img"，WCAG 不要求标志文字的对比度）不检查
      if (
        el.closest(
          ':disabled, [aria-disabled="true"], [aria-hidden="true"], [data-part="prompt"], [role="img"]',
        )
      )
        continue;
      if (dimmed(el)) continue;
      const cs = getComputedStyle(el);
      const fg = parseColor(cs.color);
      if (!fg) continue;
      const bg = backdrop(el);
      const text = over(fg, bg);
      const l1 = lum(text);
      const l2 = lum(bg);
      const ratio = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
      const size = parseFloat(cs.fontSize);
      const large = size >= 24 || (size >= 18.66 && +cs.fontWeight >= 600);
      // tertiary / quaternary 是辅助文字（标签、元信息、编号），按 DESIGN.md 只用在小标签上
      const auxText = aux.some((a) => same(a, fg));
      const need = auxText ? 2 : large ? 3 : 4.5;
      if (ratio + 0.005 >= need) continue;
      const label = `「${ownText(el).slice(0, 16)}」对比度 ${ratio.toFixed(2)}，需要 ${need}${auxText ? '（辅助文字）' : ''}`;
      // 已知问题（DESIGN.md · Colors · 已知问题）：雾粉实色底上的白字；说明文字放在浅底上（约 4.2）
      if (same(fg, onPrimary) && same(bg, blushSolid))
        report('contrast', el, `${label}（已知问题：雾粉实色底白字）`, 'warn');
      else if (same(fg, desc) && ratio >= 4)
        report('contrast', el, `${label}（已知问题：浅底上的说明文字）`, 'warn');
      else report('contrast', el, label);
    }
  }

  /* ---------------- 选中滑块对齐 ---------------- */
  if (want('glide')) {
    for (const pill of document.querySelectorAll('[data-part="glide"]')) {
      const host = pill.parentElement;
      if (!host || !visible(host) || +getComputedStyle(pill).opacity < 0.5) continue;
      const active = host.querySelector('[data-glide-on]');
      if (!active) continue;
      const a = pill.getBoundingClientRect();
      const b = active.getBoundingClientRect();
      const d = [a.x - b.x, a.y - b.y, a.width - b.width, a.height - b.height].map((v) =>
        Math.abs(v),
      );
      if (Math.max(...d) > 0.6)
        report(
          'glide',
          active,
          `滑块和选中项差 ${d.map((v) => v.toFixed(1)).join(' / ')}px（x / y / 宽 / 高）`,
        );
    }
  }

  /* ---------------- 溢出 ---------------- */
  if (want('overflow')) {
    const doc = document.documentElement;
    if (doc.scrollWidth > doc.clientWidth + 1)
      report('overflow', null, `页面横向溢出 ${doc.scrollWidth - doc.clientWidth}px`);
    for (const el of all) {
      if (!ownText(el) || !visible(el)) continue;
      const cs = getComputedStyle(el);
      if (cs.overflowX !== 'visible' || cs.display.startsWith('inline')) continue;
      if (el.closest('.bd-scroll, [data-part="track"]')) continue;
      if (el.scrollWidth > el.clientWidth + 1)
        report('overflow', el, `文字超出容器 ${el.scrollWidth - el.clientWidth}px`);
    }
  }

  /* ---------------- 手机点击区域（WCAG 2.2 AA：至少 24 × 24） ---------------- */
  if (want('tap-target') && opt.width <= 640) {
    const INTERACTIVE =
      'a[href], button, summary, label:has(input), input:not([type="hidden"]), textarea, [role="button"], [role="tab"], [role="radio"], [role="option"], [role="menuitem"], [role="menuitemradio"], [role="switch"], [role="checkbox"], [role="treeitem"]';
    for (const el of document.querySelectorAll(INTERACTIVE)) {
      if (!visible(el)) continue;
      const r = el.getBoundingClientRect();
      const slop = parseFloat(getComputedStyle(el).getPropertyValue('--bd-hit-slop')) || 0;
      if (Math.min(r.width, r.height) + slop * 2 >= 23.5) continue;
      // 嵌在更大的可点区域里（标签里的勾选框、可点的整行）、或者是正文里的行内链接
      const host = el.parentElement?.closest(INTERACTIVE + ', tr:has(.bd-checkbox)');
      if (host) {
        const h = host.getBoundingClientRect();
        const hostSlop = parseFloat(getComputedStyle(host).getPropertyValue('--bd-hit-slop')) || 0;
        if (Math.min(h.width, h.height) + hostSlop * 2 >= 23.5) continue;
      }
      if (el.tagName === 'A' && getComputedStyle(el).display === 'inline') continue;
      report(
        'tap-target',
        el,
        `可点击区域 ${Math.round(r.width)} × ${Math.round(r.height)}px（手机上至少 24）`,
      );
    }
  }

  /* ---------------- 减少动效 ---------------- */
  if (want('reduced-motion') && opt.reducedMotion) {
    const MOVE = /^(all|transform|translate|scale|rotate|top|left|right|bottom|inset|margin.*)$/;
    const secs = (s: string): number[] =>
      s.split(',').map((v) => (v.trim().endsWith('ms') ? parseFloat(v) / 1000 : parseFloat(v)));
    for (const el of all) {
      if (!visible(el)) continue;
      for (const pseudo of [null, '::before', '::after'] as const) {
        const cs = getComputedStyle(el, pseudo);
        if (pseudo && (cs.content === 'none' || cs.content === 'normal')) continue;
        const props = cs.transitionProperty.split(',').map((p) => p.trim());
        const durs = secs(cs.transitionDuration);
        const moving = props.filter((p, i) => MOVE.test(p) && (durs[i % durs.length] ?? 0) > 0.02);
        if (moving.length)
          report('reduced-motion', el, `${pseudo ?? ''}过渡仍会移动：${moving.join('、')}`);
      }
    }
    for (const a of document.getAnimations()) {
      if (a.playState !== 'running' || !(a.effect instanceof KeyframeEffect)) continue;
      const dur = Number(a.effect.getTiming().duration) || 0;
      const moves = a.effect
        .getKeyframes()
        .some((k) =>
          ['transform', 'translate', 'scale', 'rotate', 'top', 'left'].some((p) => p in k),
        );
      const target = a.effect.target;
      if (dur > 20 && moves && target)
        report(
          'reduced-motion',
          target,
          `动画 ${a instanceof CSSAnimation ? a.animationName : ''} 仍在移动（${dur}ms）`,
        );
    }
  }

  probe.remove();
  return out;
}
