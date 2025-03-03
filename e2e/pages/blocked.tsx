import { expect, Page } from "@playwright/test";

export class BlockedPage {
  async assertBlocked(page: Page) {
    await expect(page.getByTestId("blocked-page")).toBeVisible();
  }

  async assertNotBlocked(page: Page) {
    await expect(page.getByTestId("blocked-page")).not.toBeAttached();
  }
}
