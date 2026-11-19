# ProdX MES End-to-End Test Flows

## Tổng quan

Test suite này cover toàn bộ 7 giai đoạn (GĐ) của luồng sản xuất ProdX MES:

1. **GĐ 01: Master Data** - Material, BOM, Routing
2. **GĐ 02: Production Order** - 11 Ready Checks, Batch
3. **GĐ 03: Work Order** - 4-Key CheckList, Split
4. **GĐ 04: Shop Floor** - Confirm Time, Handover, QR Scan
5. **GĐ 05: Goods Receipt** - GR, Finish WO, TECO
6. **GĐ 06: Logistics** - Crating, Shipment, Installation
7. **GĐ 07: Analytics** - Audit Log, Gantt, Statistics

## Cấu trúc Files

```
e2e-flows/
├── 01-create-material.spec.ts       # Bước 1: Material master data
├── 02-create-po.spec.ts             # Bước 2: Production Order
├── 03-create-wo.spec.ts             # Bước 3: Work Order
├── 04-confirm-production.spec.ts    # Bước 4: Shop floor operations
├── 05-goods-receipt.spec.ts         # Bước 5: Goods Receipt & TECO
├── 06-logistics-flow.spec.ts        # Bước 6: Logistics (optional)
├── 07-verify-completion.spec.ts     # Bước 7: Verify & audit
│
├── full-flow.spec.ts                # 🔥 FULL FLOW - chạy tất cả 7 bước
├── full-flow-negative.spec.ts       # Test ràng buộc nghiệp vụ
└── sap-integration.spec.ts          # Test tích hợp SAP CPI
```

## Cách chạy

### Chạy từng bước riêng lẻ

```bash
# Bước 1: Material
npx playwright test tests/e2e-flows/01-create-material.spec.ts

# Bước 2: Production Order
npx playwright test tests/e2e-flows/02-create-po.spec.ts

# Bước 3: Work Order
npx playwright test tests/e2e-flows/03-create-wo.spec.ts

# Bước 4: Shop Floor
npx playwright test tests/e2e-flows/04-confirm-production.spec.ts

# Bước 5: Goods Receipt
npx playwright test tests/e2e-flows/05-goods-receipt.spec.ts

# Bước 6: Logistics
npx playwright test tests/e2e-flows/06-logistics-flow.spec.ts

# Bước 7: Verify
npx playwright test tests/e2e-flows/07-verify-completion.spec.ts
```

### Chạy Full Flow (tất cả 7 bước)

```bash
# Chạy toàn bộ luồng từ đầu đến cuối
npx playwright test tests/e2e-flows/full-flow.spec.ts

# Với UI mode
npx playwright test tests/e2e-flows/full-flow.spec.ts --ui

# Với headed mode (xem browser)
npx playwright test tests/e2e-flows/full-flow.spec.ts --headed
```

### Chạy Negative Tests

```bash
# Test ràng buộc nghiệp vụ
npx playwright test tests/e2e-flows/full-flow-negative.spec.ts
```

### Chạy SAP Integration Tests

```bash
# Test tích hợp SAP CPI
npx playwright test tests/e2e-flows/sap-integration.spec.ts
```

### Chạy tất cả E2E tests

```bash
# Chạy toàn bộ folder e2e-flows
npx playwright test tests/e2e-flows/
```

## Exported Functions

Mỗi file bước có **exported functions** để sử dụng trong full flow:

```typescript
// 01-create-material.spec.ts
export async function verifyMaterial(page)

// 02-create-po.spec.ts
export async function createProductionOrder(page)

// 03-create-wo.spec.ts
export async function createWorkOrder(page, poNumber)

// 04-confirm-production.spec.ts
export async function confirmProduction(page, woNumber)
export async function handoverProduct(page, woNumber)

// 05-goods-receipt.spec.ts
export async function createGoodsReceipt(page, woNumber)
export async function verifyTECO(page, poNumber)

// 06-logistics-flow.spec.ts
export async function performLogistics(page, woNumber)

// 07-verify-completion.spec.ts
export async function verifyCompletion(page, poNumber)
```

## Key Features

### 11 Ready Checks (GĐ 02)
Production Order phải pass 11 điều kiện kiểm tra trước khi release.

### 4-Key CheckList (GĐ 03)
Work Order requires 4-Key CheckList completion before proceeding.

### QR Code Scanning (GĐ 04, GĐ 06)
- Glass QR (0040 operation)
- Crate QR
- Product QR at installation site

### SAP Integration
- Material sync from SAP S/4HANA
- CPI Purchase Order API
- Material Document API (Goods Receipt)
- TECO synchronization

## Test Data

Test data được quản lý tại:
- `test-data/master.data.ts` - Master data + PO/WO ID generators
- `test-data/material.data.ts` - Material test data
- `test-data/bom.data.ts` - BOM test data
- `test-data/routing.data.ts` - Routing test data

## Notes

- Full flow timeout: 10 minutes (configurable)
- Each step can be run independently
- Logistics (GĐ 06) is optional for some flows
- All steps log to console for debugging

## TODO

Các bước cần implement:
1. ✅ Tạo cấu trúc files và folders
2. ⏳ Implement locators trong Page Objects
3. ⏳ Implement logic nghiệp vụ trong mỗi bước
4. ⏳ Implement 11 Ready Checks
5. ⏳ Implement 4-Key CheckList
6. ⏳ Implement QR code scanning
7. ⏳ Implement SAP integration verification
8. ⏳ Add test data
9. ⏳ Test và debug full flow
