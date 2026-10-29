import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import { MasterCodeGroupPage } from '../pages/master-code-group.page';
import {
  IMPORT_CODE_GROUP_DATA,
  IMPORT_CODE_GROUP_EXCEL_DATA,
} from './data/master-code-group.data';
import {
  FILE_SAI,
  buildExcelFromTemplate,
  readExcelHeaders,
  readExportedFile,
} from './helpers/import-excel.helper';

test.describe('Master Code Group - Export / Import', () => {
  let mcg: MasterCodeGroupPage;

  test.beforeEach(async ({ page }) => {
    mcg = new MasterCodeGroupPage(page);
    await mcg.goto();
  });

  //  EXPORT 

  test('TC01 - Export: tải được file Excel/CSV, không rỗng', async ({}, testInfo) => {
    const download = await mcg.exportFile();
    const ten = download.suggestedFilename();
    expect(ten).toMatch(/\.(xlsx|xls|csv)$/i);

    const duongDan = testInfo.outputPath(ten);
    await download.saveAs(duongDan);
    expect(fs.statSync(duongDan).size).toBeGreaterThan(0);
  });

  test('TC02 - Export: nội dung file khớp với dữ liệu trên bảng', async ({}, testInfo) => {
    const maDau = (await mcg.dataRows.first().getByRole('cell').nth(1).innerText()).trim();

    const download = await mcg.exportFile();
    const ten = download.suggestedFilename();
    const duongDan = testInfo.outputPath(ten);
    await download.saveAs(duongDan);

    const { content } = await readExportedFile(duongDan);
    expect(content, `File xuất không chứa mã ${maDau}`).toContain(maDau);
  });

  //  IMPORT 

  test('TC03 - Import: bấm Import thì mở dialog có input file', async ({ page }) => {
    await mcg.importButton.click();
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible({ timeout: 5_000 });
    expect(await dialog.locator('input[type="file"]').count()).toBeGreaterThan(0);
  });

  test('TC04 - Import: file sai định dạng không tạo thêm dữ liệu', async () => {
    const truoc = await mcg.dataRows.count();

    await mcg.selectImportFile(FILE_SAI);
    await mcg.confirmImport();
    await mcg.closeImportDialog();

    await mcg.goto();
    expect(await mcg.dataRows.count()).toBe(truoc);
  });

  test('TC05 - Import: file hợp lệ thì dữ liệu xuất hiện trong danh sách', async ({}, testInfo) => {
    const templateDownload = await mcg.downloadImportTemplate();
    const templatePath = testInfo.outputPath('mcg-import-template.xlsx');
    await templateDownload.saveAs(templatePath);

    // Dùng codeGroup unique để tránh conflict với data cũ
    const codeGroup = `IM${Date.now().toString().slice(-6)}`;
    const fileHopLe = testInfo.outputPath('mcg-import.xlsx');
    await buildExcelFromTemplate(templatePath, fileHopLe, {
      ...IMPORT_CODE_GROUP_EXCEL_DATA,
      'Code Group *': codeGroup,
    });

    await mcg.selectImportFile(fileHopLe);
    await mcg.confirmImport();

    await mcg.searchByCodeGroup(codeGroup);
    await expect(mcg.rowOf(codeGroup)).toBeVisible();
    // Không xóa sau test vì hệ thống không hỗ trợ xóa Code Group
  });

  test('TC06 - Import: file thiếu cột bắt buộc không tạo được dữ liệu', async ({}, testInfo) => {
    const templateDownload = await mcg.downloadImportTemplate();
    const templatePath = testInfo.outputPath('mcg-import-template.xlsx');
    await templateDownload.saveAs(templatePath);

    // Chỉ điền Catalog Type, bỏ trống Code Group * và Short Text * (bắt buộc)
    const fileBatBuoc = testInfo.outputPath('mcg-import-missing-required.xlsx');
    await buildExcelFromTemplate(templatePath, fileBatBuoc, {
      'Catalog Type *': IMPORT_CODE_GROUP_EXCEL_DATA['Catalog Type *'],
    });

    const truoc = await mcg.dataRows.count();
    await mcg.selectImportFile(fileBatBuoc);
    // Click Import, sau đó đóng dialog (không quan tâm dialog tự đóng hay không)
    const dialog = mcg.page.getByRole('dialog');
    const importBtn = dialog.getByRole('button', { name: 'Import', exact: true });
    if (!(await importBtn.isDisabled())) {
      await importBtn.click();
    }
    await mcg.closeImportDialog();

    await mcg.goto();
    expect(await mcg.dataRows.count()).toBe(truoc);
  });

  test('TC07 - Import: tải được file template, không rỗng và có đúng các cột', async ({}, testInfo) => {
    const templateDownload = await mcg.downloadImportTemplate();
    const templatePath = testInfo.outputPath('mcg-import-template.xlsx');
    await templateDownload.saveAs(templatePath);

    expect(fs.statSync(templatePath).size).toBeGreaterThan(0);

    const headers = await readExcelHeaders(templatePath);
    expect(headers).toContain('Catalog Type *');
    expect(headers).toContain('Code Group *');
    expect(headers).toContain('Short Text');
  });
});
