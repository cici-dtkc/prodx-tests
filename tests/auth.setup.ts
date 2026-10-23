import { test as setup, expect } from '@playwright/test';

const AUTH_FILE = 'playwright/.auth/user.json';

// Đăng nhập 1 lần, lưu phiên vào file để mọi test sau dùng lại (không phải đăng nhập lại)
setup('đăng nhập', async ({ page }) => {
  const user = process.env.TEST_USER;
  const password = process.env.TEST_PASSWORD;
  if (!user || !password) {
    throw new Error('Thiếu TEST_USER hoặc TEST_PASSWORD trong file .env');
  }

  // Vào trang chủ, chưa đăng nhập thì hệ thống tự chuyển sang trang đăng nhập
  await page.goto('/');

  // TEST_USER phải là EMAIL của tài khoản (ô này kiểm tra định dạng email)
  await page.getByPlaceholder('you@example.com').fill(user);
  await page.locator('input[type="password"]').fill(password);
  await page.getByRole('button', { name: 'Sign in' }).click();

  await expect(page.getByRole('button', { name: 'Sign in' })).toHaveCount(0);
  await page.waitForURL((url) => !/login|sign-?in/i.test(url.pathname));

  await page.context().storageState({ path: AUTH_FILE });
});