import { test, expect } from '@playwright/test';
import { AuditLogPage } from '../../pages/07-analytics/audit-log.page';

test.describe('GĐ 07: Analytics - Gantt Chart', () => {
  test('TC01 - displays Gantt chart for Production Order', async ({ page }) => {
    const auditPage = new AuditLogPage(page);
    const poNumber = 'PO1234567890';
    
    await auditPage.verifyGanttChart(poNumber);
  });
});
