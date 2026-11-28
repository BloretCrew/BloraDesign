import { defineProject } from 'vitest/config';

export default defineProject({
  // 每个用例要启动浏览器，放宽超时
  test: {
    name: 'check',
    include: ['test/**/*.test.ts'],
    testTimeout: 120_000,
    hookTimeout: 120_000,
  },
});
