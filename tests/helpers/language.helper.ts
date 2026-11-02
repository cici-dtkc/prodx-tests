import { Page } from '@playwright/test';

 
export async function ensureEnglish(page: Page): Promise<void> {
  const enBtn = page.getByRole('button', { name: /^en$/i });

  try {
    await enBtn.waitFor({ state: 'visible', timeout: 10_000 });
  } catch {
    return; // Không có nút ngôn ngữ — bỏ qua
  }

  const isPressed = await enBtn.getAttribute('aria-pressed').catch(() => null);
  if (isPressed === 'true') return; // Đã EN rồi

  await enBtn.click();

  await page.waitForFunction(
    () => {
      const btns = Array.from(document.querySelectorAll('button'));
      const en = btns.find(b => /^en$/i.test(b.textContent?.trim() ?? ''));
      return en?.getAttribute('aria-pressed') === 'true';
    },
    { timeout: 8_000 },
  ).catch(() => null);

  await page.waitForFunction(
    () => !document.body.innerText.includes('Tất cả'),
    { timeout: 5_000 },
  ).catch(() => null);
}
