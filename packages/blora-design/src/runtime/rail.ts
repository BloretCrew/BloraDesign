/**
 * 侧栏 bd-rail：选中滑块、收起 / 展开（记住用户的选择）、按钮型导航项的选中切换。
 * 导航项是侧栏里没有 data-part 的 <a> / <button>，当前项写 aria-current="page"。
 */
import { define } from './core';
import { glide } from './glide';
import { instant } from './motion';

const ITEM = ':is(a, button):not([data-part])';
const CURRENT = `${ITEM}[aria-current]:not([aria-current="false"])`;
const STORE = 'bd-rail';

function readStore(): string | null {
  try {
    return localStorage.getItem(STORE);
  } catch {
    return null;
  }
}

function writeStore(value: string): void {
  try {
    localStorage.setItem(STORE, value);
  } catch {
    /* 隐私模式等情况下存不了，不影响使用 */
  }
}

/** 注册侧栏行为（入口 index.ts 调用） */
export function registerRail(): void {
  define('.bd-rail', (rail) => {
    const offGlide = glide(rail, { items: ITEM, active: CURRENT });
    const toggle = rail.querySelector<HTMLElement>('[data-part="collapse"]');
    const scope = rail.closest('.bd-app') ?? rail;

    if (toggle) {
      if (!toggle.hasAttribute('aria-expanded')) toggle.setAttribute('aria-expanded', 'true');
      if (readStore() === 'collapsed') {
        instant(scope, () => toggle.setAttribute('aria-expanded', 'false'));
      }
    }

    const onClick = (event: MouseEvent): void => {
      const target = event.target instanceof Element ? event.target : null;
      if (toggle && target?.closest('[data-part="collapse"]') === toggle) {
        const expanded = toggle.getAttribute('aria-expanded') !== 'false';
        toggle.setAttribute('aria-expanded', String(!expanded));
        writeStore(expanded ? 'collapsed' : 'expanded');
        rail.dispatchEvent(
          new CustomEvent('bd-toggle', { bubbles: true, detail: { expanded: !expanded } }),
        );
        return;
      }
      const item = target?.closest<HTMLElement>(ITEM);
      if (!item || !rail.contains(item)) return;
      const changed = rail.dispatchEvent(
        new CustomEvent('bd-change', { bubbles: true, cancelable: true, detail: { item } }),
      );
      // 链接由页面或路由负责设置 aria-current；按钮型导航项、且业务没有接管状态时，由运行时切换
      if (!changed || item.tagName !== 'BUTTON' || rail.hasAttribute('data-bd-controlled')) return;
      rail.querySelectorAll(CURRENT).forEach((el) => el.removeAttribute('aria-current'));
      item.setAttribute('aria-current', 'page');
    };
    rail.addEventListener('click', onClick);

    return () => {
      offGlide();
      rail.removeEventListener('click', onClick);
    };
  });
}
