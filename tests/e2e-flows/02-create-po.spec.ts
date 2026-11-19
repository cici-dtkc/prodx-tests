 
import { test, expect } from '@playwright/test';
import { ProductionOrderPage } from '../../pages/02-production-order/production-order.page';
import { generatePONumber, MASTER_DATA } from '../../test-data/master.data';
import { verifyAllReadyChecks } from '../helpers/ready-check.helper';

 
export async function createProductionOrder(page: any) {
  const poPage = new ProductionOrderPage(page);
  await poPage.goto();
  
  const poNumber = generatePONumber();
  
  await poPage.create({
    plant: MASTER_DATA.plant,
    material: MASTER_DATA.material,
    quantity: 10,
  });
  
  await verifyAllReadyChecks(page, poNumber);
  
  return poNumber;
}

test.describe('E2E Flow Step 2: Production Order', () => {
  test('Step 02 - Create Production Order with Ready Checks', async ({ page }) => {
    const poNumber = await createProductionOrder(page);
    expect(poNumber).toBeTruthy();
  });
});
