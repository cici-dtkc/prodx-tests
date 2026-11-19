import { test, expect } from '@playwright/test';
import { simulateQRScan } from '../helpers/qr-code.helper';

test.describe('GĐ 04: Shop Floor - Glass & Glue Scan', () => {
  test('TC01 - scans glass QR code (0040 operation)', async ({ page }) => {
    const glassQR = 'GLASS-10000003-001';
    await simulateQRScan(page, glassQR);
  });

  test('TC02 - scans glue QR code', async ({ page }) => {
  });
});
