import { test, expect } from 'playwright-test-coverage';

test('user can login with valid credentials', async ({ page }) => {
  await page.goto('http://localhost:5173/');

  // Click Login button on home page
  await page.getByRole('button', { name: 'Login' }).click();

  // Fill the login form
  await page.getByRole('textbox', { name: 'Email' }).fill('navod@gmail.com');
  await page.getByRole('textbox', { name: 'Password', exact: true }).fill('navod123');

  // Submit the form
  await page.getByRole('button', { name: 'Login' }).click();

  // Assert redirect to /notes and presence of Sign Out button
  await expect(page).toHaveURL(/\/notes/);
  await expect(page.getByRole('button', { name: 'Sign Out' })).toBeVisible();
  await expect(page.getByText('Note Maker', { exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Add Note' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Add Group' })).toBeVisible();
});
