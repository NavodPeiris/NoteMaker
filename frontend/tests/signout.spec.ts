import { test, expect } from 'playwright-test-coverage';

test('user can sign out after login', async ({ page }) => {
  await page.goto('http://localhost:5173/');

  // Login first
  await page.getByRole('button', { name: 'Login' }).click();
  await page.getByRole('textbox', { name: 'Email' }).fill('navod@gmail.com');
  await page.getByRole('textbox', { name: 'Password', exact: true }).fill('navod123');
  await page.getByRole('button', { name: 'Login' }).click();
  await expect(page).toHaveURL(/\/notes/);

  // Click the Sign Out button
  await page.getByRole('button', { name: 'Sign Out' }).click();

  // Assert redirect to home page and presence of Sign Up/Login buttons
  await expect(page).toHaveURL('http://localhost:5173/');
  await expect(page.getByRole('button', { name: 'Sign Up' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Login' })).toBeVisible();
});
