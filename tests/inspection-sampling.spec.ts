import { test, expect } from '@playwright/test';
import { InspectionSamplingPage, SamplingData } from '../pages/inspection-sampling.page';

function taoDuLieu(): SamplingData {
  const so = Math.floor(Math.random() * 100000).toString().padStart(5, '0');
  return {
    code: `AT${so}`,
    shortText: `Auto test ${so}`,
    type: 'Fixed Sample',
    sampleSize: '5',
    longText: 'Dữ liệu tạo bởi auto test',
  };
}

test.describe('Inspection Sampling - CRUD', () => {
  let sampling: InspectionSamplingPage;

  test.beforeEach(async ({ page }) => {
    sampling = new InspectionSamplingPage(page);
    await sampling.goto();
  });

  // READ
  test('TC01 - Read: hiển thị trang danh sách đúng', async ({ page }) => {
    await expect(sampling.heading).toBeVisible();
    await expect(sampling.createButton).toBeVisible();
    await expect(page.getByRole('button', { name: 'Export' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Import' })).toBeVisible();

    for (const cot of ['Sampling Procedure', 'Short Text', 'Sampling Type', 'Sample Size']) {
      await expect(page.getByRole('columnheader', { name: new RegExp(cot) }).first()).toBeVisible();
    }
  });

  // CREATE
  test('TC02 - Create: tạo mới thành công', async () => {
    const data = taoDuLieu();
    try {
      await sampling.taoMoi(data);

      // Kiểm tra bản ghi mới có trong danh sách
      await sampling.goto();
      const row = sampling.rowOf(data.code);
      await expect(row).toBeVisible();
      await expect(row).toContainText(data.shortText);
      await expect(row).toContainText(data.type);
    } finally {
      await sampling.xoaNeuCo(data.code); // dọn dữ liệu
    }
  });

  test('TC03 - Create: bỏ trống Sampling Procedure thì không qua được bước 2', async ({ page }) => {
    await sampling.createButton.click();
    await sampling.continueButton.click();

    // Vẫn ở bước 1
    await expect(page.getByRole('heading', { name: /Step 1 of 2/ })).toBeVisible();
    await expect(page.getByRole('heading', { name: /Step 2 of 2/ })).toHaveCount(0);
  });

  // READ  
  test('TC04 - Read: xem chi tiết một bản ghi', async ({ page }) => {
    const data = taoDuLieu();
    try {
      await sampling.taoMoi(data);
      await sampling.goto();

      await sampling.xemChiTiet(data.code);
      await expect(page.getByRole('textbox', { name: /Sampling Procedure/i })).toHaveValue(data.code);
      await expect(page.getByRole('textbox', { name: /Short Text/i })).toHaveValue(data.shortText);
    } finally {
      await sampling.xoaNeuCo(data.code);
    }
  });

  // UPDATE
  test('TC05 - Update: sửa Short Text', async ({ page }) => {
    const data = taoDuLieu();
    const shortTextMoi = `${data.shortText} (đã sửa)`;
    try {
      await sampling.taoMoi(data);
      await sampling.goto();

      await sampling.moSua(data.code);
      await sampling.dienForm({ shortText: shortTextMoi });
      await sampling.luu();

      await sampling.goto();
      await expect(sampling.rowOf(data.code)).toContainText(shortTextMoi);
    } finally {
      await sampling.xoaNeuCo(data.code);
    }
  });

  // DELETE
  test('TC06 - Delete: xóa bản ghi', async () => {
    const data = taoDuLieu();
    await sampling.taoMoi(data);
    await sampling.goto();
    await expect(sampling.rowOf(data.code)).toBeVisible();

    await sampling.xoa(data.code); // đã kiểm tra dòng biến mất bên trong hàm xoa()

    // Tải lại trang  
    await sampling.goto();
    await expect(sampling.rowOf(data.code)).toHaveCount(0);
  });

  // FILTERS
  test('TC07 - Filter: mặc định cả 3 bộ lọc là All và Clear bị khóa', async () => {
    await expect(sampling.samplingProcedureFilter).toHaveText('All');
    await expect(sampling.samplingTypeFilter).toHaveText('All');
    await expect(sampling.createdByFilter).toHaveText('All');
    await expect(sampling.clearFiltersButton).toBeDisabled();
  });

  test.describe('TC08 - Filter theo Sampling Type', () => {
    for (const type of ['Fixed Sample', 'Percentage sample', '100% Inspection'] as const) {
      test(`lọc đúng các dòng ${type}`, async () => {
        await sampling.filterBy(sampling.samplingTypeFilter, type);

        const rows = sampling.dataRows;
        await expect(rows).not.toHaveCount(0);
        for (let index = 0; index < await rows.count(); index++) {
          await expect(rows.nth(index)).toContainText(type);
        }
      });
    }
  });

  test('TC09 - Filter: bộ đếm khớp số dòng sau khi lọc', async () => {
    await sampling.filterBy(sampling.samplingTypeFilter, 'Fixed Sample');
    const rowCount = await sampling.rowCount();
    await expect(await sampling.rowCounter()).toHaveText(`0 of ${rowCount} row(s) selected`);
  });

  test('TC10 - Filter: Sampling Procedure chỉ còn đúng một dòng', async () => {
    const firstRow = sampling.dataRows.first();
    const procedure = (await firstRow.getByRole('cell').nth(1).innerText()).trim();

    await sampling.filterBy(sampling.samplingProcedureFilter, procedure);

    await expect(sampling.dataRows).toHaveCount(1);
    await expect(sampling.dataRows.first()).toContainText(procedure);
  });

  test('TC11 - Filter: Created By', async () => {
    const [createdBy] = await sampling.createdByOptions();
    test.skip(!createdBy, 'Không có option Created By ngoài All trong dữ liệu hiện tại');

    await sampling.filterBy(sampling.createdByFilter, createdBy);
    await expect(sampling.dataRows).not.toHaveCount(0);
  });

  test('TC12 - Filter: kết hợp Sampling Type và Created By', async () => {
    const [createdBy] = await sampling.createdByOptions();
    test.skip(!createdBy, 'Không có option Created By ngoài All trong dữ liệu hiện tại');

    await sampling.filterBy(sampling.samplingTypeFilter, 'Fixed Sample');
    await sampling.filterBy(sampling.createdByFilter, createdBy);

    const rows = sampling.dataRows;
    await expect(rows).not.toHaveCount(0);
    for (let index = 0; index < await rows.count(); index++) {
      await expect(rows.nth(index)).toContainText('Fixed Sample');
    }
  });

  test('TC13 - Filter: Clear khôi phục dữ liệu và cả 3 bộ lọc về All', async () => {
    const initialCount = await sampling.rowCount();
    await sampling.filterBy(sampling.samplingTypeFilter, 'Fixed Sample');
    await expect(sampling.clearFiltersButton).toBeEnabled();

    await sampling.clearFiltersButton.click();

    await expect(sampling.dataRows).toHaveCount(initialCount);
    await expect(sampling.samplingProcedureFilter).toHaveText('All');
    await expect(sampling.samplingTypeFilter).toHaveText('All');
    await expect(sampling.createdByFilter).toHaveText('All');
    await expect(sampling.clearFiltersButton).toBeDisabled();
  });

  test('TC14 - Filter: Hide filters ẩn và hiện lại khu vực lọc', async () => {
    await expect(sampling.samplingProcedureFilter).toBeVisible();

    await sampling.hideFiltersButton.click();
    await expect(sampling.samplingProcedureFilter).toBeHidden();
    await expect(sampling.showFiltersButton).toBeVisible();

    await sampling.showFiltersButton.click();
    await expect(sampling.samplingProcedureFilter).toBeVisible();
  });
});