import { Page, Locator, expect } from '@playwright/test';
import { ensureEnglish } from '../tests/helpers/language.helper';

export interface InspectionMethodData {
  inspectionMethod: string;
  validFromDate: string;
  status: string;
  shortText: string;
  searchField: string;
  inforField?: string;
  longText?: string;
}

export class InspectionMethodPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  //  Heading 
  get heading(): Locator {
    return this.page.getByRole('heading', { name: /^Inspection Method/ });
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

  //  Filters 
  get searchInput(): Locator {
    return this.page.getByPlaceholder(/Method, short text/i);
  }
  get inspectionMethodFilter(): Locator {
    return this.page.getByRole('combobox', { name: 'Inspection Method', exact: true });
  }
  get statusFilter(): Locator {
    return this.page.getByRole('combobox', { name: 'Status', exact: true });
  }
  get shortTextFilter(): Locator {
    return this.page.getByLabel('Short Text', { exact: true });
  }

  //  Form fields (Create / Edit)  
  get inspectionMethodField(): Locator {
    return this.page.getByLabel('Inspection Method *', { exact: true });
  }
  get validFromDateField(): Locator {
    return this.page.getByRole('textbox', { name: /Valid.From Date/i });
  }
  get statusField(): Locator {
    return this.page.getByRole('combobox', { name: /Status \*/ });
  }
  get shortTextField(): Locator {
    return this.page.getByLabel('Short Text *', { exact: true });
  }
  get searchFieldInput(): Locator {
    return this.page.getByLabel('Search Field *', { exact: true });
  }
  get inforFieldInput(): Locator {
    return this.page.getByLabel('Infor Field', { exact: true });
  }
  get longTextField(): Locator {
    return this.page.getByLabel('Long Text', { exact: true });
  }

  //  Table  
  get dataRows(): Locator {
    return this.page.locator('tbody tr');
  }

  rowOf(inspectionMethod: string): Locator {
    return this.dataRows.filter({ hasText: inspectionMethod });
  }

  //  Helpers 
  async selectOption(field: Locator, value: string) {
    await field.click();
    const escaped = value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    await this.page.getByRole('option', { name: new RegExp(`^${escaped}(?:\\s|$)`, 'i') }).click();
  }

  //  Navigation  
  async goto() {
    await this.page.goto('/development/qm/inspection-method', { waitUntil: 'domcontentloaded' });
    await this.page.waitForLoadState('networkidle', { timeout: 8_000 }).catch(() => null);
    await ensureEnglish(this.page);
    await expect(this.heading).toBeVisible();
  }

  async searchByMethod(method: string) {
    await this.page.goto(
      `/development/qm/inspection-method?inspectionMethod=${encodeURIComponent(method)}`,
      { waitUntil: 'domcontentloaded' },
    );
    await this.page.waitForLoadState('networkidle', { timeout: 5_000 }).catch(() => null);
    await ensureEnglish(this.page);
    await expect(this.heading).toBeVisible();
  }

  //  CRUD 
  async create(data: InspectionMethodData) {
    await this.createButton.click();
    await expect(this.page.getByRole('heading', { name: /Step 1 of 2/i })).toBeVisible();

    await this.inspectionMethodField.fill(data.inspectionMethod);
    if (data.validFromDate) {
      await this.validFromDateField.fill(data.validFromDate);
    }

    await this.nextStepButton.click();
    await expect(this.page.getByRole('heading', { name: /Step 2 of 2/i })).toBeVisible();

    await this.shortTextField.fill(data.shortText);
    await this.searchFieldInput.fill(data.searchField);
    if (data.inforField) await this.inforFieldInput.fill(data.inforField);
    if (data.longText) await this.longTextField.fill(data.longText);

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
  }

  async viewDetails(method: string) {
    await this.rowOf(method).getByRole('button', { name: /display/i }).click();
    await expect(
      this.page.getByRole('heading', { name: new RegExp(`Display inspection method.*${method}`, 'i') }),
    ).toBeVisible();
  }

  async openEdit(method: string) {
    await this.rowOf(method).getByRole('link', { name: /edit/i })
      .or(this.rowOf(method).getByRole('button', { name: /edit/i }))
      .click();
    await expect(
      this.page.getByRole('heading', { name: new RegExp(`Change inspection method.*${method}`, 'i') }),
    ).toBeVisible();
  }

  //  Export / Import  
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
