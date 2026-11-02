import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import { InspectionSelectedSetPage } from '../pages/inspection-selected-set.page';
import {
  FILE_SAI,
  buildExcelFromTemplate,
  buildExcelFromTemplateMultiSheet,
  readExcelHeaders,
  readExportedFile,
} from './helpers/import-excel.helper';

test.describe('Inspection Selected Set - Export / Import', () => {
  let iss: InspectionSelectedSetPage;

  test.beforeEach(async ({ page }) => {
    iss = new InspectionSelectedSetPage(page);
    await iss.goto();
  });

  //   EXPORT  

  test('TC01 - Export: tải được file Excel/CSV, không rỗng', async ({}, testInfo) => {
    const download = await iss.exportFile();
    const ten = download.suggestedFilename();
    expect(ten).toMatch(/\.(xlsx|xls|csv)$/i);

    const duongDan = testInfo.outputPath(ten);
    await download.saveAs(duongDan);
    expect(fs.statSync(duongDan).size).toBeGreaterThan(0);
  });

  test('TC02 - Export: nội dung file chứa dữ liệu trên bảng', async ({}, testInfo) => {
    const maDau = (await iss.dataRows.first().getByRole('cell').nth(1).innerText()).trim();

    const download = await iss.exportFile();
    const ten = download.suggestedFilename();
    const duongDan = testInfo.outputPath(ten);
    await download.saveAs(duongDan);

    const { content } = await readExportedFile(duongDan);
    expect(content, `File xuất không chứa mã ${maDau}`).toContain(maDau);
  });

  //   IMPORT  

  test('TC03 - Import: bấm Import thì mở dialog có input file', async ({ page }) => {
    await iss.importButton.click();
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible({ timeout: 5_000 });
    expect(await dialog.locator('input[type="file"]').count()).toBeGreaterThan(0);
  });

  test('TC04 - Import: file sai định dạng không tạo thêm dữ liệu', async () => {
    const truoc = await iss.dataRows.count();

    await iss.selectImportFile(FILE_SAI);
    await iss.confirmImport();
    await iss.closeImportDialog();

    await iss.goto();
    expect(await iss.dataRows.count()).toBe(truoc);
  });

  test('TC05 - Import: file hợp lệ thì dữ liệu xuất hiện trong danh sách', async ({}, testInfo) => {
    const templateDownload = await iss.downloadImportTemplate();
    const templatePath = testInfo.outputPath('iss-import-template.xlsx');
    await templateDownload.saveAs(templatePath);

    // Dùng Selected Set unique để tránh conflict
    const selectedSet = `IS${Date.now().toString().slice(-6)}`;
    const fileHopLe = testInfo.outputPath('iss-import.xlsx');
    await buildExcelFromTemplateMultiSheet(templatePath, fileHopLe, {
      'Selected Sets': [{
        'Catalog Type *': '1',
        'Selected Set *': selectedSet,
        'Short Text': 'Auto test selected set',
        'Status': 'Being Created',
      }],
      'Items': [{
        'Catalog Type *': '1',
        'Selected Set *': selectedSet,
        'Code Group *': 'BKTP0001',
        'Code *': '0001',
        'Valuation Code *': 'Accepted (OK)',
      }],
    });

    await iss.selectImportFile(fileHopLe);
    await iss.confirmImport();

    await iss.searchBySelectedSet(selectedSet);
    await expect(iss.rowOf(selectedSet)).toBeVisible();
    // Không xóa sau test — hệ thống không hỗ trợ xóa Selected Set
  });

  test('TC06 - Import: file thiếu cột bắt buộc không tạo được dữ liệu', async ({}, testInfo) => {
    const templateDownload = await iss.downloadImportTemplate();
    const templatePath = testInfo.outputPath('iss-import-template.xlsx');
    await templateDownload.saveAs(templatePath);

    // Chỉ điền Short Text, bỏ trống Catalog Type * và Selected Set * (bắt buộc)
    const fileBatBuoc = testInfo.outputPath('iss-import-missing-required.xlsx');
    await buildExcelFromTemplate(templatePath, fileBatBuoc, {
      'Short Text': 'Auto test selected set',
    });

    const truoc = await iss.dataRows.count();
    await iss.selectImportFile(fileBatBuoc);
    const dialog = iss.page.getByRole('dialog');
    const importBtn = dialog.getByRole('button', { name: 'Import', exact: true });
    if (!(await importBtn.isDisabled())) {
      await importBtn.click();
    }
    await iss.closeImportDialog();

    await iss.goto();
    expect(await iss.dataRows.count()).toBe(truoc);
  });

  test('TC07 - Import: tải được file template, không rỗng và có đúng các cột', async ({}, testInfo) => {
    const templateDownload = await iss.downloadImportTemplate();
    const templatePath = testInfo.outputPath('iss-import-template.xlsx');
    await templateDownload.saveAs(templatePath);

    expect(fs.statSync(templatePath).size).toBeGreaterThan(0);

    const headers = await readExcelHeaders(templatePath);
    expect(headers).toContain('Catalog Type *');
    expect(headers).toContain('Selected Set *');
  });
});
