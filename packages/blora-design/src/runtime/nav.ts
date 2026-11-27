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
      // 目标还没显示（在隐藏的视图里）时不判断，等它显示出来再算
      const shown = targets.filter((t) => t.el.getClientRects().length > 0);
      if (!shown.length) return;
      const line = innerHeight * 0.3;
      let active = shown[0];
      for (const t of shown) if (t.el.getBoundingClientRect().top <= line) active = t;
      // 滚到底时最后一节算当前（页面根本不需要滚动时除外，那时第一节就是当前）
      if (scrollY > 0 && innerHeight + scrollY >= document.documentElement.scrollHeight - 2)
        active = shown[shown.length - 1];
      if (!active || active.a.matches(CURRENT)) return;
      for (const t of targets) t.a.removeAttribute('aria-current');
      active.a.setAttribute('aria-current', 'location');
    });
  };
  addEventListener('scroll', update, { passive: true });
  // 所在视图从隐藏切到显示时重新判断
  const ro = new ResizeObserver(update);
  for (const t of targets) ro.observe(t.el);
  update();
  return () => {
    cancelAnimationFrame(raf);
    ro.disconnect();
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
