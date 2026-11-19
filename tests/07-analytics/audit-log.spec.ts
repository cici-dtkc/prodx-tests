import { test, expect } from '@playwright/test';
import { AuditLogPage } from '../../pages/07-analytics/audit-log.page';

test.describe('GĐ 07: Analytics - Audit Log', () => {
  let auditPage: AuditLogPage;

  test.beforeEach(async ({ page }) => {
    auditPage = new AuditLogPage(page);
    await auditPage.goto();
  });

  test('TC01 - searches audit log by PO number', async () => {
    const poNumber = 'PO1234567890';
    await auditPage.searchLog(poNumber);
    
    await expect(auditPage.dataRows.first()).toBeVisible();
  });

  test('TC02 - verifies complete production trail', async () => {
  });
});
