# ProdX E2E Tests - Project Structure

## Tổng quan cấu trúc

```
prodx-tests/
├── .env                                 # Environment variables
├── playwright.config.ts                 # Playwright configuration
├── package.json
├── tsconfig.json
│
├── test-data/                          # Test data & generators
│   ├── master.data.ts                  # PO/WO ID generators (10 digits)
│   ├── material.data.ts
│   ├── bom.data.ts
│   └── routing.data.ts
│
├── pages/                              # Page Object Model - 7 Giai đoạn
│   ├── 01-master-data/
│   │   ├── material.page.ts
│   │   ├── bom.page.ts
│   │   └── routing.page.ts
│   │
│   ├── 02-production-order/
│   │   └── production-order.page.ts    # 11 Ready Checks
│   │
│   ├── 03-work-order/
│   │   └── work-order.page.ts          # 4-Key CheckList, Split
│   │
│   ├── 04-shop-floor/
│   │   ├── confirm-list.page.ts        # Confirm Time (0040 Glass)
│   │   └── handover.page.ts            # QR Scan
│   │
│   ├── 05-goods-receipt/
│   │   └── goods-receipt.page.ts       # GR, TECO
│   │
│   ├── 06-logistics/
│   │   ├── crating.page.ts             # QR Scan
│   │   ├── shipment.page.ts            # Sea/Air/Road
│   │   └── installation.page.ts        # Site installation
│   │
│   └── 07-analytics/
│       └── audit-log.page.ts           # Gantt, Audit log
│
├── tests/
│   ├── auth.setup.ts                   # Login once, save session
│   │
│   ├── helpers/
│   │   ├── import-excel.helper.ts
│   │   ├── language.helper.ts
│   │   ├── ready-check.helper.ts       # 11 Ready Checks logic
│   │   ├── qr-code.helper.ts           # QR generation & scan
│   │   └── sap-integration.helper.ts   # SAP CPI verification
│   │
│   ├── data/                           # Legacy test data
│   │   └── ...
│   │
│   ├── fixtures/
│   │   └── file-sai-dinh-dang.txt
│   │
│   ├── 01-master-data/                 # GĐ 01: Master Data Tests
│   │   ├── material.spec.ts
│   │   ├── material-sync-sap.spec.ts
│   │   ├── bom.spec.ts
│   │   └── routing.spec.ts
│   │
│   ├── 02-production-order/            # GĐ 02: Production Order Tests
│   │   ├── po-create.spec.ts
│   │   ├── po-ready-check.spec.ts      # 11 Ready Checks
│   │   └── po-batch.spec.ts
│   │
│   ├── 03-work-order/                  # GĐ 03: Work Order Tests
│   │   ├── wo-create.spec.ts
│   │   ├── wo-split.spec.ts
│   │   └── wo-checklist.spec.ts        # 4-Key CheckList
│   │
│   ├── 04-shop-floor/                  # GĐ 04: Shop Floor Tests
│   │   ├── confirm-time.spec.ts
│   │   ├── handover.spec.ts
│   │   └── glass-scan.spec.ts          # 0040 Glass operation
│   │
│   ├── 05-goods-receipt/               # GĐ 05: Goods Receipt Tests
│   │   ├── gr-create.spec.ts
│   │   ├── gr-finish-wo.spec.ts
│   │   └── gr-teco.spec.ts             # SAP TECO
│   │
│   ├── 06-logistics/                   # GĐ 06: Logistics Tests
│   │   ├── crating.spec.ts
│   │   ├── shipment.spec.ts
│   │   └── installation.spec.ts
│   │
│   ├── 07-analytics/                   # GĐ 07: Analytics Tests
│   │   ├── gantt.spec.ts
│   │   ├── statistics.spec.ts
│   │   └── audit-log.spec.ts
│   │
│   ├── e2e-flows/                      # 🔥 END-TO-END FLOWS
│   │   ├── README.md                   # Hướng dẫn chi tiết
│   │   ├── 01-create-material.spec.ts
│   │   ├── 02-create-po.spec.ts
│   │   ├── 03-create-wo.spec.ts
│   │   ├── 04-confirm-production.spec.ts
│   │   ├── 05-goods-receipt.spec.ts
│   │   ├── 06-logistics-flow.spec.ts
│   │   ├── 07-verify-completion.spec.ts
│   │   ├── full-flow.spec.ts           # Full 7-stage flow
│   │   ├── full-flow-negative.spec.ts  # Business constraints
│   │   └── sap-integration.spec.ts     # SAP CPI integration
│   │
│   └── [Legacy QM Module Tests]        # Existing inspection tests
│       ├── inspection-lot.spec.ts
│       ├── inspection-sampling.spec.ts
│       └── ...
│
└── [Generated folders]
    ├── playwright-report-*/
    └── test-results-*/
```

