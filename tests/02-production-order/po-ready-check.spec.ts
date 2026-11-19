import { test, expect } from '@playwright/test';
import { ProductionOrderPage } from '../../pages/02-production-order/production-order.page';
import { verifyAllReadyChecks } from '../helpers/ready-check.helper';

test.describe('GĐ 02: Production Order - 11 Ready Checks', () => {
  test('TC01 - verifies all 11 Ready Checks pass', async ({ page }) => {
    const poNumber = 'PO1234567890';  
    const allChecksPassed = await verifyAllReadyChecks(page, poNumber);
    expect(allChecksPassed).toBe(true);
  });

  test('TC02 - blocks PO release when Ready Checks fail', async ({ page }) => {
  });
});
