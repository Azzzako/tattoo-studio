import { test, expect } from '@playwright/test';

test('unauthorized user is redirected from admin', async ({ page }) => {
  await page.goto('/admin');
  await expect(page).toHaveURL(/\/login/);
});

test('unauthorized user is redirected from platform', async ({ page }) => {
  await page.goto('/platform');
  await expect(page).toHaveURL(/\/login/);
});

test('protected webhook requires shared secret', async ({ request }) => {
  const response = await request.get('/api/cron/reminders');
  expect(response.status()).toBe(401);
});
