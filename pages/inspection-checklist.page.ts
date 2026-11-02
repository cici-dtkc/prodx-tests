import { Page, Locator, expect } from '@playwright/test';
import { ensureEnglish } from '../tests/helpers/language.helper';

export class InspectionChecklistPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  //   Heading  
  get heading(): Locator {
    return this.page.getByRole('heading', { name: /^Inspection Checklist/i });
  }

  //   Toolbar  
  get createButton(): Locator {
    return this.page.getByRole('button', { name: 'Create', exact: true });
  }
  get exportButton(): Locator {
    return this.page.getByRole('button', { name: 'Export', exact: true });
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
  get saveButton(): Locator {
    return this.page.getByRole('button', { name: 'Save', exact: true });
  }
  get backButton(): Locator {
    return this.page.getByRole('button', { name: 'Back', exact: true });
  }
  get nextStepButton(): Locator {
    return this.page.getByRole('button', { name: /Next step/i });
  }
  get descriptionField(): Locator {
    return this.page.getByLabel('Description *', { exact: true });
  }
  get usageField(): Locator {
    return this.page.getByLabel('Usage *', { exact: true });
  }
  get lotSizeToField(): Locator {
    return this.page.getByLabel('Lot Size To *', { exact: true });
  }
  get unitField(): Locator {
    return this.page.getByLabel('Unit *', { exact: true });
  }
  get samplingProcedureField(): Locator {
    return this.page.getByLabel('Sampling Procedure *', { exact: true });
  }

  //   Filters  
  get materialFilter(): Locator {
    return this.page.getByRole('combobox', { name: 'Material', exact: true });
  }
  get materialGroupFilter(): Locator {
    return this.page.getByRole('combobox', { name: 'Material Group', exact: true });
  }
  get usageFilter(): Locator {
    return this.page.getByRole('combobox', { name: 'Usage', exact: true });
  }
  get statusFilter(): Locator {
    return this.page.getByRole('combobox', { name: 'Status', exact: true });
  }
  get projectFilter(): Locator {
    return this.page.getByRole('combobox', { name: 'Project', exact: true });
  }

  //   Table  
  get dataRows(): Locator {
    return this.page.locator('tbody tr');
  }

  rowOf(group: string): Locator {
    return this.dataRows.filter({ hasText: group });
  }

  //   Helpers  
  async selectOption(field: Locator, value: string) {
    await field.click();
    const escaped = value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    await this.page.getByRole('option', { name: new RegExp(`^${escaped}(?:\\s|$)`, 'i') }).click();
  }

  async selectFirstOption(field: Locator) {
    await field.click();
    await this.page.locator('[role="option"]:visible').first().click();
  }

  //   Navigation  
  async goto() {
    await this.page.goto('/development/qm/inspection-checklist', { waitUntil: 'domcontentloaded' });
    await this.page.waitForLoadState('networkidle', { timeout: 8_000 }).catch(() => null);
    await ensureEnglish(this.page);
    await expect(this.heading).toBeVisible();
  }

  async create(description: string) {
    await this.createButton.click();
    await expect(this.page.getByRole('heading', { name: /Step 1 of 2/i })).toBeVisible();
    await this.nextStepButton.click();
    await expect(this.page.getByRole('heading', { name: /Step 2 of 2/i })).toBeVisible();

    await this.descriptionField.fill(description);
    await this.selectFirstOption(this.usageField);
    await this.lotSizeToField.fill('1');
    await this.selectFirstOption(this.unitField);
    await this.selectFirstOption(this.samplingProcedureField);
    const operationRow = this.page.locator('table tbody tr').first();
    const operationInputs = operationRow.locator('input:not([type]), input[type="text"]');
    if (await operationInputs.count() > 0) {
      await operationInputs.last().fill('Auto test operation');
    }

    await this.saveButton.click();
    const dialog = this.page.getByRole('alertdialog').or(this.page.getByRole('dialog'));
    if (await dialog.isVisible({ timeout: 3_000 }).catch(() => false)) {
      await dialog.getByRole('button', { name: /Save|Confirm|Yes/i }).first().click();
    }
    await this.page.waitForLoadState('networkidle', { timeout: 8_000 }).catch(() => null);
    await ensureEnglish(this.page);
    await expect(this.heading).toBeVisible({ timeout: 10_000 });
  }

  async exportFile() {
    const downloadPromise = this.page.waitForEvent('download');
    await this.exportButton.click();
    return downloadPromise;
  }
}
