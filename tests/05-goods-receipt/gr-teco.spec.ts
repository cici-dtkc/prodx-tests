import { test, expect } from '@playwright/test';
import { GoodsReceiptPage } from '../../pages/05-goods-receipt/goods-receipt.page';
import { verifyMaterialDocumentAPI } from '../helpers/sap-integration.helper';

test.describe('GĐ 05: Goods Receipt - TECO & SAP Integration', () => {
  test('TC01 - performs TECO (Technical Completion) in SAP', async ({ page }) => {
    const grPage = new GoodsReceiptPage(page);
    const poNumber = 'PO1234567890';  
    
    await grPage.verifyTECO(poNumber);
  });

  test('TC02 - verifies Material Document API integration', async ({ page }) => {
    const grNumber = 'GR5000123456';
    const apiSuccess = await verifyMaterialDocumentAPI(page, grNumber);
    expect(apiSuccess).toBe(true);
  });
});
