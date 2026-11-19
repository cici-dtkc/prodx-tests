

import { test, expect } from '@playwright/test';
import { AuditLogPage } from '../../pages/07-analytics/audit-log.page';

export async function verifyCompletion(page: any, poNumber: string) {
  const auditPage = new AuditLogPage(page);
  await auditPage.goto();
  
  await auditPage.searchLog(poNumber);
  await auditPage.verifyGanttChart(poNumber);
  
  return true;
}

test.describe('E2E Flow Step 7: Verify Completion', () => {
  test('Step 07 - Verify complete production trail in audit log', async ({ page }) => {
    const poNumber = 'PO1234567890';
    await verifyCompletion(page, poNumber);
  });
});
