import { test } from "./fixtures";
import { BlockedPage } from "./pages/blocked";
import { BlocklistPage } from "./pages/blocklist";
import { PopupPage } from "./pages/popup";

test.describe("popup", () => {
  test.beforeEach(async ({ page, extensionId }) => {
    await new PopupPage(page, extensionId).login();
  });

  test.describe("focus", () => {
    test.beforeEach(async ({ page, extensionId }) => {
      const blocklistPage = new BlocklistPage(page, extensionId);
      await blocklistPage.goto();
      await blocklistPage.addSite("youtube.com");
      await blocklistPage.addSite("instagram.com");

      await test.expect(page.getByText("youtube.com")).toBeVisible();
      await test.expect(page.getByText("instagram.com")).toBeVisible();
    });

    test("focus", async ({ page, extensionId, context }) => {
      const popupPage = new PopupPage(page, extensionId);
      const blockedPage = new BlockedPage();

      popupPage.goto();
      await popupPage.changeType("Work");
      await popupPage.startFocus();

      const newPage = await context.newPage();
      await newPage.goto("https://youtube.com");
      await blockedPage.assertBlocked(newPage);

      await newPage.goto("https://instagram.com");
      await blockedPage.assertBlocked(newPage);

      await newPage.goto("https://www.google.com");
      await blockedPage.assertNotBlocked(newPage);

      await popupPage.endSession();

      await newPage.goto("https://youtube.com");
      await blockedPage.assertNotBlocked(newPage);
    });
  });
});
