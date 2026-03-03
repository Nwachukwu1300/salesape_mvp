import { test, expect } from '@playwright/test';
import { login } from './utils';

test.describe('Content Studio', () => {
  test('repurpose and generate content', async ({ page }) => {
    const ok = await login(page);
    if (!ok) test.skip(true, 'E2E_EMAIL/E2E_PASSWORD not set');

    await page.goto('/content-studio');

    if (await page.getByText('Create Your Content Studio Workspace').isVisible().catch(() => false)) {
      await page.fill('input[placeholder="https://yourbusiness.com"]', 'https://example.com');
      await page.getByRole('button', { name: /Create Workspace/i }).click();
    }

    await expect(
      page.getByRole('heading', { name: /^Content Studio$/, level: 1 }),
    ).toBeVisible({ timeout: 30000 });
    await page.getByRole('button', { name: /New Content Input/i }).click();
    await page.fill('textarea[placeholder="Paste your raw content here..."]', 'Test content for repurposing.');
    await page.getByRole('button', { name: /Save Content/i }).click();

    const generateVariants = page.getByRole('button', { name: /Repurpose Content|Generate Social Variants/i });
    await expect(generateVariants).toBeVisible({ timeout: 30000 });
    await generateVariants.click();

    await expect(page.getByText('Repurposed Outputs')).toBeVisible({ timeout: 60000 });

    await page.goto('/content-studio');
    await expect(
      page.getByRole('heading', { name: /^Content Studio$/, level: 1 }),
    ).toBeVisible({ timeout: 30000 });
    await expect(page.getByRole('button', { name: /^Generate Content$/i })).toBeVisible({
      timeout: 15000,
    });
  });
});
