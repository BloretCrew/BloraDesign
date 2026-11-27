import { defineProject } from 'vitest/config';

export default defineProject({
  test: { name: 'blora-design', include: ['test/**/*.test.ts'] },
});
