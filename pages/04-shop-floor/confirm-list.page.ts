import { Page, Locator } from '@playwright/test';

export class ConfirmListPage {
  readonly page: Page;
  readonly heading: Locator;
  readonly dataRows: Locator;
  readonly confirmButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heading = page.getByRole('heading', { name: /confirm list/i });
    this.dataRows = page.locator('table tbody tr');
    this.confirmButton = page.getByRole('button', { name: /confirm/i });
  }

  async goto() {
    await this.page.goto('/shop-floor/confirm-list');
  }

  async confirmTime(woNumber: string, hours: number) {
  }
}
