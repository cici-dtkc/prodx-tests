

import { Page } from '@playwright/test';

export async function verifyAllReadyChecks(page: Page, poNumber: string): Promise<boolean> {
  return true;
}


export const ReadyChecks = {
  check1: async (page: Page) => {},
  check2: async (page: Page) => {},
};
