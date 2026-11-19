 

import { test, expect } from '@playwright/test';
import { WorkOrderPage } from '../../pages/03-work-order/work-order.page';
import { generateWONumber } from '../../test-data/master.data';
 
export async function createWorkOrder(page: any, poNumber: string) {
  const woPage = new WorkOrderPage(page);
  await woPage.goto();
  
  const woNumber = generateWONumber();
  
  await woPage.create(poNumber);
  await woPage.verify4KeyChecklist();
  
  return woNumber;
}

test.describe('E2E Flow Step 3: Work Order', () => {
  test('Step 03 - Create Work Order from PO', async ({ page }) => {
    const poNumber = 'PO1234567890';  
    const woNumber = await createWorkOrder(page, poNumber);
    expect(woNumber).toBeTruthy();
  });
});
