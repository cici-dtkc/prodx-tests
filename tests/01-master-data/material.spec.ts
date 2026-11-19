import { test, expect } from '@playwright/test';
import { MaterialPage } from '../../pages/01-master-data/material.page';

test.describe('GĐ 01: Master Data - Materials', () => {
  let materialPage: MaterialPage;

  test.beforeEach(async ({ page }) => {
    materialPage = new MaterialPage(page);
    await materialPage.goto();
  });

  test('TC01 - displays Materials list', async () => {
    await expect(materialPage.heading).toBeVisible();
  });

  test('TC02 - syncs materials from SAP', async () => {
  });

  test('TC03 - creates new material', async () => {
  });
});
