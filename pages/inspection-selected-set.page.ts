import { Page, Locator, expect } from '@playwright/test';

export class InspectionSelectedSetPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  //   Heading 
  get heading(): Locator {
    return this.page.getByRole('heading', { name: /^Inspection Selected Set/ });
  }

  //   Toolbar  
  get createButton(): Locator {
    return this.page.getByRole('button', { name: 'Create', exact: true });
  }
  get exportButton(): Locator {
    return this.page.getByRole('button', { name: 'Export', exact: true });
  }
  get importButton(): Locator {
    return this.page.getByRole('button', { name: 'Import', exact: true });
  }
  get resetButton(): Locator {
    return this.page.getByRole('button', { name: /^Reset(?: \(\d+\))?$/ });
  }
  get goButton(): Locator {
    return this.page.getByRole('button', { name: 'Go', exact: true });
  }
  get hideFiltersButton(): Locator {
    return this.page.getByRole('button', { name: 'Hide filters', exact: true });
  }
  get showFiltersButton(): Locator {
    return this.page.getByRole('button', { name: 'Show filters', exact: true });
  }

  //   Table 
  get dataRows(): Locator {
    return this.page.locator('tbody tr');
  }

  //   Navigation  
  async goto() {
    await this.page.goto('/development/qm/selected-set', { waitUntil: 'domcontentloaded' });
    await expect(this.heading).toBeVisible();
    await this.page.waitForLoadState('networkidle', { timeout: 5_000 }).catch(() => null);
  }
}
