/**
 * Blora Design 3.0 运行时入口。
 *
 * 引入后自动接管页面上的 bd- 组件（选中滑块、侧栏收起、滚动滑块、段落末尾不留孤字…），
 * 不需要初始化或销毁。
 */
import { start } from './runtime/core';
import { registerDate } from './runtime/date';
import { registerForm } from './runtime/form';
import { registerNav } from './runtime/nav';
import { registerPager } from './runtime/pager';
import { registerRail } from './runtime/rail';
import { registerScroll, startPageScroll } from './runtime/scroll';
import { registerSegmented } from './runtime/segmented';
import { registerSelect } from './runtime/select';
import { registerSteps } from './runtime/steps';
import { registerTabs } from './runtime/tabs';
import { registerTail } from './runtime/tail';
import { registerTree } from './runtime/tree';

/** 当前 Blora Design 版本 */
export const version: string = __BD_VERSION__;

export { enhance } from './runtime/core';
export { animateHeight, flip, reducedMotion } from './runtime/motion';

if (typeof document !== 'undefined') {
  registerRail();
  registerScroll();
  registerSegmented();
  registerTabs();
  registerPager();
  registerNav();
  registerTree();
  registerSteps();
  registerForm();
  registerSelect();
  registerDate();
  registerTail();
  start();
  startPageScroll();
}
