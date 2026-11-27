/**
 * 自动接管：页面上出现认识的组件就挂上行为，元素离开页面就自动清理。
 * Vue / React 重新渲染、路由切换、局部刷新都不需要业务调用任何初始化或销毁接口。
 */

export type Cleanup = () => void;
export type Setup = (el: HTMLElement) => Cleanup | undefined;

interface Behavior {
  selector: string;
  setup: Setup;
}

const behaviors: Behavior[] = [];
const attached = new WeakMap<Element, Map<Behavior, Cleanup>>();
/** 当前挂着行为的元素（WeakMap 不能遍历，离开页面时需要逐个检查） */
const live = new Set<HTMLElement>();
let observer: MutationObserver | null = null;
let pendingCheck = false;

const noop: Cleanup = () => {};

function attach(el: Element, behavior: Behavior): void {
  if (!(el instanceof HTMLElement)) return;
  let map = attached.get(el);
  if (!map) {
    map = new Map();
    attached.set(el, map);
  }
  if (map.has(behavior)) return;
  map.set(behavior, noop);
  live.add(el);
  try {
    map.set(behavior, behavior.setup(el) ?? noop);
  } catch (err) {
    console.error(`[blora] ${behavior.selector} 接管失败`, err);
  }
}

function detach(el: HTMLElement): void {
  const map = attached.get(el);
  if (map) {
    for (const cleanup of map.values()) cleanup();
    attached.delete(el);
  }
  live.delete(el);
}

function scan(root: ParentNode): void {
  for (const b of behaviors) {
    if (root instanceof Element && root.matches(b.selector)) attach(root, b);
    root.querySelectorAll(b.selector).forEach((el) => attach(el, b));
  }
}

/** 移除和移动在同一轮里发生时（重新排序），元素仍在页面上，不清理 */
function checkDisconnected(): void {
  pendingCheck = false;
  for (const el of live) if (!el.isConnected) detach(el);
}

function onMutations(records: MutationRecord[]): void {
  let removed = false;
  for (const r of records) {
    if (r.type === 'attributes') {
      scan(r.target as Element);
      continue;
    }
    r.addedNodes.forEach((n) => {
      if (n instanceof Element) scan(n);
    });
    if (r.removedNodes.length) removed = true;
  }
  if (removed && !pendingCheck) {
    pendingCheck = true;
    queueMicrotask(checkDisconnected);
  }
}

/** 注册一种行为：selector 匹配的元素出现时调用 setup，元素离开页面时调用它返回的清理函数 */
export function define(selector: string, setup: Setup): void {
  const behavior = { selector, setup };
  behaviors.push(behavior);
  if (observer) scan(document);
}

/** 手动接管某个子树（极少需要：例如在 Shadow DOM 里使用 Blora 时） */
export function enhance(root: ParentNode = document): void {
  scan(root);
}

/** 开始接管整个页面。引入 blora.js 时自动调用 */
export function start(): void {
  if (observer || typeof document === 'undefined') return;
  const run = (): void => {
    if (observer) return;
    scan(document);
    observer = new MutationObserver(onMutations);
    observer.observe(document.documentElement, {
      subtree: true,
      childList: true,
      attributes: true,
      attributeFilter: ['class'],
    });
  };
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run, { once: true });
  } else {
    run();
  }
}
