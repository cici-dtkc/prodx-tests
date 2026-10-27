import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import { MaterialInspectionAssignmentPage } from '../pages/material-inspection-assignment.page';
import { IMPORT_ASSIGNMENT_DATA, IMPORT_ASSIGNMENT_EXCEL_DATA } from './data/material-inspection-assignment.data';
import {
  FILE_SAI,
  buildExcelFromTemplate,
  readExcelHeaders,
} from './helpers/import-excel.helper';

test.describe('Material Inspection Assignment - Import', () => {
  let assignment: MaterialInspectionAssignmentPage;

  test.beforeEach(async ({ page }) => {
    assignment = new MaterialInspectionAssignmentPage(page);
    await assignment.goto();
  });

  test('TC01 - Import: bấm Import thì cho phép chọn file', async ({ page }) => {
    await assignment.importButton.click();
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible({ timeout: 5_000 });
    const coOChonFile = (await dialog.locator('input[type="file"]').count()) > 0;
    expect(coOChonFile).toBeTruthy();
  });

  test('TC02 - Import: file sai định dạng không tạo thêm dữ liệu', async () => {
    const truoc = await assignment.dataRows.count();

    await assignment.selectImportFile(FILE_SAI);
    await assignment.confirmImport();
    await assignment.closeImportDialog();

    await assignment.goto();
    const sau = await assignment.dataRows.count();
    expect(sau).toBe(truoc);
  });

  test('TC03 - Import: file hợp lệ thì dữ liệu xuất hiện trong danh sách', async ({}, testInfo) => {
    const templateDownload = await assignment.downloadImportTemplate();
    const templatePath = testInfo.outputPath('assignment-import-template.xlsx');
    await templateDownload.saveAs(templatePath);

    const fileHopLe = testInfo.outputPath('assignment-import.xlsx');
    await buildExcelFromTemplate(templatePath, fileHopLe, {
      'Inspection Type *': IMPORT_ASSIGNMENT_EXCEL_DATA.inspectionType,
      'Material *': IMPORT_ASSIGNMENT_EXCEL_DATA.material,
      'Frequency': IMPORT_ASSIGNMENT_EXCEL_DATA.frequency,
      'Unit': IMPORT_ASSIGNMENT_EXCEL_DATA.unit,
    });

    try {
      await assignment.selectImportFile(fileHopLe);
      await assignment.confirmImport();

      await assignment.goto();
      await expect(assignment.rowOf(IMPORT_ASSIGNMENT_DATA)).toBeVisible();
    } finally {
      await assignment.deleteIfExists(IMPORT_ASSIGNMENT_DATA);
    }
  });

  test('TC04 - Import: file thiếu cột bắt buộc không tạo được dữ liệu', async ({}, testInfo) => {
    const templateDownload = await assignment.downloadImportTemplate();
    const templatePath = testInfo.outputPath('assignment-import-template.xlsx');
    await templateDownload.saveAs(templatePath);

    // Chỉ điền Material *, bỏ trống Inspection Type *  
    const fileBatBuoc = testInfo.outputPath('assignment-import-missing-required.xlsx');
    await buildExcelFromTemplate(templatePath, fileBatBuoc, {
      'Material *': IMPORT_ASSIGNMENT_EXCEL_DATA.material,
    });

    const truoc = await assignment.dataRows.count();
    await assignment.selectImportFile(fileBatBuoc);
    await assignment.confirmImport();

    // Dialog có thể còn mở (hiển thị lỗi) — đóng lại trước khi kiểm tra danh sách
    await assignment.closeImportDialog();

    await assignment.goto();
    const sau = await assignment.dataRows.count();
    expect(sau).toBe(truoc);
  });

  test('TC05 - Import: tải được file template, không rỗng và có đúng các cột', async ({}, testInfo) => {
    const templateDownload = await assignment.downloadImportTemplate();
    const templatePath = testInfo.outputPath('assignment-import-template.xlsx');
    await templateDownload.saveAs(templatePath);

    expect(fs.statSync(templatePath).size).toBeGreaterThan(0);

    const headers = await readExcelHeaders(templatePath);
    expect(headers).toContain('Inspection Type *');
    expect(headers).toContain('Material *');
  });
});
