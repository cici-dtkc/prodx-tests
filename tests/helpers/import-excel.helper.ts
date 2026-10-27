import * as fs from 'fs';
import * as path from 'path';
import ExcelJS from 'exceljs';

export const FILE_SAI = path.join(process.cwd(), 'tests', 'fixtures', 'file-sai-dinh-dang.txt');

  
export async function buildExcelFromTemplate(
  templatePath: string,
  outputPath: string,
  data: Record<string, unknown>,
): Promise<void> {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(templatePath);
  const sheet = workbook.worksheets[0];

  const columns = new Map<string, number>();
  sheet.getRow(1).eachCell((cell, colNumber) => columns.set(String(cell.value).trim(), colNumber));

  const row = sheet.addRow(new Array(sheet.columnCount).fill(null));
  for (const [header, value] of Object.entries(data)) {
    const colNumber = columns.get(header);
    if (colNumber !== undefined) {
      row.getCell(colNumber).value = value as ExcelJS.CellValue;
    }
  }

  await workbook.xlsx.writeFile(outputPath);
}
// Đọc header của file Excel
 
export async function readExcelHeaders(filePath: string): Promise<string[]> {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(filePath);
  const sheet = workbook.worksheets[0];
  const headers: string[] = [];
  sheet.getRow(1).eachCell((cell) => headers.push(String(cell.value).trim()));
  return headers;
}

 // Đọc nội dung file xuất ra (Excel hoặc CSV) và đếm số dòng dữ liệu (không tính header)
export async function readExportedFile(
  filePath: string,
): Promise<{ content: string; dataRowCount: number }> {
  if (/\.csv$/i.test(filePath)) {
    const content = fs.readFileSync(filePath, 'utf8');
    const dataRowCount = content.split(/\r?\n/).filter((d) => d.trim() !== '').length - 1;
    return { content, dataRowCount };
  }

  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(filePath);
  const sheet = workbook.worksheets[0];
  let content = '';
  sheet.eachRow((row) => {
    content += JSON.stringify(row.values) + '\n';
  });
  const dataRowCount = sheet.actualRowCount - 1;
  return { content, dataRowCount };
}
