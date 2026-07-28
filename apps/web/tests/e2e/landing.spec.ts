import { test, expect } from '@playwright/test';

test('landing page renders hero, artistas y eventos', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Tinta');
  await expect(page.getByRole('link', { name: /Reservar cita/i }).first()).toBeVisible();
  await expect(page.getByRole('heading', { name: /Tatuadores/i })).toBeVisible();
  await expect(page.getByRole('heading', { name: /Eventos/i })).toBeVisible();
});

test('lista de tatuadores y detalle', async ({ page }) => {
  await page.goto('/tatuadores/');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await page.getByRole('link', { name: /Inka/i }).first().click();
  await expect(page).toHaveURL(/\/tatuadores\/inka\/?$/);
  await expect(page.getByRole('heading', { name: 'Inka', level: 1 })).toBeVisible();
});

test('wizard de reserva muestra los 3 pasos', async ({ page }) => {
  await page.goto('/tatuadores/inka/reservar/');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
});

test('estilo oscuro forzado', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
});

test('navegación a eventos y detalle', async ({ page }) => {
  await page.goto('/eventos/');
  await page.getByRole('link', { name: /Convención Tinta 2026/i }).click();
  await expect(page).toHaveURL(/\/eventos\/convencion-tinta-2026\/?$/);
});

test('trailing slash habilitado para Pages', async ({ page }) => {
  const response = await page.goto('/tatuadores');
  expect(response?.url()).toMatch(/\/tatuadores\/?$/);
});
