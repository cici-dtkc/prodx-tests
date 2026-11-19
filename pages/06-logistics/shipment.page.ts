
import { Page, Locator } from '@playwright/test';

export class ShipmentPage {
  readonly page: Page;
  readonly heading: Locator;
  readonly createButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heading = page.getByRole('heading', { name: /shipment/i });
    this.createButton = page.getByRole('button', { name: /new shipment/i });
  }

  async goto() {
    await this.page.goto('/logistics/shipment');
  }

  async createShipment(crateIds: string[], method: 'Sea' | 'Air' | 'Road') {
  }
}
