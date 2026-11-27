/**
 * 导航 bd-nav：当前项 aria-current，选中底连续滑动。
 * data-spy：链接指向页内锚点时，按滚动位置自动把当前项设为正在阅读的那一节。
 */
import { choice, CURRENT } from './choice';
import { define } from './core';

const ITEMS = ':scope > :is(a, button)';

function spy(host: HTMLElement): () => void {
  const links = [...host.querySelectorAll<HTMLAnchorElement>(':scope > a[href^="#"]')];
  const targets = links
    .map((a) => ({ a, el: document.getElementById(decodeURIComponent(a.hash.slice(1))) }))
    .filter((x): x is { a: HTMLAnchorElement; el: HTMLElement } => !!x.el);
  if (!targets.length) return () => {};
  let raf = 0;
  const update = (): void => {
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(() => {
      const line = innerHeight * 0.3;
      let active = targets[0];
      for (const t of targets) if (t.el.getBoundingClientRect().top <= line) active = t;
      // 滚到底时最后一节算当前
      if (innerHeight + scrollY >= document.documentElement.scrollHeight - 2)
        active = targets[targets.length - 1];
      if (!active || active.a.matches(CURRENT)) return;
      for (const t of targets) t.a.removeAttribute('aria-current');
      active.a.setAttribute('aria-current', 'location');
    });
  };
  addEventListener('scroll', update, { passive: true });
  update();
  return () => {
    cancelAnimationFrame(raf);
    removeEventListener('scroll', update);
  };
}

export function registerNav(): void {
  define('.bd-nav', (host) => {
    const vertical = host.getAttribute('data-orientation') === 'vertical';
    const off = choice(host, {
      items: ITEMS,
      current: 'true',
      orientation: vertical ? 'vertical' : 'horizontal',
    });
    const offSpy = host.hasAttribute('data-spy') ? spy(host) : () => {};
    return () => {
      off();
      offSpy();
    };
  });
}
