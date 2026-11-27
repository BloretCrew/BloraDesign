/**
 * 步骤条 bd-steps：点击步骤把 aria-current="step" 移过去（data-bd-controlled 时只发 bd-change）；
 * 每个步骤的状态（未开始 / 当前 / 已完成）变化时，圆点从 0.55 倍弹回原尺寸。
 */
import { define } from './core';
import { reducedMotion } from './motion';

type State = 'todo' | 'current' | 'done';

function states(host: HTMLElement): Map<Element, State> {
  const steps = [...host.children];
  const cur = steps.findIndex((s) => s.getAttribute('aria-current') === 'step');
  return new Map(
    steps.map((s, i) => [s, i === cur ? 'current' : cur >= 0 && i < cur ? 'done' : 'todo']),
  );
}

export function registerSteps(): void {
  define('.bd-steps', (host) => {
    let before = states(host);

    const mo = new MutationObserver(() => {
      const after = states(host);
      if (!reducedMotion()) {
        for (const [step, state] of after) {
          if (before.get(step) === state || !before.has(step)) continue;
          step.animate(
            [
              { transform: 'scale(0.55)', opacity: 0.4 },
              { transform: 'none', opacity: 1 },
            ],
            {
              duration: 280,
              easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
              pseudoElement: '::before',
            },
          );
        }
      }
      before = after;
    });
    mo.observe(host, {
      subtree: true,
      childList: true,
      attributes: true,
      attributeFilter: ['aria-current'],
    });

    const onClick = (e: MouseEvent): void => {
      const step = [...host.children].find((s) => s.contains(e.target as Node)) as
        HTMLElement | undefined;
      if (!step || step.getAttribute('aria-current') === 'step') return;
      const proceed = host.dispatchEvent(
        new CustomEvent('bd-change', {
          bubbles: true,
          cancelable: true,
          detail: { item: step, index: [...host.children].indexOf(step) },
        }),
      );
      if (!proceed || host.hasAttribute('data-bd-controlled')) return;
      for (const s of host.children) s.removeAttribute('aria-current');
      step.setAttribute('aria-current', 'step');
    };
    host.addEventListener('click', onClick);

    return () => {
      mo.disconnect();
      host.removeEventListener('click', onClick);
    };
  });
}
