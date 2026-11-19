import { test, expect } from '@playwright/test';
import { GoodsReceiptPage } from '../../pages/05-goods-receipt/goods-receipt.page';

test.describe('GĐ 05: Goods Receipt - Create', () => {
  let grPage: GoodsReceiptPage;

  test.beforeEach(async ({ page }) => {
    grPage = new GoodsReceiptPage(page);
    await grPage.goto();
  });

  test('TC01 - creates Goods Receipt from Work Order', async () => {
    const woNumber = '1000000123';  
    await grPage.create(woNumber);
    
    await expect(grPage.dataRows.first()).toBeVisible();
  });
});
