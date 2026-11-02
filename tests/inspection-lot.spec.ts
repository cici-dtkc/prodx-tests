import { test, expect } from '@playwright/test';
import { InspectionLotPage } from '../pages/inspection-lot.page';

test.describe('Inspection Lot', () => {
  let lot: InspectionLotPage;

  test.beforeEach(async ({ page }) => {
    lot = new InspectionLotPage(page);
    await lot.goto();
  });

  test('TC01 - displays Inspection Lot list', async ({ page }) => {
    await expect(lot.heading).toBeVisible();
    await expect(lot.createButton).toBeVisible();
    await expect(lot.exportButton).toBeVisible();
    await expect(lot.dataRows.first()).toBeVisible();

    for (const column of ['Project', 'Plant', 'Origin', 'Inspection Lot', 'Lot Type', 'System Status']) {
      await expect(page.getByRole('columnheader', { name: new RegExp(column) }).first()).toBeVisible();
    }
  });

  test('TC02 - hides and shows filters', async () => {
    await expect(lot.goButton).toBeVisible();
    await lot.hideFiltersButton.click();
    await expect(lot.goButton).toBeHidden();
    await lot.showFiltersButton.click();
    await expect(lot.goButton).toBeVisible();
  });

  test('TC03 - exports a non-empty file', async ({}, testInfo) => {
    const download = await lot.exportFile();
    const filename = download.suggestedFilename();
    expect(filename).toMatch(/\.(xlsx|xls|csv)$/i);

    const outputPath = testInfo.outputPath(filename);
    await download.saveAs(outputPath);
    expect((await import('fs')).statSync(outputPath).size).toBeGreaterThan(0);
  });

  test('TC04 - create form has Continue disabled initially', async ({ page }) => {
    await lot.createButton.click();
    await expect(page.getByRole('heading', { name: /Step 1 of 2/i })).toBeVisible();
    await expect(page.getByText('Lot Type', { exact: true })).toBeVisible();
    await expect(page.getByRole('combobox', { name: 'Plant', exact: true })).toBeVisible();
    await expect(page.getByRole('combobox', { name: 'Origin', exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Continue', exact: true })).toBeDisabled();
  });

  test('TC05 - opens Inspection Lot details', async ({ page }) => {
    await expect(lot.dataRows.first()).toBeVisible();
    await lot.dataRows.first().getByRole('button').first().click();
    await expect(page.getByRole('heading', { name: /Change Inspection Lot|Display Inspection Lot/i })).toBeVisible();
  });

  test('TC06 - opens Inspection Lot edit page', async ({ page }) => {
    await expect(lot.dataRows.first()).toBeVisible();
    await lot.dataRows.first().getByRole('button').nth(1).click();
    await expect(page.getByRole('heading', { name: /Change Inspection Lot/i })).toBeVisible();
    await expect(lot.continueButton).toBeEnabled();
    await lot.continueButton.click();
    await expect(page.getByRole('heading', { name: /Step 2 of 2/i })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Release', exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Delete', exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Add MIC', exact: true })).toBeVisible();
    await expect(lot.saveButton).toBeVisible();
  });

  test('TC07 - displays Inspection Lot Step 2 header and MIC controls', async ({ page }) => {
    await lot.createButton.click();
    await page.getByText('Phiếu đa công đoạn', { exact: true }).click();
    await lot.selectOption(lot.plantField, '1010 - Nhà máy Châu Đức');
    await lot.selectOption(lot.materialField, '10000003 - Kính hộp Low-E 8-15-8');
    await lot.continueButton.click();
    await expect(page.getByRole('heading', { name: /Step 2 of 2/i })).toBeVisible();

    for (const field of [
      'Fabrication drawing',
      'BM Product',
      'Group Counter',
      'Group Counter Description',
      'Start Date',
      'End Date',
      'Quantity',
      'Unit',
    ]) {
      await expect(page.getByText(field, { exact: false }).first()).toBeVisible();
    }

    await expect(page.getByText('MIC', { exact: true }).first()).toBeVisible();
    await expect(page.getByRole('button', { name: 'Add MIC', exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Previous step', exact: true })).toBeVisible();
    await expect(lot.saveButton).toBeVisible();
  });

  test('TC08 - creates a standard Inspection Lot with material 10000003', async () => {
    await lot.create({
      plant: '1010 - Nhà máy Châu Đức',
      origin: 'Inspection Process',
      lotType: 'Phiếu đa công đoạn',
      material: '10000003 - Kính hộp Low-E 8-15-8',
    });
    await expect(lot.dataRows.first()).toBeVisible();
  });
});
