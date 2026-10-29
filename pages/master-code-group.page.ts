import { Page, Locator, expect } from '@playwright/test';

export type CatalogType = '1 - Characteristic Attributes';
export type StatusType = 'Released' | 'In Preparation' | 'Being Created';

export interface MasterCodeGroupData {
  catalogType: CatalogType;
  codeGroup: string;
  shortText: string;
  status: StatusType;
  longText?: string;
}

export interface CodeEntry {
  code: string;
  shortTextForCode: string;
}

export class MasterCodeGroupPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  //   Heading  
  get heading(): Locator {
    return this.page.getByRole('heading', { name: /^Master Code Group/ });
  }

  //  Toolbar  
  get createButton(): Locator {
    return this.page.getByRole('button', { name: 'Create', exact: true });
  }
  get exportButton(): Locator {
    return this.page.getByRole('button', { name: 'Export', exact: true });
  }
  get importButton(): Locator {
    return this.page.getByRole('button', { name: 'Import', exact: true });
  }
  get saveButton(): Locator {
    return this.page.getByRole('button', { name: 'Save', exact: true });
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
  get addCodeButton(): Locator {
    return this.page.getByRole('button', { name: /Add code/i });
  }
  get nextStepButton(): Locator {
    return this.page.getByRole('button', { name: /Next step/i });
  }

  //   Filters  
  get catalogTypeFilter(): Locator {
    return this.page.getByRole('combobox', { name: 'Catalog Type', exact: true });
  }
  get statusFilter(): Locator {
    return this.page.getByRole('combobox', { name: 'Status', exact: true });
  }

  //   Form fields  
  get catalogTypeField(): Locator {
    return this.page.getByRole('combobox', { name: /Catalog Type \*/ });
  }
  get codeGroupField(): Locator {
    return this.page.getByLabel(/Code Group \*/, { exact: false });
  }
  get shortTextField(): Locator {
    return this.page.getByLabel(/Short Text \*/, { exact: false });
  }

  //   Table  
  get dataRows(): Locator {
    return this.page.locator('tbody tr');
  }

  rowOf(codeGroup: string): Locator {
    return this.dataRows.filter({ hasText: codeGroup });
  }

  //   Navigation  
  async goto() {
    const leaveDialog = this.page.getByRole('alertdialog');
    if (await leaveDialog.isVisible({ timeout: 500 }).catch(() => false)) {
      await leaveDialog.getByRole('button', { name: 'Leave', exact: true }).click();
      await expect(leaveDialog).toBeHidden({ timeout: 3_000 });
    }
    await this.page.goto('/development/qm/master-code-group', { waitUntil: 'domcontentloaded' });
    await expect(this.heading).toBeVisible();
    await this.page.waitForLoadState('networkidle', { timeout: 5_000 }).catch(() => null);
  }

  async searchByCodeGroup(codeGroup: string) {
    await this.page.goto(
      `/development/qm/master-code-group?codeGroup=${encodeURIComponent(codeGroup)}`,
      { waitUntil: 'domcontentloaded' },
    );
    await expect(this.heading).toBeVisible();
  }

  //   Helpers  
  async selectOption(field: Locator, value: string) {
    await field.click();
    const escaped = value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    await this.page.getByRole('option', { name: new RegExp(`^${escaped}(?:\\s|$)`, 'i') }).click();
  }

  //   CRUD  
  async create(data: MasterCodeGroupData, codes: CodeEntry[] = []) {
    const resetBtn = this.page.getByRole('button', { name: /^Reset/i });
    if (await resetBtn.isEnabled({ timeout: 2_000 }).catch(() => false)) {
      await resetBtn.click();
      await this.page.waitForLoadState('networkidle').catch(() => null);
    }

    await this.createButton.click();
    await expect(this.page.getByRole('heading', { name: /Step 1 of 2/i })).toBeVisible();

    // Chọn Catalog Type nếu chưa có value
    const currentVal = await this.catalogTypeField.innerText().catch(() => '');
    if (!currentVal.trim()) {
      await this.catalogTypeField.click();
      await this.page.getByRole('option').first().click();
    }
    await expect(this.page.getByText('Catalog Type is required')).toBeHidden({ timeout: 3_000 }).catch(() => null);

    await this.codeGroupField.fill(data.codeGroup);
    await this.shortTextField.fill(data.shortText);

    await this.nextStepButton.click();
    await expect(this.page.getByRole('heading', { name: /Step 2 of 2/i })).toBeVisible();

    for (const entry of codes) {
      await this.addCodeButton.click();
      const lastRow = this.page.locator('table tbody tr').last();
      await lastRow.getByRole('textbox').nth(0).fill(entry.code);
      await lastRow.getByRole('textbox').nth(1).fill(entry.shortTextForCode);
    }

    await this.saveAndConfirm();
  }

  async saveAndConfirm() {
    await this.saveButton.click();
    const leaveDialog = this.page.getByRole('alertdialog');
    if (await leaveDialog.isVisible({ timeout: 3_000 }).catch(() => false)) {
      await leaveDialog.getByRole('button', { name: /save|confirm|yes|leave|continue/i }).first().click();
    }
    await expect(this.heading).toBeVisible({ timeout: 15_000 });
  }

  async viewDetails(codeGroup: string) {
    await this.rowOf(codeGroup).getByRole('button', { name: 'Display', exact: true }).click();
    await expect(this.page.getByRole('heading', { name: new RegExp(`Display Master Code Group.*${codeGroup}`) })).toBeVisible();
  }

  async openEdit(codeGroup: string) {
    await this.rowOf(codeGroup).getByRole('button', { name: 'Change', exact: true }).click();
    await expect(this.page.getByRole('heading', { name: new RegExp(`Change Master Code Group.*${codeGroup}`) })).toBeVisible();
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
