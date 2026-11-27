import { defineProject } from 'vitest/config';

export default defineProject({
  test: { name: 'stylelint-config', include: ['test/**/*.test.ts'] },
});
