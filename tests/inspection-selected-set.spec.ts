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
});
