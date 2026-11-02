import { Page, Locator, expect } from '@playwright/test';
import { ensureEnglish } from '../tests/helpers/language.helper';

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
    await this.page.waitForLoadState('networkidle', { timeout: 8_000 }).catch(() => null);
    await ensureEnglish(this.page);
    await expect(this.heading).toBeVisible();
  }

  async searchBySelectedSet(selectedSet: string) {
    await this.page.goto(
      `/development/qm/selected-set?selectedSet=${encodeURIComponent(selectedSet)}`,
      { waitUntil: 'domcontentloaded' },
    );
    await ensureEnglish(this.page);
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
    const codeGroupCombo = this.page.getByRole('combobox', { name: /Add code group/i });
    await codeGroupCombo.click();
    const codeGroupOptions = this.page.locator('[role="option"]:visible');
    await expect(codeGroupOptions.first()).toBeVisible({ timeout: 5_000 });
    if (codeGroup) {
      const selectedOption = codeGroupOptions.filter({ hasText: codeGroup }).first();
      await selectedOption.click();
    } else {
      await codeGroupOptions.first().click();
    }
    await expect(this.page.getByText('No codes yet.')).toBeHidden({ timeout: 5_000 });

    // Chọn Valuation Code cho từng code nếu trường này bắt buộc
    const valuationCombos = this.page.locator('tbody tr')
      .getByRole('combobox', { name: /^Valuation Code/i });
    const valuationCount = await valuationCombos.count();
    for (let i = 0; i < valuationCount; i++) {
      const valuationCombo = valuationCombos.nth(i);
      if (await valuationCombo.isVisible({ timeout: 3_000 }).catch(() => false)) {
        await valuationCombo.click();
        await this.page.locator('[role="option"]:visible').first().click();
      }
    }

    await this.saveAndConfirm();
  }

  async saveAndConfirm() {
    await this.saveButton.click();
    const dialog = this.page.getByRole('alertdialog').or(this.page.getByRole('dialog'));
    if (await dialog.isVisible({ timeout: 3_000 }).catch(() => false)) {
      await dialog.getByRole('button', { name: 'Save', exact: true }).click();
    }
    await this.page.waitForLoadState('networkidle', { timeout: 8_000 }).catch(() => null);
    await ensureEnglish(this.page);
    await expect(
      this.page.getByRole('heading', { name: /Display selected set|Inspection Selected Set/i })
    ).toBeVisible({ timeout: 10_000 });
  }

  //   Export / Import  
  async exportFile() {
    const downloadPromise = this.page.waitForEvent('download');
    await this.exportButton.click();
    return downloadPromise;
  }

  async selectImportFile(filePath: string) {
    const dialog = this.page.getByRole('dialog');
    if (!(await dialog.isVisible())) {
      await this.importButton.click();
      await expect(dialog).toBeVisible({ timeout: 5_000 });
    }
    await dialog.locator('input[type="file"]').setInputFiles(filePath);
  }

  async confirmImport() {
    const dialog = this.page.getByRole('dialog');
    const importBtn = dialog.getByRole('button', { name: 'Import', exact: true });
    if (await importBtn.isDisabled()) return;
    await importBtn.click();
    await expect(dialog).toBeHidden({ timeout: 5_000 }).catch(async () => {
      await this.closeImportDialog().catch(() => null);
    });
  }

  async closeImportDialog() {
    const dialog = this.page.getByRole('dialog');
    if (await dialog.isVisible()) {
      await dialog.getByRole('button', { name: 'Cancel', exact: true }).click();
      await expect(dialog).toBeHidden({ timeout: 5_000 });
    }
  }

  async downloadImportTemplate() {
    await this.importButton.click();
    const dialog = this.page.getByRole('dialog');
    await expect(dialog).toBeVisible({ timeout: 5_000 });
    const [download] = await Promise.all([
      this.page.waitForEvent('download'),
      dialog.getByRole('button', { name: /Download template/i }).click(),
    ]);
    await dialog.getByRole('button', { name: 'Cancel', exact: true }).click();
    await expect(dialog).toBeHidden({ timeout: 5_000 });
    return download;
  }
}
