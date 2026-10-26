import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';
import ExcelJS from 'exceljs';
import { InspectionSamplingPage } from '../pages/inspection-sampling.page';
import { IMPORT_SAMPLING_DATA } from './data/inspection-sampling.data';

const FILE_SAI = path.join(process.cwd(), 'tests', 'fixtures', 'file-sai-dinh-dang.txt');

test.describe('Inspection Sampling - Export / Import', () => {
  let sampling: InspectionSamplingPage;

  test.beforeEach(async ({ page }) => {
    sampling = new InspectionSamplingPage(page);
    await sampling.goto();
    await expect(sampling.cacDong.first()).toBeVisible();  
  });

  // EXPORT
  test('TC15 - Export: tải được file Excel/CSV, không rỗng', async ({}, testInfo) => {
    const download = await sampling.exportFile();

    const ten = download.suggestedFilename();
    expect(ten).toMatch(/\.(xlsx|xls|csv)$/i);

    const duongDan = testInfo.outputPath(ten);
    await download.saveAs(duongDan);
    expect(fs.statSync(duongDan).size).toBeGreaterThan(0);
  });

  test('TC16 - Export: nội dung file khớp với dữ liệu trên bảng', async ({}, testInfo) => {
    // Lấy mã của dòng đầu tiên và tổng số dòng đang hiển thị (cột 0 là ô tick, cột 1 là Sampling Procedure)
    const maDau = (await sampling.cacDong.first().getByRole('cell').nth(1).innerText()).trim();
    const tong = await sampling.cacDong.count();

    const download = await sampling.exportFile();
    const ten = download.suggestedFilename();
    const duongDan = testInfo.outputPath(ten);
    await download.saveAs(duongDan);

    let noiDung = '';
    let soDongDuLieu = 0; // không tính dòng tiêu đề

    if (/\.csv$/i.test(ten)) {
      noiDung = fs.readFileSync(duongDan, 'utf8');
      soDongDuLieu = noiDung.split(/\r?\n/).filter((d) => d.trim() !== '').length - 1;
    } else {
      
      const ExcelJS = require('exceljs');
      const wb = new ExcelJS.Workbook();
      await wb.xlsx.readFile(duongDan);
      const ws = wb.worksheets[0];
      ws.eachRow((dong: { values: unknown }) => {
        noiDung += JSON.stringify(dong.values) + '\n';
      });
      soDongDuLieu = ws.actualRowCount - 1;
    }

    expect(noiDung, `File xuất không chứa mã ${maDau}`).toContain(maDau);
    expect(soDongDuLieu, 'Số dòng trong file khác số dòng trên bảng').toBe(tong);
  });

  // IMPORT
  test('TC17 - Import: bấm Import thì cho phép chọn file', async ({ page }) => {
    const hopChonFile = page.waitForEvent('filechooser', { timeout: 3_000 }).catch(() => null);
    await sampling.importButton.click();
    const chooser = await hopChonFile;

    const coHopThoai = await page.getByRole('dialog').isVisible();
    const coOChonFile = (await page.locator('input[type="file"]').count()) > 0;
    expect(chooser !== null || coHopThoai || coOChonFile).toBeTruthy();
  });

  test('TC18 - Import: file sai định dạng không tạo thêm dữ liệu', async () => {
    const truoc = await sampling.cacDong.count();

    await sampling.selectImportFile(FILE_SAI);
    await sampling.confirmImport();

    // Tải lại trang 
    await sampling.goto();
    await expect(sampling.cacDong.first()).toBeVisible();
    await expect(sampling.cacDong).toHaveCount(truoc);
  });

  test('TC19 - Import: file hợp lệ thì dữ liệu xuất hiện trong danh sách', async ({}, testInfo) => {
    const templateDownload = await sampling.downloadImportTemplate();
    const templatePath = testInfo.outputPath('sampling-import-template.xlsx');
    await templateDownload.saveAs(templatePath);

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(templatePath);
    const sheet = workbook.worksheets[0];
    const columns = new Map<string, number>();
    sheet.getRow(1).eachCell((cell, column) => columns.set(String(cell.value).trim(), column));

    const row = sheet.addRow(new Array(sheet.columnCount).fill(null));
    row.getCell(columns.get('Sampling Procedure *')!).value = IMPORT_SAMPLING_DATA.code;
    row.getCell(columns.get('Short Text')!).value = IMPORT_SAMPLING_DATA.shortText;
    row.getCell(columns.get('Sampling Type')!).value = IMPORT_SAMPLING_DATA.type;
    row.getCell(columns.get('Sample Size')!).value = IMPORT_SAMPLING_DATA.sampleSize;
    const fileHopLe = testInfo.outputPath('sampling-import.xlsx');
    await workbook.xlsx.writeFile(fileHopLe);

    try {
      await sampling.selectImportFile(fileHopLe);
      await sampling.confirmImport();

      await sampling.goto();
      await expect(sampling.rowOf(IMPORT_SAMPLING_DATA.code)).toBeVisible();
    } finally {
      await sampling.deleteIfExists(IMPORT_SAMPLING_DATA.code); // dọn dữ liệu đã import
    }
  });
});