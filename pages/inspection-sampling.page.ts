import { Page, Locator, expect } from '@playwright/test';

export type SamplingType = 'Fixed Sample' | 'Percentage sample' | '100% Inspection';

export interface SamplingData {
  code: string;               
  shortText: string;          
  type: SamplingType;          
  sampleSize: string;         
  acceptanceNumber?: string;   
  minSampleSize?: string;      
  longText?: string;           
}


export class InspectionSamplingPage {
  private readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  //  Selector 
  get heading(): Locator {
    return this.page.getByRole('heading', { name: /^Inspection Sampling/ });
  }
  get createButton(): Locator {
    return this.page.getByRole('button', { name: 'Create', exact: true });
  }
  get continueButton(): Locator {
    return this.page.getByRole('button', { name: 'Continue', exact: true });
  }
  get saveButton(): Locator {
    return this.page.getByRole('button', { name: 'Save', exact: true });
  }
  get samplingProcedureFilter(): Locator {
    return this.page.getByRole('combobox', { name: 'Sampling Procedure', exact: true });
  }
  get samplingTypeFilter(): Locator {
    return this.page.getByRole('combobox', { name: 'Sampling Type', exact: true });
  }
  get createdByFilter(): Locator {
    return this.page.getByRole('combobox', { name: 'Created By', exact: true });
  }
  get clearFiltersButton(): Locator {
    return this.page.getByRole('button', { name: /^Clear(?: \(\d+\))?$/ });
  }
  get hideFiltersButton(): Locator {
    return this.page.getByRole('button', { name: 'Hide filters', exact: true });
  }
  get showFiltersButton(): Locator {
    return this.page.getByRole('button', { name: 'Show filters', exact: true });
  }
  get exportButton(): Locator {
    return this.page.getByRole('button', { name: 'Export', exact: true });
  }
  get importButton(): Locator {
    return this.page.getByRole('button', { name: 'Import', exact: true });
  }
  get cacDong(): Locator {
    return this.dataRows;
  }

  // Dòng trong bảng có chứa mã  
  rowOf(code: string): Locator {
    return this.page.getByRole('row').filter({ hasText: code });
  }

  get dataRows(): Locator {
    return this.page.locator('tbody tr');
  }

  async rowCount(): Promise<number> {
    return this.dataRows.count();
  }

  async xuatFile() {
    const downloadPromise = this.page.waitForEvent('download');
    await this.exportButton.click();
    return downloadPromise;
  }

  async chonFileImport(filePath: string) {
    const input = this.page.locator('input[type="file"]').first();
    if (await input.count()) {
      await input.setInputFiles(filePath);
      return;
    }

    await this.importButton.click();
    const dialogInput = this.page.locator('input[type="file"]').first();
    await expect(dialogInput).toBeAttached();
    await dialogInput.setInputFiles(filePath);
  }

  async xacNhanImport() {
    const confirm = this.page.getByRole('dialog').or(this.page.getByRole('alertdialog'));
    if (await confirm.count() && await confirm.first().isVisible()) {
      const button = confirm.first().getByRole('button', { name: /import|upload|confirm|yes|xác nhận/i });
      if (await button.isEnabled()) {
        await button.click();
      }
    }
    await this.page.waitForTimeout(500);
  }

  async taiTemplateImport() {
    await this.importButton.click();
    const downloadPromise = this.page.waitForEvent('download');
    await this.page.getByRole('button', { name: /Download template/i }).click();
    return downloadPromise;
  }

