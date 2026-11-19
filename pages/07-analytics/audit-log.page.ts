import { Page, Locator } from '@playwright/test';

export class AuditLogPage {
  readonly page: Page;
  readonly heading: Locator;
  readonly dataRows: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heading = page.getByRole('heading', { name: /audit log/i });
    this.dataRows = page.locator('table tbody tr');
  }

  async goto() {
    await this.page.goto('/analytics/audit-log');
  }

  async searchLog(poNumber: string) {
  }

  async verifyGanttChart(poNumber: string) {
  }
}
