import { test, expect } from 'playwright-test-coverage';

test('home page renders with correct title and elements', async ({ page }) => {
  await page.goto('http://localhost:5173/');

  // Assert page title
  await expect(page).toHaveTitle(/Note Maker/);

  // Assert main heading (use exact match for the paragraph)
  await expect(page.getByText('Note Maker', { exact: true })).toBeVisible();

  // Assert Sign Up and Login buttons
  await expect(page.getByRole('button', { name: 'Sign Up' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Login' })).toBeVisible();

  // Assert description text
  await expect(page.getByText('Not Your Average Notes App')).toBeVisible();
  await expect(page.getByText('Notes Done Right')).toBeVisible();
  await expect(page.getByText('Write any note with style and organize according to your needs using note groups and tags')).toBeVisible();
});
