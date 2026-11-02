import { Page, Locator, expect } from '@playwright/test';
import { ensureEnglish } from '../tests/helpers/language.helper';

export interface InspectionCharacteristicData {
  characteristic: string;
  validFromDate?: string;
  status?: string;
  shortText: string;
  searchField: string;
  longText?: string;
  longTextEn?: string;
  longTextZh?: string;
  inforField?: string;
  filterGroup?: string;
  project?: string;
  charType?: 'QN' | 'QL';
  catalogType?: string;
  codeGroupSelSet?: string;
  inspectionMethod?: string;
}

export class InspectionCharacteristicPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  //  Heading 
  get heading(): Locator {
    return this.page.getByRole('heading', { name: /^Inspection Characteristic/i });
  }

  //  Toolbar 
  get createButton(): Locator {
    return this.page.getByRole('button', { name: 'Create', exact: true });
  }
  get copyButton(): Locator {
    // The toolbar Copy button sits above the table in the table action bar (not inside tbody).
    // Exclude per-row action buttons by not searching inside table rows.
    return this.page.locator('main').getByRole('button', { name: 'Copy', exact: true })
      .filter({ hasText: 'Copy' })
      .first();
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
    return this.page.getByPlaceholder(/Characteristic, short text/i);
  }
  get charTypeFilter(): Locator {
    return this.page.getByRole('combobox', { name: 'Char. Type', exact: true });
  }
  get statusFilter(): Locator {
    return this.page.getByRole('combobox', { name: 'Status', exact: true });
  }
  get createdByFilter(): Locator {
    return this.page.getByRole('combobox', { name: 'Created By', exact: true });
  }
  get shortTextFilter(): Locator {
    return this.page.getByLabel('Short Text', { exact: true });
  }
  get searchFieldFilter(): Locator {
    return this.page.getByLabel('Search Field', { exact: true });
  }
  get inforFieldFilter(): Locator {
    return this.page.getByLabel('Infor Field', { exact: true });
  }
  get projectFilter(): Locator {
    return this.page.getByRole('combobox', { name: 'Project', exact: true });
  }
  get filterGroupFilter(): Locator {
    return this.page.getByRole('combobox', { name: 'Filter Group', exact: true });
  }

  //  Form fields (Create / Edit)  
  get masterCharacteristicField(): Locator {
    return this.page.getByLabel('Master Insp. Characteristic *', { exact: true });
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
  get longTextField(): Locator {
    return this.page.getByLabel('Long Text', { exact: true });
  }
  get longTextEnField(): Locator {
    return this.page.getByLabel('Long Text (EN)', { exact: true });
  }
  get longTextZhField(): Locator {
    return this.page.getByLabel('Long Text (ZH)', { exact: true });
  }
  get inforFieldInput(): Locator {
    return this.page.getByLabel('Infor Field', { exact: true });
  }
  get filterGroupField(): Locator {
    return this.page.getByRole('combobox', { name: /Filter Group/ });
  }
  get projectField(): Locator {
    return this.page.getByRole('combobox', { name: /Project/ });
  }

  //  Control Data 
  get charTypeField(): Locator {
    return this.page.getByRole('radio', { name: /QN/i });
  }
  get catalogTypeField(): Locator {
    return this.page.getByRole('combobox', { name: /Catalog Type/ });
  }
  get codeGroupSelSetField(): Locator {
    return this.page.getByRole('combobox', { name: /Code group.*sel.*Set/i });
  }
  get inspectionMethodField(): Locator {
    return this.page.getByRole('combobox', { name: /Inspection Method/i });
  }

  //  Checkboxes 
  get requiredCharacteristicsCheckbox(): Locator {
    return this.page.getByLabel(/Required Characteristics/i);
  }
  get samplingProcedureCheckbox(): Locator {
    return this.page.getByLabel(/Sampling Procedure/i);
  }
  get noteRequiredCheckbox(): Locator {
    return this.page.getByLabel(/Note Required/i);
  }
  get attachmentRequiredCheckbox(): Locator {
    return this.page.getByLabel(/Attachment Required/i);
  }

  //  Table  
  get dataRows(): Locator {
    return this.page.locator('tbody tr');
  }

  rowOf(characteristic: string): Locator {
    return this.dataRows.filter({ hasText: characteristic });
  }

  //  Helpers 
  async selectOption(field: Locator, value: string) {
    await field.click();
    const escaped = value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    await this.page.getByRole('option', { name: new RegExp(`^${escaped}(?:\\s|$)`, 'i') }).click();
  }

  //  Navigation  
  async goto() {
    await this.page.goto('/development/qm/inspection-characteristic', { waitUntil: 'domcontentloaded' });
    await this.page.waitForLoadState('networkidle', { timeout: 8_000 }).catch(() => null);
    await ensureEnglish(this.page);
    await expect(this.heading).toBeVisible();
  }

  async searchByCharacteristic(characteristic: string) {
    // Navigate to list page and use the search text box to filter by characteristic code
    await this.page.goto('/development/qm/inspection-characteristic', { waitUntil: 'domcontentloaded' });
    await this.page.waitForLoadState('networkidle', { timeout: 8_000 }).catch(() => null);
    await ensureEnglish(this.page);
    await expect(this.heading).toBeVisible();

    // Type into the search input and hit Go
    await this.searchInput.fill(characteristic);
    await this.goButton.click();
    await this.page.waitForLoadState('networkidle', { timeout: 5_000 }).catch(() => null);
  }

  //  CRUD 
  async create(data: InspectionCharacteristicData) {
    await this.createButton.click();
    await expect(this.page.getByRole('heading', { name: /Step 1 of 2/i })).toBeVisible();

    await this.masterCharacteristicField.fill(data.characteristic);

    await this.nextStepButton.click();
    await expect(this.page.getByRole('heading', { name: /Step 2 of 2/i })).toBeVisible();

    if (data.validFromDate) {
      await this.validFromDateField.fill(data.validFromDate);
    }
    await this.shortTextField.fill(data.shortText);
    await this.searchFieldInput.fill(data.searchField);
    if (data.status) await this.selectOption(this.statusField, data.status);
    if (data.charType) await this.charTypeField.check();
    if (data.longText) await this.longTextField.fill(data.longText);
    if (data.longTextEn) await this.longTextEnField.fill(data.longTextEn);
    if (data.longTextZh) await this.longTextZhField.fill(data.longTextZh);
    if (data.inforField) await this.inforFieldInput.fill(data.inforField);
    if (data.codeGroupSelSet) await this.selectOption(this.codeGroupSelSetField, data.codeGroupSelSet);

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

  async viewDetails(characteristic: string) {
    await this.rowOf(characteristic).getByRole('button', { name: /display/i }).click();
    await expect(
      this.page.getByRole('heading', { name: new RegExp(`Display.*characteristic.*${characteristic}`, 'i') }),
    ).toBeVisible();
  }

  async openEdit(characteristic: string) {
    await this.rowOf(characteristic).getByRole('link', { name: /edit/i })
      .or(this.rowOf(characteristic).getByRole('button', { name: /edit/i }))
      .click();
    await expect(
      this.page.getByRole('heading', { name: new RegExp(`Change.*characteristic.*${characteristic}`, 'i') }),
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
