import { test, expect } from '@playwright/test';
import { ProductionOrderPage } from '../../pages/02-production-order/production-order.page';
import { generatePONumber, MASTER_DATA } from '../../test-data/master.data';

test.describe('GĐ 02: Production Order - Create', () => {
  let poPage: ProductionOrderPage;

  test.beforeEach(async ({ page }) => {
    poPage = new ProductionOrderPage(page);
    await poPage.goto();
  });

  test('TC01 - creates new Production Order', async () => {
    const poNumber = generatePONumber();
    
    await poPage.create({
      plant: MASTER_DATA.plant,
      material: MASTER_DATA.material,
      quantity: 10,
    });

    await expect(poPage.dataRows.first()).toBeVisible();
  });

  test('TC02 - validates required fields', async () => {
  });
});
