/**
 * Master data and unique ID generators for ProdX E2E tests
 */

/**
 * Generate unique Production Order number (10 digits)
 * Format: Timestamp-based to ensure uniqueness
 */
export function generatePONumber(): string {
  // TODO: Implement PO number generation logic
  const timestamp = Date.now().toString().slice(-10);
  return `PO${timestamp}`;
}

/**
 * Generate unique Work Order number (10 digits)
 * Format: WO + 10 digits starting from 1000000000
 */
export function generateWONumber(): string {
  // TODO: Implement WO number generation logic
  const timestamp = Date.now().toString().slice(-10);
  return `${1000000000 + parseInt(timestamp.slice(-8))}`;
}

/**
 * Master data constants
 */
export const MASTER_DATA = {
  plant: '1010 - Nhà máy Châu Đức',
  material: '10000003 - Kính hộp Low-E 8-15-8',
  // TODO: Add more master data
};
