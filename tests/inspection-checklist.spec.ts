import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import { InspectionChecklistPage } from '../pages/inspection-checklist.page';

test.describe('Inspection Checklist', () => {
  let cl: InspectionChecklistPage;

  test.beforeEach(async ({ page }) => {
    cl = new InspectionChecklistPage(page);
    await cl.goto();
  });

  //   List  

  test('TC01 - hiển thị màn hình chính', async () => {
    await expect(cl.heading).toBeVisible();
    await expect(cl.createButton).toBeVisible();
    await expect(cl.dataRows.first()).toBeVisible();
  });

  test('TC02 - hiển thị đủ các cột', async ({ page }) => {
    for (const col of ['Group', 'Valid From', 'Status', 'Material', 'Project']) {
      await expect(
        page.getByRole('columnheader', { name: new RegExp(col) }).first(),
      ).toBeVisible();
    }
  });

  test('TC03 - ẩn và hiện bộ lọc', async () => {
    // Xác nhận có ít nhất 1 filter visible trước khi hide
    await expect(cl.goButton).toBeVisible();
    await cl.hideFiltersButton.click();
    await expect(cl.goButton).toBeHidden();
    await cl.showFiltersButton.click();
    await expect(cl.goButton).toBeVisible();
  });

  test('TC04 - nút Reset disabled khi chưa filter', async () => {
    await expect(cl.resetButton).toBeDisabled();
  });

  test('TC05 - nhấn Go không filter gì vẫn hiển thị dữ liệu', async () => {
    await cl.goButton.click();
    await expect(cl.dataRows.first()).toBeVisible();
  });

  test('TC06 - nút Reset xóa filter đã chọn', async () => {
    await cl.selectOption(cl.statusFilter, 'Released');
    await cl.goButton.click();
    await expect(cl.resetButton).toBeEnabled();
    await cl.resetButton.click();
    await expect(cl.resetButton).toBeDisabled();
  });

  //   Display / Edit  

  test('TC07 - nhấn icon xem mở trang Change Inspection Plan', async ({ page }) => {
    await expect(cl.dataRows.first()).toBeVisible();
    // Actions column: click first button (view/display)
    await cl.dataRows.first().getByRole('button').first().click();
    await expect(
      page.getByRole('heading', { name: /Inspection Plan|Change Inspection|Display Inspection/i }),
    ).toBeVisible();
  });

  test('TC08 - trang edit có nút Back và Save, Valid From disabled', async ({ page }) => {
    await expect(cl.dataRows.first()).toBeVisible();
    // Click edit button  
    await cl.dataRows.first().getByRole('button').nth(1).click();
    await expect(
      page.getByRole('heading', { name: /Inspection Plan|Change Inspection/i }),
    ).toBeVisible();
    await expect(cl.saveButton).toBeVisible();
    await expect(cl.backButton).toBeVisible();
    // Valid From không thể thay đổi
    await expect(
      page.getByRole('textbox', { name: /Valid From/i })
        .or(page.locator('input[disabled]').first()),
    ).toBeDisabled();
  });

  test('TC09 - tạo mới Inspection Checklist', async () => {
    await cl.create(`Auto test checklist ${Date.now()}`);
    await expect(cl.dataRows.first()).toBeVisible();
  });

  test('TC10 - Export tải file không rỗng', async ({}, testInfo) => {
    const download = await cl.exportFile();
    const filename = download.suggestedFilename();
    expect(filename).toMatch(/\.(xlsx|xls|csv)$/i);

    const outputPath = testInfo.outputPath(filename);
    await download.saveAs(outputPath);
    expect(fs.statSync(outputPath).size).toBeGreaterThan(0);
  });
});
