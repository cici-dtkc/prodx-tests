import { test, expect } from '@playwright/test';
import { MasterCodeGroupPage } from '../pages/master-code-group.page';
import {
  MASTER_CODE_GROUP_DATA,
} from './data/master-code-group.data';

/** Tạo codeGroup duy nhất theo timestamp để tránh conflict giữa các lần chạy */
function uniqueCode() {
  return `AT${Date.now().toString().slice(-6)}`;
}

test.describe('Master Code Group - CRUD', () => {
  test.describe.configure({ mode: 'serial' });

  let mcg: MasterCodeGroupPage;

  test.beforeEach(async ({ page }) => {
    mcg = new MasterCodeGroupPage(page);
    await mcg.goto();
  });

  test('TC01 - hiển thị danh sách và các cột đúng', async ({ page }) => {
    await expect(mcg.heading).toBeVisible();
    await expect(mcg.createButton).toBeVisible();
    await expect(mcg.exportButton).toBeVisible();
    await expect(mcg.importButton).toBeVisible();

    for (const col of ['Catalog Type', 'Code Group', 'Short Text', 'Status', 'Create By', 'Create On']) {
      await expect(page.getByRole('columnheader', { name: new RegExp(col) }).first()).toBeVisible();
    }
  });

  test('TC02 - filter theo Status', async () => {
    await mcg.selectOption(mcg.statusFilter, 'Released');
    await mcg.goButton.click();
    await expect(mcg.dataRows.first()).toBeVisible();
    const count = await mcg.dataRows.count();
    for (let i = 0; i < count; i++) {
      await expect(mcg.dataRows.nth(i)).toContainText('Released');
    }
    await mcg.resetButton.click();
  });

  test('TC03 - tạo mới Code Group', async () => {
    const data = { ...MASTER_CODE_GROUP_DATA, codeGroup: uniqueCode() };
    await mcg.create(data);
    await expect(mcg.rowOf(data.codeGroup)).toBeVisible({ timeout: 10_000 });
  });

  test('TC04 - không tạo được nếu thiếu trường bắt buộc', async ({ page }) => {
    await mcg.createButton.click();
    await expect(page.getByRole('heading', { name: /Step 1 of 2/i })).toBeVisible();
    await mcg.nextStepButton.click();
    // Vẫn ở Step 1 vì validation chưa pass
    await expect(page.getByRole('heading', { name: /Step 1 of 2/i })).toBeVisible();
  });

  test('TC05 - xem chi tiết Code Group', async ({ page }) => {
    // Lấy record đầu tiên đang có trong danh sách
    await expect(mcg.dataRows.first()).toBeVisible();
    await mcg.dataRows.first().getByRole('button', { name: 'Display', exact: true }).click();
    await expect(page.getByRole('heading', { name: /Display Master Code Group/i })).toBeVisible();
  });

  test('TC06 - sửa Short Text của Code Group', async () => {
    const data = { ...MASTER_CODE_GROUP_DATA, codeGroup: uniqueCode() };
    const newShortText = 'Updated Short Text';
    await mcg.create(data);
    await mcg.searchByCodeGroup(data.codeGroup);
    await mcg.openEdit(data.codeGroup);
    await mcg.shortTextField.fill(newShortText);
    await mcg.saveAndConfirm();
    await mcg.searchByCodeGroup(data.codeGroup);
    await expect(mcg.rowOf(data.codeGroup)).toContainText(newShortText);
  });

  test('TC07 - thêm code mới khi edit', async ({ page }) => {
    // Dùng record đầu tiên có sẵn trong danh sách
    await expect(mcg.dataRows.first()).toBeVisible();
    const codeGroup = (await mcg.dataRows.first().getByRole('cell').nth(1).innerText()).trim();
    await mcg.openEdit(codeGroup);
    await mcg.addCodeButton.click();
    const lastRow = page.locator('table tbody tr').last();
    await lastRow.getByRole('textbox').nth(0).fill('0099');
    await lastRow.getByRole('textbox').nth(1).fill('Extra code');
    await mcg.saveAndConfirm();
    await mcg.searchByCodeGroup(codeGroup);
    await mcg.viewDetails(codeGroup);
    await expect(page.getByRole('cell', { name: '0099' })).toBeVisible();
  });

  test('TC08 - ẩn và hiện bộ lọc', async () => {
    await expect(mcg.catalogTypeFilter).toBeVisible();
    await mcg.hideFiltersButton.click();
    await expect(mcg.catalogTypeFilter).toBeHidden();
    await mcg.showFiltersButton.click();
    await expect(mcg.catalogTypeFilter).toBeVisible();
  });
});
