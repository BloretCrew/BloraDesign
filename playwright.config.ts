import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: 'tests',
  testMatch: '**/*.spec.ts',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  reporter: process.env.CI ? [['github'], ['list']] : 'list',
  use: {
    baseURL: 'http://localhost:4317',
    ...devices['Desktop Chrome'],
    // 本地直接用已安装的 Google Chrome；CI 用 Playwright 下载的 Chromium
    ...(process.env.CI ? {} : { channel: 'chrome' }),
  },
  webServer: {
    command: 'node scripts/serve.mjs',
    url: 'http://localhost:4317/package.json',
    reuseExistingServer: !process.env.CI,
  },
});
