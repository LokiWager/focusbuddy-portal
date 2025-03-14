import { Page } from "@playwright/test";

export class BlocklistPage {
  constructor(
    private page: Page,
    private extensionId: string,
  ) {}

  async goto() {
    await this.page.goto(
      `chrome-extension://${this.extensionId}/dashboard.html#/blocklist`,
    );
  }

  async addSite(url: string) {
    await this.page.getByRole("button", { name: "New Website" }).click();
    await this.page.getByTestId("url-input").fill(url);
    await this.page.getByTestId("url-input").press("Enter");
  }

  get blockListTable() {
    return this.page.getByTestId("blocklist-table");
  }
}
