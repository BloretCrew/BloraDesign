/**
 * 目录树 bd-tree：点击节点选中（aria-selected，选中底连续滑动）；点文件夹展开 / 收起（高度过渡）；
 * 键盘：上下移动、右展开 / 进入、左收起 / 回到上级、Enter / 空格选中。
 */
import { define } from './core';
import { glide } from './glide';
import { reducedMotion } from './motion';

const NODE = '[data-part="node"]';

function visibleNodes(tree: HTMLElement): HTMLElement[] {
  return [...tree.querySelectorAll<HTMLElement>(NODE)].filter((n) => n.offsetParent !== null);
}

function toggle(item: HTMLElement, open?: boolean): void {
  const group = item.querySelector<HTMLElement>(':scope > [role="group"]');
  const expanded = item.getAttribute('aria-expanded') === 'true';
  const next = open ?? !expanded;
  if (next === expanded) return;
  if (!group || reducedMotion()) {
    item.setAttribute('aria-expanded', String(next));
    return;
  }
  group.getAnimations().forEach((a) => a.cancel());
  if (next) {
    item.setAttribute('aria-expanded', 'true');
    const h = group.scrollHeight;
    group.animate(
      [
        { height: '0px', opacity: 0, overflow: 'hidden' },
        { height: `${h}px`, opacity: 1, overflow: 'hidden' },
      ],
      { duration: 280, easing: 'cubic-bezier(0.22, 1, 0.36, 1)' },
    );
  } else {
    const h = group.getBoundingClientRect().height;
    const anim = group.animate(
      [
        { height: `${h}px`, opacity: 1, overflow: 'hidden' },
        { height: '0px', opacity: 0, overflow: 'hidden' },
      ],
      { duration: 280, easing: 'cubic-bezier(0.22, 1, 0.36, 1)' },
    );
    anim.addEventListener('finish', () => item.setAttribute('aria-expanded', 'false'));
  }
}

export function registerTree(): void {
  define('.bd-tree', (tree) => {
    const offGlide = glide(tree, { items: NODE, active: `[aria-selected="true"] > ${NODE}` });

    const select = (item: HTMLElement): void => {
      if (item.getAttribute('aria-selected') === 'true') return;
      const proceed = tree.dispatchEvent(
        new CustomEvent('bd-change', { bubbles: true, cancelable: true, detail: { item } }),
      );
      if (!proceed || tree.hasAttribute('data-bd-controlled')) return;
      tree
        .querySelectorAll('[role="treeitem"][aria-selected="true"]')
        .forEach((el) => el.setAttribute('aria-selected', 'false'));
      item.setAttribute('aria-selected', 'true');
    };

    const syncFocus = (): void => {
      const nodes = [...tree.querySelectorAll<HTMLElement>(NODE)];
      const active =
        tree.querySelector<HTMLElement>(`[aria-selected="true"] > ${NODE}`) ?? nodes[0];
      for (const n of nodes) n.tabIndex = n === active ? 0 : -1;
    };
    syncFocus();

    const onClick = (e: MouseEvent): void => {
      const node = (e.target as Element | null)?.closest<HTMLElement>(NODE);
      const item = node?.parentElement;
      if (!node || !item || !tree.contains(node)) return;
      if (item.hasAttribute('aria-expanded')) toggle(item);
      else select(item);
      syncFocus();
    };

    const onKey = (e: KeyboardEvent): void => {
      const node = (e.target as Element | null)?.closest<HTMLElement>(NODE);
      const item = node?.parentElement;
      if (!node || !item) return;
      const nodes = visibleNodes(tree);
      const i = nodes.indexOf(node);
      const focus = (n: HTMLElement | undefined): void => {
        if (!n) return;
        for (const x of nodes) x.tabIndex = -1;
        n.tabIndex = 0;
        n.focus();
      };
      const isFolder = item.hasAttribute('aria-expanded');
      const open = item.getAttribute('aria-expanded') === 'true';
      switch (e.key) {
        case 'ArrowDown':
          focus(nodes[i + 1]);
          break;
        case 'ArrowUp':
          focus(nodes[i - 1]);
          break;
        case 'ArrowRight':
          if (isFolder && !open) toggle(item, true);
          else if (isFolder) focus(nodes[i + 1]);
          break;
        case 'ArrowLeft':
          if (isFolder && open) toggle(item, false);
          else
            focus(
              item.parentElement
                ?.closest('[role="treeitem"]')
                ?.querySelector<HTMLElement>(`:scope > ${NODE}`) ?? undefined,
            );
          break;
        case 'Enter':
        case ' ':
          if (isFolder) toggle(item);
          else select(item);
          break;
        default:
          return;
      }
      e.preventDefault();
    };

    tree.addEventListener('click', onClick);
    tree.addEventListener('keydown', onKey);
    return () => {
      offGlide();
      tree.removeEventListener('click', onClick);
      tree.removeEventListener('keydown', onKey);
    };
  });
}
