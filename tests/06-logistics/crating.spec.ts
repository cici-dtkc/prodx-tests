import { test, expect } from '@playwright/test';
import { CratingPage } from '../../pages/06-logistics/crating.page';

test.describe('GĐ 06: Logistics - Crating', () => {
  let cratingPage: CratingPage;

  test.beforeEach(async ({ page }) => {
    cratingPage = new CratingPage(page);
    await cratingPage.goto();
  });

  test('TC01 - scans crate QR code', async () => {
    const crateQR = 'CRATE-001-2026';
    await cratingPage.crateScan(crateQR);
    
  });
});
