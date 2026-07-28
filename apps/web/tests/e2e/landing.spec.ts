import { test, expect } from '@playwright/test';

test('landing page renders key sections', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Ver tatuadores' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Próximos eventos' })).toBeVisible();
});

test('artists listing links to detail', async ({ page }) => {
  await page.goto('/tatuadores');
  await expect(page.getByRole('heading', { level: 1, name: 'Tatuadores' })).toBeVisible();
  await page.getByRole('link', { name: /Inka/ }).click();
  await expect(page).toHaveURL(/\/tatuadores\/inka$/);
});

test('login page shows magic-link form', async ({ page }) => {
  await page.goto('/login');
  await expect(page.getByLabel('Correo')).toBeVisible();
  await expect(page.getByRole('button', { name: /Enviar enlace/ })).toBeVisible();
});

test('admin routes redirect to login when anonymous', async ({ page }) => {
  const response = await page.goto('/admin');
  expect(response?.url()).toMatch(/\/login/);
});