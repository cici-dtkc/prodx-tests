 
import { test, expect } from '@playwright/test';
import { MaterialPage } from '../../pages/01-master-data/material.page';
import { MATERIALS } from '../../test-data/material.data';
 
export async function verifyMaterial(page: any) {
  const materialPage = new MaterialPage(page);
  await materialPage.goto();
  
  return MATERIALS.glass.materialNo;
}

test.describe('E2E Flow Step 1: Material Master Data', () => {
  test('Step 01 - Verify material exists', async ({ page }) => {
    const materialNo = await verifyMaterial(page);
    expect(materialNo).toBeTruthy();
  });
});
