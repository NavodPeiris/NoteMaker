import { test, expect } from 'playwright-test-coverage';

test('user can update a note after login', async ({ page }) => {
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

  // Click the Update Note button
  await page.getByRole('button', { name: /update note/i }).click();

  // Update the note title and content in the dialog
  const updatedTitle = `Updated Note ${Date.now()}`;
  const updatedContent = 'This note has been updated.';
  await page.getByRole('textbox', { name: 'Title' }).fill(updatedTitle);
  await page.getByRole('textbox', { name: 'Write your note...' }).fill(updatedContent);


  // Click the 'Update' button in the dialog
  await page.getByRole('button', { name: 'Update' }).click();

  // Wait for the dialog to close (heading 'Update Note' to disappear)
  await expect(page.getByRole('heading', { name: /update note/i })).not.toBeVisible();

  // Assert at least one updated note title appears on the main page
  await expect(page.getByText(updatedTitle, { exact: true }).first()).toBeVisible();
});
