/** 动效工具：减少动效、首屏不播放过渡、高度过渡、FLIP（DESIGN.md · Motion） */

const reduceQuery =
  typeof matchMedia === 'function' ? matchMedia('(prefers-reduced-motion: reduce)') : null;

/** 用户是否开启了「减少动态效果」 */
export function reducedMotion(): boolean {
  return reduceQuery?.matches ?? false;
}

/** 等下一帧开始前 */
export function nextFrame(): Promise<void> {
  return new Promise((resolve) => requestAnimationFrame(() => resolve()));
}

/** 在不播放过渡的情况下执行一次修改（恢复保存的状态、首屏定位），两帧后恢复过渡 */
export function instant(el: Element, mutate: () => void): void {
  el.setAttribute('data-bd-instant', '');
  mutate();
  void (el as HTMLElement).offsetWidth;
  requestAnimationFrame(() => requestAnimationFrame(() => el.removeAttribute('data-bd-instant')));
}

const ease = 'cubic-bezier(0.22, 1, 0.36, 1)';
const duration = 340;

/**
 * 高度过渡：先量旧高度，执行修改，再量新高度，从旧高度连续过渡到新高度（不允许高度跳变）。
 * 过渡期间元素 overflow: hidden；结束后恢复。
 */
export function animateHeight(el: HTMLElement, mutate: () => void): Animation | null {
  const from = el.getBoundingClientRect().height;
  mutate();
  const to = el.getBoundingClientRect().height;
  if (reducedMotion() || Math.abs(from - to) < 0.5) return null;
  const overflow = el.style.overflow;
  el.style.overflow = 'hidden';
  const anim = el.animate([{ height: `${from}px` }, { height: `${to}px` }], {
    duration,
    easing: ease,
  });
  const done = (): void => {
    el.style.overflow = overflow;
  };
  anim.addEventListener('finish', done);
  anim.addEventListener('cancel', done);
  return anim;
}

/**
 * FLIP：先量所有元素的起点，执行修改，再一次性量完所有终点，最后才开始动画
 * （开始动画之后再量会量到被挤压的布局，DESIGN.md · Motion · FLIP 第 1 条）。
 */
export function flip(elements: Iterable<HTMLElement>, mutate: () => void): Animation[] {
  const list = [...elements];
  const first = new Map(list.map((el) => [el, el.getBoundingClientRect()]));
  mutate();
  const last = new Map(list.map((el) => [el, el.getBoundingClientRect()]));
  if (reducedMotion()) return [];
  const anims: Animation[] = [];
  for (const el of list) {
    const a = first.get(el);
    const b = last.get(el);
    if (!a || !b || !el.isConnected) continue;
    const dx = a.left - b.left;
    const dy = a.top - b.top;
    if (Math.abs(dx) < 0.5 && Math.abs(dy) < 0.5) continue;
    anims.push(
      el.animate([{ transform: `translate(${dx}px, ${dy}px)` }, { transform: 'none' }], {
        duration,
        easing: ease,
      }),
    );
  }
  return anims;
}
