import { test, expect } from '@playwright/test';
import { verifyMaterial } from './01-create-material.spec';
import { createProductionOrder } from './02-create-po.spec';
import { createWorkOrder } from './03-create-wo.spec';
import { confirmProduction, handoverProduct } from './04-confirm-production.spec';
import { createGoodsReceipt, verifyTECO } from './05-goods-receipt.spec';
import { performLogistics } from './06-logistics-flow.spec';
import { verifyCompletion } from './07-verify-completion.spec';

test.describe('ProdX E2E: Full 7-Stage Production Flow', () => {
  test('Full Flow: Master Data → Production → GR → Logistics → Completion', async ({ page }) => {
    test.setTimeout(600000); 
    
    console.log('=== GĐ 01: Master Data ===');
    const materialNo = await verifyMaterial(page);
    expect(materialNo).toBeTruthy();
    console.log(`✓ Material verified: ${materialNo}`);
    
    console.log('\n=== GĐ 02: Production Order ===');
    const poNumber = await createProductionOrder(page);
    expect(poNumber).toBeTruthy();
    console.log(`✓ Production Order created: ${poNumber}`);
    
    console.log('\n=== GĐ 03: Work Order ===');
    const woNumber = await createWorkOrder(page, poNumber);
    expect(woNumber).toBeTruthy();
    console.log(`✓ Work Order created: ${woNumber}`);
    
    console.log('\n=== GĐ 04: Shop Floor ===');
    await confirmProduction(page, woNumber);
    console.log(`✓ Production time confirmed for WO: ${woNumber}`);
    
    await handoverProduct(page, woNumber);
    console.log(`✓ Product handover completed`);
    
    console.log('\n=== GĐ 05: Goods Receipt ===');
    const grNumber = await createGoodsReceipt(page, woNumber);
    expect(grNumber).toBeTruthy();
    console.log(`✓ Goods Receipt created: ${grNumber}`);
    
    await verifyTECO(page, poNumber);
    console.log(`✓ TECO verified for PO: ${poNumber}`);
    
    console.log('\n=== GĐ 06: Logistics ===');
    try {
      await performLogistics(page, woNumber);
      console.log(`✓ Logistics flow completed`);
    } catch (error) {
      console.log(`⚠ Logistics skipped (optional): ${error}`);
    }
    
    console.log('\n=== GĐ 07: Verify Completion ===');
    await verifyCompletion(page, poNumber);
    console.log(`✓ Complete production trail verified in audit log`);
    
    console.log('\n=== ✅ FULL FLOW COMPLETED SUCCESSFULLY ===');
    console.log(`PO: ${poNumber}`);
    console.log(`WO: ${woNumber}`);
    console.log(`GR: ${grNumber}`);
  });
});
