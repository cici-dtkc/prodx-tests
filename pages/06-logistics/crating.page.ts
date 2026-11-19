import { Page, Locator } from '@playwright/test';

export class CratingPage {
  readonly page: Page;
  readonly heading: Locator;
  readonly scanButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heading = page.getByRole('heading', { name: /crating/i });
    this.scanButton = page.getByRole('button', { name: /scan/i });
  }

  async goto() {
    await this.page.goto('/logistics/crating');
  }

  async crateScan(qrCode: string) {
  }
}
