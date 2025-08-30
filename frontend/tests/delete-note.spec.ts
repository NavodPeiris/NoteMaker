import { test, expect } from 'playwright-test-coverage';

test('user can delete a note after login', async ({ page }) => {
  await page.goto('http://localhost:5173/');

  // Login first
  await page.getByRole('button', { name: 'Login' }).click();
  await page.getByRole('textbox', { name: 'Email' }).fill('navod@gmail.com');
  await page.getByRole('textbox', { name: 'Password', exact: true }).fill('navod123');
  await page.getByRole('button', { name: 'Login' }).click();
  await expect(page).toHaveURL(/\/notes/);

  // Select the first listed note (by title)
  const firstNote = page.locator('[class*=cursor-pointer]').first();
  const noteTitle = (await firstNote.textContent()) || '';
  await firstNote.click();

  // Click the Delete button (single click deletes the note)
  await page.getByRole('button', { name: /delete/i }).click();

  // Assert the note title is no longer visible on the main page
  if (noteTitle.trim()) {
    await expect(page.getByText(noteTitle.trim(), { exact: true }).first()).not.toBeVisible();
  }
});
