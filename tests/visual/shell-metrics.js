// 在页面里运行：量出外壳、侧栏、顶栏、页头、拼图、格子标题、托盘的几何与样式。
// 参考页（reference/demo-console.html，旧类名）和框架页（recipes/patterns/console-overview.html）用同一套键名，便于逐项比对。
// eslint-disable-next-line @typescript-eslint/no-unused-vars -- 由测试注入页面后调用
function shellMetrics(kind) {
  const ref = kind === 'reference';
  const scope = ref ? document.querySelector('.scene.active') : document;
  const q = (s, root = document) => root.querySelector(s);
  const qa = (s, root = document) => [...root.querySelectorAll(s)];
  const box = (el) => {
    if (!el) return null;
    const r = el.getBoundingClientRect();
    return {
      x: Math.round(r.x),
      y: Math.round(r.y),
      w: Math.round(r.width),
      h: Math.round(r.height),
    };
  };
  const st = (el, props, pseudo) => {
    if (!el) return null;
    const cs = getComputedStyle(el, pseudo);
    return Object.fromEntries(props.map((p) => [p, cs[p]]));
  };
  const visible = (el) => el && el.getBoundingClientRect().width > 0;
  const S = ref
    ? {
        app: '.app',
        rail: '.side-rail',
        brand: '.rail-brand',
        logo: '.logo-mark',
        brandTitle: '.brand-title',
        section: '.rail-section',
        items: '#railTrack .rail-btn',
        glide: '.rail-glider',
        count: '.rail-count',
        note: '.rail-plan',
        collapse: '.rail-collapse-btn',
        topbar: '.topbar',
        mobileNav: '.mobile-nav',
        pageHead: '.page-head',
        eyebrow: '.page-eyebrow',
        title: '.page-title',
        sub: '.page-sub',
        rows: ':scope > .row',
        head: '.tile-head',
        headTitle: '.tile-title',
        headSub: '.tile-sub',
        tray: '.tray',
      }
    : {
        app: '.bd-app',
        rail: '.bd-rail',
        brand: '.bd-rail > [data-part="brand"]',
        logo: '[data-part="logo"]',
        brandTitle: '.bd-rail > [data-part="brand"] > span:last-child',
        section: '.bd-rail > [data-part="section"]',
        items: '.bd-rail > button:not([data-part])',
        glide: '.bd-rail > [data-part="glide"]',
        count: '[data-part="count"]',
        note: '[data-part="note"]',
        collapse: '[data-part="collapse"]',
        topbar: '.bd-topbar',
        mobileNav: '.bd-rail',
        pageHead: '.bd-tile[data-variant="page"]',
        eyebrow: '[data-part="eyebrow"]',
        title: '.bd-tile[data-variant="page"] > h1',
        sub: '.bd-tile[data-variant="page"] > h1 + p',
        rows: '.bd-mosaic',
        head: '.bd-head',
        headTitle: '.bd-head > h2',
        headSub: '.bd-head > p',
        tray: '.bd-tray',
      };
  const TEXT = ['fontSize', 'fontWeight', 'lineHeight', 'letterSpacing', 'color'];
  const SURF = ['borderRadius', 'backgroundColor', 'boxShadow', 'padding'];
  const items = qa(S.items).filter(visible);
  const active = items.find((b) =>
    ref ? b.classList.contains('active') : b.getAttribute('aria-current') === 'page',
  );
  const rows = qa(S.rows, scope);
  return {
    viewport: innerWidth,
    app: box(q(S.app)),
    rail:
      visible(q(S.rail)) && getComputedStyle(q(S.rail)).flexDirection === 'column'
        ? { box: box(q(S.rail)), ...st(q(S.rail), SURF) }
        : null,
    brand: visible(q(S.brand))
      ? {
          box: box(q(S.brand)),
          logo: box(q(S.logo)),
          logoStyle: st(q(S.logo), ['borderRadius', 'backgroundColor', 'color']),
          title: st(q(S.brandTitle), TEXT),
        }
      : null,
    section: visible(q(S.section)) ? { box: box(q(S.section)), ...st(q(S.section), TEXT) } : null,
    items: items.map((b) => ({ box: box(b), ...st(b, [...TEXT, 'borderRadius', 'paddingLeft']) })),
    active: active ? st(active, ['color', 'fontWeight']) : null,
    glide: q(S.glide)
      ? { box: box(q(S.glide)), ...st(q(S.glide), ['borderRadius', 'backgroundColor']) }
      : null,
    count: visible(q(S.count))
      ? { box: box(q(S.count)), ...st(q(S.count), [...TEXT, 'borderRadius', 'backgroundColor']) }
      : null,
    note: visible(q(S.note))
      ? {
          x: box(q(S.note)).x,
          w: box(q(S.note)).w,
          ...st(q(S.note), ['borderRadius', 'backgroundColor']),
        }
      : null,
    collapse: visible(q(S.collapse))
      ? { box: box(q(S.collapse)), ...st(q(S.collapse), ['color', 'borderRadius']) }
      : null,
    topbar: { box: box(q(S.topbar)), ...st(q(S.topbar), [...SURF, 'minHeight']) },
    strip: (() => {
      // ≤900：参考页是单独的 .mobile-nav，框架是同一个 bd-rail 变成横向导航条
      const el = q(S.mobileNav);
      if (!visible(el) || getComputedStyle(el).flexDirection !== 'row') return null;
      const first = ref ? q('button', el) : q('button:not([data-part])', el);
      return {
        box: box(el),
        ...st(el, SURF),
        item: { box: box(first), ...st(first, [...TEXT, 'borderRadius', 'padding']) },
      };
    })(),
    pageHead: { box: box(q(S.pageHead, scope)), ...st(q(S.pageHead, scope), SURF) },
    eyebrow: {
      box: box(q(S.eyebrow, scope)),
      ...st(q(S.eyebrow, scope), [...TEXT, 'textTransform']),
    },
    title: { box: box(q(S.title, scope)), ...st(q(S.title, scope), TEXT) },
    sub: { box: box(q(S.sub, scope)), ...st(q(S.sub, scope), TEXT) },
    rows: rows.map((row) => ({
      box: box(row),
      columns: getComputedStyle(row).gridTemplateColumns,
      tiles: [...row.children].map((t) => {
        const head = q(S.head, t);
        const title = head && q(S.headTitle, head);
        const tray = q(S.tray, t);
        const cell = tray && tray.firstElementChild;
        return {
          box: box(t),
          ...st(t, ['borderRadius', 'backgroundColor', 'boxShadow', 'padding']),
          head: head && {
            box: box(head),
            title: { box: box(title), ...st(title, TEXT) },
            badge: {
              ...st(
                title,
                [
                  'width',
                  'height',
                  'borderRadius',
                  'backgroundColor',
                  'color',
                  'fontSize',
                  'fontWeight',
                ],
                '::before',
              ),
              text: getComputedStyle(title, '::before').content,
            },
            sub: {
              box: box(q(S.headSub, head)),
              ...st(q(S.headSub, head), [...TEXT, 'paddingLeft', 'marginTop']),
            },
          },
          tray: tray && {
            x: box(tray).x,
            w: box(tray).w,
            ...st(tray, ['borderRadius', 'backgroundColor', 'padding', 'rowGap']),
            cell: st(cell, ['borderRadius', 'backgroundColor', 'boxShadow', 'padding']),
          },
        };
      }),
    })),
  };
}
