import { test, expect } from '@playwright/test';
import { ShipmentPage } from '../../pages/06-logistics/shipment.page';

test.describe('GĐ 06: Logistics - Shipment', () => {
  let shipmentPage: ShipmentPage;

  test.beforeEach(async ({ page }) => {
    shipmentPage = new ShipmentPage(page);
    await shipmentPage.goto();
  });

  test('TC01 - creates sea shipment', async () => {
    await shipmentPage.createShipment(['CRATE-001', 'CRATE-002'], 'Sea');
  });

  test('TC02 - creates air shipment', async () => {
    await shipmentPage.createShipment(['CRATE-003'], 'Air');
  });

  test('TC03 - creates road shipment', async () => {
    await shipmentPage.createShipment(['CRATE-004'], 'Road');
  });
});
