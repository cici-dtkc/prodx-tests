import { Page, Locator } from '@playwright/test';

export class InstallationPage {
  readonly page: Page;
  readonly heading: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heading = page.getByRole('heading', { name: /installation/i });
  }

  async goto() {
    await this.page.goto('/site/installation');
  }

  async recordInstallation(productQR: string, siteLocation: string) {
  }
}
