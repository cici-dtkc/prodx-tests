import { Page, Locator, expect } from '@playwright/test';
import { ensureEnglish } from '../tests/helpers/language.helper';

export class InspectionLotPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  get heading(): Locator {
    return this.page.getByRole('heading', { name: /^Inspection Lot/i });
  }

  get createButton(): Locator {
    return this.page.getByRole('button', { name: 'Create', exact: true });
  }

  get exportButton(): Locator {
    return this.page.getByRole('button', { name: 'Export', exact: true });
  }

  get hideFiltersButton(): Locator {
    return this.page.getByRole('button', { name: 'Hide filters', exact: true });
  }

  get showFiltersButton(): Locator {
    return this.page.getByRole('button', { name: 'Show filters', exact: true });
  }

  get goButton(): Locator {
    return this.page.getByRole('button', { name: 'Go', exact: true });
  }

  get dataRows(): Locator {
    return this.page.locator('tbody tr');
  }

  async goto() {
    await this.page.goto('/development/qm/inspection-lot', { waitUntil: 'domcontentloaded' });
    await this.page.waitForLoadState('networkidle', { timeout: 8_000 }).catch(() => null);
    await ensureEnglish(this.page);
    await expect(this.heading).toBeVisible();
  }


  get continueButton(): Locator {
    return this.page.getByRole('button', { name: 'Continue', exact: true });
  }

  get saveButton(): Locator {
    return this.page.getByRole('button', { name: 'Save', exact: true });
  }

  get backButton(): Locator {
    return this.page.getByRole('button', { name: 'Back', exact: true });
  }

  //   Form fields  
  get plantField(): Locator {
    return this.page.getByRole('combobox', { name: 'Plant', exact: true });
  }

  get originField(): Locator {
    return this.page.getByRole('combobox', { name: 'Origin', exact: true });
  }

  get projectField(): Locator {
    return this.page.getByRole('combobox', { name: 'Project', exact: true });
  }

  get materialGroupField(): Locator {
    return this.page.getByRole('combobox', { name: 'Material Group', exact: true });
  }

  get materialField(): Locator {
    return this.page.getByRole('combobox', { name: 'Material', exact: true });
  }

  get inspectionLotField(): Locator {
    return this.page.getByLabel('Inspection Lot', { exact: true });
  }

  //   Helpers  
  async selectOption(field: Locator, value: string) {
    await field.click();
    const escaped = value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    await this.page.getByRole('option', { name: new RegExp(`^${escaped}(?:\\s|$)`, 'i') }).click();
  }

  rowOf(lotNumber: string): Locator {
    return this.dataRows.filter({ hasText: lotNumber });
  }

  async searchByLot(lotNumber: string) {
    await this.page.goto(
      `/development/qm/inspection-lot?inspectionLot=${encodeURIComponent(lotNumber)}`,
      { waitUntil: 'domcontentloaded' },
    );
    await this.page.waitForLoadState('networkidle', { timeout: 5_000 }).catch(() => null);
    await ensureEnglish(this.page);
    await expect(this.heading).toBeVisible();
  }

  //   Create  
  async create(data: {
    plant: string;
    origin: string;
    material?: string;
    lotType?: 'Phiếu đa công đoạn' | 'Phiếu test keo';
    project?: string;
    materialGroup?: string;
  }) {
    await this.createButton.click();
    await expect(this.page.getByRole('heading', { name: /Step 1 of 2/i })).toBeVisible();

    // Step 1: dependent selections must be made before Origin becomes enabled.
    if (data.lotType) {
      await this.page.getByText(data.lotType, { exact: true }).click();
    }
    if (data.project) {
      await this.selectOption(this.projectField, data.project);
    }
    await this.selectOption(this.plantField, data.plant);
    if (data.materialGroup) {
      await this.selectOption(this.materialGroupField, data.materialGroup);
    }
    if (data.material) {
      await this.selectOption(this.materialField, data.material);
    }
    if (await this.originField.isEnabled()) {
      await this.selectOption(this.originField, data.origin);
    }
    await this.continueButton.click();

    // Step 2: header and characteristics
    await expect(this.page.getByRole('heading', { name: /Step 2 of 2/i })).toBeVisible();

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

  async exportFile() {
    const downloadPromise = this.page.waitForEvent('download');
    await this.exportButton.click();
    return downloadPromise;
  }

}
