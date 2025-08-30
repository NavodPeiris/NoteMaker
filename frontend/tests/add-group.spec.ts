import { test, expect } from 'playwright-test-coverage';

test('user can add a new group after login', async ({ page }) => {
  await page.goto('http://localhost:5173/');

  // Login first
  await page.getByRole('button', { name: 'Login' }).click();
  await page.getByRole('textbox', { name: 'Email' }).fill('navod@gmail.com');
  await page.getByRole('textbox', { name: 'Password', exact: true }).fill('navod123');
  await page.getByRole('button', { name: 'Login' }).click();
  await expect(page).toHaveURL(/\/notes/);

  // Click Add Group button
  await page.getByRole('button', { name: 'Add Group' }).click();


  // Fill group title in the dialog
  const groupName = `Test Group ${Date.now()}`;
  await page.getByRole('textbox', { name: 'Title' }).fill(groupName);

  // Click the Add Group button in the dialog
  await page.getByRole('button', { name: 'Add Group' }).click();

  // Assert group appears in the group selector combobox
  const groupSelector = page.getByText('select group');
  await groupSelector.click();
  await expect(page.getByText(groupName)).toBeVisible();
});
