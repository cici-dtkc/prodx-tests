
import { Page, Locator } from '@playwright/test';

export class HandoverPage {
  readonly page: Page;
  readonly heading: Locator;
  readonly handoverButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heading = page.getByRole('heading', { name: /handover/i });
    this.handoverButton = page.getByRole('button', { name: /handover/i });
  }

  async goto() {
    await this.page.goto('/shop-floor/handover');
  }

  async handover(woNumber: string) {
  }
}
