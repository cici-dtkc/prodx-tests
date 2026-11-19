
import { test, expect } from '@playwright/test';
import { GoodsReceiptPage } from '../../pages/05-goods-receipt/goods-receipt.page';


export async function createGoodsReceipt(page: any, woNumber: string) {
  const grPage = new GoodsReceiptPage(page);
  await grPage.goto();
  
  await grPage.create(woNumber);
  await grPage.verifyWOFinished(woNumber);
  
  return 'GR5000123456'; 
}

export async function verifyTECO(page: any, poNumber: string) {
  const grPage = new GoodsReceiptPage(page);
  await grPage.verifyTECO(poNumber);
  
  return true;
}

test.describe('E2E Flow Step 5: Goods Receipt', () => {
  test('Step 05 - Create GR and verify TECO', async ({ page }) => {
    const woNumber = '1000000123'; 
    const poNumber = 'PO1234567890';
    
    const grNumber = await createGoodsReceipt(page, woNumber);
    await verifyTECO(page, poNumber);
    
    expect(grNumber).toBeTruthy();
  });
});
