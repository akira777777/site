const { test, expect } = require('@playwright/test');

test('landing smoke', async ({ page }) => {
  await page.setViewportSize({ width: 1366, height: 900 });
  await page.goto('http://localhost:3000/', { waitUntil: 'networkidle' });
  await page.evaluate(() => localStorage.setItem('casino_credits', '1000'));

  await expect(page.getByRole('heading', { name: 'Cyber Slots' })).toBeVisible();
  await page.getByRole('button', { name: 'Play Demo' }).click();
  await expect(page.getByText('SPIN TO WIN!')).toBeVisible({ timeout: 15000 });
  await page.getByRole('button', { name: 'Spin reels' }).click();
  await expect(page.getByText('SPINNING...')).toBeVisible({ timeout: 5000 });
  await page.getByRole('button', { name: 'Show paytable' }).click();
  await expect(page.getByText('Paytable')).toBeVisible();
  await page.getByRole('button', { name: 'Close paytable' }).click();

  await page.getByRole('link', { name: 'Rankings' }).click();
  await expect(page.getByText('Hall of Fame')).toBeVisible({ timeout: 15000 });

  await page.setViewportSize({ width: 390, height: 840 });
  await page.reload({ waitUntil: 'networkidle' });
  await page.getByRole('button', { name: 'Toggle menu' }).click();
  await expect(page.getByRole('link', { name: 'Games' })).toBeVisible();
});
