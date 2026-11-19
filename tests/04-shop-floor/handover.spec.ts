import { test, expect } from '@playwright/test';
import { HandoverPage } from '../../pages/04-shop-floor/handover.page';

test.describe('GĐ 04: Shop Floor - Handover', () => {
  let handoverPage: HandoverPage;

  test.beforeEach(async ({ page }) => {
    handoverPage = new HandoverPage(page);
    await handoverPage.goto();
  });

  test('TC01 - performs handover with QR scan', async () => {
    const woNumber = '1000000123';  
    await handoverPage.handover(woNumber);
    
  });
});
