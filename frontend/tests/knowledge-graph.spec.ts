import { test, expect } from 'playwright-test-coverage';

test('user can view knowledge graph after adding a note', async ({ page }) => {
  await page.goto('http://localhost:5173/');

  // Login first
  await page.getByRole('button', { name: 'Login' }).click();
  await page.getByRole('textbox', { name: 'Email' }).fill('navod@gmail.com');
  await page.getByRole('textbox', { name: 'Password', exact: true }).fill('navod123');
  await page.getByRole('button', { name: 'Login' }).click();
  await expect(page).toHaveURL(/\/notes/);

  // Add a new note
  await page.getByRole('button', { name: 'Add Note' }).click();
  const noteTitle = `KG Test Note ${Date.now()}`;
  await page.getByRole('textbox', { name: 'Title' }).fill(noteTitle);
  await page.getByRole('textbox', { name: 'Write your note...' }).fill('This is a knowledge graph test note.');
  // Select a group if required
  const groupCombobox = page.locator('div[role="dialog"] [role="combobox"]');
  if (await groupCombobox.isVisible()) {
    await groupCombobox.click();
    const firstOption = page.locator('div[role="option"]').first();
    if (await firstOption.isVisible()) {
      await firstOption.click();
    }
  }
  await page.getByRole('button', { name: 'Add Note' }).click();
  await expect(page.getByRole('heading', { name: 'Create a Note' })).not.toBeVisible();
  await expect(page.getByText(noteTitle)).toBeVisible();

  // Switch to Knowledge Graph view
  await page.getByRole('radio', { name: /toggle kg/i }).click();

  // Assert that the knowledge graph view is visible (look for a canvas, svg, or graph label)
  await expect(page.getByText(/knowledge graph|graph/i)).toBeVisible();
});
