import { test, expect } from '@playwright/test';
import { WorkOrderPage } from '../../pages/03-work-order/work-order.page';

test.describe('GĐ 03: Work Order - Split', () => {
  test('TC01 - splits Work Order into sub-orders', async ({ page }) => {
    const woPage = new WorkOrderPage(page);
    await woPage.goto();
    
  });
});
