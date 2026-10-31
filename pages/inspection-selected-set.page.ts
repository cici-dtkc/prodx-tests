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

  //   Form fields (Create / Edit)  
  get selectedSetField(): Locator {
    return this.page.getByLabel(/Selected Set \*/, { exact: false });
  }
  get shortTextField(): Locator {
    return this.page.getByLabel(/Short Text \*/, { exact: false });
  }
  get statusField(): Locator {
    return this.page.getByRole('combobox', { name: /Status \*/ });
  }

  //   Buttons (Create / Edit pages)  
  get saveButton(): Locator {
    return this.page.getByRole('button', { name: 'Save', exact: true });
  }
  get backButton(): Locator {
    return this.page.getByRole('button', { name: 'Back', exact: true });
  }
  get nextStepButton(): Locator {
    return this.page.getByRole('button', { name: /Next step/i });
  }

  //   Links (Display page)  
  get backLink(): Locator {
    return this.page.getByRole('link', { name: 'Back', exact: true });
  }

  //   Table  
  get dataRows(): Locator {
    return this.page.locator('tbody tr');
  }

  rowOf(selectedSet: string): Locator {
    return this.dataRows.filter({ hasText: selectedSet });
  }

  //   Helpers  
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

  async searchBySelectedSet(selectedSet: string) {
    await this.page.goto(
      `/development/qm/selected-set?selectedSet=${encodeURIComponent(selectedSet)}`,
      { waitUntil: 'domcontentloaded' },
    );
    await expect(this.heading).toBeVisible();
  }

  //   CRUD  
  async viewDetails(selectedSet: string) {
    await this.rowOf(selectedSet).getByRole('button', { name: 'Display', exact: true }).click();
    await expect(this.page.getByRole('heading', { name: new RegExp(`Display selected set.*${selectedSet}`) })).toBeVisible();
  }

  async openEdit(selectedSet: string) {
    await this.rowOf(selectedSet).getByRole('button', { name: 'Change', exact: true }).click();
    await expect(this.page.getByRole('heading', { name: new RegExp(`Change selected set.*${selectedSet}`) })).toBeVisible();
  }

  async create(selectedSet: string, shortText: string, codeGroup?: string) {
    const resetBtn = this.page.getByRole('button', { name: /^Reset/i });
    if (await resetBtn.isEnabled({ timeout: 1_000 }).catch(() => false)) {
      await resetBtn.click();
      await this.page.waitForLoadState('networkidle').catch(() => null);
    }

    await this.createButton.click();
    await expect(this.page.getByRole('heading', { name: /Step 1 of 2/i })).toBeVisible();

    // Chọn Catalog Type nếu chưa có value
    const currentVal = await this.page.getByRole('combobox', { name: /Catalog Type \*/ }).innerText().catch(() => '');
    if (!currentVal.trim()) {
      await this.page.getByRole('combobox', { name: /Catalog Type \*/ }).click();
      await this.page.getByRole('option').first().click();
    }
    await expect(this.page.getByText('Catalog Type is required')).toBeHidden({ timeout: 3_000 }).catch(() => null);

    await this.selectedSetField.fill(selectedSet);
    await this.shortTextField.fill(shortText);

    await this.nextStepButton.click();
    await expect(this.page.getByRole('heading', { name: /Step 2 of 2/i })).toBeVisible();

    // Bắt buộc phải thêm ít nhất một code group
    const codeGroupCombo = this.page.getByRole('combobox', { name: /Pick a code group/i })
      .or(this.page.locator('[placeholder*="code group" i]'));
    await codeGroupCombo.click();
    if (codeGroup) {
      await this.page.getByRole('option', { name: new RegExp(codeGroup, 'i') }).first().click();
    } else {
      await this.page.getByRole('option').first().click();
    }

    await this.saveAndConfirm();
  }

  async saveAndConfirm() {
    await this.saveButton.click();
    const dialog = this.page.getByRole('alertdialog').or(this.page.getByRole('dialog'));
    if (await dialog.isVisible({ timeout: 3_000 }).catch(() => false)) {
      await dialog.getByRole('button', { name: 'Save', exact: true }).click();
    }
    await expect(
      this.page.getByRole('heading', { name: /Display selected set|Inspection Selected Set/i })
    ).toBeVisible({ timeout: 10_000 });
  }
}
