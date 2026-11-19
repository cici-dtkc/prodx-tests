import { test, expect } from '@playwright/test';
import { InstallationPage } from '../../pages/06-logistics/installation.page';

test.describe('GĐ 06: Logistics - Installation (Site)', () => {
  let installPage: InstallationPage;

  test.beforeEach(async ({ page }) => {
    installPage = new InstallationPage(page);
    await installPage.goto();
  });

  test('TC01 - records product installation at site', async () => {
    const productQR = 'PROD-10000003-001';
    const siteLocation = 'BMW Factory - Building A';
    
    await installPage.recordInstallation(productQR, siteLocation);
  });
});
