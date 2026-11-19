import { Page, Locator } from '@playwright/test';

export class WorkOrderPage {
  readonly page: Page;
  readonly heading: Locator;
  readonly createButton: Locator;
  readonly dataRows: Locator;
  readonly saveButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heading = page.getByRole('heading', { name: /work order/i });
    this.createButton = page.getByRole('button', { name: /new/i });
    this.dataRows = page.locator('table tbody tr');
    this.saveButton = page.getByRole('button', { name: /save/i });
  }

  async goto() {
    await this.page.goto('/production/work-orders');
  }

  async create(poNumber: string) {
    await this.createButton.click();
    await this.saveButton.click();
  }

  async verify4KeyChecklist() {
  }

  async split(woNumber: string) {
  }
}
