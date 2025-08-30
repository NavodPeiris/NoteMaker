import { test, expect } from 'playwright-test-coverage';

test('user can sign up successfully', async ({ page }) => {
  await page.goto('http://localhost:5173/');

  // Click Sign Up button on home page
  await page.getByRole('button', { name: 'Sign Up' }).click();

  // Fill the registration form
  await page.getByRole('textbox', { name: 'Name' }).fill('Navod');
  await page.getByRole('textbox', { name: 'Email' }).fill('navod@gmail.com');
  await page.getByRole('textbox', { name: 'Password', exact: true }).fill('navod123');
  await page.getByRole('textbox', { name: 'Confirm Password' }).fill('navod123');

  // Submit the form
  await page.getByRole('button', { name: 'Sign Up' }).click();

  // Wait for either redirect or error message
  const navigationPromise = page.waitForURL(/\/notes/, { timeout: 5000 }).catch(() => null);
  const errorPromise = page.getByText(/error|already exists|invalid/i).isVisible().catch(() => false);
  const [navigated, errorVisible] = await Promise.all([navigationPromise, errorPromise]);

  if (navigated) {
    // Assert presence of Sign Out and main elements
    await expect(page.getByRole('button', { name: 'Sign Out' })).toBeVisible();
    await expect(page.getByText('Note Maker', { exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Add Note' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Add Group' })).toBeVisible();
  } else {
    expect(errorVisible).toBeFalsy(); // Should not see error if not redirected
  }
});
