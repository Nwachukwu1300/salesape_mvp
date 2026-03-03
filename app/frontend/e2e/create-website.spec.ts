import { test, expect } from '@playwright/test';
import { login } from './utils';

test.describe('Create Website Flow', () => {
  test('conversation -> website preview', async ({ page }) => {
    const ok = await login(page);
    if (!ok) test.skip(true, 'E2E_EMAIL/E2E_PASSWORD not set');

    await page.goto('/create-website');
    await page.waitForURL(/conversation\/.*\/question/, { timeout: 60000 });

    const answers = [
      "Dan's Photo Studio",
      "Photography Studio",
      "Miami, Florida",
      "none",
      "Photo shoots, video shoots, content editing",
      "Affordable high-quality photography and video with fast turnaround and great customer support.",
      "email, phone, booking",
      "yes",
    ];

    for (const answer of answers) {
      const input = page.getByPlaceholder(/Type or speak your answer/i);
      await expect(input).toBeVisible({ timeout: 15000 });
      const responsePromise = page.waitForResponse(
        (resp) =>
          resp.url().includes('/conversation/message') &&
          resp.request().method() === 'POST',
        { timeout: 20000 },
      );
      await input.fill(answer);
      await page.keyboard.press('Enter');

      await responsePromise.catch(() => null);
      await page.waitForTimeout(1200);

      if (
        await page
          .getByText(/Too many requests|Too many conversation requests/i)
          .isVisible()
          .catch(() => false)
      ) {
        await page.waitForTimeout(2500);
      }

      if (await page.url().includes('/website-preview/')) break;
      if (await page.getByText('Generating your website...').isVisible().catch(() => false)) {
        break;
      }
    }

    await page.waitForURL(/website-preview\//, { timeout: 120000 });
    await expect(page).toHaveURL(/website-preview\//);
  });
});
