import { test, expect } from 'playwright-test-coverage';

test('user can add a new note after login', async ({ page }) => {
  await page.goto('http://localhost:5173/');

  // Login first
  await page.getByRole('button', { name: 'Login' }).click();
  await page.getByRole('textbox', { name: 'Email' }).fill('navod@gmail.com');
  await page.getByRole('textbox', { name: 'Password', exact: true }).fill('navod123');
  await page.getByRole('button', { name: 'Login' }).click();
  await expect(page).toHaveURL(/\/notes/);

  // Click Add Note button
  await page.getByRole('button', { name: 'Add Note' }).click();

  // Fill note title and content in the dialog
  const noteTitle = `Test Note ${Date.now()}`;
  await page.getByRole('textbox', { name: 'Title' }).fill(noteTitle);
  await page.getByRole('textbox', { name: 'Write your note...' }).fill('This is a test note.');

  // Select a group from the group combobox (if present)
  const groupCombobox = page.locator('div[role="dialog"] [role="combobox"]');
  if (await groupCombobox.isVisible()) {
    await groupCombobox.click();
    // Select the first available group option
    const firstOption = page.locator('div[role="option"]').first();
    if (await firstOption.isVisible()) {
      await firstOption.click();
    }
  }

  // Confirm add (click 'Add Note' in the dialog)
  await page.getByRole('button', { name: 'Add Note' }).click();

  // Wait for the dialog to close (heading 'Create a Note' to disappear)
  await expect(page.getByRole('heading', { name: 'Create a Note' })).not.toBeVisible();

  // Assert note title appears on the main page
  await expect(page.getByText(noteTitle)).toBeVisible();
});
