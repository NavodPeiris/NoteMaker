import { test, expect } from 'playwright-test-coverage';

test('user can select a note and generate a summary', async ({ page }) => {
  await page.goto('http://localhost:5173/');

  // Login first
  await page.getByRole('button', { name: 'Login' }).click();
  await page.getByRole('textbox', { name: 'Email' }).fill('navod@gmail.com');
  await page.getByRole('textbox', { name: 'Password', exact: true }).fill('navod123');
  await page.getByRole('button', { name: 'Login' }).click();
  await expect(page).toHaveURL(/\/notes/);

  // Select the first listed note (by title)
  const firstNote = page.locator('[class*=cursor-pointer]').first();
  await firstNote.click();

  // Click the button to open the summary dialog
  const summaryButton = page.getByRole('button', { name: /genrate summary/i });
  await summaryButton.click();

  // Assert that the summary dialog heading appears
  await expect(page.getByRole('heading', { name: 'Summary' })).toBeVisible();

  // Click the 'Generate' button in the dialog
  await page.getByRole('button', { name: 'Generate' }).click();

  // Assert that a summary paragraph appears in the dialog
  await expect(page.locator('div[role="dialog"] p')).toBeVisible();
});
