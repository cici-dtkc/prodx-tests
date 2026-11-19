
import { test, expect } from '@playwright/test';
import { ConfirmListPage } from '../../pages/04-shop-floor/confirm-list.page';
import { HandoverPage } from '../../pages/04-shop-floor/handover.page';


export async function confirmProduction(page: any, woNumber: string) {
  const confirmPage = new ConfirmListPage(page);
  await confirmPage.goto();
  
  await confirmPage.confirmTime(woNumber, 8.0);
  
  return true;
}

export async function handoverProduct(page: any, woNumber: string) {
  const handoverPage = new HandoverPage(page);
  await handoverPage.goto();
  
  await handoverPage.handover(woNumber);
  
  return true;
}

test.describe('E2E Flow Step 4: Shop Floor', () => {
  test('Step 04 - Confirm production & handover', async ({ page }) => {
    const woNumber = '1000000123'; // TODO: Use actual WO from previous step
    
    await confirmProduction(page, woNumber);
    await handoverProduct(page, woNumber);
  });
});
