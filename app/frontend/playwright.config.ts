import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  timeout: 120000,
  expect: { timeout: 15000 },
  workers: 1,
  use: {
    baseURL: 'http://localhost:3002',
    browserName: 'chromium',
    headless: true,
    viewport: { width: 1280, height: 800 },
  },
  reporter: [['list']],
});
