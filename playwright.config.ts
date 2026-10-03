import process from 'node:process'
import { defineConfig } from '@playwright/test'

export default defineConfig({
  expect: { timeout: 10_000 },
  forbidOnly: !!process.env.CI,
  fullyParallel: false,
  reporter: [['list'], ['json', { outputFile: 'test-results/results.json' }]],
  retries: 0,
  testDir: './tests',
  timeout: 30_000,
  workers: 1,
  projects: [
    {
      name: 'chromium-light',
      use: { browserName: 'chromium', colorScheme: 'light' },
    },
    {
      name: 'chromium-dark',
      use: { browserName: 'chromium', colorScheme: 'dark' },
    },
  ],
  use: {
    baseURL: 'http://127.0.0.1:4173',
    permissions: ['clipboard-read', 'clipboard-write'],
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
    viewport: { height: 1000, width: 1440 },
    launchOptions: {
      executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH,
    },
  },
  webServer: {
    command: 'node tests/serve.mjs',
    reuseExistingServer: false,
    url: 'http://127.0.0.1:4173',
  },
})
