import { Page, Locator, expect } from '@playwright/test';

export type InspectionType = '03 - Inspection Process' | '89 - Other Inspection';

export interface MaterialInspectionAssignmentData {
  inspectionType: InspectionType;
  material: string;
  materialGroup?: string;
  description?: string;
  frequency: string;
  unit: string;
}

export class MaterialInspectionAssignmentPage {
  private readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  get heading(): Locator {
    return this.page.getByRole('heading', { name: /^Material Inspection Assignment/ });
  }
  get createButton(): Locator {
    return this.page.getByRole('button', { name: 'Create', exact: true });
  }
  get nextStepButton(): Locator {
    return this.page.getByRole('button', { name: /Next step/i });
  }
  get previousStepButton(): Locator {
    return this.page.getByRole('button', { name: /Previous step/i });
  }
  get saveButton(): Locator {
    return this.page.getByRole('button', { name: 'Save', exact: true });
  }
  get inspectionTypeFilter(): Locator {
    return this.page.getByRole('combobox', { name: 'Inspection Type', exact: true });
  }
  get materialFilter(): Locator {
    return this.page.getByRole('combobox', { name: 'Material', exact: true });
  }
  get materialGroupFilter(): Locator {
    return this.page.getByRole('combobox', { name: 'Material Group', exact: true });
  }
  get inspectionTypeField(): Locator {
    return this.page.getByRole('combobox', { name: /^Inspection Type \*/ });
  }
  get materialField(): Locator {
    return this.page.getByRole('combobox', { name: 'Select product', exact: true });
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
  get dataRows(): Locator {
    return this.page.locator('tbody tr');
  }
  get importButton(): Locator {
    return this.page.getByRole('button', { name: 'Import', exact: true });
  }
  get exportButton(): Locator {
    return this.page.getByRole('button', { name: 'Export', exact: true });
  }

  rowOf(data: Pick<MaterialInspectionAssignmentData, 'inspectionType' | 'material'>): Locator {
    return this.dataRows
      .filter({ hasText: data.inspectionType })
      .filter({ hasText: data.material });
  }

  async goto() {
    await this.page.goto('/qm/material-inspection-assignment', { waitUntil: 'domcontentloaded' });
    await expect(this.heading).toBeVisible();
  }

  async selectOption(field: Locator, value: string) {
    await field.click();
    const escapedValue = value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    await this.page.getByRole('option', { name: new RegExp(`^${escapedValue}(?:\\s|$)`, 'i') }).click();
  }

  async create(data: MaterialInspectionAssignmentData) {
    await this.createButton.click();
    await expect(this.page.getByRole('heading', { name: /Step 1 of 2/ })).toBeVisible();
    await this.selectOption(this.inspectionTypeField, data.inspectionType);
    await this.selectOption(this.materialField, data.material);
    await this.nextStepButton.click();
    await expect(this.page.getByRole('heading', { name: /Step 2 of 2/ })).toBeVisible();
    await this.fillFrequency(data);
    await this.save();
  }

  async fillFrequency(data: Pick<MaterialInspectionAssignmentData, 'frequency' | 'unit'>) {
    await this.page.getByLabel('Frequency', { exact: true }).fill(data.frequency);
    await this.selectOption(this.page.getByRole('combobox', { name: 'Unit', exact: true }), data.unit);
  }

  async save() {
    await this.saveButton.click();
    const confirmation = this.page.getByRole('alertdialog').or(this.page.getByRole('dialog'));
    if (await confirmation.count() && await confirmation.first().isVisible()) {
      const saveConfirmation = confirmation.first().getByRole('button', { name: 'Save', exact: true });
      if (await saveConfirmation.count()) {
        await saveConfirmation.click();
      }
    }
    await expect(this.heading).toBeVisible();
  }

  async viewDetails(data: Pick<MaterialInspectionAssignmentData, 'inspectionType' | 'material'>) {
    await this.actionOf(data, 0).click();
  }

  async openEdit(data: Pick<MaterialInspectionAssignmentData, 'inspectionType' | 'material'>) {
    await this.actionOf(data, 1).click();
  }

  async delete(data: Pick<MaterialInspectionAssignmentData, 'inspectionType' | 'material'>) {
    await this.actionOf(data, 2).click();
    const dialog = this.page.getByRole('alertdialog').or(this.page.getByRole('dialog'));
    await dialog.getByRole('button', { name: /delete|confirm|yes/i }).click();
    await expect(this.rowOf(data)).toHaveCount(0);
  }

  async deleteIfExists(data: Pick<MaterialInspectionAssignmentData, 'inspectionType' | 'material'>) {
    await this.goto();
    if (await this.rowOf(data).count() > 0) {
      await this.delete(data);
    }
  }

  async exportFile() {
    const downloadPromise = this.page.waitForEvent('download');
    await this.exportButton.click();
    return downloadPromise;
  }

  async selectImportFile(filePath: string) {
    const input = this.page.locator('input[type="file"]').first();
    if (await input.count()) {
      await input.setInputFiles(filePath);
      return;
    }

    await this.importButton.click();
    const dialogInput = this.page.locator('input[type="file"]').first();
    await expect(dialogInput).toBeAttached();
    await dialogInput.setInputFiles(filePath);
  }

  async confirmImport() {
    const confirm = this.page.getByRole('dialog').or(this.page.getByRole('alertdialog'));
    if (await confirm.count() && await confirm.first().isVisible()) {
      const button = confirm.first().getByRole('button', { name: /import|upload|confirm|yes|xác nhận/i });
      if (await button.isEnabled()) {
        await button.click();
      }
    }
    await this.page.waitForTimeout(500);
  }

  async downloadImportTemplate() {
    await this.importButton.click();
    const downloadPromise = this.page.waitForEvent('download');
    await this.page.getByRole('button', { name: /Download template/i }).click();
    return downloadPromise;
  }

  private actionOf(data: Pick<MaterialInspectionAssignmentData, 'inspectionType' | 'material'>, index: 0 | 1 | 2): Locator {
    return this.rowOf(data).getByRole('cell').last().locator('button, a').nth(index);
  }
}
