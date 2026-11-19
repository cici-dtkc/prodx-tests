 

import { Page, Locator } from '@playwright/test';

export class MaterialPage {
  readonly page: Page;
  readonly heading: Locator;
  readonly createButton: Locator;
  readonly syncButton: Locator;
  readonly dataRows: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heading = page.getByRole('heading', { name: /materials/i });
    this.createButton = page.getByRole('button', { name: /new material/i });
    this.syncButton = page.getByText(/sync all from sap/i);
    this.dataRows = page.locator('table tbody tr');
  }

  async goto() {
    await this.page.goto('/master-data/materials');
  }

  async syncFromSAP() {
    await this.syncButton.click();
  }
}
