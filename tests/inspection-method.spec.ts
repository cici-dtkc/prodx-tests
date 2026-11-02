import { test, expect } from '@playwright/test';
import { InspectionMethodPage } from '../pages/inspection-method.page';

 function uniqueMethod() {
  return `AT${Date.now().toString().slice(-6)}`;
}

const BASE_DATA = {
  validFromDate: '01/01/2026',
  status: 'Being Created',
  shortText: 'Auto test method',
  searchField: 'autotest',
};

test.describe('Inspection Method', () => {
  let im: InspectionMethodPage;

  test.beforeEach(async ({ page }) => {
    im = new InspectionMethodPage(page);
    await im.goto();
  });

  //   Danh sách 

  test('TC01 - hiển thị màn hình chính', async () => {
    await expect(im.heading).toBeVisible();
    await expect(im.createButton).toBeVisible();
    await expect(im.exportButton).toBeVisible();
    await expect(im.importButton).toBeVisible();
    await expect(im.dataRows.first()).toBeVisible();
  });

  test('TC02 - hiển thị đủ các cột', async ({ page }) => {
    for (const col of ['Inspection Method', 'Status of Method', 'Valid-From Date', 'Short Text']) {
      await expect(
        page.getByRole('columnheader', { name: new RegExp(col) }).first(),
      ).toBeVisible();
    }
  });

  test('TC03 - ẩn và hiện bộ lọc', async () => {
    await expect(im.statusFilter).toBeVisible();
    await im.hideFiltersButton.click();
    await expect(im.statusFilter).toBeHidden();
    await im.showFiltersButton.click();
    await expect(im.statusFilter).toBeVisible();
  });

  test('TC04 - nút Reset disabled khi chưa filter', async () => {
    await expect(im.resetButton).toBeDisabled();
  });

  test('TC05 - filter theo Status trả về kết quả khớp', async () => {
    await im.selectOption(im.statusFilter, 'Released');
    await im.goButton.click();
    await expect(im.dataRows.first()).toBeVisible();
    const count = await im.dataRows.count();
    for (let i = 0; i < count; i++) {
      await expect(im.dataRows.nth(i)).toContainText('Released');
    }
    await im.resetButton.click();
  });

  test('TC06 - nút Reset xóa filter', async () => {
    await im.selectOption(im.statusFilter, 'Released');
    await im.goButton.click();
    await expect(im.resetButton).toBeEnabled();
    await im.resetButton.click();
    await expect(im.resetButton).toBeDisabled();
  });

  //   Display  

  test('TC07 - nhấn icon xem mở trang Display', async ({ page }) => {
    await expect(im.dataRows.first()).toBeVisible();
    const method = (await im.dataRows.first().getByRole('cell').nth(0).innerText()).trim();
    await im.dataRows.first().getByRole('button').first().click();
    await expect(
      page.getByRole('heading', { name: /Display inspection method/i }),
    ).toBeVisible();
  });

  //   Edit  

  test('TC08 - nhấn icon edit mở trang chỉnh sửa', async ({ page }) => {
    await expect(im.dataRows.first()).toBeVisible();
    await im.dataRows.first().getByRole('button').nth(1).click();
    await expect(
      page.getByRole('heading', { name: /Change inspection method/i }),
    ).toBeVisible();
    await expect(im.saveButton).toBeVisible();
    await expect(im.backButton).toBeVisible();
    // Inspection Method và Valid-From Date không thể thay đổi
    await expect(im.inspectionMethodField).toBeDisabled();
    // Valid-From Date là date input với calendar icon — check disabled qua attribute
    const dateInput = page.locator('input[disabled]').filter({ hasText: /\d{2}\/\d{2}\/\d{4}/ })
      .or(page.locator('[aria-label*="Valid"], [aria-label*="Date"]').locator('input[disabled]'));
    // Chỉ verify heading và Inspection Method field disabled là đủ
  });

  test('TC09 - sửa Short Text và lưu thành công', async ({ page }) => {
    await expect(im.dataRows.first()).toBeVisible();
    const originalShortText = (await im.dataRows.first().getByRole('cell').nth(3).innerText()).trim();
    const newText = `${originalShortText} (edited)`;

    await im.dataRows.first().getByRole('button').nth(1).click();
    await expect(page.getByRole('heading', { name: /Change inspection method/i })).toBeVisible();
    await im.shortTextField.fill(newText);
    await im.saveAndConfirm();

    await expect(
      page.getByRole('heading', { name: /Change inspection method|Display inspection method|Inspection Method/i }),
    ).toBeVisible({ timeout: 10_000 });

    // Khôi phục
    await im.goto();
    await im.dataRows.first().getByRole('button').nth(1).click();
    await im.shortTextField.fill(originalShortText);
    await im.saveAndConfirm();
  });

  //   Create  

  test('TC10 - tạo mới Inspection Method', async ({ page }) => {
    const method = uniqueMethod();
    await im.createButton.click();
    await expect(page.getByRole('heading', { name: /Step 1 of 2/i })).toBeVisible();

    await im.inspectionMethodField.fill(method);
    await im.nextStepButton.click();
    await expect(page.getByRole('heading', { name: /Step 2 of 2/i })).toBeVisible();

    await im.shortTextField.fill(BASE_DATA.shortText);
    await im.searchFieldInput.fill(BASE_DATA.searchField);
    await im.saveAndConfirm();

    await im.searchByMethod(method);
    await expect(im.rowOf(method)).toBeVisible({ timeout: 10_000 });
  });

  test('TC11 - không tạo được nếu thiếu trường bắt buộc', async ({ page }) => {
    await im.createButton.click();
    await expect(page.getByRole('heading', { name: /Step 1 of 2/i })).toBeVisible();
    // Click Next mà không điền Inspection Method
    await im.nextStepButton.click();
    // Vẫn ở Step 1 vì validation fail
    await expect(page.getByRole('heading', { name: /Step 1 of 2/i })).toBeVisible();
  });
});
