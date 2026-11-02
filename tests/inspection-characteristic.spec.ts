import { test, expect } from '@playwright/test';
import { InspectionCharacteristicPage } from '../pages/inspection-characteristic.page';

function uniqueCharacteristic() {
  return `AT${Date.now().toString().slice(-6)}`;
}

const BASE_DATA = {
  validFromDate: '01/01/2026',
  status: 'Being Created',
  shortText: 'Auto test characteristic',
  searchField: 'autotest',
  charType: 'QN' as const,
};

test.describe('Inspection Characteristic', () => {
  let ic: InspectionCharacteristicPage;

  test.beforeEach(async ({ page }) => {
    ic = new InspectionCharacteristicPage(page);
    await ic.goto();
  });

  //   List 

  test('TC01 - list page displays correctly', async ({ page }) => {
    await expect(ic.heading).toBeVisible();
    await expect(ic.createButton).toBeVisible();
    await expect(ic.copyButton).toBeVisible();
    await expect(ic.exportButton).toBeVisible();
    await expect(ic.importButton).toBeVisible();
    await expect(ic.dataRows.first()).toBeVisible();

    for (const col of [
      'Master Insp. Characteristic',
      'Search Field',
      'Short Text',
      'Valid From',
      'Status',
      'Created By',
      'Char. Type',
    ]) {
      await expect(
        page.getByRole('columnheader', { name: new RegExp(col) }).first(),
      ).toBeVisible();
    }
  });

  test('TC02 - filter fields visible', async () => {
    await expect(ic.charTypeFilter).toBeVisible();
    await expect(ic.statusFilter).toBeVisible();
  });

  test('TC03 - hide and show filters', async () => {
    await expect(ic.statusFilter).toBeVisible();
    await ic.hideFiltersButton.click();
    await expect(ic.statusFilter).toBeHidden();
    await ic.showFiltersButton.click();
    await expect(ic.statusFilter).toBeVisible();
  });

  test('TC04 - Reset disabled when no filter selected', async () => {
    await expect(ic.resetButton).toBeDisabled();
  });

  test('TC05 - filter by Status returns matching rows', async () => {
    await ic.selectOption(ic.statusFilter, 'Released');
    await ic.goButton.click();
    await expect(ic.dataRows.first()).toBeVisible();
    const count = await ic.dataRows.count();
    for (let i = 0; i < count; i++) {
      await expect(ic.dataRows.nth(i)).toContainText('Released');
    }
    await ic.resetButton.click();
  });

  test('TC06 - Reset clears filter', async () => {
    await ic.selectOption(ic.statusFilter, 'Released');
    await ic.goButton.click();
    await expect(ic.resetButton).toBeEnabled();
    await ic.resetButton.click();
    await expect(ic.resetButton).toBeDisabled();
  });

  //   Display  

  test('TC07 - clicking view icon opens Display page', async ({ page }) => {
    await expect(ic.dataRows.first()).toBeVisible();
    const characteristic = (await ic.dataRows.first().getByRole('cell').nth(0).innerText()).trim();
    await ic.dataRows.first().getByRole('button').first().click();
    await expect(
      page.getByRole('heading', { name: /Display.*characteristic/i }),
    ).toBeVisible();
  });

  //   Edit  

  test('TC08 - clicking edit icon opens Change page, Master Insp. Characteristic disabled', async ({ page }) => {
    await expect(ic.dataRows.first()).toBeVisible();
    await ic.dataRows.first().getByRole('button').nth(1).click();
    await expect(
      page.getByRole('heading', { name: /Change.*characteristic/i }),
    ).toBeVisible();
    await expect(ic.saveButton).toBeVisible();
    await expect(ic.backButton).toBeVisible();
    // Master Insp. Characteristic không thể thay đổi
    await expect(ic.masterCharacteristicField).toBeDisabled();
  });

  test('TC09 - edit Short Text and save successfully', async ({ page }) => {
    await expect(ic.dataRows.first()).toBeVisible();
    const originalShortText = (await ic.dataRows.first().getByRole('cell').nth(2).innerText()).trim();
    const newText = `${originalShortText} (edited)`;

    await ic.dataRows.first().getByRole('button').nth(1).click();
    await expect(page.getByRole('heading', { name: /Change.*characteristic/i })).toBeVisible();
    await ic.shortTextField.fill(newText);
    await ic.saveAndConfirm();

    await expect(
      page.getByRole('heading', { name: /Change.*characteristic|Display.*characteristic|Inspection Characteristic/i }),
    ).toBeVisible({ timeout: 10_000 });

    // Restore
    await ic.goto();
    await ic.dataRows.first().getByRole('button').nth(1).click();
    await ic.shortTextField.fill(originalShortText);
    await ic.saveAndConfirm();
  });

  //   Create  

  test('TC10 - create new characteristic', async ({ page }) => {
    const characteristic = uniqueCharacteristic();
    const { validFromDate: _validFromDate, ...createData } = BASE_DATA;
    await ic.create({ characteristic, ...createData });

    await ic.searchByCharacteristic(characteristic);
    await expect(ic.rowOf(characteristic)).toBeVisible({ timeout: 10_000 });
  });

  test('TC11 - cannot proceed if required field missing', async ({ page }) => {
    await ic.createButton.click();
    await expect(page.getByRole('heading', { name: /Step 1 of 2/i })).toBeVisible();
    // Click Next without filling Master Insp. Characteristic
    await ic.nextStepButton.click();
    // Still on Step 1 because validation fails
    await expect(page.getByRole('heading', { name: /Step 1 of 2/i })).toBeVisible();
  });

  // ── Copy ──────────────────────────────────────────────────────────────────

  test('TC12 - nút Copy mở dialog Copy Master Inspection Characteristic', async ({ page }) => {
    await ic.copyButton.click();
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible({ timeout: 5_000 });
    await expect(dialog.getByRole('heading', { name: /Copy Master Inspection Characteristic/i })).toBeVisible();
    await expect(dialog.getByLabel(/Master Insp\. Characteristic \*/i)).toBeVisible();
    await expect(dialog.getByRole('combobox', { name: 'Copy from MIC', exact: true })).toBeVisible();
    await expect(dialog.getByRole('button', { name: 'Continue', exact: true })).toBeVisible();
    await expect(dialog.getByRole('button', { name: 'Cancel', exact: true })).toBeVisible();
    // Đóng dialog
    await dialog.getByRole('button', { name: 'Cancel', exact: true }).click();
    await expect(dialog).toBeHidden({ timeout: 3_000 });
  });
});
