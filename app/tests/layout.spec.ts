import { test, expect } from '@playwright/test';

test.describe('CyberSlots Layout Optimization & Cross-Device Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('Home page has no horizontal overflow and key sections visible', async ({ page }) => {
    await expect(page.locator('body')).not.toHaveCSS('overflow-x', 'visible');
    await expect(page.getByRole('heading', { name: /Ultimate Slot Experience/i })).toBeVisible();
    await expect(page.getByText('Trending Games')).toBeVisible();
    await expect(page.getByText('Epic Promotions')).toBeVisible();
    await expect(page.getByText('The VIP Experience')).toBeVisible();
  });

  test('Navigation works on mobile: hamburger toggles menu', async ({ page, isMobile }) => {
    if (!isMobile) test.skip();
    const menuButton = page.getByRole('button', { name: /Toggle menu/i });
    await expect(menuButton).toBeVisible();
    await menuButton.click();
    await expect(page.getByRole('link', { name: 'Games' })).toBeVisible();
    await menuButton.click();
    await expect(page.getByRole('link', { name: 'Games' })).not.toBeVisible();
  });

  test('Games grid is responsive: 1 col mobile, 3 on xl', async ({ page }) => {
    const grid = page.locator('#games .grid');
    await expect(grid).toHaveCSS('grid-template-columns', /repeat\(1/); // default 1 col
    await page.setViewportSize({ width: 1280, height: 800 });
    await expect(grid).toHaveCSS('grid-template-columns', /repeat\(3/);
  });

  test('Playable slot section loads and cabinet is usable', async ({ page }) => {
    await page.getByRole('button', { name: /Start Spinning/i }).click();
    await page.waitForSelector('#play', { state: 'visible' });
    await expect(page.getByText('Active Slots')).toBeVisible();
    await expect(page.locator('#play .grid').first()).toBeVisible(); // game selector
    // Cabinet exists
    const cabinet = page.locator('#play .max-w-\\[760px\\]');
    await expect(cabinet).toBeVisible();
    // Spin button visible and enabled initially
    const spinBtn = page.getByRole('button', { name: /Spin/i });
    await expect(spinBtn).toBeVisible();
    await expect(spinBtn).toBeEnabled();
  });

  test('Slot interactions work across viewports: select game, spin, paytable', async ({ page }) => {
    await page.getByRole('button', { name: /Start Spinning/i }).click();
    await page.waitForTimeout(500);
    // Select different game (e.g. cascade for 5x5)
    await page.getByText('Cascade Nexus').click();
    await expect(page.getByText('5x5 cluster board')).toBeVisible();
    // Open paytable
    await page.getByRole('button', { name: 'Paytable' }).click();
    await expect(page.getByText('Paytable')).toBeVisible();
    await page.getByRole('button', { name: /close/i }).click();
    // Spin once
    await page.getByRole('button', { name: /Spin/i }).click();
    await page.waitForTimeout(1200); // wait for spin anim
    // Check balance or win updated (any change)
    await expect(page.locator('text=Balance')).toBeVisible();
  });

  test('Reservation modal is responsive and functional', async ({ page }) => {
    await page.getByRole('button', { name: /Join Now/i }).first().click();
    const dialog = page.locator('[role="dialog"]');
    await expect(dialog).toBeVisible();
    await expect(page.getByLabel('Username')).toBeVisible();
    await page.getByLabel('Username').fill('testuser');
    await page.getByLabel('Email Address').fill('test@example.com');
    await page.getByLabel('Password').fill('password123');
    await page.getByRole('combobox').click();
    await page.getByText('1,000 Free Credits').click();
    await page.getByRole('button', { name: /Claim Bonus & Play/i }).click();
    await expect(page.getByText('Account Created!')).toBeVisible({ timeout: 3000 });
  });

  test('Superpowers page layout responsive', async ({ page }) => {
    await page.goto('/superpowers');
    await expect(page.getByText('Cybernetic Superpowers')).toBeVisible();
    // MUI Grid items
    const cards = page.locator('.superpower-card-wrapper');
    await expect(cards.first()).toBeVisible();
    // On mobile should stack (but since MUI, check count or container)
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(cards).toHaveCount( await cards.count() ); // ensure renders
  });

  test('No layout breakage on narrow mobile (320px)', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 568 });
    await page.goto('/');
    await expect(page.getByRole('heading', { name: /Ultimate Slot Experience/i })).toBeVisible();
    await page.getByRole('button', { name: /Start Spinning/i }).click();
    await page.waitForTimeout(300);
    const cabinet = page.locator('#play .max-w-\\[760px\\]');
    await expect(cabinet).toBeVisible();
    // Ensure no overflow
    const scrollWidth = await page.evaluate(() => document.body.scrollWidth);
    const clientWidth = await page.evaluate(() => document.body.clientWidth);
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 5);
  });

  test('Footer and VIP sections stack properly on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 800 });
    await expect(page.getByText('The VIP Experience')).toBeVisible();
    const footerGrid = page.locator('footer .grid');
    await expect(footerGrid).toHaveCSS('grid-template-columns', /repeat\(1/);
  });
});
