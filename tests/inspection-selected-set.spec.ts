import { test, expect } from '@playwright/test';
import { InspectionSelectedSetPage } from '../pages/inspection-selected-set.page';

test.describe('Inspection Selected Set', () => {
  let page: InspectionSelectedSetPage;

  test.beforeEach(async ({ page: p }) => {
    page = new InspectionSelectedSetPage(p);
    await page.goto();
  });

  test('TC01 - hiển thị màn hình chính', async ({ page: p }) => {
    await expect(page.heading).toBeVisible();
    await expect(page.createButton).toBeVisible();
    await expect(page.dataRows.first()).toBeVisible();
  });
});