  async filterBy(filter: Locator, value: string) {
    await filter.click();
    await this.page.getByRole('option', { name: new RegExp(value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i') }).click();
    await expect(filter).toContainText(value);
  }

  async createdByOptions(): Promise<string[]> {
    await this.createdByFilter.click();
    const options = await this.page.getByRole('option').allTextContents();
    await this.page.keyboard.press('Escape');
    return options.map((option) => option.trim()).filter((option) => option && !/^All$/i.test(option));
  }

  async rowCounter(): Promise<Locator> {
    return this.page.getByText(/\d+\s+of\s+\d+\s+row\(s\)\s+selected/i);
  }

  // Cột Actions là ô cuối của dòng: 3 icon theo thứ tự xem (mắt), sửa (bút), xóa (thùng rác)
  private actionOf(code: string, index: 0 | 1 | 2): Locator {
    return this.rowOf(code).getByRole('cell').last().locator('button, a').nth(index);
  }

  //  Điều hướng 
  async goto() {
    for (let lan = 1; lan <= 2; lan++) {
      try {
        await this.page.goto('/qm/inspection-sampling', { waitUntil: 'domcontentloaded' });
        break;
      } catch (loi) {
        if (lan === 2 || !String(loi).includes('ERR_ABORTED')) throw loi;
      }
    }
    await expect(this.heading).toBeVisible(); // chờ tiêu đề xuất hiện mới coi là trang đã sẵn sàng
  }

  //  Create  
  async taoMoi(data: SamplingData) {
    await this.createButton.click();

    // Bước 1: nhập mã Sampling Procedure
    await expect(this.page.getByRole('heading', { name: /Step 1 of 2/ })).toBeVisible();
    await this.page.getByLabel('Sampling Procedure').fill(data.code);
    await this.continueButton.click();

    // Bước 2: nhập các thông tin còn lại
    await expect(this.page.getByRole('heading', { name: /Step 2 of 2/ })).toBeVisible();
    await expect(this.page.getByLabel('Sampling Procedure')).toHaveValue(data.code); // mã được mang sang từ bước 1
    await this.dienForm(data);
    await this.luu();
  }

  async luu() {
    await this.saveButton.click();

    const confirmation = this.page.getByRole('alertdialog').filter({ hasText: /Save changes/i });
    await expect(confirmation).toBeVisible();

    const [res] = await Promise.all([
      this.page.waitForResponse((r) => ['POST', 'PUT', 'PATCH'].includes(r.request().method()), {
        timeout: 10_000, 
      }),
      confirmation.getByRole('button', { name: 'Save', exact: true }).click(),
    ]);
    expect(
      res.ok(),
      `Lưu thất bại: ${res.status()} ${res.url()}\n${await res.text()}`,
    ).toBeTruthy();
  }

  async dienForm(data: Partial<SamplingData>) {
    if (data.shortText !== undefined) {
      await this.page.getByLabel('Short Text').fill(data.shortText);
    }
    if (data.type !== undefined) {
      await this.chonSamplingType(data.type);
    }
    if (data.sampleSize !== undefined) {
      await this.page.getByLabel(/^Sample Size/).fill(data.sampleSize);
    }
    if (data.acceptanceNumber !== undefined) {
      await this.page.getByLabel('Acceptance Number').fill(data.acceptanceNumber);
    }
    if (data.minSampleSize !== undefined) {
      await this.page.getByLabel(/^Minimum Sample Size/).fill(data.minSampleSize);
    }
    if (data.longText !== undefined) {
      await this.page.getByLabel('Long Text').fill(data.longText);
    }
  }


  private async chonSamplingType(type: SamplingType) {
    await this.page.getByRole('combobox', { name: /Sampling Type/ }).click();
    await this.page.getByRole('option', { name: type }).click();
  }

  //  Read 
  async xemChiTiet(code: string) {
    await this.actionOf(code, 0).click();
  }

  //  Update 
  async moSua(code: string) {
    await this.actionOf(code, 1).click();
  }

  //  Delete 
  async xoa(code: string) {
    await this.actionOf(code, 2).click();
    const dialog = this.page.getByRole('alertdialog').or(this.page.getByRole('dialog'));
    await dialog.getByRole('button', { name: /delete|confirm|yes|xóa|xác nhận/i }).click();
    await expect(this.rowOf(code)).toHaveCount(0);
  }
// dọn dữ liệu test
  async xoaNeuCo(code: string) {
    try {
      await this.goto();
      if ((await this.rowOf(code).count()) > 0) {
        await this.xoa(code);
      }
    } catch (loi) {
      console.warn(`Không dọn được dữ liệu test ${code}:`, loi);
    }
  }
}