## Luồng 7 Giai đoạn

```
┌─────────────────────────────────────────────────────────────────┐
│                  PRODX MES E2E FLOW (7 Stages)                  │
└─────────────────────────────────────────────────────────────────┘

GĐ 01: Master Data
  ↓ Material, BOM, Routing (sync from SAP)
  
GĐ 02: Production Order
  ↓ Create PO → 11 Ready Checks → Batch
  
GĐ 03: Work Order  
  ↓ Create WO (10-digit ID) → 4-Key CheckList → Split
  
GĐ 04: Shop Floor
  ↓ Confirm Time (0040 Glass) → Handover → QR Scan
  
GĐ 05: Goods Receipt
  ↓ Create GR → Finish WO → TECO → SAP Material Document API
  
GĐ 06: Logistics (optional)
  ↓ Crating → Shipment (Sea/Air/Road) → Installation (Site)
  
GĐ 07: Analytics & Verification
  ↓ Audit Log → Gantt Chart → Statistics Report
```

## Cách chạy test

### Chạy theo module/giai đoạn
```bash
# Chạy tất cả tests của giai đoạn 2
npx playwright test tests/02-production-order/

# Chạy tất cả tests của giai đoạn 4
npx playwright test tests/04-shop-floor/
```

### Chạy E2E Full Flow
```bash
# Chạy full flow (7 giai đoạn liên hoàn)
npx playwright test tests/e2e-flows/full-flow.spec.ts

# Chạy từng bước riêng lẻ
npx playwright test tests/e2e-flows/01-create-material.spec.ts
npx playwright test tests/e2e-flows/02-create-po.spec.ts
# ...

# Chạy negative tests
npx playwright test tests/e2e-flows/full-flow-negative.spec.ts

# Chạy SAP integration tests
npx playwright test tests/e2e-flows/sap-integration.spec.ts
```

### Chạy tất cả
```bash
# Chạy tất cả tests trong project
npx playwright test

# Chỉ chạy e2e-flows
npx playwright test tests/e2e-flows/
```

## Key Features

### Tính năng chính

1. **Modular Structure**: Mỗi giai đoạn có folder riêng
2. **Reusable Functions**: Exported functions để dùng trong full flow
3. **Independent & Combined**: Có thể chạy riêng lẻ hoặc kết hợp
4. **Page Object Model**: Tách biệt logic nghiệp vụ và locators
5. **Test Data Management**: Centralized test data với ID generators
6. **Helper Functions**: Tái sử dụng logic chung (Ready Checks, QR, SAP)

### Điểm nổi bật

- ✅ **11 Ready Checks** (GĐ 02): Validation trước khi release PO
- ✅ **4-Key CheckList** (GĐ 03): Checklist bắt buộc cho WO
- ✅ **10-digit WO ID**: Sinh số WO duy nhất từ 1000000000
- ✅ **QR Code**: Glass scan (0040), Crate scan, Site installation
- ✅ **SAP Integration**: Material sync, CPI API, Material Document, TECO
- ✅ **Full Audit Trail**: Track toàn bộ 7 giai đoạn trong audit log

## Next Steps

1. ✅ Đã tạo cấu trúc folders và files
2. ⏳ Implement locators trong Page Objects
3. ⏳ Implement business logic trong từng test
4. ⏳ Add real test data
5. ⏳ Configure .env cho môi trường test
6. ⏳ Test và debug

## Notes

- Tất cả files hiện tại là **placeholder** với TODO comments
- Code logic sẽ được implement sau khi có:
  - URL của môi trường test
  - Credentials
  - Actual locators từ UI
  - Business rules chi tiết
