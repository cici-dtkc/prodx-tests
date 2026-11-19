import { test, expect } from '@playwright/test';
import { RoutingPage } from '../../pages/01-master-data/routing.page';

test.describe('GĐ 01: Master Data - Routing', () => {
  let routingPage: RoutingPage;

  test.beforeEach(async ({ page }) => {
    routingPage = new RoutingPage(page);
    await routingPage.goto();
  });

  test('TC01 - displays Routing list', async () => {
    await expect(routingPage.heading).toBeVisible();
  });
});
