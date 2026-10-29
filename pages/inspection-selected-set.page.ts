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

  //   Filters  
  get catalogTypeFilter(): Locator {
    return this.page.getByRole('combobox', { name: 'Catalog Type', exact: true });
  }
  get selectedSetFilter(): Locator {
    return this.page.getByRole('combobox', { name: 'Selected Set', exact: true });
  }
  get statusFilter(): Locator {
    return this.page.getByRole('combobox', { name: 'Status', exact: true });
  }
  get createdByFilter(): Locator {
    return this.page.getByRole('combobox', { name: 'Created By', exact: true });
  }

  //   Table  
  get dataRows(): Locator {
    return this.page.locator('tbody tr');
  }

  rowOf(selectedSet: string): Locator {
    return this.dataRows.filter({ hasText: selectedSet });
  }

  async viewDetails(selectedSet: string) {
    await this.rowOf(selectedSet).getByRole('button', { name: 'Display', exact: true }).click();
    await expect(this.page.getByRole('heading', { name: new RegExp(`Display selected set.*${selectedSet}`) })).toBeVisible();
  }

  // ── Detail page links ─────────────────────────────────────────────────────
  get backLink(): Locator {
    return this.page.getByRole('link', { name: 'Back', exact: true });
  }
  get editLink(): Locator {
    return this.page.getByRole('link', { name: 'Edit', exact: true });
  }
  async selectOption(field: Locator, value: string) {
    await field.click();
    const escaped = value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    await this.page.getByRole('option', { name: new RegExp(`^${escaped}(?:\\s|$)`, 'i') }).click();
  }

  //   Navigation  
  async goto() {
    await this.page.goto('/development/qm/selected-set', { waitUntil: 'domcontentloaded' });
    await expect(this.heading).toBeVisible();
    await this.page.waitForLoadState('networkidle', { timeout: 5_000 }).catch(() => null);
  }
}
