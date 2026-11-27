/**
 * 页签 bd-tabs：单选组 + 面板切换 + 关闭。
 * 选中页签变化时，aria-controls 指向的面板显示，其余面板 hidden；
 * 点 data-part="close" 发出可取消的 bd-close，未取消且没有 data-bd-controlled 时移除页签和面板、选中相邻页签。
 * 新加入的页签有弹出动画（首屏的页签没有）。
 */
import { choice } from './choice';
import { define } from './core';
import { reducedMotion } from './motion';

const TAB = ':scope > [role="tab"]';

function syncPanels(host: HTMLElement): void {
  for (const tab of host.querySelectorAll<HTMLElement>(TAB)) {
    const id = tab.getAttribute('aria-controls');
    const panel = id ? document.getElementById(id) : null;
    if (panel) panel.hidden = tab.getAttribute('aria-selected') !== 'true';
  }
}

export function registerTabs(): void {
  define('.bd-tabs', (host) => {
    const off = choice(host, { items: TAB, orientation: 'horizontal' });
    syncPanels(host);
    // 新加入的页签从 0.85 倍弹出（DESIGN.md · Motion：列表增删要连续）
    const known = new WeakSet(host.querySelectorAll(TAB));
    const mo = new MutationObserver(() => {
      syncPanels(host);
      for (const tab of host.querySelectorAll<HTMLElement>(TAB)) {
        if (known.has(tab)) continue;
        known.add(tab);
        if (!reducedMotion()) {
          tab.animate(
            [
              { opacity: 0, transform: 'scale(0.85)' },
              { opacity: 1, transform: 'none' },
            ],
            {
              duration: 260,
              easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
            },
          );
        }
      }
    });
    mo.observe(host, {
      subtree: true,
      attributes: true,
      attributeFilter: ['aria-selected'],
      childList: true,
    });

    const onClick = (e: MouseEvent): void => {
      const close = (e.target as Element | null)?.closest('[data-part="close"]');
      const tab = close?.closest<HTMLElement>('[role="tab"]');
      if (!close || !tab || !host.contains(tab)) return;
      e.stopPropagation();
      const proceed = host.dispatchEvent(
        new CustomEvent('bd-close', { bubbles: true, cancelable: true, detail: { item: tab } }),
      );
      if (!proceed || host.hasAttribute('data-bd-controlled')) return;
      const tabs = [...host.querySelectorAll<HTMLElement>(TAB)];
      const i = tabs.indexOf(tab);
      const wasSelected = tab.getAttribute('aria-selected') === 'true';
      const panelId = tab.getAttribute('aria-controls');
      tab.remove();
      if (panelId) document.getElementById(panelId)?.remove();
      if (wasSelected) {
        const next = tabs[i + 1] ?? tabs[i - 1];
        if (next && next !== tab) next.click();
      }
    };
    // 捕获阶段处理，保证先于单选组的点击切换
    host.addEventListener('click', onClick, true);

    return () => {
      off();
      mo.disconnect();
      host.removeEventListener('click', onClick, true);
    };
  });
}
