import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';

dotenv.config();

export default defineConfig({
  testDir: './tests',
  fullyParallel: false,
  workers: 1,
  outputDir: process.env.PLAYWRIGHT_OUTPUT_DIR ?? `test-results-${process.pid}`,
  reporter: [['html', { outputFolder: process.env.PLAYWRIGHT_REPORT_DIR ?? `playwright-report-${process.pid}` }]],
  use: {
    baseURL: process.env.BASE_URL,
    launchOptions: { slowMo: 100 },
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'retain-on-failure',
  },
  projects: [
    { name: 'setup', testMatch: /auth\.setup\.ts/ },
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'], storageState: 'playwright/.auth/user.json' },
      dependencies: ['setup'],
    },
  ],
});