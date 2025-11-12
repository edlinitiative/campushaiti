import { test, expect } from "@playwright/test";

test.describe("Application Flow", () => {
  test("should complete basic application flow", async ({ page }) => {
    // Navigate to home page
    await page.goto("/");
    await expect(page.locator("h1")).toContainText("Campus Haiti");

    // Click apply button
    await page.click('a[href="/apply"]');

    // Should redirect to signin if not authenticated
    await page.waitForURL(/\/auth\/signin/);
    await expect(page.locator("h1")).toContainText("Welcome");

    // In a real test, we would:
    // 1. Sign in with test credentials
    // 2. Complete profile form
    // 3. Upload documents
    // 4. Select programs
    // 5. Complete payment
    // 6. Submit application
    // 7. Verify confirmation

    // For now, just verify the signin page loads
    expect(await page.locator('input[type="email"]').count()).toBeGreaterThan(0);
  });

  test("should switch locales", async ({ page }) => {
    await page.goto("/");

    // Find and click locale switcher
    const localeSwitcher = page.locator('[role="combobox"]').first();
    await localeSwitcher.click();

    // Select French
    await page.click('text="Français"');

    // Verify URL changed
    await page.waitForURL(/\/fr/);
  });
});
