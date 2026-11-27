/** 分页 bd-pager：当前页 aria-current="page"，选中底连续滑动；上一页 / 下一页不参与选择 */
import { choice } from './choice';
import { define } from './core';

export function registerPager(): void {
  define('.bd-pager', (host) =>
    choice(host, { items: ':scope > :is(a, button):not([data-part])', current: 'page' }),
  );
}
