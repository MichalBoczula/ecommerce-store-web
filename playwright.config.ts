import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
    testDir: './tests/acceptance',
    timeout: 60_000,
    expect: { timeout: 15_000 },
    fullyParallel: false,
    workers: 1,
    retries: process.env.CI ? 1 : 0,
    reporter: [
        ['list'],
        ['junit', { outputFile: 'TestResults/acceptance.xml' }],
        ['html', { outputFolder: 'TestResults/playwright-html', open: 'never' }],
    ],
    outputDir: 'TestResults/playwright-results',
    use: {
        baseURL: process.env.ACCEPTANCE_BASE_URL ?? 'http://127.0.0.1:4200',
        trace: 'retain-on-failure',
        screenshot: 'only-on-failure',
    },
    projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
});
