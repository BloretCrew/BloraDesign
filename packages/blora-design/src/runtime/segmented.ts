/** 分段控件 bd-segmented */
import { choice } from './choice';
import { define } from './core';

export function registerSegmented(): void {
  define('.bd-segmented', (el) =>
    choice(el, {
      items: ':scope > :is(button, [role="radio"], [role="tab"])',
      orientation: 'horizontal',
    }),
  );
}
