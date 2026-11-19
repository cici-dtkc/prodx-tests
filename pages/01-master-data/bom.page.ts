 

import { Page, Locator } from '@playwright/test';

export class BOMPage {
  readonly page: Page;
  readonly heading: Locator;
  readonly createButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heading = page.getByRole('heading', { name: /bom/i });
    this.createButton = page.getByRole('button', { name: /new/i });
  }

  async goto() {
    await this.page.goto('/master-data/bom');
  }
}
