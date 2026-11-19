
import { Page, Locator } from '@playwright/test';

export class RoutingPage {
  readonly page: Page;
  readonly heading: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heading = page.getByRole('heading', { name: /routing/i });
  }

  async goto() {
    await this.page.goto('/master-data/routing');
  }
}
