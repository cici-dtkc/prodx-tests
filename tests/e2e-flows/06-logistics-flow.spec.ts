

import { test, expect } from '@playwright/test';
import { CratingPage } from '../../pages/06-logistics/crating.page';
import { ShipmentPage } from '../../pages/06-logistics/shipment.page';
import { InstallationPage } from '../../pages/06-logistics/installation.page';

export async function performLogistics(page: any, woNumber: string) {
  const cratingPage = new CratingPage(page);
  await cratingPage.goto();
  await cratingPage.crateScan('CRATE-001-2026');
  
  // Shipment
  const shipmentPage = new ShipmentPage(page);
  await shipmentPage.goto();
  await shipmentPage.createShipment(['CRATE-001-2026'], 'Sea');
  
  // Installation (optional)
  const installPage = new InstallationPage(page);
  await installPage.goto();
  await installPage.recordInstallation('PROD-10000003-001', 'BMW Factory');
  
  return true;
}

test.describe('E2E Flow Step 6: Logistics', () => {
  test('Step 06 - Complete logistics flow', async ({ page }) => {
    const woNumber = '1000000123';
    await performLogistics(page, woNumber);
  });
});
