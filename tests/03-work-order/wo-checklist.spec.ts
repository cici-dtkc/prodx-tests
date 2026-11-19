import { test, expect } from '@playwright/test';
import { WorkOrderPage } from '../../pages/03-work-order/work-order.page';

test.describe('GĐ 03: Work Order - 4-Key CheckList', () => {
  test('TC01 - verifies 4-Key CheckList', async ({ page }) => {
    const woPage = new WorkOrderPage(page);
    await woPage.goto();
    
    await woPage.verify4KeyChecklist();
  });
});
