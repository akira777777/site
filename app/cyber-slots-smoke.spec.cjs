const { test, expect } = require('@playwright/test');

const slotNames = ['Egypt Fire Demo', 'Neon Reels', 'Cascade Nexus', 'Vault Lock'];

async function openPlayableSlots(page) {
  await page.setViewportSize({ width: 1366, height: 900 });
  await page.goto('http://localhost:3000/', { waitUntil: 'networkidle' });
  await page.evaluate(() => {
    localStorage.setItem('casino_credits', '1000');
    localStorage.removeItem('casino_bonus_state');
    localStorage.removeItem('casino_active_slot');
  });
  await page.reload({ waitUntil: 'networkidle' });
  await page.getByRole('button', { name: /start spinning/i }).click();

  const play = page.locator('section#play');
  await expect(play.getByRole('heading', { name: /active slots/i })).toBeVisible({ timeout: 15000 });
  return play;
}

test('landing slots smoke', async ({ page }) => {
  const consoleErrors = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });
  page.on('pageerror', (error) => consoleErrors.push(error.message));

  const play = await openPlayableSlots(page);

  for (const slotName of slotNames) {
    await play.getByRole('button', { name: new RegExp(slotName, 'i') }).click();
    await play.getByRole('button', { name: /paytable/i }).click();
    await expect(play.getByRole('heading', { name: new RegExp(`${slotName} Paytable`, 'i') })).toBeVisible();
    await play.getByRole('button', { name: /close paytable/i }).click();
    await play.getByRole('button', { name: /^spin$|^ticket/i }).click();
    await expect(play.getByTestId('slot-message')).not.toContainText(/spinning/i, { timeout: 5000 });
  }

  await play.getByRole('button', { name: /auto spin/i }).click();
  await expect(play.getByRole('button', { name: /^stop$/i })).toBeVisible();
  await play.getByRole('button', { name: /^stop$/i }).click();
  await expect(play.getByRole('button', { name: /auto spin/i })).toBeVisible();

  await play.getByRole('button', { name: /reset demo/i }).click();
  await expect.poll(() => page.evaluate(() => localStorage.getItem('casino_credits'))).toBe('1000');

  await page.getByRole('button', { name: /view jackpots/i }).click();
  await expect(page.getByRole('heading', { name: /hall of fame/i })).toBeVisible({ timeout: 15000 });

  await page.setViewportSize({ width: 390, height: 840 });
  await page.goto('http://localhost:3000/', { waitUntil: 'networkidle' });
  await page.getByRole('button', { name: /toggle menu/i }).click();
  await page.getByRole('link', { name: /games/i }).click();
  await expect(page.locator('#games')).toBeVisible();

  expect(consoleErrors).toEqual([]);
});

test('hold respins stay isolated between Egypt and Vault', async ({ page }) => {
  const play = await openPlayableSlots(page);

  await page.evaluate(() => {
    localStorage.setItem('casino_bonus_state', JSON.stringify({
      mystery: 0,
      freeSpinTickets: 0,
      multiplierPasses: 0,
      streak: 0,
      activeBoost: 1,
      holdRespinsByGame: { egypt: 3, vault: 0 },
    }));
    window.dispatchEvent(new CustomEvent('casino:bonus-awarded'));
  });

  await play.getByRole('button', { name: /egypt fire demo/i }).click();
  await expect(play.getByTestId('bonus-stat-hold-respins')).toContainText('3');

  await play.getByRole('button', { name: /vault lock/i }).click();
  await expect(play.getByTestId('bonus-stat-hold-respins')).toContainText('0');

  await play.getByRole('button', { name: /egypt fire demo/i }).click();
  await expect(play.getByTestId('bonus-stat-hold-respins')).toContainText('3');

  await play.getByRole('button', { name: /reset demo/i }).click();
  await expect.poll(() => page.evaluate(() => {
    const saved = JSON.parse(localStorage.getItem('casino_bonus_state') || '{}');
    return `${saved.holdRespinsByGame?.egypt ?? -1}:${saved.holdRespinsByGame?.vault ?? -1}`;
  })).toBe('0:0');
});
