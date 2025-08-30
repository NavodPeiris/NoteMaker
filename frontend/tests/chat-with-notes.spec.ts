import { test, expect } from 'playwright-test-coverage';

test('user can chat with notes after login', async ({ page }) => {
  await page.goto('http://localhost:5173/');

  // Login first
  await page.getByRole('button', { name: 'Login' }).click();
  await page.getByRole('textbox', { name: 'Email' }).fill('navod@gmail.com');
  await page.getByRole('textbox', { name: 'Password', exact: true }).fill('navod123');
  await page.getByRole('button', { name: 'Login' }).click();
  await expect(page).toHaveURL(/\/notes/);

  // Switch to Chat With Notes view
  await page.getByRole('radio', { name: /toggle chat/i }).click();

  // Find the chat input by its label
  const chatInput = page.getByRole('textbox', { name: /write your prompt here/i });
  const prompt = 'Summarize my notes';
  await chatInput.fill(prompt);
  await chatInput.press('Enter');

  // Wait for a new paragraph response that is not the sent message
  await expect(
    page.locator('p.whitespace-pre-wrap').filter({ hasText: prompt }).first()
  ).toBeVisible();
  // Wait for a second paragraph (the response) to appear
  await expect(
    page.locator('p.whitespace-pre-wrap').nth(1)
  ).toBeVisible();
});
