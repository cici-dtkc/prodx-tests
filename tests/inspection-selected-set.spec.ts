import { test, expect } from '@playwright/test';
import { InspectionSelectedSetPage } from '../pages/inspection-selected-set.page';

test.describe('Inspection Selected Set', () => {
  let iss: InspectionSelectedSetPage;

  test.beforeEach(async ({ page }) => {
    iss = new InspectionSelectedSetPage(page);
    await iss.goto();
  });

  test('TC01 - hiển thị màn hình chính', async () => {
    await expect(iss.heading).toBeVisible();
    await expect(iss.createButton).toBeVisible();
    await expect(iss.dataRows.first()).toBeVisible();
  });

  test('TC02 - hiển thị đủ 4 bộ lọc', async () => {
    await expect(iss.catalogTypeFilter).toBeVisible();
    await expect(iss.selectedSetFilter).toBeVisible();
    await expect(iss.statusFilter).toBeVisible();
    await expect(iss.createdByFilter).toBeVisible();
    await expect(iss.goButton).toBeVisible();
    await expect(iss.resetButton).toBeVisible();
  });

  test('TC03 - ẩn và hiện bộ lọc', async () => {
    await expect(iss.catalogTypeFilter).toBeVisible();
    await iss.hideFiltersButton.click();
    await expect(iss.catalogTypeFilter).toBeHidden();
    await iss.showFiltersButton.click();
    await expect(iss.catalogTypeFilter).toBeVisible();
  });

  test('TC04 - nút Reset disabled khi chưa chọn filter', async () => {
    await expect(iss.resetButton).toBeDisabled();
  });

  test('TC05 - filter theo Status trả về kết quả khớp', async () => {
    await iss.selectOption(iss.statusFilter, 'Released');
    await iss.goButton.click();
    await expect(iss.dataRows.first()).toBeVisible();
    const count = await iss.dataRows.count();
    for (let i = 0; i < count; i++) {
      await expect(iss.dataRows.nth(i)).toContainText('Released');
    }
  });

  test('TC06 - nút Reset xóa filter đã chọn', async () => {
    await iss.selectOption(iss.statusFilter, 'Released');
    await iss.goButton.click();
    await expect(iss.resetButton).toBeEnabled();
    await iss.resetButton.click();
    await expect(iss.resetButton).toBeDisabled();
  });

  test('TC07 - nhấn Display mở trang chi tiết', async ({ page }) => {
    await expect(iss.dataRows.first()).toBeVisible();
    const selectedSet = (await iss.dataRows.first().getByRole('cell').nth(1).innerText()).trim();
    await iss.viewDetails(selectedSet);
    await expect(page.getByRole('heading', { name: /Display selected set/i })).toBeVisible();
    await expect(iss.backLink).toBeVisible();
  });

  test('TC08 - nhấn Edit mở trang chỉnh sửa', async ({ page }) => {
    await expect(iss.dataRows.first()).toBeVisible();
    const selectedSet = (await iss.dataRows.first().getByRole('cell').nth(1).innerText()).trim();
    await iss.openEdit(selectedSet);
    await expect(page.getByRole('heading', { name: /Change selected set/i })).toBeVisible();
    await expect(iss.saveButton).toBeVisible();
    await expect(iss.backButton).toBeVisible();
    await expect(page.getByRole('combobox', { name: /Catalog Type \*/i })).toBeDisabled();
    await expect(page.getByLabel(/Selected Set \*/i)).toBeDisabled();
  });

  test('TC09 - sửa Short Text và lưu thành công', async () => {
    await expect(iss.dataRows.first()).toBeVisible();
    const selectedSet = (await iss.dataRows.first().getByRole('cell').nth(1).innerText()).trim();
    const originalText = (await iss.dataRows.first().getByRole('cell').nth(2).innerText()).trim();
    const newText = `${originalText} (edited)`;

    await iss.openEdit(selectedSet);
    await iss.shortTextField.fill(newText);
    await iss.saveAndConfirm();

    await iss.goto();
    await iss.openEdit(selectedSet);
    await iss.shortTextField.fill(originalText);
    await iss.saveAndConfirm();
  });

  test('TC10 - tạo mới Selected Set', async () => {
    const selectedSet = `AT${Date.now().toString().slice(-6)}`;
    await iss.create(selectedSet, 'Auto test selected set');
    await iss.searchBySelectedSet(selectedSet);
    await expect(iss.rowOf(selectedSet)).toBeVisible({ timeout: 10_000 });
  });

  test('TC11 - không tạo được nếu thiếu trường bắt buộc', async ({ page }) => {
    await iss.createButton.click();
    await expect(page.getByRole('heading', { name: /Step 1 of 2/i })).toBeVisible();
    await iss.nextStepButton.click();
    await expect(page.getByRole('heading', { name: /Step 1 of 2/i })).toBeVisible();
  });
});
