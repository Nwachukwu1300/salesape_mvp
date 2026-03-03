import { Page, expect } from '@playwright/test';

export async function login(page: Page) {
  const email = process.env.E2E_EMAIL || '';
  const password = process.env.E2E_PASSWORD || '';
  if (!email || !password) {
    return false;
  }

  await page.goto('/login');
  await page.fill('input[name="email"]', email);
  await page.fill('input[name="password"]', password);
  await page.click('button:has-text("Sign In")');
  await page.waitForURL((url) => !url.pathname.includes('/login'), { timeout: 30000 });
  await expect(page).not.toHaveURL(/\/login/);

  return true;
}
