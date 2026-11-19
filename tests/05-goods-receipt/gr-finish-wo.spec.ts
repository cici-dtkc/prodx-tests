import { test, expect } from '@playwright/test';
import { GoodsReceiptPage } from '../../pages/05-goods-receipt/goods-receipt.page';

test.describe('GĐ 05: Goods Receipt - Finish WO', () => {
  test('TC01 - finishes Work Order after Goods Receipt', async ({ page }) => {
    const grPage = new GoodsReceiptPage(page);
    const woNumber = '1000000123';  
    
    await grPage.verifyWOFinished(woNumber);
  });
});
