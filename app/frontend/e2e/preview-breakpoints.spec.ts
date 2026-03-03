import { test, expect } from "@playwright/test";
import { login } from "./utils";

const BREAKPOINTS = [320, 375, 768, 1024, 1440] as const;
const THEMES = ["light", "dark"] as const;

test.describe("Generated Preview Breakpoints", () => {
  test("live generated site renders cleanly across breakpoints in light/dark", async ({
    page,
  }) => {
    const ok = await login(page);
    if (!ok) test.skip(true, "E2E_EMAIL/E2E_PASSWORD not set");

    await page.goto("/dashboard");
    await page.waitForLoadState("networkidle");

    const noWebsites = await page
      .getByText(/No websites yet/i)
      .isVisible()
      .catch(() => false);
    if (noWebsites) {
      test.skip(true, "No generated websites available for breakpoint pass");
    }

    const viewButtons = page.getByRole("button", { name: /^View$/i });
    const count = await viewButtons.count();
    if (count === 0) {
      test.skip(true, "No website cards with View button found");
    }

    await viewButtons.first().click();
    await page.waitForURL(/\/website-preview\//, { timeout: 60000 });
    await expect(page).toHaveURL(/\/website-preview\//);

    const businessId = page.url().split("/website-preview/")[1]?.split("?")[0];
    expect(businessId).toBeTruthy();

    for (const theme of THEMES) {
      await page.addInitScript((forcedTheme) => {
        window.localStorage.setItem("salesape-theme", forcedTheme as string);
      }, theme);

      for (const width of BREAKPOINTS) {
        const height = width <= 375 ? 740 : width <= 768 ? 900 : 980;
        await page.setViewportSize({ width, height });
        await page.goto(`/live/${businessId}`);
        await page.waitForLoadState("networkidle");

        // Basic visible content check.
        await expect(page.locator("h1").first()).toBeVisible({ timeout: 20000 });

        // Horizontal overflow check.
        const hasOverflow = await page.evaluate(() => {
          const doc = document.documentElement;
          return doc.scrollWidth > window.innerWidth + 1;
        });
        expect(hasOverflow, `Horizontal overflow at ${width}px (${theme})`).toBeFalsy();

        // Readability sanity check: heading/text should not blend with background.
        const textReadable = await page.evaluate(() => {
          const target = document.querySelector("h1, h2, p") as HTMLElement | null;
          if (!target) return false;
          const textColor = window.getComputedStyle(target).color;

          let node: HTMLElement | null = target;
          let bg = "rgba(255, 255, 255, 1)";
          while (node) {
            const c = window.getComputedStyle(node).backgroundColor;
            if (c && c !== "rgba(0, 0, 0, 0)" && c !== "transparent") {
              bg = c;
              break;
            }
            node = node.parentElement;
          }

          return textColor !== bg;
        });
        expect(textReadable, `Text contrast sanity failed at ${width}px (${theme})`).toBeTruthy();

        await page.screenshot({
          path: `test-results/preview-breakpoints-${theme}-${width}.png`,
          fullPage: true,
        });
      }
    }
  });
});
