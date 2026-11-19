import { test, expect } from '@playwright/test';
import { WorkOrderPage } from '../../pages/03-work-order/work-order.page';
import { generateWONumber } from '../../test-data/master.data';

test.describe('GĐ 03: Work Order - Create', () => {
  let woPage: WorkOrderPage;

  test.beforeEach(async ({ page }) => {
    woPage = new WorkOrderPage(page);
    await woPage.goto();
  });

  test('TC01 - creates Work Order from Production Order', async () => {
    const poNumber = 'PO1234567890';  
    await woPage.create(poNumber);
    
    await expect(woPage.dataRows.first()).toBeVisible();
  });

  test('TC02 - generates unique 10-digit WO number', async () => {
    const woNumber = generateWONumber();
    expect(woNumber).toMatch(/^\d{10}$/);
    expect(parseInt(woNumber)).toBeGreaterThanOrEqual(1000000000);
  });
});
