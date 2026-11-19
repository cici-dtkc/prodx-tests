import { test, expect } from '@playwright/test';
import { ConfirmListPage } from '../../pages/04-shop-floor/confirm-list.page';

test.describe('GĐ 04: Shop Floor - Confirm Time', () => {
  let confirmPage: ConfirmListPage;

  test.beforeEach(async ({ page }) => {
    confirmPage = new ConfirmListPage(page);
    await confirmPage.goto();
  });

  test('TC01 - confirms production time for 0040 Glass operation', async () => {
    const woNumber = '1000000123'; 
    await confirmPage.confirmTime(woNumber, 8.5);
    
  });

  test('TC02 - validates time entry format', async () => {
  });
});
