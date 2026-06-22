// e2e/wallet-connection.spec.ts
import { test, expect } from "@playwright/test";

test.describe("Wallet Connection Flow", () => {
  test("should load the homepage and display connect button", async ({ page }) => {
    await page.goto("http://localhost:3000");
    const connectBtn = page.getByRole("button", { name: /connect wallet/i });
    await expect(connectBtn).toBeVisible();
  });

  // This test assumes Freighter wallet is mocked or stubbed.
  test("should open Freighter and display address after connection", async ({ page }) => {
    await page.addInitScript(() => {
      window.sessionStorage.setItem('cs_wallet', 'GBTCXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX');
    });
    await page.goto("http://localhost:3000");
    const address = page.locator('#wallet-dropdown-btn');
    await expect(address).toContainText("GBTC");
  });
});
